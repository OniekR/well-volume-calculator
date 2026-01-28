// Quick test to verify steel displacement calculation
// 5 1/2" tubing, lPerM = 12.1, 2838m below POI

function inchesToMeters(inches) {
  const n = Number(inches);
  return isFinite(n) ? n * 0.0254 : 0;
}

function calculatePipeSteelAreaFromLPerM(odInches, lPerM) {
  const odMeters = inchesToMeters(odInches);
  if (!isFinite(odMeters) || odMeters <= 0) return 0;

  const lPerMNum = Number(lPerM);
  if (!isFinite(lPerMNum) || lPerMNum <= 0) return 0;

  const odRadius = odMeters / 2;
  const odArea = Math.PI * Math.pow(odRadius, 2);
  const idArea = lPerMNum / 1000; // lPerM / 1000 = ID area in m²

  console.log({
    odInches,
    lPerM,
    odMeters,
    odRadius,
    odArea,
    idArea,
    steelArea: odArea - idArea
  });

  return Math.max(0, odArea - idArea);
}

// Test: 5 1/2" OD, 12.1 L/m, 2838m length
const od = 5.5;
const lPerM = 12.1;
const length = 2838;

const steelArea = calculatePipeSteelAreaFromLPerM(od, lPerM);
const steelVolume = steelArea * length;

console.log('\n5 1/2" tubing below POI:');
console.log(`OD: ${od} inches`);
console.log(`lPerM: ${lPerM} L/m`);
console.log(`Length: ${length} m`);
console.log(`Steel area: ${steelArea.toFixed(6)} m²`);
console.log(`Steel volume: ${steelVolume.toFixed(2)} m³`);

// Also test what the ID area means
const idVolumePerMeter = lPerM / 1000; // m³/m
const idRadiusFromArea = Math.sqrt(idVolumePerMeter / Math.PI);
const idDiameterFromArea = (idRadiusFromArea * 2) / 0.0254; // convert back to inches

console.log(`\nDerived from lPerM (for reference):`);
console.log(`ID area from lPerM: ${idVolumePerMeter.toFixed(6)} m²`);
console.log(`ID radius derived: ${idRadiusFromArea.toFixed(6)} m`);
console.log(`ID diameter derived: ${idDiameterFromArea.toFixed(3)} inches`);

// Calculate total volume in tubing
const odArea = Math.PI * Math.pow(inchesToMeters(od) / 2, 2);
const totalVolume = odArea * length;
console.log(`\nTotal tubing volume: ${totalVolume.toFixed(2)} m³`);
console.log(`ID volume: ${(idVolumePerMeter * length).toFixed(2)} m³`);
console.log(`Steel volume: ${steelVolume.toFixed(2)} m³`);
console.log(
  `Sum (ID + Steel): ${(idVolumePerMeter * length + steelVolume).toFixed(2)} m³`
);
