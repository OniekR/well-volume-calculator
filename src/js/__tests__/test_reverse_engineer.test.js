// Test to find where 88.61 m³ is coming from

function calculateAreas(odInches, idInches) {
  const odRadius = (odInches / 2) * 0.0254;
  const idRadius = (idInches / 2) * 0.0254;
  const odArea = Math.PI * Math.pow(odRadius, 2);
  const idArea = Math.PI * Math.pow(idRadius, 2);
  const steelArea = odArea - idArea;

  return { odArea, idArea, steelArea };
}

// Correct calculation: 5.5" OD, 4.892" ID
const correct = calculateAreas(5.5, 4.892);
console.log('Correct (5.5 OD, 4.892 ID):');
console.log(`  Steel area: ${correct.steelArea.toFixed(6)} m²`);
console.log(
  `  Steel volume for 2838m: ${(correct.steelArea * 2838).toFixed(2)} m³`
);

// What if OD was incorrectly used as radius?
const odAsRadius = calculateAreas(5.5 * 2, 4.892);
console.log('\nIf OD was used as radius (buggy):');
console.log(`  Steel area: ${odAsRadius.steelArea.toFixed(6)} m²`);
console.log(
  `  Steel volume for 2838m: ${(odAsRadius.steelArea * 2838).toFixed(2)} m³`
);

// What if both were used as radii?
const bothRadii = calculateAreas(5.5 * 2, 4.892 * 2);
console.log('\nIf both used as radii (very buggy):');
console.log(`  Steel area: ${bothRadii.steelArea.toFixed(6)} m²`);
console.log(
  `  Steel volume for 2838m: ${(bothRadii.steelArea * 2838).toFixed(2)} m³`
);

// What if someone used the difference of radii squared?
const rad_od = (5.5 / 2) * 0.0254;
const rad_id = (4.892 / 2) * 0.0254;
const buggyArea = Math.PI * Math.pow(rad_od - rad_id, 2);
console.log('\nIf using (OD_radius - ID_radius)² (buggy formula):');
console.log(`  Steel area: ${buggyArea.toFixed(6)} m²`);
console.log(`  Steel volume for 2838m: ${(buggyArea * 2838).toFixed(2)} m³`);

// What if diameter difference squared?
const diamDiff = 5.5 - 4.892;
const buggyArea2 = Math.PI * Math.pow((diamDiff / 2) * 0.0254, 2);
console.log('\nIf using ((OD - ID) / 2)² (same as above):');
console.log(`  Steel area: ${buggyArea2.toFixed(6)} m²`);
console.log(`  Steel volume for 2838m: ${(buggyArea2 * 2838).toFixed(2)} m³`);

// What if using full OD and ID diameters without the / 2?
const noDiv2 =
  Math.PI * (Math.pow(5.5 * 0.0254, 2) - Math.pow(4.892 * 0.0254, 2));
console.log('\nIf not dividing radius by 2 (very buggy):');
console.log(`  Steel area: ${noDiv2.toFixed(6)} m²`);
console.log(`  Steel volume for 2838m: ${(noDiv2 * 2838).toFixed(2)} m³`);

// Try to reverse-engineer: if 88.61 m³, what would the area be?
const targetVol = 88.61;
const impliedArea = targetVol / 2838;
console.log(`\nReverse engineering from 88.61 m³:`);
console.log(`  Implied steel area: ${impliedArea.toFixed(6)} m²`);
console.log(
  `  Implied OD area (assuming ID 4.892): ${(
    impliedArea + correct.idArea
  ).toFixed(6)} m²`
);
console.log(
  `  Implied OD from area: ${(
    (2 * Math.sqrt(impliedArea / Math.PI + correct.idArea / Math.PI)) /
    0.0254
  ).toFixed(3)} inches`
);
