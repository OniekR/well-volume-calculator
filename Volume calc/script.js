const canvas = document.getElementById("wellSchematic");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

function calculateVolume() {
  // Map for conductor OD based on ID
  const conductorODMap = {
    17.755: 18.625,
    28: 30,
  };

  // Map for riser OD based on selection (ID -> OD)
  const riserODMap = {
    17.5: 20, // Drilling riser: ID 17.5" -> OD 20"
    8.5: 9.5, // Production riser: ID 8.5" -> OD 9.5"
  };

  // Map for surface casing OD based on ID
  const surfaceODMap = {
    18.5: 20,
    17.755: 18.625,
  };

  // Map for intermediate casing OD based on ID
  const intermediateODMap = {
    12.715: 13.375,
    12.875: 13.625,
  };

  // Map for production casing OD based on ID
  const productionODMap = {
    6.276: 7,
    8.921: 9.625,
  };

  // Map for tieback casing OD (ID -> OD)
  const tiebackODMap = {
    8.921: 9.625, // 9 5/8"
    10.75: 11.5, // 10 3/4" approximate OD
  };

  // Map for reservoir liner OD based on ID
  const reservoirODMap = {
    6.276: 7,
    4.892: 5.5,
  };

  // Gather casing inputs and include flags
  const riserTypeVal = document.getElementById("riser_type").value;
  const riserID = parseFloat(riserTypeVal);
  const riserOD = riserTypeVal === "none" ? 0 : riserODMap[riserID] || 20;

  const conductorID = parseFloat(
    document.getElementById("conductor_size").value
  );
  const conductorOD = conductorODMap[conductorID] || 30;

  // Riser position
  const riserIsSubsea = document.getElementById("riser_subsea").checked;

  // conductor top input and final (respecting Fixed well type)
  const conductorTopInputVal = parseFloat(
    document.getElementById("depth_18_top").value
  );
  let conductorTopFinal;
  if (!isNaN(conductorTopInputVal)) {
    conductorTopFinal = conductorTopInputVal; // user-provided top overrides default
  } else {
    conductorTopFinal = undefined;
  }

  // Update UI note for conductor
  const conductorNoteEl = document.getElementById("conductor_connect_note");
  if (conductorNoteEl) {
    if (conductorTopFinal !== undefined) {
      conductorNoteEl.textContent = `Top set to ${conductorTopFinal} m`;
      conductorNoteEl.style.display = "block";
    } else {
      conductorNoteEl.style.display = "none";
    }
  }

  const surfaceID = parseFloat(document.getElementById("surface_size").value);
  const surfaceOD = surfaceODMap[surfaceID] || 20;

  // Determine surface top: prefer user-provided top, otherwise auto-connect to riser bottom when applicable
  const riserDepthVal = parseFloat(
    document.getElementById("depth_riser").value
  );
  const wellheadDepthVal = parseFloat(
    document.getElementById("wellhead_depth").value
  );
  const surfaceBottomVal = parseFloat(
    document.getElementById("depth_13").value
  );
  const surfaceInUse = document.getElementById("use_13").checked;
  const surfaceTopInputVal = parseFloat(
    document.getElementById("depth_13_top").value
  );

  let surfaceTopFinal = undefined;
  let surfaceTopAuto = false;
  if (!isNaN(surfaceTopInputVal)) {
    surfaceTopFinal = surfaceTopInputVal; // user-specified top
  } else if (
    document.getElementById("use_riser").checked &&
    surfaceInUse &&
    !isNaN(riserDepthVal) &&
    surfaceBottomVal > riserDepthVal
  ) {
    surfaceTopFinal = riserDepthVal; // auto-connect
    surfaceTopAuto = true;
  } else {
    surfaceTopFinal = undefined;
  }

  // Update UI note for surface connection (if present)
  const surfaceNoteEl = document.getElementById("surface_connect_note");
  if (surfaceNoteEl) {
    if (surfaceTopFinal !== undefined) {
      if (surfaceTopAuto) surfaceNoteEl.style.display = "block";
    } else {
      surfaceNoteEl.style.display = "none";
    }
  }

  const intermediateID = parseFloat(
    document.getElementById("intermediate_size").value
  );
  const intermediateOD = intermediateODMap[intermediateID] || 13.375;

  // Determine intermediate top: prefer user-provided top, otherwise auto-connect to riser bottom when applicable
  const intermediateBottomVal = parseFloat(
    document.getElementById("depth_9").value
  );
  const intermediateInUse = document.getElementById("use_9").checked;
  const intermediateTopInputVal = parseFloat(
    document.getElementById("depth_9_top").value
  );

  let intermediateTopFinal = undefined;
  let intermediateTopAuto = false;
  if (!isNaN(intermediateTopInputVal)) {
    intermediateTopFinal = intermediateTopInputVal; // user-specified top
  } else if (
    document.getElementById("use_riser").checked &&
    intermediateInUse &&
    !isNaN(riserDepthVal) &&
    !isNaN(intermediateBottomVal) &&
    intermediateBottomVal > riserDepthVal
  ) {
    intermediateTopFinal = riserDepthVal;
    intermediateTopAuto = true;
  } else {
    intermediateTopFinal = undefined;
  }

  // Update UI note for intermediate connection
  const intermediateNoteEl = document.getElementById(
    "intermediate_connect_note"
  );
  if (intermediateNoteEl) {
    if (intermediateTopFinal !== undefined) {
      if (intermediateTopAuto)
        intermediateNoteEl.textContent = `Connected to riser at ${intermediateTopFinal} m`;
      else
        intermediateNoteEl.textContent = `Top set to ${intermediateTopFinal} m`;
      intermediateNoteEl.style.display = "block";
    } else {
      intermediateNoteEl.style.display = "none";
    }
  }

  const productionID = parseFloat(
    document.getElementById("production_size").value
  );
  const productionOD = productionODMap[productionID] || 9.625;
  const productionTopInputVal = parseFloat(
    document.getElementById("depth_7_top").value
  );

  const reservoirID = parseFloat(
    document.getElementById("reservoir_size").value
  );
  const reservoirOD = reservoirODMap[reservoirID] || 5.5;
  const reservoirTopInputVal = parseFloat(
    document.getElementById("depth_5_top").value
  );

  // Tie-back inputs
  const tiebackID = parseFloat(document.getElementById("tieback_size").value);
  const tiebackOD =
    tiebackODMap[tiebackID] || productionODMap[tiebackID] || 9.625;
  const tiebackTopInputVal = parseFloat(
    document.getElementById("depth_tb_top").value
  );

  const casingsInput = [
    {
      role: "riser",
      id: riserID,
      depth: parseFloat(document.getElementById("depth_riser").value),
      use: document.getElementById("use_riser").checked,
      od: riserOD,
    },
    {
      role: "conductor",
      id: conductorID,
      top: conductorTopFinal,
      depth: parseFloat(document.getElementById("depth_18_bottom").value),
      use: document.getElementById("use_18").checked,
      od: conductorOD,
    },

    {
      role: "surface",
      id: surfaceID,
      top: surfaceTopFinal,
      depth: parseFloat(document.getElementById("depth_13").value),
      use: document.getElementById("use_13").checked,
      od: surfaceOD,
    },

    {
      role: "intermediate",
      id: intermediateID,
      top: intermediateTopFinal,
      depth: parseFloat(document.getElementById("depth_9").value),
      use: document.getElementById("use_9").checked,
      od: intermediateOD,
    },
    {
      role: "production",
      id: productionID,
      top: !isNaN(productionTopInputVal) ? productionTopInputVal : undefined,
      depth: parseFloat(document.getElementById("depth_7").value),
      use: document.getElementById("use_7").checked,
      od: productionOD,
    },
    {
      role: "tieback",
      id: tiebackID,
      top: !isNaN(tiebackTopInputVal) ? tiebackTopInputVal : undefined,
      depth: parseFloat(document.getElementById("depth_tb").value),
      use: document.getElementById("use_tieback").checked,
      od: tiebackOD,
    },
    {
      role: "reservoir",
      id: reservoirID,
      top: !isNaN(reservoirTopInputVal) ? reservoirTopInputVal : undefined,
      depth: parseFloat(document.getElementById("depth_5").value),
      use: document.getElementById("use_5").checked,
      od: reservoirOD,
    },
  ];

  let totalVolume = 0;
  let lastIncludedDepth = 0;
  const casingsToDraw = [];

  casingsInput.forEach((casing, index) => {
    const prevDepth = lastIncludedDepth;
    const startForCalc =
      typeof casing.top !== "undefined"
        ? Math.max(prevDepth, casing.top)
        : prevDepth;
    const drawStart =
      typeof casing.top !== "undefined" ? casing.top : prevDepth;

    const shouldDraw = casing.use && casing.depth > drawStart;
    // Do not count conductor volume if surface casing is used
    // Additionally, do not count surface volume if intermediate casing is used
    const shouldCountVolume =
      casing.use &&
      casing.depth > startForCalc &&
      !(casing.role === "conductor" && surfaceInUse) &&
      !(casing.role === "surface" && intermediateInUse);

    if (shouldCountVolume) {
      const radiusMeters = (casing.id / 2) * 0.0254;
      const length = casing.depth - startForCalc;
      const volume = Math.PI * radiusMeters * radiusMeters * length;
      totalVolume += volume;
      lastIncludedDepth = casing.depth;
    }

    if (shouldDraw) {
      casingsToDraw.push({
        id: casing.id,
        od: casing.od,
        depth: casing.depth,
        prevDepth: drawStart,
        index,
        // drawing priority: conductor behind (-1), reservoir on top (4), production/tieback (3), intermediate (2), surface (1), others 0
        z:
          casing.role === "conductor"
            ? -1
            : casing.role === "reservoir"
            ? 4
            : casing.role === "production" || casing.role === "tieback"
            ? 3
            : casing.role === "intermediate"
            ? 2
            : casing.role === "surface"
            ? 1
            : 0,
      });
    }
  });

  document.getElementById("totalVolume").textContent =
    totalVolume.toFixed(2) + " m³";
  // Show subsea water column either when 'No riser' is selected (use riser depth)
  // or when a riser is present (use wellhead depth to indicate subsea wellhead)
  let showWater = false;
  let waterDepth = undefined;
  // Prefer wellhead depth when available (applies to riser types and No riser),
  // otherwise fall back to riser depth when 'No riser' is selected
  if (!isNaN(wellheadDepthVal) && wellheadDepthVal > 0) {
    showWater = true;
    waterDepth = wellheadDepthVal;
  } else if (
    riserTypeVal === "none" &&
    !isNaN(riserDepthVal) &&
    riserDepthVal > 0
  ) {
    showWater = true;
    waterDepth = riserDepthVal;
  }

  drawSchematic(casingsToDraw, { showWater, waterDepth });
}

