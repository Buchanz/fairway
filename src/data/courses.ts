export type Point = { latitude: number; longitude: number };
export type Course = { id: string; name: string; municipality: string; region: string; holes: number; location: Point; bookingUrl: string; sourceUrl: string; provider: string; availability: 'not-connected' | 'live' };
// Coordinates extracted from the Google Maps destination links on official course pages, 2026-09-26.
export const courses: Course[] = [
  {"id": "cordova-bay", "name": "Cordova Bay \u2014 Bay Course", "holes": 18, "municipality": "Saanich", "region": "vancouver-island", "location": {"latitude": 48.5310809, "longitude": -123.3728864}, "bookingUrl": "https://www.cordovabaygolf.com/golf/", "sourceUrl": "https://www.cordovabaygolf.com/golf/", "provider": "Not connected", "availability": "not-connected"},
  {"id": "cordova-ridge", "name": "Cordova Bay \u2014 Ridge Course", "holes": 9, "municipality": "Saanich", "region": "vancouver-island", "location": {"latitude": 48.53047276, "longitude": -123.37658190857144}, "bookingUrl": "https://www.cordovabaygolf.com/golf/", "sourceUrl": "https://www.cordovabaygolf.com/golf/", "provider": "Not connected", "availability": "not-connected"},
  {"id": "bear-mountain", "name": "Bear Mountain \u2014 Mountain Course", "holes": 18, "municipality": "Langford", "region": "vancouver-island", "location": {"latitude": 48.4783463, "longitude": -123.5316753}, "bookingUrl": "https://bearmountain.ca/recreation/golf/", "sourceUrl": "https://bearmountain.ca/recreation/golf/", "provider": "Not connected", "availability": "not-connected"},
  {"id": "bear-valley", "name": "Bear Mountain \u2014 Valley Course", "holes": 18, "municipality": "Langford", "region": "vancouver-island", "location": {"latitude": 48.4792692, "longitude": -123.5295793}, "bookingUrl": "https://bearmountain.ca/recreation/golf/", "sourceUrl": "https://bearmountain.ca/recreation/golf/", "provider": "Not connected", "availability": "not-connected"},

  // Approximate course centre: OpenStreetMap way 25311768, https://mapcarta.com/W25311768.
  {id:'royalwood',name:'Royalwood',municipality:'Chilliwack',region:'lower-mainland',holes:18,location:{latitude:49.11972,longitude:-122.08945},bookingUrl:'https://www.tee-on.com/PubGolf/servlet/com.teeon.teesheet.servlets.golfersection.ComboLanding?CourseCode=RYWD&FromCourseWebsite=true',sourceUrl:'https://royalwoodgolf.com/',provider:'Tee-On',availability:'live'},
  // Approximate course centre: OpenStreetMap way 808599734, https://mapcarta.com/W808599734.
  {id:'langley-golf-centre',name:'Langley Golf Centre',municipality:'Langley',region:'lower-mainland',holes:18,location:{latitude:49.07977,longitude:-122.6275},bookingUrl:'https://www.tee-on.com/PubGolf/servlet/com.teeon.teesheet.servlets.trail.TrailSearch?CourseGroupID=11665&CourseCode=LANB&FromCourseWebsite=true',sourceUrl:'https://www.langleygolfcentre.com/golf-rates-and-online-bookings',provider:'Tee-On',availability:'live'},
  // Approximate course centre from OpenStreetMap way 151269713 (via Mapcarta).
  {id:'ardmore',name:'Ardmore',municipality:'North Saanich',region:'vancouver-island',holes:9,location:{latitude:48.63526,longitude:-123.4621},bookingUrl:'https://www.tee-on.com/PubGolf/servlet/com.teeon.teesheet.servlets.golfersection.ComboLanding?CourseCode=ARDM&FromCourseWebsite=true',sourceUrl:'https://www.ardmoregolfcourse.com/',provider:'Tee-On',availability:'live'},
  // Coordinates from the official site's Google Maps destination.
  {id:'mount-douglas',name:'Mount Douglas',municipality:'Saanich',region:'vancouver-island',holes:9,location:{latitude:48.48088,longitude:-123.3529043},bookingUrl:'https://www.tee-on.com/PubGolf/servlet/com.teeon.teesheet.servlets.trail.TrailSearch?CourseCode=MTDG&CourseGroupID=11763&FromCourseWebsite=true',sourceUrl:'https://mountdouggolf.ca/tee-times/',provider:'Tee-On',availability:'live'},
  // Public booking-provider clubhouse coordinates, verified 2026-10-02.
  {id:'duncan-meadows',name:'Duncan Meadows',municipality:'Duncan',region:'vancouver-island',holes:18,location:{latitude:48.8077293,longitude:-123.7539486},bookingUrl:'https://chrono.golf/en/club/duncan-meadows',sourceUrl:'https://www.duncanmeadows.com/',provider:'Chronogolf',availability:'not-connected'},
  // Lower Mainland courses added from their published course pages and scorecards.
  {id:'poppy-estate',name:'Poppy Estate Golf Course',municipality:'Aldergrove',region:'lower-mainland',holes:18,location:{latitude:49.0700,longitude:-122.5319},bookingUrl:'https://www.poppygolf.ca/',sourceUrl:'https://www.poppygolf.ca/contact',provider:'Not connected',availability:'not-connected'},
  {id:'belmont',name:'Belmont Golf Course',municipality:'Langley',region:'lower-mainland',holes:18,location:{latitude:49.1560,longitude:-122.5947},bookingUrl:'https://www.belmontgolf.com/',sourceUrl:'https://www.belmontgolf.com/',provider:'Not connected',availability:'not-connected'},
  {id:'delta-golf',name:'Delta Golf Course',municipality:'Delta',region:'lower-mainland',holes:18,location:{latitude:49.100899,longitude:-122.896202},bookingUrl:'https://deltagolfcourse.com/book/',sourceUrl:'https://deltagolfcourse.com/our-facility/',provider:'Not connected',availability:'not-connected'},
  {id:'sandpiper',name:'Sandpiper Golf Course',municipality:'Harrison Mills',region:'fraser-valley',holes:18,location:{latitude:49.2573,longitude:-121.9463},bookingUrl:'https://sandpiperresort.ca/bc-golf-trip/',sourceUrl:'https://sandpiperresort.ca/bc-golf-trip/',provider:'Not connected',availability:'not-connected'},
  // Approximate clubhouse location: https://www.where2golf.com/canada-bc-alberta/olympic-view-golf-club/
  { id: 'olympic-view', name: 'Olympic View', municipality: 'Greater Victoria', region: 'vancouver-island', holes: 18, location: { latitude: 48.404039, longitude: -123.518975 }, bookingUrl: 'https://olympicviewgolf.totaleintegrated.com/Book-a-Tee-Time', sourceUrl: 'https://www.olympicviewgolf.com/about/location', provider: 'Total e Integrated', availability: 'live' },
  { id: 'highland-pacific', name: 'Highland Pacific', municipality: 'View Royal', region: 'vancouver-island', holes: 18, location: { latitude: 48.4659624, longitude: -123.4524042 }, bookingUrl: 'https://www.highlandpacificgolf.com/golf/book-online/', sourceUrl: 'https://www.highlandpacificgolf.com/contact/', provider: 'Tee-On', availability: 'not-connected' },
  { id: 'cedar-hill', name: 'Cedar Hill', municipality: 'Saanich', region: 'vancouver-island', holes: 18, location: { latitude: 48.4549, longitude: -123.3449999 }, bookingUrl: 'https://admin.teeon.com/portal/lakeland/teetimes/cedarhill', sourceUrl: 'https://www.saanich.ca/en/main/parks-recreation-community/cedar-hill-golf-course.html', provider: 'Tee-On', availability: 'live' },
];
// Approximate town centres, used as search origins rather than municipal boundaries.
export const cities = [
  { name: 'Victoria', latitude: 48.4284, longitude: -123.3656 },
  { name: 'Langford', latitude: 48.4486, longitude: -123.5058 },
  { name:'Duncan',latitude:48.7787,longitude:-123.7079 },
  { name: 'Chilliwack', latitude:49.171, longitude:-121.9526 },
  { name: 'Langley', latitude:49.1044, longitude:-122.6604 },
  { name: 'Vancouver', latitude:49.2827, longitude:-123.1207 },
  { name: 'Nanaimo', latitude:49.1659, longitude:-123.9401 },
  { name: 'Sidney', latitude: 48.6500, longitude: -123.3980 },
  { name: 'Aldergrove', latitude: 49.0580, longitude: -122.4920 },
  { name: 'Delta', latitude: 49.0847, longitude: -123.0586 },
  { name: 'Harrison Mills', latitude: 49.2573, longitude: -121.9463 },
];
