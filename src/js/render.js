import { el } from './dom.js';

const roleLabel = {
  riser: 'Riser',
  conductor: 'Conductor',
  surface: 'Surface',
  intermediate: 'Intermediate',
  production: 'Production',
  tieback: 'Tie-back',
  reservoir: 'Reservoir',
  small_liner: 'Small liner',
  upper_completion: 'Upper completion'
};

export function renderResults(result, opts = {}) {
  const {
    totalVolume,
    perCasingVolumes,
    plugAboveVolume,
    plugBelowVolume,
    plugAboveTubing,
    plugBelowTubing,
    plugAboveAnnulus,
    plugBelowAnnulus,
    plugAboveTubingOpenCasing,
    casingVolumeBelowTubingShoe,
    plugAboveDrillpipe,
    plugBelowDrillpipe,
    plugAboveDrillpipeAnnulus,
    plugBelowDrillpipeAnnulus,
    plugAboveDrillpipeOpenCasing,
    ucActive,
    dpMode,
    dpTotalDepth,
    plugDepthVal
  } = result;

  // Get override flags from options (ucEnabled and dpMode from caller take precedence)
  const ucEnabled = opts.ucEnabled !== undefined ? opts.ucEnabled : ucActive;
  const dpModeActive = opts.dpMode !== undefined ? opts.dpMode : dpMode;

  const totalVolumeEl = el('totalVolume');
  if (totalVolumeEl)
    totalVolumeEl.textContent = (totalVolume || 0).toFixed(2) + ' m³';

  // Update plug volumes - show UC split if active
  const plugAboveEl = el('plugAboveVolume');
  const plugBelowEl = el('plugBelowVolume');
  const plugAboveTubingEl = el('plugAboveTubing');
  const plugBelowTubingEl = el('plugBelowTubing');
  const plugAboveAnnulusEl = el('plugAboveAnnulus');
  const plugBelowAnnulusEl = el('plugBelowAnnulus');
  const plugAboveDrillpipeEl = el('plugAboveDrillpipe');
  const plugBelowDrillpipeEl = el('plugBelowDrillpipe');
  const plugAboveDrillpipeAnnulusEl = el('plugAboveDrillpipeAnnulus');
  const plugBelowDrillpipeAnnulusEl = el('plugBelowDrillpipeAnnulus');
  const plugBelowDrillpipeCrossingEl = el('plugBelowDrillpipeCrossing');
  const plugBelowDrillpipeAnnulusCrossingEl = el(
    'plugBelowDrillpipeAnnulusCrossing'
  );
  const plugAboveTubingOpenCasingEl = el('plugAboveTubingOpenCasing');
  const plugTotalBelowPOIEl = el('plugTotalBelowPOI');
  const plugTotalBelowPoiTubingEl = el('plugTotalBelowPOITubing');
  const plugTotalBelowPoiDrillpipeEl = el('plugTotalBelowPOIDrillpipe');
  const plugBelowDrillpipeNoCrossEl = el('plugBelowDrillpipeNoCross');
  const plugBelowDrillpipeAnnulusNoCrossEl = el(
    'plugBelowDrillpipeAnnulusNoCross'
  );

  // Determine if DP crosses POI (DP bottom > POI depth)
  const dpCrossesPOI =
    dpTotalDepth > 0 && plugDepthVal > 0 && dpTotalDepth > plugDepthVal;

  // Display logic:
  // - If UC is enabled AND in drill pipe mode: show drill pipe splits
  // - If UC is enabled (default tubing mode): show tubing splits
  // - If UC is NOT enabled: show combined volumes (ignore drill pipe mode flag)

  const poiElements = [
    plugAboveEl,
    plugBelowEl,
    plugAboveTubingEl,
    plugBelowTubingEl,
    plugAboveAnnulusEl,
    plugBelowAnnulusEl,
    plugAboveDrillpipeEl,
    plugBelowDrillpipeEl,
    plugAboveDrillpipeAnnulusEl,
    plugBelowDrillpipeAnnulusEl,
    plugBelowDrillpipeCrossingEl,
    plugBelowDrillpipeAnnulusCrossingEl,
    plugAboveTubingOpenCasingEl,
    plugTotalBelowPOIEl,
    plugTotalBelowPoiTubingEl,
    plugTotalBelowPoiDrillpipeEl,
    plugBelowDrillpipeNoCrossEl,
    plugBelowDrillpipeAnnulusNoCrossEl
  ];
  poiElements.forEach((element) => element?.classList.add('hidden'));

  // Helper function to set element value and show it
  const setAndShow = (el, value) => {
    if (el) {
      const span = el.querySelector('span:not(.label)');
      if (span) {
        span.textContent =
          typeof value === 'undefined'
            ? '— m³'
            : (value || 0).toFixed(2) + ' m³';
      }
      el.classList.remove('hidden');
    }
  };

  // Display logic based on mode
  if (ucEnabled && dpModeActive) {
    // Drill pipe mode
    setAndShow(plugAboveDrillpipeEl, plugAboveDrillpipe);
    setAndShow(plugAboveDrillpipeAnnulusEl, plugAboveDrillpipeAnnulus);

    if (dpCrossesPOI) {
      // DP crosses POI - show components and total
      setAndShow(plugBelowDrillpipeCrossingEl, plugBelowDrillpipe);
      setAndShow(
        plugBelowDrillpipeAnnulusCrossingEl,
        plugBelowDrillpipeAnnulus
      );
      // Show the total for drill pipe mode in dedicated element
      if (plugTotalBelowPoiDrillpipeEl) {
        const totalBelow = plugBelowVolume;
        const span =
          plugTotalBelowPoiDrillpipeEl.querySelector('span:not(.label)');
        if (span) {
          span.textContent = (totalBelow || 0).toFixed(2) + ' m³';
        }
        plugTotalBelowPoiDrillpipeEl.classList.remove('hidden');
      }
    } else {
      // DP does not cross POI
      setAndShow(plugBelowDrillpipeNoCrossEl, plugAboveDrillpipeOpenCasing);
      setAndShow(plugBelowDrillpipeAnnulusNoCrossEl, plugBelowVolume);
    }
  } else if (ucEnabled) {
    // Tubing mode
    const ucBottomVal = opts.ucBottom || 0;
    const tubingCrossesPoi =
      ucBottomVal > 0 && plugDepthVal > 0 && ucBottomVal > plugDepthVal;

    if (tubingCrossesPoi) {
      // Tubing crosses POI - show total casing volume below tubing shoe
      setAndShow(plugAboveTubingEl, plugAboveTubing);
      setAndShow(plugAboveAnnulusEl, plugAboveAnnulus);
      setAndShow(plugBelowTubingEl, plugBelowTubing);
      setAndShow(plugBelowAnnulusEl, plugBelowAnnulus);
      if (plugTotalBelowPoiTubingEl) {
        const totalBelow = casingVolumeBelowTubingShoe;
        const span =
          plugTotalBelowPoiTubingEl.querySelector('span:not(.label)');
        if (span) {
          span.textContent = (totalBelow || 0).toFixed(2) + ' m³';
        }
        plugTotalBelowPoiTubingEl.classList.remove('hidden');
      }
    } else {
      // Tubing entirely above POI - show total casing volume below tubing shoe
      setAndShow(plugAboveTubingEl, plugAboveTubing);
      setAndShow(plugAboveAnnulusEl, plugAboveAnnulus);
      setAndShow(plugAboveTubingOpenCasingEl, plugAboveTubingOpenCasing);
      setAndShow(plugTotalBelowPOIEl, casingVolumeBelowTubingShoe);
    }
  } else {
    // UC disabled - show combined volumes
    setAndShow(plugAboveEl, plugAboveVolume);
    setAndShow(plugBelowEl, plugBelowVolume);
  }

  // Render per-casing volume table
  const casingVolumesTable = el('casingVolumes');
  if (!casingVolumesTable) return;
  const tbody = casingVolumesTable.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  let totals = { volume: 0, includedLength: 0 };

  perCasingVolumes.forEach((c) => {
    // Skip upper_completion entries (they are handled separately)
    if (!c.use || c.role === 'upper_completion') return;
    const tr = document.createElement('tr');
    const nameTd = document.createElement('td');
    nameTd.textContent = roleLabel[c.role] || c.role;
    tr.appendChild(nameTd);

    const volTd = document.createElement('td');
    volTd.textContent = (c.volume || 0).toFixed(1);
    tr.appendChild(volTd);

    const lenTd = document.createElement('td');
    lenTd.textContent = (c.includedLength || 0).toFixed(1);
    tr.appendChild(lenTd);

    const perMtd = document.createElement('td');
    perMtd.textContent = ((c.perMeter_m3 || 0) * 1000).toFixed(1);
    tr.appendChild(perMtd);

    tbody.appendChild(tr);

    totals.volume += c.volume || 0;
    totals.includedLength += c.includedLength || 0;
  });

  // Update per-role physical length notes
  const noteIdMap = {
    riser: 'riser_length_note',
    conductor: 'conductor_length_note',
    surface: 'surface_length_note',
    intermediate: 'intermediate_length_note',
    production: 'production_length_note',
    tieback: 'tieback_length_note',
    reservoir: 'reservoir_length_note',
    small_liner: 'small_liner_length_note'
  };
  perCasingVolumes.forEach((c) => {
    const noteEl = el(noteIdMap[c.role]);
    if (!noteEl) return;
    if (typeof c.physicalLength !== 'undefined') {
      noteEl.textContent = `Length: ${c.physicalLength.toFixed(1)} m`;
      noteEl.classList.remove('hidden');
    } else {
      noteEl.textContent = '';
    }
  });

  // Totals row
  const totalsTr = document.createElement('tr');
  totalsTr.classList.add('totals-row');
  const totalsLabelTd = document.createElement('td');
  totalsLabelTd.textContent = 'Totals';
  totalsTr.appendChild(totalsLabelTd);
  const totalsVolTd = document.createElement('td');
  totalsVolTd.textContent = (totals.volume || 0).toFixed(1);
  totalsTr.appendChild(totalsVolTd);
  const totalsLenTd = document.createElement('td');
  totalsLenTd.textContent = (totals.includedLength || 0).toFixed(1);
  totalsTr.appendChild(totalsLenTd);
  const totalsPerMTd = document.createElement('td');
  if (totals.includedLength > 0) {
    totalsPerMTd.textContent = (
      (totals.volume / totals.includedLength) *
      1000
    ).toFixed(1);
  } else {
    totalsPerMTd.textContent = '0.0';
  }
  totalsTr.appendChild(totalsPerMTd);
  tbody.appendChild(totalsTr);
}