function drawSchematic(casings, opts = {}) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#87ceeb");
  gradient.addColorStop(0.15, "#e6d5b8");
  gradient.addColorStop(1, "#b8a684");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Compute max depth considering water depth (for subsea visualization)
  const maxDepth = Math.max(
    opts && !isNaN(opts.waterDepth) ? opts.waterDepth : 0,
    casings.length ? Math.max(...casings.map((c) => c.depth)) : 0
  );
  const maxOD = casings.length ? Math.max(...casings.map((c) => c.od)) : 18.625;

  if (maxDepth === 0) return;

  const centerX = canvas.width / 2;
  const startY = 50;
  const availableHeight = canvas.height - 100;
  const scale = availableHeight / maxDepth;

  // If water should be shown (from wellhead or no-riser case), draw marine water column to waterDepth
  if (
    opts &&
    opts.showWater &&
    !isNaN(opts.waterDepth) &&
    opts.waterDepth > 0
  ) {
    const waterEndY = opts.waterDepth * scale + startY;
    const waterGrad = ctx.createLinearGradient(0, startY, 0, waterEndY);
    waterGrad.addColorStop(0, "#1E90FF");
    waterGrad.addColorStop(1, "#87CEFA");
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, startY, canvas.width, waterEndY - startY);
  }

  // Draw wellhead
  ctx.fillStyle = "#333";
  ctx.fillRect(centerX - 30, startY - 30, 60, 30);
  ctx.fillStyle = "#666";
  ctx.fillRect(centerX - 25, startY - 40, 50, 15);

  const colors = ["#8B4513", "#A0522D", "#CD853F", "#DEB887", "#F4A460"];

  // Draw casings shallow->deep so deeper casings overlay shallower ones; when prevDepth equal, draw outer (larger OD) first so inner casings show on top
  casings
    .slice()
    .sort(
      (a, b) =>
        (a.z || 0) - (b.z || 0) || a.prevDepth - b.prevDepth || b.od - a.od
    )
    .forEach((casing) => {
      const idx = casing.index;
      const startDepth = casing.prevDepth * scale + startY;
      const endDepth = casing.depth * scale + startY;
      const width = (casing.od / maxOD) * 80; // Scale relative to max OD

      // Draw casing body
      ctx.fillStyle = colors[idx];
      ctx.fillRect(
        centerX - width / 2,
        startDepth,
        width,
        endDepth - startDepth
      );

      // Draw inner bore as light grey (background of casing)
      const innerWidth = (casing.id / maxOD) * 80;
      ctx.fillStyle = "#e6e6e6";
      ctx.fillRect(
        centerX - innerWidth / 2,
        startDepth,
        innerWidth,
        endDepth - startDepth
      );

      // Draw black side lines for the casing outer edges
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - width / 2, startDepth);
      ctx.lineTo(centerX - width / 2, endDepth);
      ctx.moveTo(centerX + width / 2, startDepth);
      ctx.lineTo(centerX + width / 2, endDepth);
      ctx.stroke();

      // Draw depth label
      ctx.fillStyle = "#fff";
      ctx.font = "12px Arial";
      ctx.fillText(
        casing.depth.toFixed(0) + "m",
        centerX + width / 2 + 10,
        endDepth
      );
    });
}

