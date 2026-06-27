# SubastApp — Guía de arquitectura

> Documento de referencia para alguien que nunca vio el repo. Explica qué hace la app, cómo está organizado el monorepo, y cómo funciona cada parte técnica (backend, frontend, base de datos, autenticación, tiempo real, mails, despliegue).

---

## 1. Qué es SubastApp

SubastApp es el trabajo práctico de **Desarrollo de Aplicaciones I (UADE)**: una app para gestionar una casa de subastas. El enunciado completo está en [`TPO-DAI.md`](../TPO-DAI.md); el resumen funcional:

- La empresa hace **subastas dinámicas ascendentes**: arrancan en un precio base y los postores van subiendo la oferta hasta que nadie mejora; gana el último postor.
- Los usuarios (postores) se registran en **dos etapas**: primero cargan datos personales + documentación (foto de DNI, domicilio, país) y la empresa los investiga y les asigna una **categoría** (`común`, `especial`, `plata`, `oro`, `platino`). Después de aprobados, completan el registro generando su clave.
- Cada subasta tiene también una categoría; un usuario solo puede pujar en subastas de categoría ≤ la suya, y solo si tiene al menos un **medio de pago verificado** (cuenta bancaria, tarjeta o cheque certificado).
- Reglas de puja: la oferta mínima es la mejor oferta + 1% del valor base; la máxima es la mejor oferta + 20% del valor base. **Estos límites no aplican a categorías oro/platino.**
- Las pujas se transmiten **en tiempo real** a todos los conectados a esa subasta (WebSocket/STOMP), y el sistema no permite una nueva puja del mismo usuario hasta confirmar que la anterior se procesó.
- Los usuarios también pueden pedir que la empresa incluya un artículo propio en una futura subasta (carga de fotos + descripción), pasa por una inspección/aceptación, y si nadie puja por el ítem al cierre, la empresa lo compra al valor base.
- Cada bien recibido tiene un seguro asociado, visible para su dueño junto a la ubicación de depósito.
- Hay métricas por usuario (subastas en las que participó, veces que ganó, historial de pujas) y métricas globales.

Es un **monorepo con dos proyectos independientes**, cada uno con su propio `CLAUDE.md` de referencia técnica:

```
uade-SubastApp/
├── server/   → Spring Boot 4 + PostgreSQL (API REST + WebSocket)
└── client/   → Expo / React Native (app móvil)
```

No hay build tool que una a los dos: se levantan y compilan por separado (Maven para el server, Expo CLI/npm para el client).

---

## 2. Cómo se conectan server y client

El client **nunca escribe a mano** los tipos de la API. El flujo es:

1. El server documenta cada endpoint con anotaciones de **springdoc-openapi** (`@Operation`, `@ApiResponses`, `@Parameter`, etc.). Estas anotaciones son la fuente de verdad — no son cosméticas.
2. Se corre el server local (puerto `4002` por default).
3. Desde `client/`, se ejecuta `npm run api:generate`, que llama a `openapi-typescript http://localhost:4002/api-docs -o types/api.d.ts` y regenera el archivo de tipos.
4. `client/lib/api.ts` construye un cliente tipado con **openapi-fetch** a partir de ese archivo. Es el **único archivo que crea el cliente HTTP**; el resto de la app importa `api` desde `@/lib/api` y nunca usa `fetch` directo.

Consecuencia práctica: si cambia la firma de un endpoint en el backend, hay que regenerar `types/api.d.ts` antes de que el código del cliente que lo usa vuelva a tipar correctamente.

---

## 3. Backend (`server/`)

**Stack:** Spring Boot 4, Java 25, PostgreSQL (Spring Data JPA), Flyway, Spring Security con JWT, springdoc-openapi, STOMP sobre WebSocket.

Puerto por defecto `4002` (`${PORT:4002}`). Swagger UI en `/docs`, el documento OpenAPI crudo (el que consume el codegen del client) en `/api-docs`.

### 3.1 Paquetes (`fabriziob.com.subastapp`)

