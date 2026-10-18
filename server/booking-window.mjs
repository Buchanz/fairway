import { localDate } from './olympic.mjs';
// Cedar Hill publishes its fifth advance day at 18:00 America/Vancouver.
export function cedarBookingDates(now=new Date()){
 const first=localDate(now);
 const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'America/Vancouver',hour:'2-digit',hourCycle:'h23'}).format(now));
 return Array.from({length:hour>=18?6:5},(_,offset)=>{
  const date=new Date(`${first}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate()+offset);
  return date.toISOString().slice(0,10);
 });
}
