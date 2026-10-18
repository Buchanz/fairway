import { load } from 'cheerio';
export const sourceUrl = 'https://olympicviewgolf.totaleintegrated.com/Book-a-Tee-Time';
export function localDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {timeZone:'America/Vancouver',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
export function parseAvailability(html, now = new Date(), expectedDate = localDate(now)) {
 const $=load(html);
 const hasResults=$('#dnn_ctr1176_DefaultView_ctl01_dlTeeTimes').length;
 const confirmedEmpty=!$('.TeeBlock').length&&$('#dnn_ctr1176_DefaultView_ctl01_Calendar').val()===expectedDate&&$('#dnn_ctr1176_DefaultView_ctl01_searchMessage').length&&!/critical error|\|error\|/.test(html);
 if (!$('[id$="lblheaderDate"]').length || (!hasResults&&!confirmedEmpty)) throw new Error('Provider page changed or availability could not be confirmed');
 const slots=[];
 $('.TeeBlock').each((_,el)=>{
  const row=$(el), field=n=>row.find(`[id*="_${n}_"]`).first().text().trim();
  const date=field('lblTeeDate'); const parts=date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const time=field('lblTeeTime'); const clock=time.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/);
  const priceText=field('lblPlayers'); const price=priceText.match(/^\$([\d,]+\.\d{2})\/Player$/);
  const players=row.find('select[id="ddlNumPlayers"] option').toArray().map(o=>$(o).attr('value')).filter(v=>/^[1-4]$/.test(v??'')).map(Number).sort();
  const selected=row.find('input[type="radio"][checked]').filter((_,e)=>!$(e).is('[disabled]'));
  const holes=selected.attr('id')?.includes('rad18Holes')?18:selected.attr('id')?.includes('rad9Holes')?9:null;
  if (!parts || !clock || !price || !players.length || !holes || field('lblCourseName')!=='Olympic View') throw new Error('Provider returned an unrecognized tee-time record');
  const iso=`${parts[3]}-${parts[1]}-${parts[2]}`;
  if (iso!==expectedDate) throw new Error('Provider returned a different date');
  const hour=(Number(clock[1])%12)+(clock[3]==='PM'?12:0);
  const minuteOfDay=hour*60+Number(clock[2]);
  const localClock=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Vancouver',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now).split(':').map(Number);
  if(iso===localDate(now)&&minuteOfDay<=localClock[0]*60+localClock[1]) return;
  slots.push({id:`${iso}-${hour}-${clock[2]}`,date:iso,time,minuteOfDay,price:Number(price[1].replaceAll(',','')),currency:'CAD',players,holes});
 });
 return {course:'Olympic View',date:expectedDate,checkedAt:now.toISOString(),sourceUrl,slots};
}
// Read the provider's published dates rather than imposing a Fairway horizon.
export function olympicBookingDates(html) {
 const $=load(html);
 const dates=$('.cusday .shortDateNew').toArray().map(el=>{
  const parts=($(el).val()||'').split('/');
  return parts.length===3?`${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`:null;
 }).filter(Boolean);
 if(!dates.length)throw new Error('Provider booking window unavailable');
 return [...new Set(dates)].sort();
}
export function dateSearchBody(html,date) {
 const $=load(html),body=new URLSearchParams();
 $('input[name]').each((_,el)=>{
  const input=$(el),name=input.attr('name'),type=input.attr('type');
  // Search only: never submit a reservation or the separate tee-sheet button.
  if(name.includes('$dlTeeTimes$')||input.is('[disabled]')||['submit','button','image','file'].includes(type))return;
  if(['checkbox','radio'].includes(type)&&!input.is(':checked'))return;
  if(name.endsWith('ClientState')&&!input.val())return;
  body.append(name,input.val()||'');
 });
 $('select[name]').each((_,el)=>{const input=$(el),name=input.attr('name');if(!name.includes('$dlTeeTimes$')&&!input.is('[disabled]'))body.set(name,input.val()||'');});
 const dates=olympicBookingDates(html);
 if(!dates.includes(date))throw new Error('Date outside provider booking window');
 const [year,month,day]=date.split('-').map(Number),display=`${month}/${day}/${year}`;
 const prefix='dnn$ctr1176$DefaultView$ctl01$',id='dnn_ctr1176_DefaultView_ctl01_';
 body.set('__EVENTTARGET',prefix+'lnkDayBtn');body.set('__EVENTARGUMENT','');
 body.set(prefix+'Calendar',date);body.set(prefix+'Calendar$dateInput',display);
 body.set(prefix+'customDate',display);
 body.set(prefix+'calDivId',`customcaleder_${dates.indexOf(date)}`);
 body.set(id+'Calendar_calendar_SD',JSON.stringify([[year,month,day]]));
 body.set(id+'Calendar_dateInput_ClientState',JSON.stringify({enabled:true,emptyMessage:'',validationText:date+'-00-00-00',valueAsString:date+'-00-00-00',minDateStr:dates[0]+'-00-00-00',maxDateStr:dates.at(-1)+'-00-00-00',lastSetTextBoxValue:display}));
 body.set(id+'Calendar_ClientState',JSON.stringify({minDateStr:dates[0]+'-00-00-00',maxDateStr:dates.at(-1)+'-00-00-00'}));
 body.set('ScriptManager','dnn$ctr1176$DefaultView_UP|'+prefix+'lnkDayBtn');body.set('__ASYNCPOST','true');
 return body;
}
export async function openOlympicSearch(request=fetch) {
 const response=await request(sourceUrl,{signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('Provider request failed');
 const html=await response.text(),dates=olympicBookingDates(html);
 // Set-Cookie can repeat a name: the last value replaces the earlier value.
 const cookies=[...new Map(response.headers.getSetCookie().map(c=>{const pair=c.split(';')[0];return [pair.slice(0,pair.indexOf('=')),pair];})).values()].join('; ');
 return {dates,async fetchDay(date){
  const slots=new Map();let hour=null,lastResult;
  for(let page=0;page<18;page++){
   const body=dateSearchBody(html,date);
   if(hour!==null)body.set('dnn$ctr1176$DefaultView$ctl01$cmbHour',`${String(hour%12||12).padStart(2,'0')}:00 ${hour>=12?'PM':'AM'}`);
   const result=await request(sourceUrl,{method:'POST',body,headers:{cookie:cookies,'X-MicrosoftAjax':'Delta=true'},signal:AbortSignal.timeout(15000)});
   if(!result.ok)throw new Error('Provider date search failed');
   lastResult=parseAvailability(await result.text(),new Date(),date);
   for(const slot of lastResult.slots)slots.set(slot.id,slot);
   if(lastResult.slots.length<24)break;
   // The public site caps each search at 24. Overlap the last hour so no minutes are skipped.
   const lastHour=Math.floor(Math.max(...lastResult.slots.map(slot=>slot.minuteOfDay))/60);
   const nextHour=Math.max(lastHour,(hour??4)+1);
   if(nextHour>21)break;
   hour=nextHour;
  }
  return {...lastResult,slots:[...slots.values()].sort((a,b)=>a.minuteOfDay-b.minuteOfDay)};
 }};
}

export async function fetchAvailability(date=localDate()) {
 return (await openOlympicSearch()).fetchDay(date);
}
export function createOlympicSnapshot(openSearch=openOlympicSearch,now=()=>Date.now()) {
 let days={},allowed=[],pending,lastStart=-Infinity;
 return {
  read(){const today=localDate(new Date(now()));return Object.fromEntries(Object.entries(days).filter(([date,result])=>date>=today&&allowed.includes(date)&&now()<=Date.parse(result.expiresAt)));},
  refresh(){
   if(pending)return pending;
   if(now()-lastStart<60000)return Promise.resolve();
   lastStart=now();
   pending=(async()=>{
    const search=await openSearch();allowed=search.dates;
    // Dates are fetched oldest first; reuse distant-date results for up to ten minutes.
    const due=allowed.filter(date=>!days[date]||now()-Date.parse(days[date].checkedAt)>=(date<=allowed[6]?60000:480000));
    let index=0;
    await Promise.all(Array.from({length:2},async()=>{while(index<due.length){const date=due[index++];try{const result=await search.fetchDay(date);days[date]={...result,expiresAt:new Date(now()+600000).toISOString()};}catch{/* A failed search is unknown, not sold out. */}}}));
    days=Object.fromEntries(Object.entries(days).filter(([date])=>allowed.includes(date)));
   })().catch(()=>{}).finally(()=>{pending=null;});
   return pending;
  }
 };
}
