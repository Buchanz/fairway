# Capstone readiness — October 18, 2026

This checklist distinguishes tested behaviour from implementation and outstanding acceptance. No grade or store approval is implied.

| Rubric criterion (10 points each) | Evidence | Still needed |
| --- | --- | --- |
| Architecture | Separate screens, reusable components, Auth/data services, Express provider adapters, PostgreSQL migrations and RLS | User confirmed instructor allows Supabase/PostgreSQL (October 18) |
| Code quality/documentation | TypeScript and lint pass; public repository, README, architecture and proposal documents | Review dependency advisories and final documentation accuracy |
| Framework/library usage | React, React Native, Expo, Node/Express, Supabase, native maps | Standalone Android Maps configuration and real-device verification |
| Testing/debugging | 83/83 tests; web/iOS/Android exports pass; live web search and booking review checked | Full two-account and physical-device acceptance below |
| Devlog | Weekly entries, screenshots and implementation evidence | Student's personal learning reflections and final demo evidence |
| Deployment | https://fairway-bcsq.onrender.com; https://github.com/Buchanz/fairway; signed iOS beta builds | Stable auth callbacks/email delivery, production mobile environment, release checks |

## Verified this session
- TypeScript, ESLint and all 83 automated tests passed.
- Web, iOS and Android bundles exported successfully. Exporting does not prove native runtime behaviour.
- Live website and API health returned HTTP 200. Five providers supplied inventory: Cedar Hill, Mount Douglas, Ardmore, Langley Golf Centre and Royalwood.
- Safari: searching Ardmore narrowed results to one course; tee-time selection opened the correct course/date/time, four players, 18 holes and price review. No booking or payment was submitted.
- Account overlay opens, changes between sign-in and registration, shows username/email/password fields and password requirements, and closes.
- Hosted Supabase public checks: signup enabled, confirmation required, anonymous reads denied for rounds, player profiles, friendships and round invitations.
- Per-friend sharing migration was applied in the prior session; local database tests covered opt-in, unrelated-user denial and revocation. Hosted two-user tests remain outstanding.
- The latest source commit `4ae27b0` includes per-device SecureStore session persistence and public privacy, support and account-deletion routes. The previous iOS/TestFlight build predates the session fix. A corrected Android preview build (`918c5e86-290d-40a2-926c-d987cfb494f6`, version code 10) is queued; the corrected iOS build could not start because the Expo free iOS-build quota is exhausted until November 1.

## Failed / incomplete checks, in priority order
1. **Accounts:** verify SMTP sender and exact callback URLs, then exercise signup, confirmation, username/email sign-in, reset, profile edits/photo, sign-out and account switching with disposable users. Anonymous denial is not a substitute for authenticated isolation tests.
2. **Live data:** Olympic View returned HTTP 502 for October 19 and had an empty snapshot. Investigate the provider failure; do not represent this as sold out.
3. **Mobile release configuration:** EAS production and preview environments now contain the public API/Supabase values and Android Maps key used by the builds. Standalone Android maps and store packages still need installation and device testing.
4. **Security/dependencies:** npm audit reports 21 high and 10 moderate advisories (zero critical). Review reachability and compatible fixes; do not force incompatible Expo/React Native downgrades. Abandoned group-presence retention still needs review/cleanup.
5. **Course accuracy:** 11/12 listings pass geometry checks. Cordova Bay Ridge has no complete hole mapping. Geometry checks do not establish real-world tee, green, routing or tee-colour accuracy.
6. **Submission materials:** privacy, support and deletion routes now exist at `/privacy`, `/support` and `/delete-account`. Instructor approval is recorded; personal devlog reflections, final screenshots, store data disclosures and reviewer instructions remain.

