import { computeVolumes } from '../logic.js';

// Test user's exact scenario:
// DP1: 5 7/8" (5.875"), Length: 362m
// Riser: 13.5" ID, 0-450m
// Intermediate: 11.0" ID, 300-450m (starts at 300m)
// POI: 362m

const casings = [
  {
    role: 'riser',
    id: 13.5,
    od: 15.5,
    top: 0,
    depth: 450,
    use: true
  },
  {
    role: 'intermediate',
    id: 11.0,
    od: 12.5,
    top: 300,
    depth: 450,
    use: true
  }
];

const drillPipeInput = {
  mode: 'drillpipe',
  pipes: [
    {
      size: 1,
      length: 362,
      lPerM: 13.1, // 5 7/8" DP
      od: 5.875
    }
  ]
};

const result = computeVolumes(casings, {
  plugEnabled: true,
  plugDepthVal: 362,
  drillPipe: drillPipeInput
});

console.log('\n=== USER SCENARIO TEST ===');
console.log('DP1: 5 7/8", 362m');
console.log('Riser: 13.5" ID, 0-450m');
console.log('Intermediate: 11.0" ID, 300-450m');
console.log('POI: 362m');
console.log('\n=== RESULTS ===');
console.log(
  `Volume above POI (DP ID): ${(result.plugAboveDrillpipe || 0).toFixed(2)} m³`
);
console.log(
  `Volume above POI (Annulus): ${(
    result.plugAboveDrillpipeAnnulus || 0
  ).toFixed(2)} m³`
);
console.log(
  `Volume above POI (Open casing): ${(
    result.plugAboveDrillpipeOpenCasing || 0
  ).toFixed(2)} m³`
);
console.log(
  `Volume below POI (DP ID): ${(result.plugBelowDrillpipe || 0).toFixed(2)} m³`
);
console.log(
  `Volume below POI (Annulus): ${(
    result.plugBelowDrillpipeAnnulus || 0
  ).toFixed(2)} m³`
);

// Calculate expected values
const casingIdRadius = (13.5 / 2) * 0.0254;
const casingIdArea = Math.PI * Math.pow(casingIdRadius, 2);
const dpOdRadius = (5.875 / 2) * 0.0254;
const dpOdArea = Math.PI * Math.pow(dpOdRadius, 2);

// 0-300m: Riser only
const annulusArea1 = Math.max(0, casingIdArea - dpOdArea);
const expectedAnnulus1 = annulusArea1 * 300;

// 300-362m: Intermediate (11" ID, innermost)
const casingIdRadius2 = (11.0 / 2) * 0.0254;
const casingIdArea2 = Math.PI * Math.pow(casingIdRadius2, 2);
const annulusArea2 = Math.max(0, casingIdArea2 - dpOdArea);
const expectedAnnulus2 = annulusArea2 * 62;

const expectedTotalAnnulus = expectedAnnulus1 + expectedAnnulus2;

console.log('\n=== EXPECTED VALUES ===');
console.log(
  `Expected annulus (0-300m with Riser): ${expectedAnnulus1.toFixed(2)} m³`
);
console.log(
  `Expected annulus (300-362m with Intermediate): ${expectedAnnulus2.toFixed(
    2
  )} m³`
);
console.log(
  `Expected total annulus above POI: ${expectedTotalAnnulus.toFixed(2)} m³`
);

console.log('\n=== VERIFICATION ===');
const annulusDiff = Math.abs(
  result.plugAboveDrillpipeAnnulus - expectedTotalAnnulus
);
if (annulusDiff < 0.1) {
  console.log('✓ Annulus calculation CORRECT');
} else {
  console.log(
    `✗ Annulus calculation ERROR - difference: ${annulusDiff.toFixed(2)} m³`
  );
}
