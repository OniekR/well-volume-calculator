import { el, qs } from './dom.js';
import { getUpperCompletionTJ } from './validation.js';
import { DRIFT, OD, TJ } from './constants.js';

export function setupEventDelegation(deps) {
  const { calculateVolume, scheduleSave } = deps;
  const form = el('well-form') || document.body;
  form.addEventListener('input', (e) => {
    if (!e.target) return;
    if (e.target.matches('input, select')) {
      calculateVolume();
      scheduleSave();
    }
  });
  form.addEventListener('change', (e) => {
    if (e.target && e.target.matches('input, select')) {
      calculateVolume();
      scheduleSave();
    }
  });
}

export function setupCasingToggles(deps) {
  const { calculateVolume, scheduleSave } = deps;
  qs('.casing-input').forEach((section) => {
    const checkbox =
      section.querySelector('.use-checkbox') ||
      section.querySelector('input[type=checkbox]');
    const header = section.querySelector('.casing-header');
    if (!checkbox || !header) return;

    const update = () => {
      if (checkbox.checked) {
        section.classList.remove('collapsed');
        header.setAttribute('aria-expanded', 'true');
      } else {
        section.classList.add('collapsed');
        header.setAttribute('aria-expanded', 'false');
      }
    };

    checkbox.addEventListener('change', () => {
      update();

      // Special handling for upper completion checkbox
      if (checkbox.id === 'use_upper_completion') {
        const drillpipeSection = el('uc_drillpipe_section');
        const modeToggle = el('uc_mode_toggle');

        if (!checkbox.checked) {
          // When disabling upper completion, hide drill pipe section and reset mode to tubing
          if (drillpipeSection) {
            drillpipeSection.classList.add('hidden');
          }
          if (modeToggle) {
            modeToggle.checked = false;
            const sliderEl =
              modeToggle.nextElementSibling ||
              (modeToggle.closest &&
                modeToggle.closest('.switch')?.querySelector('.slider'));
            if (sliderEl) sliderEl.classList.add('slider--tubing');
          }
        }
      }

      calculateVolume();
      scheduleSave();
    });

    header.addEventListener('click', (e) => {
      const target = e.target;
      if (
        target.closest('.header-inline') ||
        target.tagName.toLowerCase() === 'button'
      )
        return;
      if (target.tagName.toLowerCase() === 'h3') {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    header.tabIndex = 0;
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    update();
  });
}

export function setupButtons(deps) {
  const {
    calculateVolume,
    scheduleSave,
    el: _el
  } = Object.assign({ el }, deps);

  qs('.wellhead-btn').forEach((btn) =>
    btn.addEventListener('click', (_e) => {
      const targetId = btn.getAttribute('data-target');
      const input = _el(targetId);
      const well = _el('wellhead_depth');
      if (!input || !well) return;
      if (well.value === '') return;
      input.value = well.value;
      scheduleSave();
      calculateVolume();
    })
  );

  qs('.default-top-btn').forEach((btn) =>
    btn.addEventListener('click', (_e) => {
      const targetId = btn.getAttribute('data-target');
      const input = _el(targetId);
      if (!input) return;
      if (targetId === 'depth_7_top') {
        const btnText = btn.textContent.trim().toLowerCase();
        const interVal = _el('depth_9')?.value;
        const wellVal = _el('wellhead_depth')?.value;
        if (btnText === 'default') {
          if (interVal !== undefined && interVal !== '') {
            input.value = String(Number(interVal) - 50);
            const tb = _el('depth_tb');
            if (tb) tb.value = input.value;
            scheduleSave();
            calculateVolume();
            return;
          }
          if (wellVal !== undefined && wellVal !== '') {
            input.value = wellVal;
            const tb = _el('depth_tb');
            if (tb) tb.value = input.value;
            scheduleSave();
            calculateVolume();
            return;
          }
        }
        if (btnText === 'wellhead' || btnText === 'casing') {
          if (wellVal !== undefined && wellVal !== '') {
            input.value = wellVal;
            const tb = _el('depth_tb');
            if (tb) tb.value = input.value;
            scheduleSave();
            calculateVolume();
            return;
          }
        }
      }
      const tb = _el('depth_tb');
      if (tb) tb.value = input.value;
      scheduleSave();
      calculateVolume();
    })
  );

  qs('.liner-default-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      const target = _el('depth_7_top');
      if (!target) return;
      const inter = _el('depth_9')?.value;
      const well = _el('wellhead_depth')?.value;
      if (inter !== undefined && inter !== '') {
        const val = Number(inter);
        if (!isNaN(val)) target.value = String(val - 50);
      } else if (well !== undefined && well !== '') {
        target.value = well;
      }
      const tb = _el('depth_tb');
      if (tb) tb.value = target.value;
      scheduleSave();
      calculateVolume();
    })
  );

  qs('.reservoir-default-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      const target = _el('depth_5_top');
      if (!target) return;
      const prodBottom = _el('depth_7')?.value;
      if (prodBottom !== undefined && prodBottom !== '') {
        const val = Number(prodBottom);
        if (!isNaN(val)) target.value = String(val - 50);
      } else {
        target.value = '';
      }
      scheduleSave();
      calculateVolume();
    })
  );

  qs('.small-liner-default-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      const target = _el('depth_small_top');
      if (!target) return;
      const reservoirShoe = _el('depth_5')?.value;
      if (reservoirShoe !== undefined && reservoirShoe !== '') {
        const val = Number(reservoirShoe);
        if (!isNaN(val)) target.value = String(val - 50);
      } else {
        target.value = '';
      }
      scheduleSave();
      calculateVolume();
    })
  );
}

