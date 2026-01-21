/**
 * Drill Pipe Module
 * Handles drill pipe selection, calculation, and UI management
 */

// Drill pipe catalog: 3.5", 4", 5", 5.875" with ID and OD in inches
export const DRILLPIPE_CATALOG = [
  {
    name: '2 7/8"',
    id: 2.151,
    od: 2.875,
    // liters per meter for ID volume (user-specified)
    lPerM: 2.238,
    // open-ended displacement (L/m)
    eod: 2.059,
    // closed-ended displacement (L/m)
    ced: 4.296
  },
  {
    name: '4"',
    id: 3.34,
    od: 4.0,
    // liters per meter for ID volume (user-specified)
    lPerM: 5.396,
    // open-ended displacement (L/m)
    eod: 2.985,
    // closed-ended displacement (L/m)
    ced: 8.381
  },
  {
    name: '5"',
    id: 4.276,
    od: 5.0,
    lPerM: 9.021,
    eod: 4.144,
    // closed-ended displacement (L/m)
    ced: 13.167
  },
  {
    name: '5 7/8"',
    id: 5.153,
    od: 5.875,
    lPerM: 13.128,
    eod: 4.739,
    // closed-ended displacement (L/m)
    ced: 17.857
  }
];

/**
 * Get drill pipe state from DOM
 * @returns {Object} - { mode: 'tubing'|'drillpipe', count: number, pipes: [{size, length}, ...] }
 */
export function gatherDrillPipeInput() {
  const modeToggle = document.getElementById('uc_mode_toggle');
  const mode = modeToggle && modeToggle.checked ? 'drillpipe' : 'tubing';

  if (mode === 'tubing') {
    return { mode: 'tubing', count: 0, pipes: [] };
  }

  const countSelect = document.getElementById('drillpipe_count');
  const count = parseInt(countSelect.value, 10) || 1;

  const pipes = [];
  for (let i = 0; i < count; i++) {
    const sizeSelect = document.getElementById(`drillpipe_size_${i}`);
    const lengthInput = document.getElementById(`drillpipe_length_${i}`);

    if (!sizeSelect || !lengthInput) continue;

    const selectedIndex = parseInt(sizeSelect.value, 10);
    const sizeName = DRILLPIPE_CATALOG[selectedIndex]?.name || '';
    const length = parseFloat(lengthInput.value) || 0;
    const lPerM = DRILLPIPE_CATALOG[selectedIndex]?.lPerM;
    const eod = DRILLPIPE_CATALOG[selectedIndex]?.eod;

    pipes.push({
      size: selectedIndex,
      sizeName,
      length,
      lPerM,
      eod
    });
  }

  return { mode: 'drillpipe', count, pipes };
}

/**
 * Calculate cumulative depths for each drill pipe segment
 * @param {Array} pipes - Array of { size, length } objects
 * @returns {Array} - Array of { size, length, cumulativeDepth } objects
 */
export function calculateDrillPipeDepths(pipes) {
  let cumulativeDepth = 0;
  return pipes.map((pipe) => {
    cumulativeDepth += pipe.length;
    return {
      ...pipe,
      cumulativeDepth
    };
  });
}

/**
 * Calculate drill pipe volumes organized by containing casing
 * (similar to hole volume table structure)
 *
 * @param {Array} pipes - Array of { size, length } drill pipe segments
 * @param {Array} casingsInput - Array of casing descriptors
 * @returns {Object} - { sections: [...], dpIdVolume, annulusVolume, dpIdLength, used: boolean }
 */
