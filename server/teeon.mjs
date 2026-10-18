import {load} from 'cheerio';
import {localDate} from './olympic.mjs';
export const mountDouglasConfig={code:'MTDG',group:'11763',name:'Mount Douglas',url:'https://www.tee-on.com/PubGolf/servlet/com.teeon.teesheet.servlets.golfersection.WebBookingAllTimesLanding?CourseCode=MTDG&CourseGroupID=11763&FromCourseWebsite=true'};
export const ardmoreConfig={code:'ARDM',group:'10165',name:'Ardmore',url:'https://www.tee-on.com/PubGolf/servlet/com.teeon.teesheet.servlets.golfersection.WebBookingAllTimesLanding?BackTarget=com.teeon.teesheet.servlets.golfersection.ComboLanding&CourseCode=ARDM&CourseGroupID=10165&LoginType=5&Referrer='};
export const langleyConfig={code:'LANB',group:'11665',name:'Langley Golf Centre',allowMissingPrice:true,url:'https://www.tee-on.com/PubGolf/servlet/com.teeon.teesheet.servlets.golfersection.WebBookingAllTimesLanding?FromTrailSearch=true&FromCourseWebsite=true&CourseCode=LANB&CourseGroupID=11665&Referrer='};
export const royalwoodConfig={code:'RYWD',group:'11953',name:'Royalwood',url:'https://www.tee-on.com/PubGolf/servlet/com.teeon.teesheet.servlets.golfersection.WebBookingAllTimesLanding?CourseGroupID=11953&CourseCode=RYWD&LoginType=5&BackTarget=com.teeon.teesheet.servlets.golfersection.ComboLanding&Referrer='};
export function teeOnDates(html){
 const $=load(html);
 const dates=$('a.search-results-date').toArray().map(el=>$(el).attr('id')).filter(date=>/^\d{4}-\d{2}-\d{2}$/.test(date??''));
 if(!dates.length)throw new Error('Tee-On booking window unavailable');
 return [...new Set(dates)].sort();
}
export function parseTeeOn(html,date,now=new Date(),config){
 const $=load(html);
 teeOnDates(html);
 if($('.active-date').attr('id')!==date)throw new Error('Tee-On returned a different day');
 const slots=[];
 $('.search-results-tee-times-box').each((_,el)=>{
  const row=$(el),id=row.attr('id');
  const match=id?.match(new RegExp('^'+config.code+'([A-Z]\\d*)(\\d{4}-\\d{2}-\\d{2})-(\\d{2})\\.(\\d{2})\\.00\\.000(9|18)$'));
  const range=row.find('.players-allowed').text().trim().match(/^([1-4])(?:\s*-\s*([1-4]))? Players?$/);
  const priceText=row.find('.price').text().trim();
  const price=priceText.match(/^\$([\d,]+\.\d{2})$/);
  if(!match||match[2]!==date||!range||(!price&&!(config.allowMissingPrice&&row.find('.price').length===1&&priceText==='')))throw new Error(`Tee-On tee-time format changed: ${id}; ${row.find('.players-allowed').text().trim()}; ${row.find('.price').text().trim()}`);
  const min=Number(range[1]),max=Number(range[2]||range[1]),minuteOfDay=Number(match[3])*60+Number(match[4]);
  if(min>max)throw new Error('Invalid player range');
  const clock=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Vancouver',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now).split(':').map(Number);
  if(date===localDate(now)&&minuteOfDay<=clock[0]*60+clock[1])return;
  slots.push({id,date,time:`${Number(match[3])%12||12}:${match[4]} ${Number(match[3])>=12?'PM':'AM'}`,minuteOfDay,price:price?Number(price[1].replaceAll(',','')):null,currency:'CAD',players:Array.from({length:max-min+1},(_,i)=>min+i),holes:Number(match[5])});
 });
 return {course:config.name,date,checkedAt:now.toISOString(),sourceUrl:config.url,slots};
}
export async function openTeeOnSearch(config){
 const cookies=new Map([['testing','cookies_enabled']]);
 async function request(body){
  const response=await fetch(config.url,{method:body?'POST':'GET',body,headers:{cookie:[...cookies].map(([k,v])=>`${k}=${v}`).join('; ')},signal:AbortSignal.timeout(15000)});
  for(const cookie of response.headers.getSetCookie()){const pair=cookie.split(';')[0],i=pair.indexOf('=');cookies.set(pair.slice(0,i),pair.slice(i+1));}
  if(!response.ok)throw new Error('Tee-On request failed');
  return response.text();
 }
 const html=await request(),dates=teeOnDates(html);
 return {dates,async fetchDay(date){
  if(!dates.includes(date))throw new Error('Date outside Tee-On booking window');
  const body=new URLSearchParams({CourseCode:config.code,CourseGroupID:config.group,FromCourseWebsite:'true',FromTrailSearch:'true',Date:date});
  return parseTeeOn(await request(body),date,new Date(),config);
 }};
}
export function createTeeOnSnapshot(openSearch,now=()=>Date.now()){
 let days={},allowed=[],pending,lastStart=-Infinity;
 return {
  read(){return Object.fromEntries(Object.entries(days).filter(([date,r])=>date>=localDate(new Date(now()))&&allowed.includes(date)&&now()-Date.parse(r.checkedAt)<=120000));},
  refresh(){
   if(pending)return pending;
   if(now()-lastStart<60000)return Promise.resolve();
   lastStart=now();
   pending=(async()=>{const search=await openSearch();allowed=search.dates;for(const date of allowed){try{days[date]=await search.fetchDay(date);}catch{/* Unknown dates never become empty inventory. */}}})().catch(()=>{}).finally(()=>{pending=null;});
   return pending;
  }
 };
}
