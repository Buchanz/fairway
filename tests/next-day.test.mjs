import {test} from 'node:test';
import assert from 'node:assert/strict';
import {searchDate,dayHasMatches} from '../src/lib/availability.ts';
const night=Date.parse('2026-09-27T05:15:00Z');
const slot={id:'1',date:'2026-09-26',time:'4:00 PM',minuteOfDay:960,price:null,players:[1,2],holes:18};
test('late-night search discards today and finds matching tomorrow',()=>{
 assert.equal(searchDate(night,0),'2026-09-26');assert.equal(searchDate(night,1),'2026-09-27');
 assert.equal(dayHasMatches({course:{slots:[slot]}},2,night,'2026-09-26'),false);
 assert.equal(dayHasMatches({course:{slots:[{...slot,date:'2026-09-27'}]}},2,night,'2026-09-27'),true);
 assert.equal(dayHasMatches({course:{slots:[{...slot,date:'2026-09-27'}]}},4,night,'2026-09-27'),false);
});
test('calendar dates cross month and daylight-saving boundaries correctly',()=>{
 assert.equal(searchDate(Date.parse('2026-11-01T06:30:00Z'),1),'2026-11-01');
 assert.equal(searchDate(Date.parse('2026-11-01T06:30:00Z'),2),'2026-11-02');
});