/**
 * Render upper completion volume breakdown table
 * Shows UC ID volumes and annulus volumes section-wise and in total
 * Can render either tubing or drill pipe breakdown
 * @param {Object} breakdown - Result from computeUpperCompletionBreakdown() or computeDrillPipeBreakdown()
 * @param {string} mode - 'tubing' or 'drillpipe'
 */
export function renderUpperCompletionBreakdown(breakdown, mode = 'tubing') {
  const section = el('upper-completion-breakdown');
  if (!section) return;

  if (!breakdown.used) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');

  // Update table title based on mode
  const titleEl = el('upper-completion-breakdown-title');
  if (titleEl) {
    titleEl.textContent =
      mode === 'drillpipe'
        ? 'Drill Pipe breakdown'
        : 'Upper Completion breakdown';
  }

  const table = el('upperCompletionVolumes');
  if (!table) return;

  // Update table headers based on mode
  const thead = table.querySelector('thead');
  if (thead && mode === 'drillpipe') {
    thead.innerHTML = `
      <tr>
        <th scope="col">Casing</th>
        <th scope="col">DP ID (m³)</th>
        <th scope="col">Annulus (m³)</th>
        <th scope="col">Length (m)</th>
        <th scope="col">DP ID (L/m)</th>
        <th scope="col">Annulus (L/m)</th>
      </tr>
    `;
  } else if (thead && mode === 'tubing') {
    thead.innerHTML = `
      <tr>
        <th scope="col">Depth (m)</th>
        <th scope="col">Tubing (m³)</th>
        <th scope="col">Annulus (m³)</th>
        <th scope="col">length (m)</th>
        <th scope="col">Tubing (L/m)</th>
        <th scope="col">Annulus (L/m)</th>
      </tr>
    `;
  }

  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Render section rows
  // For drill pipe mode, display outer casings (riser) at the top and inner (small liner) at the bottom
  const sectionsToRender =
    mode === 'drillpipe'
      ? (breakdown.sections || []).slice().reverse()
      : breakdown.sections || [];

  sectionsToRender.forEach((sec) => {
    const tr = document.createElement('tr');

    // First column: casing name (drill pipe) or depth (tubing)
    const col1Td = document.createElement('td');
    if (mode === 'drillpipe') {
      // Use the same human-friendly labels as other tables when possible
      col1Td.textContent = sec.casing
        ? roleLabel[sec.casing] || sec.casing.replace(/_/g, ' ')
        : '';
    } else {
      col1Td.textContent = sec.depth;
    }
    tr.appendChild(col1Td);

    // DP/Tubing ID volume
    const idVolTd = document.createElement('td');
    const idVol = mode === 'drillpipe' ? sec.dpIdVolume : sec.ucIdVolume;
    idVolTd.textContent = (idVol || 0).toFixed(1);
    tr.appendChild(idVolTd);

    // Annulus volume
    const annulusVolTd = document.createElement('td');
    annulusVolTd.textContent = (sec.annulusVolume || 0).toFixed(1);
    tr.appendChild(annulusVolTd);

    // Length
    const lenTd = document.createElement('td');
    const length =
      mode === 'drillpipe'
        ? sec.dpLength
        : sec.sectionLength !== undefined
        ? sec.sectionLength
        : sec.length;
    lenTd.textContent = (length || 0).toFixed(1);
    tr.appendChild(lenTd);

    // DP/Tubing ID L/m
    const idPerMTd = document.createElement('td');
    if (length > 0) {
      const idLPerM = mode === 'drillpipe' ? sec.dpLPerM : sec.ucLPerM;
      idPerMTd.textContent = (idLPerM || 0).toFixed(1);
    } else {
      idPerMTd.textContent = '0.0';
    }
    tr.appendChild(idPerMTd);

    // Annulus L/m
    const annulusPerMTd = document.createElement('td');
    if (length > 0) {
      const annLPerM =
        mode === 'drillpipe'
          ? sec.annulusLPerM
          : (sec.annulusVolume / length) * 1000;
      annulusPerMTd.textContent = (annLPerM || 0).toFixed(1);
    } else {
      annulusPerMTd.textContent = '0.0';
    }
    tr.appendChild(annulusPerMTd);

    tbody.appendChild(tr);
  });

  // Totals row
  const totalsTr = document.createElement('tr');
  totalsTr.classList.add('totals-row');
  const totalsLabelTd = document.createElement('td');
  totalsLabelTd.textContent = 'Totals';
  totalsTr.appendChild(totalsLabelTd);

  const totalIdKey = mode === 'drillpipe' ? 'dpIdVolume' : 'ucIdVolume';
  const totalIdVol = breakdown[totalIdKey] || 0;
  const totalIdTd = document.createElement('td');
  totalIdTd.textContent = totalIdVol.toFixed(1);
  totalsTr.appendChild(totalIdTd);

  const totalAnnTd = document.createElement('td');
  const totalAnnVol = breakdown.annulusVolume || 0;
  totalAnnTd.textContent = totalAnnVol.toFixed(1);
  totalsTr.appendChild(totalAnnTd);

  const totalLenKey = mode === 'drillpipe' ? 'dpIdLength' : 'ucIdLength';
  const totalLen = breakdown[totalLenKey] || 0;
  const totalLenTd = document.createElement('td');
  totalLenTd.textContent = totalLen.toFixed(1);
  totalsTr.appendChild(totalLenTd);

  const totalIdPerMTd = document.createElement('td');
  if (totalLen > 0) {
    const totalIdLPerM =
      mode === 'drillpipe'
        ? (totalIdVol / totalLen) * 1000
        : (totalIdVol / totalLen) * 1000;
    totalIdPerMTd.textContent = totalIdLPerM.toFixed(1);
  } else {
    totalIdPerMTd.textContent = '0.0';
  }
  totalsTr.appendChild(totalIdPerMTd);

  const totalAnnPerMTd = document.createElement('td');
  if (totalLen > 0) {
    totalAnnPerMTd.textContent = ((totalAnnVol / totalLen) * 1000).toFixed(1);
  } else {
    totalAnnPerMTd.textContent = '0.0';
  }
  totalsTr.appendChild(totalAnnPerMTd);
  tbody.appendChild(totalsTr);
}
