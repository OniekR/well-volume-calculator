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

export function renderResults(result) {
  const {
    totalVolume,
    perCasingVolumes,
    plugAboveVolume,
    plugBelowVolume,
    plugAboveTubing,
    plugBelowTubing,
    plugAboveAnnulus,
    plugBelowAnnulus,
    ucActive
  } = result;

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

  if (ucActive) {
    // Show tubing and annulus splits
    if (plugAboveEl) plugAboveEl.classList.add('hidden');
    if (plugBelowEl) plugBelowEl.classList.add('hidden');

    if (plugAboveTubingEl) {
      plugAboveTubingEl.classList.remove('hidden');
      const span = plugAboveTubingEl.querySelector('span');
      if (span) {
        span.textContent =
          typeof plugAboveTubing === 'undefined'
            ? '— m³'
            : (plugAboveTubing || 0).toFixed(2) + ' m³';
      }
    }
    if (plugBelowTubingEl) {
      plugBelowTubingEl.classList.remove('hidden');
      const span = plugBelowTubingEl.querySelector('span');
      if (span) {
        span.textContent =
          typeof plugBelowTubing === 'undefined'
            ? '— m³'
            : (plugBelowTubing || 0).toFixed(2) + ' m³';
      }
    }
    if (plugAboveAnnulusEl) {
      plugAboveAnnulusEl.classList.remove('hidden');
      const span = plugAboveAnnulusEl.querySelector('span');
      if (span) {
        span.textContent =
          typeof plugAboveAnnulus === 'undefined'
            ? '— m³'
            : (plugAboveAnnulus || 0).toFixed(2) + ' m³';
      }
    }
    if (plugBelowAnnulusEl) {
      plugBelowAnnulusEl.classList.remove('hidden');
      const span = plugBelowAnnulusEl.querySelector('span');
      if (span) {
        span.textContent =
          typeof plugBelowAnnulus === 'undefined'
            ? '— m³'
            : (plugBelowAnnulus || 0).toFixed(2) + ' m³';
      }
    }
  } else {
    // Show combined volumes
    if (plugAboveEl) {
      plugAboveEl.classList.remove('hidden');
      const span = plugAboveEl.querySelector('span');
      const value =
        typeof plugAboveVolume === 'undefined'
          ? '— m³'
          : (plugAboveVolume || 0).toFixed(2) + ' m³';
      if (span) span.textContent = value;
      else plugAboveEl.textContent = value;
    }
    if (plugBelowEl) {
      plugBelowEl.classList.remove('hidden');
      const span = plugBelowEl.querySelector('span');
      const value =
        typeof plugBelowVolume === 'undefined'
          ? '— m³'
          : (plugBelowVolume || 0).toFixed(2) + ' m³';
      if (span) span.textContent = value;
      else plugBelowEl.textContent = value;
    }

    if (plugAboveTubingEl) plugAboveTubingEl.classList.add('hidden');
    if (plugBelowTubingEl) plugBelowTubingEl.classList.add('hidden');
    if (plugAboveAnnulusEl) plugAboveAnnulusEl.classList.add('hidden');
    if (plugBelowAnnulusEl) plugBelowAnnulusEl.classList.add('hidden');
  }

  // Render per-casing volume table
  const casingVolumesTable = el('casingVolumes');
  if (!casingVolumesTable) return;
  const tbody = casingVolumesTable.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  let totals = { volume: 0, includedLength: 0 };

  perCasingVolumes.forEach((c) => {
    if (!c.use) return;
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
 * @param {Object} ucBreakdown - Result from computeUpperCompletionBreakdown()
 */
export function renderUpperCompletionBreakdown(ucBreakdown) {
  const section = el('upper-completion-breakdown');
  if (!section) return;

  if (!ucBreakdown.used) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');

  const table = el('upperCompletionVolumes');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Render section rows (single row per section, with separate columns for UC ID and annulus)
  ucBreakdown.sections.forEach((section) => {
    const tr = document.createElement('tr');

    const depthTd = document.createElement('td');
    depthTd.textContent = section.depth;
    tr.appendChild(depthTd);

    const ucIdVolTd = document.createElement('td');
    ucIdVolTd.textContent = (section.ucIdVolume || 0).toFixed(1);
    tr.appendChild(ucIdVolTd);

    const annulusVolTd = document.createElement('td');
    annulusVolTd.textContent = (section.annulusVolume || 0).toFixed(1);
    tr.appendChild(annulusVolTd);

    const lenTd = document.createElement('td');
    lenTd.textContent = (section.sectionLength || 0).toFixed(1);
    tr.appendChild(lenTd);

    const ucPerMTd = document.createElement('td');
    if (section.sectionLength > 0) {
      ucPerMTd.textContent = (
        (section.ucIdVolume / section.sectionLength) *
        1000
      ).toFixed(1);
    } else {
      ucPerMTd.textContent = '0.0';
    }
    tr.appendChild(ucPerMTd);

    const annulusPerMTd = document.createElement('td');
    if (section.sectionLength > 0) {
      annulusPerMTd.textContent = (
        (section.annulusVolume / section.sectionLength) *
        1000
      ).toFixed(1);
    } else {
      annulusPerMTd.textContent = '0.0';
    }
    tr.appendChild(annulusPerMTd);

    tbody.appendChild(tr);
  });

  // Totals row (separate totals for inside tubing and annulus)
  const totalsTr = document.createElement('tr');
  totalsTr.classList.add('totals-row');
  const totalsLabelTd = document.createElement('td');
  totalsLabelTd.textContent = 'Totals';
  totalsTr.appendChild(totalsLabelTd);

  const totalUcTd = document.createElement('td');
  const totalUcVol = ucBreakdown.ucIdVolume || 0;
  totalUcTd.textContent = totalUcVol.toFixed(1);
  totalsTr.appendChild(totalUcTd);

  const totalAnnTd = document.createElement('td');
  const totalAnnVol = ucBreakdown.annulusVolume || 0;
  totalAnnTd.textContent = totalAnnVol.toFixed(1);
  totalsTr.appendChild(totalAnnTd);

  const totalLenTd = document.createElement('td');
  const totalLen = ucBreakdown.ucIdLength || 0;
  totalLenTd.textContent = totalLen.toFixed(1);
  totalsTr.appendChild(totalLenTd);

  const totalUcPerMTd = document.createElement('td');
  if (totalLen > 0) {
    totalUcPerMTd.textContent = ((totalUcVol / totalLen) * 1000).toFixed(1);
  } else {
    totalUcPerMTd.textContent = '0.0';
  }
  totalsTr.appendChild(totalUcPerMTd);

  const totalAnnPerMTd = document.createElement('td');
  if (totalLen > 0) {
    totalAnnPerMTd.textContent = ((totalAnnVol / totalLen) * 1000).toFixed(1);
  } else {
    totalAnnPerMTd.textContent = '0.0';
  }
  totalsTr.appendChild(totalAnnPerMTd);
  tbody.appendChild(totalsTr);
}
