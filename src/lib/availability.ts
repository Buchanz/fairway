const localDay=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Vancouver',year:'numeric',month:'2-digit',day:'2-digit'});
const localClock=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Vancouver',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
export type LiveSlot={id:string;date:string;time:string;minuteOfDay:number;price:number|null;players:number[];holes:number};
export type LiveResult={date:string;checkedAt:string;expiresAt?:string;slots:LiveSlot[]};
export function matchingSlots(slots:LiveSlot[],players:number,now:number,selectedDate?:string){
 const date=localDay.format(now);
 const clock=localClock.format(now).split(':').map(Number);
 return slots.filter(t=>t.players.includes(players)&&t.date===(selectedDate??date)&&(t.date>date||t.minuteOfDay>clock[0]*60+clock[1])).sort((a,b)=>a.minuteOfDay-b.minuteOfDay);
}

// Add calendar days in the course's timezone, not 24-hour intervals across DST.
export function searchDate(now:number,offset:number){
 const today=localDay.format(now);
 const date=new Date(`${today}T12:00:00Z`);date.setUTCDate(date.getUTCDate()+offset);
 return date.toISOString().slice(0,10);
}
export function dayHasMatches(results:Record<string,LiveResult>,players:number,now:number,date:string){
 return Object.values(results).some(result=>matchingSlots(result.slots,players,now,date).length>0);
}

export function isFresh(result:LiveResult,now:number){
 const checked=Date.parse(result.checkedAt);
 const expiry=result.expiresAt?Math.min(Date.parse(result.expiresAt),checked+600000):checked+120000;
 return Number.isFinite(expiry)&&now<=expiry;
}

export function upcomingSlots(inventory:Record<string,LiveResult>,players:number,now:number,date?:string|null){
 return Object.keys(inventory).sort().filter(day=>!date||day===date).flatMap(day=>{
  const result=inventory[day];
  return isFresh(result,now)?matchingSlots(result.slots,players,now,day):[];
 });
}
