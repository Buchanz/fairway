# Fairway: two-week mobile milestone

Target: October 19, 2026. A tested, installable beta and capstone-ready submission package; public store approval depends on external review and account requirements.

## Release scope
- Existing live tee-time discovery and provider checkout redirects.
- Native Apple satellite maps on iOS and Google satellite maps on Android.
- Opt-in foreground GPS, accuracy indicator, recentering and tap-to-target distances.
- Verified hole/green coordinates for one pilot course before expanding coverage.
- Local multiplayer scorecards, saved rounds and round history.
- Permission-denied, weak-GPS, offline and save-error handling.

## October 5–11: complete the core
- [x] Replace native rangefinder WebView with native map component.
- [x] Add foreground GPS lifecycle, accuracy and stale-fix handling.
- [ ] Configure Android-restricted Maps key, app identifiers and EAS project.
- [ ] Produce iOS and Android development builds and test on actual phones.
- [ ] Source licensed/authorized hole and green coordinates for one pilot course. Course centre coordinates are not green targets.
- [ ] Build hole navigation and front/centre/back distances from verified geometry.
- [ ] Refine mobile round layout and persistent score entry.

## October 12–19: verify and deliver
- [ ] Field-test distance accuracy and phone GPS behaviour at the pilot course.
- [ ] Test score persistence after app restart, interruption and offline use.
- [ ] Test booking handoff, empty results and stale availability.
- [ ] Deploy a permanent backend; replace the temporary desktop tunnel.
- [ ] Prepare privacy policy, support contact, permission explanations and store disclosures.
- [ ] Prepare screenshots, capstone README, devlog and demo.
- [ ] Distribute installable beta builds; submit to stores when account/testing requirements are met.

## External dependencies
- Lightspeed and other provider approvals: add courses after access is granted; do not block the existing release on them.
- Verified course geometry and permission to use it: blocks automatic green distances, not manual target measurement.
- Apple/Google developer accounts, signing credentials, Android Maps key and Expo account: needed for release distribution.
- Store review/testing requirements: public availability is not guaranteed by the target date.

## Deferred
In-app booking/payment, booking-account linking, all-BC coverage, social features, handicap calculations, background location and watch apps.

## Current validation limits
Native maps code is not yet device-tested. No verified green dataset is bundled. Android production maps require a restricted key and a rebuilt binary. The browser preview does not render native Apple/Google maps.
