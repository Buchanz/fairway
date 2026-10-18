
### October 15 — Home photo loading
- Bundled the five verified course photos instead of requesting them from five third-party sites on card mount; retained original source attribution.
- Disabled Android image fade, started availability cache hydration at module load, and preferred current in-memory availability on home navigation (including web).
- Web HTML preloads all five photos; fingerprinted photo assets now use one-year immutable browser caching. Live availability expiry remains unchanged.
- Validation: typecheck, lint, three cache tests, web/iOS exports passed. Running preview verified five image preload links and five HTTP 200 image responses with immutable caching. Expo Go still downloads bundled assets on its first development load; installed release builds include them locally. No physical-device timing measurement performed.

### 2026-10-16 — Tab interaction and course map review
The selected tab highlight previously ignored touches. It now contains an interactive glass surface and press target, with press feedback and continuous drag navigation. Mobile next-course control reduced to 36px and moved nearer the tab bar, with a dark green tint.
Reviewed municipal aerial imagery against official course routing. Added 9-hole Ardmore and 18-hole Langley pilot layouts. Corrected Duncan reference pads and connected reviewed Blue/White/Green coordinates for holes 1–6 to round tee selection. Remaining colour-specific positions and Cordova Ridge need better references; no unsourced green outlines were added. Added tests for complete routing, finite hole cameras and tee selection without shared-data mutation. Typecheck/lint and 78 tests pass; iOS export succeeds. Native glass gestures and field positioning still require device/on-course verification.

### 2026-10-16 — Account deployment audit and restart
Replaced expired preview tunnels, reconfigured Expo's public bundle/API URLs, rebuilt web/iOS/Android and restarted the backend. Added a non-sensitive health endpoint. Fixed web requests to stay same-origin while native uses its configured API URL.
Live read-only Supabase checks confirmed signup/email confirmation enabled and anonymous account-table reads denied. Dashboard password policy was strengthened to 12 characters plus uppercase/lowercase/digit/symbol and the client was aligned. Found missing username-search RPC, custom SMTP disabled, localhost callback configuration and unnecessary trigger-function grants. Prepared a trigger-only permission migration and documented the remaining hosted acceptance work. Corrected outdated README claims about cloud accounts and hole maps. Avoided claiming authenticated isolation or email delivery without tests. Typecheck, lint, 78 tests and all-platform exports passed.

### October 16 — navigation and account controls
- Kept tab symbols in a stationary overlay while the selected glass pill animates underneath; tap animation starts before route navigation.
- Removed glass backgrounds from auth segments so the green selection slides visibly between Sign in and Create account.
- Added a progressive native feed blur with the next-course control above it.
- Validation: 78 tests passed, TypeScript and lint passed, and web/iOS/Android exports succeeded. Web API health and Expo packager responded successfully. Physical iPhone animation checks remain pending.
- Hosted Supabase username-search migration and callback allowlist verification remain pending while the Mac is locked; user requested completing local code first.

### Username sign-in
Added username/email input, private Edge Function credential exchange, server-only email resolution and per-handle attempt limiting. Three endpoint tests cover normalization/token-only success, uniform unknown/wrong-password failures, and invalid-input rejection. All 81 tests, typecheck and lint pass. Hosted migration/function deployment remains pending because no Supabase CLI/deployment token is available in this workspace.

### October 17 — capstone readiness and preview recovery
Public development hostnames stopped resolving while Metro remained healthy. Restored API tunnel and, after explicit user approval of public development-bundle exposure, restored Expo tunnel. Supabase browser work remains blocked by the locked Mac. Rechecked anonymous table access successfully; this does not establish authenticated isolation or email delivery.

Corrected outdated database architecture/proposal text, added deployment instructions and a Dockerfile with an unprivileged runtime and health check, and included Games in Express SPA routes. Updated shell-quote to remove the critical advisory; 21 high/10 moderate advisories remain for compatibility review. Production container and stable hosting remain unverified. See CAPSTONE-READINESS.md for release gates rather than assumed rubric completion.

