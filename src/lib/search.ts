import {upcomingSlots,type LiveResult,type LiveSlot} from './availability.ts';
export type Inventory=Record<string,Record<string,LiveResult>>;
export type SearchFilters={players:number;holes:9|18|'any';date:string|null;time:'any'|'morning'|'afternoon'|'evening';maxPrice:number|null};
export function filterCourse(days:Record<string,LiveResult>,filters:SearchFilters,now:number):LiveSlot[]{
 return upcomingSlots(days,filters.players,now,filters.date).filter(slot=>(filters.holes==='any'||slot.holes===filters.holes)
  &&(filters.time==='any'||filters.time==='morning'&&slot.minuteOfDay<720||filters.time==='afternoon'&&slot.minuteOfDay>=720&&slot.minuteOfDay<960||filters.time==='evening'&&slot.minuteOfDay>=960)
  &&(filters.maxPrice===null||slot.price!==null&&slot.price<=filters.maxPrice));
}
export function decodeInventory(value:unknown):Inventory{
 if(!value||typeof value!=='object'||!('courses' in value)||!value.courses||typeof value.courses!=='object')throw new Error('Invalid availability');
 const result:Inventory={};
 for(const [id,days] of Object.entries(value.courses)){
  if(!days||typeof days!=='object')throw new Error('Invalid course');
  result[id]={};
  for(const [date,raw] of Object.entries(days)){
   const record=raw as LiveResult;
   if(!record||record.date!==date||!Number.isFinite(Date.parse(record.checkedAt))||!Array.isArray(record.slots))throw new Error('Invalid date');
   for(const slot of record.slots){
    if(!slot||slot.date!==date||typeof slot.id!=='string'||typeof slot.time!=='string'||!Number.isInteger(slot.minuteOfDay)||slot.minuteOfDay<0||slot.minuteOfDay>=1440||![9,18].includes(slot.holes)||!Array.isArray(slot.players)||!slot.players.every(n=>Number.isInteger(n)&&n>=1&&n<=4)||(slot.price!==null&&(!Number.isFinite(slot.price)||slot.price<0)))throw new Error('Invalid tee time');
   }
   result[id][date]=record;
  }
 }
 return result;
}