// Persistence helpers (save/load to localStorage)
const STORAGE_KEY = "keino_volume_state_v1";

function saveState() {
  const state = {};
  document.querySelectorAll("input, select").forEach((el) => {
    if (!el.id) return;
    if (el.type === "checkbox")
      state[el.id] = { type: "checkbox", value: el.checked };
    else state[el.id] = { type: el.tagName.toLowerCase(), value: el.value };
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore write errors
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const state = JSON.parse(raw);
    Object.entries(state).forEach(([id, item]) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (item.type === "checkbox") el.checked = !!item.value;
      else el.value = item.value;
    });
  } catch (e) {
    // ignore parse errors
  }
}

// Add event listeners to inputs and selects for calculate and save
document.querySelectorAll("input, select").forEach((el) => {
  const evt = el.tagName.toLowerCase() === "select" ? "change" : "input";
  el.addEventListener(evt, calculateVolume);
  el.addEventListener("change", saveState);
  el.addEventListener("input", saveState);
});

// Load saved values (if any) before initializing UI
loadState();

// Setup collapsible casing sections controlled by the include checkbox
function setupCasingToggles() {
  document.querySelectorAll(".casing-input").forEach((el) => {
    const checkbox =
      el.querySelector(".use-checkbox") ||
      el.querySelector("input[type=checkbox]");
    const header = el.querySelector(".casing-header");
    if (!checkbox || !header) return;

    const update = () => {
      if (checkbox.checked) el.classList.remove("collapsed");
      else el.classList.add("collapsed");
    };

    checkbox.addEventListener("change", () => {
      update();
      calculateVolume();
      saveState();
    });

    header.addEventListener("click", (e) => {
      const target = e.target;
      // Ignore clicks on header inline controls (e.g., 'Liner' checkbox) or buttons
      if (
        target.closest(".header-inline") ||
        target.tagName.toLowerCase() === "button"
      )
        return;
      // Only toggle when clicking the section title (h3). Let direct clicks on the checkbox input behave naturally.
      if (target.tagName.toLowerCase() === "h3") {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    // reflect initial state
    update();
  });
}

setupCasingToggles();

// Riser position toggle (Subsea / Fixed)
function setupRiserPositionToggle() {
  const toggle = document.getElementById("riser_subsea");
  const label = document.getElementById("riser_position_label");
  if (!toggle || !label) return;
  const update = () =>
    (label.textContent = toggle.checked ? "Subsea" : "Fixed");
  toggle.addEventListener("change", () => {
    update();
    // Global defaults removed: do not auto-fill Top or Wellhead values when switching modes.
    // Existing behaviors (Wellhead copy, user-provided values) remain unchanged.
    saveState();
    calculateVolume();
  });
  update();
}

setupRiserPositionToggle();

// Default Top buttons: removed global 20/361 fallback; buttons now only perform special-case behavior (e.g., production uses intermediate shoe -50)
function setupDefaultTopButtons() {
  document.querySelectorAll(".default-top-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;
      // Special-case for Production Default:
      // - When Liner is checked: use Intermediate casing 'Bottom (m)' minus 50 m (shoe - 50)
      // - When Liner is unchecked: prefer Wellhead depth when available (like other defaults), otherwise fall back to global defaults
      if (targetId === "depth_7_top") {
        // Determine clicked button label to decide behavior (Default vs Wellhead)
        const btnText = btn.textContent.trim().toLowerCase();
        const intermediateBottomVal = document.getElementById("depth_9")?.value;
        const wellHeadVal = document.getElementById("wellhead_depth")?.value;

        // If button reads 'Default', prefer intermediate shoe minus 50m
        if (btnText === "default") {
          if (
            intermediateBottomVal !== undefined &&
            intermediateBottomVal !== ""
          ) {
            input.value = parseFloat(intermediateBottomVal) - 50;
            // keep tie-back bottom synced to Production Top
            const tb = document.getElementById("depth_tb");
            if (tb) tb.value = input.value;
            saveState();
            calculateVolume();
            return;
          }
          // If intermediate bottom missing, fall back to wellhead when available
          if (wellHeadVal !== undefined && wellHeadVal !== "") {
            input.value = wellHeadVal;
            const tb = document.getElementById("depth_tb");
            if (tb) tb.value = input.value;
            saveState();
            calculateVolume();
            return;
          }
          // Otherwise fall through to global defaults
        }

        // If the button reads 'Wellhead' or 'Casing', copy the wellhead depth if available
        if (btnText === "wellhead" || btnText === "casing") {
          if (wellHeadVal !== undefined && wellHeadVal !== "") {
            input.value = wellHeadVal;
            const tb = document.getElementById("depth_tb");
            if (tb) tb.value = input.value;
            saveState();
            calculateVolume();
            return;
          }
          // else do nothing
        }

        // For all other cases, fall through to global defaults below
      }

      // Global defaults removed: clicking default with no special-case will not set a global 20/361 value.
      // keep tie-back bottom synced to Production Top (if anything changed above)
      const tb = document.getElementById("depth_tb");
      if (tb) tb.value = input.value;
      saveState();
      calculateVolume();
    });
  });
}

