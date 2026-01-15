'use strict';

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

  const OD = {
    conductor: { '17.755': 18.625, '28': 30 },
    riser: { '17.5': 20, '8.5': 9.5 },
    surface: { '18.5': 20, '17.755': 18.625 },
    intermediate: { '12.715': 13.375, '12.875': 13.625 },
    production: { '6.276': 7, '8.921': 9.625 },
    tieback: { '8.921': 9.625, '10.75': 11.5 },
    reservoir: { '6.276': 7, '4.892': 5.5 },
  };

  const el = id => document.getElementById(id);
  const qs = selector => Array.from(document.querySelectorAll(selector));

  // Cached DOM
  const canvas = el('wellSchematic');
  const ctx = canvas && canvas.getContext('2d');
  const totalVolumeEl = el('totalVolume');
  const form = el('well-form') || document.body;

  // State
  let saveTimer = null;
  let drawScheduled = false;
  let lastDrawArgs = null;

  // Utilities
  const clampNumber = (v) => (isNaN(v) ? undefined : Number(v));

  function resizeCanvasForDPR() {
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      // reset transform for crisp drawing at device pixel ratio
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
    qs('input[id], select[id]').forEach((input) => {
      if (!input.id) return;
      if (input.type === 'checkbox') state[input.id] = { type: 'checkbox', value: !!input.checked };
      else state[input.id] = { type: input.tagName.toLowerCase(), value: input.value };
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

  // Drawing
  function scheduleDraw(casings, opts = {}) {
    lastDrawArgs = { casings, opts };
    if (drawScheduled) return;
    drawScheduled = true;
    requestAnimationFrame(() => {
      drawScheduled = false;
      const args = lastDrawArgs || { casings: [], opts: {} };
      lastDrawArgs = null;
      drawSchematic(args.casings, args.opts);
    });
  }

  function drawSchematic(casings, opts = {}) {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rect = canvas.getBoundingClientRect();
    const pixelHeight = canvas.height; // already scaled

    // background
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(0.15, '#e6d5b8');
    gradient.addColorStop(1, '#b8a684');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    const maxDepth = Math.max(
      opts && !isNaN(opts.waterDepth) ? opts.waterDepth : 0,
      casings.length ? Math.max(...casings.map(c => c.depth)) : 0
    );
    const maxOD = casings.length ? Math.max(...casings.map(c => c.od)) : 18.625;
    if (maxDepth === 0) return;

    const centerX = rect.width / 2;
    const startY = 50;
    const availableHeight = rect.height - 100;
    const scale = availableHeight / maxDepth;

    if (opts && opts.showWater && !isNaN(opts.waterDepth) && opts.waterDepth > 0) {
      const waterEndY = opts.waterDepth * scale + startY;
      const waterGrad = ctx.createLinearGradient(0, startY, 0, waterEndY);
      waterGrad.addColorStop(0, '#1E90FF');
      waterGrad.addColorStop(1, '#87CEFA');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, startY, rect.width, waterEndY - startY);
    }

    // wellhead
    ctx.fillStyle = '#333';
    ctx.fillRect(centerX - 30, startY - 30, 60, 30);
    ctx.fillStyle = '#666';
    ctx.fillRect(centerX - 25, startY - 40, 50, 15);

    const colors = ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F4A460'];

    casings.slice().sort((a, b) => (a.z || 0) - (b.z || 0) || a.prevDepth - b.prevDepth || b.od - a.od)
      .forEach(casing => {
        const idx = casing.index % colors.length;
        const startDepth = casing.prevDepth * scale + startY;
        const endDepth = casing.depth * scale + startY;
        const width = (casing.od / maxOD) * 80;

        ctx.fillStyle = colors[idx];
        ctx.fillRect(centerX - width / 2, startDepth, width, endDepth - startDepth);

        const innerWidth = (casing.id / maxOD) * 80;
        ctx.fillStyle = '#e6e6e6';
        ctx.fillRect(centerX - innerWidth / 2, startDepth, innerWidth, endDepth - startDepth);

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - width / 2, startDepth);
        ctx.lineTo(centerX - width / 2, endDepth);
        ctx.moveTo(centerX + width / 2, startDepth);
        ctx.lineTo(centerX + width / 2, endDepth);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText(casing.depth.toFixed(0) + 'm', centerX + width / 2 + 10, endDepth);
      });
  }

  // Core calc: read DOM, compute volumes and draw params
  function calculateVolume() {
    // Read common values
    const riserTypeVal = el('riser_type')?.value;
    const riserID = clampNumber(Number(riserTypeVal));
    const riserOD = riserTypeVal === 'none' ? 0 : (OD.riser[riserTypeVal] || 20);

    const riserDepthVal = clampNumber(Number(el('depth_riser')?.value));
    const wellheadDepthVal = clampNumber(Number(el('wellhead_depth')?.value));

    const surfaceBottomVal = clampNumber(Number(el('depth_13')?.value));
    const intermediateBottomVal = clampNumber(Number(el('depth_9')?.value));

    const surfaceInUse = el('use_13')?.checked;
    const intermediateInUse = el('use_9')?.checked;

    // per-casing
    const conductorID = clampNumber(Number(el('conductor_size')?.value));
    const conductorOD = OD.conductor[conductorID] || 30;
    const conductorTopInputVal = clampNumber(Number(el('depth_18_top')?.value));

    const surfaceID = clampNumber(Number(el('surface_size')?.value));
    const surfaceOD = OD.surface[surfaceID] || 20;

    const intermediateID = clampNumber(Number(el('intermediate_size')?.value));
    const intermediateOD = OD.intermediate[intermediateID] || 13.375;

    const productionID = clampNumber(Number(el('production_size')?.value));
    const productionOD = OD.production[productionID] || 9.625;

    const reservoirID = clampNumber(Number(el('reservoir_size')?.value));
    const reservoirOD = OD.reservoir[reservoirID] || 5.5;

    const tiebackID = clampNumber(Number(el('tieback_size')?.value));
    const tiebackOD = OD.tieback[tiebackID] || productionOD;

    // compute auto tops
    let surfaceTopFinal; let surfaceTopAuto = false;
    const surfaceTopInputVal = clampNumber(Number(el('depth_13_top')?.value));
    if (!isNaN(surfaceTopInputVal)) surfaceTopFinal = surfaceTopInputVal;
    else if (el('use_riser')?.checked && surfaceInUse && !isNaN(riserDepthVal) && surfaceBottomVal > riserDepthVal) {
      surfaceTopFinal = riserDepthVal; surfaceTopAuto = true;
    }

    let intermediateTopFinal; let intermediateTopAuto = false;
    const intermediateTopInputVal = clampNumber(Number(el('depth_9_top')?.value));
    if (!isNaN(intermediateTopInputVal)) intermediateTopFinal = intermediateTopInputVal;
    else if (el('use_riser')?.checked && intermediateInUse && !isNaN(riserDepthVal) && !isNaN(intermediateBottomVal) && intermediateBottomVal > riserDepthVal) {
      intermediateTopFinal = riserDepthVal; intermediateTopAuto = true;
    }

    // update connect notes accessibility
    const conductorNoteEl = el('conductor_connect_note');
    if (conductorNoteEl) {
      if (!isNaN(conductorTopInputVal)) { conductorNoteEl.textContent = `Top set to ${conductorTopInputVal} m`; conductorNoteEl.classList.remove('hidden'); conductorNoteEl.setAttribute('aria-hidden','false'); }
      else { conductorNoteEl.classList.add('hidden'); conductorNoteEl.setAttribute('aria-hidden','true'); }
    }

    const surfaceNoteEl = el('surface_connect_note');
    if (surfaceNoteEl) {
      if (typeof surfaceTopFinal !== 'undefined' && surfaceTopAuto) { surfaceNoteEl.classList.remove('hidden'); surfaceNoteEl.setAttribute('aria-hidden','false'); }
      else { surfaceNoteEl.classList.add('hidden'); surfaceNoteEl.setAttribute('aria-hidden','true'); }
    }

    const intermediateNoteEl = el('intermediate_connect_note');
    if (intermediateNoteEl) {
      if (typeof intermediateTopFinal !== 'undefined') {
        intermediateNoteEl.textContent = intermediateTopAuto ? `Connected to riser at ${intermediateTopFinal} m` : `Top set to ${intermediateTopFinal} m`;
        intermediateNoteEl.classList.remove('hidden'); intermediateNoteEl.setAttribute('aria-hidden','false');
      } else { intermediateNoteEl.classList.add('hidden'); intermediateNoteEl.setAttribute('aria-hidden','true'); }
    }

    // gather casings
    const casingsInput = [
      { role: 'riser', id: riserID, depth: clampNumber(Number(el('depth_riser')?.value)), use: !!el('use_riser')?.checked, od: riserOD },
      { role: 'conductor', id: conductorID, top: !isNaN(conductorTopInputVal) ? conductorTopInputVal : undefined, depth: clampNumber(Number(el('depth_18_bottom')?.value)), use: !!el('use_18')?.checked, od: conductorOD },
      { role: 'surface', id: surfaceID, top: surfaceTopFinal, depth: clampNumber(Number(el('depth_13')?.value)), use: !!el('use_13')?.checked, od: surfaceOD },
      { role: 'intermediate', id: intermediateID, top: intermediateTopFinal, depth: clampNumber(Number(el('depth_9')?.value)), use: !!el('use_9')?.checked, od: intermediateOD },
      { role: 'production', id: productionID, top: !isNaN(clampNumber(Number(el('depth_7_top')?.value))) ? clampNumber(Number(el('depth_7_top')?.value)) : undefined, depth: clampNumber(Number(el('depth_7')?.value)), use: !!el('use_7')?.checked, od: productionOD },
      { role: 'tieback', id: tiebackID, top: !isNaN(clampNumber(Number(el('depth_tb_top')?.value))) ? clampNumber(Number(el('depth_tb_top')?.value)) : undefined, depth: clampNumber(Number(el('depth_tb')?.value)), use: !!el('use_tieback')?.checked, od: tiebackOD },
      { role: 'reservoir', id: reservoirID, top: !isNaN(clampNumber(Number(el('depth_5_top')?.value))) ? clampNumber(Number(el('depth_5_top')?.value)) : undefined, depth: clampNumber(Number(el('depth_5')?.value)), use: !!el('use_5')?.checked, od: reservoirOD }
    ];

    let totalVolume = 0;
    let lastIncludedDepth = 0;
    const casingsToDraw = [];

    casingsInput.forEach((casing, index) => {
      const prevDepth = lastIncludedDepth;
      const startForCalc = typeof casing.top !== 'undefined' ? Math.max(prevDepth, casing.top) : prevDepth;
      const drawStart = typeof casing.top !== 'undefined' ? casing.top : prevDepth;

      const shouldDraw = casing.use && casing.depth > drawStart;
      const shouldCountVolume = casing.use && casing.depth > startForCalc && !(casing.role === 'conductor' && surfaceInUse) && !(casing.role === 'surface' && intermediateInUse);

      if (shouldCountVolume) {
        const radiusMeters = (casing.id / 2) * 0.0254;
        const length = casing.depth - startForCalc;
        const volume = Math.PI * radiusMeters * radiusMeters * length;
        totalVolume += volume;
        lastIncludedDepth = casing.depth;
      }

      if (shouldDraw) {
        casingsToDraw.push({ id: casing.id, od: casing.od, depth: casing.depth, prevDepth: drawStart, index, z: casing.role === 'conductor' ? -1 : casing.role === 'reservoir' ? 4 : casing.role === 'production' || casing.role === 'tieback' ? 3 : casing.role === 'intermediate' ? 2 : casing.role === 'surface' ? 1 : 0 });
      }
    });

    if (totalVolumeEl) totalVolumeEl.textContent = (totalVolume || 0).toFixed(2) + ' m³';

    // Show subsea water column when appropriate
    let showWater = false; let waterDepth;
    if (!isNaN(wellheadDepthVal) && wellheadDepthVal > 0) { showWater = true; waterDepth = wellheadDepthVal; }
    else if (riserTypeVal === 'none' && !isNaN(riserDepthVal) && riserDepthVal > 0) { showWater = true; waterDepth = riserDepthVal; }

    scheduleDraw(casingsToDraw, { showWater, waterDepth });
  }

  // UI helpers
  function setupEventDelegation() {
    // handle input/change on form level
    form.addEventListener('input', (e) => {
      if (!e.target) return;
      if (e.target.matches('input, select')) { calculateVolume(); scheduleSave(); }
    });
    form.addEventListener('change', (e) => { if (e.target && e.target.matches('input, select')) { calculateVolume(); scheduleSave(); } });
  }

  function setupCasingToggles() {
    qs('.casing-input').forEach((section) => {
      const checkbox = section.querySelector('.use-checkbox') || section.querySelector('input[type=checkbox]');
      const header = section.querySelector('.casing-header');
      if (!checkbox || !header) return;

      const update = () => {
        if (checkbox.checked) { section.classList.remove('collapsed'); header.setAttribute('aria-expanded','true'); }
        else { section.classList.add('collapsed'); header.setAttribute('aria-expanded','false'); }
      };

      checkbox.addEventListener('change', () => { update(); calculateVolume(); scheduleSave(); });

      header.addEventListener('click', (e) => {
        const target = e.target;
        if (target.closest('.header-inline') || target.tagName.toLowerCase() === 'button') return;
        if (target.tagName.toLowerCase() === 'h3') { checkbox.checked = !checkbox.checked; checkbox.dispatchEvent(new Event('change', { bubbles: true })); }
      });

      // keyboard support
      header.tabIndex = 0;
      header.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); checkbox.checked = !checkbox.checked; checkbox.dispatchEvent(new Event('change', { bubbles: true })); } });

      update();
    });
  }

  function setupButtons() {
    qs('.wellhead-btn').forEach(btn => btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('data-target'); const input = el(targetId); const well = el('wellhead_depth'); if (!input || !well) return; if (well.value === '') return; input.value = well.value; scheduleSave(); calculateVolume();
    }));

    qs('.default-top-btn').forEach(btn => btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('data-target'); const input = el(targetId); if (!input) return;
      if (targetId === 'depth_7_top') {
        const btnText = btn.textContent.trim().toLowerCase(); const interVal = el('depth_9')?.value; const wellVal = el('wellhead_depth')?.value;
        if (btnText === 'default') {
          if (interVal !== undefined && interVal !== '') { input.value = String(Number(interVal) - 50); const tb = el('depth_tb'); if (tb) tb.value = input.value; scheduleSave(); calculateVolume(); return; }
          if (wellVal !== undefined && wellVal !== '') { input.value = wellVal; const tb = el('depth_tb'); if (tb) tb.value = input.value; scheduleSave(); calculateVolume(); return; }
        }
        if (btnText === 'wellhead' || btnText === 'casing') { if (wellVal !== undefined && wellVal !== '') { input.value = wellVal; const tb = el('depth_tb'); if (tb) tb.value = input.value; scheduleSave(); calculateVolume(); return; } }
      }
      const tb = el('depth_tb'); if (tb) tb.value = input.value; scheduleSave(); calculateVolume();
    }));

    // Liner default button (use Intermediate Bottom - 50, fallback to wellhead)
    qs('.liner-default-btn').forEach(btn => btn.addEventListener('click', () => {
      const target = el('depth_7_top'); if (!target) return;
      const inter = el('depth_9')?.value; const well = el('wellhead_depth')?.value;
      if (inter !== undefined && inter !== '') { const val = Number(inter); if (!isNaN(val)) target.value = String(val - 50); }
      else if (well !== undefined && well !== '') { target.value = well; }
      const tb = el('depth_tb'); if (tb) tb.value = target.value;
      scheduleSave(); calculateVolume();
    }));

    // Reservoir Liner button: use Production Bottom - 50
    qs('.reservoir-default-btn').forEach(btn => btn.addEventListener('click', () => {
      const target = el('depth_5_top'); if (!target) return;
      const prodBottom = el('depth_7')?.value;
      if (prodBottom !== undefined && prodBottom !== '') {
        const val = Number(prodBottom);
        if (!isNaN(val)) target.value = String(val - 50);
      } else {
        target.value = '';
      }
      scheduleSave(); calculateVolume();
    }));
  }

  function setupTooltips() {
    // Generic tooltip behavior: button shows tooltip and can persist on click. Tooltip elements carry 'hidden' class by default.
    const setup = (btnId, tipId) => {
      const btn = el(btnId); const tip = el(tipId); if (!btn || !tip) return;
      btn.removeAttribute('title');
      let persistOpen = false;
      const show = () => { tip.classList.remove('hidden'); tip.setAttribute('aria-hidden','false'); };
      const hide = () => { tip.classList.add('hidden'); tip.setAttribute('aria-hidden','true'); };
      btn.addEventListener('mouseenter', show); btn.addEventListener('focus', show);
      btn.addEventListener('mouseleave', () => { if (!persistOpen) hide(); }); btn.addEventListener('blur', hide);
      tip.addEventListener('mouseenter', show); tip.addEventListener('mouseleave', () => { if (!persistOpen) hide(); });
      btn.addEventListener('click', (e) => { e.stopPropagation(); persistOpen = true; show(); btn.focus(); });
      document.addEventListener('click', (e) => { if (!btn.contains(e.target) && !tip.contains(e.target)) { persistOpen = false; hide(); } });
    };
    setup('production_liner_info_btn', 'production_liner_info_tooltip');
    setup('reservoir_default_info_btn', 'reservoir_default_info_tooltip');
  }

  function setupWellheadSync() {
    const well = el('wellhead_depth'); const riser = el('depth_riser'); if (!well || !riser) return;

    // Ensure container is visible (previous HTML used inline 'display:none', replaced with .hidden utility)
    const wellheadContainer = el('wellhead-depth-container');
    if (wellheadContainer) { wellheadContainer.classList.remove('hidden'); wellheadContainer.setAttribute('aria-hidden','false'); }

    well.addEventListener('input', () => { if (riser.value !== well.value) { riser.value = well.value; scheduleSave(); calculateVolume(); } });
    if (well.value !== '' && riser.value !== well.value) riser.value = well.value;

    // when toggling to Subsea, apply to tops
    const toggle = el('riser_subsea'); if (toggle) toggle.addEventListener('change', (e) => { if (e.target.checked && well.value !== '') { ['depth_18_top','depth_13_top'].forEach(id => { const v = el(id); if (v) v.value = well.value; }); scheduleSave(); calculateVolume(); } });
  }

  function setupTiebackBehavior() {
    const prodLinerChk = el('production_is_liner'); const tiebackCasing = el('tieback_casing'); const useTie = el('use_tieback'); const casingBtn = el('production_casing_btn'); if (!prodLinerChk || !tiebackCasing || !useTie) return;
    const prodInfoBtn = el('production_liner_info_btn');
    const update = () => {
      if (prodLinerChk.checked) {
        tiebackCasing.classList.remove('hidden');
        tiebackCasing.setAttribute('aria-hidden','false');
        useTie.checked = true;
        if (casingBtn) { casingBtn.classList.add('hidden'); casingBtn.setAttribute('aria-hidden','true'); }
        if (prodInfoBtn) { prodInfoBtn.classList.add('hidden'); prodInfoBtn.setAttribute('aria-hidden','true'); }
        // When tie-back is enabled, apply the Liner default behavior (set Production top depth) and make Liner active.
        const linerBtnEl = qs('.liner-default-btn')[0];
        if (linerBtnEl) {
          // Trigger the same action as pressing the Liner button
          linerBtnEl.click();
        }
      } else {
        tiebackCasing.classList.add('hidden');
        tiebackCasing.setAttribute('aria-hidden','true');
        useTie.checked = false;
        if (casingBtn) { casingBtn.classList.remove('hidden'); casingBtn.setAttribute('aria-hidden','false'); }
        if (prodInfoBtn) { prodInfoBtn.classList.remove('hidden'); prodInfoBtn.setAttribute('aria-hidden','false'); }
      }
      scheduleSave();
      calculateVolume();
    };
    prodLinerChk.addEventListener('change', update); update();

    // Mirror production top to tie-back bottom
    const prodTop = el('depth_7_top'); const tieBottom = el('depth_tb'); if (prodTop && tieBottom) {
      const sync = () => { tieBottom.value = prodTop.value === '' ? '' : prodTop.value; scheduleSave(); calculateVolume(); };
      prodTop.addEventListener('input', sync); prodTop.addEventListener('change', sync);
      const well = el('wellhead_depth'); if (well) well.addEventListener('input', sync);
      sync();
    }
  }

  function setupProductionToggleButtons() {
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

    // initialise aria-pressed state
    [casingBtn, linerBtn].forEach((b) => { if (b) b.setAttribute('aria-pressed', b.classList.contains('active') ? 'true' : 'false'); });

    if (casingBtn) {
      casingBtn.addEventListener('click', () => {
        if (useTie && useTie.checked) return;
        setActive(casingBtn);
      });
      casingBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); casingBtn.click(); } });
    }

    if (linerBtn) {
      linerBtn.addEventListener('click', () => {
        if (useTie && useTie.checked) return;
        setActive(linerBtn);
      });
      linerBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); linerBtn.click(); } });
    }

    const updateTieback = () => {
      if (prodLinerChk && prodLinerChk.checked) {
        if (linerBtn) setActive(linerBtn);
        if (casingBtn) { casingBtn.classList.remove('active'); casingBtn.setAttribute('aria-pressed','false'); }
      }
    };

    if (prodLinerChk) prodLinerChk.addEventListener('change', updateTieback);
    updateTieback();

    // Default: if no button is active and tie-back is not forcing Liner, make Liner active
    const anyActive = (casingBtn && casingBtn.classList.contains('active')) || (linerBtn && linerBtn.classList.contains('active'));
    if (!anyActive) {
      if (!(prodLinerChk && prodLinerChk.checked) && linerBtn) setActive(linerBtn);
    }
  }

  function setupRiserPositionToggle() {
    const toggle = el('riser_subsea');
    const label = el('riser_position_label');
    if (!toggle || !label) return;
    const update = () => {
      label.textContent = toggle.checked ? 'Subsea' : 'Fixed';
      toggle.setAttribute('aria-checked', toggle.checked ? 'true' : 'false');
    };
    toggle.addEventListener('change', () => { update(); scheduleSave(); calculateVolume(); });
    update();
  }

  function setupRiserTypeHandler() {
    const select = el('riser_type'); const riserDepthEl = el('depth_riser'); const wellEl = el('wellhead_depth'); const riserContainer = el('depth_riser_container'); if (!select || !riserDepthEl) return;
    const update = () => { if (select.value === 'none') { riserDepthEl.value = '0'; if (riserContainer) riserContainer.classList.add('hidden'); } else { if (riserContainer) riserContainer.classList.remove('hidden'); if (wellEl && wellEl.value !== '') riserDepthEl.value = wellEl.value; } scheduleSave(); calculateVolume(); };
    select.addEventListener('change', update); update();
  }

  function init() {
    // load state before initial calc
    loadState();
    // initial canvas sizing
    resizeCanvasForDPR(); window.addEventListener('resize', debouncedResize);
    // setup
    setupEventDelegation(); setupCasingToggles(); setupButtons(); setupTooltips(); setupWellheadSync(); setupTiebackBehavior(); setupProductionToggleButtons(); setupRiserTypeHandler(); setupRiserPositionToggle(); setupNavActive();
    // compute initial
    calculateVolume();
  }

  function setupNavActive() {
    const links = qs('.linker a'); if (!links || !links.length) return; const current = window.location.href.replace(/\/$/, ''); links.forEach((a) => { try { const href = a.href.replace(/\/$/, ''); if (href === current || current.startsWith(href) || href.startsWith(current) || href.includes(window.location.pathname)) a.classList.add('active'); } catch (e) { /* ignore */ } });
  }

  return { init, calculateVolume, saveState };
})();

// initialize
VolumeCalc.init();
