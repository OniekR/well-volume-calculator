#!/usr/bin/env node
import { computeVolumes } from '../logic.js';

console.log('=== TESTING PRODUCTION EXTENDING INTO RESERVOIR ZONE ===\n');

// Test: Production at original depth vs extended
const state1 = [
  { role: 'conductor', id: 17.5, top: 0, depth: 362, use: true, od: 19.0 },
  {
    role: 'intermediate',
    id: 13.5,
    top: 361.5,
    depth: 2814,
    use: true,
    od: 15.5
  },
  {
    role: 'production',
    id: 9.5,
    top: 2081,
    depth: 3277.5,
    use: true,
    od: 11.0
  },
  { role: 'reservoir', id: 7, top: 3228.2, depth: 4065, use: true, od: 7.75 }
];

const state2 = [
  { role: 'conductor', id: 17.5, top: 0, depth: 362, use: true, od: 19.0 },
  {
    role: 'intermediate',
    id: 13.5,
    top: 361.5,
    depth: 2814,
    use: true,
    od: 15.5
  },
  { role: 'production', id: 9.5, top: 2081, depth: 3500, use: true, od: 11.0 }, // Extended
  { role: 'reservoir', id: 7, top: 3228.2, depth: 4065, use: true, od: 7.75 }
];

const res1 = computeVolumes(state1, {});
const res2 = computeVolumes(state2, {});

const prod1 = res1.perCasingVolumes.find((c) => c.role === 'production');
const prod2 = res2.perCasingVolumes.find((c) => c.role === 'production');
const resv1 = res1.perCasingVolumes.find((c) => c.role === 'reservoir');
const resv2 = res2.perCasingVolumes.find((c) => c.role === 'reservoir');

console.log('BEFORE (Production at 3277.5):');
console.log(`  Production: ${prod1.volume.toFixed(2)} m³`);
console.log(`  Reservoir:  ${resv1.volume.toFixed(2)} m³`);

console.log('\nAFTER (Production extended to 3500):');
console.log(
  `  Production: ${prod2.volume.toFixed(2)} m³ (change: ${(
    prod2.volume - prod1.volume
  ).toFixed(2)})`
);
console.log(
  `  Reservoir:  ${resv2.volume.toFixed(2)} m³ (change: ${(
    resv2.volume - resv1.volume
  ).toFixed(2)})`
);

const prodChange = prod2.volume - prod1.volume;
const resvChange = resv2.volume - resv1.volume;

console.log('\nANALYSIS:');
if (prodChange < 0.1 && resvChange < 0.1) {
  console.log(
    '✓ CORRECT: Production did NOT gain volume when extending into reservoir zone'
  );
  console.log(
    '✓ Reservoir kept its volume (it claims the overlapping segment 3277.5-3500)'
  );
} else if (prodChange > 1.0) {
  console.log(
    '✗ WRONG: Production gained volume when extending into reservoir zone'
  );
  console.log('  (should have gone to reservoir instead)');
} else {
  console.log(
    `? Unclear: Production change = ${prodChange.toFixed(
      2
    )}, Reservoir change = ${resvChange.toFixed(2)}`
  );
}
