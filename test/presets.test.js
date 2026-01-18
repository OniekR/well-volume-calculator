(async () => {
  const assert = require("assert");
  const mod = await import("../src/js/volume.js");
  const { VolumeCalc } = mod;

  // Should return an array (empty if no presets stored / built-in unavailable)
  const names = VolumeCalc.getPresetNames();
  assert.ok(Array.isArray(names));

  // getPresetState should return null for missing name
  assert.strictEqual(VolumeCalc.getPresetState("this-does-not-exist"), null);

  console.log("presets tests OK");
})();
