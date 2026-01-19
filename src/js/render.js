import { el } from './dom.js';

const roleLabel = {
  riser: 'Riser',
  conductor: 'Conductor',
  surface: 'Surface',
  intermediate: 'Intermediate',
  production: 'Production',
  tieback: 'Tie-back',
  reservoir: 'Reservoir',
  small_liner: 'Small liner'
};

export function renderResults(result) {
  const { totalVolume, perCasingVolumes, plugAboveVolume, plugBelowVolume } =
    result;

  const totalVolumeEl = el('totalVolume');
  if (totalVolumeEl)
    totalVolumeEl.textContent = (totalVolume || 0).toFixed(2) + ' m³';

  const plugAboveEl = el('plugAboveVolume');
  const plugBelowEl = el('plugBelowVolume');
  if (plugAboveEl)
    plugAboveEl.textContent =
      typeof plugAboveVolume === 'undefined'
        ? '— m³'
        : (plugAboveVolume || 0).toFixed(2) + ' m³';
  if (plugBelowEl)
    plugBelowEl.textContent =
      typeof plugBelowVolume === 'undefined'
        ? '— m³'
        : (plugBelowVolume || 0).toFixed(2) + ' m³';

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
