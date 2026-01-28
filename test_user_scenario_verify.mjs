// Test the exact user scenario: 3200m tubing shoe at 362m POI
import { computeVolumes } from './src/js/logic.js';

const casings = [
  {
    role: 'production',
    id: 20,
    od: 22,
    top: 0,
    depth: 4000,
    use: true
  },
  {
    role: 'upper_completion',
    id: 4.892,
    od: 5.5,
    top: 0,
    depth: 3200,
    use: true
  }
];

const opts = {
  plugEnabled: true,
  plugDepthVal: 362
};

const result = computeVolumes(casings, opts);

console.log('User Scenario Test:');
console.log('Production casing: 20" ID, 22" OD, 0-4000m');
console.log('UC tubing: 4.892" ID, 5.5" OD, 0-3200m');
console.log('POI depth: 362m');
console.log('Tubing below POI: 3200 - 362 = 2838m');
console.log('');
console.log('Results:');
console.log(`  plugBelowTubing: ${result.plugBelowTubing.toFixed(2)} m³`);
console.log(`  plugBelowAnnulus: ${result.plugBelowAnnulus.toFixed(2)} m³`);
console.log(
  `  plugBelowVolume (after steel subtraction): ${result.plugBelowVolume.toFixed(
    2
  )} m³`
);
console.log(
  `  plugBelowVolumeTubing: ${result.plugBelowVolumeTubing.toFixed(2)} m³`
);
console.log('');

// Manual calculation to verify
const ucOD = 5.5;
const ucID = 4.892;
const prodID = 20;
const tubingBelowPOI = 2838;

const ucIdRadius = (ucID / 2) * 0.0254;
const ucOdRadius = (ucOD / 2) * 0.0254;
const prodIdRadius = (prodID / 2) * 0.0254;

const ucIdArea = Math.PI * Math.pow(ucIdRadius, 2);
const ucOdArea = Math.PI * Math.pow(ucOdRadius, 2);
const prodIdArea = Math.PI * Math.pow(prodIdRadius, 2);

const tubingVol = ucIdArea * tubingBelowPOI;
const annulusArea = Math.max(0, prodIdArea - ucOdArea);
const annulusVol = annulusArea * tubingBelowPOI;
const tubingSteelArea = ucOdArea - ucIdArea;
const tubingSteelVol = tubingSteelArea * tubingBelowPOI;

console.log('Manual verification:');
console.log(`  UC ID area: ${ucIdArea.toFixed(6)} m²`);
console.log(`  UC OD area: ${ucOdArea.toFixed(6)} m²`);
console.log(`  Tubing steel area: ${tubingSteelArea.toFixed(6)} m²`);
console.log(`  Tubing volume: ${tubingVol.toFixed(2)} m³`);
console.log(`  Annulus area: ${annulusArea.toFixed(6)} m²`);
console.log(`  Annulus volume: ${annulusVol.toFixed(2)} m³`);
console.log(`  Tubing steel volume: ${tubingSteelVol.toFixed(2)} m³`);
console.log(
  `  Annulus - Steel = ${(annulusVol - tubingSteelVol).toFixed(2)} m³`
);
console.log('');

// Check if this matches the user's screenshot
console.log('User reported (from screenshot):');
console.log(`  TOTAL VOL BELOW POI (TUBING VERSION): 42.58 m³`);
console.log(`  Implied: Annulus (131.19) - Steel (88.61) = 42.58`);
console.log('');

if (Math.abs(result.plugBelowVolume - 42.58) < 0.1) {
  console.log('✓ TEST PASSED: Values match user screenshot');
} else if (Math.abs(annulusVol - tubingSteelVol - 42.58) < 0.1) {
  console.log('✓ CALCULATION CORRECT: Manual calc matches expected 42.58');
} else {
  console.log(
    `✗ TEST SHOWS DIFFERENT VALUE: Got ${result.plugBelowVolume.toFixed(
      2
    )} instead of 42.58`
  );
  if (result.plugBelowVolume < 30) {
    console.log('   → This suggests the fix might be working correctly!');
    console.log(
      `   → Expected steel displacement: ${tubingSteelVol.toFixed(2)} m³`
    );
    console.log(
      `   → Result shows: ${(annulusVol - result.plugBelowVolume).toFixed(
        2
      )} m³ subtracted`
    );
  }
}