export function setupProductionToggleButtons() {
  const casingBtn = el('production_casing_btn');
  const linerBtn = qs('.liner-default-btn')[0];
  const useTie = el('use_tieback');
  const prodLinerChk = el('production_is_liner');
  if (!casingBtn && !linerBtn) return;

  const setActive = (btn) => {
    [casingBtn, linerBtn].forEach((b) => {
      if (!b) return;
      const isActive = b === btn;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  [casingBtn, linerBtn].forEach((b) => {
    if (b)
      b.setAttribute(
        'aria-pressed',
        b.classList.contains('active') ? 'true' : 'false'
      );
  });

  if (casingBtn) {
    casingBtn.addEventListener('click', () => {
      if (useTie && useTie.checked) return;
      setActive(casingBtn);
    });
    casingBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        casingBtn.click();
      }
    });
  }

  if (linerBtn) {
    linerBtn.addEventListener('click', () => {
      if (useTie && useTie.checked) return;
      setActive(linerBtn);
    });
    linerBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        linerBtn.click();
      }
    });
  }

  const updateTieback = () => {
    if (prodLinerChk && prodLinerChk.checked) {
      if (linerBtn) setActive(linerBtn);
      if (casingBtn) {
        casingBtn.classList.remove('active');
        casingBtn.setAttribute('aria-pressed', 'false');
      }
    }
  };

  if (prodLinerChk) prodLinerChk.addEventListener('change', updateTieback);
  updateTieback();

  const anyActive =
    (casingBtn && casingBtn.classList.contains('active')) ||
    (linerBtn && linerBtn.classList.contains('active'));
  if (!anyActive) {
    const prodTopEl = el('depth_7_top');
    if (prodLinerChk && prodLinerChk.checked) {
      if (linerBtn) setActive(linerBtn);
    } else if (prodTopEl && prodTopEl.value !== '') {
      if (casingBtn) setActive(casingBtn);
    } else {
      if (linerBtn) setActive(linerBtn);
    }
  }
}

export function setupTooltips() {
  // Generic tooltip behavior: button shows tooltip and can persist on click.
  const setup = (btnId, tipId) => {
    const btn = el(btnId);
    const tip = el(tipId);
    if (!btn || !tip) return;
    btn.removeAttribute('title');
    let persistOpen = false;
    const show = () => {
      tip.classList.remove('hidden');
      tip.setAttribute('aria-hidden', 'false');
    };
    const hide = () => {
      tip.classList.add('hidden');
      tip.setAttribute('aria-hidden', 'true');
    };
    btn.addEventListener('mouseenter', show);
    btn.addEventListener('focus', show);
    btn.addEventListener('mouseleave', () => {
      if (!persistOpen) hide();
    });
    btn.addEventListener('blur', hide);
    tip.addEventListener('mouseenter', show);
    tip.addEventListener('mouseleave', () => {
      if (!persistOpen) hide();
    });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      persistOpen = true;
      show();
      btn.focus();
    });
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !tip.contains(e.target)) {
        persistOpen = false;
        hide();
      }
    });
  };
  setup('production_liner_info_btn', 'production_liner_info_tooltip');
  setup('reservoir_default_info_btn', 'reservoir_default_info_tooltip');
}

export function setupHideCasingsToggle(deps = {}) {
  const { calculateVolume } = deps;
  const btn = el('toggle_hide_casings_btn');
  const form = document.getElementById('well-form');
  if (!btn || !form) return;

  const updateSectionsVisibility = (hidden) => {
    const sections = Array.from(document.querySelectorAll('.casing-input'));
    sections.forEach((s) => {
      if (s.classList.contains('no-hide')) return; // opt-out
      s.classList.toggle('hidden-by-casings-toggle', hidden);
    });
  };

  const setState = (hidden) => {
    form.classList.toggle('casings-hidden', hidden);
    updateSectionsVisibility(hidden);
    btn.setAttribute('aria-pressed', hidden ? 'true' : 'false');
    btn.textContent = hidden ? 'Show casings' : 'Hide casings';
  };

  // initialize state based on existing class
  setState(form.classList.contains('casings-hidden'));

  btn.addEventListener('click', () => {
    const hidden = form.classList.toggle('casings-hidden');
    updateSectionsVisibility(hidden);
    btn.setAttribute('aria-pressed', hidden ? 'true' : 'false');
    btn.textContent = hidden ? 'Show casings' : 'Hide casings';

    // Ensure the current volume calculation is up-to-date after UI-only toggle
    try {
      if (typeof calculateVolume === 'function') calculateVolume();
    } catch (e) {}
  });

  // Keyboard accessibility
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });
}

