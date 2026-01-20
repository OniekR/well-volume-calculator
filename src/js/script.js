'use strict';

import { computeVolumes, computeUpperCompletionBreakdown } from './logic.js';
import {
  initDraw,
  scheduleDraw as scheduleDrawFn,
  drawSchematic as drawSchematicFn
} from './draw.js';
import {
  captureStateObject,
  applyStateObject as applyStateObjectFn
} from './state.js';
import { initUI } from './ui.js';
import { OD } from './constants.js';
import { gatherInputs } from './inputs.js';
import { validateUpperCompletionFit } from './validation.js';
import { renderResults, renderUpperCompletionBreakdown } from './render.js';
import { setupPresetsUI } from './presets-ui.js';
import { createPersistence } from './persistence.js';

/*
 * Refactored module for the Well Volume Calculator
 * - Encapsulates state
 * - Caches DOM queries
 * - Debounces saves
 * - Uses requestAnimationFrame for drawing
 * - Handles high-DPI canvas scaling
 */
const VolumeCalc = (() => {
  const STORAGE_KEY = 'keino_volume_state_v2';

  const el = (id) => document.getElementById(id);
  const qs = (selector) => Array.from(document.querySelectorAll(selector));

  // Test helper: allow tests to set theme even if setup didn't run in some environments
  try {
    if (typeof window !== 'undefined') {
      window.__TEST_applyTheme = (mode) => {
        if (mode === 'dark')
          document.documentElement.setAttribute('data-theme', 'dark');
        else document.documentElement.removeAttribute('data-theme');
        try {
          localStorage.setItem(
            'keino_theme',
            mode === 'dark' ? 'dark' : 'light'
          );
        } catch (e) {
          /* ignore */
        }
      };

      // Debug helper: dump current inputs and computed volumes
      window.__TEST_dumpState = () => {
        try {
          const state = gatherInputs();
          const volumes = computeVolumes(state.casingsInput, {
            plugEnabled: state.plugEnabled,
            plugDepthVal: state.plugDepthVal,
            surfaceInUse: state.surfaceInUse,
            intermediateInUse: state.intermediateInUse
          });
          return { inputs: state, volumes };
        } catch (e) {
          return { error: e && e.message ? e.message : String(e) };
        }
      };
    }
  } catch (e) {
    /* ignore */
  }

  // Cached DOM
  const canvas = el('wellSchematic');
  const ctx = canvas && canvas.getContext('2d');
  const totalVolumeEl = el('totalVolume');
  const form = el('well-form') || document.body;

  // State
  let saveTimer = null;
  // Currently loaded or saved preset name (displayed on the canvas)
  let currentPresetName = '';

  // Utilities
  const clampNumber = (v) => (isNaN(v) ? undefined : Number(v));

  // Drawing responsibilities (canvas sizing, DPR, scheduling) are provided by `src/js/draw.js`.
  // Initialize drawing module with the canvas element later during setup via `initDraw(canvas)`.

  // Presets
  // Preset management has been delegated to the module `src/js/presets.js`.
  // The module attaches helpers to `window.__KeinoPresets` for compatibility.
  // `captureStateObject` and `applyStateObject` are provided by `src/js/state.js`.
  // IDs we should not populate when loading a preset
  // IDs we should not populate when loading a preset (UI-only controls)
  const _SKIP_POPULATE_ON_LOAD = new Set([
    'preset_name',
    'preset_list',
    'import_presets_input'
  ]);

  function applyStateObject(state) {
    // Delegate to `state.js` implementation and provide local callbacks
    const scheduleSaveSafe = (...args) => {
      if (
        typeof persistence !== 'undefined' &&
        persistence &&
        typeof persistence.scheduleSave === 'function'
      ) {
        return persistence.scheduleSave(...args);
      }
      // noop if persistence unavailable (e.g., called before init)
    };
    return applyStateObjectFn(state, {
      calculateVolume,
      scheduleSave: scheduleSaveSafe
    });
  }

  // Ensure each casing section collapsed/expanded state matches its checkbox
  // (some environments may not run checkbox change handlers reliably, so
  // force the visible state here).
  qs('.casing-input').forEach((section) => {
    const checkbox =
      section.querySelector('.use-checkbox') ||
      section.querySelector('input[type=checkbox]');
    const header = section.querySelector('.casing-header');
    if (!checkbox || !header) return;
    if (checkbox.checked) {
      section.classList.remove('collapsed');
      header.setAttribute('aria-expanded', 'true');
    } else {
      section.classList.add('collapsed');
      header.setAttribute('aria-expanded', 'false');
    }
  });

  // update UI (change events already trigger calculate/save) — initial save handled during init().
  calculateVolume();

  // Ensure production toggle buttons reflect the newly loaded preset values.
  try {
    const prodLinerEl = el('production_is_liner');
    const casingBtn = el('production_casing_btn');
    const linerBtn = document.querySelector('.liner-default-btn');
    const prodTopEl = el('depth_7_top');
    if (prodLinerEl && prodLinerEl.checked) {
      if (linerBtn) {
        linerBtn.classList.add('active');
        linerBtn.setAttribute('aria-pressed', 'true');
      }
      if (casingBtn) {
        casingBtn.classList.remove('active');
        casingBtn.setAttribute('aria-pressed', 'false');
      }
    } else if (prodTopEl && prodTopEl.value !== '') {
      if (casingBtn) {
        casingBtn.classList.add('active');
        casingBtn.setAttribute('aria-pressed', 'true');
      }
      if (linerBtn) {
        linerBtn.classList.remove('active');
        linerBtn.setAttribute('aria-pressed', 'false');
      }
    } else {
      if (linerBtn) {
        linerBtn.classList.add('active');
        linerBtn.setAttribute('aria-pressed', 'true');
      }
      if (casingBtn) {
        casingBtn.classList.remove('active');
        casingBtn.setAttribute('aria-pressed', 'false');
      }
    }
  } catch (e) {
    /* ignore */
  }

  // Preset helpers are provided by the external module `src/js/presets.js`.
  // We rely on `window.__KeinoPresets` for all preset storage and built-in preset
  // handling. Keeping these functions here introduced duplication and bugs,
  // so they are intentionally removed. Use the module APIs instead.

  // Export/import/save/delete/preset-name utilities are provided by the module.
  // (Delegated to `src/js/presets.js` via `window.__KeinoPresets`).

  // Import presets: delegate to the presets module
  function importPresetsFile(file) {
    if (
      window.__KeinoPresets &&
      typeof window.__KeinoPresets.importPresetsFile === 'function'
    ) {
      return window.__KeinoPresets.importPresetsFile(file);
    }
    alert('Preset module unavailable.');
  }

  // Drawing: delegate scheduling and rendering to the draw module
  function scheduleDraw(casings, opts = {}) {
    return scheduleDrawFn(
      casings,
      Object.assign({}, opts, { currentPresetName })
    );
  }

  function drawSchematic(casings, opts = {}) {
    // delegate to draw module implementation, include the current preset name on the canvas
    return drawSchematicFn(
      casings,
      Object.assign({}, opts, { currentPresetName })
    );
  }

  // Core calc: read DOM, compute volumes and draw params
  function calculateVolume() {
    // Gather all inputs and computed auto-tops
    const {
      casingsInput,
      plugEnabled,
      plugDepthVal,
      surfaceInUse,
      intermediateInUse,
      riserTypeVal,
      riserDepthVal,
      wellheadDepthVal
    } = gatherInputs();

    const result = computeVolumes(casingsInput, {
      plugEnabled,
      plugDepthVal,
      surfaceInUse,
      intermediateInUse
    });
    const {
      totalVolume,
      perCasingVolumes,
      casingsToDraw,
      plugAboveVolume,
      plugBelowVolume
    } = result;

    // Render results to DOM
    renderResults(result);

    // Render upper completion breakdown
    const ucBreakdown = computeUpperCompletionBreakdown(casingsInput);
    renderUpperCompletionBreakdown(ucBreakdown);

    // Show subsea water column when appropriate
    let showWater = false;
    let waterDepth;
    if (!isNaN(wellheadDepthVal) && wellheadDepthVal > 0) {
      showWater = true;
      waterDepth = wellheadDepthVal;
    } else if (
      riserTypeVal === 'none' &&
      !isNaN(riserDepthVal) &&
      riserDepthVal > 0
    ) {
      showWater = true;
      waterDepth = riserDepthVal;
    }

    scheduleDraw(casingsToDraw, {
      showWater,
      waterDepth,
      plugDepth:
        plugEnabled &&
        typeof plugDepthVal !== 'undefined' &&
        !isNaN(plugDepthVal)
          ? plugDepthVal
          : undefined
    });

    // Validate Upper completion fit and show/hide a warning if needed
    try {
      const failures = validateUpperCompletionFit(casingsInput);
      const warnEl = el('upper_completion_warning');
      if (warnEl) {
        if (failures && failures.length) {
          warnEl.classList.remove('hidden');
          warnEl.textContent = `WARNING: Upper completion TJ (${
            failures[0].tj
          } in) does not fit inside casing(s): ${failures
            .map((f) => `${f.role} (drift ${f.drift} in)`)
            .join(', ')}`;
        } else {
          warnEl.classList.add('hidden');
          warnEl.textContent = '';
        }
      }
    } catch (e) {
      /* ignore */
    }
  }

  // UI helper functions were removed and moved into `src/js/ui.js`.
  // Use `initUI` (called below) to wire UI behaviors and handlers.

  // Persistence instance (created during init)
  let persistence = null;

  function init() {
    // initialize persistence handlers
    persistence = createPersistence({ captureStateObject });
    const {
      saveState: _saveState,
      scheduleSave: _scheduleSave,
      loadState: _loadState
    } = persistence;

    // load persisted state (will apply state and call calculate/save via callbacks)
    _loadState({
      applyStateObject: applyStateObjectFn,
      calculateVolume,
      scheduleSave: _scheduleSave
    });

    // initialize canvas drawing and DPR handling
    initDraw(canvas);

    // wire up UI handlers, give them access to helpers
    initUI({
      calculateVolume,
      scheduleSave: _scheduleSave,
      captureStateObject,
      applyStateObject: applyStateObjectFn,
      initDraw
    });

    // initialize preset UI (delegates to the presets module)
    try {
      // pass the helper wrappers so the presets module can apply state with callbacks
      setupPresetsUI({
        captureStateObject,
        applyStateObject: applyStateObjectFn,
        onPresetApplied: (name) => {
          try {
            currentPresetName = name || '';
            // trigger a recalculation/draw so the canvas shows the preset name
            calculateVolume();
          } catch (e) {
            /* ignore */
          }
        },
        onPresetSaved: (name) => {
          try {
            // reflect saved preset name on canvas
            currentPresetName = name || '';
            calculateVolume();
          } catch (e) {
            /* ignore */
          }
        }
      });
    } catch (e) {
      /* ignore: preset UI will be unavailable in some test environments */
    }

    // initial calculation and save
    calculateVolume();
    _scheduleSave();
  }

  return {
    init,
    calculateVolume,
    saveState: () =>
      persistence
        ? persistence.saveState()
        : createPersistence({ captureStateObject }).saveState()
  };
})();

// initialize
VolumeCalc.init();
