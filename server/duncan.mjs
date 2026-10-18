import {localDate} from './olympic.mjs';
export const sourceUrl='https://chrono.golf/en/club/duncan-meadows';
// IDs and the seven-day public window verified against the provider's public widget.
const endpoint='https://chrono.golf/marketplace/clubs/18963/teetimes';
export function parseDuncan(data,date,holes,players){
 if(!Array.isArray(data))throw new Error('Unrecognized Duncan Meadows inventory');
 return data.flatMap(row=>{
  if(row.course_id!==23175||row.date!==date||!Number.isInteger(row.id)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(row.start_time))throw new Error('Invalid Duncan Meadows tee time');
  if(row.out_of_capacity!==false||row.frozen!==false||!Array.isArray(row.restrictions)||row.restrictions.length||row.event_id)return [];
  const fees=row.green_fees;
  if(!Array.isArray(fees)||fees.length!==players||fees.some(f=>f.affiliation_type_id!==112653||!Number.isFinite(f.green_fee)||f.green_fee<0))throw new Error('Unconfirmed visitor price');
  if(fees.some(f=>f.green_fee!==fees[0].green_fee))return [];
  const [hour,minute]=row.start_time.split(':').map(Number);
  return [{id:`${row.id}-${players}`,date,minuteOfDay:hour*60+minute,time:`${hour%12||12}:${String(minute).padStart(2,'0')} ${hour>=12?'PM':'AM'}`,holes,players:[players],price:fees[0].green_fee,currency:'CAD'}];
 });
}
export async function fetchDuncan(date,holes,players){
 const query=new URLSearchParams({date,course_id:'23175',nb_holes:String(holes)});
 for(let n=0;n<players;n++)query.append('affiliation_type_ids[]','112653');
 const response=await fetch(`${endpoint}?${query}`,{signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new Error('Duncan Meadows feed unavailable');
 return parseDuncan(await response.json(),date,holes,players);
}
export function createDuncanSnapshot(fetchTimes=fetchDuncan,now=()=>Date.now()){
 let days={},pending=null,lastAttempt=-Infinity;
 const dates=()=>Array.from({length:7},(_,offset)=>{const date=new Date(`${localDate(new Date(now()))}T12:00:00Z`);date.setUTCDate(date.getUTCDate()+offset);return date.toISOString().slice(0,10);});
 return {
  read(){return Object.fromEntries(Object.entries(days).filter(([date,result])=>dates().includes(date)&&now()-Date.parse(result.checkedAt)<=120000));},
  refresh(){
   if(pending)return pending;
   if(now()-lastAttempt<90000)return Promise.resolve();
   lastAttempt=now();
   pending=(async()=>{
    const queue=dates().flatMap(date=>[9,18].flatMap(holes=>[1,2,3,4].map(players=>({date,holes,players}))));
    const results=new Map(),failed=new Set();
    await Promise.all(Array.from({length:3},async()=>{while(queue.length){const job=queue.shift();try{const slots=await fetchTimes(job.date,job.holes,job.players);results.set(job.date,[...(results.get(job.date)||[]),...slots]);}catch{failed.add(job.date);}}}));
    for(const [date,slots] of results)if(!failed.has(date))days[date]={date,slots,checkedAt:new Date(now()).toISOString(),sourceUrl};
    days=Object.fromEntries(Object.entries(days).filter(([date])=>dates().includes(date)));
   })().finally(()=>{pending=null;});
   return pending;
  },
 };
}
