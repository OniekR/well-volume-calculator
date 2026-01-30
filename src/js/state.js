import { el, qs } from './dom.js';

/**
 * Capture current DOM inputs into a serializable state object.
 * Optionally accepts `getInputsFn` for test-friendly overrides.
 */
export function captureStateObject(getInputsFn) {
  if (typeof getInputsFn === 'function') return getInputsFn();
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
    const activeDpBtn = document.querySelector('.drillpipe-count-btn.active');
    if (activeDpBtn?.dataset?.count) {
      state.drillpipe_count = {
        type: 'input',
        value: String(activeDpBtn.dataset.count)
      };
    }
  } catch (e) {
    /* ignore */
  }
  return state;
}

/**
 * Apply a state object to the DOM. Accepts optional callbacks for side-effects
 * so it can be used both in-app and in isolation in tests.
 * callbacks: { calculateVolume, scheduleSave }
 */
export function applyStateObject(state, callbacks = {}) {
  if (!state) return;
  const { calculateVolume = () => {}, scheduleSave = () => {} } = callbacks;

  // Populate fields
  Object.entries(state).forEach(([id, item]) => {
    // never populate reserved UI controls when loading a preset
    if (new Set(['preset_name', 'preset_list', 'import_presets_input']).has(id))
      return;
    const input = el(id);
    if (!input) return;
    try {
      if (item.type === 'checkbox') input.checked = !!item.value;
      else input.value = item.value;
    } catch (e) {
      // ignore invalid values
    }
  });

  // Ensure the visible Preset name field isn't auto-filled when loading
  const presetNameEl = el('preset_name');
  if (presetNameEl) presetNameEl.value = '';

  // If preset omitted a casing 'use' checkbox but provided inputs for it,
  // treat that as intent to enable the casing.
  const casingGroups = [
    {
      useId: 'use_small_liner',
      keys: [
        'small_liner_size',
        'small_liner_size_id',
        'depth_small_top',
        'depth_small'
      ]
    },
    {
      useId: 'use_open_hole',
      keys: [
        'open_hole_size',
        'open_hole_size_id',
        'depth_open_top',
        'depth_open'
      ]
    },
    {
      useId: 'use_tieback',
      keys: ['tieback_size', 'tieback_size_id', 'depth_tb_top', 'depth_tb']
    },
    {
      useId: 'use_5',
      keys: ['reservoir_size', 'reservoir_size_id', 'depth_5_top', 'depth_5']
    },
    {
      useId: 'use_7',
      keys: ['production_size', 'production_size_id', 'depth_7_top', 'depth_7']
    },
    {
      useId: 'use_9',
      keys: [
        'intermediate_size',
        'intermediate_size_id',
        'depth_9_top',
        'depth_9'
      ]
    },
    {
      useId: 'use_13',
      keys: ['surface_size', 'surface_size_id', 'depth_13_top', 'depth_13']
    },
    {
      useId: 'use_18',
      keys: [
        'conductor_size',
        'conductor_size_id',
        'depth_18_top',
        'depth_18_bottom'
      ]
    },
    {
      useId: 'use_upper_completion',
      keys: [
        'upper_completion_size',
        'upper_completion_size_id',
        'depth_uc_top',
        'depth_uc',
        'tubing_size_0',
        'tubing_length_0',
        'tubing_size_1',
        'tubing_length_1',
        'tubing_size_2',
        'tubing_length_2'
      ]
    }
  ];

  // Restore tapered tubing inputs if present in state
  try {
    const tubingKeys = Object.keys(state || {}).filter((k) =>
      /^tubing_(size|length)_\d+$/.test(k)
    );
    if (tubingKeys.length > 0) {
      const maxIdx = Math.max(
        ...tubingKeys.map((k) => parseInt(k.match(/\d+$/)?.[0] || '0', 10))
      );
      const count = Math.min(3, Math.max(1, maxIdx + 1));
      const tubingBtn = el(`tubing_count_${count}`);
      if (tubingBtn) {
        tubingBtn.dispatchEvent(new Event('click', { bubbles: true }));
      }

      setTimeout(() => {
        tubingKeys.forEach((id) => {
          const field = el(id);
          if (field && state[id] && typeof state[id].value !== 'undefined') {
            try {
              field.value = state[id].value;
              field.dispatchEvent(
                new Event(
                  field.tagName.toLowerCase() === 'select' ? 'change' : 'input',
                  { bubbles: true }
                )
              );
            } catch (e) {
              /* ignore invalid value */
            }
          }
        });
      }, 0);
    }
  } catch (e) {
    /* ignore */
  }

  casingGroups.forEach((group) => {
    if (typeof state[group.useId] === 'undefined') {
      const shouldEnable = group.keys.some((k) => {
        const v = state[k] && state[k].value;
        return v !== undefined && v !== null && String(v).trim() !== '';
      });
      if (shouldEnable) {
        const checkboxEl = el(group.useId);
        if (checkboxEl) checkboxEl.checked = true;
      }
    }
  });

  // Dispatch change on .use-checkbox elements to drive UI collapse/expand handlers
  qs('.use-checkbox').forEach((cb) =>
    cb.dispatchEvent(new Event('change', { bubbles: true }))
  );

  // Ensure drill pipe/tubing mode UI reflects restored checkbox state
  try {
    const ucModeToggle = el('uc_mode_toggle');
    if (ucModeToggle)
      ucModeToggle.dispatchEvent(new Event('change', { bubbles: true }));
  } catch (e) {
    /* ignore */
  }

  // After mode toggle, ensure drill pipe inputs are restored when present.
  const restoreDrillPipe = () => {
    const dpHasKeys = Object.keys(state || {}).some((k) =>
      /^drillpipe_(size|length)_\d+$/.test(k)
    );
    const dpCountValue = state?.drillpipe_count?.value;
    if (!dpHasKeys && dpCountValue == null) return true;

    const dpCount = el('drillpipe_count');
    const dpBtn =
      dpCountValue != null ? el(`drillpipe_count_${dpCountValue}`) : null;

    if (!dpCount && !dpBtn) return false;

    try {
      if (dpCount && dpCountValue != null) {
        dpCount.value = String(dpCountValue);
        dpCount.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (dpBtn) {
        dpBtn.dispatchEvent(new Event('click', { bubbles: true }));
      }
    } catch (e) {
      /* ignore */
    }

    setTimeout(() => {
      Object.keys(state || {}).forEach((id) => {
        if (/^drillpipe_(size|length)_\d+$/.test(id)) {
          const field = el(id);
          if (field && state[id] && typeof state[id].value !== 'undefined') {
            try {
              field.value = state[id].value;
              field.dispatchEvent(
                new Event(
                  field.tagName.toLowerCase() === 'select' ? 'change' : 'input',
                  { bubbles: true }
                )
              );
            } catch (e) {
              /* ignore invalid value */
            }
          }
        }
      });
    }, 0);

    return true;
  };

  try {
    if (!restoreDrillPipe()) {
      document.addEventListener('keino:drillpipe-ui-ready', restoreDrillPipe, {
        once: true
      });
    }
  } catch (e) {
    /* ignore */
  }

  // Ensure production liner toggle handlers run
  try {
    const prodLinerEl = el('production_is_liner');
    if (prodLinerEl)
      prodLinerEl.dispatchEvent(new Event('change', { bubbles: true }));
  } catch (e) {
    /* ignore */
  }

  // Ensure Point of Interest toggle handler runs
  try {
    const plugToggleEl = el('use_plug');
    if (plugToggleEl)
      plugToggleEl.dispatchEvent(new Event('change', { bubbles: true }));
  } catch (e) {
    /* ignore */
  }

  // Ensure each casing section collapsed/expanded state matches its checkbox
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

  // update UI and persist
  try {
    calculateVolume();
  } catch (e) {
    /* ignore */
  }
  try {
    scheduleSave();
  } catch (e) {
    /* ignore */
  }

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
}

// Expose for tests and legacy access
try {
  if (typeof window !== 'undefined')
    window.__TEST_applyStateObject = (state, opts) =>
      applyStateObject(state, opts || {});
} catch (e) {
  /* ignore */
}