export function setupSizeIdInputs(deps) {
  const { scheduleSave, calculateVolume } = deps;
  const pairs = [
    ['conductor_size', 'conductor_size_id'],
    ['surface_size', 'surface_size_id'],
    ['intermediate_size', 'intermediate_size_id'],
    ['production_size', 'production_size_id'],
    ['tieback_size', 'tieback_size_id'],
    ['reservoir_size', 'reservoir_size_id'],
    ['small_liner_size', 'small_liner_size_id'],
    ['open_hole_size', 'open_hole_size_id'],
    ['riser_type', 'riser_type_id'],
    ['upper_completion_size', 'upper_completion_size_id']
  ];

  pairs.forEach(([selId, idInputId]) => {
    const sel = el(selId);
    const idInput = el(idInputId);
    if (!sel || !idInput) return;

    if (!idInput.value) idInput.value = sel.value;

    const updateSmallNote = () => {
      // 1. Check for new inline Nom ID layout (presence of .nom-id-inline)
      const sizeInline = sel.closest('.size-with-id');
      const nomInline =
        sizeInline && sizeInline.querySelector('.nom-id-inline');

      if (nomInline) {
        // Set label text (Upper Completion uses the same "Nom ID:" label as other casings)
        nomInline.textContent = 'Nom ID:';

        // Handle Drift (if present below the Nom ID)
        const sizeIdInline =
          sizeInline && sizeInline.querySelector('.size-id-inline');
        const driftLabel =
          sizeIdInline && sizeIdInline.querySelector('.drift-label');
        const driftInput =
          sizeIdInline && sizeIdInline.querySelector('input[id$="_drift"]');

        if (driftLabel && driftInput) {
          const idNum = Number(sel.value);
          const driftMap =
            DRIFT && DRIFT[selId.replace('_size', '')]
              ? DRIFT[selId.replace('_size', '')]
              : selId === 'conductor_size' && DRIFT.conductor
              ? DRIFT.conductor
              : {};
          const driftVal = driftMap[idNum];
          driftLabel.textContent = 'Drift:';
          if (
            typeof driftVal !== 'undefined' &&
            !driftInput.dataset.userEdited
          ) {
            driftInput.value = driftVal;
          }
        } else {
          // Fallback: check for drift-label or legacy .drift-note in footer (conductor, surface, intermediate)
          const container = sel.closest('.casing-body');
          const driftLabel =
            container && container.querySelector('.drift-label');
          const driftInput =
            container && container.querySelector('input[id$="_drift"]');
          const driftNote = container && container.querySelector('.drift-note');

          const idNum = Number(sel.value);
          const driftMap =
            DRIFT && DRIFT[selId.replace('_size', '')]
              ? DRIFT[selId.replace('_size', '')]
              : selId === 'conductor_size' && DRIFT.conductor
              ? DRIFT.conductor
              : {};
          const driftVal = driftMap[idNum];

          if (driftLabel && driftInput) {
            driftLabel.textContent = 'Drift:';
            if (
              typeof driftVal !== 'undefined' &&
              !driftInput.dataset.userEdited
            ) {
              driftInput.value = driftVal;
            }
          }

          // Legacy: display as text in footer (tests expect "Drift: X in")
          if (driftNote) {
            if (typeof driftVal !== 'undefined') {
              driftNote.textContent = `Drift: ${String(driftVal)} in`;
            } else {
              driftNote.textContent = '';
            }
          }
        }

        // If this is the Upper Completion, also populate the small-note under the Top input with TJ
        if (selId === 'upper_completion_size') {
          const tj = getUpperCompletionTJ(Number(idInput.value));
          const ucSection =
            sel.closest('#upper_completion_section') ||
            sel.closest('.casing-body');
          const topInput =
            ucSection && ucSection.querySelector('#depth_uc_top');
          const topInline = topInput && topInput.closest('.input-inline');
          const topNote = topInline && topInline.querySelector('.small-note');
          if (topNote) {
            topNote.textContent =
              typeof tj !== 'undefined'
                ? `TJ: ${String(tj)}`
                : idInput.value
                ? `TJ: ${idInput.value}`
                : '';
          }
        }

        return;
      }

      // 2. Legacy/Fallback for sections not yet updated or UC special case
      const inline = sel.closest('.input-inline');
      let note = inline && inline.querySelector('.small-note');
      // If note not found in the Size inline and this is UC, look for the
      // small-note elsewhere in the Upper Completion section (we moved it
      // under the "Top" input)
      if (!note && selId === 'upper_completion_size') {
        const ucSection =
          sel.closest('#upper_completion_section') ||
          sel.closest('.casing-body');
        note = ucSection && ucSection.querySelector('.small-note');
      }
      if (!note) return;

      if (selId === 'conductor_size') {
        // Should be covered by block above if HTML updated, but keep safe
        // ... existing conductor logic reduced ...
      }

      if (selId === 'upper_completion_size') {
        const tj = getUpperCompletionTJ(Number(idInput.value));
        note.textContent =
          typeof tj !== 'undefined'
            ? `TJ: ${String(tj)}`
            : idInput.value
            ? `TJ: ${idInput.value}`
            : '';
      } else {
        note.textContent = idInput.value || '';
      }
    };

    // initial note update
    updateSmallNote();

    sel.addEventListener('change', () => {
      if (!idInput.dataset.userEdited) idInput.value = sel.value;
      updateSmallNote();
      scheduleSave();
      calculateVolume();
    });

    idInput.addEventListener('input', () => {
      idInput.dataset.userEdited = 'true';
      updateSmallNote();
      scheduleSave();
      calculateVolume();
    });

    // Attach listener to drift input (if present) so user edits are preserved
    const sizeIdInlineEl =
      sel.closest('.size-with-id') &&
      sel.closest('.size-with-id').querySelector('.size-id-inline');
    const driftInline =
      sizeIdInlineEl && sizeIdInlineEl.querySelector('input[id$="_drift"]');
    const driftFooter =
      sel.closest('.casing-body') &&
      sel.closest('.casing-body').querySelector('input[id$="_drift"]');
    const driftField = driftInline || driftFooter;
    if (driftField) {
      driftField.addEventListener('input', () => {
        driftField.dataset.userEdited = 'true';
        updateSmallNote();
        scheduleSave();
        calculateVolume();
      });
    }
  });
}

