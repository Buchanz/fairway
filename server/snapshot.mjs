import { fetchCedar } from './cedar.mjs';
import { cedarBookingDates } from './booking-window.mjs';
export function createSnapshot(fetchDay=fetchCedar,now=()=>Date.now()){
 let days={},pending;
 function dates(){return cedarBookingDates(new Date(now()));}
 return {
  read(){const allowed=dates();return {days:Object.fromEntries(Object.entries(days).filter(([date,r])=>allowed.includes(date)&&now()-Date.parse(r.checkedAt)<=120000))};},
  refresh(){if(pending)return pending;pending=Promise.allSettled(dates().map(async date=>{days[date]=await fetchDay(date);})).finally(()=>{const allowed=dates();days=Object.fromEntries(Object.entries(days).filter(([date])=>allowed.includes(date)));pending=null;});return pending;}
 };
}
