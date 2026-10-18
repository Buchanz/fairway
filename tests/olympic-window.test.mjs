import test from 'node:test';
import assert from 'node:assert/strict';
import {openOlympicSearch,dateSearchBody,parseAvailability,createOlympicSnapshot} from '../server/olympic.mjs';
const date='2030-01-01';
const shell=`<input id="dnn_ctr1176_DefaultView_ctl01_Calendar" value="${date}"><span id="x_lblheaderDate">Tuesday, January 1, 2030</span><div id="dnn_ctr1176_DefaultView_ctl01_searchMessage"></div><div class="cusday"><input class="shortDateNew" value="2030/1/1"></div>`;
function page(start,count){return shell+`<div id="dnn_ctr1176_DefaultView_ctl01_dlTeeTimes">`+Array.from({length:count},(_,i)=>{const minute=start+i*10,h=Math.floor(minute/60);return `<div class="TeeBlock"><span id="x_lblTeeDate_0">01/01/2030</span><span id="x_lblTeeTime_0">${h%12||12}:${String(minute%60).padStart(2,'0')} ${h>=12?'PM':'AM'}</span><span id="x_lblPlayers_0">$60.00/Player</span><span id="x_lblCourseName_0">Olympic View</span><select id="ddlNumPlayers"><option value="4">4</option></select><input type="radio" id="x_rad18Holes_0" checked></div>`}).join('')+'</div>';}
test('date search never posts booking controls or the image submit that breaks the provider form',()=>{
 const body=dateSearchBody(shell+'<input type="image" name="dnn$ctr1176$DefaultView$ctl01$btnGetTeeSheet"><input name="dnn$ctr1176$DefaultView$ctl01$dlTeeTimes$ctl00$hdnTotalPrice" value="60">',date);
 assert.equal(body.has('dnn$ctr1176$DefaultView$ctl01$btnGetTeeSheet'),false);
 assert.equal([...body.keys()].some(k=>k.includes('$dlTeeTimes$')),false);
 assert.throws(()=>dateSearchBody(shell,'2030-01-02'));
});
test('Olympic follows the 24-result limit with overlapping hours and deduplicates all times',async()=>{
 const requests=[];
 const request=async(_url,options)=>{
  if(!options?.body)return new Response(shell);
  requests.push(options.body.get('dnn$ctr1176$DefaultView$ctl01$cmbHour'));
  return new Response(requests.length===1?page(480,24):page(660,18));
 };
 const result=await(await openOlympicSearch(request)).fetchDay(date);
 assert.deepEqual(requests,[null,'11:00 AM']);assert.equal(result.slots.length,36);assert.equal(result.slots.at(-1).time,'1:50 PM');
});
test('empty dates require the selected date and intact search controls; provider errors fail closed',()=>{
 assert.equal(parseAvailability(shell,new Date('2029-12-31T20:00Z'),date).slots.length,0);
 assert.throws(()=>parseAvailability(shell+'|error|500|',new Date('2029-12-31T20:00Z'),date));
});
test('snapshot searches every published date, coalesces refreshes and expires old inventory',async()=>{
 let now=Date.parse('2029-12-31T20:00Z'),calls=0;
 const snapshot=createOlympicSnapshot(async()=>({dates:[date,'2030-01-02'],fetchDay:async d=>{calls++;return {date:d,checkedAt:new Date(now).toISOString(),slots:[]};}}),()=>now);
 await Promise.all([snapshot.refresh(),snapshot.refresh()]);assert.equal(calls,2);assert.equal(Object.keys(snapshot.read()).length,2);
 now+=600001;assert.deepEqual(snapshot.read(),{});
});
