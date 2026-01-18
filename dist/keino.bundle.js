"use strict";
var VolumeCalc = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/js/volume.entry.js
  var volume_entry_exports = {};
  __export(volume_entry_exports, {
    default: () => volume_entry_default
  });
  var VolumeCalc = (() => {
    const STORAGE_KEY = "keino_volume_state_v2";
    const OD = {
      conductor: { 17.8: 18.625, 28: 30, 27: 30 },
      riser: { 17.5: 20, 8.5: 9.5 },
      surface: { 18.73: 20, 17.8: 18.625 },
      intermediate: { 12.347: 13.375, 12.375: 13.625 },
      production: { 6.276: 7, 8.921: 9.625 },
      tieback: { 8.535: 9.625, 8.921: 9.625, 9.66: 11.5 },
      reservoir: { 6.276: 7, 4.778: 5.5 }
    };
    const el = (id) => document.getElementById(id);
    const qs = (selector) => Array.from(document.querySelectorAll(selector));
    try {
      if (typeof window !== "undefined") {
        window.__TEST_applyTheme = (mode) => {
          if (mode === "dark")
            document.documentElement.setAttribute("data-theme", "dark");
          else
            document.documentElement.removeAttribute("data-theme");
          try {
            localStorage.setItem("keino_theme", mode === "dark" ? "dark" : "light");
          } catch (e) {
          }
        };
      }
    } catch (e) {
    }
    const canvas = el("wellSchematic");
    const ctx = canvas && canvas.getContext("2d");
    const totalVolumeEl = el("totalVolume");
    const form = el("well-form") || document.body;
    let saveTimer = null;
    let drawScheduled = false;
    let lastDrawArgs = null;
    const clampNumber = (v) => isNaN(v) ? void 0 : Number(v);
    function resizeCanvasForDPR() {
      if (!canvas || !ctx)
        return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
    const debouncedResize = (() => {
      let t;
      return () => {
        clearTimeout(t);
        t = setTimeout(() => resizeCanvasForDPR(), 120);
      };
    })();
    function saveState() {
      const state = {};
      qs("input[id], select[id]").forEach((input) => {
        if (!input.id)
          return;
        if (input.type === "checkbox")
          state[input.id] = { type: "checkbox", value: !!input.checked };
        else
          state[input.id] = { type: input.tagName.toLowerCase(), value: input.value };
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
      }
    }
    function scheduleSave() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveState, 200);
    }
    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
          return;
        const state = JSON.parse(raw);
        Object.entries(state).forEach(([id, item]) => {
          const input = el(id);
          if (!input)
            return;
          if (item.type === "checkbox")
            input.checked = !!item.value;
          else
            input.value = item.value;
        });
      } catch (e) {
      }
    }
    function init() {
      loadState();
      resizeCanvasForDPR();
      window.addEventListener("resize", debouncedResize);
      calculateVolume();
    }
    function calculateVolume() {
    }
    return { init, calculateVolume, saveState };
  })();
  var volume_entry_default = VolumeCalc;
  return __toCommonJS(volume_entry_exports);
})();
//# sourceMappingURL=keino.bundle.js.map
