import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseAvailability} from '../server/olympic.mjs';
const now=new Date('2026-09-26T18:00:00Z');
const html=`<span id="x_lblheaderDate">Saturday, September 26, 2026</span><span id="dnn_ctr1176_DefaultView_ctl01_dlTeeTimes"><span class="TeeBlock"><span id="x_lblTeeDate_0">09/26/2026</span><span id="x_lblTeeTime_0">4:33 PM</span><span id="x_lblPlayers_0">$60.00/Player</span><span id="x_lblCourseName_0">Olympic View</span><select id="ddlNumPlayers"><option value="2 - 4">2 - 4</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select><input type="radio" id="x_rad18Holes_0" checked></span></span>`;
test('parses price, date, selected holes and allowed party sizes without treating range as a single-player option',()=>{
 const data=parseAvailability(html,now);assert.equal(data.slots[0].price,60);assert.equal(data.slots[0].holes,18);assert.deepEqual(data.slots[0].players,[2,3,4]);assert.equal(data.date,'2026-09-26');
});
test('fails closed on challenge, changed markup, stale day or missing price',()=>{
 for(const page of ['<altcha-widget/>',html.replace('09/26/2026','09/25/2026'),html.replace('$60.00/Player','Call us')]) assert.throws(()=>parseAvailability(page,now));
});
test('excludes departed tee times',()=>assert.equal(parseAvailability(html,new Date('2026-09-27T00:00:00Z')).slots.length,0));
test('future mornings are retained even when the current local time is later',()=>{
 const future=html.replaceAll('09/26/2026','09/27/2026').replace('4:33 PM','8:33 AM');
 assert.equal(parseAvailability(future,new Date('2026-09-27T00:00:00Z'),'2026-09-27').slots.length,1);
});
