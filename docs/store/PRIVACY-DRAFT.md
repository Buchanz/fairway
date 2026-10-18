# Fairway privacy disclosure draft — not ready to publish

Owner must supply the legal operator/contact, support address, launch date and final hosting/provider retention details before publication.

## Data used by the current build
- Email, username and profile name: authentication, recovery and friend discovery. Password verification is handled by Supabase Auth.
- Optional profile photo: stored in a private Supabase bucket; signed-in players can view the registered avatar through username search.
- Rounds and scores: stored against the signed-in account. Guest rounds stay on the device. Joined friends can receive their own completed scorecards.
- Friend relationships and invitations: used for group play and sharing.
- Foreground location: used on-device for nearby courses and GPS distances. Joining a group sends coordinates and a timestamp to Supabase to validate tee-flip proximity. Other members receive the shared result and activity count, not raw coordinates through the group API. Presence is deleted when a completed round is saved; abandoned rounds currently require retention cleanup before launch.
- Maps: Apple Maps on iOS and Google Maps on Android load imagery through their respective services. Audit their SDK disclosures before submitting store privacy forms.
- Booking: users leave Fairway for a provider's booking site; that provider handles its own login/payment and privacy practices.
- Infrastructure: hosting/Supabase may process IP addresses and operational logs. Confirm retention and final processors before publication.

## Deletion
Account → Delete account initiates deletion of the account and cloud records. The app removes owned avatar files first. Independently owned shared scorecards and guest-device data need clearly described handling. Test this with disposable users and publish an external deletion request route before Google Play submission.

## Store form preparation
Review identifiers, email/name, photos, precise/coarse location, other user content (scores) and diagnostics/network logs. Distinguish local-only processing from data transmitted off-device. Do not assert “no data collected” or “no tracking” without auditing the shipped SDKs and final server configuration.