setupDefaultTopButtons();

// setupDefaultRiserButton removed — riser uses a Wellhead button now and no global default is applied.

function setupWellheadButtons() {
  document.querySelectorAll(".wellhead-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      const wellDepthEl = document.getElementById("wellhead_depth");
      if (!input || !wellDepthEl) return;
      const wellDepth = wellDepthEl.value;
      if (wellDepth === "") return;
      input.value = wellDepth;
      saveState();
      calculateVolume();
    });
  });
}

setupWellheadButtons();

function setupReservoirDefaultButton() {
  const btn = document.querySelector(".reservoir-default-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const prodBottom = document.getElementById("depth_7")?.value - 50;
    const target = document.getElementById("depth_5_top");
    if (!target) return;
    if (prodBottom !== undefined && prodBottom !== "") {
      target.value = prodBottom;
    } else {
      // If Production Bottom is empty, clear Reservoir Top (or leave as-is). We'll clear.
      target.value = "";
    }
    saveState();
    calculateVolume();
  });
}

setupReservoirDefaultButton();

function setupWellheadDepthToggle() {
  const toggle = document.getElementById("riser_subsea");
  const wellheadDepthContainer = document.getElementById(
    "wellhead-depth-container"
  );

  if (!toggle || !wellheadDepthContainer) return;

  // Always display the wellhead depth input so it's visible for both Subsea and Fixed modes
  const updateVisibility = () => {
    wellheadDepthContainer.style.display = "flex";
  };

  // Keep updating on toggle changes (no-op for visibility) so any future logic runs as expected
  toggle.addEventListener("change", () => {
    updateVisibility();
  });

  // Ensure it's visible on load
  updateVisibility();
}

