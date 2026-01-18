// Small DOM adapter so modules can be decoupled from direct `document` usage.
// Exposes `el`, `qs`, `safeDispatchChange` and a `setAdapter` hook for tests.

function defaultEl(id) {
  return typeof document !== "undefined" ? document.getElementById(id) : null;
}

function defaultQs(sel) {
  return typeof document !== "undefined" ? Array.from(document.querySelectorAll(sel)) : [];
}

function defaultSafeDispatchChange(element) {
  try {
    if (!element) return;
    if (typeof window !== "undefined" && typeof window.Event === "function") {
      element.dispatchEvent(new window.Event("change", { bubbles: true }));
    } else if (typeof Event === "function") {
      element.dispatchEvent(new Event("change", { bubbles: true }));
    }
  } catch (e) {
    // ignore environments that can't dispatch events
  }
}

function defaultCreateElement(tag) {
  if (typeof document !== 'undefined') return document.createElement(tag);
  return { tagName: String(tag).toUpperCase(), dataset: {}, textContent: '', value: '', appendChild() {}, remove() {}, setAttribute() {}, classList: { add() {}, remove() {} } };
}

const adapter = {
  el: defaultEl,
  qs: defaultQs,
  safeDispatchChange: defaultSafeDispatchChange,
  createElement: defaultCreateElement,
  body: typeof document !== 'undefined' ? document.body : null,
  setAdapter(a) {
    if (!a || typeof a !== 'object') return;
    if (typeof a.el === 'function') this.el = a.el;
    if (typeof a.qs === 'function') this.qs = a.qs;
    if (typeof a.safeDispatchChange === 'function') this.safeDispatchChange = a.safeDispatchChange;
    if (typeof a.createElement === 'function') this.createElement = a.createElement;
    if (typeof a.body !== 'undefined') this.body = a.body;
  },
};

module.exports = adapter;
