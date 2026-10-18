# Remaining provider access for Fairway

Updated October 3, 2026. No outreach has been sent.

| Provider | Courses | Verified obstacle | Needed to finish |
| --- | --- | --- | --- |
| Tee-On | Highland Pacific (HIPA, group 10062) | Normal guest browser flow works; backend receives ALTCHA verification, including through guest entry. | Supported read-only guest feed or provider-approved automated access for HIPA. |
| Club Prophet | Cordova Bay and Ridge | Both booking hosts and the application's configuration endpoint return HTTP 403 browser verification to the backend. Bay opens in a normal browser. | Supported availability endpoint, both facility identifiers, guest authentication, refresh limits and booking windows. |
| Lightspeed / Chronogolf | Duncan Meadows (club 18963, course 23175) | Existing public availability request fails from the backend. Experimental parser remains disabled. | Supported public availability access, visitor rates and booking horizon. |
| Lightspeed / Chronogolf | Bear Mountain (club 18371, Mountain 21565, Valley 21566) | Newer public profile and metadata are accessible; related application requests receive Cloudflare blocks. Inventory not verified. | Supported access for both sheets, public/resident rate distinctions, mandatory fees and booking windows. |

## Unsent request to each provider/course

Hello,

I’m building Fairway, a mobile-first golf tee-time discovery app for Vancouver Island, initially as a software-course capstone. We want to display your courses alongside other local courses and send golfers to your booking system to complete their reservations.

Could you provide documentation or direct me to the contact for a supported read-only availability integration? We need course identifiers, bookable dates and times, allowed group sizes, round lengths, public prices and mandatory fees, and booking links. Please confirm authentication requirements, permitted refresh frequency, display/attribution requirements, and whether an API key, course authorization, or server allowlisting is needed. A sandbox would also help.

We do not need customer records, golfer passwords, payment access, or reservation creation for this phase.

Thank you.

## Official contacts

- Tee-On: https://www.teeon.com/ — support@teeon.com.
- Club Prophet integrations: https://www.clubprophet.com/integrations
- Cordova Bay: https://www.cordovabaygolf.com/online-booking/ — info@cordovabaygolf.com.
- Lightspeed Golf integrations: https://www.lightspeedhq.com/golf/integrations/

If issued, provider credentials belong in server environment variables, never the repository or frontend. No verification challenges were bypassed and no browser sessions were exported.