| Paquete | Contenido |
|---|---|
| `controller/<feature>/` | Un paquete por feature: `auth`, `cliente`, `subasta`, `producto`, `seguro`, `empleado`, `pais`, `duenio`, `notificacion`, `estatisticas`, `subastador`, `persona`. Cada uno tiene el `@RestController` y sus DTOs (`*Request`/`*Response`/`*Detail`). Los controllers son finos: delegan en un `service`. |
| `service/` | Lógica de negocio, un servicio por feature, inyectado por constructor (Lombok `@RequiredArgsConstructor`). |
| `entity/` | Entidades JPA. `entity/enums/` agrupa los enums usados por entidades y DTOs (`EstadoSubasta`, `CategoriaSubasta`, `Moneda`, `TipoMedioPago`, `EstadoBien`, `EstadoPersona`, `EstadoAceptacionItem`, etc.). |
| `repository/` | Repositorios Spring Data JPA, uno por entidad. |
| `config/` | Seguridad (`SecurityConfig`, `AuthenticationConfig`, `JwtAuthenticationFilter`, `JwtService`), WebSocket (`WebSocketConfig`), OpenAPI (`OpenApiConfig`), y `FixAdminsConfig`. |
| `security/` | Beans de autorización por dueño de recurso (ej. `NotificacionSecurity`), usados desde `@PreAuthorize`. |
| `exception/` | Excepciones propias (ej. `UserDuplicateException`). |

Entidades centrales del dominio: `Subasta`, `Catalogo`, `ItemCatalogo`, `Pujo` (cada puja), `Asistente`/`AsistenciaActual` (quién está conectado a qué subasta), `Cliente`/`Persona`/`Duenio`/`Empleado`/`Subastador`, `MedioPagoCheque`/`MedioPagoTarjeta`, `Seguro`, `Pais`, `RegistroDeSubasta` (la venta cerrada de un ítem).

### 3.2 Documentación de API (springdoc-openapi)

Cada endpoint documenta `@Operation` (resumen/descripción) y `@ApiResponses` con todos los códigos HTTP que puede devolver (normalmente 200/201/204 + 400/401/403/404 según aplique), cada uno con descripción en español. Los parámetros de path/query llevan `@Parameter` con descripción y ejemplo. Los bodies usan la anotación calificada `@io.swagger.v3.oas.annotations.parameters.RequestBody` para no chocar con la de Spring.

Como el client genera **todo** su tipado desde `/api-docs`, una anotación incompleta o incorrecta rompe o destipa directamente al cliente.

> Nota: algunos métodos de controller todavía son stubs (`return null;`) pendientes de implementación.

### 3.3 Base de datos / Flyway

Las migraciones viven en `src/main/resources/db/migration/V<n>__descripcion.sql`, **escritas a mano** (no hay `ddl-auto` — está en `validate`). Al día de hoy van de `V1` a `V26`. Algunas migraciones notables:

- `V18__seed-paises.sql`, `V19__seed-base.sql`, `V23__seed-admin.sql` — datos semilla (países, datos base, admin inicial).
- `V20__medios-pago-rules.sql` — reglas de medios de pago.
- `V21__admin-categoria.sql` — categoría admin.
- `V24__inhabilitado-boolean.sql`, `V25__notificaciones-tipo-text.sql`, `V26__auction-timing.sql` — ajustes incrementales de esquema.

Para cambiar el esquema de una entidad: agregar una migración `V<siguiente>__...sql` nueva, nunca editar una existente. Los números son secuenciales y no se reusan.

### 3.4 Autenticación y autorización

JWT bearer (`io.jsonwebtoken`/jjwt). `JwtAuthenticationFilter` valida el header `Authorization: Bearer <token>` en requests REST; para WebSocket, `WebSocketConfig` usa un `ChannelInterceptor` que valida el mismo header pero leído como header nativo del frame STOMP `CONNECT` (porque el handshake de WebSocket no pasa por la cadena de filtros de servlet normal).

**Roles.** `Persona` (la implementación de `UserDetails`) deriva los `GrantedAuthority` de `Cliente.categoria` en `getAuthorities()`: `ROLE_<CATEGORIA>` en mayúsculas (`ROLE_ADMIN`, `ROLE_COMUN`, `ROLE_ORO`, ...), más `ROLE_ADMITIDO_*` y `ROLE_ESTADO_*`. No hay tabla de roles separada — promover a alguien a admin es simplemente poner `categoria = admin` en su fila `Cliente`.

Dos mecanismos de autorización, según el caso:

