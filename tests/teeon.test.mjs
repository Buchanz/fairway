import test from 'node:test';
import assert from 'node:assert/strict';
import {parseTeeOn,langleyConfig,ardmoreConfig,mountDouglasConfig} from '../server/teeon.mjs';
const html=`<a class="search-results-date active-date" id="2026-10-04"></a><div class="search-results-tee-times-box" id="ARDMF82026-10-04-16.04.00.00018"><p class="price">$61.90</p><div class="players-allowed">1 Player</div></div>`;
test('Ardmore discounted IDs retain the correct date, price, holes and player restriction',()=>{
 const r=parseTeeOn(html,'2026-10-04',new Date('2026-10-03T19:00Z'),ardmoreConfig);
 assert.equal(r.slots[0].date,'2026-10-04');assert.equal(r.slots[0].price,61.9);assert.equal(r.slots[0].holes,18);assert.deepEqual(r.slots[0].players,[1]);assert.equal(r.slots[0].time,'4:04 PM');
});
test('shared Tee-On adapter rejects cross-course offers, malformed prices and challenges',()=>{
 assert.throws(()=>parseTeeOn(html,'2026-10-04',new Date(),mountDouglasConfig));
 assert.throws(()=>parseTeeOn(html.replace('$61.90','Call course'),'2026-10-04',new Date(),ardmoreConfig));
 assert.throws(()=>parseTeeOn('<altcha-widget/>','2026-10-04',new Date(),ardmoreConfig));
});

test('Langley accepts explicitly blank prices without treating them as free or accepting malformed values',()=>{
 const sample=html.replaceAll('ARDM','LANB').replace('$61.90','');
 assert.equal(parseTeeOn(sample,'2026-10-04',new Date('2026-10-03T19:00Z'),langleyConfig).slots[0].price,null);
 assert.throws(()=>parseTeeOn(sample.replace('<p class="price"></p>',''),'2026-10-04',new Date(),langleyConfig));
 assert.throws(()=>parseTeeOn(sample.replace('<p class="price"></p>','<p class="price">unknown</p>'),'2026-10-04',new Date(),langleyConfig));
});