// Check whether the Upper Completion OD will fit inside the deepest
// active casing/liner drift. Shows an inline warning next to the
// Upper Completion section when a restriction is found.
export function checkUpperCompletionFit() {
  try {
    // Skip warning if drill pipe mode is active
    const modeToggle = el('uc_mode_toggle');
    if (modeToggle && modeToggle.checked) {
      removeUpperCompletionWarning();
      return;
    }

    const ucIdEl = el('upper_completion_size_id');
    if (!ucIdEl) return;
    const ucKey = ucIdEl.value;
    if (!ucKey) return removeUpperCompletionWarning();
    const ucOd =
      (OD && OD.upper_completion && OD.upper_completion[ucKey]) ||
      (OD && OD.upper_completion && OD.upper_completion[Number(ucKey)]);
    const ucTj =
      (TJ && TJ.upper_completion && TJ.upper_completion[ucKey]) ||
      (TJ && TJ.upper_completion && TJ.upper_completion[Number(ucKey)]);

    // prefer TJ for fit-checks if available (TJ is the tool-joint dimension)
    const ucCompareValue = typeof ucTj !== 'undefined' ? ucTj : ucOd;
    if (typeof ucCompareValue === 'undefined')
      return removeUpperCompletionWarning();

    // map role -> top/shoe field ids in the form
    const topMap = {
      conductor: 'depth_18_top',
      surface: 'depth_13_top',
      intermediate: 'depth_9_top',
      production: 'depth_7_top',
      reservoir: 'depth_5_top',
      small_liner: 'depth_small_top'
    };
    const shoeMap = {
      conductor: 'depth_18_bottom',
      surface: 'depth_13',
      intermediate: 'depth_9',
      production: 'depth_7',
      reservoir: 'depth_5',
      small_liner: 'depth_small'
    };

    const roles = [
      'small_liner',
      'reservoir',
      'production',
      'intermediate',
      'surface',
      'conductor'
    ];

    const ucTopEl = el('depth_uc_top');
    const ucShoeEl = el('depth_uc');
    const ucTop = ucTopEl ? Number(ucTopEl.value) : NaN;
    const ucShoe = ucShoeEl ? Number(ucShoeEl.value) : NaN;

    for (const role of roles) {
      const driftEl = el(role + '_drift');
      if (!driftEl) continue;

      const casingSection = driftEl.closest('.casing-input');
      if (casingSection) {
        const useCheckbox = casingSection.querySelector('.use-checkbox');
        if (useCheckbox && !useCheckbox.checked) continue;
      }

      // Ensure we have valid casing top/shoe to determine whether UC is inside
      const topEl = el(topMap[role]);
      const shoeEl = el(shoeMap[role]);
      if (!topEl || !shoeEl) continue;
      const casingTop = Number(topEl.value);
      const casingShoe = Number(shoeEl.value);
      if (isNaN(casingTop) || isNaN(casingShoe)) continue;
      if (casingShoe <= casingTop) continue; // invalid bounds

      // determine whether UC depth range overlaps with this casing vertically
      // UC passes through the casing if: UC_top < casing_shoe AND UC_shoe > casing_top
      let overlaps = false;
      if (!isNaN(ucTop) && !isNaN(ucShoe)) {
        overlaps = ucTop < casingShoe && ucShoe > casingTop;
      } else if (!isNaN(ucShoe)) {
        // only shoe defined: check if shoe is within or extends past casing range
        overlaps = ucShoe > casingTop;
      } else {
        // insufficient UC depth information -> skip this role
        continue;
      }

      if (!overlaps) continue;

      const driftVal = Number(driftEl.value);
      if (isNaN(driftVal)) continue;

      if (ucCompareValue > driftVal) {
        // include whether we compared TJ or OD in the message
        const what = typeof ucTj !== 'undefined' ? 'TJ' : 'OD';
        showUpperCompletionWarning(role, what, ucCompareValue, driftVal);
        return;
      }
    }

    // No restriction found
    removeUpperCompletionWarning();
  } catch (err) {
    /* ignore */
  }
}

function showUpperCompletionWarning(role, what, ucValue, driftVal) {
  const sec = el('upper_completion_section');
  if (!sec) return;
  const body = sec.querySelector('.casing-body') || sec;
  let wr = el('upper_completion_fit_warning');
  if (!wr) {
    wr = document.createElement('div');
    wr.id = 'upper_completion_fit_warning';
    wr.className = 'small-note warning';
    wr.setAttribute('aria-live', 'polite');
    body.appendChild(wr);
  }
  const parts = [
    'Warning: Upper completion',
    what,
    `(${String(ucValue)})`,
    'exceeds',
    role.replace(/_/g, ' '),
    'drift',
    `(${String(driftVal)}).`,
    'May not fit.'
  ];
  const msg = parts.join(' ');
  wr.textContent = msg;
}

function removeUpperCompletionWarning() {
  const wr = el('upper_completion_fit_warning');
  if (wr && wr.parentNode) wr.parentNode.removeChild(wr);
  const legacy = el('upper_completion_warning');
  if (legacy) {
    legacy.classList.add('hidden');
    legacy.textContent = '';
  }
}

