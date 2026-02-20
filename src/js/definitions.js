import { OD, DRIFT, TJ, SIZE_LABELS } from './constants.js';

const SECTION_KEYS = [
  'conductor',
  'riser',
  'surface',
  'intermediate',
  'production',
  'tieback',
  'reservoir',
  'small_liner',
  'upper_completion',
  'open_hole'
];

const DEFAULT_DRILLPIPE_CATALOG = [
  {
    name: '2 7/8"',
    id: 2.151,
    od: 2.875,
    lPerM: 2.238,
    eod: 2.059,
    ced: 4.296
  },
  {
    name: '4"',
    id: 3.34,
    od: 4.0,
    lPerM: 5.396,
    eod: 2.985,
    ced: 8.381
  },
  {
    name: '5"',
    id: 4.276,
    od: 5.0,
    lPerM: 9.021,
    eod: 4.144,
    ced: 13.167
  },
  {
    name: '5 7/8"',
    id: 5.153,
    od: 5.875,
    lPerM: 13.128,
    eod: 4.739,
    ced: 17.857
  }
];

const DEFAULT_TUBING_CATALOG = [
  {
    name: '4 1/2" 12.6# L-80',
    id: 3.958,
    od: 4.5,
    lPerM: 9.728,
    eod: 0
  },
  {
    name: '5 1/2" 17#',
    id: 4.892,
    od: 5.5,
    lPerM: 11.803,
    eod: 0
  }
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeId(value) {
  const num = Number(value);
  if (Number.isFinite(num)) return String(num);
  return String(value ?? '').trim();
}

const DISALLOWED_CASING_IDS_BY_SECTION = {
  conductor: new Set(['17.8']),
  production: new Set(['8.921', '6.276']),
  tieback: new Set(['8.921']),
  reservoir: new Set(['6.276'])
};

function isDisallowedCasingId(section, id) {
  const denied = DISALLOWED_CASING_IDS_BY_SECTION[section];
  if (!denied) return false;
  return denied.has(normalizeId(id));
}

function buildDefaultCasingBySection() {
  const map = {};
  SECTION_KEYS.forEach((section) => {
    map[section] = [];
  });

  Object.entries(OD).forEach(([section, values]) => {
    if (!map[section]) map[section] = [];
    Object.entries(values).forEach(([idRaw, od]) => {
      const id = Number(idRaw);
      const sectionLabels = SIZE_LABELS[section] || {};
      const label = sectionLabels[idRaw] || sectionLabels[id] || String(idRaw);
      
      map[section].push({
        id,
        label,
        od,
        drift:
          DRIFT && DRIFT[section] && typeof DRIFT[section][idRaw] !== 'undefined'
            ? DRIFT[section][idRaw]
            : undefined,
        tj:
          TJ && TJ[section] && typeof TJ[section][idRaw] !== 'undefined'
            ? TJ[section][idRaw]
            : undefined
      });
    });
  });

  map.open_hole = [17.5, 12.25, 8.5].map((id) => ({
    id,
    label: String(id),
    od: id
  }));

  map.riser = [17.5, 8.8].map((id) => ({
    id,
    label: String(id),
    od: OD.riser && OD.riser[id] ? OD.riser[id] : id
  }));

  SECTION_KEYS.forEach((section) => {
    const seen = new Set();
    map[section] = (map[section] || []).filter((entry) => {
      const key = normalizeId(entry.id);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

  return map;
}

const defaults = {
  casingBySection: buildDefaultCasingBySection(),
  drillpipeCatalog: clone(DEFAULT_DRILLPIPE_CATALOG),
  tubingCatalog: clone(DEFAULT_TUBING_CATALOG)
};

let state = clone(defaults);

function notifyDefinitionsChanged() {
  try {
    document.dispatchEvent(new CustomEvent('keino:definitions-changed'));
  } catch (e) {
    /* ignore */
  }
}

function upsertById(list, entry) {
  const idKey = normalizeId(entry.id);
  const idx = list.findIndex((item) => normalizeId(item.id) === idKey);
  if (idx === -1) list.push(entry);
  else list[idx] = { ...list[idx], ...entry };
}

function sanitizeCasingEntry(input) {
  const id = Number(input?.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  const odRaw = Number(input?.od);
  const od = Number.isFinite(odRaw) && odRaw > 0 ? odRaw : undefined;

  const driftRaw = Number(input?.drift);
  const drift = Number.isFinite(driftRaw) && driftRaw > 0 ? driftRaw : undefined;

  const tjRaw = Number(input?.tj);
  const tj = Number.isFinite(tjRaw) && tjRaw > 0 ? tjRaw : undefined;

  const label =
    typeof input?.label === 'string' && input.label.trim()
      ? input.label.trim()
      : String(id);

  return {
    id,
    label,
    od,
    drift,
    tj
  };
}

function sanitizePipeEntry(input, includeCed = false) {
  const name =
    typeof input?.name === 'string' && input.name.trim()
      ? input.name.trim()
      : undefined;
  const id = Number(input?.id);
  const od = Number(input?.od);
  const lPerM = Number(input?.lPerM);
  const eod = Number(input?.eod);
  const ced = Number(input?.ced);

  if (!name) return null;
  if (!Number.isFinite(id) || id <= 0) return null;
  if (!Number.isFinite(od) || od <= 0) return null;
  if (!Number.isFinite(lPerM) || lPerM < 0) return null;
  if (!Number.isFinite(eod) || eod < 0) return null;
  if (includeCed && (!Number.isFinite(ced) || ced < 0)) return null;

  return includeCed
    ? { name, id, od, lPerM, eod, ced }
    : { name, id, od, lPerM, eod };
}

export function getDefinitionSnapshot() {
  return clone(state);
}

export function applyDefinitionSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return;
  const next = clone(defaults);

  if (snapshot.casingBySection && typeof snapshot.casingBySection === 'object') {
    Object.entries(snapshot.casingBySection).forEach(([section, entries]) => {
      if (!Array.isArray(entries)) return;
      if (!next.casingBySection[section]) next.casingBySection[section] = [];
      const sectionLabels = SIZE_LABELS[section] || {};
      next.casingBySection[section] = entries
        .map((entry) => sanitizeCasingEntry(entry))
        .filter((entry) => entry && !isDisallowedCasingId(section, entry.id))
        .map((entry) => {
          const labelFromMap = sectionLabels[String(entry.id)] || sectionLabels[entry.id];
          if (labelFromMap && (!entry.label || entry.label === String(entry.id))) {
            entry.label = labelFromMap;
          }
          return entry;
        });
    });
  }

  if (Array.isArray(snapshot.drillpipeCatalog)) {
    const parsed = snapshot.drillpipeCatalog
      .map((entry) => sanitizePipeEntry(entry, true))
      .filter(Boolean);
    if (parsed.length) next.drillpipeCatalog = parsed;
  }

  if (Array.isArray(snapshot.tubingCatalog)) {
    const parsed = snapshot.tubingCatalog
      .map((entry) => sanitizePipeEntry(entry, false))
      .filter(Boolean);
    if (parsed.length) next.tubingCatalog = parsed;
  }

  state = next;
  notifyDefinitionsChanged();
}

export function resetDefinitionsToDefaults() {
  state = clone(defaults);
  notifyDefinitionsChanged();
}

export function registerCasingOptionLabels(section, options) {
  if (!state.casingBySection[section] || !Array.isArray(options)) return;
  options.forEach((opt) => {
    const id = Number(opt?.id);
    if (!Number.isFinite(id) || id <= 0) return;
    if (isDisallowedCasingId(section, id)) return;
    const existing = state.casingBySection[section].find(
      (item) => normalizeId(item.id) === normalizeId(id)
    );
    if (!existing) {
      state.casingBySection[section].push({
        id,
        label: opt.label || String(id),
        od: Number.isFinite(Number(opt.od)) ? Number(opt.od) : undefined,
        drift:
          Number.isFinite(Number(opt.drift)) && Number(opt.drift) > 0
            ? Number(opt.drift)
            : undefined,
        tj:
          Number.isFinite(Number(opt.tj)) && Number(opt.tj) > 0
            ? Number(opt.tj)
            : undefined
      });
      return;
    }
    if (opt.label && opt.label.trim()) existing.label = opt.label.trim();
    if (
      Number.isFinite(Number(opt.od)) &&
      Number(opt.od) > 0 &&
      typeof existing.od === 'undefined'
    )
      existing.od = Number(opt.od);
  });
}

export function getCasingDefinitions(section) {
  const sectionLabels = SIZE_LABELS[section] || {};
  return clone((state.casingBySection[section] || [])
    .filter((entry) => !isDisallowedCasingId(section, entry.id))
    .map((entry) => {
      const labelFromMap = sectionLabels[String(entry.id)] || sectionLabels[entry.id];
      if (labelFromMap && (!entry.label || entry.label === String(entry.id))) {
        return { ...entry, label: labelFromMap };
      }
      return entry;
    }));
}

export function getCasingDefinition(section, id) {
  if (isDisallowedCasingId(section, id)) return null;
  const list = state.casingBySection[section] || [];
  return clone(
    list.find((entry) => normalizeId(entry.id) === normalizeId(id)) || null
  );
}

export function setCasingDefinition(section, id, patch = {}) {
  if (!section || !state.casingBySection[section]) return false;
  if (isDisallowedCasingId(section, id)) return false;
  const current = getCasingDefinition(section, id);
  const base = current || { id: Number(id), label: String(id) };
  const next = sanitizeCasingEntry({ ...base, ...patch, id });
  if (!next) return false;
  upsertById(state.casingBySection[section], next);
  notifyDefinitionsChanged();
  return true;
}

export function addManualCasingDefinition(section, payload) {
  if (!section || !state.casingBySection[section]) return false;
  const parsed = sanitizeCasingEntry(payload);
  if (!parsed) return false;
  if (isDisallowedCasingId(section, parsed.id)) return false;
  if (!Number.isFinite(parsed.od) || parsed.od <= 0) {
    parsed.od = Number(parsed.id) + 1;
  }
  upsertById(state.casingBySection[section], parsed);
  notifyDefinitionsChanged();
  return true;
}

export function getCasingField(section, id, field, fallback = undefined) {
  const definition = getCasingDefinition(section, id);
  if (!definition) return fallback;
  const value = definition[field];
  return typeof value === 'undefined' ? fallback : value;
}

export function getDrillpipeCatalog() {
  return clone(state.drillpipeCatalog);
}

export function setDrillpipeEntry(index, patch = {}) {
  const idx = Number(index);
  if (!Number.isInteger(idx) || idx < 0 || idx >= state.drillpipeCatalog.length)
    return false;
  const next = sanitizePipeEntry(
    {
      ...state.drillpipeCatalog[idx],
      ...patch
    },
    true
  );
  if (!next) return false;
  state.drillpipeCatalog[idx] = next;
  notifyDefinitionsChanged();
  return true;
}

export function getTubingCatalog() {
  return clone(state.tubingCatalog);
}

export function setTubingEntry(index, patch = {}) {
  const idx = Number(index);
  if (!Number.isInteger(idx) || idx < 0 || idx >= state.tubingCatalog.length)
    return false;
  const next = sanitizePipeEntry(
    {
      ...state.tubingCatalog[idx],
      ...patch
    },
    false
  );
  if (!next) return false;
  state.tubingCatalog[idx] = next;
  notifyDefinitionsChanged();
  return true;
}

export function addManualTubingDefinition(payload) {
  const parsed = sanitizePipeEntry(payload, false);
  if (!parsed) return false;
  state.tubingCatalog.push(parsed);
  notifyDefinitionsChanged();
  return true;
}

export function isCasingManual(section, id) {
  if (!section) return false;
  const normalizedId = normalizeId(id);
  const builtInIds = OD[section]
    ? Object.keys(OD[section]).map((key) => normalizeId(key))
    : [];
  return !builtInIds.includes(normalizedId);
}

export function isTubingManual(index) {
  const idx = Number(index);
  return (
    Number.isInteger(idx) &&
    idx >= 0 &&
    idx >= DEFAULT_TUBING_CATALOG.length
  );
}

export function isDrillpipeManual(index) {
  const idx = Number(index);
  return (
    Number.isInteger(idx) &&
    idx >= 0 &&
    idx >= DEFAULT_DRILLPIPE_CATALOG.length
  );
}

export function deleteCasingDefinition(section, id) {
  if (!section || !state.casingBySection[section]) return false;
  if (!isCasingManual(section, id)) {
    console.warn('Cannot delete built-in casing definition');
    return false;
  }
  const normalizedId = normalizeId(id);
  const list = state.casingBySection[section];
  const index = list.findIndex(
    (entry) => normalizeId(entry.id) === normalizedId
  );
  if (index === -1) return false;
  list.splice(index, 1);
  notifyDefinitionsChanged();
  return true;
}

export function deleteTubingEntry(index) {
  const idx = Number(index);
  if (!isTubingManual(idx)) {
    console.warn('Cannot delete built-in tubing entry');
    return false;
  }
  if (idx < 0 || idx >= state.tubingCatalog.length) return false;
  state.tubingCatalog.splice(idx, 1);
  notifyDefinitionsChanged();
  return true;
}

export function deleteDrillpipeEntry(index) {
  const idx = Number(index);
  if (!isDrillpipeManual(idx)) {
    console.warn('Cannot delete built-in drillpipe entry');
    return false;
  }
  if (idx < 0 || idx >= state.drillpipeCatalog.length) return false;
  state.drillpipeCatalog.splice(idx, 1);
  notifyDefinitionsChanged();
  return true;
}

export { DEFAULT_DRILLPIPE_CATALOG, DEFAULT_TUBING_CATALOG };