1. **Por path/rol** (`SecurityConfig.authorizeHttpRequests`) — cuando el acceso depende solo de la forma de la ruta y/o el rol (ej. "cualquiera puede `GET /api/v1/paises`, solo admin puede `POST`/`DELETE`"). Siempre se especifica el `HttpMethod` en el matcher para no abrir/cerrar de más otros verbos del mismo path.
2. **Por dueño del recurso** (`@PreAuthorize` + bean en `security/`) — cuando un usuario no-admin solo puede tocar **su propio** recurso y la pertenencia no se puede inferir directo del request. Patrón (ver `NotificacionSecurity`):
   - Bean `@Component("xSecurity")` con un método `isOwner(resourceId, personaId)` que hace el lookup en DB.
   - `@PreAuthorize("hasRole('ADMIN') or @xSecurity.isOwner(#id, principal.identificador)")` en el controller — `principal` resuelve a la `Persona` autenticada. Admin siempre pasa.
   - Si el ID del dueño ya viene en el propio request (ej. un query param `destinatarioId`), se compara directo en el SpEL sin ir a la DB.

   `@EnableMethodSecurity` ya está habilitado, así que `@PreAuthorize` funciona en cualquier método `@RestController` sin más configuración.

### 3.5 WebSocket / STOMP (tiempo real)

`WebSocketConfig` registra dos endpoints STOMP: `/api/v1/ws` (SockJS, para browsers) y `/api/v1/ws/native` (raw, para React Native). Prefijos: `/topic` y `/queue` para destinos, `/app` para la aplicación, `/user` para destinos por-usuario.

Los pushes generados por el servidor (broadcast de nuevas pujas, notificaciones por usuario) salen por `WsNotificacionService`/`SimpMessagingTemplate`. Patrón típico: `/topic/subastas/{id}/pujas` para el broadcast de pujas de una subasta, `/user/queue/notificaciones` para notificaciones privadas.

Esto es clave para la regla de negocio "los usuarios conectados deben recibir en tiempo real las modificaciones de las ofertas" y para que la app no permita una nueva puja hasta confirmar la anterior.

### 3.6 Mails y notificaciones externas (Resend + Discord)

`EmailService` envía mails transaccionales vía **Resend** (`POST https://api.resend.com/emails`, autenticado con `RESEND_API_KEY`, remitente configurable por `RESEND_FROM`):

- `enviarBienvenida` — al aprobar la etapa 1 del registro, manda la clave temporal.
- `enviarRecuperacion` — recuperación de contraseña con clave temporal de un solo uso.
- `enviarRechazo` — aviso de registro no aceptado.

Si `RESEND_API_KEY` no está configurada, el mail simplemente se loguea (no rompe el flujo) — útil en desarrollo. Además, si hay `DISCORD_WEBHOOK_URL` configurado, cada mail también se espeja como mensaje a un canal de Discord (probablemente para debug/visibilidad del equipo sin necesidad de revisar logs).

### 3.7 Configuración / variables de entorno

De `application.properties`:

| Variable | Uso | Default |
|---|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Conexión PostgreSQL | `jdbc:postgresql://localhost:5432/subastas` / `postgres` / `huergo34` |
| `DB_JWT_KEY` | Clave de firma JWT | clave local insegura de desarrollo |
| `PORT` | Puerto del servidor | `4002` |
| `EMPLEADO_SISTEMA_ID` | ID del empleado "sistema" usado para acciones automáticas | `1` |
| `ADMIN_EMAILS` | Emails que se promueven a admin automáticamente (ver `FixAdminsConfig`) | vacío |
| `RESEND_API_KEY`, `RESEND_FROM` | Envío de mails | vacío / `onboarding@resend.dev` |
| `DISCORD_WEBHOOK_URL` | Espejo de mails a Discord | vacío |

`application.security.jwt.expiration` está fijo en `86400000` ms (24 h).

### 3.8 Despliegue (Docker)

`server/dockerfile` es un build multi-stage:

1. **Build:** `maven:3-eclipse-temurin-25-alpine`, cachea dependencias (`mvn dependency:go-offline`), compila el jar sin tests (`mvn clean package -DskipTests`).
2. **Runtime:** `eclipse-temurin:25-jdk-alpine`, copia solo el jar final, expone el puerto `8080` y arranca con `java -jar app.jar`.

