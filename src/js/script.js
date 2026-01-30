'use strict';

import { computeVolumes, computeUpperCompletionBreakdown } from './logic.js';
import { initDraw, scheduleDraw as scheduleDrawFn, drawSchematic as drawSchematicFn, __TEST_flush_draw } from './draw.js';
import {
  captureStateObject,
  applyStateObject as applyStateObjectFn
} from './state.js';
import { initPOIToggle, initUI } from './ui.js';
import { initializeSidebar } from './sidebar.js';
import { gatherInputs } from './inputs.js';
import { renderResults, renderUpperCompletionBreakdown } from './render.js';
import { setupPresetsUI } from './presets-ui.js';
import { createPersistence } from './persistence.js';
import {
  gatherDrillPipeInput,
  computeDrillPipeBreakdown
} from './drillpipe.js';
import { gatherTubingInput } from './tubing.js';

/*
 * Refactored module for the Well Volume Calculator
 * - Encapsulates state
 * - Caches DOM queries
 * - Debounces saves
 * - Uses requestAnimationFrame for drawing
 * - Handles high-DPI canvas scaling
 */
const VolumeCalc = (() => {
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

  // Currently loaded or saved preset name (displayed on the canvas)
  let currentPresetName = '';

  // Drawing responsibilities (canvas sizing, DPR, scheduling) are provided by `src/js/draw.js`.
  // Initialize drawing module with the canvas element later during setup via `initDraw(canvas)`.

  // Presets
  // Preset management has been delegated to the module `src/js/presets.js`.
  // The module attaches helpers to `window.__KeinoPresets` for compatibility.
  // `captureStateObject` and `applyStateObject` are provided by `src/js/state.js`.

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

  // Drawing: delegate scheduling and rendering to the draw module
  function scheduleDraw(casings, opts = {}) {
    return scheduleDrawFn(
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

    // Determine drill pipe mode early so we can exclude UC from volume calculations
    const dpInput = gatherDrillPipeInput();

    // Read the "Subtract DP steel displacement" toggle
    const subtractEodToggle = document.getElementById('subtract_eod_toggle');
    const subtractEod = subtractEodToggle ? subtractEodToggle.checked : true;

    // Check if upper completion is enabled
    const ucEnabled = casingsInput.find(
      (c) => c.role === 'upper_completion'
    )?.use;

    // For hole volume calculations, always treat upper_completion as not in use
    // (so the hole volume table does not include tubing volumes). For drawing
    // we still use the original casingsInput so UC is shown when in tubing mode.
    const effectiveCasingsInput = casingsInput.map((c) =>
      c.role === 'upper_completion' ? { ...c, use: false } : c
    );

    // Compute volumes using UC excluded (for hole volume table)
    const result = computeVolumes(effectiveCasingsInput, {
      plugEnabled,
      plugDepthVal,
      surfaceInUse,
      intermediateInUse,
      drillPipe: dpInput,
      subtractEod
    });

    // Also compute with UC enabled to get tubing/annulus POI values
    const resultWithUc = computeVolumes(casingsInput, {
      plugEnabled,
      plugDepthVal,
      surfaceInUse,
      intermediateInUse,
      drillPipe: dpInput,
      subtractEod
    });

    // Merge UC-specific POI values into the result for rendering
    // Tubing mode values come from resultWithUc (includes UC)
    result.plugAboveTubing = resultWithUc.plugAboveTubing;
    result.plugBelowTubing = resultWithUc.plugBelowTubing;
    result.plugAboveAnnulus = resultWithUc.plugAboveAnnulus;
    result.plugBelowAnnulus = resultWithUc.plugBelowAnnulus;
    result.plugAboveTubingOpenCasing = resultWithUc.plugAboveTubingOpenCasing;
    result.plugBelowVolumeTubing = resultWithUc.plugBelowVolumeTubing; // Tubing mode total below POI

    // Total casing volume below tubing shoe should reflect UC-included casings
    // (used by the POI display when tubing crosses the POI)
    result.casingVolumeBelowTubingShoe =
      resultWithUc.casingVolumeBelowTubingShoe;
    // Drill pipe mode values come from result (UC excluded) because DP is independent of tubing
    // Note: result already has the DP values calculated without UC interference
    // We only override plugBelowVolume for tubing mode context
    if (dpInput.mode === 'drillpipe') {
      // Keep DP values from result (UC excluded) - they're already correct
      // Only override plugDepthVal and ucActive for context
      result.plugDepthVal = resultWithUc.plugDepthVal;
      result.ucActive = resultWithUc.ucActive;
    } else {
      // In tubing mode, use UC-included values
      result.plugBelowVolume = resultWithUc.plugBelowVolume;
      result.plugDepthVal = resultWithUc.plugDepthVal;
      result.ucActive = resultWithUc.ucActive;
    }

    // Compute draw entries using original casings so UC is still drawn in tubing mode
    const drawResult = computeVolumes(casingsInput, {
      plugEnabled,
      plugDepthVal,
      surfaceInUse,
      intermediateInUse,
      drillPipe: dpInput,
      subtractEod
    });
    let { casingsToDraw } = drawResult;

    // Render results to DOM (volumes exclude UC, but tubing POI includes it)
    const ucBottomValues = casingsInput
      .filter((c) => c.role === 'upper_completion')
      .map((c) => c.depth || 0);
    const ucBottom = ucBottomValues.length ? Math.max(...ucBottomValues) : 0;
    renderResults(result, {
      ucEnabled,
      dpMode: dpInput.mode === 'drillpipe',
      ucBottom
    });

    // Render upper completion breakdown (tubing or drill pipe)
    if (dpInput.mode === 'drillpipe') {
      const dpBreakdown = computeDrillPipeBreakdown(
        dpInput.pipes,
        casingsInput
      );
      renderUpperCompletionBreakdown(dpBreakdown, 'drillpipe');
      // Ensure upper_completion isn't drawn
      casingsToDraw = casingsToDraw.filter(
        (c) => c.role !== 'upper_completion'
      );
    } else {
      const ucBreakdown = computeUpperCompletionBreakdown(casingsInput);
      renderUpperCompletionBreakdown(ucBreakdown, 'tubing');
    }

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

    // Get tapered tubing for visualization
    const tubingInput = gatherTubingInput();
    const tubingSegments =
      dpInput.mode !== 'drillpipe' &&
      tubingInput.count > 0 &&
      tubingInput.tubings.length > 0
        ? tubingInput.tubings
        : undefined;

    if (tubingSegments && tubingSegments.length > 0) {
      casingsToDraw = casingsToDraw.filter(
        (c) => c.role !== 'upper_completion'
      );
    }

    const __testDrawOpts = {
      showWater,
      waterDepth,
      plugDepth:
        plugEnabled &&
        typeof plugDepthVal !== 'undefined' &&
        !isNaN(plugDepthVal)
          ? plugDepthVal
          : undefined,
      drillPipeSegments:
        dpInput.mode === 'drillpipe' && dpInput.pipes.length > 0
          ? dpInput.pipes
          : undefined,
      tubingSegments
    };

    // Expose the draw args for test helpers so we can force a deterministic redraw in CI
    try {
      if (typeof window !== 'undefined') {
        window.__TEST_last_draw_args = { casings: casingsToDraw, opts: __testDrawOpts };
      }
    } catch (e) {
      /* ignore */
    }

    scheduleDraw(casingsToDraw, __testDrawOpts);

    // Upper completion fit warnings are handled by the UI module (initUpperCompletionChecks)
    // so avoid updating any legacy DOM elements here.
    try {
      // no-op (UI will show/hide warnings via checkUpperCompletionFit)
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
    const { scheduleSave: _scheduleSave, loadState: _loadState } = persistence;

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
    initPOIToggle();
    initializeSidebar();

    // load persisted state AFTER UI is initialized so dynamic inputs (e.g., drill pipe)
    // have their event handlers attached and can be rendered/restored correctly.
    _loadState({
      applyStateObject: applyStateObjectFn,
      calculateVolume,
      scheduleSave: _scheduleSave
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

  // Test helper: expose a function to force recalculation/draw in test environments
  try {
    if (typeof window !== 'undefined') {
      window.__TEST_force_recalc = () => {
        try {
          calculateVolume();
          // If we have the last draw args captured, call the renderer directly to guarantee an immediate redraw
          try {
            if (typeof window !== 'undefined' && window.__TEST_last_draw_args) {
              try {
                drawSchematicFn(
                  window.__TEST_last_draw_args.casings,
                  window.__TEST_last_draw_args.opts
                );
              } catch (inner) {
                /* ignore rendering errors in test helper */
              }
            }
          } catch (e) {
            /* ignore */
          }
          // Also flush any scheduled draws as a fallback
          __TEST_flush_draw();
          return true;
        } catch (e) {
          return false;
        }
      };
    }
  } catch (e) {
    /* ignore */
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