### First standalone iPhone preview
Verified the registered iPhone on the Apple team, linked com.buchanzsteam.fairway, created distribution signing/provisioning for that phone, and uploaded the first EAS preview build: cd38b20e-aa3a-4517-b2ef-587352aaa671. Preview environment contains only public API/Supabase settings. Backend health returned 200 before submission. This is a test build against a temporary backend, not a production release; hosted auth deployment and stable hosting remain pending. Build status must be checked before claiming installation readiness.

The first cloud build failed during npm ci because optional @emnapi packages were absent from the lockfile. Regenerated the lockfile with npm 10 and explicitly aligned Reanimated/Worklets with Expo SDK 57. Typecheck, lint and all 81 tests passed. Retry b66255da-ecde-4ea1-879e-ff0f00a68bff passed dependency installation and reached CocoaPods/native build preparation; installation remains unverified until EAS finishes.

### October 18 — mobile round reliability and group rounds
- Removed redundant layout-driven photo sizing for normal course photos and reset failed-image identity when switching courses. Photo performance still needs physical-device measurement; not claimed instantaneous.
- Warm account round data after session restoration and deduplicate concurrent reads.
- Added account-isolated durable pending score writes, protected newer queued scores from old acknowledgements, and wait for successful saves before closing a round. Final hole now offers Finish & Save Round; incomplete rounds still require explicit discard.
- Score stepper uses a light glass pill; Edit / Add friends is a visible action on Play.
- Added opt-in shared group/tee-flip UI and migration 202610180001. Server checks membership, foreground presence freshness and 200m proximity, then chooses one result. Joined friends receive their own completed scorecards. Precise presence is removed on completion. Hosted migration is NOT applied; multi-device validation remains pending.
- Local PostgreSQL migration checks passed for membership rejection, missing/far-away participants, common result and score propagation. Run scripts/check-round-groups.mjs with PGLITE_MODULE pointing to a locally installed @electric-sql/pglite entrypoint. This is a local model of auth, not hosted Supabase acceptance.
- Audited 12 course listings: 11 numbered layouts pass geometry checks; Ridge lacks a complete layout. No claim of surveyed tee accuracy. See COURSE-LAYOUT-AUDIT.md.
- Android Studio installed; setup wizard downloading 2.1GB ARM system image. Existing Metro and restarted API both respond. The previous iOS preview succeeded, but these new changes require a new build for the installed standalone app.

Hosted group-round migration applied successfully October 18 after explicit user approval. Supabase SQL Editor returned Success; both new tables have RLS enabled and direct SELECT denied to anon and authenticated roles. Multi-device foreground/location and native UI acceptance remain pending. Android system image installed after initial download timeout; emulator reconnected through ADB and Expo launch retried.

### Android filter menu alignment
- Corrected the Android status-bar coordinate offset between measured filter buttons and the translucent menu modal, keeping the opening/closing header aligned with its button.
- Typecheck and lint passed. Visual confirmation on the Android preview remains pending.

### Games and favourites presentation
- Restored compact Players edit/add-friends text on Play, retaining the rangefinder score stepper pill.
- Removed the separate group-round heading while retaining join/tee-flip access within Games.
- Completed rounds now include course thumbnails and the signed-in player's stroke total alongside participant summaries and expandable scores.
- Favourite course thumbnails now use square glass frames; circular glass star controls use outlined/filled symbols by favourite state on iOS and Android.
- Typecheck and lint passed; device visual review pending.

### October 18 — release preparation
- Applied hosted username search, trigger permission hardening and private username resolution migrations successfully.
- Deployed username-login Edge Function through Supabase. Publishable-key requests reach the handler; invalid and nonexistent usernames return uniform 401 responses. Successful real-user login still needs acceptance testing. Legacy JWT dashboard toggle was left unchanged because signed-out requests already work.
- Added Render deployment blueprint, Android package/map-key configuration, store listing/privacy drafts and a production-build configuration gate rejecting temporary tunnel backends.
- Latest iPhone preview 047c3409-4fa9-447f-8fbc-c897b0b5c756 finished successfully. User reported a stale “build in progress” page, not a runtime crash.
- All-platform export, typecheck, lint and 83 tests pass. Docker daemon unavailable; container runtime validation remains pending.