El cliente apunta por defecto a `https://cly-subastapp.fabriziob.com` (`client/lib/api.ts`, constante `API_BASE`) cuando no hay `EXPO_PUBLIC_API_URL` — esa es la instancia desplegada del backend.

---

## 4. Frontend (`client/`)

**Stack:** Expo Router (file-based routing) + React Native + NativeWind (Tailwind para RN) + TypeScript estricto. Alias de path `@/*` → raíz del proyecto.

### 4.1 Routing (`app/`)

- **`app/_layout.tsx`** — layout raíz. Envuelve toda la app en `AuthProvider` → `WebSocketProvider` → `ThemeProvider` de navegación, y define el `Stack` con cuatro rutas top-level: `auth`, `admin`, `(tabs)`, y el modal `dev-menu`. Cualquier concern global (auth, conexión websocket, theming) va acá, no duplicado en layouts hijos.
- **`app/(tabs)/`** — la app autenticada principal:
  - `index.tsx` — home.
  - `auctions/` — listado, detalle de subasta (`[id].tsx`), flujo de compra (`compra/[registroId].tsx`), historial de ítem (`history/[itemId].tsx`), detalle de ítem (`item/[itemId].tsx`), alta de nueva subasta/solicitud (`new/`).
  - `notifications/` — notificaciones (alimentadas en vivo por WebSocket).
  - `profile/` — perfil, medios de pago (`payment/`, con altas de cuenta bancaria, tarjeta y cheque), estadísticas (`stats.tsx`).
- **`app/auth/`** — login, register, recover (recuperación de clave), start (activación de cuenta tras la etapa 1 de aprobación).
- **`app/admin/`** — backoffice: admitir postores (`admitir.tsx`), gestión de usuarios (`users.tsx`), subastas (`auctions.tsx`), subastadores (`new-subastador.tsx`, `drop-subastador.tsx`), pagos (`payment.tsx`). Gateado en `app/admin/_layout.tsx`: exige `isAuthenticated` y `user.category === "admin"`, si no muestra pantalla de login-requerido o acceso-denegado en vez de renderizar hijos.
- **`app/dev-menu.tsx`** — modal con listado de todas las rutas de la app + estado de auth/sesión actual, para navegación rápida en desarrollo. Se abre con un botón flotante (`components/dev-button.tsx`).

### 4.2 Componentización

Las screens bajo `app/` se mantienen finas y componen UI desde `components/`. Primitivas compartidas en `components/ui/` (`Button`, `GenericModal`, `PasswordInput`, `AvatarInitials`, `CategoryPill`, `CuentaRegresiva`, etc.) — se prefiere extender/reusar esto antes que escribir componentes nuevos inline en una screen.

### 4.3 `lib/` — lógica de cliente

- **`lib/api.ts`** — el archivo más importante del client. Construye el cliente tipado `openapi-fetch` (`export const api`) a partir de `types/api.d.ts` (generado, nunca a mano). Todas las llamadas de red pasan por `api.GET/POST/PATCH/...`, nunca `fetch` crudo. También trae un middleware de logging (`onRequest`/`onResponse`/`onError`) que imprime cada request/response/error por consola, y exporta `API_BASE` (de `EXPO_PUBLIC_API_URL`, con fallback a `https://cly-subastapp.fabriziob.com`), reusado por `context/websocket.tsx` para armar la URL `ws(s)://.../api/v1/ws/native`.
- `lib/dni.ts` — parseo de DNI.
- `lib/utils.ts` — helpers genéricos.
- `lib/theme.ts` — valores de theming a nivel JS.
- `lib/subastas.store.ts` — store Zustand de sesión de subasta (ver 4.5).

### 4.4 Contexts (`context/`)

Ambos envuelven toda la app desde el layout raíz, así que cualquier screen puede asumir que están disponibles:

- **`context/auth.tsx`** (`AuthProvider`/`useAuth`) — dueño del JWT (persistido en `expo-secure-store`), del `User` actual (decodificado del JWT + sync con `/api/v1/personas/{id}` para nombre/categoría), de la programación de expiración de sesión, de login/register/recover/logout, y del tracking de `hasPaymentMethod`. `useProfile()` es un hook de solo lectura sobre el mismo contexto.
- **`context/websocket.tsx`** (`WebSocketProvider`/`useWebSocket`) — dueño del cliente STOMP (`@stomp/stompjs`), conecta solo si hay sesión, se suscribe a `/user/queue/notificaciones`, expone la lista de notificaciones corriendo, y reconecta automáticamente cuando cambia el token. También expone `subscribeToTopic(topic, callback) → unsubscribe` para suscribirse a topics arbitrarios (las suscripciones registradas así sobreviven reconexiones).