export function initUpperCompletionChecks(deps = {}) {
  const { calculateVolume = () => {} } = deps;
  const ucSelect = el('upper_completion_size');
  const ucId = el('upper_completion_size_id');
  const roles = [
    'small_liner',
    'reservoir',
    'production',
    'intermediate',
    'surface',
    'conductor'
  ];

  const schedule = () => setTimeout(checkUpperCompletionFit, 10);

  const ucTopEl = el('depth_uc_top');
  const ucShoeEl = el('depth_uc');
  if (ucSelect) ucSelect.addEventListener('change', schedule);
  if (ucId) ucId.addEventListener('input', schedule);
  if (ucTopEl) {
    ucTopEl.addEventListener('input', () => {
      // Validate that Top doesn't exceed Shoe
      const topVal = parseFloat(ucTopEl.value);
      const shoeVal = ucShoeEl ? parseFloat(ucShoeEl.value) : NaN;
      if (!isNaN(topVal) && !isNaN(shoeVal) && topVal > shoeVal) {
        ucTopEl.value = String(shoeVal);
      }
      schedule();
      calculateVolume();
    });
  }
  if (ucShoeEl) {
    ucShoeEl.addEventListener('input', () => {
      // Validate that Shoe doesn't go below Top
      const shoeVal = parseFloat(ucShoeEl.value);
      const topVal = ucTopEl ? parseFloat(ucTopEl.value) : NaN;
      if (!isNaN(shoeVal) && !isNaN(topVal) && shoeVal < topVal) {
        ucShoeEl.value = String(topVal);
      }
      schedule();
      calculateVolume();
    });
  }

  const topMap = {
    conductor: 'depth_18_top',
    surface: 'depth_13_top',
    intermediate: 'depth_9_top',
    production: 'depth_7_top',
    reservoir: 'depth_5_top',
    small_liner: 'depth_small_top'
  };
  const shoeMap = {
    conductor: 'depth_18_bottom',
    surface: 'depth_13',
    intermediate: 'depth_9',
    production: 'depth_7',
    reservoir: 'depth_5',
    small_liner: 'depth_small'
  };

  roles.forEach((r) => {
    const d = el(r + '_drift');
    if (d) {
      d.addEventListener('input', schedule);
      d.addEventListener('change', schedule);
    }
    const topField = el(topMap[r]);
    const shoeField = el(shoeMap[r]);
    if (topField) topField.addEventListener('input', schedule);
    if (shoeField) shoeField.addEventListener('input', schedule);

    const sec = d && d.closest('.casing-input');
    if (sec) {
      const useChk = sec.querySelector('.use-checkbox');
      if (useChk) useChk.addEventListener('change', schedule);
    }
  });

  // Initial check
  schedule();
}

export function setupWellheadSync(deps) {
  const { scheduleSave, calculateVolume } = deps;
  const well = el('wellhead_depth');
  const riser = el('depth_riser');
  if (!well || !riser) return;

  const wellheadContainer = el('wellhead-depth-container');
  if (wellheadContainer) {
    wellheadContainer.classList.remove('hidden');
    wellheadContainer.setAttribute('aria-hidden', 'false');
  }

  well.addEventListener('input', () => {
    if (riser.value !== well.value) {
      riser.value = well.value;
      scheduleSave();
      calculateVolume();
    }
  });

  if (well.value !== '' && riser.value !== well.value) riser.value = well.value;

  const toggle = el('riser_subsea');
  if (toggle)
    toggle.addEventListener('change', (e) => {
      if (e.target.checked && well.value !== '') {
        ['depth_18_top', 'depth_13_top'].forEach((id) => {
          const v = el(id);
          if (v) v.value = well.value;
        });
        scheduleSave();
        calculateVolume();
      }
    });
}

