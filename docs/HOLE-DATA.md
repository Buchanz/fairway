# Cedar Hill hole geometry

Retrieved October 8, 2026 from the OpenStreetMap API:
https://api.openstreetmap.org/api/0.6/map?bbox=-123.351,48.448,-123.338,48.463

The bundled `src/data/cedar-holes.json` contains 18 numbered `golf=hole` ways, their pars, ordered coordinates and original way IDs. It is derived from © OpenStreetMap contributors, licensed under the Open Database License (ODbL): https://www.openstreetmap.org/copyright and https://opendatacommons.org/licenses/odbl/1-0/ . Preserve attribution and the license when distributing this derived data.

OpenStreetMap's hole-path convention runs from tee to green: https://wiki.openstreetmap.org/wiki/Tag:golf=hole . We interpret the first and last path nodes as reference tee/green positions, not a selected tee colour, surveyed green centre or current flag location. Straight-line measurements are approximate horizontal yardages. Mapped green boundaries are bundled where the hole endpoint falls inside exactly one source green polygon; coverage is described below. The numbered paths, regional bounds and plausible lengths are validated by tests; on-course accuracy and native camera framing still require physical-device verification.

Camera bearing points toward the mapped green and its bounds include intermediate path vertices for doglegs. Apple camera altitude and Google zoom are calculated from available viewport size. Manual gestures remain available; the recenter control restores hole framing. Other courses retain the manual-target map until their hole data is connected.

## October 9 additions
Olympic View and Royalwood each have 18 complete numbered paths, retrieved from the primary OpenStreetMap API using bounds `-123.535,48.392,-123.505,48.416` and `-122.103,49.110,-122.076,49.130`. They share the attribution, ODbL license and accuracy limitations above. Royalwood's source has no pars, so the interface does not invent them.

The downloaded areas for Ardmore (`-123.470,48.630,-123.455,48.641`), Mount Douglas (`-123.357,48.477,-123.344,48.487`) and Langley (`-122.635,49.073,-122.619,49.086`) contained no golf=hole ways. These courses retain manual target mode until another reliable numbered layout is available.

## Green yardage card — October 9
Mapped green polygons from those same source downloads are linked by containment to 6 Cedar Hill holes, all 18 Olympic View holes, and 17 Royalwood holes. Source green way IDs are preserved. Missing boundaries display a dash for front/back rather than an assumed green depth. Center remains the reference hole endpoint, not a surveyed center or live pin position.

Front/back yardages intersect the player-to-reference-center line with the polygon edges. A fresh GPS position is used even when the player is off-course. When GPS is unavailable or older than 30 seconds, measurements explicitly switch to “Tee preview.” Initial targets remain halfway along the mapped playing line and can be moved; they are not personalized shot recommendations.

## Mt Doug image-based pilot — October 10
Mt Doug now has nine approximate image-reviewed tee-to-green paths, derived from the official routing diagram and Saanich's georeferenced May 2025 aerial. This supersedes manual-only status for Mt Doug, but is not field verification. Source controls, review notes and a local mapping editor are in `tools/course-mapping/`. The app labels the dataset as a pilot, attributes these sources separately from OpenStreetMap, and leaves front/back blank. Hole 2's tee candidate needs particular review (71 mapped yards versus 85 scorecard yards). Standard mat scorecard distances total 1,519 yards. For 18-hole rounds the same nine physical holes are reused.

## October 15 — Island expansion, first batch
Play now includes the course catalogue independently of booking-feed availability. Added separate Cordova Bay Bay/Ridge and Bear Mountain Mountain/Valley entries. Highland Pacific and Duncan Meadows are now selectable too.

New OSM-derived 18-hole datasets: Highland Pacific (12 green boundaries), Cordova Bay Bay (10), Bear Mountain Mountain (11), Bear Mountain Valley (6). Endpoints are mapped reference tees/greens, not surveyed tee colours or daily flags. All 72 paths have unique numbering, plausible lengths and valid camera geometry; physical-device/on-course verification remains outstanding. Duncan Meadows and Ridge have no complete numbered routing in the inspected extracts and remain explicitly labelled manual-map options.

Source extracts (2026-10-15): https://api.openstreetmap.org/api/0.6/map?bbox=-123.48,48.45,-123.435,48.485 ; https://api.openstreetmap.org/api/0.6/map?bbox=-123.39,48.51,-123.35,48.55 ; https://api.openstreetmap.org/api/0.6/map?bbox=-123.56,48.47,-123.51,48.505 ; https://api.openstreetmap.org/api/0.6/map?bbox=-123.55,48.455,-123.52,48.48 . Bear course identities validated by containment: all 18 Mountain tees inside relation 2045136, all 18 Valley tees inside relation 6103426, with zero cross-matches. Source way IDs retained. © OpenStreetMap contributors, ODbL (license links above).