### 4.5 Estado global (Zustand)

Zustand se usa para estado cross-cutting que necesita leerse desde árboles de rutas no relacionados (ej. un banner visible en todos los tabs).

- **`lib/subastas.store.ts`** (`useSubastaStore`) — la sesión de subasta activa: detalle de la subasta, catálogo, `itemActual` (el ítem que se está subastando ahora), `mejorPuja` (actualizada en vivo por WS), lista completa de pujas, y el `asistente` del usuario (necesario como `asistenteId` para pujar).
  - `joinSubasta(id, token, clienteId, subscribeToTopic)` — entra a una sesión: trae subasta + catálogo + pujas actuales y se suscribe a `/topic/subastas/{id}/pujas`.
  - `leaveSubasta()` — limpia la sesión.
  - `placePuja(importe, token)` — hace el `POST` de la puja; el broadcast WS actualiza el estado automáticamente si tiene éxito.
  - `getBidBounds(precioBase, mejorPuja, categoria)` — devuelve `{ min, max }` según las reglas de puja del TPO (`max` es `null` para categorías oro/platino).
  - Regla de negocio: un usuario solo puede estar en una subasta a la vez — `joinSubasta` llama a `leaveSubasta` primero si ya hay una sesión activa.

### 4.6 Estilos

**NativeWind v4** (`className`, clases Tailwind) es el approach por defecto; `global.css` + `tailwind.config.js` (vía `nativewind-env.d.ts`) lo conectan. `constants/theme.ts`/`lib/theme.ts` y los hooks `use-theme-color.ts`/`use-color-scheme*.ts` cubren los pocos casos que necesitan valores de tema a nivel JS (la app fuerza un `ThemeProvider` oscuro custom en el layout raíz).

### 4.7 Dependencias relevantes

Algunas libs que vale la pena conocer (de `package.json`):

- **Navegación:** `expo-router`, `@react-navigation/*`.
- **Red/tiempo real:** `openapi-fetch`, `@stomp/stompjs`.
- **Estado:** `zustand`.
- **UI:** `nativewind`, `tailwindcss`, `lucide-react-native`, `react-native-gifted-charts` (gráficos de métricas), `react-native-draggable-flatlist`, `react-native-maps` + `react-native-google-places-autocomplete` (ubicación, probablemente para domicilio/depósitos).
- **Dispositivo:** `expo-camera`, `expo-image-picker`, `expo-document-picker` (fotos de DNI/ítems), `expo-secure-store` (JWT), `expo-local-authentication`, `expo-notifications`.

### 4.8 Comandos

```bash
npm install
npm run start              # expo start
npm run android / ios / web
npm run lint                # expo lint
npm run api:generate        # regenera types/api.d.ts contra server local (puerto 4002)
npm run api:tunnel          # exponer el server local vía cloudflared, para generar tipos contra una build remota
```

No hay test runner configurado en el client.

---

## 5. Resumen de "qué mirar primero"

| Quiero entender... | Empezar por |
|---|---|
| Reglas de negocio del dominio (subastas, pujas, categorías) | [`TPO-DAI.md`](../TPO-DAI.md) |
| Cómo se generan los tipos del cliente | `CLAUDE.md` raíz, `client/lib/api.ts` |
| Un endpoint específico | `server/.../controller/<feature>/` |
| Permisos sobre un endpoint | `server/.../config/SecurityConfig.java` y `server/.../security/` |
| Esquema de base de datos | `server/src/main/resources/db/migration/` (en orden) |
| Tiempo real (pujas/notificaciones) | `server/.../config/WebSocketConfig.java`, `client/context/websocket.tsx`, `client/lib/subastas.store.ts` |
| Sesión / login | `server/.../controller/auth/`, `client/context/auth.tsx` |
| Envío de mails | `server/.../service/EmailService.java` |
| Navegación de la app | `client/app/_layout.tsx` y subcarpetas de `app/` |
