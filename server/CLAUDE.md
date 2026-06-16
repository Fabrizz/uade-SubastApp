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
- `exception/` — custom exceptions (e.g. `UserDuplicateException`).

### Controllers and springdoc-openapi

Every endpoint is documented with `@Operation` (summary/description) and `@ApiResponses` listing every status code the endpoint can realistically return (typically 200/201/204 plus 400/401/403/404 as applicable), each with a Spanish `description`. `@Parameter` annotates path/query params with a description and an `example` for path variables. Request bodies use `@io.swagger.v3.oas.annotations.parameters.RequestBody` (fully qualified to avoid clashing with Spring's own `@RequestBody`).

This documentation is not cosmetic: the client app generates its entire typed API surface (`client/types/api.d.ts`) from `/api-docs`, so incomplete or wrong annotations directly break or mistype the client. When adding or changing an endpoint, keep the annotations and the actual response shape in sync.

Some controller methods are still stubs (`return null;`) pending implementation — check whether the method you're touching is a stub or already wired to a service before assuming behavior.

### Database / Flyway

Migrations live in `src/main/resources/db/migration` as `V<n>__description.sql` and are **written by hand**, not generated — there is no `ddl-auto` schema generation (`spring.jpa.hibernate.ddl-auto=validate`). When changing an entity's schema, add a new `V<next>__...sql` migration file rather than editing an existing one. Migration numbers are sequential and never reused.

### Auth

JWT bearer tokens (`io.jsonwebtoken`/jjwt). `JwtAuthenticationFilter` validates the `Authorization: Bearer <token>` header on REST requests; `WebSocketConfig`'s `ChannelInterceptor` does the equivalent validation on the STOMP `CONNECT` frame (reading the `Authorization` native header) since WebSocket auth can't go through the normal servlet filter chain.

### WebSocket / STOMP

`WebSocketConfig` registers two STOMP endpoints: `/api/v1/ws` (SockJS, for browsers) and `/api/v1/ws/native` (raw, for React Native). Destinations use `/topic` and `/queue` prefixes with `/app` as the application prefix and `/user` as the user-destination prefix. Server-initiated pushes (e.g. new pujo broadcasts, per-user notifications) go through `WsNotificacionService`/`SimpMessagingTemplate`. When adding a new real-time event, check `WsNotificacionService` and `PujoService` for the existing pattern of emitting to `/topic/...` or `/user/queue/...`.
