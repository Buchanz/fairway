import test from 'node:test';
import assert from 'node:assert/strict';
import {cedarBookingDates} from '../server/booking-window.mjs';
test('fifth advance day becomes available at 6pm Vancouver time',()=>{
 assert.equal(cedarBookingDates(new Date('2026-09-29T00:59:59Z')).at(-1),'2026-10-02');
 const released=cedarBookingDates(new Date('2026-09-29T01:00:00Z'));
 assert.equal(released.length,6);assert.equal(released.at(-1),'2026-10-03');
});
test('winter release follows Vancouver timezone and calendar rollover',()=>{
 assert.equal(cedarBookingDates(new Date('2026-12-31T01:59:59Z')).at(-1),'2027-01-03');
 assert.equal(cedarBookingDates(new Date('2026-12-31T02:00:00Z')).at(-1),'2027-01-04');
});
