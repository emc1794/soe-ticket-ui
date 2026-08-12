# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TicketWave UI — a React + TypeScript frontend for an event ticketing platform (concerts, sports, conferences). Users register/log in, search events, select seats or general-admission tickets, check out, and view purchased tickets.

This UI talks to two real, independently deployed backend services (siblings of this repo, not part of it):

- **`soe-ticket-api`** (`../soe-ticket-api`, `http://localhost:3000/api/v1`) — identity (register/login/profile, JWT) and the event catalog (search/list, no create endpoint). Payment and notification modules exist but have no SPA-facing HTTP surface — they only react to RabbitMQ events internally.
- **`soe-ticket-ordering-service`** (`../soe-ticket-ordering-service`, `http://localhost:3001/api/v1`) — owns Order/Ticket booking (`POST /orders`, `GET /orders/:id`). No auth middleware; `userId` is just a client-supplied field.

**Do not modify either backend repo from here.** Both must be running locally (each has its own `npm run dev`, MySQL/Redis/RabbitMQ backing) for this app to have data or complete purchases. Base URLs are configurable via `VITE_TICKET_API_URL` / `VITE_ORDERING_API_URL` (see `.env`; default to `localhost:3000`/`3001`).

See `ticketwave-events.md` for the original product requirements. Several are **not implementable against these APIs as they exist today** and are intentionally out of scope here — see "Known backend gaps" below.

## Commands

```bash
npm run dev       # start Vite dev server (expects both backend services running)
npm run build     # tsc typecheck + vite production build
npm run lint      # eslint on src/**/*.{ts,tsx}, zero warnings allowed
npm run preview   # preview the production build
```

There is no test runner configured in this project (no test script, no test files).

## Known backend gaps (and how the UI copes)

These aren't bugs to "fix" in this repo — they're real limitations of the current backend surface, worked around deliberately:

- **No `GET /events/:id`.** `api.events.getById` (`src/services/api.ts`) fetches the full catalog and filters client-side.
- **No real seat inventory.** `soe-ticket-api`'s venue seating-map/availability endpoints are unimplemented stubs (always return empty arrays). `src/features/tickets/utils/generateReferenceSeats.ts` generates a client-side reference seat chart from the event's `metadata.minPrice`/`maxPrice` instead — real availability is only known when `POST /orders` returns 409 (seat already locked).
- **No ticket-type endpoint for general admission.** `PurchasePage` synthesizes 1–2 price tiers from `metadata.minPrice`/`maxPrice` and generates synthetic seat-number tokens (`GA-<tier>-<timestamp>-<i>`) to satisfy the Order API's `seatNumbers: string[]` shape.
- **No "list my orders" endpoint.** `src/services/localOrders.ts` persists orders (enriched with event display info) to `localStorage` (`ticketwave_orders`) client-side; `MyTicketsPage` reads from there and refreshes any still-`PENDING` orders against `GET /orders/:id`.
- **Order completion is fully async with no push channel.** `POST /orders` always returns `PENDING`; fraud/payment resolve it over RabbitMQ on the backend. `api.orders.pollUntilSettled` (`src/services/api.ts`) polls `GET /orders/:id` until the status leaves `PENDING`. `ConfirmationPage` uses this and shows a "Procesando tu pago..." state while it waits.
- **No refund/cancel endpoint exists.** `RefundOrder` is a dead stub in `soe-ticket-api`, wired to nothing. `MyTicketsPage` does not fake a refund flow — it says so explicitly in the order detail dialog rather than pretending an action succeeded.
- **No notification-list endpoint.** `src/hooks/useNotifications.tsx` is a local `localStorage`-backed notification feed driven by real client-side events (order created/completed/cancelled), not backend data.
- **Events table has no create endpoint.** Sample events/venues were seeded directly into MySQL (see git history / conversation, not a script in this repo) with `metadata` populated (`imageUrl`, `minPrice`, `maxPrice`, `venueName`, `category`, `tags`) since the real `Event` model doesn't carry pricing/image/venue-name fields itself.

## Architecture

### Domain types mirror the real API contracts

