# Greater Victoria course coverage audit

Verified 2026-09-28. A course having an online booking page does not mean Fairway has a reliable availability integration. No accounts, bookings, provider outreach or CAPTCHA bypasses were performed.

| Course | Official source / booking provider | Evidence and current status | Next step |
|---|---|---|---|
| Cedar Hill | [Saanich](https://www.saanich.ca/EN/main/parks-recreation-community/cedar-hill-golf-course.html), Tee-On Cloud facility 503 | Public guest inventory confirmed. Available 9-hole and 18-hole rounds are normalized separately; 18-hole capacity accounts for the return nine. Booking opens five days ahead at 6pm Vancouver time. | Keep comparing live results with the provider; request supported integration access before wider deployment. |
| Olympic View | [Booking page](https://olympicviewgolf.totaleintegrated.com/Book-a-Tee-Time), Total e Integrated | Existing same-day HTML adapter retained in the market snapshot. Current public page returns no recognized tee-time list; date-search experiment did not produce confirmed results. Treated as unavailable, not sold out. | Obtain a supported date-specific feed or verify the public search contract. |
| Cordova Bay — Bay and Ridge | [Official booking page](https://www.cordovabaygolf.com/online-booking/), Club Prophet | Separate official Bay/Ridge destinations. Bay server request returned a browser-verification page. Not connected. | Course/provider-approved availability access. |
| Highland Pacific | [Official booking page](https://www.highlandpacificgolf.com/golf/book-online/), legacy Tee-On (HIPA) | Official guest link verified. Prior automated-access challenge remains an integration blocker. Public page distinguishes 7-day standard and 10-day HP Club advance access. Not connected. | Supported guest feed; preserve membership restrictions. |
| Bear Mountain — Mountain and Valley | [Official booking page](https://bearmountain.ca/recreation/golf/book-online/), Chronogolf club 18371 | Official widget and public browser page verified. Server requests to profile/widget returned blocked pages. Not connected. | Lightspeed/Chronogolf integration access. Resident/nonresident prices must not be conflated. |
| Metchosin | [Official website](https://metchosingolfcourse.com/), Chronogolf club 761 | Official widget configuration verified; 9-hole course. No live adapter verified. | Evaluate approved Chronogolf access alongside Bear Mountain. |
| Ardmore | [Official website](https://www.ardmoregolfcourse.com/), legacy Tee-On | Official booking link confirmed. No guest inventory integration verified. | Evaluate supported legacy Tee-On access alongside Highland Pacific. |

## What the app currently promises

- Cedar Hill is the only verified upcoming-date integration. Olympic View is an existing same-day adapter, not a newly completed integration.
- Missing or failed sources never produce fictional rows or imply a course is sold out.
- UI filters use exact supported player counts, selected holes, local tee-off time, chosen date, radius, and optional maximum known price. Unknown prices are excluded when a price ceiling is selected.
- Booking remains on the provider website. Cedar Hill's handoff preserves the tee-time ID and date through its login route; party size, holes, final price and actual reservation must still be confirmed there.
- No third-party account linking is implemented. No golfer passwords are collected.

## Remaining capstone milestones

1. Obtain reliable access for at least two further course feeds, validating fields and booking windows against the providers.
2. Verify native builds on a real phone with a reachable API URL; local browser preview is not public deployment.
3. Add operational monitoring and deployment configuration; preserve freshness/error behavior and review provider terms before public launch.
4. Continue weekly devlog and final README/demo documentation.

## Recheck — 2026-10-02

- Olympic View returned live same-day inventory. Its per-time player dropdowns offered 2, 3, and 4 (or only 2), without a single-player option. Fairway now explains this when one-player search excludes the course; it does not invent bookable singles.
- Cordova Bay still returns Club Prophet browser verification. Highland Pacific public entry returns ALTCHA. Bear Mountain returns a Cloudflare block. These feeds remain unconnected.
- Duncan Meadows public profile: https://chrono.golf/en/club/duncan-meadows, club 18963, course 23175. Public affiliation 112653 has a seven-day window; course coordinates came from public organization metadata. Public course/product metadata and one read-only tee-time request succeeded, but the application runtime received HTTP 403 from the tee-time endpoint. The experimental adapter is disabled and the course is not listed as live. Supported provider access is required before enabling it; no challenge bypass was attempted.
- Experimental Duncan parser checks each party size independently, rejects capacity/frozen/restricted times, and never infers single-player eligibility from foursome inventory. Cached data expires after two minutes.

## 2026-10-03 integration update (supersedes the earlier limitations above)

- **Olympic View:** date-specific public ASP.NET searches now work. Read every date published by `.cusday .shortDateNew` rather than hardcoding a week. The current calendar spans October 3 through January 1. Exclude booking inputs and image-submit controls from search submissions. The source caps a search at 24 times: follow with overlapping hourly searches, merge by date/time, and retain exact offered player sizes. No reservation requests are submitted.
- **Mount Douglas:** new live Tee-On HTML integration through the official course booking link. Discover the eight dates in the public date strip, request each date, and parse each distinct 9/18-hole offer with its price and allowed group-size range. No user credentials or private API keys are needed. Official location: 48.48088, -123.3529043 from the course site's Google Maps link.
- Cedar Hill continues to follow its own public release window; do not extend it just because another course supports more dates.
- Snapshots refresh in the background. Olympic View uses two date workers, refreshes nearer dates more often, and expires results after ten minutes; a cold start progressively fills the full calendar. Other connected course results expire after two minutes. Failed requests do not become sold-out dates. Course checkout remains authoritative.
- The carousel now uses a virtualized horizontal list so the full advance inventory does not mount thousands of cards at once. The calendar offers only dates with confirmed matches for the selected filters.
- Booking remains a redirect. Olympic View and Mount Douglas currently require reselecting the time on the course site; Cedar Hill passes its tee-time ID. Authenticated checkout is not tested.
- Cordova Bay, Highland Pacific, Bear Mountain and Duncan Meadows are still not connected. No challenge bypasses were added.

## October 3 — Ardmore and remaining requested courses

Ardmore added using the shared Tee-On adapter (`server/teeon.mjs`). Live checks returned 12 offers on October 4 and 63 on October 13. Discounted offer IDs include a numeric suffix after the nine code; parser now preserves those records. Approximate course centre from OpenStreetMap way 151269713, via https://mapcarta.com/W151269713: 48.63526, -123.4621. Access can be intermittent; freshness limits still apply.

The other requested additions remain unconnected. Highland's browser flow works, but backend guest requests return ALTCHA. Both Cordova booking hosts/configuration requests return HTTP 403 verification. Duncan's backend availability request fails. Bear Mountain's newer profile is accessible (club 18371, Mountain 21565, Valley 21566), but related scripts are blocked and inventory is not verified. See PROVIDER-ACCESS.md for concrete unsent requests.


## 2026-10-04 — First mainland feeds
Connected Langley Golf Centre (LANB/11665) and Royalwood (RYWD/11953) through their official public guest Tee-On links. Verified every advertised date, October 4–11. Langley returned 915 offers across 9/18 holes; Royalwood returned 359 offers at verification time. Counts change as bookings occur. Langley explicitly leaves the price element blank, so only its configured adapter allows null prices; malformed prices still fail closed. No private API credentials are used.

Removed the Island-only geographic restriction; added Langley, Vancouver, Nanaimo and Chilliwack search origins. Select Langley with a 50 km radius to see both new courses. Existing Victoria defaults remain local. Booking redirects use the official provider and may require reselecting the time. Coordinates are approximate OpenStreetMap course centres (ways 808599734 and 25311768).

Official sources: https://www.langleygolfcentre.com/golf-rates-and-online-bookings and https://royalwoodgolf.com/ . Arrowsmith now links to TeeItUp; Cottonwood uses a different search flow; neither was enabled in this batch.
