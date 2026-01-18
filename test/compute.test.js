(async () => {
  const assert = require("assert");
  const mod = await import("../src/js/volume.js");
  const { computeVolumes } = mod;

  // Overlap allocation: smaller numeric ID wins
  const casingsOverlap = [
    { role: "production", id: 9, top: 0, depth: 500, use: true, od: 9.625 },
    { role: "reservoir", id: 5, top: 0, depth: 500, use: true, od: 5.5 },
  ];
  const r1 = computeVolumes(casingsOverlap, {});
  const prod = r1.perCasingVolumes.find((p) => p.role === "production");
  const resv = r1.perCasingVolumes.find((p) => p.role === "reservoir");
  assert.ok(
    resv.volume > prod.volume,
    "Reservoir should get more volume than Production when IDs smaller"
  );

  // Plug split: simple single-casing split into above/below
  const casingSingle = [{ role: "production", id: 10, top: 0, depth: 100, use: true, od: 9.625 }];
  const r2 = computeVolumes(casingSingle, { plugEnabled: true, plugDepthVal: 30 });
  const area = Math.PI * Math.pow((10 / 2) * 0.0254, 2);
  const expectedAbove = area * 30;
  const expectedBelow = area * 70;
  const eps = 1e-6;
  assert.ok(
    Math.abs(r2.plugAboveVolume - expectedAbove) < eps,
    `plugAbove mismatch: ${r2.plugAboveVolume} != ${expectedAbove}`
  );
  assert.ok(
    Math.abs(r2.plugBelowVolume - expectedBelow) < eps,
    `plugBelow mismatch: ${r2.plugBelowVolume} != ${expectedBelow}`
  );

  console.log("compute tests OK");
})();