setupWellheadDepthToggle();

function setupTopCopyFromWellhead() {
  const well = document.getElementById("wellhead_depth");
  const topIds = ["depth_18_top", "depth_13_top", "depth_9_top"];
  const followIds = ["depth_18_top", "depth_13_top"]; // conductor and surface

  // dblclick copies wellhead depth to a specific top input
  topIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.title = el.title || "Double-click to copy Wellhead depth";
    el.addEventListener("dblclick", () => {
      if (!well) return;
      el.value = well.value;
      saveState();
      calculateVolume();
    });
  });

  if (well) {
    // when wellhead depth changes: if Subsea is active, force conductor & surface tops to follow
    well.addEventListener("input", () => {
      const isSubsea = document.getElementById("riser_subsea")?.checked;
      if (isSubsea) {
        followIds.forEach((id) => {
          const el = document.getElementById(id);
          if (!el) return;
          el.value = well.value;
        });
      } else {
        // only fill empty fields when not Subsea
        topIds.forEach((id) => {
          const el = document.getElementById(id);
          if (!el) return;
          if (el.value === "") el.value = well.value;
        });
      }
      saveState();
      calculateVolume();
    });

    // when toggling to Subsea, immediately apply wellhead depth to conductor & surface tops
    const toggle = document.getElementById("riser_subsea");
    if (toggle) {
      toggle.addEventListener("change", (e) => {
        if (e.target.checked && well.value !== "") {
          followIds.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.value = well.value;
          });
          saveState();
          calculateVolume();
        }
      });
    }
  }
}

