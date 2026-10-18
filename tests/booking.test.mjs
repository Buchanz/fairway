import test from 'node:test';
import assert from 'node:assert/strict';
import {bookingLink} from '../src/lib/booking.ts';
test('Cedar Hill handoff preserves the selected tee-time ID, date and facility',()=>{
 const url=new URL(bookingLink({id:'cedar-hill',bookingUrl:'https://example.com'},{id:'12345',date:'2026-09-29'}));
 assert.equal(url.pathname,'/portal/lakeland/login');
 assert.equal(url.searchParams.get('id'),'12345');
 assert.equal(url.searchParams.get('date'),'2026-09-29');
 assert.equal(url.searchParams.get('facility'),'cedarhill');
});
test('Other providers keep their existing booking destination',()=>{
 assert.equal(bookingLink({id:'olympic-view',bookingUrl:'https://example.com'},{id:'abc',date:'2026-09-29'}),'https://example.com');
});
