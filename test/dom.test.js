(async () => {
  const assert = require("assert");
  const { JSDOM } = require("jsdom");
  const d = new JSDOM(`<!doctype html><body></body>`);
  global.window = d.window;
  global.document = d.window.document;
  const dom = require("../src/js/dom");

  // el and qs work against document
  document.body.innerHTML = `<div id="foo" class="bar"></div><div class="bar"></div>`;
  const el = dom.el("foo");
  assert.ok(el, "expected element by id");
  const list = dom.qs(".bar");
  assert.strictEqual(list.length, 2);

  // safeDispatchChange dispatches change event
  document.body.innerHTML = `<input id="chk" type="checkbox">`;
  const chk = dom.el("chk");
  let called = false;
  chk.addEventListener("change", () => (called = true));
  dom.safeDispatchChange(chk);
  // allow event microtask to run
  await new Promise((r) => setTimeout(r, 0));
  assert.ok(called, "change event should be dispatched");

  // setAdapter overrides implementation
  const custom = { el: (id) => ({ id: id }), qs: (s) => [s], safeDispatchChange: () => {} };
  dom.setAdapter(custom);
  assert.strictEqual(dom.el("x").id, "x");
  assert.strictEqual(dom.qs(".x")[0], ".x");

  // restore defaults for other tests
  dom.setAdapter({
    el: (id) => document.getElementById(id),
    qs: (sel) => Array.from(document.querySelectorAll(sel)),
    safeDispatchChange: dom.safeDispatchChange,
  });

  console.log("dom adapter tests OK");
})();