export function setupTiebackBehavior(deps) {
  const { scheduleSave, calculateVolume } = deps;
  let __updateDummy = () => {};
  const prodLinerChk = el('production_is_liner');
  const tiebackCasing = el('tieback_casing');
  const useTie = el('use_tieback');
  const casingBtn = el('production_casing_btn');
  if (!prodLinerChk || !tiebackCasing || !useTie) return;
  const prodInfoBtn = el('production_liner_info_btn');

  document.addEventListener('change', (e) => {
    try {
      if (!e || !e.target || e.target.id !== 'dummy_hanger') return;
      const dummyEl = document.getElementById('dummy_hanger');
      const tbTop = document.getElementById('depth_tb_top');
      const tb = document.getElementById('depth_tb');
      const wellEl = document.getElementById('wellhead_depth');
      const prodTopEl = document.getElementById('depth_7_top');
      if (!tbTop || !tb) return;
      tbTop.value = wellEl && wellEl.value ? wellEl.value : '';
      if (dummyEl && dummyEl.checked) {
        tb.removeAttribute('readonly');
        tb.classList.remove('readonly-input');
        tb.value = Number(
          (Number((wellEl && wellEl.value) || 0) + 75).toFixed(1)
        );
        delete tb.dataset.userEdited;
      } else {
        tb.setAttribute('readonly', 'true');
        tb.readOnly = true;
        tb.classList.add('readonly-input');
        tb.value = prodTopEl && prodTopEl.value ? prodTopEl.value : '';
        delete tb.dataset.userEdited;
      }
      scheduleSave();
      calculateVolume();
    } catch (err) {
      /* ignore */
    }
  });

  const update = () => {
    if (prodLinerChk.checked) {
      tiebackCasing.classList.remove('hidden');
      tiebackCasing.setAttribute('aria-hidden', 'false');
      useTie.checked = true;
      const tb = el('depth_tb');
      if (tb) {
        tb.removeAttribute('readonly');
        tb.classList.remove('readonly-input');
        const wellVal = Number(el('wellhead_depth')?.value || 0);
        if (!tb.dataset.userEdited)
          tb.value = Number((wellVal + 75).toFixed(1));
      }
      useTie.dispatchEvent(new Event('change', { bubbles: true }));
      if (casingBtn) {
        casingBtn.classList.add('hidden');
        casingBtn.setAttribute('aria-hidden', 'true');
      }
      if (prodInfoBtn) {
        prodInfoBtn.classList.add('hidden');
        prodInfoBtn.setAttribute('aria-hidden', 'true');
      }
      const linerBtnEl = qs('.liner-default-btn')[0];
      if (linerBtnEl) {
        linerBtnEl.click();
        const tb2 = el('depth_tb');
        if (tb2 && !tb2.dataset.userEdited) {
          tb2.removeAttribute('readonly');
          tb2.classList.remove('readonly-input');
          const wellVal2 = Number(el('wellhead_depth')?.value || 0);
          tb2.value = Number((wellVal2 + 75).toFixed(1));
        }
      }
    } else {
      tiebackCasing.classList.add('hidden');
      tiebackCasing.setAttribute('aria-hidden', 'true');
      useTie.checked = false;
      const tb = el('depth_tb');
      if (tb) {
        tb.setAttribute('readonly', 'true');
        tb.classList.add('readonly-input');
        const prodTopEl = el('depth_7_top');
        if (prodTopEl) tb.value = prodTopEl.value;
      }
      if (casingBtn) {
        casingBtn.classList.remove('hidden');
        casingBtn.setAttribute('aria-hidden', 'false');
      }
      if (prodInfoBtn) {
        prodInfoBtn.classList.remove('hidden');
        prodInfoBtn.setAttribute('aria-hidden', 'false');
      }
      if (casingBtn) {
        const linerBtn = qs('.liner-default-btn')[0];
        casingBtn.classList.add('active');
        casingBtn.setAttribute('aria-pressed', 'true');
        if (linerBtn) {
          linerBtn.classList.remove('active');
          linerBtn.setAttribute('aria-pressed', 'false');
        }
      }
    }
    scheduleSave();
    calculateVolume();
  };
  prodLinerChk.addEventListener('change', update);
  update();

  const prodTop = el('depth_7_top');
  const tieBottom = el('depth_tb');
  if (prodTop && tieBottom) {
    const well = el('wellhead_depth');
    let userEdited = false;

    const sync = () => {
      if (useTie && useTie.checked) return;
      tieBottom.value = prodTop.value === '' ? '' : prodTop.value;
      scheduleSave();
      calculateVolume();
    };

    prodTop.addEventListener('input', sync);
    prodTop.addEventListener('change', sync);
    if (well)
      well.addEventListener('input', () => {
        setTimeout(() => {
          if (useTie && useTie.checked) {
            tieBottom.removeAttribute('readonly');
            tieBottom.classList.remove('readonly-input');
            if (!userEdited) {
              tieBottom.value = Number(
                (Number(well.value || 0) + 75).toFixed(1)
              );
              scheduleSave();
              calculateVolume();
              setTimeout(() => {
                if (useTie && useTie.checked && !userEdited) {
                  tieBottom.value = Number(
                    (Number(well.value || 0) + 75).toFixed(1)
                  );
                  scheduleSave();
                  calculateVolume();
                }
              }, 150);
            }
          } else {
            sync();
          }
        }, 50);
      });
    sync();

    tieBottom.addEventListener('input', () => {
      userEdited = true;
      tieBottom.dataset.userEdited = 'true';
      scheduleSave();
      calculateVolume();
    });

    const dummy = el('dummy_hanger');
    const updateDummy = () => {
      const tbTop = el('depth_tb_top');
      const tb = el('depth_tb');
      const wellVal = Number(el('wellhead_depth')?.value || 0);
      const prodTopVal = el('depth_7_top')?.value || '';
      if (!tbTop || !tb) return;

      tbTop.value = el('wellhead_depth')?.value || '';

      if (dummy && dummy.checked) {
        tb.removeAttribute('readonly');
        tb.classList.remove('readonly-input');
        tb.value = Number((wellVal + 75).toFixed(1));
        delete tb.dataset.userEdited;
        userEdited = false;

        setTimeout(() => {
          if (dummy && dummy.checked) {
            tbTop.value = el('wellhead_depth')?.value || '';
            tb.value = Number(
              (Number(el('wellhead_depth')?.value || 0) + 75).toFixed(1)
            );
            delete tb.dataset.userEdited;
            userEdited = false;
          }
        }, 120);
      } else {
        tb.setAttribute('readonly', 'true');
        tb.readOnly = true;
        tb.classList.add('readonly-input');
        tb.value = prodTopVal;
        delete tb.dataset.userEdited;
        userEdited = false;

        setTimeout(() => {
          if (!(dummy && dummy.checked)) {
            tb.value = el('depth_7_top')?.value || '';
            tb.setAttribute('readonly', 'true');
            tb.readOnly = true;
            tb.classList.add('readonly-input');
          }
        }, 120);
      }

      scheduleSave();
      calculateVolume();
    };

    if (dummy) {
      dummy.addEventListener('change', updateDummy);
      document.addEventListener('change', (e) => {
        if (e && e.target && e.target.id === 'dummy_hanger') __updateDummy();
      });
      const prodTopEl = el('depth_7_top');
      if (el('wellhead_depth'))
        el('wellhead_depth').addEventListener('input', () => {
          if (dummy && dummy.checked) updateDummy();
          else {
            const tbTop = el('depth_tb_top');
            if (tbTop) tbTop.value = el('wellhead_depth')?.value || '';
          }
        });
      if (prodTopEl)
        prodTopEl.addEventListener('input', () => {
          if (!dummy.checked) updateDummy();
        });
      updateDummy();
      __updateDummy = updateDummy;
    }

    if (typeof window !== 'undefined')
      window.__TEST_updateDummy = () => __updateDummy();

    useTie.addEventListener('change', () => {
      if (useTie.checked) {
        tieBottom.removeAttribute('readonly');
        tieBottom.classList.remove('readonly-input');
        const wellVal = well && well.value !== '' ? Number(well.value) : 0;
        if (!userEdited) {
          tieBottom.value = Number((wellVal + 75).toFixed(1));
        }
      } else {
        if (!(dummy && dummy.checked)) {
          tieBottom.setAttribute('readonly', 'true');
          tieBottom.readOnly = true;
          tieBottom.classList.add('readonly-input');
          sync();
        }
      }
      scheduleSave();
      calculateVolume();
      setTimeout(() => {
        if (!useTie.checked && !(dummy && dummy.checked)) {
          tieBottom.setAttribute('readonly', 'true');
          tieBottom.classList.add('readonly-input');
        }
      }, 50);
    });

    if (dummy && dummy.checked) {
      const tb = el('depth_tb');
      if (tb) {
        tb.removeAttribute('readonly');
        tb.classList.remove('readonly-input');
        const wellVal = Number(el('wellhead_depth')?.value || 0);
        if (!tb.dataset.userEdited)
          tb.value = Number((wellVal + 75).toFixed(1));
      }
    } else if (useTie && useTie.checked) {
      tieBottom.removeAttribute('readonly');
      tieBottom.classList.remove('readonly-input');
      const wellVal = well && well.value !== '' ? Number(well.value) : 0;
      if (!tieBottom.dataset.userEdited)
        tieBottom.value = Number((wellVal + 75).toFixed(1));
    } else {
      tieBottom.setAttribute('readonly', 'true');
      tieBottom.classList.add('readonly-input');
    }
  }
}

