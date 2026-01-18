(async () => {
  const assert = require('assert');
  const { JSDOM } = require('jsdom');
  const mod = await import('../src/js/volume.js');
  const { createVolumeCalc } = mod;

  // Build a minimal DOM for the init path
  const dom = new JSDOM(`<!doctype html><html><body>
    <select id="preset_list"></select>
    <button id="load_preset_btn">Load</button>
    <input type="checkbox" id="use_18" />
  </body></html>`);
  const document = dom.window.document;

  // Fake XHR that behaves synchronously and returns a payload containing P-9
  class FakeSyncXHR {
    constructor() {
      this.status = 200;
      this.responseText = JSON.stringify({
        presets: {
          'P-9': { state: { use_18: { type: 'checkbox', value: false } } },
        },
      });
    }
    open(method, url, async) {
      this._async = async;
      this._method = method;
      this._url = url;
    }
    send() {
      // synchronous send; nothing else required
    }
  }

  // Minimal storage shim
  const store = {};
  const fakeStorage = {
    getItem(k) {
      return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null;
    },
    setItem(k, v) {
      store[k] = v;
    },
  };

  // Adapter that delegates to JSDOM document
  const adapter = {
    el: (id) => document.getElementById(id),
    qs: (s) => Array.from(document.querySelectorAll(s)),
    createElement: (tag) => document.createElement(tag),
    body: document.body,
    safeDispatchChange: (el) => {
      try {
        el.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
      } catch (e) {}
    },
  };

  const instance = createVolumeCalc({ dom: adapter, XMLHttpRequest: FakeSyncXHR, storage: fakeStorage });

  // Run init which should synchronously load builtin presets via our FakeSyncXHR
  instance.init();

  // verify the preset list contains P-9
  const sel = document.getElementById('preset_list');
  const names = Array.from(sel.options).map((o) => o.value).filter(Boolean);
  assert.ok(names.includes('P-9'), 'P-9 should be present in preset options');

  // simulate loading the preset via the UI wiring
  sel.value = 'P-9';
  const loadBtn = document.getElementById('load_preset_btn');
  loadBtn.click();

  // after applying, the resulting checkbox state should reflect the preset
  const use18 = document.getElementById('use_18');
  assert.strictEqual(use18.checked, false, 'P-9 should untoggle conductor (use_18)');

  console.log('volume DI tests OK');
})();