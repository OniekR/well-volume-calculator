(async () => {
  const assert = require("assert");
  const { JSDOM } = require("jsdom");
  const dom = new JSDOM(`<!doctype html><body></body>`);
  global.window = dom.window;
  global.document = dom.window.document;

  const draw = require("../src/js/draw.js");

  let calls = { clear: 0, fill: 0 };

  const fakeCtx = {
    clearRect: () => {
      calls.clear++;
    },
    fillRect: () => {
      calls.fill++;
    },
  };

  const canvas = { width: 100, height: 200, getContext: () => fakeCtx };

  draw.scheduleDraw(
    canvas,
    fakeCtx,
    [
      { role: "riser", depth: 100 },
      { role: "conductor", depth: 200 },
    ],
    { showWater: true, waterDepth: 50 }
  );

  assert(calls.clear > 0, "expected clearRect to be called");
  assert(calls.fill > 0, "expected some fillRect calls");

  console.log("draw tests OK");
})();