export function setupRiserPositionToggle() {
  const toggle = el('riser_subsea');
  const label = el('riser_position_label');
  if (!toggle || !label) return;
  const update = () => {
    label.textContent = toggle.checked ? 'Subsea' : 'Fixed';
    toggle.setAttribute('aria-checked', toggle.checked ? 'true' : 'false');
  };
  toggle.addEventListener('change', () => {
    update();
  });
  update();
}

export function setupRiserTypeHandler(deps) {
  const { calculateVolume, scheduleSave } = deps;
  const select = el('riser_type');
  const riserDepthEl = el('depth_riser');
  const wellEl = el('wellhead_depth');
  const riserContainer = el('depth_riser_container');
  if (!select || !riserDepthEl) return;
  const update = () => {
    if (select.value === 'none') {
      riserDepthEl.value = '0';
      if (riserContainer) riserContainer.classList.add('hidden');
    } else {
      if (riserContainer) riserContainer.classList.remove('hidden');
      if (wellEl && wellEl.value !== '') riserDepthEl.value = wellEl.value;
    }
    scheduleSave();
    calculateVolume();
  };
  select.addEventListener('change', update);
  update();
}

export function setupEodToggle(deps) {
  const { calculateVolume, scheduleSave } = deps;
  const toggle = el('subtract_eod_toggle');
  const label = el('eod_toggle_label');
  if (!toggle || !label) return;

  const updateLabel = () => {
    label.textContent = toggle.checked ? 'On' : 'Off';
    label.setAttribute(
      'aria-label',
      toggle.checked ? 'EOD subtraction on' : 'EOD subtraction off'
    );
    calculateVolume();
    scheduleSave();
  };

  toggle.addEventListener('change', updateLabel);
  updateLabel();
}

export function setupPlugToggle(deps) {
  const { calculateVolume, scheduleSave } = deps;
  const toggle = el('use_plug');
  const panel = el('plug-panel');
  if (!toggle || !panel) return;
  const update = () => {
    if (toggle.checked) {
      panel.classList.remove('hidden');
      panel.setAttribute('aria-hidden', 'false');
    } else {
      panel.classList.add('hidden');
      panel.setAttribute('aria-hidden', 'true');
    }
    scheduleSave();
    calculateVolume();
  };
  toggle.addEventListener('change', update);
  update();
}

export function setupNavActive() {
  const links = qs('.linker a');
  if (!links || !links.length) return;
  const current = window.location.href.replace(/\/$/, '');
  links.forEach((a) => {
    try {
      const href = a.href.replace(/\/$/, '');
      if (
        href === current ||
        current.startsWith(href) ||
        href.startsWith(current) ||
        href.includes(window.location.pathname)
      )
        a.classList.add('active');
    } catch (e) {
      /* ignore */
    }
  });
}

export function setupThemeToggle() {
  const toggle = el('theme_toggle');
  const labelEl = document.getElementById('theme_label');
  const setLabel = (mode) => {
    if (!labelEl) return;
    labelEl.textContent = mode === 'dark' ? 'Light mode' : 'Dark mode';
  };
  const apply = (mode) => {
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (toggle) {
        toggle.checked = true;
        toggle.setAttribute('aria-checked', 'true');
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (toggle) {
        toggle.checked = false;
        toggle.setAttribute('aria-checked', 'false');
      }
    }
    setLabel(mode);
  };

  try {
    const stored = localStorage.getItem('keino_theme');
    if (stored === 'dark') apply('dark');
    else apply('light');
  } catch (e) {
    apply('light');
  }

  if (toggle) {
    toggle.addEventListener('change', () => {
      const next = toggle.checked ? 'dark' : 'light';
      apply(next);
      try {
        localStorage.setItem('keino_theme', next);
      } catch (e) {
        /* ignore */
      }
    });
  }
  try {
    if (typeof window !== 'undefined')
      window.__TEST_applyTheme = (mode) => {
        apply(mode === 'dark' ? 'dark' : 'light');
        try {
          localStorage.setItem(
            'keino_theme',
            mode === 'dark' ? 'dark' : 'light'
          );
        } catch (e) {
          /* ignore */
        }
      };
  } catch (e) {
    /* ignore */
  }

  // fallback delegate in case the control is re-rendered
  document.addEventListener('change', (e) => {
    try {
      if (!e || !e.target) return;
      const elTarget = e.target.closest
        ? e.target.closest('#theme_toggle')
        : null;
      if (!elTarget) return;
      const next = elTarget.checked ? 'dark' : 'light';
      apply(next);
      try {
        localStorage.setItem('keino_theme', next);
      } catch (err) {
        /* ignore */
      }
    } catch (err) {
      /* ignore */
    }
  });
}