setupTopCopyFromWellhead();

function setupTiebackToggle() {
  const prodLinerChk = document.getElementById("production_is_liner");
  const tiebackCasing = document.getElementById("tieback_casing");
  const useTie = document.getElementById("use_tieback");
  if (!prodLinerChk || !tiebackCasing || !useTie) return;

  const update = () => {
    if (prodLinerChk.checked) {
      tiebackCasing.style.display = "block";
      useTie.checked = true;
    } else {
      tiebackCasing.style.display = "none";
      useTie.checked = false;
    }
    saveState();
    calculateVolume();
  };

  prodLinerChk.addEventListener("change", update);

  // initialize
  update();
}

setupTiebackToggle();

function setupTiebackBottomSync() {
  const prodTop = document.getElementById("depth_7_top");
  const tieBottom = document.getElementById("depth_tb");
  if (!prodTop || !tieBottom) return;

  const sync = () => {
    // Mirror Production Top into Tie-back Bottom (read-only)
    const v = prodTop.value;
    tieBottom.value = v === "" ? "" : v;
    saveState();
    calculateVolume();
  };

  // Sync on user input and programmatic changes (change event)
  prodTop.addEventListener("input", sync);
  prodTop.addEventListener("change", sync);

  // Also sync when wellhead depth changes (since Production Top can be set from wellhead)
  const well = document.getElementById("wellhead_depth");
  if (well) {
    well.addEventListener("input", sync);
  }

  // Initialize immediately
  sync();
}

setupTiebackBottomSync();

