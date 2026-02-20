import { el, qs } from './dom.js';
import { getUpperCompletionTJ } from './validation.js';
import { DRIFT, OD, TJ } from './constants.js';
import { getTubingCatalog } from './definitions.js';
import { setupFlowVelocityUI } from './flow-velocity.js';
import {
  addManualCasingDefinition,
  addManualTubingDefinition,
  deleteCasingDefinition,
  deleteDrillpipeEntry,
  deleteTubingEntry,
  getCasingDefinition,
  getCasingDefinitions,
  getCasingField,
  getDrillpipeCatalog,
  isCasingAdded,
  isCasingEdited,
  isCasingManual,
  isDrillpipeManual,
  isTubingManual,
  registerCasingOptionLabels,
  resetCasingToDefault,
  resetDefinitionsToDefaults,
  setCasingDefinition,
  setDrillpipeEntry,
  setTubingEntry
} from './definitions.js';

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
      // Skip collapse/expand for upper completion checkbox - always keep it expanded
      if (checkbox.id === 'use_upper_completion') {
        section.classList.remove('collapsed');
        header.setAttribute('aria-expanded', 'true');
        return;
      }

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

      // Special handling for upper completion checkbox - disable/enable all UC inputs
      if (checkbox.id === 'use_upper_completion') {
        const tubingSection = el('uc_tubing_section');
        const drillpipeSection = el('uc_drillpipe_section');
        const modeToggle = el('uc_mode_toggle');
        const isEnabled = checkbox.checked;

        // Mode toggle remains enabled so user can set preference even when section is disabled

        // Disable/enable tubing section inputs
        if (tubingSection) {
          const tubingControls = tubingSection.querySelectorAll(
            'input, select, textarea, button'
          );
          tubingControls.forEach((ctrl) => {
            ctrl.disabled = !isEnabled;
            if (isEnabled) {
              ctrl.classList.remove('readonly-input');
            } else {
              ctrl.classList.add('readonly-input');
            }
          });
        }

        // Disable/enable drill pipe section inputs
        if (drillpipeSection) {
          const drillpipeControls = drillpipeSection.querySelectorAll(
            'input, select, textarea, button'
          );
          drillpipeControls.forEach((ctrl) => {
            ctrl.disabled = !isEnabled;
            if (isEnabled) {
              ctrl.classList.remove('readonly-input');
            } else {
              ctrl.classList.add('readonly-input');
            }
          });
        }

        if (isEnabled && modeToggle) {
          const isDP = modeToggle.checked;
          if (isDP) {
            tubingSection?.classList.add('hidden');
            drillpipeSection?.classList.remove('hidden');
            qs(
              '#uc_drillpipe_section input, #uc_drillpipe_section select'
            ).forEach((input) => {
              input.disabled = false;
              input.classList.remove('readonly-input');
            });
            qs('#uc_tubing_section input, #uc_tubing_section select').forEach(
              (input) => {
                input.disabled = true;
                input.classList.add('readonly-input');
              }
            );
          } else {
            drillpipeSection?.classList.add('hidden');
            tubingSection?.classList.remove('hidden');
            qs('#uc_tubing_section input, #uc_tubing_section select').forEach(
              (input) => {
                input.disabled = false;
                input.classList.remove('readonly-input');
              }
            );
            qs(
              '#uc_drillpipe_section input, #uc_drillpipe_section select'
            ).forEach((input) => {
              input.disabled = true;
              input.classList.add('readonly-input');
            });
          }
        }
      }

      calculateVolume();
      scheduleSave();
    });

    header.addEventListener('click', (e) => {
      // Disable header toggle for upper completion
      if (checkbox.id === 'use_upper_completion') {
        return;
      }

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
      // Disable keyboard toggle for upper completion
      if (checkbox.id === 'use_upper_completion') {
        return;
      }

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

  qs('.liner-default-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      const target = _el('depth_7_top');
      if (!target) return;

      const interVal = _el('depth_9')?.value;
      const wellVal = _el('wellhead_depth')?.value;

      if (interVal !== undefined && interVal !== '') {
        const val = Number(interVal);
        if (!isNaN(val)) {
          target.value = String(val - 50);
        }
      } else if (wellVal !== undefined && wellVal !== '') {
        target.value = wellVal;
      }

      const tb = _el('depth_tb');
      if (tb) tb.value = target.value;

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
  setup('flow_help_info_btn', 'flow_help_info_tooltip');
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
          const sectionKey = selId.replace('_size', '');
          const driftVal = getCasingField(
            sectionKey,
            idNum,
            'drift',
            DRIFT && DRIFT[sectionKey] ? DRIFT[sectionKey][idNum] : undefined
          );
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
          const sectionKey = selId.replace('_size', '');
          const driftVal = getCasingField(
            sectionKey,
            idNum,
            'drift',
            DRIFT && DRIFT[sectionKey] ? DRIFT[sectionKey][idNum] : undefined
          );

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

    const ucUse = el('use_upper_completion');
    if (ucUse && !ucUse.checked) {
      removeUpperCompletionWarning();
      return;
    }

    const tubingRows = document.querySelectorAll('.tubing-input-row');

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

    if (tubingRows.length > 0) {
      const segments = [];
      let cumulativeDepth = 0;

      tubingRows.forEach((row) => {
        const sizeSelect = row.querySelector('select[id^="tubing_size_"]');
        const lengthInput = row.querySelector('input[id^="tubing_length_"]');
        if (!sizeSelect || !lengthInput) return;

        const idx = parseInt(sizeSelect.value, 10);
        const tubing = getTubingCatalog()[idx];
        if (!tubing) return;

        const length = Number(lengthInput.value) || 0;
        const ucTop = cumulativeDepth;
        const ucShoe = cumulativeDepth + length;
        cumulativeDepth = ucShoe;

        const ucKey = tubing.id;
        const ucOd = getCasingField(
          'upper_completion',
          ucKey,
          'od',
          tubing.od
        );
        const ucTj =
          (TJ && TJ.upper_completion && TJ.upper_completion[ucKey]) ||
          undefined;

        const ucCompareValue = typeof ucTj !== 'undefined' ? ucTj : ucOd;
        if (typeof ucCompareValue === 'undefined') return;

        segments.push({ ucCompareValue, ucTop, ucShoe, ucTj, ucOd });
      });

      if (!segments.length) return removeUpperCompletionWarning();

      for (const seg of segments) {
        for (const role of roles) {
          const driftEl = el(role + '_drift');
          if (!driftEl) continue;

          const casingSection = driftEl.closest('.casing-input');
          if (casingSection) {
            const useCheckbox = casingSection.querySelector('.use-checkbox');
            if (useCheckbox && !useCheckbox.checked) continue;
          }

          const topEl = el(topMap[role]);
          const shoeEl = el(shoeMap[role]);
          if (!topEl || !shoeEl) continue;
          const casingTop = Number(topEl.value);
          const casingShoe = Number(shoeEl.value);
          if (isNaN(casingTop) || isNaN(casingShoe)) continue;
          if (casingShoe <= casingTop) continue;

          let overlaps = false;
          if (!isNaN(seg.ucTop) && !isNaN(seg.ucShoe)) {
            overlaps = seg.ucTop < casingShoe && seg.ucShoe > casingTop;
          } else if (!isNaN(seg.ucShoe)) {
            overlaps = seg.ucShoe > casingTop;
          } else {
            continue;
          }

          if (!overlaps) continue;

          const driftVal = Number(driftEl.value);
          if (isNaN(driftVal)) continue;

          if (seg.ucCompareValue > driftVal) {
            const what = typeof seg.ucTj !== 'undefined' ? 'TJ' : 'OD';
            showUpperCompletionWarning(
              role,
              what,
              seg.ucCompareValue,
              driftVal
            );
            return;
          }
        }
      }

      removeUpperCompletionWarning();
      return;
    }

    const ucIdEl = el('upper_completion_size_id');
    if (!ucIdEl) return;
    const ucKey = ucIdEl.value;
    if (!ucKey) return removeUpperCompletionWarning();
    const ucOd = getCasingField(
      'upper_completion',
      ucKey,
      'od',
      (OD && OD.upper_completion && OD.upper_completion[ucKey]) ||
        (OD && OD.upper_completion && OD.upper_completion[Number(ucKey)])
    );
    const ucTj =
      (TJ && TJ.upper_completion && TJ.upper_completion[ucKey]) ||
      (TJ && TJ.upper_completion && TJ.upper_completion[Number(ucKey)]);

    const ucCompareValue = typeof ucTj !== 'undefined' ? ucTj : ucOd;
    if (typeof ucCompareValue === 'undefined')
      return removeUpperCompletionWarning();

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
  document
    .querySelectorAll('.tubing-count-btn')
    .forEach((btn) => btn.addEventListener('click', schedule));
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
      const dummy = el('dummy_hanger');
      if (tb) {
        if (dummy && dummy.checked) {
          tb.removeAttribute('readonly');
          tb.classList.remove('readonly-input');
          const wellVal = Number(el('wellhead_depth')?.value || 0);
          if (!tb.dataset.userEdited)
            tb.value = Number((wellVal + 75).toFixed(1));
        } else {
          tb.setAttribute('readonly', 'true');
          tb.readOnly = true;
          tb.classList.add('readonly-input');
          const prodTopEl = el('depth_7_top');
          if (prodTopEl) tb.value = prodTopEl.value;
        }
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
        const prodTopEl = el('depth_7_top');
        const shouldApplyDefault = !prodTopEl || prodTopEl.value.trim() === '';
        if (shouldApplyDefault) linerBtnEl.click();
        const tb2 = el('depth_tb');
        const dummy2 = el('dummy_hanger');
        if (tb2 && !(dummy2 && dummy2.checked)) {
          tb2.setAttribute('readonly', 'true');
          tb2.readOnly = true;
          tb2.classList.add('readonly-input');
          const prodTopEl = el('depth_7_top');
          if (prodTopEl) tb2.value = prodTopEl.value;
        }
      }
    } else {
      tiebackCasing.classList.add('hidden');
      tiebackCasing.setAttribute('aria-hidden', 'true');
      useTie.checked = false;
      const dummyEl = el('dummy_hanger');
      if (dummyEl) dummyEl.checked = false;
      const linerBtn = qs('.liner-default-btn')[0];
      const keepLinerActive = !!(
        linerBtn && linerBtn.classList.contains('active')
      );
      const prodTopEl = el('depth_7_top');
      const wellEl = el('wellhead_depth');
      if (!keepLinerActive && prodTopEl && wellEl && wellEl.value !== '') {
        prodTopEl.value = wellEl.value;
      }
      const tb = el('depth_tb');
      if (tb) {
        tb.setAttribute('readonly', 'true');
        tb.classList.add('readonly-input');
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
        casingBtn.classList.add('active');
        casingBtn.setAttribute('aria-pressed', 'true');
        if (linerBtn) {
          linerBtn.classList.remove('active');
          linerBtn.setAttribute('aria-pressed', 'false');
        }
      }
      if (keepLinerActive && linerBtn) {
        linerBtn.classList.add('active');
        linerBtn.setAttribute('aria-pressed', 'true');
        if (casingBtn) {
          casingBtn.classList.remove('active');
          casingBtn.setAttribute('aria-pressed', 'false');
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
            const dummyEl = el('dummy_hanger');
            if (dummyEl && dummyEl.checked) {
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
              tieBottom.setAttribute('readonly', 'true');
              tieBottom.readOnly = true;
              tieBottom.classList.add('readonly-input');
              tieBottom.value = prodTop.value === '' ? '' : prodTop.value;
              scheduleSave();
              calculateVolume();
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
        if (dummy && dummy.checked) {
          tieBottom.removeAttribute('readonly');
          tieBottom.classList.remove('readonly-input');
          const wellVal = well && well.value !== '' ? Number(well.value) : 0;
          if (!userEdited) {
            tieBottom.value = Number((wellVal + 75).toFixed(1));
          }
        } else {
          tieBottom.setAttribute('readonly', 'true');
          tieBottom.readOnly = true;
          tieBottom.classList.add('readonly-input');
          tieBottom.value = prodTop.value === '' ? '' : prodTop.value;
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
      tieBottom.setAttribute('readonly', 'true');
      tieBottom.readOnly = true;
      tieBottom.classList.add('readonly-input');
      tieBottom.value = prodTop.value === '' ? '' : prodTop.value;
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
  const completionHeading = document.querySelector(
    '#upper_completion_section .casing-header h3'
  );

  if (!modeToggle || !drillpipeSection) return;

  // Update heading text based on mode
  const updateCompletionHeading = (isDrillPipe) => {
    if (completionHeading) {
      completionHeading.textContent = isDrillPipe
        ? 'Drill pipe string'
        : 'Upper completion';
    }
  };

  // Set initial heading based on default state
  updateCompletionHeading(modeToggle.checked);

  // Dynamic async import for drill pipe functions
  (async () => {
    const drillpipeModule = await import('./drillpipe.js');
    const { renderDrillPipeInputs, updateDrillPipeDepthDisplays } =
      drillpipeModule;

    // Toggle between tubing and drill pipe mode
    modeToggle.addEventListener('change', () => {
      const isDP = modeToggle.checked;
      const ucCheckbox = el('use_upper_completion');
      const isSectionEnabled = ucCheckbox?.checked ?? true;

      // Update heading text
      updateCompletionHeading(isDP);
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
              ctrl.disabled = !isSectionEnabled;
              if (isSectionEnabled) {
                ctrl.classList.remove('readonly-input');
              } else {
                ctrl.classList.add('readonly-input');
              }
            } catch (e) {
              /* ignore */
            }
          });
        }
      }
      if (!isSectionEnabled) {
        [tubingSection, drillpipeSection].forEach((section) => {
          if (!section) return;
          const controls = section.querySelectorAll(
            'input, select, textarea, button'
          );
          controls.forEach((ctrl) => {
            ctrl.disabled = true;
            ctrl.classList.add('readonly-input');
          });
        });
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
      document.dispatchEvent(new CustomEvent('keino:drillpipe-ui-ready'));
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

function setupTubingMode(deps) {
  const { calculateVolume, scheduleSave } = deps;
  const tubingCountBtns = document.querySelectorAll('.tubing-count-btn');
  const tubingContainer = el('tubing_inputs_container');

  if (!tubingContainer) return;

  // Dynamic async import for tubing functions
  (async () => {
    const tubingModule = await import('./tubing.js');
    const { renderTubingInputs, updateTubingDepthDisplays } = tubingModule;

    // Initialize tubing inputs on page load
    const activeBtn = document.querySelector('.tubing-count-btn.active');
    const count = parseInt(activeBtn?.dataset.count, 10) || 1;
    renderTubingInputs(count);
    attachTubingListeners();

    // Update tubing count via buttons
    tubingCountBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const count = parseInt(btn.dataset.count, 10) || 1;

        // Update active button
        tubingCountBtns.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        // Re-render tubing inputs
        renderTubingInputs(count);
        attachTubingListeners();
        calculateVolume();
        if (scheduleSave) scheduleSave();
        checkUpperCompletionFit();
      });
    });

    function attachTubingListeners() {
      const rows = tubingContainer.querySelectorAll('.tubing-input-row');
      rows.forEach((row) => {
        const sizeSelect = row.querySelector('select[id^="tubing_size_"]');
        const lengthInput = row.querySelector('input[id^="tubing_length_"]');

        if (sizeSelect) {
          sizeSelect.addEventListener('change', () => {
            calculateVolume();
            if (scheduleSave) scheduleSave();
            checkUpperCompletionFit();
          });
        }

        if (lengthInput) {
          lengthInput.addEventListener('input', () => {
            updateTubingDepthDisplays();
            calculateVolume();
            if (scheduleSave) scheduleSave();
            checkUpperCompletionFit();
          });
        }
      });
    }
  })();

  // Initialize upper completion checkbox state
  const ucCheckbox = el('use_upper_completion');
  if (ucCheckbox && !ucCheckbox.checked) {
    // If unchecked on load, disable all controls
    const modeToggleEl = el('uc_mode_toggle');
    if (modeToggleEl) modeToggleEl.disabled = true;

    const tubingSectionEl = el('uc_tubing_section');
    if (tubingSectionEl) {
      const tubingControls = tubingSectionEl.querySelectorAll(
        'input, select, textarea, button'
      );
      tubingControls.forEach((ctrl) => {
        ctrl.disabled = true;
        ctrl.classList.add('readonly-input');
      });
    }

    const drillpipeSectionEl = el('uc_drillpipe_section');
    if (drillpipeSectionEl) {
      const drillpipeControls = drillpipeSectionEl.querySelectorAll(
        'input, select, textarea, button'
      );
      drillpipeControls.forEach((ctrl) => {
        ctrl.disabled = true;
        ctrl.classList.add('readonly-input');
      });
    }
  }
}

function setupDefinitionsSettings(deps) {
  const { calculateVolume, scheduleSave } = deps;
  const typeCasingRadio = el('defs_type_casing');
  const typeDrillpipeRadio = el('defs_type_drillpipe');
  const sectionContainer = el('defs_section_container');
  const sectionSelect = el('defs_section_select');
  const itemSelect = el('defs_item_select');
  const nameInput = el('defs_name_input');
  const idInput = el('defs_id_input');
  const odInput = el('defs_od_input');
  const driftInput = el('defs_drift_input');
  const tjInput = el('defs_tj_input');
  const lPerMInput = el('defs_lperm_input');
  const eodInput = el('defs_eod_input');
  const cedInput = el('defs_ced_input');
  const saveBtn = el('defs_save_btn');
  const addBtn = el('defs_add_btn');
  const deleteBtn = el('defs_delete_btn');
  const resetSingleBtn = el('defs_reset_single_btn');
  const resetBtn = el('defs_reset_btn');
  const msg = el('defs_msg');

  if (
    !typeCasingRadio ||
    !typeDrillpipeRadio ||
    !sectionSelect ||
    !itemSelect ||
    !nameInput ||
    !idInput ||
    !odInput ||
    !saveBtn ||
    !addBtn ||
    !deleteBtn ||
    !resetSingleBtn ||
    !resetBtn
  )
    return;

  const getSelectedType = () => {
    return typeCasingRadio.checked ? 'casing' : 'drillpipe';
  };

  const casingSelectMap = [
    { section: 'conductor', selectId: 'conductor_size' },
    { section: 'surface', selectId: 'surface_size' },
    { section: 'intermediate', selectId: 'intermediate_size' },
    { section: 'production', selectId: 'production_size' },
    { section: 'tieback', selectId: 'tieback_size' },
    { section: 'reservoir', selectId: 'reservoir_size' },
    { section: 'small_liner', selectId: 'small_liner_size' },
    { section: 'open_hole', selectId: 'open_hole_size' }
  ];

  const setMessage = (text) => {
    if (!msg) return;
    msg.textContent = text || '';
  };

  const parseNumber = (input) => {
    const value = Number(input?.value);
    return Number.isFinite(value) ? value : undefined;
  };

  const registerCurrentLabels = () => {
    casingSelectMap.forEach(({ section, selectId }) => {
      const select = el(selectId);
      if (!select) return;
      const options = Array.from(select.options)
        .filter((opt) => opt.value !== 'none' && opt.value !== 'custom')
        .map((opt) => ({
          id: Number(opt.value),
          label: opt.textContent?.trim() || String(opt.value)
        }));
      registerCasingOptionLabels(section, options);
    });
  };

  const populateGeneralSelects = () => {
    casingSelectMap.forEach(({ section, selectId }) => {
      const select = el(selectId);
      if (!select) return;

      const current = select.value;
      const definitions = getCasingDefinitions(section);
      if (!definitions.length) return;

      const sorted = [...definitions].sort((a, b) => Number(b.id) - Number(a.id));
      select.innerHTML = '';
      sorted.forEach((entry) => {
        const option = document.createElement('option');
        option.value = String(entry.id);
        const label = entry.label || String(entry.id);
        let displayText = label;
        if (isCasingEdited(section, entry.id)) {
          displayText = `${label} (edited)`;
        } else if (isCasingAdded(section, entry.id)) {
          displayText = `${label} (added)`;
        }
        option.textContent = displayText;
        select.appendChild(option);
      });

      const hasCurrent = sorted.some((entry) => String(entry.id) === String(current));
      if (hasCurrent) select.value = current;
      else select.value = String(sorted[0]?.id ?? '');

      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const liftDpSelect = el('lift_drillpipe_select');
    if (liftDpSelect) {
      const current = liftDpSelect.value;
      const catalog = getDrillpipeCatalog();
      liftDpSelect.innerHTML = '';
      [...catalog]
        .sort((a, b) => b.od - a.od)
        .forEach((dp) => {
          const option = document.createElement('option');
          option.value = String(dp.od);
          option.textContent = dp.name;
          liftDpSelect.appendChild(option);
        });
      const customOption = document.createElement('option');
      customOption.value = 'custom';
      customOption.textContent = 'Custom...';
      liftDpSelect.appendChild(customOption);

      liftDpSelect.value =
        Array.from(liftDpSelect.options).find((opt) => opt.value === current)
          ?.value || liftDpSelect.options[0]?.value || 'custom';
      liftDpSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const tubingBtn = document.querySelector('.tubing-count-btn.active');
    if (tubingBtn) tubingBtn.dispatchEvent(new Event('click', { bubbles: true }));

    const dpBtn = document.querySelector('.drillpipe-count-btn.active');
    if (dpBtn) dpBtn.dispatchEvent(new Event('click', { bubbles: true }));
  };

  const populateItems = () => {
    const type = getSelectedType();
    const section = sectionSelect.value;
    itemSelect.innerHTML = '';

    if (type === 'drillpipe') {
      getDrillpipeCatalog().forEach((entry, idx) => {
        const option = document.createElement('option');
        option.value = String(idx);
        option.textContent = entry.name;
        itemSelect.appendChild(option);
      });
      return;
    }

    if (section === 'completion_tubing') {
      getTubingCatalog().forEach((entry, idx) => {
        const option = document.createElement('option');
        option.value = String(idx);
        option.textContent = entry.name;
        itemSelect.appendChild(option);
      });
      return;
    }

    getCasingDefinitions(section).forEach((entry) => {
      const option = document.createElement('option');
      option.value = String(entry.id);
      const label = entry.label || String(entry.id);
      let displayText = label;
      if (isCasingEdited(section, entry.id)) {
        displayText = `${label} (edited)`;
      } else if (isCasingAdded(section, entry.id)) {
        displayText = `${label} (added)`;
      }
      option.textContent = displayText;
      itemSelect.appendChild(option);
    });
  };

  const setFieldVisibility = () => {
    const type = getSelectedType();
    const section = sectionSelect.value;
    const isDrillPipe = type === 'drillpipe';
    const isTubing = type === 'casing' && section === 'completion_tubing';
    const isCasing = type === 'casing' && !isTubing;

    const driftField = el('defs_drift_field');
    const tjField = el('defs_tj_field');
    const lPerMField = el('defs_lperm_field');
    const eodField = el('defs_eod_field');
    const cedField = el('defs_ced_field');

    if (sectionContainer) sectionContainer.classList.toggle('hidden', isDrillPipe);
    if (driftField) driftField.classList.toggle('hidden', !isCasing || section === 'open_hole');
    if (tjField) tjField.classList.toggle('hidden', !isCasing);
    if (lPerMField) lPerMField.classList.toggle('hidden', !(isDrillPipe || isTubing));
    if (eodField) eodField.classList.toggle('hidden', !(isDrillPipe || isTubing));
    if (cedField) cedField.classList.toggle('hidden', !isDrillPipe);
  };

  const loadSelected = () => {
    setFieldVisibility();
    const type = getSelectedType();
    const section = sectionSelect.value;

    let isManual = false;

    if (type === 'drillpipe') {
      const idx = Number(itemSelect.value);
      const item = getDrillpipeCatalog()[idx];
      if (!item) return;
      nameInput.value = item.name || '';
      idInput.value = item.id ?? '';
      odInput.value = item.od ?? '';
      driftInput.value = '';
      tjInput.value = '';
      lPerMInput.value = item.lPerM ?? '';
      eodInput.value = item.eod ?? '';
      cedInput.value = item.ced ?? '';
      isManual = isDrillpipeManual(idx);
    } else if (section === 'completion_tubing') {
      const idx = Number(itemSelect.value);
      const item = getTubingCatalog()[idx];
      if (!item) return;
      nameInput.value = item.name || '';
      idInput.value = item.id ?? '';
      odInput.value = item.od ?? '';
      driftInput.value = '';
      tjInput.value = '';
      lPerMInput.value = item.lPerM ?? '';
      eodInput.value = item.eod ?? '';
      cedInput.value = '';
      isManual = isTubingManual(idx);
    } else {
      const item = getCasingDefinition(section, itemSelect.value);
      if (!item) return;
      nameInput.value = item.label || '';
      idInput.value = item.id ?? '';
      odInput.value = item.od ?? '';
      driftInput.value = item.drift ?? '';
      tjInput.value = item.tj ?? '';
      lPerMInput.value = '';
      eodInput.value = '';
      cedInput.value = '';
      isManual = isCasingManual(section, itemSelect.value);
    }

    deleteBtn.classList.toggle('hidden', !isCasingManual(section, itemSelect.value));
    resetSingleBtn.classList.toggle('hidden', !isCasingEdited(section, itemSelect.value));
    
    if (getSelectedType() === 'casing') {
      if (isCasingEdited(section, itemSelect.value)) {
        setMessage('⚠ This casing has been edited. You can reset it to defaults.');
      } else if (isCasingAdded(section, itemSelect.value)) {
        setMessage('ℹ This is a custom casing.');
      } else {
        setMessage('');
      }
    } else {
      setMessage('');
    }
  };

  const refreshEditor = () => {
    populateItems();
    loadSelected();
  };

  saveBtn.addEventListener('click', () => {
    const type = getSelectedType();
    const section = sectionSelect.value;

    let ok = false;
    if (type === 'drillpipe') {
      ok = setDrillpipeEntry(Number(itemSelect.value), {
        name: nameInput.value.trim(),
        id: parseNumber(idInput),
        od: parseNumber(odInput),
        lPerM: parseNumber(lPerMInput),
        eod: parseNumber(eodInput),
        ced: parseNumber(cedInput)
      });
    } else if (section === 'completion_tubing') {
      ok = setTubingEntry(Number(itemSelect.value), {
        name: nameInput.value.trim(),
        id: parseNumber(idInput),
        od: parseNumber(odInput),
        lPerM: parseNumber(lPerMInput),
        eod: parseNumber(eodInput)
      });
    } else {
      const idValue = parseNumber(idInput);
      ok = setCasingDefinition(section, idValue, {
        label: nameInput.value.trim(),
        id: idValue,
        od: parseNumber(odInput),
        drift: parseNumber(driftInput),
        tj: parseNumber(tjInput)
      });
    }

    if (!ok) {
      setMessage('Failed to save definition. Check numeric values.');
      return;
    }

    setMessage('Definition saved.');
    populateGeneralSelects();
    refreshEditor();
    calculateVolume();
    scheduleSave();
  });

  addBtn.addEventListener('click', () => {
    const section = sectionSelect.value;
    const idValue = parseNumber(idInput);
    const odValue = parseNumber(odInput);
    const nameValue = nameInput.value.trim();

    let ok = false;
    if (getSelectedType() === 'drillpipe') {
      setMessage('Manual add is available for casing/tubing sections.');
      return;
    }

    if (section === 'completion_tubing') {
      ok = addManualTubingDefinition({
        name: nameValue,
        id: idValue,
        od: odValue,
        lPerM: parseNumber(lPerMInput),
        eod: parseNumber(eodInput)
      });
    } else {
      ok = addManualCasingDefinition(section, {
        label: nameValue || (idValue ? String(idValue) : ''),
        id: idValue,
        od: odValue,
        drift: parseNumber(driftInput),
        tj: parseNumber(tjInput)
      });
    }

    if (!ok) {
      setMessage('Failed to add manual entry. Check required fields.');
      return;
    }

    setMessage('Manual definition added.');
    populateGeneralSelects();
    refreshEditor();
    calculateVolume();
    scheduleSave();
  });

  deleteBtn.addEventListener('click', () => {
    const type = getSelectedType();
    const section = sectionSelect.value;
    
    if (!confirm('Delete this manual entry? This cannot be undone.')) return;

    let ok = false;
    if (type === 'drillpipe') {
      ok = deleteDrillpipeEntry(Number(itemSelect.value));
    } else if (section === 'completion_tubing') {
      ok = deleteTubingEntry(Number(itemSelect.value));
    } else {
      ok = deleteCasingDefinition(section, itemSelect.value);
    }

    if (!ok) {
      setMessage('Failed to delete entry. Only manual entries can be deleted.');
      return;
    }

    setMessage('Entry deleted successfully.');
    populateGeneralSelects();
    refreshEditor();
    calculateVolume();
    scheduleSave();
  });

  resetSingleBtn.addEventListener('click', () => {
    const section = sectionSelect.value;
    const id = itemSelect.value;
    
    if (!confirm('Reset this casing back to its default values?')) return;
    
    const ok = resetCasingToDefault(section, id);
    if (!ok) {
      setMessage('Failed to reset. Only edited casings can be reset.');
      return;
    }
    
    setMessage('Casing reset to default values.');
    populateGeneralSelects();
    refreshEditor();
    calculateVolume();
    scheduleSave();
  });

  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset all edited/manual definitions back to defaults?')) return;
    resetDefinitionsToDefaults();
    setMessage('Definitions reset to defaults.');
    populateGeneralSelects();
    refreshEditor();
    calculateVolume();
    scheduleSave();
  });

  typeCasingRadio.addEventListener('change', refreshEditor);
  typeDrillpipeRadio.addEventListener('change', refreshEditor);
  sectionSelect.addEventListener('change', () => {
    localStorage.setItem('keino_defs_section', sectionSelect.value);
    refreshEditor();
  });
  itemSelect.addEventListener('change', loadSelected);

  document.addEventListener('keino:definitions-changed', () => {
    populateGeneralSelects();
    refreshEditor();
  });

  const savedSection = localStorage.getItem('keino_defs_section');
  if (savedSection && sectionSelect.querySelector(`option[value="${savedSection}"]`)) {
    sectionSelect.value = savedSection;
  }

  registerCurrentLabels();
  populateGeneralSelects();
  refreshEditor();
}

function setupSettingsResetActions(deps) {
  const { calculateVolume, scheduleSave } = deps;

  const resetCasingDepthsBtn = el('reset_casing_depths_btn');
  const resetTubingInputsBtn = el('reset_tubing_inputs_btn');
  const clearDrillpipeInputsBtn = el('clear_drillpipe_inputs_btn');
  const clearManualCasingsBtn = el('clear_manual_casings_btn');
  const clearManualDrillpipeBtn = el('clear_manual_drillpipe_btn');

  const applyAndSave = () => {
    calculateVolume();
    scheduleSave();
  };

  if (resetCasingDepthsBtn) {
    resetCasingDepthsBtn.addEventListener('click', () => {
      if (!confirm('Clear all casing depth inputs?')) return;
      const depthIds = [
        'depth_18_top',
        'depth_18_bottom',
        'depth_13_top',
        'depth_13',
        'depth_9_top',
        'depth_9',
        'depth_7_top',
        'depth_7',
        'depth_tb_top',
        'depth_tb',
        'depth_5_top',
        'depth_5',
        'depth_small_top',
        'depth_small',
        'depth_open_top',
        'depth_open'
      ];

      depthIds.forEach((id) => {
        const field = el(id);
        if (!field) return;
        field.value = '';
        field.dispatchEvent(new Event('input', { bubbles: true }));
      });

      applyAndSave();
    });
  }

  if (resetTubingInputsBtn) {
    resetTubingInputsBtn.addEventListener('click', () => {
      if (!confirm('Reset tubing inputs to a single empty row?')) return;

      const modeToggle = el('uc_mode_toggle');
      if (modeToggle && modeToggle.checked) {
        modeToggle.checked = false;
        modeToggle.dispatchEvent(new Event('change', { bubbles: true }));
      }

      el('tubing_count_1')?.dispatchEvent(new Event('click', { bubbles: true }));

      const rows = qs('#tubing_inputs_container .tubing-input-row');
      rows.forEach((row) => {
        const sizeSelect = row.querySelector('select[id^="tubing_size_"]');
        const lengthInput = row.querySelector('input[id^="tubing_length_"]');

        if (sizeSelect && sizeSelect.options.length) {
          sizeSelect.selectedIndex = 0;
          sizeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (lengthInput) {
          lengthInput.value = '';
          lengthInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      applyAndSave();
    });
  }

  if (clearDrillpipeInputsBtn) {
    clearDrillpipeInputsBtn.addEventListener('click', () => {
      if (!confirm('Clear drill pipe input rows?')) return;

      const modeToggle = el('uc_mode_toggle');
      const wasDrillpipeMode = !!modeToggle?.checked;

      if (modeToggle && !modeToggle.checked) {
        modeToggle.checked = true;
        modeToggle.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const rows = qs('#drillpipe_inputs_container .drillpipe-input-row');
      rows.forEach((row) => {
        const sizeSelect = row.querySelector('select[id^="drillpipe_size_"]');
        const lengthInput = row.querySelector('input[id^="drillpipe_length_"]');

        if (sizeSelect && sizeSelect.options.length) {
          sizeSelect.selectedIndex = 0;
          sizeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (lengthInput) {
          lengthInput.value = '';
          lengthInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      if (modeToggle && !wasDrillpipeMode) {
        modeToggle.checked = false;
        modeToggle.dispatchEvent(new Event('change', { bubbles: true }));
      }

      applyAndSave();
    });
  }

  if (clearManualCasingsBtn) {
    clearManualCasingsBtn.addEventListener('click', () => {
      if (!confirm('Clear all manual casing definitions?')) return;

      const sections = [
        'conductor',
        'surface',
        'intermediate',
        'production',
        'tieback',
        'reservoir',
        'small_liner',
        'open_hole',
        'upper_completion'
      ];

      sections.forEach((section) => {
        getCasingDefinitions(section).forEach((entry) => {
          if (isCasingManual(section, entry.id)) {
            deleteCasingDefinition(section, entry.id);
          }
        });
      });

      applyAndSave();
    });
  }

  if (clearManualDrillpipeBtn) {
    clearManualDrillpipeBtn.addEventListener('click', () => {
      if (!confirm('Clear all manual drill pipe definitions?')) return;

      const catalog = getDrillpipeCatalog();
      for (let index = catalog.length - 1; index >= 0; index -= 1) {
        if (isDrillpipeManual(index)) {
          deleteDrillpipeEntry(index);
        }
      }

      applyAndSave();
    });
  }
}

export function initUI(deps) {
  // deps: { calculateVolume, scheduleSave, captureStateObject, applyStateObject, initDraw }
  setupEventDelegation(deps);
  setupCasingToggles(deps);
  setupButtons(deps);
  setupTooltips(deps);
  setupFlowVelocityUI(deps);
  setupDefinitionsSettings(deps);
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
  setupTubingMode(deps);
  setupNavActive();
  setupThemeToggle();
  setupSettingsResetActions(deps);
}