export function computeDrillPipeBreakdown(pipes, casingsInput, dpInput = {}) {
  if (!pipes || pipes.length === 0) {
    return {
      used: false,
      sections: [],
      dpIdVolume: 0,
      annulusVolume: 0,
      dpIdLength: 0
    };
  }

  // Build array of DP segments with cumulative depths
  let cumulativeDepth = 0;
  const dpSegments = pipes.map((pipe) => {
    const sizeData = DRILLPIPE_CATALOG[pipe.size];
    const start = cumulativeDepth;
    const end = cumulativeDepth + pipe.length;
    cumulativeDepth = end;
    return {
      ...sizeData,
      start,
      end,
      length: pipe.length
    };
  });

  // Active casings (excluding upper_completion), sorted by ID (narrowest first)
  // This ensures narrower casings "win" when they overlap with outer casings
  const activeCasings = casingsInput
    .filter((c) => c.use && c.role !== 'upper_completion')
    .sort((a, b) => {
      const aId = a.id || Infinity;
      const bId = b.id || Infinity;
      return aId - bId; // Sort ascending: narrowest first
    });

  const sections = [];
  let totalDpIdVol = 0;
  let totalAnnulusVol = 0;
  let totalDpLength = 0;

  // Track which depth ranges have been assigned to narrower casings
  // This prevents double-counting when casings nest/overlap
  const assignedRanges = [];

  // For each casing (starting with narrowest), find DP segments that overlap
  activeCasings.forEach((casing) => {
    const casingTopVal = typeof casing.top !== 'undefined' ? casing.top : 0;
    const casingBottomVal = casing.depth;

    let caseDpIdVol = 0;
    let caseAnnulusVol = 0;
    let caseDpLength = 0;

    // Iterate through all DP segments and find overlap with this casing
    dpSegments.forEach((dpSeg) => {
      const overlapTop = Math.max(dpSeg.start, casingTopVal);
      const overlapBottom = Math.min(dpSeg.end, casingBottomVal);
      let overlapLength = Math.max(0, overlapBottom - overlapTop);

      if (overlapLength <= 0) return; // No overlap

      // Check if this depth range was already assigned to a narrower casing
      // Only process the portion not yet assigned
      assignedRanges.forEach((range) => {
        if (range.start < overlapBottom && range.end > overlapTop) {
          // There's an overlap with an already-assigned range
          const conflictTop = Math.max(range.start, overlapTop);
          const conflictBottom = Math.min(range.end, overlapBottom);
          const conflictLength = Math.max(0, conflictBottom - conflictTop);
          overlapLength -= conflictLength;
        }
      });

      if (overlapLength <= 0) return; // All of this overlap was already assigned

      // DP ID volume for this overlap
      let dpIdVolSegment;
      if (typeof dpSeg.lPerM !== 'undefined') {
        dpIdVolSegment = (dpSeg.lPerM / 1000) * overlapLength;
      } else {
        const dpIdRadius = (dpSeg.id / 2) * 0.0254;
        const dpIdArea = Math.PI * Math.pow(dpIdRadius, 2);
        dpIdVolSegment = dpIdArea * overlapLength;
      }

      caseDpIdVol += dpIdVolSegment;
      caseDpLength += overlapLength;

      // Annulus volume (geometric: casing ID area - DP OD area)
      if (casing.id) {
        const casingIdRadius = (casing.id / 2) * 0.0254;
        const casingIdArea = Math.PI * Math.pow(casingIdRadius, 2);
        const dpOdRadius = (dpSeg.od / 2) * 0.0254;
        const dpOdArea = Math.PI * Math.pow(dpOdRadius, 2);
        const annulusArea = Math.max(0, casingIdArea - dpOdArea);
        const annulusVolSegment = annulusArea * overlapLength;
        caseAnnulusVol += annulusVolSegment;
      }

      // Track that this depth range has been assigned
      assignedRanges.push({
        start: Math.max(dpSeg.start, casingTopVal),
        end: Math.min(dpSeg.end, casingBottomVal)
      });
    });

    // Only add row if there's DP in this casing
    if (caseDpLength > 0) {
      const dpLPerM = caseDpIdVol > 0 ? (caseDpIdVol * 1000) / caseDpLength : 0;
      const annulusLPerM =
        caseAnnulusVol > 0 ? (caseAnnulusVol * 1000) / caseDpLength : 0;

      sections.push({
        casing: casing.role,
        dpIdVolume: caseDpIdVol,
        annulusVolume: caseAnnulusVol,
        dpLength: caseDpLength,
        dpLPerM,
        annulusLPerM
      });

      totalDpIdVol += caseDpIdVol;
      totalAnnulusVol += caseAnnulusVol;
      totalDpLength += caseDpLength;
    }
  });

  return {
    used: sections.length > 0,
    sections,
    dpIdVolume: totalDpIdVol,
    annulusVolume: totalAnnulusVol,
    dpIdLength: totalDpLength
  };
}