function setupProductionTopLabelToggle() {
  const prodLinerChk = document.getElementById("production_is_liner");
  const prodTopLabel = document.getElementById("production_top_label");
  const prodInfoBtn = document.getElementById("production_liner_info_btn");
  const prodDefaultBtn = document.querySelector(
    '.default-top-btn[data-target="depth_7_top"]'
  );
  const prodExtraBtn = document.querySelector(".production-extra-default");
  const prodExtraInfoBtn = document.getElementById("production_extra_info_btn");
  const prodExtraInfoTip = document.getElementById(
    "production_extra_info_tooltip"
  );
  if (!prodLinerChk || !prodTopLabel) return;

  const updateLabel = () => {
    // When Liner is checked, show 'Top PBR:', otherwise show 'Hanger:'
    prodTopLabel.textContent = prodLinerChk.checked
      ? "Top PBR:"
      : "Hanger/PBR:";

    // Show the small info button only when Liner is checked
    if (prodInfoBtn)
      prodInfoBtn.style.display = prodLinerChk.checked ? "inline-flex" : "none";

    // Update the Default button text to 'Default' for Tie-back, 'Casing' when not Tie-back
    if (prodDefaultBtn) {
      prodDefaultBtn.textContent = prodLinerChk.checked ? "Default" : "Casing";
      prodDefaultBtn.setAttribute(
        "aria-label",
        prodLinerChk.checked ? "Default for tie-back" : "Use casing depth"
      );
      prodDefaultBtn.title = prodLinerChk.checked
        ? "Default for Tie-back: uses Intermediate casing bottom minus 50 m"
        : "Use Casing depth";
    }

    // Show the extra Default button only when Tie-back? is unchecked
    if (prodExtraBtn)
      prodExtraBtn.style.display = prodLinerChk.checked
        ? "none"
        : "inline-flex";

    // Show/hide the small info button next to the extra button
    if (prodExtraInfoBtn)
      prodExtraInfoBtn.style.display = prodLinerChk.checked
        ? "none"
        : "inline-flex";
    if (prodExtraInfoTip && prodLinerChk.checked) {
      // ensure its tooltip is hidden when not visible
      prodExtraInfoTip.style.display = "none";
      prodExtraInfoTip.setAttribute("aria-hidden", "true");
    }
  };

  prodLinerChk.addEventListener("change", () => {
    updateLabel();
    // persist label-related state if needed
    saveState();
  });

  // initialize
  updateLabel();
}

setupProductionTopLabelToggle();

function setupProductionExtraDefaultButton() {
  const btn = document.querySelector(".production-extra-default");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const target = document.getElementById("depth_7_top");
    if (!target) return;
    // When Tie-back? is unchecked, Default should use Intermediate Bottom value
    const intermediateBottomVal = document.getElementById("depth_9")?.value;
    if (intermediateBottomVal !== undefined && intermediateBottomVal !== "") {
      const val = parseFloat(intermediateBottomVal);
      if (!isNaN(val)) {
        target.value = String(val - 50);
        // keep tie-back bottom synced
        const tb = document.getElementById("depth_tb");
        if (tb) tb.value = target.value;
        saveState();
        calculateVolume();
      }
    }
    // If Intermediate Bottom is empty do nothing
  });
}

setupProductionExtraDefaultButton();

function setupProductionInfoTooltip() {
  const infoBtn = document.getElementById("production_liner_info_btn");
  const tooltip = document.getElementById("production_liner_info_tooltip");
  if (!infoBtn || !tooltip) return;

  // Remove native title to avoid browser tooltip delay
  infoBtn.removeAttribute("title");

  const show = () => {
    tooltip.style.display = "block";
    tooltip.setAttribute("aria-hidden", "false");
  };
  const hide = () => {
    tooltip.style.display = "none";
    tooltip.setAttribute("aria-hidden", "true");
  };

  // Immediate show on hover/focus
  infoBtn.addEventListener("mouseenter", show);
  // Only hide on mouseleave if the tooltip wasn't explicitly opened by a click
  let persistOpen = false;
  infoBtn.addEventListener("mouseleave", () => {
    if (!persistOpen) hide();
  });
  infoBtn.addEventListener("focus", show);
  infoBtn.addEventListener("blur", hide);

  // Keep visible when hovering the tooltip itself
  tooltip.addEventListener("mouseenter", show);
  tooltip.addEventListener("mouseleave", () => {
    if (!persistOpen) hide();
  });

  // For touch devices & accessibility: show on click and keep open (do not hide when clicking the button);
  // clicking elsewhere closes it
  infoBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    show();
    persistOpen = true;
    // keep focus on the button for keyboard users
    infoBtn.focus();
  });
  document.addEventListener("click", (e) => {
    if (!infoBtn.contains(e.target) && !tooltip.contains(e.target)) {
      persistOpen = false;
      hide();
    }
  });
}

setupProductionInfoTooltip();

