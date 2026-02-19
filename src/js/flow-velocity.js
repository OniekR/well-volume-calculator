import { el } from './dom.js';
import { MINIMUM_HOLE_CLEANING_VELOCITY } from './constants.js';
import { getDrillpipeCatalog } from './definitions.js';

export const FLOW_UNIT_LABELS = {
  lpm: 'L/min',
  gpm: 'GPM',
  m3h: 'm³/h',
  bpm: 'BPM'
};

export const FLOW_PRESETS_LPM = [1000, 2000, 3000, 4000, 5000];

const FLOW_UNIT_TO_M3S = {
  lpm: (value) => value / 1000 / 60,
  gpm: (value) => (value * 0.003785411784) / 60,
  m3h: (value) => value / 3600,
  bpm: (value) => (value * 0.158987294928) / 60
};

const FLOW_UNIT_FROM_M3S = {
  lpm: (value) => value * 1000 * 60,
  gpm: (value) => (value * 60) / 0.003785411784,
  m3h: (value) => value * 3600,
  bpm: (value) => (value * 60) / 0.158987294928
};

const ROLE_LABELS = {
  riser: 'Riser',
  conductor: 'Conductor',
  surface: 'Surface',
  intermediate: 'Intermediate',
  production: 'Production',
  tieback: 'Tie-back',
  reservoir: 'Reservoir',
  small_liner: 'Small liner',
  open_hole: 'Open hole'
};

