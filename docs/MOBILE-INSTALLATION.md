# Installing Fairway before store release

Prepared profiles: `preview` builds a bundled standalone app, not a Metro development client. Android produces an APK; iOS uses internal ad hoc distribution to registered devices. `production` prepares store builds. Neither has been built or uploaded yet.

Before a cloud build:
1. Link this checkout to the existing Fairway EAS project using `npx eas-cli@latest init` while signed in as buchanz. Select the existing project; do not create a duplicate. Confirm permanent iOS bundle ID and Android package name before registering them.
2. Configure preview/production EAS environment values for EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY and EXPO_PUBLIC_API_URL. The API must use permanent HTTPS hosting; do not bake an expiring desktop tunnel into a distributed build. No service-role key goes into the app.
3. Apply pending auth changes and allow `fairway://account` in Supabase. Complete real account acceptance tests.
4. For iOS, enroll in the paid Apple Developer Program, register the phone through `npx eas-cli@latest device:create`, and complete Apple signing prompts yourself. For Android, configure a restricted production Google Maps key for the selected package/signing certificate.
5. Build with `npx eas-cli@latest build --platform ios --profile preview` or `npx eas-cli@latest build --platform android --profile preview`. Confirm any paid build usage before starting.
6. Install through the EAS build link. iOS devices must be in the signing profile; additional phones require re-signing/rebuilding. Android users approve installation from their chosen browser. Test cold start, map rendering, auth callbacks, permissions, score persistence and API access with the laptop off.

A bundled app removes Expo Go/Metro dependence, but tee times and cloud accounts still need online backend services. TestFlight is an alternative for iOS beta distribution without a public store listing; external testing needs Apple's beta review. Direct Android installs do not count toward a required Google Play closed test.

References: https://docs.expo.dev/build/internal-distribution/ and https://developer.apple.com/testflight/
