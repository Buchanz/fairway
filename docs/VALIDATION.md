# Validation and rubric evidence

Audited October 5, 2026. This is evidence of the current build, not a predicted grade.

| Rubric category | Current evidence | Remaining gap |
| --- | --- | --- |
| Architecture (10) | Shared domain helpers; separate provider adapters/snapshots, route state and UI; platform-specific native/web maps; ARCHITECTURE.md explains data flow and tradeoffs | Large screen modules could be further separated; production scaling is not implemented |
| Code quality and documentation (10) | TypeScript, lint, README with every required section, source links and configuration example | Ongoing readability work; no claim of a full security audit |
| Framework/library usage (10) | React hooks/state, Expo Router, native maps/location lifecycle, AsyncStorage write queue, Express and provider parsing | Physical-device validation; ask instructor whether MongoDB is mandatory |
| Testing and debugging (10) | 42 automated tests; type/lint checks; platform bundle exports; documented pagination/date/provider fixes | No comprehensive native UI suite, real GPS field test or completed device/browser matrix |
| Devlog (10) | Dated progress, debugging explanations, historical verification results, screenshots and code example | Continue recording weekly learnings and final release evidence |
| Deployment (10) | Express serves exported web app and APIs; temporary preview has been used | Permanent HTTPS deployment, monitoring, release performance checks, public repository and signed app distribution are not complete |

## Automated checks
`npm test` runs unit tests and parser/snapshot tests using controlled fixtures. It does not prove upstream services are currently available. `npm run typecheck` and `npx expo lint --no-cache` validate source consistency. `npx expo export --platform all` checks platform bundling; it does not compile, sign, install or field-test native binaries.

GitHub Actions is configured in `.github/workflows/validate.yml`. A successful hosted run has not yet been observed because no Git remote is configured.

## Manual evidence already recorded
The devlog records live-provider comparisons and date-window investigations. Browser score persistence was checked by entering strokes and reloading. Screenshots in `docs/images` capture earlier search and mobile prototype milestones, not the latest native map screen.

## Manual validation still required
Run real-device checks on iOS and Android: location allowed/denied/disabled; weak and stale GPS; background/foreground; course target selection; holes 1 and 18; multiple players; partial/finished/reopened rounds; restart persistence; storage failure; airplane mode; small screens and large text. Compare GPS range estimates with known on-course distances. Confirm native map attribution remains visible beneath overlays.

For deployment, verify HTTPS, live endpoint responses, loading/failure states, booking handoff on mobile browsers, absence of client secrets, health monitoring, and initial-load/filter/scroll performance. Record device/browser versions and actual observed outcomes rather than marking unperformed checks as passed.

## Required deliverable status
- Proposal: prepared; instructor approval not confirmed.
- Live application: permanent URL pending. A desktop tunnel does not satisfy reliable final hosting.
- Public repository: not yet configured/published from this checkout.
- README: required sections now included.
- Devlog: maintained; final device/deployment results still pending.

## October 16 account audit
`npm run typecheck`, `npm run lint`, 78 automated tests and `npx expo export --platform all` passed. `npm run db:check-public` passed against the configured hosted project: email signup/confirmation enabled and anonymous reads denied for all four account tables. These checks do not verify SMTP delivery, authenticated ownership, avatar policies or account deletion. See CAPSTONE-READINESS.md for observed gaps. Native phone interactions remain manual acceptance work.

### October 16 UI follow-up
78 tests passed; typecheck and lint passed; all-platform Expo export completed after the tab, auth-toggle, and bottom-blur changes. API `/api/health` and Metro `/status` responded successfully. Native visual acceptance requires an iPhone check. Hosted migration/callback completion is deferred at the user's request while their Mac is locked.
