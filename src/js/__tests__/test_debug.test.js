#!/usr/bin/env node
import { computeVolumes } from './src/js/logic.js';

const state1 = [
  { role: 'conductor', id: 17.5, top: 0, depth: 362, use: true, od: 19 },
  {
    role: 'intermediate',
    id: 13.5,
    top: 362,
    depth: 2814,
    use: true,
    od: 15.5
  },
  {
    role: 'production',
    id: 9.5,
    top: 2100,
    depth: 3277.5,
    use: true,
    od: 11.0
  },
  { role: 'reservoir', id: 7, top: 3220, depth: 4065, use: true, od: 7.75 }
];

const state2 = [
  { role: 'conductor', id: 17.5, top: 0, depth: 362, use: true, od: 19 },
  {
    role: 'intermediate',
    id: 13.5,
    top: 362,
    depth: 3300,
    use: true,
    od: 15.5
  },
  {
    role: 'production',
    id: 9.5,
    top: 2100,
    depth: 3277.5,
    use: true,
    od: 11.0
  },
  { role: 'reservoir', id: 7, top: 3220, depth: 4065, use: true, od: 7.75 }
];

const res1 = computeVolumes(state1, {});
const res2 = computeVolumes(state2, {});

const int1 = res1.perCasingVolumes.find((c) => c.role === 'intermediate');
const int2 = res2.perCasingVolumes.find((c) => c.role === 'intermediate');

console.log('STATE 1 (Intermediate at 2814):');
console.log(`  Intermediate: ${int1.volume.toFixed(2)} m³`);

console.log('\nSTATE 2 (Intermediate at 3300):');
console.log(`  Intermediate: ${int2.volume.toFixed(2)} m³`);

console.log(`\nChange: ${(int2.volume - int1.volume).toFixed(2)} m³`);

if (int2.volume > int1.volume) {
  console.log('✓ PASS: Intermediate gained volume');
} else {
  console.log('✗ FAIL: Intermediate did NOT gain volume');
}