## On-device acceptance still required
Use two disposable accounts, with two phones for GPS tee flip. Do not delete a real account to test deletion.
- Register and confirm each account; sign in by username and email; reset a password and sign out/in.
- Upload/change photo; edit profile; favourite/unfavourite a course; restart and confirm persistence.
- Add/accept a friend; enable sharing for one friend and disable it; verify access from the other account.
- Start a nine-hole round, add the other player, enter every score, finish, and verify each account's history and totals after restart.
- Quit a partial round and verify it does not enter completed history; test offline save/reconnect without duplicate rounds.
- With both phones together and foreground GPS enabled, join the round and flip a tee; verify both see the same result. Test permission denial and stale/off-course GPS.
- Check rangefinder framing, hole navigation, selected tees and measured distances on the course. Test iOS and Android separately.
- Confirm pinned profile/footer, scrolling favourites, Games image cards, Android press feedback and keyboard dismissal on the current build.

## Deployment limitations
Render Free is active with no paid plan/add-ons; requests after inactivity can take 50+ seconds. Production mobile environment, email delivery, callbacks and full device acceptance are not yet signed off. App-store publication is separate from the rubric's live-application deliverable.

Callback targets to verify in Supabase: `https://fairway-bcsq.onrender.com/account` and `fairway://account`. Remove obsolete tunnel callbacks after verifying the stable routes. This review did not change callback settings.

## Release audit update — October 21

- `npm run typecheck`, `npm run lint` and all 83 automated tests pass after enabling per-device session persistence. Native sessions use SecureStore; browser sessions use Supabase's local storage. A fresh installation has no session, while closing and reopening an already signed-in installation restores the session until the user signs out.
- Public privacy, support and account-deletion pages are now implemented as Expo routes and are included in the web export. They still need to be linked in the final store records and reviewed for course-specific legal wording.
- GitHub `master` is at `4ae27b0`. Render remains the live web/API deployment at `https://fairway-bcsq.onrender.com` on the free plan. Its cold-start delay remains a release limitation.
- Android build `918c5e86-290d-40a2-926c-d987cfb494f6` is queued from the session-persistence commit. The corrected iOS build is blocked by the Expo free-plan iOS quota until November 1; the existing TestFlight build does not include this latest session change.

## Release audit update — October 18, evening

- Supabase live-roster migration applied successfully; table and all three RPCs verified present. Local PostgreSQL tests passed for membership access, stale-round exclusion, shared flips including guests, hole/score sync and automatic completed-score copies. Two-device acceptance remains required.
- Current app source passes typecheck/lint and 83 unit tests (latest full run before the white Finish Hole text-only change). White Finish Hole text is in source, not the previously queued build.
- Android Maps key was configured for preview and production earlier; earlier missing-key notes are historical. Recheck the remaining production environment variables before a store build.
- Preview builds are internal distributions, not App Store/TestFlight or Google Play releases. Latest submitted previews: Android 0f3f8d9a-d9c6-4266-8fe4-dfcbed78cf9c; iOS 0e1d2b4e-99c6-44d9-bea6-b5b208c749ae. Neither submission establishes device acceptance.
- Replace the old GPS/Join Group acceptance scenario above with: add an accepted friend and a guest, start a round, verify automatic map entry on the friend’s foreground device, shared tee-flip result, host-controlled scores/holes and final history on both accounts.

### Release gates
1. Database choice approved by instructor, confirmed by user October 18. Assemble final personal devlog reflections and demo evidence.
2. Complete two-device account/round tests, including reset/confirmation emails, deletion, offline save and sharing isolation.
3. Confirm production environment, stable callbacks, email sender and free-host cold-start behavior.
4. Publish accurate privacy, support and external deletion pages using the existing hosted domain; obtain the owner’s public contact first. Confirm course-image/data usage rights.
5. Finish store records, screenshots, age/content ratings, data disclosures and private reviewer credentials.
6. Build production packages, upload iOS to TestFlight and Android to Play testing; then submit for public review after acceptance.

For new personal Google Play accounts created after November 13, 2023, Google requires at least 12 closed-test participants continuously opted in for 14 days before applying for production access. See https://support.google.com/googleplay/android-developer/answer/14151465 . This timing is separate from course submission.

Owner confirmed public support/privacy email: tyler.buchanan.a@gmail.com. Google Play Console account not yet created (October 18).
