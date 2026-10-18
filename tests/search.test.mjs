import test from 'node:test';
import assert from 'node:assert/strict';
import {filterCourse,decodeInventory} from '../src/lib/search.ts';
const now=Date.parse('2026-09-29T01:00:00Z');
const date='2026-09-29';
const slot={id:'1',date,time:'8:00 AM',minuteOfDay:480,price:null,players:[1,2,3,4],holes:18};
const days={[date]:{date,checkedAt:new Date(now).toISOString(),slots:[slot,{...slot,id:'2',holes:9},{...slot,id:'3',minuteOfDay:800,price:70},{...slot,id:'4',minuteOfDay:1000,price:40}]}};
const filters={players:4,holes:18,date:null,time:'any',maxPrice:null};
test('hole and daypart filters exclude incompatible rounds',()=>{
 assert.deepEqual(filterCourse(days,{...filters,holes:9},now).map(s=>s.id),['2']);
 assert.deepEqual(filterCourse(days,{...filters,time:'morning'},now).map(s=>s.id),['1']);
 assert.deepEqual(filterCourse(days,{...filters,time:'afternoon'},now).map(s=>s.id),['3']);
 assert.deepEqual(filterCourse(days,{...filters,time:'evening'},now).map(s=>s.id),['4']);
});
test('price filtering excludes unknown prices instead of treating them as free',()=>{
 assert.deepEqual(filterCourse(days,{...filters,maxPrice:50},now).map(s=>s.id),['4']);
});
test('invalid source responses fail closed',()=>{
 assert.deepEqual(decodeInventory({courses:{cedar:days}}),{cedar:days});
 assert.throws(()=>decodeInventory({courses:{cedar:{[date]:{...days[date],slots:[{...slot,price:-1}]}}}}));
 assert.throws(()=>decodeInventory({days}));
});

test('Any holes includes both 9 and 18 hole inventory while preserving player requirements',()=>{
 assert.deepEqual(filterCourse(days,{...filters,holes:'any'},now).map(s=>s.id),['1','2','3','4']);
 const nineOnly={[date]:{...days[date],slots:[{...slot,id:'nine',holes:9,players:[1,2]}]}};
 assert.equal(filterCourse(nineOnly,{...filters,holes:'any'},now).length,0);
 assert.equal(filterCourse(nineOnly,{...filters,holes:'any',players:2},now).length,1);
});
