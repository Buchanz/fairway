# Course layout audit

Generated from the bundled data. Geometry checks do not verify real tee positions, selected tee colours, routing, or map imagery. No coordinates are invented to make a check pass.

| Course | Layout | Review status |
|---|---|---|
| Cordova Bay — Bay Course | 18 holes | Geometry checks pass; physical tee accuracy requires review |
| Cordova Bay — Ridge Course | Manual map | Published tee card added; numbered GPS routing still required |
| Bear Mountain — Mountain Course | 18 holes | Geometry checks pass; physical tee accuracy requires review |
| Bear Mountain — Valley Course | 18 holes | Geometry checks pass; physical tee accuracy requires review |
| Royalwood | 18 holes | Geometry checks pass; physical tee accuracy requires review |
| Langley Golf Centre | 18 holes | Geometry checks pass; physical tee accuracy requires review |
| Ardmore | 9 holes | Geometry checks pass; physical tee accuracy requires review |
| Mount Douglas | 9 holes | Geometry checks pass; physical tee accuracy requires review |
| Duncan Meadows | 18 holes | Geometry checks pass; physical tee accuracy requires review |
| Olympic View | 18 holes | OSM reference routing and sourced tee cards; colour-specific GPS positions require review |
| Highland Pacific | 18 holes | Geometry checks pass; physical tee accuracy requires review |
| Cedar Hill | 18 holes | Geometry checks pass; physical tee accuracy requires review |

Public OSM inspection for the Ridge course on October 18 found its course boundary (way 117596878), but no complete numbered nine-hole routing. Missing holes have not been fabricated. Duncan Meadows and other OSM-derived layouts still require an aerial/official-map comparison and physical confirmation of tee colours.

## October 21 tee-card review

Olympic View's Gold, Silver, Bronze and Black per-hole yardages were added from the club's official hole-by-hole guide and scorecard. The bundled OSM paths provide a reference tee-to-green line; they do not claim a surveyed coordinate for every colour tee or a current pin location. See the [official hole-by-hole guide](https://www.olympicviewgolf.com/golf_course/hole_by_hole) and [official scorecard](https://www.olympicviewgolf.com/resources/webcontent/olympic_view/ov_scorecard.pdf).

Cordova Bay Ridge now has Back and Front tee-card yardages from the published GolfTraxx scorecard. The public OSM extract contains the Ridge course boundary but no complete numbered hole routing, so the app keeps Ridge in manual-map mode until a reliable numbered GPS source or course-provided map is available. Bay-course geometry is not reused for Ridge. See the [Ridge scorecard](https://golftraxx.com/scorecard?course_name=Cordova+Bay+Golf+Course%2C+Ridge&static=true&zipcode=V8Y2L3).

## October 21 — Lower Mainland and Fraser Valley catalogue expansion

Poppy Estate (Aldergrove), Belmont (Langley), Delta Golf Course (Delta) and Sandpiper Golf Course (Harrison Mills) are now available in Play and course search, including published 18-hole tee-card yardages. Their booking links are retained for course information, but no live tee-time provider is claimed yet.

The four entries intentionally remain in manual-map mode. The available public pages and scorecards establish the course identity and tee distances, but they do not provide a complete, independently checked set of numbered GPS tee/green paths. The app therefore allows course selection, tee selection and scorekeeping without displaying fabricated rangefinder geometry. Add each course to `src/data/hole-layouts.ts` only after a course map or aerial review produces reproducible numbered paths and source attribution.

Sources: [Poppy Estate](https://www.poppygolf.ca/contact) and [Poppy tee card](https://www.golfify.io/courses/poppy-estate-golf-course); [Belmont](https://www.belmontgolf.com/) and [Belmont tee card](https://yardsgolfbook.com/courses/british-columbia/belmont-golf-course); [Delta facility](https://deltagolfcourse.com/our-facility/) and [Delta tee card](https://www.golfify.io/courses/delta-golf-course); [Sandpiper resort golf page](https://sandpiperresort.ca/bc-golf-trip/) and [Sandpiper tee card](https://yardsgolfbook.com/courses/british-columbia/sandpiper-golf-course).
