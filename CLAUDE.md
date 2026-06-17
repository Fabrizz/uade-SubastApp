# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

SubastApp is a monorepo for an auction-house management app (Desarrollo de Aplicaciones I, UADE). The full TP assignment description and requirements are in [TPO-DAI.MD](TPO-DAI.MD). It has two independent projects that each get their own nested `CLAUDE.md` with stack-specific guidance:

- **[server/](server/CLAUDE.md)** — Spring Boot 4 / PostgreSQL backend exposing a REST API (documented via springdoc-openapi) and STOMP-over-WebSocket endpoints for real-time bidding/notifications.
- **[client/](client/CLAUDE.md)** — Expo / React Native app (Expo Router, NativeWind) consuming that API.

## How the two halves connect

The client never hand-writes API types or request/response shapes. The flow is:

1. The server defines REST endpoints with springdoc-openapi annotations (`@Operation`, `@ApiResponse`, etc.) — these annotations are the source of truth for the generated client, so keep them accurate when changing a controller.
2. Run the server locally (port `4002` by default, see `server/src/main/resources/application.properties`).
3. From `client/`, run `npm run api:generate` (`openapi-typescript http://localhost:4002/api-docs -o types/api.d.ts`) to regenerate `client/types/api.d.ts`.
4. `client/lib/api.ts` builds an `openapi-fetch` client typed against `types/api.d.ts`. This is the only file that should construct the API client; everything else imports `api` from `@/lib/api`.

Because of this pipeline, a backend signature change requires regenerating the client types before client code referencing the new/changed endpoint will type-check.

There is no top-level build tool tying the two projects together — each is built/run independently (Maven for the server, Expo CLI/npm for the client).
