import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distanceKm, nearbyCourses } from '../src/lib/geo.ts';
import { courses, cities } from '../src/data/courses.ts';
test('great-circle distance is zero at origin, symmetric, and ~111.2km per degree at equator', () => {
 const a={latitude:0,longitude:0}, b={latitude:0,longitude:1};
 assert.equal(distanceKm(a,a),0); assert.ok(Math.abs(distanceKm(a,b)-111.195)<0.01); assert.equal(distanceKm(a,b),distanceKm(b,a));
});
test('includes mainland courses by distance and sorts nearest first', () => {
 const results=nearbyCourses(courses,cities[0],10);
 assert.equal(results.length,3); assert.equal(results[0].id,'cedar-hill');
 assert.equal(nearbyCourses(courses,cities.find(c=>c.name==='Sidney'),10)[0].id,'ardmore');
 const mainland=nearbyCourses(courses,cities.find(c=>c.name==='Langley'),50);
 assert.deepEqual(mainland.map(c=>c.id),['langley-golf-centre','belmont','poppy-estate','guildford','delta-golf','royalwood']);
 assert.equal(nearbyCourses(courses,cities.find(c=>c.name==='Langley'),50).some(c=>c.id==='sandpiper'),false);
});
test('search and hole filters combine; radius boundary is inclusive',()=>{
 assert.equal(nearbyCourses(courses,cities[0],25,' SAANICH ',18)[0].id,'cedar-hill');
 assert.equal(nearbyCourses(courses,cities[0],25,'',9)[0].id,'mount-douglas');
 assert.equal(nearbyCourses(courses,courses[0].location,0).length,1);
});
test('rejects invalid location and radius',()=>{
 assert.throws(()=>distanceKm({latitude:NaN,longitude:0},cities[0]));
 assert.throws(()=>nearbyCourses(courses,cities[0],-1));
});