`src/features/types.ts` is the single source of truth. `Event` matches `soe-ticket-api`'s shape exactly (`id, title, description, date, venueId, artist, city, type: 'assigned'|'general', metadata, status: 'ACTIVE'|'CANCELLED'`); display-only fields (price, image, venue name, category, tags) live under `Event.metadata` since the backend doesn't model them elsewhere. `Order` matches `soe-ticket-ordering-service`'s shape (`id, userId, eventId, seatNumbers, amount, status`). `LocalOrder` extends `Order` with client-persisted display fields for `MyTicketsPage`. `CartItem.seatNumbers` always has `length === quantity` — it's the exact token array sent to `POST /orders`.

### API layer talks to two different origins

`src/services/api.ts` has one `request()` helper used by both `TICKET_API_BASE` and `ORDERING_API_BASE` — it unwraps `{success, data}` envelopes and normalizes the two error shapes both services can return (`{message}` from inline route handlers vs `{error:{code,message}}` from the global error middleware) into a single `ApiError`. `api.identity`, `api.events` hit `soe-ticket-api`; `api.orders` hits `soe-ticket-ordering-service`.

### Auth gates purchasing

`src/hooks/useAuth.tsx` is a Context provider storing `{token, user}` in `localStorage` (`ticketwave_auth`) and re-validating the token against `GET /identity/profile` on mount. `PurchasePage` and `CheckoutPage` redirect to `/login?redirect=<path>` via `<Navigate>` when there's no logged-in user, because `Order.userId` must be a real registered user id.

### Cart state and reservation expiry

`src/hooks/useCart.tsx` is a Context provider (`CartProvider`, wraps the app in `App.tsx`) backed by `localStorage` (`ticketwave_cart`). Adding the first item starts a 10-minute client-side reservation timer (`CART_EXPIRATION_TIME`); this is UX-only pacing — the only real hold is the Redis seat lock `soe-ticket-ordering-service` takes at `POST /orders` time (returns 409 on conflict).

### Seating vs. general admission branches on `event.type`

`PurchasePage` (`src/pages/PurchasePage.tsx`) checks `event.type === 'assigned'` and renders either the reference seat-map flow or the synthetic ticket-tier quantity flow (see "Known backend gaps"). Both paths converge on `useCart().addItem` before navigating to `/checkout`. `CheckoutPage` groups cart items by `eventId` (the Order API is one order per event) and calls `api.orders.create` once per group.

### Notifications are a local event log, not backend-sourced

`src/hooks/useNotifications.tsx` provides `addNotification`/`markAllRead`, both wrapped in `useCallback` with functional `setState` updates so they stay referentially stable across renders — **do not remove the `useCallback` wrapping**; an earlier version without it caused an infinite loop (`ConfirmationPage`'s polling effect depends on `addNotification`, a new reference each render meant the effect re-fired every time a notification was added, which added another notification, forever). `CheckoutPage` and `ConfirmationPage` call `addNotification` at real purchase-lifecycle moments.

### Routing and page structure

`src/App.tsx` defines all routes with `react-router-dom` v6, wrapped by `AuthProvider` > `NotificationsProvider` > `CartProvider` > `MainLayout`. Pages live flat in `src/pages/`. Purchase flow: `EventsPage` → `EventDetailPage` → `PurchasePage` (`/purchase/:id`) → `CheckoutPage` → `ConfirmationPage` (`/confirmation/:id`, polls order status) → `MyTicketsPage`. Auth flow: `/login`, `/register`.

### `src/features/*` is mostly placeholder

`src/features/events` and `src/features/payment` contain only a stub `README.md` — actual event browsing lives in `src/pages/EventsPage.tsx`, payment form UI in `src/pages/CheckoutPage.tsx`. `src/features/tickets` holds real code (`SeatMap.tsx`, `utils/generateReferenceSeats.ts`).

### Styling

MUI v6 (`@mui/material`, `@mui/icons-material`) with Emotion, theme in `src/theme/theme.ts` (`responsiveFontSizes` applied), provided once in `src/main.tsx`. Components use MUI's `sx` prop rather than separate CSS files.

### Import alias

`@/*` maps to `src/*` (configured in `tsconfig.json` and `vite.config.ts`), though most existing code uses relative imports — either style works.

### UI language

All user-facing strings are in Spanish (Chile-flavored: CLP-style prices via `toLocaleString()`, Santiago/Valparaíso venues). Keep new UI copy consistent with this unless told otherwise.
