import test from 'node:test';
import assert from 'node:assert/strict';
import {cedarBookingDates} from '../server/booking-window.mjs';
test('fifth advance day becomes available at 6pm Vancouver time',()=>{
 assert.equal(cedarBookingDates(new Date('2026-09-29T00:59:59Z')).at(-1),'2026-10-02');
 const released=cedarBookingDates(new Date('2026-09-29T01:00:00Z'));
 assert.equal(released.length,6);assert.equal(released.at(-1),'2026-10-03');
});
function vancouverInstant(date,hour,minute,second=0){
 const start=Date.parse(`${date}T00:00:00Z`)-24*60*60*1000;
 const targetHour=String(hour).padStart(2,'0'),targetMinute=String(minute).padStart(2,'0');
 const format=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Vancouver',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 for(let ms=start;ms<=start+72*60*60*1000;ms+=60*1000){
  const parts=Object.fromEntries(format.formatToParts(new Date(ms)).map(({type,value})=>[type,value]));
  if(`${parts.year}-${parts.month}-${parts.day}`===date&&parts.hour===targetHour&&parts.minute===targetMinute)return new Date(ms+second*1000);
 }
 throw new Error(`Could not construct ${date} ${hour}:${minute} in Vancouver time`);
}

test('winter release follows Vancouver timezone and calendar rollover',()=>{
 assert.equal(cedarBookingDates(vancouverInstant('2026-12-30',17,59,59)).at(-1),'2027-01-03');
 assert.equal(cedarBookingDates(vancouverInstant('2026-12-30',18,0)).at(-1),'2027-01-04');
});