const normalizeNumber = (raw) => {
  if (raw == null) return undefined;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : undefined;
  const value = String(raw).trim().replace(/\s+/g, '').replace(',', '.');
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export function convertFlowToM3s(value, unit = 'lpm') {
  const numeric = normalizeNumber(value);
  if (!Number.isFinite(numeric)) return undefined;
  const converter = FLOW_UNIT_TO_M3S[unit] || FLOW_UNIT_TO_M3S.lpm;
  return converter(numeric);
}

export function convertM3sToUnit(valueM3s, unit = 'lpm') {
  if (!Number.isFinite(valueM3s)) return undefined;
  const converter = FLOW_UNIT_FROM_M3S[unit] || FLOW_UNIT_FROM_M3S.lpm;
  return converter(valueM3s);
}

export function convertMpsToFps(valueMps) {
  return Number.isFinite(valueMps) ? valueMps * 3.28084 : undefined;
}

export function diameterInchesToAreaM2(diameterInches) {
  const diameter = normalizeNumber(diameterInches);
  if (!Number.isFinite(diameter) || diameter <= 0) return 0;
  const radius = (diameter * 0.0254) / 2;
  return Math.PI * radius * radius;
}

function buildDrillPipeSegments(drillpipeInput) {
  const catalog = getDrillpipeCatalog();
  const pipes = drillpipeInput?.pipes || [];
  let currentDepth = 0;
  return pipes
    .map((pipe) => {
      const length = normalizeNumber(pipe.length) || 0;
      const catalogEntry = catalog[pipe.size] || {};
      const segment = {
        top: currentDepth,
        bottom: currentDepth + length,
        id: catalogEntry.id,
        od: catalogEntry.od,
        label: catalogEntry.name || pipe.sizeName || 'Drill pipe'
      };
      currentDepth += length;
      return segment;
    })
    .filter((seg) => seg.bottom > seg.top && seg.id && seg.od);
}

function buildTubingSegments(tubingInput) {
  const tubings = tubingInput?.tubings || [];
  return tubings
    .map((tube) => ({
      top: normalizeNumber(tube.top) || 0,
      bottom: normalizeNumber(tube.shoe) || 0,
      id: tube.id,
      od: tube.od,
      label: tube.sizeName || 'Tubing'
    }))
    .filter((seg) => seg.bottom > seg.top && seg.id && seg.od);
}

function resolvePipeSegments({
  drillpipeInput,
  tubingInput,
  pipeModeOverride
}) {
  const override = pipeModeOverride || 'auto';
  if (override === 'drillpipe') {
    return {
      mode: 'drillpipe',
      segments: buildDrillPipeSegments(drillpipeInput)
    };
  }
  if (override === 'tubing') {
    return { mode: 'tubing', segments: buildTubingSegments(tubingInput) };
  }
  if (drillpipeInput?.mode === 'drillpipe') {
    return {
      mode: 'drillpipe',
      segments: buildDrillPipeSegments(drillpipeInput)
    };
  }
  return { mode: 'tubing', segments: buildTubingSegments(tubingInput) };
}

function buildDepthPoints(casingsInput, pipeSegments) {
  const points = new Set([0]);
  casingsInput.forEach((casing) => {
    if (typeof casing.top !== 'undefined' && !isNaN(casing.top))
      points.add(casing.top);
    if (!isNaN(casing.depth)) points.add(casing.depth);
  });
  pipeSegments.forEach((seg) => {
    points.add(seg.top);
    points.add(seg.bottom);
  });
  return Array.from(points).sort((a, b) => a - b);
}

function getActiveCasings(
  casingsInput,
  segStart,
  segEnd,
  surfaceInUse,
  intermediateInUse
) {
  return casingsInput
    .filter((casing) => {
      if (!casing.use) return false;
      if (casing.role === 'upper_completion') return false;
      if (casing.depth <= segStart) return false;
      const topVal = typeof casing.top !== 'undefined' ? casing.top : 0;
      if (topVal >= segEnd) return false;
      if (casing.role === 'conductor' && surfaceInUse) return false;
      if (casing.role === 'surface' && intermediateInUse) return false;
      return true;
    })
    .sort((a, b) => {
      const aId = Number.isFinite(Number(a.id)) ? Number(a.id) : Infinity;
      const bId = Number.isFinite(Number(b.id)) ? Number(b.id) : Infinity;
      return aId - bId;
    });
}

function formatRoleLabel(role) {
  return ROLE_LABELS[role] || role.replace(/_/g, ' ');
}

function summarize(values) {
  if (!values.length) {
    return { min: undefined, max: undefined, avg: undefined };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  return { min, max, avg };
}

function pickOverlaySegment(segments, depthMode, depthValue) {
  if (depthMode === 'single' && Number.isFinite(depthValue)) {
    return (
      segments.find(
        (segment) =>
          depthValue >= segment.startDepth && depthValue <= segment.endDepth
      ) || segments[0]
    );
  }
  return segments[0];
}

export function computeFlowVelocity(
  flowInput,
  {
    casingsInput = [],
    drillpipeInput = {},
    tubingInput = {},
    surfaceInUse = false,
    intermediateInUse = false
  } = {}
) {
  if (!flowInput || flowInput.active === false) {
    return { active: false, valid: false, segments: [] };
  }

  const flowRateM3s = flowInput.flowRateM3s;
  if (!Number.isFinite(flowRateM3s) || flowRateM3s <= 0) {
    return {
      active: true,
      valid: false,
      reason: 'invalid-flow-rate',
      segments: [],
      flowRateM3s,
      flowRateUnit: flowInput.flowRateUnit,
      flowRateValue: flowInput.flowRateValue
    };
  }

  const { mode: pipeMode, segments: pipeSegments } = resolvePipeSegments({
    drillpipeInput,
    tubingInput,
    pipeModeOverride: flowInput.pipeModeOverride
  });

  if (!pipeSegments.length) {
    return {
      active: true,
      valid: false,
      reason: 'no-pipe',
      segments: [],
      flowRateM3s,
      flowRateUnit: flowInput.flowRateUnit,
      flowRateValue: flowInput.flowRateValue,
      pipeMode
    };
  }

  const points = buildDepthPoints(casingsInput, pipeSegments);
  const segments = [];
  const casingLabels = new Set();

  for (let i = 0; i < points.length - 1; i += 1) {
    const segStart = points[i];
    const segEnd = points[i + 1];
    const segLength = segEnd - segStart;
    if (segLength <= 0) continue;

    const pipeSegment = pipeSegments.find(
      (seg) => segStart >= seg.top && segEnd <= seg.bottom
    );
    if (!pipeSegment) continue;

    const activeCasings = getActiveCasings(
      casingsInput,
      segStart,
      segEnd,
      surfaceInUse,
      intermediateInUse
    );

    const pipeArea = diameterInchesToAreaM2(pipeSegment.id);
    const pipeVelocityMps = pipeArea > 0 ? flowRateM3s / pipeArea : undefined;

    const annuli = activeCasings
      .map((casing) => {
        const casingArea = diameterInchesToAreaM2(casing.id);
        const pipeOdArea = diameterInchesToAreaM2(pipeSegment.od);
        const annulusArea = Math.max(0, casingArea - pipeOdArea);
        if (annulusArea <= 0) return undefined;
        const velocityMps = flowRateM3s / annulusArea;
        const casingLabel = `${formatRoleLabel(casing.role)} ${
          casing.id || ''
        }"`;
        casingLabels.add(casingLabel.trim());
        return {
          casingRole: casing.role,
          casingId: casing.id,
          casingLabel: casingLabel.trim(),
          velocityMps,
          velocityFps: convertMpsToFps(velocityMps)
        };
      })
      .filter(Boolean);

    segments.push({
      startDepth: segStart,
      endDepth: segEnd,
      length: segLength,
      pipe: {
        label: pipeSegment.label,
        velocityMps: pipeVelocityMps,
        velocityFps: convertMpsToFps(pipeVelocityMps)
      },
      annuli
    });
  }

  const pipeVelocities = segments
    .map((segment) => segment.pipe.velocityMps)
    .filter((value) => Number.isFinite(value));

  const annulusVelocities = segments
    .flatMap((segment) => segment.annuli.map((annulus) => annulus.velocityMps))
    .filter((value) => Number.isFinite(value));

  const summary = {
    pipe: summarize(pipeVelocities),
    annulus: summarize(annulusVelocities)
  };

  const overlaySegment = pickOverlaySegment(
    segments,
    flowInput.depthMode,
    flowInput.depthValue
  );
  const overlayAnnulus = overlaySegment?.annuli?.[0];

  return {
    active: true,
    valid: true,
    flowRateM3s,
    flowRateUnit: flowInput.flowRateUnit,
    flowRateValue: flowInput.flowRateValue,
    pipeMode,
    depthMode: flowInput.depthMode,
    depthValue: flowInput.depthValue,
    segments,
    casingLabels: Array.from(casingLabels),
    summary,
    overlay: overlaySegment
      ? {
          depthLabel: `${overlaySegment.startDepth.toFixed(
            1
          )}–${overlaySegment.endDepth.toFixed(1)} m`,
          pipeVelocityMps: overlaySegment.pipe.velocityMps,
          pipeVelocityFps: overlaySegment.pipe.velocityFps,
          annulusVelocityMps: overlayAnnulus?.velocityMps,
          annulusVelocityFps: overlayAnnulus?.velocityFps,
          annulusLabel: overlayAnnulus?.casingLabel
        }
      : undefined
  };
}

export function gatherFlowVelocityInput() {
  const flowRateEl = el('flow_rate');
  if (!flowRateEl) return { active: false };

  const flowRateValue = normalizeNumber(flowRateEl.value);
  const flowRateUnit = el('flow_rate_unit')?.value || 'lpm';
  const flowRateM3s = convertFlowToM3s(flowRateValue, flowRateUnit);
  const depthMode = el('flow_depth_mode_single')?.checked ? 'single' : 'all';
  const depthValue = normalizeNumber(el('flow_depth_value')?.value);
  const pipeModeOverride = el('flow_pipe_mode_override')?.value || 'auto';

  return {
    active: true,
    flowRateValue,
    flowRateUnit,
    flowRateM3s,
    depthMode,
    depthValue,
    pipeModeOverride
  };
}

export function setupFlowVelocityUI(deps = {}) {
  const { calculateVolume = () => {}, scheduleSave = () => {} } = deps;
  const flowRateEl = el('flow_rate');
  if (!flowRateEl) return;

  const unitSelect = el('flow_rate_unit');
  if (unitSelect) {
    unitSelect.dataset.prevUnit = unitSelect.value || 'lpm';
    unitSelect.addEventListener('change', () => {
      const prevUnit = unitSelect.dataset.prevUnit || 'lpm';
      const nextUnit = unitSelect.value || 'lpm';
      const currentValue = normalizeNumber(flowRateEl.value);
      if (Number.isFinite(currentValue)) {
        const currentM3s = convertFlowToM3s(currentValue, prevUnit);
        const nextValue = convertM3sToUnit(currentM3s, nextUnit);
        if (Number.isFinite(nextValue)) {
          flowRateEl.value = String(Math.round(nextValue));
        }
      }
      unitSelect.dataset.prevUnit = nextUnit;
      calculateVolume();
      scheduleSave();
    });
  }

  document.querySelectorAll('[data-flow-lpm]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = normalizeNumber(btn.dataset.flowLpm);
      if (!Number.isFinite(preset)) return;
      const unit = unitSelect?.value || 'lpm';
      const presetM3s = convertFlowToM3s(preset, 'lpm');
      const presetValue = convertM3sToUnit(presetM3s, unit);
      if (Number.isFinite(presetValue)) {
        flowRateEl.value = String(Math.round(presetValue));
      }
      calculateVolume();
      scheduleSave();
    });
  });

  const depthModeAll = el('flow_depth_mode_all');
  const depthModeSingle = el('flow_depth_mode_single');
  const depthInputWrap = el('flow-depth-input');
  const syncDepthMode = () => {
    if (!depthInputWrap) return;
    depthInputWrap.hidden = !(depthModeSingle && depthModeSingle.checked);
  };
  if (depthModeAll) depthModeAll.addEventListener('change', syncDepthMode);
  if (depthModeSingle)
    depthModeSingle.addEventListener('change', syncDepthMode);
  syncDepthMode();

  document.querySelectorAll('.flow-depth-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = el(btn.dataset.target);
      const source = el(btn.dataset.source);
      if (!target || !source) return;
      if (source.value !== '') {
        target.value = source.value;
        calculateVolume();
        scheduleSave();
      }
    });
  });
}

