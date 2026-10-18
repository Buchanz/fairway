# Fairway accounts — connection and validation

Implementation choice: Supabase Auth + PostgreSQL, alongside the existing Express tee-time server. Confirm that PostgreSQL is acceptable for the course before committing to this platform; the original brief names MongoDB. The development project is now configured in ignored local environment settings. Anonymous table reads were denied on 2026-10-15; authenticated two-user testing is still pending.

## Connect a development project
1. Create a Supabase project. Save its database password privately; it is not needed in the mobile app.
2. For a **new** project, run `npm run db:prepare`, then run `supabase/generated/new-project-setup.sql` in the Supabase SQL editor. This transaction includes rounds, private avatars, profiles, friendships and shared scorecards, with their access policies. Do not run the combined file against an existing installation; apply only pending files from `supabase/migrations/` there.
3. Keep email confirmation enabled. Set minimum password length to 12 and require uppercase/lowercase letters, digits and symbols in Auth settings. Configure your SMTP sender for real users; default test email delivery may be restricted.
4. Default confirmation and recovery email links are supported on the Account route. Add the exact URL returned by `Linking.createURL("account")` to Supabase Authentication → URL Configuration → Redirect URLs. Expo Go uses the current development host plus `/--/account`; installed apps use `fairway://account`; web uses the site origin plus `/account`. Update the allowed development URL whenever the tunnel changes. Keep the default templates: editing them is not needed for this flow. If custom SMTP/templates later include `{{ .Token }}`, manual codes remain supported. Test actual email delivery and both link flows before release.
5. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`, using the project's public settings. Never put a service-role/secret key or database password in an `EXPO_PUBLIC_` variable. The public key depends on RLS for authorization.
6. Restart Expo after changing environment values. Rebuild the website and configure the same public values in its build environment. The server serves `/account` as a web route.

## Behaviour
- Browsing and local guest play remain available without login. Account screen supports signup, login, verification/resend, password recovery, logout and confirmed account deletion.
- Native sessions use Expo SecureStore; web sessions persist in browser storage and survive reloads. The web version remains booking-only.
- Authenticated rounds are fetched from the database, and updates/deletes are explicitly scoped to the current user. RLS additionally enforces ownership on the server. Signing into another user remounts round state.
- Guest rounds remain in the original device storage key. They are not automatically imported into any account. Explicit guest-to-account migration is not implemented yet.
- Saves are serialized and use changed-round upserts plus explicit deletions. A stale list cannot delete unseen rounds created by another device. Concurrent edits of the *same* round currently use last-write-wins; realtime collaboration and offline synchronization are not implemented.
- Failed loads prevent starting a round until Retry succeeds. Failed saves display an error and offer Retry on setup; keep the app open until saved. Unsaved changes are not a durable offline queue.
- Deleting an account removes its cloud rounds by foreign-key cascade. It does not delete separate guest rounds.

## Verify before release
Run `npm run typecheck`, `npx expo lint --no-cache`, `npm test`, and native/web exports.

Create two confirmed test accounts in a separate development Supabase project. Supply the public configuration plus `TEST_USER_A_EMAIL`, `TEST_USER_A_PASSWORD`, `TEST_USER_B_EMAIL`, and `TEST_USER_B_PASSWORD` through an ignored environment file or process environment, then run:

```sh
node --env-file=.env.local scripts/check-account-isolation.mjs
```

The script writes uniquely named temporary rounds and checks owner access, anonymous denial, and cross-account read/write/delete denial. It removes its test data afterward. Do not run it against production accounts.

Physical-device acceptance: signup email code, invalid/expired code, resend throttling, login after restart, password reset, logout/account switch, score save across devices, failed network retry, history deletion and account deletion. These checks have NOT yet been run against a live project. Check account deletion in a disposable account separately.

Supabase setup reference: https://supabase.com/docs/guides/auth/quickstarts/react-native
Email templates: https://supabase.com/docs/guides/auth/auth-email-templates

## Profile photos and favourites (October 13)
Apply `supabase/migrations/202610130001_avatars.sql` after the rounds migration. It creates a private 3 MB image bucket with owner-folder read/write policies. Photos use expiring signed URLs; no public bucket is used. Configure the Auth Site URL to the deployed Fairway website for email-change confirmations; keep secure email change enabled. Email changes are pending until the provider's confirmation instructions are completed.

Favourite course IDs and the avatar object path are saved in the user's profile metadata. Guest favourites use their own device key and are never automatically imported. Account deletion removes the user's stored avatar files before deleting the account. Verify photo pick/upload, ownership denial, replacement and deletion using disposable accounts before release. These live checks are pending project setup.

## Friends and shared rounds (October 14)
Apply `supabase/migrations/202610140001_friends.sql` after both earlier migrations. It adds private player profiles, username-based friend requests (after the username migration), recipient-only acceptance, completed-round invitations and opt-in friend performance summaries. Default table grants are revoked before granting only the required operations. The app never receives a privileged database key.

Players can select accepted friends in Play → Players. The scorer uploads their completed round, then sends invitations identifying each linked scorecard. The recipient explicitly accepts in Games → Friends; a database function copies only their own player scorecard into their account history. Incomplete or discarded rounds never create invitations. Guests remain device-only. Removing a friend stops performance-summary access. Already accepted scorecards are independently owned by their recipients.

Pending live validation: two-user request/accept/remove, caller spoofing, direct status/ownership mutations, nonfriend invitation rejection, anonymous denial, incomplete scorecard rejection, repeated acceptance idempotency, account deletion cascade, disabled sharing, and cross-device history refresh. A hosted project is connected; the username-search migration is still missing as of October 16. Authenticated behaviour remains pending runtime tests.

## Default email link flow (October 15)
Signup and resend request the Account callback URL. Users may confirm in email and return to sign in manually, or complete the session through the callback. Password recovery imports the provider-issued session and opens the new-password form. The callback parser checks destination and token completeness; Supabase validates the actual session. Web fragments are removed after parsing. Do not log or share callback URLs containing tokens.

Default Supabase delivery is restricted to organization team addresses (currently two emails/hour). It does not enable public signup email delivery. No team membership should be granted merely to make an ordinary tester eligible for email. General users require a configured sender. Live email delivery, redirect allowlisting and password recovery remain pending; passing local tests does not verify those external settings.

## Current audit
See [October 16 capstone readiness](CAPSTONE-READINESS.md) for the observed hosted state, pending migrations and exact current callback URLs. This supersedes earlier setup-status notes. `npm run db:check-public` performs a read-only anonymous-access check; it is not a substitute for two-user isolation tests.

## Username sign-in
The shared account form accepts username or email. Email continues directly through Supabase Auth. Username sign-in calls `username-login`, which privately resolves the current username, verifies the password through Supabase Auth, and returns session tokens only. The client never receives another player's email. Unknown handles and rejected credentials use the same response. Resolution limits each handle to 20 attempts per 15-minute window, including unknown handles.

Deployment required before username login works:
1. Apply `supabase/migrations/202610160005_username_login.sql` after the existing username migrations.
2. Deploy with `npx supabase functions deploy username-login --project-ref wakpwbtspwufuvpctgfp --no-verify-jwt` from this project after CLI login. Login must be callable without a user session; password verification happens inside the function. Supabase supplies the server credentials automatically. Never put a service-role key in an Expo environment variable.
3. Verify a real confirmed account using username, uppercase username, email, wrong password, and renamed username on web and native. Hosted deployment and real-account acceptance are still pending.

Signup and password reset continue to require email. This implementation follows Supabase's password authentication and Edge Function secrets documentation: https://supabase.com/docs/reference/javascript/auth-signinwithpassword and https://supabase.com/docs/guides/functions/secrets .

## October 18 deployment update
Username search, trigger permissions and username-resolution migrations are now applied, and username-login is deployed. Public publishable-key requests reached the handler and both invalid input and nonexistent-user checks returned 401. The legacy JWT setting was not changed because the deployed gateway already permits these requests. This supersedes the earlier missing-deployment notes; successful real-user login, email delivery and two-user acceptance are still pending.
