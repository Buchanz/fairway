import test from 'node:test';
import assert from 'node:assert/strict';
import {interpolateCamera} from '../src/lib/camera-transition.ts';
const from={center:{latitude:48,longitude:-123},heading:350,pitch:0,zoom:17,altitude:400};
const to={center:{latitude:48.01,longitude:-123.01},heading:10,pitch:0,zoom:18,altitude:200};
test('hole camera turns across north without a full rotation',()=>{
 assert.equal(interpolateCamera(from,to,.5).heading,0);
 assert.equal(interpolateCamera(to,from,.5).heading,0);
 assert.deepEqual(interpolateCamera(from,to,0),from);
 assert.deepEqual(interpolateCamera(from,to,1),to);
 assert.deepEqual(interpolateCamera(from,to,2),to);
});
test('camera eases both ends and interpolates zoom and position',()=>{
 const early=interpolateCamera(from,to,.1),mid=interpolateCamera(from,to,.5),late=interpolateCamera(from,to,.9);
 assert.ok(early.center.latitude<48.001);
 assert.ok(late.center.latitude>48.009);
 assert.equal(mid.altitude,300);assert.equal(mid.zoom,17.5);
});
