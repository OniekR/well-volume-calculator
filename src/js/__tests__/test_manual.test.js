import { computeVolumes } from '../logic.js';

// Test case from user scenario:
// Tubing mode: shoe at 363m
const casings363 = [
  { role: 'riser', id: 13.5, od: 15.5, top: 0, depth: 450, use: true },
  { role: 'intermediate', id: 11, od: 12.5, top: 300, depth: 450, use: true }
];

const result363Tubing = computeVolumes(casings363, {
  plugEnabled: true,
  plugDepthVal: 362,
  drillPipe: { mode: 'tubing', pipes: [] }
});

console.log('\n=== TUBING MODE (shoe 363m) ===');
console.log('plugBelowVolume:', result363Tubing.plugBelowVolume);
console.log('plugBelowVolumeTubing:', result363Tubing.plugBelowVolumeTubing);

// Same casings with DP mode
const result363DP = computeVolumes(casings363, {
  plugEnabled: true,
  plugDepthVal: 362,
  drillPipe: {
    mode: 'drillpipe',
    pipes: [{ size: 1, length: 363, lPerM: 13.1, od: 5.875, eod: 4.739 }]
  }
});

console.log('\n=== DP MODE (DP 363m) ===');
console.log('plugBelowVolume:', result363DP.plugBelowVolume);
console.log('plugBelowVolumeTubing:', result363DP.plugBelowVolumeTubing);

// Now change tubing shoe to 3000m (crosses POI)
const casings3000 = [
  { role: 'riser', id: 13.5, od: 15.5, top: 0, depth: 3100, use: true },
  { role: 'intermediate', id: 11, od: 12.5, top: 300, depth: 3100, use: true }
];

const result3000Tubing = computeVolumes(casings3000, {
  plugEnabled: true,
  plugDepthVal: 362,
  drillPipe: { mode: 'tubing', pipes: [] }
});

console.log('\n=== TUBING MODE (shoe 3000m) ===');
console.log('plugBelowVolume:', result3000Tubing.plugBelowVolume);
console.log('plugBelowVolumeTubing:', result3000Tubing.plugBelowVolumeTubing);

// Same but switch back to DP
const result3000DP = computeVolumes(casings3000, {
  plugEnabled: true,
  plugDepthVal: 362,
  drillPipe: {
    mode: 'drillpipe',
    pipes: [{ size: 1, length: 363, lPerM: 13.1, od: 5.875, eod: 4.739 }]
  }
});

console.log('\n=== DP MODE (same as before, DP 363m) ===');
console.log('plugBelowVolume:', result3000DP.plugBelowVolume);
console.log('plugBelowVolumeTubing:', result3000DP.plugBelowVolumeTubing);

console.log('\n=== VERIFICATION ===');
console.log('DP mode total should be the same in both cases:');
console.log('First DP run:', result363DP.plugBelowVolume);
console.log('Second DP run:', result3000DP.plugBelowVolume);
console.log(
  'Match?',
  Math.abs(result363DP.plugBelowVolume - result3000DP.plugBelowVolume) < 0.01
);

console.log('\nTubing mode plugBelowVolumeTubing should differ:');
console.log('First tubing run (363m):', result363Tubing.plugBelowVolumeTubing);
console.log(
  'Second tubing run (3000m):',
  result3000Tubing.plugBelowVolumeTubing
);
console.log(
  'Different?',
  Math.abs(
    result363Tubing.plugBelowVolumeTubing -
      result3000Tubing.plugBelowVolumeTubing
  ) > 0.01
);
