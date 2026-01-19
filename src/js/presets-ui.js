import { el } from './dom.js';

export function setupPresetsUI(deps = {}) {
  const { captureStateObject = () => ({}), applyStateObject = () => {} } = deps;

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
    console.warn &&
      console.warn('Presets module unavailable; built-in presets not loaded.');
  }

  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return alert('Enter a name for the preset.');
    }
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
    // notify host that a preset was saved so UI (e.g., canvas label) can update
    if (deps && typeof deps.onPresetSaved === 'function') {
      try {
        deps.onPresetSaved(name);
      } catch (e) {
        /* ignore */
      }
    }
  });

  loadBtn.addEventListener('click', () => {
    const name = sel.value;
    if (!name) return alert('Choose a preset to load.');
    if (
      !window.__KeinoPresets ||
      typeof window.__KeinoPresets.getPresetState !== 'function'
    )
      return alert('Preset module unavailable.');
    const state = window.__KeinoPresets.getPresetState(name);
    if (!state) return alert('Preset not found.');
    applyStateObject(state);
    // set the current preset name (handled by caller if desired)
    if (deps && typeof deps.onPresetApplied === 'function') {
      try {
        deps.onPresetApplied(name);
      } catch (e) {
        /* ignore */
      }
    }

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

  sel.addEventListener('change', () => {
    const opt = sel.selectedOptions && sel.selectedOptions[0];
    const isBuiltin = opt && opt.dataset && opt.dataset.builtin === '1';
    delBtn.disabled = !!isBuiltin;
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
