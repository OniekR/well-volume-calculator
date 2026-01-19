// Presets module (ES module)
// Exposes preset management functions and attaches to window.__KeinoPresets for legacy compatibility.
const PRESETS_KEY = "well_presets_v1";
const BUILTIN_PRESETS_URL = "./well-presets.json"; // served from project root (public/)

let BUILTIN_PRESETS = {};

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

async function loadBuiltinPresets() {
  // Try a few sensible locations so the module works under different local servers
  const candidates = [
    "./public/well-presets.json",
    "./well-presets.json",
    "./src/data/well-presets.json",
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        // try next candidate
        console.debug &&
          console.debug(`Presets: ${url} returned ${res.status}`);
        continue;
      }
      const payload = await res.json();
      if (payload && payload.presets && typeof payload.presets === "object") {
        BUILTIN_PRESETS = payload.presets;
      } else if (payload && typeof payload === "object") {
        BUILTIN_PRESETS = payload.presets || payload;
      }
      console.info && console.info("Loaded built-in presets from", url);
      try {
        if (
          window &&
          window.__KeinoPresets &&
          typeof window.__KeinoPresets.populatePresetsUI === "function"
        )
          window.__KeinoPresets.populatePresetsUI();
      } catch (e) {
        /* ignore */
      }
      return;
    } catch (err) {
      console.debug &&
        console.debug(
          `Presets: failed to fetch ${url}:`,
          err && err.message ? err.message : err,
        );
    }
  }
  console.warn(
    "Failed to load built-in presets from any known location:",
    candidates,
  );
  BUILTIN_PRESETS = BUILTIN_PRESETS || {};
}

function getPresetNames() {
  const stored = loadPresetsFromStorage();
  const builtInNames = Object.keys(BUILTIN_PRESETS || {}).sort();
  const storedNames = Object.keys(stored || {}).sort((a, b) =>
    stored[a] && stored[b] ? stored[a].savedAt - stored[b].savedAt : 0,
  );
  return [
    ...builtInNames,
    ...storedNames.filter((n) => !builtInNames.includes(n)),
  ];
}

function getPresetState(name) {
  const stored = loadPresetsFromStorage();
  if (stored[name]) return stored[name].state;
  if (BUILTIN_PRESETS[name]) return BUILTIN_PRESETS[name].state;
  return null;
}

function populatePresetsUI() {
  const sel = document.getElementById("preset_list");
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

function exportPresets() {
  try {
    const raw = localStorage.getItem(PRESETS_KEY) || "{}";
    const payload = {
      exported_at: new Date().toISOString(),
      presets: JSON.parse(raw),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "well-presets_export.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert(
      "Error exporting presets: " + (e && e.message ? e.message : String(e)),
    );
  }
}

function importPresetsFile(file) {
  try {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const incoming = parsed && parsed.presets ? parsed.presets : parsed;
        const existing = loadPresetsFromStorage() || {};
        const conflicts = Object.keys(incoming).filter((n) => existing[n]);
        if (conflicts.length > 0) {
          const ok = confirm(
            `Import will overwrite ${conflicts.length} existing preset(s):\n${conflicts.join(", ")}\n\nContinue and overwrite?`,
          );
          if (!ok) return;
        }
        const merged = Object.assign({}, existing, incoming);
        savePresetsToStorage(merged);
        populatePresetsUI();
        alert(`Imported ${Object.keys(incoming).length} preset(s).`);
      } catch (err) {
        alert(
          "Error importing presets: " +
            (err && err.message ? err.message : String(err)),
        );
      }
    };
    reader.onerror = () => alert("Error reading file.");
    reader.readAsText(file);
  } catch (err) {
    alert(
      "Error importing presets: " +
        (err && err.message ? err.message : String(err)),
    );
  }
}

function savePreset(name, state) {
  if (!name) return false;
  if (BUILTIN_PRESETS[name]) return false;
  const presets = loadPresetsFromStorage();
  presets[name] = { savedAt: Date.now(), state };
  savePresetsToStorage(presets);
  return true;
}

function deletePreset(name) {
  if (!name) return false;
  if (BUILTIN_PRESETS[name]) return false;
  const presets = loadPresetsFromStorage();
  if (presets[name]) {
    delete presets[name];
    savePresetsToStorage(presets);
    return true;
  }
  return false;
}

// Attach to window for backward compatibility
if (typeof window !== "undefined") {
  window.__KeinoPresets = {
    loadBuiltinPresets,
    loadPresetsFromStorage,
    savePresetsToStorage,
    getPresetNames,
    getPresetState,
    populatePresetsUI,
    exportPresets,
    importPresetsFile,
    savePreset,
    deletePreset,
  };
}

export {
  loadBuiltinPresets,
  loadPresetsFromStorage,
  savePresetsToStorage,
  getPresetNames,
  getPresetState,
  populatePresetsUI,
  exportPresets,
  importPresetsFile,
  savePreset,
  deletePreset,
};
