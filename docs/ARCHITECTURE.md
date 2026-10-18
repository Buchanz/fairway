# Fairway architecture

## Components and responsibilities
`src/app/index.tsx` owns the search screen and filters. `src/app/play.tsx` owns round creation, persisted rounds and score updates. `src/components/MobileRound.tsx` presents the native round and score sheet; `RangeMap.tsx` owns foreground GPS subscriptions and map targets. Platform-specific `.web.tsx` files keep native map modules out of browser bundles.

`src/data/courses.ts` is the course catalogue, with source links and approximate course centres. `src/lib` holds pure filtering, geographic distance, booking and score functions. `server` isolates provider requests/parsing from UI code. Each provider adapter normalizes upstream data; `market-snapshot.mjs` combines independently refreshed feeds.

## Data flow
The server requests public provider availability, validates the response, normalizes offers and refreshes an in-memory snapshot. Web pages receive an embedded snapshot on initial load; clients refresh through `/api/availability-snapshot`. Player/date/location filters run against that data. Expired inventory is removed. A selected offer is reviewed before handing off to the official booking site.

Round input flows from score controls to React state, then through a serialized AsyncStorage write queue. On reload, stored data is validated before use. Storage failures are reported and unreadable saved data is not silently overwritten. Supabase PostgreSQL stores account-scoped rounds, profiles, friendships and round invitations. AuthProvider restores sessions; cloud-rounds services synchronize data under row-level security. Local storage is partitioned by account, with a separate guest namespace.

GPS is requested explicitly. Foreground location updates feed the map marker and great-circle distance to a selected target. Subscriptions stop on background/unmount, and stale fixes do not produce yardage. Targets are kept separately per hole during the current screen session. Bundled hole geometry supplies course-specific tee and green targets where available; coverage and accuracy vary and are documented in HOLE-DATA.md. Manual targets are not persisted with rounds.

## State and boundaries
React state handles transient screen/filter/modal state. AsyncStorage persists scorecards. Provider snapshots are server memory only and refill after restart. Map credentials and private provider credentials must follow their different security models: provider secrets remain on the backend; client map keys require platform restrictions.

## Tradeoffs and remaining work
Shared TypeScript and platform-specific map views reuse core behaviour without forcing a browser map into native screens. In-memory snapshots limit repeated upstream requests but are not shared across server replicas. Horizontal scaling will need coordinated cache/refresh ownership. Current screens contain substantial presentation logic; further extraction should follow meaningful feature boundaries. Native UI/GPS behaviour still needs device tests. Account sync is implemented but requires hosted acceptance tests. PostgreSQL replaces the brief’s named MongoDB stack; instructor approval of that substitution remains unverified. Username sign-in uses a private Edge Function and service-role-only lookup; deployment is pending.
