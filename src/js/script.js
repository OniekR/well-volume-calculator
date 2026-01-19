'use strict';

import { computeVolumes } from './logic.js';
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

  function saveState() {
    const state = {};
    qs('input[id], select[id]').forEach((input) => {
      if (!input.id) return;
      if (input.type === 'checkbox')
        state[input.id] = { type: 'checkbox', value: !!input.checked };
      else
        state[input.id] = {
          type: input.tagName.toLowerCase(),
          value: input.value
        };
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // ignore
    }
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 200);
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const state = JSON.parse(raw);
      Object.entries(state).forEach(([id, item]) => {
        const input = el(id);
        if (!input) return;
        if (item.type === 'checkbox') input.checked = !!item.value;
        else input.value = item.value;
      });
    } catch (e) {
      // ignore
    }
  }

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
    return applyStateObjectFn(state, { calculateVolume, scheduleSave });
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

  // update UI and persist (change events already trigger calculate/save but
  // we call once to ensure state is consistent)
  calculateVolume();
  scheduleSave();

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

  function setupPresetsUI() {
    const saveBtn = el('save_preset_btn');
    const loadBtn = el('load_preset_btn');
    const delBtn = el('delete_preset_btn');
    const nameInput = el('preset_name');
    const sel = el('preset_list');

    if (!saveBtn || !loadBtn || !delBtn || !nameInput || !sel) return;

    const exportBtn = el('export_presets_btn');
    const importBtn = el('import_presets_btn');
    const importInput = el('import_presets_input');

    if (exportBtn) {
      if (
        window.__KeinoPresets &&
        typeof window.__KeinoPresets.exportPresets === 'function'
      )
        exportBtn.addEventListener('click', () =>
          window.__KeinoPresets.exportPresets()
        );
      else
        exportBtn.addEventListener('click', () =>
          alert('Preset module unavailable.')
        );
    }
    if (importBtn && importInput) {
      importBtn.addEventListener('click', () => importInput.click());
      importInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          if (
            window.__KeinoPresets &&
            typeof window.__KeinoPresets.importPresetsFile === 'function'
          )
            window.__KeinoPresets.importPresetsFile(file);
          else alert('Preset module unavailable.');
        }
        e.target.value = '';
      });
    }

    // Load built-in presets (async) from external JSON file (prefer module impl if present)
    if (
      window.__KeinoPresets &&
      typeof window.__KeinoPresets.loadBuiltinPresets === 'function'
    ) {
      window.__KeinoPresets.loadBuiltinPresets();
    } else {
      // No module available (e.g., file:// CORS); builtin loading is a no-op here.
      console.warn &&
        console.warn(
          'Presets module unavailable; built-in presets not loaded.'
        );
    }

    saveBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      if (!name) {
        nameInput.focus();
        return alert('Enter a name for the preset.');
      }
      // builtin detection uses dataset on the select option (module populates this)
      const opt = sel.querySelector(`option[value="${name}"]`);
      const builtinExists = opt && opt.dataset && opt.dataset.builtin === '1';
      if (builtinExists)
        return alert(
          'That name is reserved for a built-in preset. Please choose another name.'
        );
      if (
        !window.__KeinoPresets ||
        typeof window.__KeinoPresets.savePreset !== 'function'
      )
        return alert('Preset module unavailable.');
      const state = captureStateObject();
      const ok = window.__KeinoPresets.savePreset(name, state);
      if (!ok) return alert('Failed to save preset.');
      if (
        window.__KeinoPresets &&
        typeof window.__KeinoPresets.populatePresetsUI === 'function'
      )
        window.__KeinoPresets.populatePresetsUI();
      nameInput.value = '';
    });

    loadBtn.addEventListener('click', () => {
      const name = sel.value;
      if (!name) return alert('Choose a preset to load.');

      // Delegate preset lookup to the module only (module must be available over HTTP)
      if (
        !window.__KeinoPresets ||
        typeof window.__KeinoPresets.getPresetState !== 'function'
      )
        return alert('Preset module unavailable.');
      const state = window.__KeinoPresets.getPresetState(name);
      if (!state) return alert('Preset not found.');

      applyStateObject(state);

      // set the current preset name (shows on the canvas)
      currentPresetName = name;

      // Ensure production button reflects newly loaded preset immediately (defensive)
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
    });
    // disable delete for built-in presets and clear the Preset name field on selection
    sel.addEventListener('change', () => {
      const opt = sel.selectedOptions && sel.selectedOptions[0];
      const isBuiltin = opt && opt.dataset && opt.dataset.builtin === '1';
      delBtn.disabled = !!isBuiltin;
      // Clear the adjacent Preset name input to avoid confusion when selecting/load presets
      const presetNameEl = el('preset_name');
      if (presetNameEl) presetNameEl.value = '';
    });

    delBtn.addEventListener('click', () => {
      const name = sel.value;
      if (!name) return alert('Choose a preset to delete.');
      const opt = sel.selectedOptions && sel.selectedOptions[0];
      const isBuiltin = opt && opt.dataset && opt.dataset.builtin === '1';
      if (isBuiltin) return alert('Built-in presets cannot be deleted.');
      if (!confirm(`Delete preset "${name}"?`)) return;
      if (
        window.__KeinoPresets &&
        typeof window.__KeinoPresets.deletePreset === 'function'
      ) {
        window.__KeinoPresets.deletePreset(name);
      } else {
        alert('Preset module unavailable.');
      }
      // Clear canvas label if it was the deleted preset
      if (currentPresetName === name) {
        currentPresetName = '';
        calculateVolume();
      }
      if (
        window.__KeinoPresets &&
        typeof window.__KeinoPresets.populatePresetsUI === 'function'
      )
        window.__KeinoPresets.populatePresetsUI();
    });

    if (
      window.__KeinoPresets &&
      typeof window.__KeinoPresets.populatePresetsUI === 'function'
    )
      window.__KeinoPresets.populatePresetsUI();
    window.addEventListener('storage', (e) => {
      if (e.key === 'well_presets_v1') {
        if (
          window.__KeinoPresets &&
          typeof window.__KeinoPresets.populatePresetsUI === 'function'
        )
          window.__KeinoPresets.populatePresetsUI();
      }
    });
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

    if (totalVolumeEl)
      totalVolumeEl.textContent = (totalVolume || 0).toFixed(2) + ' m³';

    // Update plug split results (if plug depth provided)
    const plugAboveEl = el('plugAboveVolume');
    const plugBelowEl = el('plugBelowVolume');
    if (plugAboveEl)
      plugAboveEl.textContent =
        !plugEnabled ||
        typeof plugDepthVal === 'undefined' ||
        isNaN(plugDepthVal)
          ? '— m³'
          : (plugAboveVolume || 0).toFixed(2) + ' m³';
    if (plugBelowEl)
      plugBelowEl.textContent =
        !plugEnabled ||
        typeof plugDepthVal === 'undefined' ||
        isNaN(plugDepthVal)
          ? '— m³'
          : (plugBelowVolume || 0).toFixed(2) + ' m³';

    // Render per-casing volume table
    const casingVolumesTable = el('casingVolumes');
    if (casingVolumesTable) {
      const tbody = casingVolumesTable.querySelector('tbody');
      if (tbody) {
        tbody.innerHTML = '';
        // friendly labels
        const roleLabel = {
          riser: 'Riser',
          conductor: 'Conductor',
          surface: 'Surface',
          intermediate: 'Intermediate',
          production: 'Production',
          tieback: 'Tie-back',
          reservoir: 'Reservoir',
          small_liner: 'Small liner'
        };
        let totals = { volume: 0, includedLength: 0 };

        // Render only casings that are in use
        perCasingVolumes.forEach((c) => {
          if (!c.use) return;

          const tr = document.createElement('tr');
          const nameTd = document.createElement('td');
          nameTd.textContent = roleLabel[c.role] || c.role;
          tr.appendChild(nameTd);
          // New column order: Volume, Included length, Volume per m
          const volTd = document.createElement('td');
          volTd.textContent = (c.volume || 0).toFixed(1);
          tr.appendChild(volTd);
          const lenTd = document.createElement('td');
          lenTd.textContent = (c.includedLength || 0).toFixed(1);
          tr.appendChild(lenTd);
          const perMtd = document.createElement('td');
          perMtd.textContent = ((c.perMeter_m3 || 0) * 1000).toFixed(1);
          tr.appendChild(perMtd);
          tbody.appendChild(tr);

          totals.volume += c.volume || 0;
          totals.includedLength += c.includedLength || 0;
        });

        // Update per-role physical length notes (under each Shoe input) for all casings
        const noteIdMap = {
          riser: 'riser_length_note',
          conductor: 'conductor_length_note',
          surface: 'surface_length_note',
          intermediate: 'intermediate_length_note',
          production: 'production_length_note',
          tieback: 'tieback_length_note',
          reservoir: 'reservoir_length_note',
          small_liner: 'small_liner_length_note'
        };
        perCasingVolumes.forEach((c) => {
          const noteEl = el(noteIdMap[c.role]);
          if (noteEl) {
            if (typeof c.physicalLength !== 'undefined') {
              noteEl.textContent = `Length: ${c.physicalLength.toFixed(1)} m`;
              noteEl.classList.remove('hidden');
            } else {
              noteEl.textContent = '';
            }
          }
        });

        // Totals row
        const totalsTr = document.createElement('tr');
        totalsTr.classList.add('totals-row');
        const totalsLabelTd = document.createElement('td');
        totalsLabelTd.textContent = 'Totals';
        totalsTr.appendChild(totalsLabelTd);
        const totalsVolTd = document.createElement('td');
        totalsVolTd.textContent = (totals.volume || 0).toFixed(1);
        totalsTr.appendChild(totalsVolTd);
        const totalsLenTd = document.createElement('td');
        totalsLenTd.textContent = (totals.includedLength || 0).toFixed(1);
        totalsTr.appendChild(totalsLenTd);
        const totalsPerMTd = document.createElement('td');
        if (totals.includedLength > 0) {
          totalsPerMTd.textContent = (
            (totals.volume / totals.includedLength) *
            1000
          ).toFixed(1);
        } else {
          totalsPerMTd.textContent = '0.0';
        }
        totalsTr.appendChild(totalsPerMTd);
        tbody.appendChild(totalsTr);
      }
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
  }

  // UI helper functions were removed and moved into `src/js/ui.js`.
  // Use `initUI` (called below) to wire UI behaviors and handlers.

  function init() {
    // load persisted state first
    loadState();

    // initialize canvas drawing and DPR handling
    initDraw(canvas);

    // wire up UI handlers, give them access to helpers
    initUI({
      calculateVolume,
      scheduleSave,
      captureStateObject,
      applyStateObject: applyStateObjectFn,
      initDraw
    });

    // initialize preset UI (delegates to the presets module)
    try {
      setupPresetsUI();
    } catch (e) {
      /* ignore: preset UI will be unavailable in some test environments */
    }

    // initial calculation and save
    calculateVolume();
    scheduleSave();
  }

  return { init, calculateVolume, saveState };
})();

// initialize
VolumeCalc.init();
