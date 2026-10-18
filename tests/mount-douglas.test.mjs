import test from 'node:test';
import assert from 'node:assert/strict';
import {parseMountDouglas,mountDouglasDates,createMountDouglasSnapshot} from '../server/mount-douglas.mjs';
const html=`<a class="search-results-date active-date" id="2026-10-04"></a><a class="search-results-date" id="2026-10-10"></a><div class="search-results-tee-times-box" id="MTDGF2026-10-04-16.10.00.0009"><p class="price">$28.00</p><div class="players-allowed">2 - 4 Players</div></div>`;
test('Mount Douglas honors its published days, party minimum and separate round length',()=>{
 assert.deepEqual(mountDouglasDates(html),['2026-10-04','2026-10-10']);
 const r=parseMountDouglas(html,'2026-10-04',new Date('2026-10-03T19:00Z'));
 assert.deepEqual(r.slots[0].players,[2,3,4]);assert.equal(r.slots[0].holes,9);assert.equal(r.slots[0].price,28);assert.equal(r.slots[0].time,'4:10 PM');
 assert.throws(()=>parseMountDouglas(html,'2026-10-05'));
 assert.throws(()=>parseMountDouglas('<altcha-widget/>','2026-10-04'));
});
test('a failed refresh cannot publish invented empty dates or keep stale Mount Douglas times',async()=>{
 let now=Date.parse('2026-10-03T19:00Z'),fail=false;
 const snapshot=createMountDouglasSnapshot(async()=>({dates:['2026-10-04'],fetchDay:async date=>{if(fail)throw Error();return {date,checkedAt:new Date(now).toISOString(),slots:[]};}}),()=>now);
 await snapshot.refresh();assert.equal(Object.keys(snapshot.read()).length,1);fail=true;now+=121000;await snapshot.refresh();assert.deepEqual(snapshot.read(),{});
});