function formatVelocityValue(valueMps) {
  if (!Number.isFinite(valueMps)) return '—';
  const valueFps = convertMpsToFps(valueMps);
  return `${valueMps.toFixed(2)} m/s (${valueFps.toFixed(2)} ft/s)`;
}

function formatSummary(summary) {
  if (!Number.isFinite(summary?.avg)) return '—';
  return `Avg ${summary.avg.toFixed(2)} m/s · Min ${summary.min.toFixed(
    2
  )} · Max ${summary.max.toFixed(2)}`;
}

export function renderFlowVelocityResults(result) {
  const resultsEl = el('flow-results');
  const emptyEl = el('flow-results-empty');
  const listEl = el('flow-results-list');
  const errorEl = el('flow-rate-error');
  if (!resultsEl || !emptyEl || !listEl || !errorEl) return;

  if (!result || !result.active) {
    resultsEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    return;
  }

  if (!result.valid) {
    resultsEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    const isInvalidRate = result.reason === 'invalid-flow-rate';
    errorEl.textContent = isInvalidRate
      ? 'Enter a flow rate greater than zero.'
      : 'Flow velocity requires a configured pipe section.';
    errorEl.classList.toggle('hidden', !isInvalidRate);
    return;
  }

  errorEl.classList.add('hidden');
  emptyEl.classList.add('hidden');
  resultsEl.classList.remove('hidden');

  const rateSummary = el('flow-rate-summary');
  const pipeSummary = el('flow-pipe-summary');
  const casingSummary = el('flow-casing-summary');
  const summaryPipeEl = el('flow-summary-pipe');
  const summaryAnnulusEl = el('flow-summary-annulus');

  if (rateSummary) {
    const unitLabel =
      FLOW_UNIT_LABELS[result.flowRateUnit] || result.flowRateUnit;
    rateSummary.textContent = `${result.flowRateValue || 0} ${unitLabel}`;
  }

  if (pipeSummary) {
    pipeSummary.textContent =
      result.pipeMode === 'drillpipe' ? 'Drill pipe mode' : 'Tubing mode';
  }

  if (casingSummary) {
    casingSummary.textContent = result.casingLabels.length
      ? `Casings: ${result.casingLabels.join(', ')}`
      : 'No casing IDs available for annulus calculations.';
  }

  if (summaryPipeEl)
    summaryPipeEl.textContent = formatSummary(result.summary.pipe);
  if (summaryAnnulusEl)
    summaryAnnulusEl.textContent = formatSummary(result.summary.annulus);

  listEl.innerHTML = '';
  result.segments.forEach((segment) => {
    const card = document.createElement('div');
    card.className = 'flow-segment-card';

    const header = document.createElement('div');
    header.className = 'flow-segment-header';
    header.textContent = `${segment.startDepth.toFixed(
      1
    )}–${segment.endDepth.toFixed(1)} m`;
    card.appendChild(header);

    const pipeRow = document.createElement('div');
    pipeRow.className = 'flow-velocity-row';
    const pipeLabel = document.createElement('span');
    pipeLabel.textContent = `Pipe (${segment.pipe.label})`;
    const pipeValue = document.createElement('span');
    pipeValue.className = 'flow-velocity-value';
    if (segment.pipe.velocityMps < MINIMUM_HOLE_CLEANING_VELOCITY) {
      pipeValue.classList.add('flow-velocity-warning');
    }
    pipeValue.textContent = formatVelocityValue(segment.pipe.velocityMps);
    pipeRow.append(pipeLabel, pipeValue);
    card.appendChild(pipeRow);

    if (segment.annuli.length) {
      const annulusList = document.createElement('div');
      annulusList.className = 'flow-annulus-list';
      segment.annuli.forEach((annulus) => {
        const row = document.createElement('div');
        row.className = 'flow-velocity-row';
        const label = document.createElement('span');
        label.textContent = annulus.casingLabel || 'Annulus';
        const value = document.createElement('span');
        value.className = 'flow-velocity-value';
        if (annulus.velocityMps < MINIMUM_HOLE_CLEANING_VELOCITY) {
          value.classList.add('flow-velocity-warning');
        }
        value.textContent = formatVelocityValue(annulus.velocityMps);
        row.append(label, value);
        annulusList.appendChild(row);
      });
      card.appendChild(annulusList);
    }

    listEl.appendChild(card);
  });

  const schematicPipe = el('flow-schematic-pipe');
  const schematicAnnulus = el('flow-schematic-annulus');
  const schematicDepth = el('flow-schematic-depth');
  if (schematicPipe) {
    schematicPipe.textContent = formatVelocityValue(
      result.overlay?.pipeVelocityMps
    );
    schematicPipe.classList.toggle(
      'flow-velocity-warning',
      (result.overlay?.pipeVelocityMps || 0) < MINIMUM_HOLE_CLEANING_VELOCITY
    );
  }
  if (schematicAnnulus) {
    schematicAnnulus.textContent = formatVelocityValue(
      result.overlay?.annulusVelocityMps
    );
    schematicAnnulus.classList.toggle(
      'flow-velocity-warning',
      (result.overlay?.annulusVelocityMps || 0) < MINIMUM_HOLE_CLEANING_VELOCITY
    );
  }
  if (schematicDepth) {
    schematicDepth.textContent =
      result.overlay?.depthLabel || 'Select a depth to focus the schematic.';
  }
}
