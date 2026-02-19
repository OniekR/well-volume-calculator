import { el } from './dom.js';
import { OD, DRIFT } from './constants.js';
import { getCasingField } from './definitions.js';
import { gatherTubingInput } from './tubing.js';

/**
 * Parse user numeric input tolerant of common locale formatting (commas for decimals,
 * and spaces as thousand separators). Returns a Number or undefined for invalid input.
 */
const clampNumber = (raw) => {
  if (raw == undefined) return undefined;
  // If already a number, return it if valid
  if (typeof raw === 'number') return isNaN(raw) ? undefined : raw;

  // Normalize string: trim, remove grouping spaces, replace comma with dot
  const s = String(raw).trim().replace(/\s+/g, '').replace(',', '.');
  const n = Number(s);
  return isNaN(n) ? undefined : n;
};

const readInputNumber = (id) => clampNumber(el(id)?.value);

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
  const riserOD =
    riserTypeVal === 'none'
      ? 0
      : getCasingField('riser', riserID, 'od', OD.riser[riserTypeVal] || 20);

  const riserDepthVal = readInputNumber('depth_riser');
  const wellheadDepthVal = readInputNumber('wellhead_depth');

  const surfaceBottomVal = readInputNumber('depth_13');
  const intermediateBottomVal = readInputNumber('depth_9');

  const surfaceInUse = el('use_13')?.checked;
  const intermediateInUse = el('use_9')?.checked;

  // per-casing
  const conductorID = sizeIdValue(
    'conductor_size',
    readInputNumber('conductor_size')
  );
  const conductorOD = getCasingField(
    'conductor',
    conductorID,
    'od',
    OD.conductor[conductorID] || 30
  );
  const conductorTopInputVal = readInputNumber('depth_18_top');

  const surfaceID = sizeIdValue(
    'surface_size',
    readInputNumber('surface_size')
  );
  const surfaceOD = getCasingField(
    'surface',
    surfaceID,
    'od',
    OD.surface[surfaceID] || 20
  );

  const intermediateID = sizeIdValue(
    'intermediate_size',
    readInputNumber('intermediate_size')
  );
  const intermediateOD = getCasingField(
    'intermediate',
    intermediateID,
    'od',
    OD.intermediate[intermediateID] || 13.375
  );

  const productionID = sizeIdValue(
    'production_size',
    readInputNumber('production_size')
  );
  const productionOD = getCasingField(
    'production',
    productionID,
    'od',
    OD.production[productionID] || 9.625
  );

  const reservoirID = sizeIdValue(
    'reservoir_size',
    readInputNumber('reservoir_size')
  );
  const reservoirOD = getCasingField(
    'reservoir',
    reservoirID,
    'od',
    OD.reservoir[reservoirID] || 5.5
  );

  const smallLinerID = sizeIdValue(
    'small_liner_size',
    readInputNumber('small_liner_size')
  );
  const smallLinerOD = getCasingField(
    'small_liner',
    smallLinerID,
    'od',
    OD.small_liner[smallLinerID] || 5
  );

  const upperCompletionID = sizeIdValue(
    'upper_completion_size',
    readInputNumber('upper_completion_size')
  );
  const upperCompletionOD = getCasingField(
    'upper_completion',
    upperCompletionID,
    'od',
    OD.upper_completion[upperCompletionID] || 5.5
  );

  const openHoleID = sizeIdValue(
    'open_hole_size',
    readInputNumber('open_hole_size')
  );
  const openHoleOD = getCasingField(
    'open_hole',
    openHoleID,
    'od',
    typeof openHoleID !== 'undefined' && !isNaN(openHoleID) ? openHoleID : 0
  );

  const tiebackID = sizeIdValue(
    'tieback_size',
    readInputNumber('tieback_size')
  );
  const tiebackOD = getCasingField(
    'tieback',
    tiebackID,
    'od',
    OD.tieback[tiebackID] || productionOD
  );

  const plugDepthVal = readInputNumber('plug_depth');
  const plugEnabled = !!el('use_plug')?.checked;

  // compute auto tops
  let surfaceTopFinal;
  const surfaceTopInputVal = readInputNumber('depth_13_top');
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
  const intermediateTopInputVal = readInputNumber('depth_9_top');
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
  const conductorBottomVal = readInputNumber('depth_18_bottom');
  const productionBottomVal = readInputNumber('depth_7');
  const reservoirBottomVal = readInputNumber('depth_5');
  const smallLinerBottomVal = readInputNumber('depth_small');
  const tiebackBottomVal = readInputNumber('depth_tb');

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
      depth: riserDepthVal,
      use: !!el('use_riser')?.checked,
      od: riserOD
    },

    {
      role: 'conductor',
      id: conductorID,
      top: !isNaN(conductorTopInputVal) ? conductorTopInputVal : undefined,
      depth: conductorBottomVal,
      use: !!el('use_18')?.checked,
      od: conductorOD
    },
    {
      role: 'surface',
      id: surfaceID,
      top: surfaceTopFinal,
      depth: surfaceBottomVal,
      use: !!el('use_13')?.checked,
      od: surfaceOD
    },
    {
      role: 'intermediate',
      id: intermediateID,
      top: intermediateTopFinal,
      depth: intermediateBottomVal,
      use: !!el('use_9')?.checked,
      od: intermediateOD
    },
    {
      role: 'production',
      id: productionID,
      top: !isNaN(readInputNumber('depth_7_top'))
        ? readInputNumber('depth_7_top')
        : undefined,
      depth: productionBottomVal,
      use: !!el('use_7')?.checked,
      od: productionOD
    },
    {
      role: 'tieback',
      id: tiebackID,
      top: !isNaN(readInputNumber('depth_tb_top'))
        ? readInputNumber('depth_tb_top')
        : undefined,
      depth: tiebackBottomVal,
      use: !!el('use_tieback')?.checked,
      od: tiebackOD
    },
    {
      role: 'reservoir',
      id: reservoirID,
      top: !isNaN(readInputNumber('depth_5_top'))
        ? readInputNumber('depth_5_top')
        : undefined,
      depth: reservoirBottomVal,
      use: !!el('use_5')?.checked,
      od: reservoirOD
    },
    {
      role: 'small_liner',
      id: smallLinerID,
      top: !isNaN(readInputNumber('depth_small_top'))
        ? readInputNumber('depth_small_top')
        : undefined,
      depth: smallLinerBottomVal,
      use: !!el('use_small_liner')?.checked,
      od: smallLinerOD
    },
    ...(() => {
      // Handle tapered tubing: gather from tapered tubing inputs if available
      const { count, tubings } = gatherTubingInput();
      if (count > 0 && tubings.length > 0) {
        // Return array of upper_completion casings for each tubing section
        return tubings.map((tubing, idx) => ({
          role: 'upper_completion',
          id: tubing.id,
          top: tubing.top,
          depth: tubing.shoe,
          use: !!el('use_upper_completion')?.checked,
          od: tubing.od,
          lPerM: tubing.lPerM,
          _tubingIndex: idx
        }));
      }
      // Fallback to single upper_completion if no tapered tubing
      return [
        {
          role: 'upper_completion',
          id: upperCompletionID,
          top: !isNaN(readInputNumber('depth_uc_top'))
            ? readInputNumber('depth_uc_top')
            : undefined,
          depth: readInputNumber('depth_uc'),
          use: !!el('use_upper_completion')?.checked,
          od: upperCompletionOD
        }
      ];
    })(),
    {
      role: 'open_hole',
      id: openHoleID,
      top: !isNaN(readInputNumber('depth_open_top'))
        ? readInputNumber('depth_open_top')
        : undefined,
      depth: readInputNumber('depth_open'),
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
      const fromDefinitions = getCasingField(c.role, c.id, 'drift', undefined);
      if (typeof fromDefinitions !== 'undefined') {
        c.drift = fromDefinitions;
        return;
      }
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
