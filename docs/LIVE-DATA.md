# Greater Victoria data access — 2026-09-26

## Verified directory sources
- Highland Pacific: https://www.highlandpacificgolf.com/contact/ and https://www.highlandpacificgolf.com/golf/book-online/
- Cedar Hill: https://www.saanich.ca/en/main/parks-recreation-community/cedar-hill-golf-course.html
- Course coordinates are the destination coordinates embedded in the official pages' Google Maps links, not guessed geocodes. Town origins are approximate central reference points.

Both courses link to Tee-On. Highland Pacific's public landing page identifies CourseCode=HIPA. A browser-facing public booking page is not evidence of an approved third-party API.

## Current integration status
No live availability has been retrieved or verified. No API credentials, accounts, bookings, or outbound messages were created. The public Tee-On pages reviewed did not expose documented third-party tee-time API access. This does not establish that no private partner API exists.

Tee-On contact: info@teeon.com / support@teeon.com; source https://www.teeon.com/support

## Questions for provider or course
Ask whether a student project can receive read-only availability for Highland Pacific and Cedar Hill; whether course consent is needed; available API/feed documentation and sandbox; cost and rate limits; permitted caching and redisplay; public versus member inventory; booking links and attribution requirements.

## Suggested inquiry (not sent)
Hello, I’m building a software-course capstone: a mobile and web app helping golfers discover public tee times around Greater Victoria. I’d like to show availability for Highland Pacific and Cedar Hill, with booking completed through the course’s existing website. Do you offer an approved read-only API or feed for this use? If so, could you share access requirements, whether each course must authorize it, documentation, pricing, and limits on caching or displaying availability? A small student/sandbox integration would be ideal. Thank you.

## Next integration milestone
Obtain provider confirmation, implement a server-side adapter, validate date/time-zone and group-size rules against the course site, store freshness timestamps, and distinguish empty availability from provider failures. Do not substitute fictional slots for a failed provider response.

## First working live connection — 2026-09-26
Olympic View public source: https://olympicviewgolf.totaleintegrated.com/Book-a-Tee-Time

The Express backend now retrieves and parses the public HTML on demand. Verified on 2026-09-26 against the rendered booking page: 4:33 PM / CAD 60 / 18 holes / allowed party sizes 2, 3, 4; 4:51 PM / CAD 55. These examples are verification evidence, not current inventory.

Scope: provider's default current day only. The live section is separate from the geospatial course directory. This is an experimental HTML integration, not an official provider API or partnership. Layout changes fail closed; an upstream failure is not treated as sold out. No login, reservation action, or challenge bypass is performed. Refresh uses a 60-second shared cache and coalesces concurrent requests; UI expires results after two minutes. Public deployment and native API configuration are pending.

Tee-On probe for Highland Pacific returned an ALTCHA automated-access challenge, so that connector was not implemented. Cedar Hill remains unconnected; no claim is made that its current page was independently tested.

Run `npx expo export --platform web` then `npm run server` for the combined web/API preview at http://localhost:8787. Native builds need EXPO_PUBLIC_API_URL set to a reachable backend base URL; this is a public URL, never a secret. The default server listens on loopback for local preview. Use appropriate hosting configuration for remote access.

## Cedar Hill connected — newer public Tee-On portal
The official Lakeland booking link now leads to https://admin.teeon.com/portal/lakeland/teetimes/cedarhill . Its public guest API is separate from Highland Pacific's legacy portal. Public facility lookup identifies Cedar Hill as facility 503. The guest tee-time endpoint returned real availability for 2026-09-27 and is now connected to the dashboard through the backend.
The guest header used here is the non-secret identifier published by Tee-On's own public JavaScript; no customer credentials or private API keys are used. This is an undocumented guest-web integration, not an official partnership. No challenge bypass or booking mutation was performed.
The connector shows 18-hole availability using the minimum remaining capacity of the outward and return tee times. Prices are not supplied by this response and remain unknown. Today, tomorrow, and in-two-days controls added. Olympic View still supports today only; unsupported dates are shown as such. Highland Pacific remains blocked on the legacy challenge flow.
Updated preview for this session: http://localhost:8788.
