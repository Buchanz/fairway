# Capstone readiness — reviewed October 18, 2026

This records evidence, not a claim that the project has been submitted or all checks pass.

| Rubric criterion (10 points each) | Implemented evidence | Remaining acceptance work |
| --- | --- | --- |
| Architecture | Expo Router screens; reusable UI components; separate Auth/data services; Express provider adapters; PostgreSQL migrations and RLS | Keep architecture document current; explain PostgreSQL choice to assessor |
| Code quality/documentation | TypeScript, lint, modular adapters, README, setup instructions, source attribution | Final review and public repository publication |
| Framework/library usage | React/React Native, Expo, Node/Express, Supabase Auth/PostgreSQL, native maps | Brief names MongoDB; instructor must confirm PostgreSQL substitution is acceptable |
| Testing/debugging | 83 automated tests at last pass, TypeScript and ESLint, exported web/iOS bundles; public Auth access checks | Two-user RLS/account switching, actual signup/recovery emails, avatar ownership, friend invitations, physical-device and browser acceptance |
| Devlog | Weekly log in docs/DEVLOG.md, detailed implementation log in DEVLOG.md, screenshots and test/source examples | Student should add personal learnings and final milestone evidence; do not invent retrospective progress |
| Deployment | Running local Express/Metro plus temporary HTTPS previews | Always-on production host, stable callback URLs, monitoring, public GitHub URL, final live link |

## October 18 verified progress
- Signed iPhone internal previews successfully built; Android preview runs on the Mac emulator. These do not replace a stable backend.
- Group-round migration applied to hosted Supabase. Direct reads of presence/flip tables denied; membership-checked functions provide access.
- Tee flip is implemented: linked accounts, opt-in foreground GPS, all players within 200 m, fresh presence, one shared server result. Two-device acceptance is still pending.
- Completed rounds copy each joined friend’s personal scorecard to their account. Local database tests pass; hosted multi-account acceptance is pending.
- No disposable test accounts have been created yet. Static offline accounts cannot exercise the active-location tee flip.
- No Git remote is configured in this checkout; public repository delivery is unverified.
- 11 of 12 audited rangefinder listings have numbered geometry; Cordova Bay Ridge lacks a complete layout. Geometry checks do not establish real-world tee accuracy.

## Earlier hosted account audit (October 17; recheck outstanding items)
- Email signup enabled; email confirmation required; secure email change enabled.
- Password settings changed from 6 characters/no required characters to 12 and uppercase/lowercase/digit/symbol. Client validation aligned.
- Anonymous reads of all four account tables denied (live API check).
- Username search RPC is missing remotely (`PGRST202`). Apply pending `202610160003_player_search.sql` only; do not rerun the full new-project bundle.
- Trigger helper `create_player_profile` is unnecessarily executable through public roles. Prepared `202610160004_trigger_permissions.sql` to revoke direct calls; authenticated user-facing RPCs remain intentionally callable and enforce identity internally.
- Custom SMTP is OFF. Public signup email delivery is not production-ready.
- Dashboard showed Site URL `http://localhost:3000` and no allowed redirects. Attempts to update were interrupted by browser use; do not assume saved.
- No two-user test credentials were supplied; authenticated isolation is not yet verified.

## Preview callback values to configure
Temporary values change when tunnels restart:
- Site URL: `https://thread-abstract-arg-studies.trycloudflare.com`
- Web callback: `https://thread-abstract-arg-studies.trycloudflare.com/account`
- Expo Go callback: `exps://clan-blake-lexmark-lamp.trycloudflare.com/--/account`
- Installed-app callback: `fairway://account`
- Local web callback, for development only: `http://127.0.0.1:8788/account`

Use exact allowed URLs rather than a broad wildcard. Replace temporary hosts with stable production destinations before submission.

## October 17 release gate
- [x] 81 automated tests, typecheck, lint and all-platform exports pass before the dependency patch; rerun recorded in DEVLOG.
- [x] Public Auth check confirms signup/confirmation enabled and anonymous reads denied for four account tables.
- [x] Architecture and proposal database descriptions corrected; Docker deployment package and health check prepared.
- [x] Critical shell-quote advisory fixed by compatible dependency update.
- [ ] Review remaining 21 high and 10 moderate dependency advisories; suggested forced downgrades of Expo/React Native are not acceptable without compatibility work.
- [ ] Apply pending search, trigger-permission and username-login migrations; deploy username-login Edge Function.
- [ ] Configure SMTP, stable callback URLs and verify real signup, confirmation, reset, username/email sign-in and sign-out.
- [ ] Verify two-user RLS, profile photo ownership, friends, shared rounds, account switching and deletion with disposable test accounts.
- [ ] Publish public GitHub repository and permanent HTTPS deployment; Docker image has not yet been built/tested.
- [ ] Verify iOS and Android maps, offline recovery and permissions on devices. Configure Android production Maps key and release identifiers if distributing standalone apps.
- [ ] Complete final browser/device acceptance, demo screenshots, personal devlog reflections, and instructor approval of proposal/PostgreSQL substitution.

Do not claim that courses and rangefinder styling are the only remaining work until these release gates pass. App-store publication is separate from the rubric's live-application requirement.
