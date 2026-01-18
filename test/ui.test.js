(async () => {
  const assert = require("assert");
  const { JSDOM } = require("jsdom");
  const dom = new JSDOM(`<!doctype html><body>
    <select id="conductor_size"><option value="17.8">opt</option><option value="28">opt2</option></select>
    <input id="conductor_size_id" />
  </body>`);
  global.window = dom.window;
  global.document = dom.window.document;

  const ui = require("../src/js/ui.js");

  let calcCalled = false;
  let saveCalled = false;

  ui.setupSizeIdInputs({
    calculateVolume: () => {
      calcCalled = true;
    },
    scheduleSave: () => {
      saveCalled = true;
    },
  });

  const sel = document.getElementById("conductor_size");
  const idInput = document.getElementById("conductor_size_id");

  // initial id should match select
  assert.strictEqual(idInput.value, sel.value);

  // change select should sync id and call scheduleSave & calculateVolume
  sel.value = "28";
  sel.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert.strictEqual(idInput.value, "28");
  assert.strictEqual(calcCalled, true);
  assert.strictEqual(saveCalled, true);

  // id input behaves as user edited
  idInput.value = "99";
  idInput.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert.strictEqual(idInput.dataset.userEdited, "true");
  calcCalled = false;
  saveCalled = false;
  sel.value = "17.8";
  sel.dispatchEvent(new window.Event("change", { bubbles: true }));
  // select change still runs scheduleSave/calculateVolume, but id input should remain user-edited
  assert.strictEqual(idInput.value, "99");
  assert.strictEqual(calcCalled, true);
  assert.strictEqual(saveCalled, true);

  console.log("ui tests OK");
})();
