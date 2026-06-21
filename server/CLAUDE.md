# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run all commands from `server/`.

```bash
./mvnw spring-boot:run          # run the app locally (needs DB_URL, DB_USERNAME, DB_PASSWORD, DB_JWT_KEY env vars — see application.properties)
./mvnw test                     # run all tests
./mvnw test -Dtest=ClassName                       # run a single test class
./mvnw test -Dtest=ClassName#methodName             # run a single test method
./mvnw clean package             # build the jar
```

The app listens on `${PORT:4002}`. Swagger UI is at `/docs`, the raw OpenAPI doc (consumed by the client's codegen) is at `/api-docs`.

## Architecture

Spring Boot 4, Java 25, PostgreSQL via Spring Data JPA, Flyway for migrations, Spring Security with JWT bearer auth, springdoc-openapi for API docs, STOMP over WebSocket for real-time features.

### Package layout (`fabriziob.com.subastapp`)

- `controller/<feature>/` — one package per feature (`auth`, `cliente`, `subasta`, `producto`, `seguro`, `empleado`, `pais`, `duenio`, `notificacion`, `estatisticas`, `subastador`). Each contains the `@RestController` plus its `*Request`/`*Response`/`*Detail` DTOs. Controllers are thin — they delegate to a `service`.
- `service/` — business logic, one service per feature, injected into controllers via `@RequiredArgsConstructor` (Lombok).
- `entity/` — JPA entities; `entity/enums/` for enum types used by entities and DTOs (e.g. `EstadoSubasta`, `CategoriaSubasta`, `Moneda`, `TipoMedioPago`).
- `repository/` — Spring Data JPA repositories, one per entity.
- `config/` — security (`SecurityConfig`, `AuthenticationConfig`, `JwtAuthenticationFilter`, `JwtService`), WebSocket (`WebSocketConfig`), OpenAPI (`OpenApiConfig`), and `FixAdminsConfig`.
- `security/` — `@PreAuthorize` ownership-check beans (e.g. `NotificacionSecurity`), one per resource that needs per-record authorization beyond a simple role/path check. See "Auth & Authorization" below.
- `exception/` — custom exceptions (e.g. `UserDuplicateException`).

### Controllers and springdoc-openapi

Every endpoint is documented with `@Operation` (summary/description) and `@ApiResponses` listing every status code the endpoint can realistically return (typically 200/201/204 plus 400/401/403/404 as applicable), each with a Spanish `description`. `@Parameter` annotates path/query params with a description and an `example` for path variables. Request bodies use `@io.swagger.v3.oas.annotations.parameters.RequestBody` (fully qualified to avoid clashing with Spring's own `@RequestBody`).

This documentation is not cosmetic: the client app generates its entire typed API surface (`client/types/api.d.ts`) from `/api-docs`, so incomplete or wrong annotations directly break or mistype the client. When adding or changing an endpoint, keep the annotations and the actual response shape in sync.

Some controller methods are still stubs (`return null;`) pending implementation — check whether the method you're touching is a stub or already wired to a service before assuming behavior.

### Database / Flyway

Migrations live in `src/main/resources/db/migration` as `V<n>__description.sql` and are **written by hand**, not generated — there is no `ddl-auto` schema generation (`spring.jpa.hibernate.ddl-auto=validate`). When changing an entity's schema, add a new `V<next>__...sql` migration file rather than editing an existing one. Migration numbers are sequential and never reused.

### Auth & Authorization

JWT bearer tokens (`io.jsonwebtoken`/jjwt). `JwtAuthenticationFilter` validates the `Authorization: Bearer <token>` header on REST requests; `WebSocketConfig`'s `ChannelInterceptor` does the equivalent validation on the STOMP `CONNECT` frame (reading the `Authorization` native header) since WebSocket auth can't go through the normal servlet filter chain.

**Roles.** `Persona` (the `UserDetails` implementation) derives `GrantedAuthority`s from its linked `Cliente.categoria` in `getAuthorities()`: `ROLE_<CATEGORIA>` uppercased (`ROLE_ADMIN`, `ROLE_COMUN`, `ROLE_ORO`, ...), plus `ROLE_ADMITIDO_*` and `ROLE_ESTADO_*`. There's no separate roles table — promoting a user to admin is just setting `categoria = admin` on their `Cliente` row. `JwtAuthenticationFilter` attaches these authorities to the `Authentication` object on every authenticated request, so `hasRole("ADMIN")` and `@PreAuthorize` role checks work without any extra wiring.

Two authorization mechanisms are used, depending on the shape of the check:

1. **Path/role-based — `SecurityConfig`'s `authorizeHttpRequests`.** Use this when access only depends on the route shape and/or role, not on which specific resource is being touched (e.g. "anyone can `GET /api/v1/paises`, only admins can `POST`/`DELETE` it"). Add `HttpMethod`-scoped `requestMatchers(...)` before the trailing `anyRequest().authenticated()` — always scope to a specific `HttpMethod` when permitting/restricting a path that also has other verbs mapped on it, otherwise you accidentally open/lock every verb on that path.

2. **Ownership-based — `@PreAuthorize` + a security bean in `security/`.** Use this when a non-admin caller may only touch *their own* resource, and ownership can't be determined from the request alone (e.g. "a user can read notification #42 only if they're its `destinatario`"). Pattern (see `security/NotificacionSecurity.java`):
   - A `@Component("xSecurity")` bean with a method like `isOwner(resourceId, personaId)` that does the DB lookup (e.g. `existsByIdentificadorAndDestinatario_Identificador`).
   - `@PreAuthorize("hasRole('ADMIN') or @xSecurity.isOwner(#id, principal.identificador)")` on the controller method — `principal` resolves to the authenticated `Persona`, so `principal.identificador` is the caller's own ID. Admins always bypass the ownership check.
   - If the resource's owner ID is already present in the request itself (e.g. a `destinatarioId` query param), skip the DB lookup and compare directly in the SpEL expression instead: `hasRole('ADMIN') or #destinatarioId == principal.identificador`.

   `@EnableMethodSecurity` is already enabled on `SecurityConfig`, so `@PreAuthorize` works on any `@RestController` method without further setup.

### WebSocket / STOMP

`WebSocketConfig` registers two STOMP endpoints: `/api/v1/ws` (SockJS, for browsers) and `/api/v1/ws/native` (raw, for React Native). Destinations use `/topic` and `/queue` prefixes with `/app` as the application prefix and `/user` as the user-destination prefix. Server-initiated pushes (e.g. new pujo broadcasts, per-user notifications) go through `WsNotificacionService`/`SimpMessagingTemplate`. When adding a new real-time event, check `WsNotificacionService` and `PujoService` for the existing pattern of emitting to `/topic/...` or `/user/queue/...`.
