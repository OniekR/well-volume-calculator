import { el, qs } from './dom.js';

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
    btn.addEventListener('click', (e) => {
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
    btn.addEventListener('click', (e) => {
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
    ['riser_type', 'riser_type_id']
  ];

  pairs.forEach(([selId, idInputId]) => {
    const sel = el(selId);
    const idInput = el(idInputId);
    if (!sel || !idInput) return;

    if (!idInput.value) idInput.value = sel.value;

    sel.addEventListener('change', () => {
      if (!idInput.dataset.userEdited) idInput.value = sel.value;
      scheduleSave();
      calculateVolume();
    });

    idInput.addEventListener('input', () => {
      idInput.dataset.userEdited = 'true';
      scheduleSave();
      calculateVolume();
    });
  });
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
        if (dummy && dummy.checked) {
        } else {
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

export function initUI(deps) {
  // deps: { calculateVolume, scheduleSave, captureStateObject, applyStateObject, initDraw }
  setupEventDelegation(deps);
  setupCasingToggles(deps);
  setupButtons(deps);
  setupTooltips(deps);
  setupSizeIdInputs(deps);
  setupWellheadSync(deps);
  setupTiebackBehavior(deps);
  setupProductionToggleButtons(deps);
  setupRiserTypeHandler(deps);
  setupRiserPositionToggle(deps);
  setupPlugToggle(deps);
  setupNavActive();
  setupThemeToggle();
}
