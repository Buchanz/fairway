# Capstone readiness — October 18, 2026

This checklist distinguishes tested behaviour from implementation and outstanding acceptance. No grade or store approval is implied.

| Rubric criterion (10 points each) | Evidence | Still needed |
| --- | --- | --- |
| Architecture | Separate screens, reusable components, Auth/data services, Express provider adapters, PostgreSQL migrations and RLS | Instructor confirmation that Supabase/PostgreSQL satisfies the brief's MongoDB requirement |
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
- iOS build 4d81405d-5a1b-401d-a483-80c4a65b6ab0 succeeded. It predates the latest pinned-account and Android interaction changes. Current-source build 30874353-24e6-4f19-84eb-366e7bc082e8 was submitted for testing; completion not yet verified.

## Failed / incomplete checks, in priority order
1. **Accounts:** verify SMTP sender and exact callback URLs, then exercise signup, confirmation, username/email sign-in, reset, profile edits/photo, sign-out and account switching with disposable users. Anonymous denial is not a substitute for authenticated isolation tests.
2. **Live data:** Olympic View returned HTTP 502 for October 19 and had an empty snapshot. Investigate the provider failure; do not represent this as sold out.
3. **Mobile release configuration:** Expo production environment currently lists none of the required API/Supabase variables or Android Maps key. Preview settings are separate. Android standalone maps and store packages need configuration and testing.
4. **Security/dependencies:** npm audit reports 21 high and 10 moderate advisories (zero critical). Review reachability and compatible fixes; do not force incompatible Expo/React Native downgrades. Abandoned group-presence retention still needs review/cleanup.
5. **Course accuracy:** 11/12 listings pass geometry checks. Cordova Bay Ridge has no complete hole mapping. Geometry checks do not establish real-world tee, green, routing or tee-colour accuracy.
6. **Submission materials:** instructor approval of proposal/database choice, personal devlog reflections, final screenshots and demo; complete privacy/support/deletion pages before store submissions.

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