function setupDrillPipeMode(deps) {
  const { calculateVolume, scheduleSave } = deps;
  const modeToggle = el('uc_mode_toggle');
  const tubingSection = el('uc_tubing_section');
  const drillpipeSection = el('uc_drillpipe_section');
  const drillpipeCountBtns = document.querySelectorAll('.drillpipe-count-btn');
  const drillpipeContainer = el('drillpipe_inputs_container');

  if (!modeToggle || !drillpipeSection) return;

  // Dynamic async import for drill pipe functions
  (async () => {
    const drillpipeModule = await import('./drillpipe.js');
    const { renderDrillPipeInputs, updateDrillPipeDepthDisplays } =
      drillpipeModule;

    // Toggle between tubing and drill pipe mode
    modeToggle.addEventListener('change', () => {
      const isDP = modeToggle.checked;
      // Keep the slider visually green when in tubing mode (unchecked)
      const sliderEl =
        modeToggle.nextElementSibling ||
        (modeToggle.closest &&
          modeToggle.closest('.switch')?.querySelector('.slider'));
      if (sliderEl) sliderEl.classList.toggle('slider--tubing', !isDP);
      if (isDP) {
        if (tubingSection) tubingSection.classList.add('hidden');
        drillpipeSection.classList.remove('hidden');
        // Disable tubing inputs when drill pipe mode is active
        if (tubingSection) {
          const tubingControls = tubingSection.querySelectorAll(
            'input, select, textarea, button'
          );
          tubingControls.forEach((ctrl) => {
            try {
              ctrl.disabled = true;
              ctrl.classList.add('readonly-input');
            } catch (e) {
              /* ignore */
            }
          });
        }
        // Render default drill pipe inputs (3 DPs by default)
        const activeBtn = document.querySelector('.drillpipe-count-btn.active');
        const count = parseInt(activeBtn?.dataset.count, 10) || 3;
        renderDrillPipeInputs(count);
        updateDrillPipeDepthDisplays();
        attachDrillPipeListeners();
        // Hide upper completion warning when switching to drill pipe mode
        removeUpperCompletionWarning();
      } else {
        if (tubingSection) tubingSection.classList.remove('hidden');
        drillpipeSection.classList.add('hidden');
        // Re-enable tubing inputs when switching back to tubing mode
        if (tubingSection) {
          const tubingControls = tubingSection.querySelectorAll(
            'input, select, textarea, button'
          );
          tubingControls.forEach((ctrl) => {
            try {
              ctrl.disabled = false;
              ctrl.classList.remove('readonly-input');
            } catch (e) {
              /* ignore */
            }
          });
        }
      }
      calculateVolume();
      if (scheduleSave) scheduleSave();
    });

    // Update drill pipe count via buttons
    drillpipeCountBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const count = parseInt(btn.dataset.count, 10) || 1;

        // Update active button
        drillpipeCountBtns.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        // Re-render drill pipe inputs
        renderDrillPipeInputs(count);
        updateDrillPipeDepthDisplays();
        attachDrillPipeListeners();
        calculateVolume();
        if (scheduleSave) scheduleSave();
      });
    });

    // Ensure UI initially reflects the toggle state (in case it was set by saved state)
    try {
      modeToggle.dispatchEvent(new Event('change'));
    } catch (e) {
      /* ignore */
    }

    function attachDrillPipeListeners() {
      const rows = drillpipeContainer.querySelectorAll('.drillpipe-input-row');
      rows.forEach((row) => {
        const sizeSelect = row.querySelector('select[id^="drillpipe_size_"]');
        const lengthInput = row.querySelector('input[id^="drillpipe_length_"]');

        if (sizeSelect) {
          sizeSelect.addEventListener('change', () => {
            updateDrillPipeDepthDisplays();
            calculateVolume();
            if (scheduleSave) scheduleSave();
          });
        }

        if (lengthInput) {
          lengthInput.addEventListener('input', () => {
            updateDrillPipeDepthDisplays();
            calculateVolume();
            if (scheduleSave) scheduleSave();
          });
        }
      });
    }
  })();
}

export function initUI(deps) {
  // deps: { calculateVolume, scheduleSave, captureStateObject, applyStateObject, initDraw }
  setupEventDelegation(deps);
  setupCasingToggles(deps);
  setupButtons(deps);
  setupTooltips(deps);
  setupHideCasingsToggle(deps);
  setupSizeIdInputs(deps);
  initUpperCompletionChecks(deps);
  setupWellheadSync(deps);
  setupTiebackBehavior(deps);
  setupProductionToggleButtons(deps);
  setupRiserTypeHandler(deps);
  setupRiserPositionToggle(deps);
  setupEodToggle(deps);
  setupPlugToggle(deps);
  setupDrillPipeMode(deps);
  setupNavActive();
  setupThemeToggle();
}

export function initPOIToggle() {
  const poiToggleBtn = document.getElementById('poi-toggle-btn');
  const poiToggleBtnText = document.getElementById('poi-toggle-btn-text');
  const poiSection = document.getElementById('poi-section');

  if (!poiToggleBtn || !poiToggleBtnText || !poiSection) {
    console.warn('POI toggle elements not found');
    return;
  }

  const updatePOIToggleButton = () => {
    const isHidden = poiSection.style.display === 'none';
    poiToggleBtnText.textContent = isHidden
      ? 'Show POI Section'
      : 'Hide POI Section';
  };

  poiToggleBtn.addEventListener('click', () => {
    const isCurrentlyHidden = poiSection.style.display === 'none';
    poiSection.style.display = isCurrentlyHidden ? '' : 'none';
    updatePOIToggleButton();
  });

  updatePOIToggleButton();
}
