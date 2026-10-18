import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterTimes, teeTimes } from '../src/data/teeTimes.ts';
const base = { query: '', day: 0, players: 2, budget: false, afternoon: false };
test('excludes tee times without enough spaces and other days', () => {
  const result = filterTimes(teeTimes, { ...base, players: 4 });
  assert.equal(result.length, 2);
  assert.ok(result.every(t => t.spaces >= 4 && t.day === 0));
});
test('combines budget, time, and case-insensitive area filters', () => {
  assert.deepEqual(filterTimes(teeTimes, { ...base, budget: true, afternoon: true, query: ' CENTRAL ' }).map(t => t.id), ['meadow-0']);
});
test('returns no results for an unmatched course', () => {
  assert.equal(filterTimes(teeTimes, { ...base, query: 'missing' }).length, 0);
});