Reusable offline importer: tools/course-mapping/island/import-osm.py. Rejects missing/duplicate hole numbering; attaches green outlines only on unique endpoint containment. Official-site course photos visually inspected and bundled; source links retained in course-photos.ts. Image publication rights still need resolution before public/store release. This is the first southern-Island batch, not complete Island coverage.

### Tee options audit — 2026-10-15
Course-specific tee options in `src/data/tees.ts` now cite official cards/guides for Olympic View, Royalwood, Highland Pacific, Cordova Bay, Ardmore, Duncan Meadows, both Bear Mountain courses and Langley. Existing Cedar Hill and Mount Douglas data are retained. Olympic View's currently linked card uses Gold, Silver, Bronze and Black plus combination sets; older third-party listings use different names. Highland's current table includes Green Combo, Silver and Family.

Cordova Ridge's tee labels remain unverified and retain manual entry. Duncan's official hole guide shows Blue/White/Green; this is not a guarantee that every tournament/composite setup is covered. Named Bear Mountain tees retain their names; neutral styling avoids guessing marker colours from bear names. Combination labels remain explicit. New options without verified per-hole yardages use empty arrays, never fabricated distances. Tee selection changes the marker's appearance, not its coordinate: daily tee locations still require field verification.

Hole camera transitions now ease over 1.4 seconds, take the shortest rotation across north, cancel on a new hole/pan/unmount, and respect Reduce Motion. iOS Fabric ignores the native animation duration, so the transition uses cancellable camera frames. The target yardage is a native glass overlay outside map marker snapshots, with normal solid fallback on unsupported devices.

## Duncan Meadows reference pilot — October 16
Added 18 numbered tee/green pairs reviewed against the official overview at https://www.duncanmeadows.com/the-course (overview asset: https://static.wixstatic.com/media/075720_9490304c225040349d3e8be8aaf66508~mv2.jpg). Polygon coordinates from https://api.openstreetmap.org/api/0.6/map?bbox=-123.77,48.80,-123.74,48.825, retrieved October 16. The extract has unnumbered tees/greens; the explicit reviewed numbering is in tools/course-mapping/duncan/build.py, with the source extract retained for reproducibility. Coordinates are polygon vertex averages, not surveyed flag locations. Green boundaries retain OSM way IDs. © OpenStreetMap contributors, ODbL.

These are straight reference tee-to-green paths, not surveyed playing lines or colour-specific tees. Pars are left null. The pilot label remains visible until physical-device/on-course verification. Ardmore, Langley Golf Centre and Cordova Ridge still lack complete reviewed layouts; they are not silently assigned fabricated geometry.

### October 16 reference review

- Duncan: corrected reference pads on 6, 10, 11, 13, 15 and 16. The official illustrated guides for holes 1–6 support separate Blue/White/Green positions, now selected by the round's tee ID. Holes 7–18 still use reference pads, not verified colour-specific positions. The official overview scorecard provides pars for all 18. Sources: https://www.duncanmeadows.com/the-course and its published illustrated hole guides. OSM polygon centroids remain approximate; daily markers may move.
- Ardmore: nine numbered pilot paths, with doglegs on 2 and 7, reviewed against the official routing diagram and CRD orthophoto. Nine-hole routing repeats on an 18-hole round. https://www.ardmoregolfcourse.com/our-course.html ; https://mapservices.crd.bc.ca/arcgis/rest/services/Ortho/MapServer
- Langley Golf Centre: 18 pilot paths reviewed against its 2024 numbered routing diagram and municipal 2025 imagery. The published diagram is south-up; coordinates were mapped north-up with 44th Avenue north and 216th Street east. https://www.langleygolfcentre.com/golf-rates-and-online-bookings ; https://maps.langleycity.ca/server/rest/services/Maps/Imagery2025/MapServer
- Reproducible pixel controls and returned image extents are in `tools/course-mapping/reviewed/build.py`. These are manually reviewed reference positions, not surveyed points. No green boundaries, daily pin positions or per-colour markers are invented for Ardmore/Langley.
- Cordova Ridge remains pending a reliable numbered routing reference; Bay-course OSM holes must not be used for the Ridge.
