# Mt Doug mapping pilot

`mount-douglas.json` is the editable source: image extent, source URLs, pixel control points, hole number, par and published yardage. `review.html` loads the municipal aerial for visual inspection and supports dragging existing points and exporting the edited draft. It does not publish changes automatically. Replace the draft after reviewing the export, then run `node tools/course-mapping/build.mjs` from the project root to regenerate the bundled coordinates. Do not change the reference image extent without recalibrating every point.

Sources inspected October 10, 2026:
- Official routing: https://mountdouggolf.ca/wp-content/uploads/2025/05/5x7-Scorecard-Front-Final-V2.png
- Official scorecard: https://mountdouggolf.ca/wp-content/uploads/2025/05/5x7-Scorecard-Inside-Final-V4.png
- Saanich May 2025 orthophoto: https://map.saanich.ca/server/rest/services/RASTERS/Orthophoto2025/ImageServer

Aerial response extent was WGS84 (-123.355, 48.4797, -123.3455, 48.4837), 1900 × 1200 pixels. Latitude decreases down the image; longitude increases to the right. The illustrated scorecard was used for routing only, not as a scaled geographic map. Native provider imagery is still used in the app; the aerial reference itself is not bundled.

This is an image-reviewed pilot, not a surveyed, course-approved or field-verified dataset. No green boundaries or front/back yardages are inferred. After user review, holes 1 and 2 were corrected using closer aerial inspection: hole 1 to the rectangular mat beside the clubhouse path, hole 2 to the teeing pad beside the creek crossing. Current straight-line estimates are 222 and 93 yards respectively, versus published 217 and 85. Both remain pending field confirmation; lengths were not used to fabricate positions. Do not move points merely to force agreement with scorecard yardages. The course scorecard lists one set of supplied mats, par 31 and 1,519 yards; no invented colour tees.

Before treating this as production-quality mapping, verify each numbered mat and green on site (or with course staff), review current geometry and applicable source reuse terms, and replace the pilot status. The current app clearly identifies the pilot. Holes 10–18 reuse physical holes 1–9 for a second circuit.
