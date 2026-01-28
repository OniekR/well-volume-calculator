import { el } from './dom.js';
import { OD, DRIFT } from './constants.js';

/**
 * Parse user numeric input tolerant of common locale formatting (commas for decimals,
 * and spaces as thousand separators). Returns a Number or undefined for invalid input.
 */
const clampNumber = (raw) => {
  if (raw === null || typeof raw === 'undefined') return undefined;
  // If already a number, return it if valid
  if (typeof raw === 'number') return isNaN(raw) ? undefined : raw;

  // Normalize string: trim, remove grouping spaces, replace comma with dot
  const s = String(raw).trim().replace(/\s+/g, '').replace(',', '.');
  const n = Number(s);
  return isNaN(n) ? undefined : n;
};

function sizeIdValue(selectId, fallbackValue) {
  const idInput = el(`${selectId}_id`);
  if (!idInput) return fallbackValue;
  const v = clampNumber(idInput.value);
  return typeof v !== 'undefined' && !isNaN(v) ? v : fallbackValue;
}

export function gatherInputs() {
  // Read common values
  const riserTypeVal = el('riser_type')?.value;
  const riserID = sizeIdValue('riser_type', clampNumber(riserTypeVal));
  const riserOD = riserTypeVal === 'none' ? 0 : OD.riser[riserTypeVal] || 20;

  const riserDepthVal = clampNumber(el('depth_riser')?.value);
  const wellheadDepthVal = clampNumber(el('wellhead_depth')?.value);

  const surfaceBottomVal = clampNumber(el('depth_13')?.value);
  const intermediateBottomVal = clampNumber(el('depth_9')?.value);

  const surfaceInUse = el('use_13')?.checked;
  const intermediateInUse = el('use_9')?.checked;

  // per-casing
  const conductorID = sizeIdValue(
    'conductor_size',
    clampNumber(el('conductor_size')?.value)
  );
  const conductorOD = OD.conductor[conductorID] || 30;
  const conductorTopInputVal = clampNumber(el('depth_18_top')?.value);

  const surfaceID = sizeIdValue(
    'surface_size',
    clampNumber(el('surface_size')?.value)
  );
  const surfaceOD = OD.surface[surfaceID] || 20;

  const intermediateID = sizeIdValue(
    'intermediate_size',
    clampNumber(el('intermediate_size')?.value)
  );
  const intermediateOD = OD.intermediate[intermediateID] || 13.375;

  const productionID = sizeIdValue(
    'production_size',
    clampNumber(el('production_size')?.value)
  );
  const productionOD = OD.production[productionID] || 9.625;

  const reservoirID = sizeIdValue(
    'reservoir_size',
    clampNumber(el('reservoir_size')?.value)
  );
  const reservoirOD = OD.reservoir[reservoirID] || 5.5;

  const smallLinerID = sizeIdValue(
    'small_liner_size',
    clampNumber(el('small_liner_size')?.value)
  );
  const smallLinerOD = OD.small_liner[smallLinerID] || 5;

  const upperCompletionID = sizeIdValue(
    'upper_completion_size',
    clampNumber(el('upper_completion_size')?.value)
  );
  const upperCompletionOD = OD.upper_completion[upperCompletionID] || 5.5;

  const openHoleID = sizeIdValue(
    'open_hole_size',
    clampNumber(el('open_hole_size')?.value)
  );
  const openHoleOD =
    typeof openHoleID !== 'undefined' && !isNaN(openHoleID) ? openHoleID : 0;

  const tiebackID = sizeIdValue(
    'tieback_size',
    clampNumber(el('tieback_size')?.value)
  );
  const tiebackOD = OD.tieback[tiebackID] || productionOD;

  const plugDepthVal = clampNumber(el('plug_depth')?.value);
  const plugEnabled = !!el('use_plug')?.checked;

  // compute auto tops
  let surfaceTopFinal;
  const surfaceTopInputVal = clampNumber(el('depth_13_top')?.value);
  if (!isNaN(surfaceTopInputVal)) surfaceTopFinal = surfaceTopInputVal;
  else if (
    el('use_riser')?.checked &&
    surfaceInUse &&
    !isNaN(riserDepthVal) &&
    surfaceBottomVal > riserDepthVal
  ) {
    surfaceTopFinal = riserDepthVal;
  }

  let intermediateTopFinal;
  const intermediateTopInputVal = clampNumber(el('depth_9_top')?.value);
  if (!isNaN(intermediateTopInputVal))
    intermediateTopFinal = intermediateTopInputVal;
  else if (
    el('use_riser')?.checked &&
    intermediateInUse &&
    !isNaN(riserDepthVal) &&
    !isNaN(intermediateBottomVal) &&
    intermediateBottomVal > riserDepthVal
  ) {
    intermediateTopFinal = riserDepthVal;
  }

  // Open Hole Top: always connect to the deepest casing shoe (across existing casings)
  let openTopFinal;
  const conductorBottomVal = clampNumber(el('depth_18_bottom')?.value);
  const productionBottomVal = clampNumber(el('depth_7')?.value);
  const reservoirBottomVal = clampNumber(el('depth_5')?.value);
  const smallLinerBottomVal = clampNumber(el('depth_small')?.value);
  const tiebackBottomVal = clampNumber(el('depth_tb')?.value);

  const useConductorFlag = !!el('use_18')?.checked;
  const useSurfaceFlag = !!el('use_13')?.checked;
  const useIntermediateFlag = !!el('use_9')?.checked;
  const useProductionFlag = !!el('use_7')?.checked;
  const useReservoirFlag = !!el('use_5')?.checked;
  const useSmallLinerFlag = !!el('use_small_liner')?.checked;
  const useTiebackFlag = !!el('use_tieback')?.checked;

  const shoeCandidates = [];
  if (useConductorFlag && !isNaN(conductorBottomVal))
    shoeCandidates.push(conductorBottomVal);
  if (useSurfaceFlag && !isNaN(surfaceBottomVal))
    shoeCandidates.push(surfaceBottomVal);
  if (useIntermediateFlag && !isNaN(intermediateBottomVal))
    shoeCandidates.push(intermediateBottomVal);
  if (useProductionFlag && !isNaN(productionBottomVal))
    shoeCandidates.push(productionBottomVal);
  if (useReservoirFlag && !isNaN(reservoirBottomVal))
    shoeCandidates.push(reservoirBottomVal);
  if (useSmallLinerFlag && !isNaN(smallLinerBottomVal))
    shoeCandidates.push(smallLinerBottomVal);
  if (useTiebackFlag && !isNaN(tiebackBottomVal))
    shoeCandidates.push(tiebackBottomVal);

  if (shoeCandidates.length) {
    const deepest = Math.max(...shoeCandidates);
    openTopFinal = deepest;
    const openTopEl = el('depth_open_top');
    if (openTopEl) openTopEl.value = String(openTopFinal);
    const openNoteEl = el('open_hole_length_note');
    if (openNoteEl)
      openNoteEl.textContent = `Top linked to deepest casing shoe: ${openTopFinal} m`;
  } else {
    openTopFinal = undefined;
    const openNoteEl = el('open_hole_length_note');
    if (openNoteEl) openNoteEl.textContent = '';
  }

  const casingsInput = [
    {
      role: 'riser',
      id: riserID,
      depth: clampNumber(el('depth_riser')?.value),
      use: !!el('use_riser')?.checked,
      od: riserOD
    },

    {
      role: 'conductor',
      id: conductorID,
      top: !isNaN(conductorTopInputVal) ? conductorTopInputVal : undefined,
      depth: clampNumber(el('depth_18_bottom')?.value),
      use: !!el('use_18')?.checked,
      od: conductorOD
    },
    {
      role: 'surface',
      id: surfaceID,
      top: surfaceTopFinal,
      depth: clampNumber(el('depth_13')?.value),
      use: !!el('use_13')?.checked,
      od: surfaceOD
    },
    {
      role: 'intermediate',
      id: intermediateID,
      top: intermediateTopFinal,
      depth: clampNumber(el('depth_9')?.value),
      use: !!el('use_9')?.checked,
      od: intermediateOD
    },
    {
      role: 'production',
      id: productionID,
      top: !isNaN(clampNumber(el('depth_7_top')?.value))
        ? clampNumber(el('depth_7_top')?.value)
        : undefined,
      depth: clampNumber(el('depth_7')?.value),
      use: !!el('use_7')?.checked,
      od: productionOD
    },
    {
      role: 'tieback',
      id: tiebackID,
      top: !isNaN(clampNumber(el('depth_tb_top')?.value))
        ? clampNumber(el('depth_tb_top')?.value)
        : undefined,
      depth: clampNumber(el('depth_tb')?.value),
      use: !!el('use_tieback')?.checked,
      od: tiebackOD
    },
    {
      role: 'reservoir',
      id: reservoirID,
      top: !isNaN(clampNumber(el('depth_5_top')?.value))
        ? clampNumber(el('depth_5_top')?.value)
        : undefined,
      depth: clampNumber(el('depth_5')?.value),
      use: !!el('use_5')?.checked,
      od: reservoirOD
    },
    {
      role: 'small_liner',
      id: smallLinerID,
      top: !isNaN(clampNumber(el('depth_small_top')?.value))
        ? clampNumber(el('depth_small_top')?.value)
        : undefined,
      depth: clampNumber(el('depth_small')?.value),
      use: !!el('use_small_liner')?.checked,
      od: smallLinerOD
    },
    {
      role: 'upper_completion',
      id: upperCompletionID,
      top: !isNaN(clampNumber(el('depth_uc_top')?.value))
        ? clampNumber(el('depth_uc_top')?.value)
        : undefined,
      depth: clampNumber(el('depth_uc')?.value),
      use: !!el('use_upper_completion')?.checked,
      od: upperCompletionOD
    },
    {
      role: 'open_hole',
      id: openHoleID,
      top: !isNaN(clampNumber(el('depth_open_top')?.value))
        ? clampNumber(el('depth_open_top')?.value)
        : undefined,
      depth: clampNumber(el('depth_open')?.value),
      use: !!el('use_open_hole')?.checked,
      od: openHoleOD,
      z: -1
    }
  ];

  // attach optional drift values if inputs exist (e.g., 'production_drift')
  casingsInput.forEach((c) => {
    const driftEl = el(`${c.role}_drift`);
    if (driftEl) {
      const v = clampNumber(driftEl.value);
      if (!isNaN(v)) c.drift = v;
    }
  });

  // default drift from constants if not provided explicitly
  casingsInput.forEach((c) => {
    if (typeof c.drift === 'undefined') {
      const roleMap = DRIFT && DRIFT[c.role];
      if (roleMap && typeof roleMap[c.id] !== 'undefined')
        c.drift = roleMap[c.id];
    }
  });

  return {
    casingsInput,
    plugEnabled,
    plugDepthVal,
    surfaceInUse,
    intermediateInUse,
    riserTypeVal,
    riserDepthVal,
    wellheadDepthVal
  };
}
