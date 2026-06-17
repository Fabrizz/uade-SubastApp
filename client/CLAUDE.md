# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run all commands from `client/`.

```bash
npm install
npm run start            # expo start
npm run android          # expo start --android
npm run ios               # expo start --ios
npm run web                # expo start --web
npm run lint                # expo lint
npm run api:generate        # regenerate types/api.d.ts from a running server's /api-docs (expects server on localhost:4002)
```

There is no configured test runner in this project.

## Architecture

Expo Router (file-based routing) + React Native + NativeWind (Tailwind for RN) + TypeScript, strict mode. Path alias `@/*` maps to the project root (see `tsconfig.json`).

### Routing (`app/`)

- `app/_layout.tsx` is the root layout. It wraps the entire app in `AuthProvider` → `WebSocketProvider` → navigation `ThemeProvider`, and renders the root `Stack` with four top-level routes: `auth`, `admin`, `(tabs)`, and the `dev-menu` modal. Any global concern (auth gating, websocket connection, themed chrome) belongs here, not duplicated in child layouts.
- `app/(tabs)/` — the main authenticated app (home, auctions, notifications, profile + nested profile/payment flows).
- `app/auth/` — login, register, recover, start (account activation).
- `app/admin/` — backoffice/testing screens (`admitir`, `users`, `payment`, etc.). Gated in `app/admin/_layout.tsx`: requires `isAuthenticated` and `user.category === "admin"`, otherwise shows a login-required or access-denied screen instead of rendering children.
- `app/dev-menu.tsx` — a modal (registered in the root `Stack`) listing every route in the app plus current auth/session state, for fast manual navigation during development. A floating `DevMenuButton` (`components/dev-button.tsx`) opens it. When adding a new screen, consider adding it to the `ROUTES` list here.

### Componentization

Screens under `app/` should stay thin and compose components from `components/`. Shared UI primitives live in `components/ui/` (e.g. `Button`, `GenericModal`, `PasswordInput`, `AvatarInitials`, `CategoryPill`, `CuentaRegresiva`). Prefer extending/reusing these over writing new one-off styled components inline in a screen.

### `/lib` — client logic

- `lib/api.ts` — **the most important file in the client.** It builds the typed `openapi-fetch` client (`export const api`) from `types/api.d.ts`, which is generated from the backend's OpenAPI schema (`npm run api:generate`). `types/api.d.ts` and the `api` client are never hand-edited — if an endpoint's shape changed, regenerate against a running server instead of patching types by hand. All network calls in the app go through `api.GET/POST/PATCH/...`, not raw `fetch`. Also exports `API_BASE` (from `EXPO_PUBLIC_API_URL`, falling back to a deployed default), reused by `context/websocket.tsx` to derive the `ws(s)://.../api/v1/ws/native` URL.
- `lib/dni.ts`, `lib/utils.ts`, `lib/theme.ts` — other client-side logic (DNI parsing, generic helpers, theming).

### Contexts (`context/`)

Both wrap the entire app from the root layout, so any screen can assume they're available:

- `context/auth.tsx` (`AuthProvider`/`useAuth`) — owns the JWT (persisted in `expo-secure-store`), the current `User` (decoded from the JWT plus a `/api/v1/personas/{id}` sync for name/category), session expiration scheduling, login/register/recover/logout, and `hasPaymentMethod` tracking. `useProfile()` is a read-only convenience hook over the same context.
- `context/websocket.tsx` (`WebSocketProvider`/`useWebSocket`) — owns the STOMP client (`@stomp/stompjs`), connects only when authenticated, subscribes to `/user/queue/notificaciones`, and exposes the running notification list. Reconnects automatically when the auth token changes.

When adding a feature that needs auth state or live notifications, consume these contexts via `useAuth()`/`useWebSocket()` rather than re-deriving token/connection state locally.

`context/websocket.tsx` also exposes `subscribeToTopic(topic, callback) → unsubscribe` for subscribing to arbitrary STOMP topics beyond the user notifications queue. Subscriptions registered this way survive reconnects automatically.

### Zustand stores (`lib/*.store.ts`)

Zustand is used for cross-cutting global state that needs to be read from multiple unrelated route trees (e.g. a banner visible across all tabs).

- `lib/subastas.store.ts` (`useSubastaStore`) — owns the active auction session: auction details, catalog items, `itemActual` (the item currently being auctioned), `mejorPuja` (updated in real time via WS), the full bids list, and the user's `asistente` record (needed as `asistenteId` when placing bids). Call `joinSubasta(id, token, clienteId, subscribeToTopic)` to enter a session — it fetches auction + catalog + current bids then subscribes to `/topic/subastas/{id}/pujas`. Call `leaveSubasta()` to clean up. `placePuja(importe, token)` POSTs the bid; the WS broadcast updates state automatically on success. Also exports `getBidBounds(precioBase, mejorPuja, categoria)` which returns `{ min, max }` per TPO bid rules (max is `null` for oro/platino auctions).

A user can only be in one auction at a time (TPO rule); `joinSubasta` calls `leaveSubasta` first if a session is already active.

### Styling

NativeWind v4 (`className` props, Tailwind classes) is the default styling approach; `global.css` + `tailwind.config` (via `nativewind-env.d.ts`) wire it up. `constants/theme.ts` / `lib/theme.ts` and `hooks/use-theme-color.ts` / `hooks/use-color-scheme*.ts` handle the few cases needing JS-level theme values (the app forces a custom dark `ThemeProvider` in the root layout).