function setupProductionExtraInfoTooltip() {
  const infoBtn = document.getElementById("production_extra_info_btn");
  const tooltip = document.getElementById("production_extra_info_tooltip");
  if (!infoBtn || !tooltip) return;

  // Remove native title to avoid browser tooltip delay
  infoBtn.removeAttribute("title");

  const show = () => {
    tooltip.style.display = "block";
    tooltip.setAttribute("aria-hidden", "false");
  };
  const hide = () => {
    tooltip.style.display = "none";
    tooltip.setAttribute("aria-hidden", "true");
  };

  // Immediate show on hover/focus
  infoBtn.addEventListener("mouseenter", show);
  // Only hide on mouseleave if the tooltip wasn't explicitly opened by a click
  let persistOpen = false;
  infoBtn.addEventListener("mouseleave", () => {
    if (!persistOpen) hide();
  });
  infoBtn.addEventListener("focus", show);
  infoBtn.addEventListener("blur", hide);

  // Keep visible when hovering the tooltip itself
  tooltip.addEventListener("mouseenter", show);
  tooltip.addEventListener("mouseleave", () => {
    if (!persistOpen) hide();
  });

  // For touch devices & accessibility: show on click and keep open (do not hide when clicking the button);
  // clicking elsewhere closes it
  infoBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    show();
    persistOpen = true;
    infoBtn.focus();
  });
  document.addEventListener("click", (e) => {
    if (!infoBtn.contains(e.target) && !tooltip.contains(e.target)) {
      persistOpen = false;
      hide();
    }
  });
}

setupProductionExtraInfoTooltip();

function setupReservoirDefaultInfoTooltip() {
  const infoBtn = document.getElementById("reservoir_default_info_btn");
  const tooltip = document.getElementById("reservoir_default_info_tooltip");
  if (!infoBtn || !tooltip) return;

  // Remove native title to avoid browser tooltip delay
  infoBtn.removeAttribute("title");

  const show = () => {
    tooltip.style.display = "block";
    tooltip.setAttribute("aria-hidden", "false");
  };
  const hide = () => {
    tooltip.style.display = "none";
    tooltip.setAttribute("aria-hidden", "true");
  };

  // Immediate show on hover/focus
  infoBtn.addEventListener("mouseenter", show);
  // Only hide on mouseleave if the tooltip wasn't explicitly opened by a click
  let persistOpen = false;
  infoBtn.addEventListener("mouseleave", () => {
    if (!persistOpen) hide();
  });
  infoBtn.addEventListener("focus", show);
  infoBtn.addEventListener("blur", hide);

  // Keep visible when hovering the tooltip itself
  tooltip.addEventListener("mouseenter", show);
  tooltip.addEventListener("mouseleave", () => {
    if (!persistOpen) hide();
  });

  // For touch devices & accessibility: show on click and keep open (do not hide when clicking the button);
  // clicking elsewhere closes it
  infoBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    show();
    persistOpen = true;
    infoBtn.focus();
  });
  document.addEventListener("click", (e) => {
    if (!infoBtn.contains(e.target) && !tooltip.contains(e.target)) {
      persistOpen = false;
      hide();
    }
  });
}

setupReservoirDefaultInfoTooltip();

function setupWellheadRiserSync() {
  const well = document.getElementById("wellhead_depth");
  const riser = document.getElementById("depth_riser");
  if (!well || !riser) return;

  // When Wellhead depth changes, update Riser depth to match
  well.addEventListener("input", () => {
    if (riser.value !== well.value) {
      riser.value = well.value;
      saveState();
      calculateVolume();
    }
  });

  // Initialize Riser from Wellhead on load if different
  if (well.value !== "" && riser.value !== well.value) {
    riser.value = well.value;
  }
}

setupWellheadRiserSync();

// Ensure riser depth is zero when 'No riser' is selected and restore from wellhead when re-enabled
function setupRiserTypeHandler() {
  const select = document.getElementById("riser_type");
  const riserDepthEl = document.getElementById("depth_riser");
  const wellEl = document.getElementById("wellhead_depth");
  if (!select || !riserDepthEl) return;

  const riserContainer = document.getElementById("depth_riser_container");

  const updateForType = () => {
    if (select.value === "none") {
      riserDepthEl.value = "0";
      if (riserContainer) riserContainer.style.display = "none";
    } else {
      if (riserContainer) riserContainer.style.display = "";
      // restore to wellhead depth when re-enabling
      if (wellEl && wellEl.value !== "") riserDepthEl.value = wellEl.value;
    }
    saveState();
    calculateVolume();
  };

  select.addEventListener("change", updateForType);

  // apply initial state immediately
  updateForType();
}

setupRiserTypeHandler();

// Initial calculation
calculateVolume();
