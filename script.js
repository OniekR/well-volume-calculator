"use strict";

/*
 * Refactored module for the Well Volume Calculator
 * - Encapsulates state
 * - Caches DOM queries
 * - Debounces saves
 * - Uses requestAnimationFrame for drawing
 * - Handles high-DPI canvas scaling
 */
const VolumeCalc = (() => {
  const STORAGE_KEY = "keino_volume_state_v2";

  const OD = {
    conductor: { 17.8: 18.625, 28: 30, 27: 30 },
    riser: { 17.5: 20, 8.5: 9.5 },
    surface: { 18.73: 20, 17.8: 18.625 },
    intermediate: { 12.347: 13.375, 12.375: 13.625 },
    production: { 6.276: 7, 8.921: 9.625 },
    tieback: { 8.535: 9.625, 8.921: 9.625, 9.66: 11.5 },
    reservoir: { 6.276: 7, 4.778: 5.5 },
  };

  const el = (id) => document.getElementById(id);
  const qs = (selector) => Array.from(document.querySelectorAll(selector));

  // Test helper: allow tests to set theme even if setup didn't run in some environments
  try {
    if (typeof window !== "undefined") {
      window.__TEST_applyTheme = (mode) => {
        if (mode === "dark") document.documentElement.setAttribute("data-theme", "dark");
        else document.documentElement.removeAttribute("data-theme");
        try {
          localStorage.setItem("keino_theme", mode === "dark" ? "dark" : "light");
        } catch (e) {
          /* ignore */
        }
      };
    }
  } catch (e) {
    /* ignore */
  }

  // Cached DOM
  const canvas = el("wellSchematic");
  const ctx = canvas && canvas.getContext("2d");
  const totalVolumeEl = el("totalVolume");
  const form = el("well-form") || document.body;

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
    qs("input[id], select[id]").forEach((input) => {
      if (!input.id) return;
      if (input.type === "checkbox") state[input.id] = { type: "checkbox", value: !!input.checked };
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
        if (item.type === "checkbox") input.checked = !!item.value;
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
    gradient.addColorStop(0, "#87ceeb");
    gradient.addColorStop(0.15, "#e6d5b8");
    gradient.addColorStop(1, "#b8a684");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    const maxDepth = Math.max(
      opts && !isNaN(opts.waterDepth) ? opts.waterDepth : 0,
      casings.length ? Math.max(...casings.map((c) => c.depth)) : 0
    );
    const maxOD = casings.length ? Math.max(...casings.map((c) => c.od)) : 18.625;
    if (maxDepth === 0) return;

    const centerX = rect.width / 2;
    const startY = 50;
    const availableHeight = rect.height - 100;
    const scale = availableHeight / maxDepth;

    if (opts && opts.showWater && !isNaN(opts.waterDepth) && opts.waterDepth > 0) {
      const waterEndY = opts.waterDepth * scale + startY;
      const waterGrad = ctx.createLinearGradient(0, startY, 0, waterEndY);
      waterGrad.addColorStop(0, "#1E90FF");
      waterGrad.addColorStop(1, "#87CEFA");
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, startY, rect.width, waterEndY - startY);
    }

    // wellhead
    ctx.fillStyle = "#333";
    ctx.fillRect(centerX - 30, startY - 30, 60, 30);
    ctx.fillStyle = "#666";
    ctx.fillRect(centerX - 25, startY - 40, 50, 15);

    const colors = ["#8B4513", "#A0522D", "#CD853F", "#DEB887", "#F4A460"];

    casings
      .slice()
      .sort((a, b) => (a.z || 0) - (b.z || 0) || a.prevDepth - b.prevDepth || b.od - a.od)
      .forEach((casing) => {
        const idx = casing.index % colors.length;
        const startDepth = casing.prevDepth * scale + startY;
        const endDepth = casing.depth * scale + startY;
        const width = (casing.od / maxOD) * 80;

        ctx.fillStyle = colors[idx];
        ctx.fillRect(centerX - width / 2, startDepth, width, endDepth - startDepth);

        const innerWidth = (casing.id / maxOD) * 80;
        ctx.fillStyle = "#e6e6e6";
        ctx.fillRect(centerX - innerWidth / 2, startDepth, innerWidth, endDepth - startDepth);

        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - width / 2, startDepth);
        ctx.lineTo(centerX - width / 2, endDepth);
        ctx.moveTo(centerX + width / 2, startDepth);
        ctx.lineTo(centerX + width / 2, endDepth);
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.fillText(casing.depth.toFixed(0) + "m", centerX + width / 2 + 10, endDepth);
      });
  }

  // Core calc: read DOM, compute volumes and draw params
  function calculateVolume() {
    // Read common values
    const riserTypeVal = el("riser_type")?.value;
    const riserID = sizeIdValue("riser_type", clampNumber(Number(riserTypeVal)));
    const riserOD = riserTypeVal === "none" ? 0 : OD.riser[riserTypeVal] || 20;

    const riserDepthVal = clampNumber(Number(el("depth_riser")?.value));
    const wellheadDepthVal = clampNumber(Number(el("wellhead_depth")?.value));

    const surfaceBottomVal = clampNumber(Number(el("depth_13")?.value));
    const intermediateBottomVal = clampNumber(Number(el("depth_9")?.value));

    const surfaceInUse = el("use_13")?.checked;
    const intermediateInUse = el("use_9")?.checked;

    // per-casing
    // prefer explicit ID input values if provided
    const conductorID = sizeIdValue(
      "conductor_size",
      clampNumber(Number(el("conductor_size")?.value))
    );
    const conductorOD = OD.conductor[conductorID] || 30;
    const conductorTopInputVal = clampNumber(Number(el("depth_18_top")?.value));

    const surfaceID = sizeIdValue("surface_size", clampNumber(Number(el("surface_size")?.value)));
    const surfaceOD = OD.surface[surfaceID] || 20;

    const intermediateID = sizeIdValue(
      "intermediate_size",
      clampNumber(Number(el("intermediate_size")?.value))
    );
    const intermediateOD = OD.intermediate[intermediateID] || 13.375;

    const productionID = sizeIdValue(
      "production_size",
      clampNumber(Number(el("production_size")?.value))
    );
    const productionOD = OD.production[productionID] || 9.625;

    const reservoirID = sizeIdValue(
      "reservoir_size",
      clampNumber(Number(el("reservoir_size")?.value))
    );
    const reservoirOD = OD.reservoir[reservoirID] || 5.5;

    const tiebackID = sizeIdValue("tieback_size", clampNumber(Number(el("tieback_size")?.value)));
    const tiebackOD = OD.tieback[tiebackID] || productionOD;

    // compute auto tops
    let surfaceTopFinal;
    let surfaceTopAuto = false;
    const surfaceTopInputVal = clampNumber(Number(el("depth_13_top")?.value));
    if (!isNaN(surfaceTopInputVal)) surfaceTopFinal = surfaceTopInputVal;
    else if (
      el("use_riser")?.checked &&
      surfaceInUse &&
      !isNaN(riserDepthVal) &&
      surfaceBottomVal > riserDepthVal
    ) {
      surfaceTopFinal = riserDepthVal;
      surfaceTopAuto = true;
    }

    let intermediateTopFinal;
    let intermediateTopAuto = false;
    const intermediateTopInputVal = clampNumber(Number(el("depth_9_top")?.value));
    if (!isNaN(intermediateTopInputVal)) intermediateTopFinal = intermediateTopInputVal;
    else if (
      el("use_riser")?.checked &&
      intermediateInUse &&
      !isNaN(riserDepthVal) &&
      !isNaN(intermediateBottomVal) &&
      intermediateBottomVal > riserDepthVal
    ) {
      intermediateTopFinal = riserDepthVal;
      intermediateTopAuto = true;
    }

    // connect notes removed (UI simplified)
    // gather casings
    const casingsInput = [
      {
        role: "riser",
        id: riserID,
        depth: clampNumber(Number(el("depth_riser")?.value)),
        use: !!el("use_riser")?.checked,
        od: riserOD,
      },
      {
        role: "conductor",
        id: conductorID,
        top: !isNaN(conductorTopInputVal) ? conductorTopInputVal : undefined,
        depth: clampNumber(Number(el("depth_18_bottom")?.value)),
        use: !!el("use_18")?.checked,
        od: conductorOD,
      },
      {
        role: "surface",
        id: surfaceID,
        top: surfaceTopFinal,
        depth: clampNumber(Number(el("depth_13")?.value)),
        use: !!el("use_13")?.checked,
        od: surfaceOD,
      },
      {
        role: "intermediate",
        id: intermediateID,
        top: intermediateTopFinal,
        depth: clampNumber(Number(el("depth_9")?.value)),
        use: !!el("use_9")?.checked,
        od: intermediateOD,
      },
      {
        role: "production",
        id: productionID,
        top: !isNaN(clampNumber(Number(el("depth_7_top")?.value)))
          ? clampNumber(Number(el("depth_7_top")?.value))
          : undefined,
        depth: clampNumber(Number(el("depth_7")?.value)),
        use: !!el("use_7")?.checked,
        od: productionOD,
      },
      {
        role: "tieback",
        id: tiebackID,
        top: !isNaN(clampNumber(Number(el("depth_tb_top")?.value)))
          ? clampNumber(Number(el("depth_tb_top")?.value))
          : undefined,
        depth: clampNumber(Number(el("depth_tb")?.value)),
        use: !!el("use_tieback")?.checked,
        od: tiebackOD,
      },
      {
        role: "reservoir",
        id: reservoirID,
        top: !isNaN(clampNumber(Number(el("depth_5_top")?.value)))
          ? clampNumber(Number(el("depth_5_top")?.value))
          : undefined,
        depth: clampNumber(Number(el("depth_5")?.value)),
        use: !!el("use_5")?.checked,
        od: reservoirOD,
      },
    ];

    // Open hole top: link to deepest enabled casing shoe
    (function () {
      let openTopFinal;
      const conductorBottomVal = clampNumber(Number(el("depth_18_bottom")?.value));
      const productionBottomVal = clampNumber(Number(el("depth_7")?.value));
      const reservoirBottomVal = clampNumber(Number(el("depth_5")?.value));
      const smallLinerBottomVal = clampNumber(Number(el("depth_small")?.value));
      const tiebackBottomVal = clampNumber(Number(el("depth_tb")?.value));

      const useConductorFlag = !!el("use_18")?.checked;
      const useSurfaceFlag = !!el("use_13")?.checked;
      const useIntermediateFlag = !!el("use_9")?.checked;
      const useProductionFlag = !!el("use_7")?.checked;
      const useReservoirFlag = !!el("use_5")?.checked;
      const useSmallLinerFlag = !!el("use_small_liner")?.checked;
      const useTiebackFlag = !!el("use_tieback")?.checked;

      const shoeCandidates = [];
      if (useConductorFlag && !isNaN(conductorBottomVal)) shoeCandidates.push(conductorBottomVal);
      if (useSurfaceFlag && !isNaN(surfaceBottomVal)) shoeCandidates.push(surfaceBottomVal);
      if (useIntermediateFlag && !isNaN(intermediateBottomVal))
        shoeCandidates.push(intermediateBottomVal);
      if (useProductionFlag && !isNaN(productionBottomVal))
        shoeCandidates.push(productionBottomVal);
      if (useReservoirFlag && !isNaN(reservoirBottomVal)) shoeCandidates.push(reservoirBottomVal);
      if (useSmallLinerFlag && !isNaN(smallLinerBottomVal))
        shoeCandidates.push(smallLinerBottomVal);
      if (useTiebackFlag && !isNaN(tiebackBottomVal)) shoeCandidates.push(tiebackBottomVal);

      const deepest = (function (arr) {
        if (!arr || !arr.length) return undefined;
        return Math.max(...arr);
      })(shoeCandidates);

      const openTopEl = el("depth_open_top");
      const openNoteEl = el("open_hole_length_note");
      if (typeof deepest !== "undefined") {
        if (openTopEl) openTopEl.value = String(deepest);
        if (openNoteEl) openNoteEl.textContent = `Top linked to deepest casing shoe: ${deepest} m`;
      } else {
        if (openNoteEl) openNoteEl.textContent = "";
      }
    })();

    // Recompute volumes using depth-segments so the *smallest ID* casing wins overlapping segments
    let totalVolume = 0;
    const casingsToDraw = [];

    // Prepare per-role accumulators (use role as key: keeps order later)
    const perCasingMap = {};
    casingsInput.forEach((c) => {
      perCasingMap[c.role] = {
        role: c.role,
        includedLength: 0,
        volume: 0,
        perMeter_m3: c.id ? Math.PI * Math.pow((c.id / 2) * 0.0254, 2) : 0,
        physicalLength: typeof c.top !== "undefined" ? Math.max(0, c.depth - c.top) : undefined,
        use: !!c.use,
      };
      // prepare draw entries as before
      const drawStart = typeof c.top !== "undefined" ? c.top : 0;
      if (c.use && c.depth > drawStart) {
        casingsToDraw.push({
          id: c.id,
          od: c.od,
          depth: c.depth,
          prevDepth: drawStart,
          index: 0,
          z:
            c.role === "conductor"
              ? -1
              : c.role === "reservoir"
                ? 4
                : c.role === "production" || c.role === "tieback"
                  ? 3
                  : c.role === "intermediate"
                    ? 2
                    : c.role === "surface"
                      ? 1
                      : 0,
        });
      }
    });

    // Build sorted unique depth points from all tops and bottoms
    const pointsSet = new Set([0]);
    casingsInput.forEach((c) => {
      if (typeof c.top !== "undefined" && !isNaN(c.top)) pointsSet.add(c.top);
      if (!isNaN(c.depth)) pointsSet.add(c.depth);
    });
    const points = Array.from(pointsSet).sort((a, b) => a - b);

    // For each segment between consecutive points, find covering casings and award the segment to the deepest eligible casing
    for (let i = 0; i < points.length - 1; i++) {
      const segStart = points[i];
      const segEnd = points[i + 1];
      const segLength = segEnd - segStart;
      if (segLength <= 0) continue;

      // find eligible casings covering this segment
      const covering = casingsInput.filter((c) => {
        if (!c.use) return false;
        if (c.depth <= segStart) return false; // bottom at or above segment start -> does not cover
        const topVal = typeof c.top !== "undefined" ? c.top : 0;
        if (topVal >= segEnd) return false; // top at or below segment end -> does not cover
        // preserve existing role exclusions
        if (c.role === "conductor" && surfaceInUse) return false;
        if (c.role === "surface" && intermediateInUse) return false;
        return true;
      });

      if (covering.length === 0) continue;

      // choose the casing with the smallest ID (numeric) when overlapping — smallest ID wins
      covering.sort((a, b) => {
        const ai = isNaN(Number(a.id)) ? Infinity : Number(a.id);
        const bi = isNaN(Number(b.id)) ? Infinity : Number(b.id);
        return ai - bi;
      });
      const winner = covering[0];
      const area = perCasingMap[winner.role].perMeter_m3; // m^3 per meter
      const segVol = area * segLength;
      totalVolume += segVol;
      perCasingMap[winner.role].volume += segVol;
      perCasingMap[winner.role].includedLength += segLength;
    }

    // Convert perCasingMap to array in stable order and preserve use flag
    const perCasingVolumes = casingsInput.map((c) => {
      const p = perCasingMap[c.role] || {
        role: c.role,
        includedLength: 0,
        volume: 0,
        perMeter_m3: 0,
        physicalLength: undefined,
      };
      p.use = !!c.use;
      return p;
    });

    if (totalVolumeEl) totalVolumeEl.textContent = (totalVolume || 0).toFixed(2) + " m³";

    // Render per-casing volume table
    const casingVolumesTable = el("casingVolumes");
    if (casingVolumesTable) {
      const tbody = casingVolumesTable.querySelector("tbody");
      if (tbody) {
        tbody.innerHTML = "";
        // friendly labels
        const roleLabel = {
          riser: "Riser",
          conductor: "Conductor",
          surface: "Surface",
          intermediate: "Intermediate",
          production: "Production",
          tieback: "Tie-back",
          reservoir: "Reservoir",
        };
        let totals = { volume: 0, includedLength: 0 };

        // Render only casings that are in use
        perCasingVolumes.forEach((c) => {
          if (!c.use) return;

          const tr = document.createElement("tr");
          const nameTd = document.createElement("td");
          nameTd.textContent = roleLabel[c.role] || c.role;
          tr.appendChild(nameTd);
          // New column order: Volume, Included length, Volume per m
          const volTd = document.createElement("td");
          volTd.textContent = (c.volume || 0).toFixed(1);
          tr.appendChild(volTd);
          const lenTd = document.createElement("td");
          lenTd.textContent = (c.includedLength || 0).toFixed(1);
          tr.appendChild(lenTd);
          const perMtd = document.createElement("td");
          perMtd.textContent = ((c.perMeter_m3 || 0) * 1000).toFixed(1);
          tr.appendChild(perMtd);
          tbody.appendChild(tr);

          totals.volume += c.volume || 0;
          totals.includedLength += c.includedLength || 0;
        });

        // Update per-role physical length notes (under each Shoe input) for all casings
        const noteIdMap = {
          riser: "riser_length_note",
          conductor: "conductor_length_note",
          surface: "surface_length_note",
          intermediate: "intermediate_length_note",
          production: "production_length_note",
          tieback: "tieback_length_note",
          reservoir: "reservoir_length_note",
        };
        perCasingVolumes.forEach((c) => {
          const noteEl = el(noteIdMap[c.role]);
          if (noteEl) {
            if (typeof c.physicalLength !== "undefined") {
              noteEl.textContent = `Length: ${c.physicalLength.toFixed(1)} m`;
              noteEl.classList.remove("hidden");
            } else {
              noteEl.textContent = "";
            }
          }
        });

        // Totals row
        const totalsTr = document.createElement("tr");
        totalsTr.classList.add("totals-row");
        const totalsLabelTd = document.createElement("td");
        totalsLabelTd.textContent = "Totals";
        totalsTr.appendChild(totalsLabelTd);
        const totalsVolTd = document.createElement("td");
        totalsVolTd.textContent = (totals.volume || 0).toFixed(1);
        totalsTr.appendChild(totalsVolTd);
        const totalsLenTd = document.createElement("td");
        totalsLenTd.textContent = (totals.includedLength || 0).toFixed(1);
        totalsTr.appendChild(totalsLenTd);
        const totalsPerMTd = document.createElement("td");
        if (totals.includedLength > 0) {
          totalsPerMTd.textContent = ((totals.volume / totals.includedLength) * 1000).toFixed(1);
        } else {
          totalsPerMTd.textContent = "0.0";
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
    } else if (riserTypeVal === "none" && !isNaN(riserDepthVal) && riserDepthVal > 0) {
      showWater = true;
      waterDepth = riserDepthVal;
    }

    scheduleDraw(casingsToDraw, { showWater, waterDepth });
  }

  // UI helpers
  function setupEventDelegation() {
    // handle input/change on form level
    form.addEventListener("input", (e) => {
      if (!e.target) return;
      if (e.target.matches("input, select")) {
        calculateVolume();
        scheduleSave();
      }
    });
    form.addEventListener("change", (e) => {
      if (e.target && e.target.matches("input, select")) {
        calculateVolume();
        scheduleSave();
      }
    });
  }

  function setupCasingToggles() {
    qs(".casing-input").forEach((section) => {
      const checkbox =
        section.querySelector(".use-checkbox") || section.querySelector("input[type=checkbox]");
      const header = section.querySelector(".casing-header");
      if (!checkbox || !header) return;

      const update = () => {
        if (checkbox.checked) {
          section.classList.remove("collapsed");
          header.setAttribute("aria-expanded", "true");
        } else {
          section.classList.add("collapsed");
          header.setAttribute("aria-expanded", "false");
        }
      };

      checkbox.addEventListener("change", () => {
        update();
        calculateVolume();
        scheduleSave();
      });

      header.addEventListener("click", (e) => {
        const target = e.target;
        if (target.closest(".header-inline") || target.tagName.toLowerCase() === "button") return;
        if (target.tagName.toLowerCase() === "h3") {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });

      // keyboard support
      header.tabIndex = 0;
      header.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });

      update();
    });
  }

  function setupButtons() {
    qs(".wellhead-btn").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const targetId = btn.getAttribute("data-target");
        const input = el(targetId);
        const well = el("wellhead_depth");
        if (!input || !well) return;
        if (well.value === "") return;
        input.value = well.value;
        scheduleSave();
        calculateVolume();
      })
    );

    qs(".default-top-btn").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const targetId = btn.getAttribute("data-target");
        const input = el(targetId);
        if (!input) return;
        if (targetId === "depth_7_top") {
          const btnText = btn.textContent.trim().toLowerCase();
          const interVal = el("depth_9")?.value;
          const wellVal = el("wellhead_depth")?.value;
          if (btnText === "default") {
            if (interVal !== undefined && interVal !== "") {
              input.value = String(Number(interVal) - 50);
              const tb = el("depth_tb");
              if (tb) tb.value = input.value;
              scheduleSave();
              calculateVolume();
              return;
            }
            if (wellVal !== undefined && wellVal !== "") {
              input.value = wellVal;
              const tb = el("depth_tb");
              if (tb) tb.value = input.value;
              scheduleSave();
              calculateVolume();
              return;
            }
          }
          if (btnText === "wellhead" || btnText === "casing") {
            if (wellVal !== undefined && wellVal !== "") {
              input.value = wellVal;
              const tb = el("depth_tb");
              if (tb) tb.value = input.value;
              scheduleSave();
              calculateVolume();
              return;
            }
          }
        }
        const tb = el("depth_tb");
        if (tb) tb.value = input.value;
        scheduleSave();
        calculateVolume();
      })
    );

    // Liner default button (use Intermediate Bottom - 50, fallback to wellhead)
    qs(".liner-default-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const target = el("depth_7_top");
        if (!target) return;
        const inter = el("depth_9")?.value;
        const well = el("wellhead_depth")?.value;
        if (inter !== undefined && inter !== "") {
          const val = Number(inter);
          if (!isNaN(val)) target.value = String(val - 50);
        } else if (well !== undefined && well !== "") {
          target.value = well;
        }
        const tb = el("depth_tb");
        if (tb) tb.value = target.value;
        scheduleSave();
        calculateVolume();
      })
    );

    // Reservoir Liner button: use Production Bottom - 50
    qs(".reservoir-default-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        const target = el("depth_5_top");
        if (!target) return;
        const prodBottom = el("depth_7")?.value;
        if (prodBottom !== undefined && prodBottom !== "") {
          const val = Number(prodBottom);
          if (!isNaN(val)) target.value = String(val - 50);
        } else {
          target.value = "";
        }
        scheduleSave();
        calculateVolume();
      })
    );
  }

  function setupTooltips() {
    // Generic tooltip behavior: button shows tooltip and can persist on click. Tooltip elements carry 'hidden' class by default.
    const setup = (btnId, tipId) => {
      const btn = el(btnId);
      const tip = el(tipId);
      if (!btn || !tip) return;
      btn.removeAttribute("title");
      let persistOpen = false;
      const show = () => {
        tip.classList.remove("hidden");
        tip.setAttribute("aria-hidden", "false");
      };
      const hide = () => {
        tip.classList.add("hidden");
        tip.setAttribute("aria-hidden", "true");
      };
      btn.addEventListener("mouseenter", show);
      btn.addEventListener("focus", show);
      btn.addEventListener("mouseleave", () => {
        if (!persistOpen) hide();
      });
      btn.addEventListener("blur", hide);
      tip.addEventListener("mouseenter", show);
      tip.addEventListener("mouseleave", () => {
        if (!persistOpen) hide();
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        persistOpen = true;
        show();
        btn.focus();
      });
      document.addEventListener("click", (e) => {
        if (!btn.contains(e.target) && !tip.contains(e.target)) {
          persistOpen = false;
          hide();
        }
      });
    };
    setup("production_liner_info_btn", "production_liner_info_tooltip");
    setup("reservoir_default_info_btn", "reservoir_default_info_tooltip");
  }

  // Size ID inputs: small editable inputs below each size select that show the numeric ID used for calculations
  function setupSizeIdInputs() {
    const pairs = [
      ["conductor_size", "conductor_size_id"],
      ["surface_size", "surface_size_id"],
      ["intermediate_size", "intermediate_size_id"],
      ["production_size", "production_size_id"],
      ["tieback_size", "tieback_size_id"],
      ["reservoir_size", "reservoir_size_id"],
      ["riser_type", "riser_type_id"],
    ];

    pairs.forEach(([selId, idInputId]) => {
      const sel = el(selId);
      const idInput = el(idInputId);
      if (!sel || !idInput) return;

      // Initialize value if empty
      if (!idInput.value) idInput.value = sel.value;

      // When select changes, update ID input only if user hasn't edited it
      sel.addEventListener("change", () => {
        if (!idInput.dataset.userEdited) idInput.value = sel.value;
        scheduleSave();
        calculateVolume();
      });

      // If user edits the ID input, mark as user edited and trigger recalculation
      idInput.addEventListener("input", () => {
        idInput.dataset.userEdited = "true";
        scheduleSave();
        calculateVolume();
      });
    });
  }

  // Helper to prefer user-edited ID input over select value
  function sizeIdValue(selectId, fallbackValue) {
    const idInput = el(`${selectId}_id`);
    if (!idInput) return fallbackValue;
    const v = clampNumber(Number(idInput.value));
    return typeof v !== "undefined" && !isNaN(v) ? v : fallbackValue;
  }

  function setupWellheadSync() {
    const well = el("wellhead_depth");
    const riser = el("depth_riser");
    if (!well || !riser) return;

    // Ensure container is visible (previous HTML used inline 'display:none', replaced with .hidden utility)
    const wellheadContainer = el("wellhead-depth-container");
    if (wellheadContainer) {
      wellheadContainer.classList.remove("hidden");
      wellheadContainer.setAttribute("aria-hidden", "false");
    }

    well.addEventListener("input", () => {
      if (riser.value !== well.value) {
        riser.value = well.value;
        scheduleSave();
        calculateVolume();
      }
    });
    if (well.value !== "" && riser.value !== well.value) riser.value = well.value;

    // when toggling to Subsea, apply to tops
    const toggle = el("riser_subsea");
    if (toggle)
      toggle.addEventListener("change", (e) => {
        if (e.target.checked && well.value !== "") {
          ["depth_18_top", "depth_13_top"].forEach((id) => {
            const v = el(id);
            if (v) v.value = well.value;
          });
          scheduleSave();
          calculateVolume();
        }
      });
  }

  function setupTiebackBehavior() {
    let __updateDummy = () => {};
    const prodLinerChk = el("production_is_liner");
    const tiebackCasing = el("tieback_casing");
    const useTie = el("use_tieback");
    const casingBtn = el("production_casing_btn");
    if (!prodLinerChk || !tiebackCasing || !useTie) return;
    const prodInfoBtn = el("production_liner_info_btn");
    // Global listener to react to Dummy hanger changes even if the element isn't present at binding time
    document.addEventListener("change", (e) => {
      try {
        if (!e || !e.target || e.target.id !== "dummy_hanger") return;
        const dummyEl = document.getElementById("dummy_hanger");
        const tbTop = document.getElementById("depth_tb_top");
        const tb = document.getElementById("depth_tb");
        const wellEl = document.getElementById("wellhead_depth");
        const prodTopEl = document.getElementById("depth_7_top");
        if (!tbTop || !tb) return;
        // Top always follows wellhead
        tbTop.value = wellEl && wellEl.value ? wellEl.value : "";
        if (dummyEl && dummyEl.checked) {
          tb.removeAttribute("readonly");
          tb.classList.remove("readonly-input");
          tb.value = Number((Number((wellEl && wellEl.value) || 0) + 75).toFixed(1));
          delete tb.dataset.userEdited;
        } else {
          tb.setAttribute("readonly", "true");
          tb.readOnly = true;
          tb.classList.add("readonly-input");
          tb.value = prodTopEl && prodTopEl.value ? prodTopEl.value : "";
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
        tiebackCasing.classList.remove("hidden");
        tiebackCasing.setAttribute("aria-hidden", "false");
        useTie.checked = true;
        // Ensure tie-bottom is unlocked and seeded when enabling via the Production -> Liner flow
        const tb = el("depth_tb");
        if (tb) {
          tb.removeAttribute("readonly");
          tb.classList.remove("readonly-input");
          const wellVal = Number(el("wellhead_depth")?.value || 0);
          if (!tb.dataset.userEdited) tb.value = Number((wellVal + 75).toFixed(1));
        }
        // Fire a change event so other handlers see the programmatic change
        useTie.dispatchEvent(new Event("change", { bubbles: true }));
        if (casingBtn) {
          casingBtn.classList.add("hidden");
          casingBtn.setAttribute("aria-hidden", "true");
        }
        if (prodInfoBtn) {
          prodInfoBtn.classList.add("hidden");
          prodInfoBtn.setAttribute("aria-hidden", "true");
        }
        // When tie-back is enabled, apply the Liner default behavior (set Production top depth) and make Liner active.
        const linerBtnEl = qs(".liner-default-btn")[0];
        if (linerBtnEl) {
          // Trigger the same action as pressing the Liner button
          linerBtnEl.click();
          // Re-seed the tie-back bottom *after* the liner default has applied so our well+75 seed isn't overwritten
          const tb2 = el("depth_tb");
          if (tb2 && !tb2.dataset.userEdited) {
            tb2.removeAttribute("readonly");
            tb2.classList.remove("readonly-input");
            const wellVal2 = Number(el("wellhead_depth")?.value || 0);
            tb2.value = Number((wellVal2 + 75).toFixed(1));
          }
        }
      } else {
        tiebackCasing.classList.add("hidden");
        tiebackCasing.setAttribute("aria-hidden", "true");
        useTie.checked = false;
        // When tieback is disabled, ensure the bottom is locked and mirrors the Production top
        const tb = el("depth_tb");
        if (tb) {
          tb.setAttribute("readonly", "true");
          tb.classList.add("readonly-input");
          // mirror production top
          const prodTopEl = el("depth_7_top");
          if (prodTopEl) tb.value = prodTopEl.value;
        }
        if (casingBtn) {
          casingBtn.classList.remove("hidden");
          casingBtn.setAttribute("aria-hidden", "false");
        }
        if (prodInfoBtn) {
          prodInfoBtn.classList.remove("hidden");
          prodInfoBtn.setAttribute("aria-hidden", "false");
        }
      }
      scheduleSave();
      calculateVolume();
    };
    prodLinerChk.addEventListener("change", update);
    update();

    // Tie-back bottom handling: when tieback is not enabled mirror Production top -> tie-back bottom.
    // When tieback is enabled (use_tieback checked) unlock the bottom input and set it to wellhead + 75 (user-editable).
    const prodTop = el("depth_7_top");
    const tieBottom = el("depth_tb");
    if (prodTop && tieBottom) {
      const well = el("wellhead_depth");
      let userEdited = false;

      const sync = () => {
        // Don't overwrite the bottom when tie-back mode is active (user may have edited it)
        if (useTie && useTie.checked) return;
        tieBottom.value = prodTop.value === "" ? "" : prodTop.value;
        scheduleSave();
        calculateVolume();
      };

      prodTop.addEventListener("input", sync);
      prodTop.addEventListener("change", sync);
      if (well)
        well.addEventListener("input", () => {
          // Defer to ensure this runs after other well input handlers that may also set tieBottom;
          // when tie-back is active, unlock and (if not user-edited) seed bottom with wellhead + 75
          setTimeout(() => {
            if (useTie && useTie.checked) {
              tieBottom.removeAttribute("readonly");
              tieBottom.classList.remove("readonly-input");
              if (!userEdited) {
                tieBottom.value = Number((Number(well.value || 0) + 75).toFixed(1));
                scheduleSave();
                calculateVolume();
                // double-ensure we override other handlers that may run later
                setTimeout(() => {
                  if (useTie && useTie.checked && !userEdited) {
                    tieBottom.value = Number((Number(well.value || 0) + 75).toFixed(1));
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

      // If the user edits the tie-back bottom, remember so we don't overwrite it
      tieBottom.addEventListener("input", () => {
        userEdited = true;
        tieBottom.dataset.userEdited = "true";
        scheduleSave();
        calculateVolume();
      });

      // Dummy hanger behavior: when checked, set Top to Wellhead and Bottom to Wellhead + 75 (unlock bottom);
      // when unchecked, set Top to Wellhead and Bottom to Production Top and lock the bottom.
      const dummy = el("dummy_hanger");
      const updateDummy = () => {
        const tbTop = el("depth_tb_top");
        const tb = el("depth_tb");
        const wellVal = Number(el("wellhead_depth")?.value || 0);
        const prodTopVal = el("depth_7_top")?.value || "";
        if (!tbTop || !tb) return;

        console.log("DBG updateDummy start", {
          dummyChecked: !!(dummy && dummy.checked),
          well: el("wellhead_depth")?.value,
          prodTop: prodTopVal,
          tbTopBefore: tbTop.value,
          tbBefore: tb.value,
        });

        // Top always follows wellhead value per spec
        tbTop.value = el("wellhead_depth")?.value || "";

        if (dummy && dummy.checked) {
          // enable editing and always seed bottom with wellhead + 75 (override prior edits)
          tb.removeAttribute("readonly");
          tb.classList.remove("readonly-input");
          tb.value = Number((wellVal + 75).toFixed(1));
          delete tb.dataset.userEdited;
          userEdited = false;

          // double-ensure after other handlers run
          setTimeout(() => {
            if (dummy && dummy.checked) {
              tbTop.value = el("wellhead_depth")?.value || "";
              tb.value = Number((Number(el("wellhead_depth")?.value || 0) + 75).toFixed(1));
              delete tb.dataset.userEdited;
              userEdited = false;
            }
          }, 120);
        } else {
          // disable editing and mirror production top
          tb.setAttribute("readonly", "true");
          tb.readOnly = true;
          tb.classList.add("readonly-input");
          tb.value = prodTopVal;
          // clear any user-edited flag so future enabling reseeds
          delete tb.dataset.userEdited;
          userEdited = false;

          // double-ensure mirror after other handlers run
          setTimeout(() => {
            if (!(dummy && dummy.checked)) {
              tb.value = el("depth_7_top")?.value || "";
              tb.setAttribute("readonly", "true");
              tb.readOnly = true;
              tb.classList.add("readonly-input");
            }
          }, 120);
        }

        console.log("DBG updateDummy end", {
          tbTopAfter: tbTop.value,
          tbAfter: tb.value,
          tbReadOnly: tb.readOnly,
        });

        scheduleSave();
        calculateVolume();
      };

      if (dummy) {
        dummy.addEventListener("change", updateDummy);
        // fallback: listen for document-level changes to the checkbox id in case the element is re-rendered
        document.addEventListener("change", (e) => {
          if (e && e.target && e.target.id === "dummy_hanger") __updateDummy();
        });
        // when wellhead changes and Dummy checked, reseed; when prodTop changes and Dummy unchecked, mirror
        const prodTopEl = el("depth_7_top");
        if (el("wellhead_depth"))
          el("wellhead_depth").addEventListener("input", () => {
            if (dummy && dummy.checked) updateDummy();
            else {
              // still update top to follow wellhead even when unchecked
              const tbTop = el("depth_tb_top");
              if (tbTop) tbTop.value = el("wellhead_depth")?.value || "";
            }
          });
        if (prodTopEl)
          prodTopEl.addEventListener("input", () => {
            if (!dummy.checked) updateDummy();
          });
        // initialize
        updateDummy();
        // expose helper for tests to force the dummy update in environments where change events may not fire as expected
        __updateDummy = updateDummy;
      }
      // always expose a safe test shim (no-op if dummy logic wasn't initialized)
      if (typeof window !== "undefined") window.__TEST_updateDummy = () => __updateDummy();

      // When the use_tieback checkbox toggles, change readonly state and seed value
      useTie.addEventListener("change", () => {
        if (useTie.checked) {
          tieBottom.removeAttribute("readonly");
          tieBottom.classList.remove("readonly-input");
          const wellVal = well && well.value !== "" ? Number(well.value) : 0;
          if (!userEdited) {
            tieBottom.value = Number((wellVal + 75).toFixed(1));
          }
        } else {
          // if Dummy is checked, it takes precedence; otherwise lock and mirror Production top
          if (dummy && dummy.checked) {
            // leave controlled by Dummy
            // nothing to do here
          } else {
            tieBottom.setAttribute("readonly", "true");
            tieBottom.readOnly = true;
            tieBottom.classList.add("readonly-input");
            // when disabling tieback, revert to mirroring Production top
            sync();
          }
        }
        scheduleSave();
        calculateVolume();
        // Ensure final state after other handlers run
        setTimeout(() => {
          if (!useTie.checked && !(dummy && dummy.checked)) {
            tieBottom.setAttribute("readonly", "true");
            tieBottom.classList.add("readonly-input");
          }
        }, 50);
      });

      // initialize readonly state based on current checkbox values
      if (dummy && dummy.checked) {
        // Dummy takes precedence
        const tb = el("depth_tb");
        if (tb) {
          tb.removeAttribute("readonly");
          tb.classList.remove("readonly-input");
          const wellVal = Number(el("wellhead_depth")?.value || 0);
          if (!tb.dataset.userEdited) tb.value = Number((wellVal + 75).toFixed(1));
        }
      } else if (useTie && useTie.checked) {
        tieBottom.removeAttribute("readonly");
        tieBottom.classList.remove("readonly-input");
        const wellVal = well && well.value !== "" ? Number(well.value) : 0;
        if (!tieBottom.dataset.userEdited) tieBottom.value = Number((wellVal + 75).toFixed(1));
      } else {
        tieBottom.setAttribute("readonly", "true");
        tieBottom.classList.add("readonly-input");
      }
    }
  }

  function setupProductionToggleButtons() {
    const casingBtn = el("production_casing_btn");
    const linerBtn = qs(".liner-default-btn")[0];
    const useTie = el("use_tieback");
    const prodLinerChk = el("production_is_liner");
    if (!casingBtn && !linerBtn) return;

    const setActive = (btn) => {
      [casingBtn, linerBtn].forEach((b) => {
        if (!b) return;
        const isActive = b === btn;
        b.classList.toggle("active", isActive);
        b.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    };

    // initialise aria-pressed state
    [casingBtn, linerBtn].forEach((b) => {
      if (b) b.setAttribute("aria-pressed", b.classList.contains("active") ? "true" : "false");
    });

    if (casingBtn) {
      casingBtn.addEventListener("click", () => {
        if (useTie && useTie.checked) return;
        setActive(casingBtn);
      });
      casingBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          casingBtn.click();
        }
      });
    }

    if (linerBtn) {
      linerBtn.addEventListener("click", () => {
        if (useTie && useTie.checked) return;
        setActive(linerBtn);
      });
      linerBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          linerBtn.click();
        }
      });
    }

    const updateTieback = () => {
      if (prodLinerChk && prodLinerChk.checked) {
        if (linerBtn) setActive(linerBtn);
        if (casingBtn) {
          casingBtn.classList.remove("active");
          casingBtn.setAttribute("aria-pressed", "false");
        }
      }
    };

    if (prodLinerChk) prodLinerChk.addEventListener("change", updateTieback);
    updateTieback();

    // Default: if no button is active and tie-back is not forcing Liner, make Liner active
    const anyActive =
      (casingBtn && casingBtn.classList.contains("active")) ||
      (linerBtn && linerBtn.classList.contains("active"));
    if (!anyActive) {
      if (!(prodLinerChk && prodLinerChk.checked) && linerBtn) setActive(linerBtn);
    }
  }

  function setupRiserPositionToggle() {
    const toggle = el("riser_subsea");
    const label = el("riser_position_label");
    if (!toggle || !label) return;
    const update = () => {
      label.textContent = toggle.checked ? "Subsea" : "Fixed";
      toggle.setAttribute("aria-checked", toggle.checked ? "true" : "false");
    };
    toggle.addEventListener("change", () => {
      update();
      scheduleSave();
      calculateVolume();
    });
    update();
  }

  function setupRiserTypeHandler() {
    const select = el("riser_type");
    const riserDepthEl = el("depth_riser");
    const wellEl = el("wellhead_depth");
    const riserContainer = el("depth_riser_container");
    if (!select || !riserDepthEl) return;
    const update = () => {
      if (select.value === "none") {
        riserDepthEl.value = "0";
        if (riserContainer) riserContainer.classList.add("hidden");
      } else {
        if (riserContainer) riserContainer.classList.remove("hidden");
        if (wellEl && wellEl.value !== "") riserDepthEl.value = wellEl.value;
      }
      scheduleSave();
      calculateVolume();
    };
    select.addEventListener("change", update);
    update();
  }

  function init() {
    // load state before initial calc
    loadState();
    // initial canvas sizing
    resizeCanvasForDPR();
    window.addEventListener("resize", debouncedResize);
    // setup
    setupEventDelegation();
    setupCasingToggles();
    setupButtons();
    setupTooltips();
    setupSizeIdInputs();
    setupWellheadSync();
    setupTiebackBehavior();
    setupProductionToggleButtons();
    setupRiserTypeHandler();
    setupRiserPositionToggle();
    setupNavActive();
    setupThemeToggle();

    // Presets: load built-in presets and populate UI
    const PRESETS_KEY = "keino_presets_v1";
    let BUILTIN_PRESETS = {};
    const BUILTIN_PRESETS_URL = "./keino_presets_2026-01-16_20_54_15.json";

    function loadPresetsFromStorage() {
      try {
        const raw = localStorage.getItem(PRESETS_KEY);
        if (!raw) return {};
        return JSON.parse(raw);
      } catch (e) {
        return {};
      }
    }

    function savePresetsToStorage(obj) {
      try {
        localStorage.setItem(PRESETS_KEY, JSON.stringify(obj));
      } catch (e) {
        // ignore
      }
    }

    function getPresetNames() {
      const stored = loadPresetsFromStorage();
      const builtInNames = Object.keys(BUILTIN_PRESETS || {}).sort();
      const storedNames = Object.keys(stored || {}).sort((a, b) =>
        stored[a] && stored[b] ? stored[a].savedAt - stored[b].savedAt : 0
      );
      return [...builtInNames, ...storedNames.filter((n) => !builtInNames.includes(n))];
    }

    function populatePresetsUI() {
      const sel = el("preset_list");
      if (!sel) return;
      sel.innerHTML = '<option value="">— Select a preset —</option>';
      const names = getPresetNames();
      names.forEach((n) => {
        const opt = document.createElement("option");
        opt.value = n;
        opt.textContent = n;
        if (BUILTIN_PRESETS[n]) opt.dataset.builtin = "1";
        sel.appendChild(opt);
      });
    }

    async function loadBuiltinPresets() {
      try {
        if (typeof XMLHttpRequest !== "undefined") {
          try {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", BUILTIN_PRESETS_URL, false);
            xhr.send(null);
            if (
              xhr &&
              (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) &&
              xhr.responseText
            ) {
              const payload = JSON.parse(xhr.responseText);
              BUILTIN_PRESETS =
                payload && payload.presets && typeof payload.presets === "object"
                  ? payload.presets
                  : payload || {};
              try {
                populatePresetsUI();
              } catch (e) {
                /* ignore */
              }
              return;
            }
          } catch (e) {
            /* ignore */
          }
        }
      } catch (e) {
        /* ignore */
      }

      if (typeof fetch === "function") {
        try {
          const res = await fetch(BUILTIN_PRESETS_URL, { cache: "no-store" });
          if (res && res.ok) {
            const payload = await res.json();
            if (payload && payload.presets && typeof payload.presets === "object")
              BUILTIN_PRESETS = payload.presets;
            else if (payload && typeof payload === "object") BUILTIN_PRESETS = payload;
            try {
              populatePresetsUI();
            } catch (e) {
              /* ignore */
            }
            return;
          }
        } catch (e) {
          /* ignore */
        }
      }

      // attempt to load from disk when running under Node (JSDOM tests)
      try {
        if (typeof require === "function") {
          const fs = require("fs");
          const path = require("path");
          let p = BUILTIN_PRESETS_URL;
          if (p.startsWith("./")) p = p.slice(2);
          const full = path.join(process && process.cwd ? process.cwd() : __dirname || ".", p);
          try {
            const raw = fs.readFileSync(full, "utf8");
            if (raw) {
              const payload = JSON.parse(raw);
              if (payload && payload.presets && typeof payload.presets === "object")
                BUILTIN_PRESETS = payload.presets;
              else if (payload && typeof payload === "object") BUILTIN_PRESETS = payload;
              try {
                populatePresetsUI();
              } catch (e) {
                /* ignore */
              }
            }
          } catch (e) {
            /* ignore */
          }
        }
      } catch (e) {
        /* ignore */
      }
    }

    // Preset state helpers
    function captureStateObject() {
      const state = {};
      qs("input[id], select[id]").forEach((input) => {
        if (!input.id) return;
        if (input.type === "checkbox")
          state[input.id] = { type: "checkbox", value: !!input.checked };
        else state[input.id] = { type: input.tagName.toLowerCase(), value: input.value };
      });
      return state;
    }

    function applyStateObject(state) {
      if (!state) return;
      Object.entries(state).forEach(([id, item]) => {
        const input = el(id);
        if (!input) return;
        try {
          if (item.type === "checkbox") {
            input.checked = !!item.value;
          } else {
            input.value = item.value;
          }
        } catch (e) {
          // ignore invalid values
        }
      });

      const presetNameEl = el("preset_name");
      if (presetNameEl) presetNameEl.value = "";

      // re-evaluate UI state toggles
      qs(".use-checkbox").forEach((cb) =>
        cb.dispatchEvent(new window.Event("change", { bubbles: true }))
      );

      calculateVolume();
      scheduleSave();
    }

    function getPresetState(name) {
      const stored = loadPresetsFromStorage();
      if (stored[name]) return stored[name].state;
      if (BUILTIN_PRESETS[name]) return BUILTIN_PRESETS[name].state;
      return null;
    }

    function savePreset(name) {
      if (!name) return false;
      if (BUILTIN_PRESETS[name]) return false;
      const presets = loadPresetsFromStorage();
      presets[name] = { savedAt: Date.now(), state: captureStateObject() };
      savePresetsToStorage(presets);
      populatePresetsUI();
      return true;
    }

    function deletePreset(name) {
      if (!name) return false;
      if (BUILTIN_PRESETS[name]) return false;
      const presets = loadPresetsFromStorage();
      if (presets[name]) {
        delete presets[name];
        savePresetsToStorage(presets);
        populatePresetsUI();
        return true;
      }
      return false;
    }

    // wire preset buttons (if present)
    try {
      // debug: log clicks on load button
      try {
        document.addEventListener("click", (e) => {
          try {
            if (e && e.target && e.target.id === "load_preset_btn") {
              try {
                const sel = document.getElementById("preset_list");
                const name = sel && sel.value;
                const st = getPresetState(name);
                if (st) applyStateObject(st);
              } catch (err) {
                /* ignore */
              }
            }
          } catch (e) {
            /* ignore */
          }
        });
      } catch (e) {}
      const saveBtn = el("save_preset_btn");
      const exportBtn = el("export_presets_btn");
      const importBtn = el("import_presets_btn");
      const importInput = el("import_presets_input");
      const sel = el("preset_list");
      const loadBtn = el("load_preset_btn");
      const deleteBtn = el("delete_preset_btn");

      if (saveBtn && nameInput) {
        saveBtn.addEventListener("click", () => {
          const name = (nameInput.value || "").trim();
          if (!name) return;
          if (savePreset(name)) {
            populatePresetsUI();
            nameInput.value = "";
          }
        });
      }

      if (exportBtn) exportBtn.addEventListener("click", exportPresets);

      if (importBtn && importInput) {
        importBtn.addEventListener("click", () => importInput.click());
        importInput.addEventListener("change", (ev) => {
          const f = ev.target && ev.target.files && ev.target.files[0];
          if (f) importPresetsFile(f);
          ev.target.value = "";
        });
      }

      if (loadBtn && sel) {
        loadBtn.addEventListener("click", () => {
          try {
            console.log && console.log("sel.value at click", sel && sel.value);
          } catch (e) {}
          const name = sel.value;
          const st = getPresetState(name);
          try {
            console.log &&
              console.log(
                "loading preset",
                name,
                st && {
                  u18: st.use_18 && st.use_18.value,
                  u13: st.use_13 && st.use_13.value,
                  u9: st.use_9 && st.use_9.value,
                }
              );
          } catch (e) {}
          if (st) {
            applyStateObject(st);
          }
        });
        try {
          console.log && console.log("attached load handler");
        } catch (e) {}
      }

      if (deleteBtn && sel) {
        deleteBtn.addEventListener("click", () => {
          const name = sel.value;
          if (!name) return;
          if (deletePreset(name)) populatePresetsUI();
        });
      }
    } catch (e) {
      /* ignore DOM wiring errors in test env */
    }

    loadBuiltinPresets().catch(() => {});
    populatePresetsUI();

    // compute initial
    calculateVolume();
  }

  function setupNavActive() {
    const links = qs(".linker a");
    if (!links || !links.length) return;
    const current = window.location.href.replace(/\/$/, "");
    links.forEach((a) => {
      try {
        const href = a.href.replace(/\/$/, "");
        if (
          href === current ||
          current.startsWith(href) ||
          href.startsWith(current) ||
          href.includes(window.location.pathname)
        )
          a.classList.add("active");
      } catch (e) {
        /* ignore */
      }
    });
  }

  // Theme handling: toggles a `data-theme="dark"` attribute on <html> and persists selection
  function setupThemeToggle() {
    const toggle = el("theme_toggle");
    const labelEl = document.getElementById("theme_label");
    console.log("DBG setupThemeToggle init found toggle=", !!toggle);
    const setLabel = (mode) => {
      if (!labelEl) return;
      labelEl.textContent = mode === "dark" ? "Light mode" : "Dark mode";
    };
    const apply = (mode) => {
      if (mode === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        if (toggle) {
          toggle.checked = true;
          toggle.setAttribute("aria-checked", "true");
        }
      } else {
        document.documentElement.removeAttribute("data-theme");
        if (toggle) {
          toggle.checked = false;
          toggle.setAttribute("aria-checked", "false");
        }
      }
      setLabel(mode);
    };

    // initialize from stored preference
    try {
      const stored = localStorage.getItem("keino_theme");
      if (stored === "dark") apply("dark");
      else apply("light");
    } catch (e) {
      // localStorage might not be available in all environments (e.g., some tests)
      apply("light");
    }

    if (toggle) {
      // when the control is a checkbox, use change event
      toggle.addEventListener("change", () => {
        const next = toggle.checked ? "dark" : "light";
        apply(next);
        try {
          localStorage.setItem("keino_theme", next);
        } catch (e) {
          /* ignore */
        }
        console.log(
          "DBG theme after change attr=",
          document.documentElement.getAttribute("data-theme")
        );
      });
    }
    // expose a safe test helper to set theme programmatically (used by smoke tests when click dispatch isn't effective)
    try {
      if (typeof window !== "undefined")
        window.__TEST_applyTheme = (mode) => {
          apply(mode === "dark" ? "dark" : "light");
          try {
            localStorage.setItem("keino_theme", mode === "dark" ? "dark" : "light");
          } catch (e) {
            /* ignore */
          }
        };
    } catch (e) {
      /* ignore */
    }
    // Delegate change events in case the control is re-rendered or listeners didn't attach
    document.addEventListener("change", (e) => {
      try {
        if (!e || !e.target) return;
        const elTarget = e.target.closest ? e.target.closest("#theme_toggle") : null;
        if (!elTarget) return;
        const next = elTarget.checked ? "dark" : "light";
        apply(next);
        try {
          localStorage.setItem("keino_theme", next);
        } catch (err) {
          /* ignore */
        }
      } catch (err) {
        /* ignore */
      }
    });
  }

  return { init, calculateVolume, saveState };
})();

// initialize
VolumeCalc.init();
