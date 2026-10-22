export type TeeSet={id:string;name:string;yardages:number[];sourceUrl:string};
// An empty yardage array means the tee names are verified but hole yardages are not.
function namedTees(names:string[],sourceUrl:string):TeeSet[]{return names.map(name=>({id:name.toLowerCase().replaceAll('/','-').replaceAll(' ','-'),name,yardages:[],sourceUrl}));}
// Published scorecard distances, not GPS coordinates or daily marker positions.
const cedarSource='https://www.golfify.io/courses/cedar-hill-golf-course';
export const courseTees:Record<string,TeeSet[]>={
 'olympic-view':[
  {id:'gold',name:'Gold',yardages:[331,290,501,136,263,238,284,346,390,273,138,240,413,325,284,106,351,475],sourceUrl:'https://www.olympicviewgolf.com/golf_course/hole_by_hole'},
  {id:'silver',name:'Silver',yardages:[367,317,540,149,346,202,317,397,462,304,159,322,520,397,363,121,366,516],sourceUrl:'https://www.olympicviewgolf.com/golf_course/hole_by_hole'},
  {id:'bronze',name:'Bronze',yardages:[331,290,421,136,263,238,284,346,390,273,138,240,413,325,284,106,351,475],sourceUrl:'https://www.olympicviewgolf.com/resources/webcontent/olympic_view/ov_scorecard.pdf'},
  {id:'black',name:'Black',yardages:[300,280,421,136,263,212,284,346,390,273,138,224,413,325,284,106,327,417],sourceUrl:'https://www.olympicviewgolf.com/resources/webcontent/olympic_view/ov_scorecard.pdf'},
 ],
 // Ridge publishes a 9-hole par-3 scorecard but does not publish numbered
 // GPS tee/green geometry. Keep the verified card distances available while
 // the map remains an explicit manual-map option in Play.
 'cordova-ridge':[
  {id:'back',name:'Back',yardages:[73,100,89,115,70,89,105,80,112],sourceUrl:'https://golftraxx.com/scorecard?course_name=Cordova+Bay+Golf+Course%2C+Ridge&static=true&zipcode=V8Y2L3'},
  {id:'front',name:'Front',yardages:[52,66,60,86,52,66,78,58,84],sourceUrl:'https://golftraxx.com/scorecard?course_name=Cordova+Bay+Golf+Course%2C+Ridge&static=true&zipcode=V8Y2L3'},
 ],
 'duncan-meadows':namedTees(['Blue','White','Green'],'https://www.duncanmeadows.com/the-course'),
 'royalwood':namedTees(['Gold','Blue','Blue/White','White','White/Green','Green','Green/Orange','Orange'],'https://royalwoodgolf.com/wp-content/uploads/2024/02/IMG_20240221_0001-2048x800.jpg'),
 // Published scorecard distances; GPS tee/green geometry is intentionally not
 // enabled until the course layout has been independently checked.
 'poppy-estate':[
  {id:'championship',name:'Championship',yardages:[398,141,287,287,202,186,190,125,350,313,328,166,290,207,173,275,199,386],sourceUrl:'https://www.golfify.io/courses/poppy-estate-golf-course'},
  {id:'regular',name:'Regular',yardages:[387,141,278,280,189,176,160,116,336,298,317,156,255,207,150,255,170,356],sourceUrl:'https://www.golfify.io/courses/poppy-estate-golf-course'},
  {id:'forward',name:'Forward',yardages:[373,126,245,249,165,140,136,108,314,285,299,147,234,194,141,237,134,342],sourceUrl:'https://www.golfify.io/courses/poppy-estate-golf-course'},
 ],
 'belmont':[
  {id:'blue',name:'Blue',yardages:[302,369,202,357,214,555,207,544,386,352,443,211,504,207,384,384,167,521],sourceUrl:'https://yardsgolfbook.com/courses/british-columbia/belmont-golf-course'},
  {id:'white',name:'White',yardages:[277,352,175,341,193,539,187,527,361,331,414,188,482,171,358,362,142,497],sourceUrl:'https://yardsgolfbook.com/courses/british-columbia/belmont-golf-course'},
  {id:'white-red',name:'White/Red',yardages:[277,334,147,341,193,494,163,527,361,331,388,158,454,171,358,333,115,497],sourceUrl:'https://yardsgolfbook.com/courses/british-columbia/belmont-golf-course'},
  {id:'red',name:'Red',yardages:[282,334,147,315,146,494,163,493,343,304,388,158,454,123,335,333,115,465],sourceUrl:'https://yardsgolfbook.com/courses/british-columbia/belmont-golf-course'},
  {id:'gold',name:'Gold',yardages:[242,318,124,287,118,477,137,462,320,279,359,139,432,112,313,289,98,445],sourceUrl:'https://yardsgolfbook.com/courses/british-columbia/belmont-golf-course'},
 ],
 'delta-golf':[
  {id:'blue',name:'Blue',yardages:[442,285,168,105,431,202,257,121,340,298,146,467,154,107,375,322,388,325],sourceUrl:'https://www.golfify.io/courses/delta-golf-course'},
  {id:'silver',name:'Silver',yardages:[442,285,168,105,431,153,257,121,340,298,146,467,154,107,375,322,388,325],sourceUrl:'https://www.golfify.io/courses/delta-golf-course'},
  {id:'bronze',name:'Bronze',yardages:[422,270,150,95,421,145,237,110,331,287,130,442,141,95,366,309,374,322],sourceUrl:'https://www.golfify.io/courses/delta-golf-course'},
  {id:'blue-ladies',name:'Blue (Ladies)',yardages:[442,285,168,105,431,202,257,121,340,298,146,467,154,107,375,322,388,325],sourceUrl:'https://www.golfify.io/courses/delta-golf-course'},
  {id:'silver-ladies',name:'Silver (Ladies)',yardages:[442,285,168,105,431,153,257,121,340,298,146,467,154,107,375,322,388,325],sourceUrl:'https://www.golfify.io/courses/delta-golf-course'},
 ],
 'sandpiper':[
  {id:'black',name:'Black',yardages:[530,471,430,258,513,195,394,399,420,390,228,347,532,445,602,395,429,181],sourceUrl:'https://yardsgolfbook.com/courses/british-columbia/sandpiper-golf-course'},
  {id:'gold',name:'Gold',yardages:[511,447,407,226,495,173,368,370,401,345,202,325,455,425,582,373,374,167],sourceUrl:'https://yardsgolfbook.com/courses/british-columbia/sandpiper-golf-course'},
  {id:'silver',name:'Silver',yardages:[495,402,387,196,483,155,357,362,393,321,172,306,405,385,540,348,353,136],sourceUrl:'https://yardsgolfbook.com/courses/british-columbia/sandpiper-golf-course'},
  {id:'copper',name:'Copper',yardages:[454,376,353,165,430,125,357,350,368,315,148,252,392,330,471,337,304,99],sourceUrl:'https://yardsgolfbook.com/courses/british-columbia/sandpiper-golf-course'},
 ],
 'highland-pacific':namedTees(['Gold','Blue','White','Green Combo','Silver','Family'],'https://www.highlandpacificgolf.com/golf/score-card/'),
 'cordova-bay':namedTees(['Black','Blue','Silver','White','Gold','Copper'],'https://www.cordovabaygolf.com/wp-content/uploads/2022/06/2022-SCORECARD.pdf'),
 'ardmore':namedTees(['Red','White'],'https://www.ardmoregolfcourse.com/hole-by-hole.html'),
 'bear-mountain':namedTees(['Golden','Grizzly','Grizzly/Black','Black','Black/Spirit','Spirit','Cinnamon'],'https://bearmountain.ca/wp-content/uploads/2021/11/BeaMM-Hole-Grid-e1636489791149.jpg'),
 'bear-valley':namedTees(['Golden','Grizzly','Grizzly/Black','Black','Black/Spirit','Spirit','Cinnamon/Spirit','Cinnamon'],'https://bearmountain.ca/wp-content/uploads/2021/11/BeaM-Valley-Grid-e1636489460578.jpg'),
 'langley-golf-centre':[{id:'standard',name:'Stone markers',yardages:[134,105,128,106,133,106,115,130,105,135,183,129,116,113,119,139,130,94],sourceUrl:'https://www.langleygolfcentre.com/golf-rates-and-online-bookings'}],
 'mount-douglas':[{id:'standard',name:'Standard mats',yardages:[217,85,272,265,165,175,195,75,70],sourceUrl:'https://mountdouggolf.ca/wp-content/uploads/2025/05/5x7-Scorecard-Inside-Final-V4.png'}],
 'cedar-hill':[
  {id:'blue',name:'Blue',yardages:[301,149,375,183,307,147,371,199,372,123,322,368,515,277,131,332,404,288],sourceUrl:cedarSource},
  {id:'white',name:'White',yardages:[290,139,365,175,296,137,362,188,362,116,310,356,504,266,121,321,391,278],sourceUrl:cedarSource},
  {id:'red',name:'Red',yardages:[280,128,356,167,273,130,362,181,362,109,289,346,496,255,109,308,321,268],sourceUrl:cedarSource},
 ]
};
export function teeForRound(courseId:string,teeId?:string){return courseTees[courseId]?.find(tee=>tee.id===teeId);}

const teePalette:Record<string,{background:string;text:string}>={
 blue:{background:'#2460ae',text:'#ffffff'},red:{background:'#b52d36',text:'#ffffff'},white:{background:'#ffffff',text:'#17241e'},
 black:{background:'#25282b',text:'#ffffff'},gold:{background:'#d3b354',text:'#17241e'},golden:{background:'#d3b354',text:'#17241e'},
 silver:{background:'#c3cbd0',text:'#17241e'},green:{background:'#28734c',text:'#ffffff'},copper:{background:'#a9673e',text:'#ffffff'},championship:{background:'#2460ae',text:'#ffffff'},regular:{background:'#ffffff',text:'#17241e'},forward:{background:'#c44a4a',text:'#ffffff'},bronze:{background:'#ad6429',text:'#ffffff'},
 orange:{background:'#cf6b16',text:'#ffffff'},brown:{background:'#795039',text:'#ffffff'},
};
/** Named/non-colour tees retain their published name with a neutral treatment. */
export function teeAppearance(id?:string){return teePalette[id?.split('-')[0]||'']||{background:'#526459',text:'#ffffff'};}