/**
 * Render drill pipe input controls in the DOM
 * @param {number} count - Number of drill pipe sizes (1-3)
 */
export function renderDrillPipeInputs(count) {
  const container = document.getElementById('drillpipe_inputs_container');
  if (!container) return;

  container.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const row = document.createElement('div');
    row.className = 'input-row drillpipe-input-row';

    // Size selector
    const sizeLabel = document.createElement('label');
    sizeLabel.htmlFor = `drillpipe_size_${i}`;
    sizeLabel.textContent = `DP ${i + 1}`;

    const sizeSelect = document.createElement('select');
    sizeSelect.id = `drillpipe_size_${i}`;
    sizeSelect.className = 'drillpipe-size-select';
    sizeSelect.setAttribute('aria-label', `Drill pipe size ${i + 1}`);

    // Append options in reverse order so dropdown shows opposite order
    for (let idx = DRILLPIPE_CATALOG.length - 1; idx >= 0; idx--) {
      const pipe = DRILLPIPE_CATALOG[idx];
      const option = document.createElement('option');
      option.value = idx;
      option.textContent = pipe.name;
      sizeSelect.appendChild(option);
    }

    // Default sizing: DP1 -> largest, DP2 -> next, DP3 -> smallest
    const defaultIndex = Math.max(0, DRILLPIPE_CATALOG.length - 1 - i);
    sizeSelect.value = String(defaultIndex);

    // Length input
    const lengthLabel = document.createElement('label');
    lengthLabel.htmlFor = `drillpipe_length_${i}`;
    lengthLabel.textContent = 'Length (m):';

    const lengthInput = document.createElement('input');
    lengthInput.id = `drillpipe_length_${i}`;
    lengthInput.type = 'number';
    lengthInput.className = 'drillpipe-length-input';
    // Use 1m step for drill pipe lengths (user requested whole-meter stepping)
    lengthInput.step = '1';
    lengthInput.min = '0';
    lengthInput.value = '0';
    lengthInput.setAttribute(
      'aria-label',
      `Length of drill pipe size ${i + 1} in meters`
    );

    // Cumulative depth display
    const depthLabel = document.createElement('label');
    depthLabel.htmlFor = `drillpipe_depth_${i}`;
    depthLabel.textContent = 'Depth (m):';

    const depthDisplay = document.createElement('input');
    depthDisplay.id = `drillpipe_depth_${i}`;
    depthDisplay.type = 'number';
    depthDisplay.className = 'drillpipe-depth-display';
    depthDisplay.readOnly = true;
    depthDisplay.step = '0.1';
    depthDisplay.setAttribute(
      'aria-label',
      `Cumulative depth at bottom of drill pipe segment ${i + 1}`
    );

    // Append to row
    row.appendChild(sizeLabel);
    row.appendChild(sizeSelect);
    row.appendChild(lengthLabel);
    row.appendChild(lengthInput);
    row.appendChild(depthLabel);
    row.appendChild(depthDisplay);

    container.appendChild(row);
  }
}

/**
 * Update cumulative depth displays for drill pipe segments
 */
export function updateDrillPipeDepthDisplays() {
  const container = document.getElementById('drillpipe_inputs_container');
  if (!container) return;

  let cumulativeDepth = 0;

  // Iterate through each pipe size row
  const rows = container.querySelectorAll('.drillpipe-input-row');
  rows.forEach((row) => {
    const lengthInput = row.querySelector('input[id^="drillpipe_length_"]');
    const depthDisplay = row.querySelector('input[id^="drillpipe_depth_"]');

    if (lengthInput && depthDisplay) {
      const length = parseFloat(lengthInput.value) || 0;
      cumulativeDepth += length;
      depthDisplay.value = cumulativeDepth.toFixed(1);
    }
  });
}
