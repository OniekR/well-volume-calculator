(async () => {
  const assert = require("assert");
  const { JSDOM } = require("jsdom");
  const dom = new JSDOM(`<!doctype html><body>
    <select id="surface_size"><option value="17.8">opt</option><option value="18.73">opt2</option></select>
    <input id="surface_size_id" />
  </body>`);
  global.window = dom.window;
  global.document = dom.window.document;

  const mod = require("../src/js/volume.js");
  const { VolumeCalc } = mod;

  // init wires handlers
  VolumeCalc.init();

  const sel = document.getElementById("surface_size");
  const idInput = document.getElementById("surface_size_id");
  // initial id should match select
  assert.strictEqual(idInput.value, sel.value);

  // simulate user editing id -> mark userEdited
  idInput.value = "99";
  idInput.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert.strictEqual(idInput.dataset.userEdited, "true");

  // change select -> id should NOT follow because user edited
  sel.value = "18.73";
  sel.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert.strictEqual(idInput.value, "99");

  console.log("size-id tests OK");
})();
