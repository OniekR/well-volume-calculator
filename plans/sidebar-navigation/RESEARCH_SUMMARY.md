# Volume Calculator - Sidebar Navigation Research Summary

**Date:** January 28, 2026  
**Purpose:** Comprehensive codebase research for implementing sidebar navigation feature

---

## 1. PROJECT-WIDE ANALYSIS

### 1.1 Technology Stack & Build System

**Package.json Insights:**

- **Project Type:** ES Module-based Vite application (`"type": "module"`)
- **Build Tool:** Vite 7.3.1 (modern, fast dev server with HMR)
- **Test Framework:** Vitest 4.0.17 with jsdom environment
- **Node Requirement:** >= 20.19.0
- **Key Scripts:**
  - `npm run dev` - Vite dev server (development)
  - `npm run build` - Production build
  - `npm run test` - Run Vitest tests
  - `npm run test:run` - Run tests with coverage

**Dependencies:**

- No runtime dependencies (pure vanilla JS)
- Dev dependencies: ESLint, Prettier, Husky (git hooks), Puppeteer (E2E tests)
- Code quality: lint-staged for pre-commit formatting/linting

### 1.2 HTML Structure & Layout System

**Current Layout (index.html):**

```
<html>
  <body>
    <header> (logo, nav links, theme toggle)
    <div class="container"> (max-width: 980px, 2-column grid)
      <main class="left-panel"> (form inputs)
      <div class="right-panel"> (canvas, volume table, presets)
```

**Grid System:**

- Container uses CSS Grid: `grid-template-columns: 1fr 400px`
- Left panel: flexible width for forms
- Right panel: fixed 400px for canvas and tables
- **Responsive breakpoint:** `@media (max-width: 900px)` switches to single column

**Form Structure Pattern:**

- Each casing section uses `.casing-input` wrapper
- Header: `.casing-header` (clickable, contains checkbox + h3)
- Body: `.casing-body` (collapsible content)
- Collapsed state: `.casing-input.collapsed` (hides body, changes styling)

**Key Sections in HTML:**

1. Header controls (wellhead depth, subsea toggle, hide casings button)
2. Riser section
3. Conductor (18")
4. Surface Casing (13")
5. Intermediate (9")
6. Production/Tie-back (7")
7. Reservoir Liner (5")
8. Small Liner
9. Open Hole
10. Upper Completion (tubing or drill pipe modes)
11. Point of Interest panel
12. Volume breakdown table (right panel)
13. Presets section (right panel)

### 1.3 CSS Organization & Theme System

**CSS File:** `src/css/style.css` (1752 lines)

**CSS Custom Properties (Design Tokens):**

```css
:root {
  --equinor-red: #e31b23;
  --equinor-accent: #ff3b4d;
  --uc-tubing-green: #2fa84f;
  --equinor-blue: #e9f4f8; /* page background */
  --card-bg: #ffffff;
  --surface-bg: #ffffff;
  --input-bg: #ffffff;
  --input-border: #e6e6e6;
  --text-color: #14222a;
  --muted: #6b6b6b;
  --table-bg, --table-border, --table-row-border, etc.
}
```

**Dark Theme Implementation:**

```css
[data-theme='dark'] {
  --equinor-blue: #071018; /* dark page bg */
  --card-bg: #08161b;
  --surface-bg: #0f2730;
  --input-bg: #0b222a;
  --text-color: #e6eef2;
  --muted: #90a1a8;
  --equinor-red: #ff7b80; /* lighter red for dark mode */
}
```

**Theme Toggle Mechanism:**

- Attribute on `<html>`: `data-theme="dark"`
- Stored in localStorage: `keino_theme`
- Toggle element: `#theme_toggle` (checkbox in header)
- Label updates: "Dark mode" ↔ "Light mode"

**Responsive Breakpoints:**

```css
@media (max-width: 900px) {
  /* Single column layout */
}
@media (max-width: 768px) {
  /* Tablet adjustments */
}
@media (max-width: 720px) {
  /* Three-cols becomes single */
}
@media (max-width: 600px) {
  /* Mobile tweaks */
}
@media (max-width: 480px) {
  /* Small mobile */
}
@media (min-width: 640px) {
  /* Desktop presets layout */
}
```

**Component CSS Patterns:**

_Buttons:_

```css
.default-top-btn,
.wellhead-btn,
.liner-default-btn,
.reservoir-default-btn {
  background: var(--surface-bg);
  border: 1px solid var(--input-border);
  padding: 6px 10px;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}

/* Active state */
.casing-btn.active,
.liner-default-btn.active {
  background: linear-gradient(90deg, var(--equinor-red), var(--equinor-accent));
  color: #fff;
  box-shadow: 0 6px 18px rgba(227, 27, 35, 0.12);
}
```

_Toggle Switches:_

```css
.switch {
  width: 44px;
  height: 24px;
}
.slider {
  /* rounded slider background */
}
.slider:before {
  /* white toggle ball */
}
.switch input:checked + .slider {
  background-color: var(--equinor-red);
}
.switch input:checked + .slider:before {
  transform: translateX(20px);
}
```

_Inputs/Selects:_

```css
input,
select {
  padding: 10px 12px;
  border: 1.5px solid var(--input-border);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-color);
  transition: all 0.2s ease;
}
input:focus,
select:focus {
  border-color: var(--equinor-red);
  box-shadow: 0 0 0 3px rgba(227, 27, 35, 0.15);
}
```

_Tables:_

```css
.volume-table {
  border-collapse: collapse;
  background: var(--table-bg);
  border: 1px solid var(--table-border);
  table-layout: fixed;
}
.volume-table thead th {
  background: var(--table-header-bg); /* gradient */
  font-weight: 700;
}
.volume-table tbody tr:hover {
  background: var(--table-row-hover);
}
```

**Utility Classes:**

```css
.hidden {
  display: none !important;
}
.visually-hidden {
  /* accessible hide */
}
.small-note {
  font-size: 0.75rem;
  color: var(--muted);
}
.warning-note {
  background: rgba(227, 27, 35, 0.06);
  color: #7a0a0a;
}
.readonly-input {
  background: #f5f5f5;
  cursor: not-allowed;
}
```

**Naming Convention:**

- BEM-inspired: `.casing-input`, `.casing-header`, `.casing-body`
- Utility modifiers: `.input-inline`, `.input-inline--narrow`
- State classes: `.active`, `.collapsed`, `.hidden`

---

## 2. CODE PATTERNS LIBRARY

### 2.1 Module Structure & Exports

**ES Module Pattern:**

```javascript
// Module: src/js/dom.js
export const el = (id) => document.getElementById(id);
export const qs = (sel) => Array.from(document.querySelectorAll(sel));
export function setAttr(elm, name, val) {
  /* ... */
}
export function toggleClass(elm, cls, condition) {
  /* ... */
}
```

**Module Organization:**

- `dom.js` - DOM query helpers (el, qs, setAttr, toggleClass)
- `state.js` - State capture/apply (captureStateObject, applyStateObject)
- `storage.js` - localStorage wrapper (saveState, loadState)
- `persistence.js` - Auto-save factory (createPersistence)
- `inputs.js` - Gather form inputs (gatherInputs)
- `logic.js` - Volume calculations (computeVolumes)
- `render.js` - Update DOM with results (renderResults)
- `draw.js` - Canvas drawing (initDraw, scheduleDraw)
- `ui.js` - Event handlers & UI behaviors (initUI, setup functions)
- `presets.js` - Preset management (attached to window.\_\_KeinoPresets)
- `presets-ui.js` - Preset UI wiring (setupPresetsUI)
- `validation.js` - Input validation helpers
- `constants.js` - Lookup tables (OD, DRIFT, TJ, SIZE_LABELS)
- `drillpipe.js` - Drill pipe specific logic

### 2.2 Initialization Pattern (script.js)

**Main Initialization Flow:**

```javascript
// src/js/script.js
const VolumeCalc = (() => {
  const el = (id) => document.getElementById(id);
  const qs = (selector) => Array.from(document.querySelectorAll(selector));

  let currentPresetName = '';
  let persistence = null;

  function calculateVolume() {
    const { casingsInput, plugEnabled, plugDepthVal, ... } = gatherInputs();
    const dpInput = gatherDrillPipeInput();
    const result = computeVolumes(casingsInput, { plugEnabled, ... });
    renderResults(result, { ucEnabled, dpMode, ucBottom });
    scheduleDraw(casingsToDraw, { showWater, waterDepth, plugDepth, ... });
  }

  function init() {
    persistence = createPersistence({ captureStateObject });
    const { scheduleSave, loadState } = persistence;

    initDraw(canvas);
    initUI({ calculateVolume, scheduleSave, captureStateObject, applyStateObject, initDraw });
    loadState({ applyStateObject, calculateVolume, scheduleSave });
    setupPresetsUI({ captureStateObject, applyStateObject, onPresetApplied, onPresetSaved });

    calculateVolume();
    scheduleSave();
  }

  return { init, calculateVolume, saveState };
})();

VolumeCalc.init();
```

**Key Patterns:**

1. **IIFE Module Pattern** - Encapsulates state and exposes minimal API
2. **Dependency Injection** - Pass helpers to init functions via deps object
3. **Lazy Initialization** - Components init in specific order
4. **Centralized Calculate** - Single calculateVolume() triggers all updates

### 2.3 Event Handling Patterns

**Event Delegation (form-level):**

```javascript
export function setupEventDelegation(deps) {
  const { calculateVolume, scheduleSave } = deps;
  const form = el('well-form') || document.body;

  form.addEventListener('input', (e) => {
    if (!e.target) return;
    if (e.target.matches('input, select')) {
      calculateVolume();
      scheduleSave();
    }
  });

  form.addEventListener('change', (e) => {
    if (e.target && e.target.matches('input, select')) {
      calculateVolume();
      scheduleSave();
    }
  });
}
```

**Section Toggle Pattern:**

```javascript
export function setupCasingToggles(deps) {
  const { calculateVolume, scheduleSave } = deps;

  qs('.casing-input').forEach((section) => {
    const checkbox = section.querySelector('.use-checkbox');
    const header = section.querySelector('.casing-header');

    const update = () => {
      if (checkbox.checked) {
        section.classList.remove('collapsed');
        header.setAttribute('aria-expanded', 'true');
      } else {
        section.classList.add('collapsed');
        header.setAttribute('aria-expanded', 'false');
      }
    };

    checkbox.addEventListener('change', () => {
      update();
      calculateVolume();
      scheduleSave();
    });

    header.addEventListener('click', (e) => {
      if (e.target.closest('.header-inline')) return; // ignore inline controls
      if (e.target.tagName.toLowerCase() === 'h3') {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    update(); // initial state
  });
}
```

**Button Array Pattern:**

```javascript
qs('.wellhead-btn').forEach((btn) =>
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const input = el(targetId);
    const wellhead = el('wellhead_depth');
    if (!input || !wellhead || wellhead.value === '') return;
    input.value = wellhead.value;
    scheduleSave();
    calculateVolume();
  })
);
```

**Async Dynamic Import Pattern (Drill Pipe):**

```javascript
function setupDrillPipeMode(deps) {
  const { calculateVolume, scheduleSave } = deps;

  (async () => {
    const drillpipeModule = await import('./drillpipe.js');
    const { renderDrillPipeInputs, updateDrillPipeDepthDisplays } =
      drillpipeModule;

    modeToggle.addEventListener('change', () => {
      const isDP = modeToggle.checked;
      if (isDP) {
        renderDrillPipeInputs(count);
        updateDrillPipeDepthDisplays();
        attachDrillPipeListeners();
      }
      calculateVolume();
      scheduleSave();
    });
  })();
}
```

### 2.4 DOM Manipulation Patterns

**Safe Element Query:**

```javascript
const el = (id) => document.getElementById(id);
const someEl = el('some_id');
if (!someEl) return; // defensive check

// Or with optional chaining
someEl?.classList.add('active');
```

**Class Toggle Pattern:**

```javascript
// Simple
element.classList.toggle('active', condition);
element.classList.add('hidden');
element.classList.remove('hidden');

// With helper
export function toggleClass(elm, cls, condition) {
  if (!elm) return;
  if (condition) elm.classList.add(cls);
  else elm.classList.remove(cls);
}
```

**Attribute Management:**

```javascript
element.setAttribute('aria-expanded', 'true');
element.setAttribute('aria-pressed', 'true');
element.removeAttribute('disabled');

// Helper version
export function setAttr(elm, name, val) {
  if (!elm) return;
  elm.setAttribute(name, val);
}
```

**Dynamic Content Creation:**

```javascript
// Create and append warning
function showUpperCompletionWarning(role, what, ucValue, driftVal) {
  const sec = el('upper_completion_section');
  if (!sec) return;

  let warning = el('upper_completion_fit_warning');
  if (!warning) {
    warning = document.createElement('div');
    warning.id = 'upper_completion_fit_warning';
    warning.className = 'small-note warning';
    warning.setAttribute('aria-live', 'polite');
    sec.appendChild(warning);
  }

  warning.textContent = `Warning: Upper completion ${what} exceeds ${role} drift.`;
}

// Remove element
function removeUpperCompletionWarning() {
  const warning = el('upper_completion_fit_warning');
  if (warning && warning.parentNode) warning.parentNode.removeChild(warning);
}
```

### 2.5 State Management Patterns

**State Capture:**

```javascript
export function captureStateObject(getInputsFn) {
  if (typeof getInputsFn === 'function') return getInputsFn();

  const state = {};
  qs('input[id], select[id]').forEach((input) => {
    if (!input.id) return;
    if (input.type === 'checkbox')
      state[input.id] = { type: 'checkbox', value: !!input.checked };
    else
      state[input.id] = {
        type: input.tagName.toLowerCase(),
        value: input.value
      };
  });
  return state;
}
```

**State Application:**

```javascript
export function applyStateObject(state, callbacks = {}) {
  if (!state) return;
  const { calculateVolume = () => {}, scheduleSave = () => {} } = callbacks;

  // Populate fields
  Object.entries(state).forEach(([id, item]) => {
    // Skip reserved UI controls
    if (new Set(['preset_name', 'preset_list', 'import_presets_input']).has(id))
      return;

    const input = el(id);
    if (!input) return;

    try {
      if (item.type === 'checkbox') input.checked = !!item.value;
      else input.value = item.value;
    } catch (e) {
      /* ignore invalid values */
    }
  });

  // Clear preset name field after loading
  const presetNameEl = el('preset_name');
  if (presetNameEl) presetNameEl.value = '';

  // ... special handling for drill pipe, casing groups, etc.
}
```

**Persistence Factory:**

```javascript
export function createPersistence({ captureStateObject }) {
  const STORAGE_KEY = 'keino_volume_state_v2';
  let saveTimer = null;

  function saveState() {
    try {
      const state = captureStateObject();
      storageSave(STORAGE_KEY, state);
    } catch (e) {
      /* ignore */
    }
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 200); // debounce 200ms
  }

  function loadState({ applyStateObject, calculateVolume, scheduleSave } = {}) {
    try {
      const state = storageLoad(STORAGE_KEY);
      if (!state) return;
      if (applyStateObject && typeof applyStateObject === 'function') {
        applyStateObject(state, { calculateVolume, scheduleSave });
      }
    } catch (e) {
      /* ignore */
    }
  }

  return { saveState, scheduleSave, loadState };
}
```

### 2.6 localStorage Patterns

**Storage Wrapper:**

```javascript
// src/js/storage.js
export const PRESETS_KEY = 'well_presets_v1';

export function saveState(key, obj) {
  try {
    localStorage.setItem(key, JSON.stringify(obj));
  } catch (e) {
    /* ignore */
  }
}

export function loadState(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
```

**Usage Pattern:**

```javascript
import { saveState, loadState } from './storage.js';

const state = loadState('keino_volume_state_v2');
if (state) applyStateObject(state);

saveState('keino_volume_state_v2', captureStateObject());
```

**Theme Persistence:**

```javascript
localStorage.setItem('keino_theme', 'dark');
const storedTheme = localStorage.getItem('keino_theme');
```

### 2.7 Naming Conventions

**JavaScript:**

- **Functions:** camelCase (`calculateVolume`, `gatherInputs`, `setupThemeToggle`)
- **Constants:** UPPER_SNAKE_CASE (`DRIFT`, `OD`, `TJ`, `STORAGE_KEY`)
- **Variables:** camelCase (`currentPresetName`, `ucEnabled`, `dpInput`)
- **Private/internal:** Leading underscore (`_el`, `_scheduleSave`, `_loadState`)
- **DOM elements:** Descriptive names (`toggle`, `labelEl`, `drillpipeSection`)
- **Event handlers:** `setup*` prefix (`setupEventDelegation`, `setupCasingToggles`)
- **Init functions:** `init*` prefix (`initUI`, `initDraw`, `initUpperCompletionChecks`)

**CSS Classes:**

- **Components:** `.casing-input`, `.volume-table`, `.plug-panel`
- **Modifiers:** `--narrow`, `--wide`, `--tubing` (BEM-like double dash)
- **States:** `.active`, `.collapsed`, `.hidden`, `.readonly-input`
- **Utilities:** `.small-note`, `.warning-note`, `.visually-hidden`
- **Layout:** `.container`, `.left-panel`, `.right-panel`, `.input-row`

**HTML IDs:**

- **Form fields:** Descriptive with underscores (`wellhead_depth`, `depth_7_top`, `production_size_id`)
- **Containers:** Descriptive (`upper_completion_section`, `drillpipe_inputs_container`)
- **Controls:** Action-based (`theme_toggle`, `save_preset_btn`, `toggle_hide_casings_btn`)

---

## 3. UI/UX PATTERNS

### 3.1 Current Navigation/Controls

**Header Navigation:**

```html
<header>
  <div class="headerWrapper">
    <div>
      <a href="#"><img class="firmalogo" /></a>
    </div>
    <nav>
      <div class="linker">
        <a class="nav-link" href="https://oniekr.github.io/">Home</a>
        <a class="nav-link" href="...">Volume / pressure</a>
      </div>
      <div class="header-controls">
        <span id="theme_label">Dark mode</span>
        <label class="switch">
          <input id="theme_toggle" type="checkbox" />
          <span class="slider"></span>
        </label>
      </div>
    </nav>
  </div>
</header>
```

**Form Controls Organization:**

1. Top of form: Well type toggle, Wellhead depth, "Hide casings" button
2. Casing sections: Each has checkbox + collapsible body
3. Point of Interest: Toggle + panel with depth input and volume displays
4. Right panel: Canvas, Volume breakdown table, Presets (save/load/export/import)

### 3.2 Button Styling Patterns

**Primary Action (Save preset):**

```css
background: linear-gradient(90deg, var(--equinor-red), var(--equinor-accent));
color: #fff;
border: none;
box-shadow: 0 6px 18px rgba(227, 27, 35, 0.12);
```

**Secondary Action (Load, Delete):**

```css
background: var(--surface-bg);
border: 1px solid var(--input-border);
color: var(--text-color);
```

**Active State (Toggle buttons):**

```css
.casing-btn.active {
  background: linear-gradient(90deg, var(--equinor-red), var(--equinor-accent));
  color: #fff;
  box-shadow: 0 6px 18px rgba(227, 27, 35, 0.12);
}
```

**Hover Effects:**

```css
button:hover {
  background: var(--card-bg);
}
button:active {
  transform: translateY(1px);
}
```

**Focus States:**

```css
button:focus {
  outline: 3px solid rgba(227, 27, 35, 0.12);
  outline-offset: 2px;
}
```

### 3.3 Responsive Design Implementation

**Mobile-First Approach:**

- Base styles for mobile
- Media queries add complexity for larger screens

**Container Responsiveness:**

```css
.container {
  grid-template-columns: 1fr 400px; /* Desktop: 2 columns */
}

@media (max-width: 900px) {
  .container {
    grid-template-columns: 1fr; /* Mobile: single column */
  }
}
```

**Input Layout Responsiveness:**

```css
.input-row.three-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Desktop */
}

@media (max-width: 720px) {
  .input-row.three-cols {
    grid-template-columns: 1fr; /* Mobile: stack vertically */
  }
}
```

**Touch Target Sizing:**

- Buttons: `padding: 10px 12px` (minimum ~44px height)
- Inputs: `padding: 10px 12px` (minimum ~44px height)
- Checkboxes: `width: 20px; height: 20px`

### 3.4 Theme Toggle Implementation

**Theme Toggle UI Flow:**

1. User clicks checkbox → `change` event fires
2. Handler checks `toggle.checked`
3. If checked: Set `data-theme="dark"` on `<html>`, save `'dark'` to localStorage
4. If unchecked: Remove attribute, save `'light'` to localStorage
5. Update label text: "Dark mode" ↔ "Light mode"

**Theme Application Code:**

```javascript
export function setupThemeToggle() {
  const toggle = el('theme_toggle');
  const labelEl = el('theme_label');

  const apply = (mode) => {
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      toggle.checked = true;
      labelEl.textContent = 'Light mode';
    } else {
      document.documentElement.removeAttribute('data-theme');
      toggle.checked = false;
      labelEl.textContent = 'Dark mode';
    }
  };

  // Load from localStorage on init
  const stored = localStorage.getItem('keino_theme');
  apply(stored === 'dark' ? 'dark' : 'light');

  // Listen for changes
  toggle.addEventListener('change', () => {
    const next = toggle.checked ? 'dark' : 'light';
    apply(next);
    localStorage.setItem('keino_theme', next);
  });
}
```

**Dark Mode Color Strategy:**

- Background: Dark blue/gray tones (`#071018`, `#08161b`, `#0f2730`)
- Text: Light gray (`#e6eef2`)
- Borders: Low-opacity white (`rgba(255, 255, 255, 0.06)`)
- Accent: Lighter red for better contrast (`#ff7b80` instead of `#e31b23`)

### 3.5 Form & Section Organization

**Collapsible Section Pattern:**

```html
<div class="casing-input">
  <div class="casing-header">
    <input type="checkbox" class="use-checkbox" id="use_13" checked />
    <h3>Surface Casing</h3>
  </div>
  <div class="casing-body">
    <!-- Inputs here -->
  </div>
</div>
```

**Section States:**

- `.casing-input` - Default (expanded)
- `.casing-input.collapsed` - Collapsed (body hidden, compact header)
- Checkbox unchecked → auto-collapse
- Click on h3 → toggle checkbox

**Inline Header Controls:**

```html
<div class="casing-header">
  <input type="checkbox" class="use-checkbox" id="use_7" checked />
  <h3>Production Casing/liner</h3>
  <label class="header-inline inline-checkbox">
    <input type="checkbox" id="production_is_liner" />
    Tie-back
  </label>
</div>
```

---

## 4. ARCHITECTURE DOCUMENTATION

### 4.1 Module Dependencies Map

```
script.js (entry point)
├─ imports from:
│  ├─ logic.js (computeVolumes, computeUpperCompletionBreakdown)
│  ├─ draw.js (initDraw, scheduleDraw)
│  ├─ state.js (captureStateObject, applyStateObject)
│  ├─ ui.js (initUI)
│  ├─ inputs.js (gatherInputs)
│  ├─ render.js (renderResults, renderUpperCompletionBreakdown)
│  ├─ presets-ui.js (setupPresetsUI)
│  ├─ persistence.js (createPersistence)
│  └─ drillpipe.js (gatherDrillPipeInput, computeDrillPipeBreakdown)
│
ui.js
├─ imports from:
│  ├─ dom.js (el, qs)
│  ├─ validation.js (getUpperCompletionTJ)
│  ├─ constants.js (DRIFT, OD, TJ)
│  └─ drillpipe.js (async import for renderDrillPipeInputs)
│
persistence.js
├─ imports from:
│  └─ storage.js (saveState, loadState)
│
presets-ui.js
├─ imports from:
│  ├─ dom.js (el)
│  └─ relies on: window.__KeinoPresets (from presets.js)
│
presets.js (standalone, attached to window)
├─ imports from:
│  └─ storage.js (saveState, loadState, PRESETS_KEY)
│
render.js
├─ imports from:
│  ├─ dom.js (el, qs, toggleClass)
│  └─ constants.js (SIZE_LABELS)
│
draw.js
├─ imports from:
│  ├─ constants.js (OD)
│  └─ uses: requestAnimationFrame, canvas 2D context
│
logic.js
├─ imports from:
│  └─ constants.js (OD, DRIFT)
│
inputs.js
├─ imports from:
│  └─ constants.js (OD, DRIFT)
│
validation.js
├─ imports from:
│  └─ constants.js (TJ)
│
drillpipe.js
├─ imports from:
│  ├─ dom.js (el)
│  ├─ constants.js (OD)
│  └─ logic.js (computeVolumes)
```

**Key Dependency Insights:**

- `dom.js` is a leaf (no imports) - widely used utility
- `constants.js` is a leaf - data store
- `storage.js` is a leaf - localStorage wrapper
- `script.js` orchestrates everything
- `ui.js` is the main event handler hub
- Circular dependencies: None (good architecture)

### 4.2 Initialization Flow

**Sequence Diagram:**

```
1. HTML loads
2. <script type="module" src="src/js/presets.js"> executes
   └─ Presets module attaches to window.__KeinoPresets
3. <script type="module" src="src/js/script.js"> executes
   └─ VolumeCalc.init() called immediately
      ├─ persistence = createPersistence({ captureStateObject })
      ├─ initDraw(canvas) - set up canvas sizing, DPR, RAF loop
      ├─ initUI({ calculateVolume, scheduleSave, ... })
      │  ├─ setupEventDelegation() - form input/change listeners
      │  ├─ setupCasingToggles() - collapse/expand sections
      │  ├─ setupButtons() - wellhead, default, liner buttons
      │  ├─ setupTooltips() - info tooltips
      │  ├─ setupHideCasingsToggle() - hide all casings button
      │  ├─ setupSizeIdInputs() - size dropdown + ID input sync
      │  ├─ initUpperCompletionChecks() - drift fit warnings
      │  ├─ setupWellheadSync() - sync wellhead with riser
      │  ├─ setupTiebackBehavior() - production liner toggle
      │  ├─ setupProductionToggleButtons() - casing/liner buttons
      │  ├─ setupRiserTypeHandler() - riser type dropdown
      │  ├─ setupRiserPositionToggle() - subsea toggle
      │  ├─ setupEodToggle() - "Subtract DP steel" toggle
      │  ├─ setupPlugToggle() - POI checkbox
      │  ├─ setupDrillPipeMode() - tubing vs drill pipe toggle
      │  ├─ setupNavActive() - highlight active nav links
      │  └─ setupThemeToggle() - dark mode toggle
      ├─ loadState({ applyStateObject, calculateVolume, scheduleSave })
      │  └─ Restores persisted inputs from localStorage
      ├─ setupPresetsUI({ captureStateObject, applyStateObject, ... })
      │  └─ Wire preset save/load/delete/export/import buttons
      ├─ calculateVolume() - initial calculation
      └─ scheduleSave() - persist initial state
```

### 4.3 Settings & Preferences Persistence

**Persisted Data:**

1. **Form State:** `keino_volume_state_v2`

   - All input values (casings, depths, sizes)
   - Checkbox states (use_riser, use_7, production_is_liner, etc.)
   - Toggle states (riser_subsea, uc_mode_toggle, subtract_eod_toggle)
   - Drill pipe inputs (drillpipe*count, drillpipe_size*_, drillpipe*length*_)

2. **Theme:** `keino_theme`

   - Values: `'light'` or `'dark'`

3. **Presets:** `well_presets_v1`
   - User-saved presets (name → state object)
   - Built-in presets loaded from `public/well-presets.json` (read-only)

**Persistence Timing:**

- **Debounced Save:** 200ms delay after any input change
- **Immediate Load:** On page load (before first calculation)
- **Theme:** Applied immediately on toggle, no debounce

**Storage Structure:**

```javascript
// keino_volume_state_v2
{
  "wellhead_depth": { "type": "input", "value": "1500" },
  "use_13": { "type": "checkbox", "value": true },
  "depth_13": { "type": "input", "value": "2000" },
  // ... all fields
}

// keino_theme
"dark"

// well_presets_v1
{
  "North Sea P15": { /* state object */ },
  "Gulf of Mexico": { /* state object */ },
  // ...
}
```

### 4.4 Testing Setup

**Vitest Configuration (`vitest.config.js`):**

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js']
  }
});
```

**Setup File (`vitest.setup.js`):**

- Suppresses console noise (log, debug, info)
- Polyfills `HTMLFormElement.prototype.requestSubmit()`
- Allows debug logs via `VITEST_DEBUG_LOGS=1`

**Test Patterns:**

```javascript
import { describe, it, beforeEach, expect } from 'vitest';
import { gatherInputs } from '../inputs.js';

describe('gatherInputs', () => {
  beforeEach(() => {
    document.body.innerHTML = ''; // Clean slate
  });

  it('links open hole top to deepest casing shoe', () => {
    document.body.innerHTML = `
      <input id="depth_7" value="100" />
      <input id="use_7" type="checkbox" checked />
      <input id="depth_open_top" />
    `;

    const out = gatherInputs();
    const prod = out.casingsInput.find((c) => c.role === 'production');
    expect(prod).toBeTruthy();
    expect(prod.depth).toBe(100);
  });
});
```

**Test File Organization:**

- Tests live in: `src/js/__tests__/*.test.js`
- Test file per module: `inputs.test.js`, `logic.test.js`, etc.
- Special tests: `drift-behavior.unit.test.js`, `uc-fit.unit.test.js`

**Coverage:**

- `npm run test:run` generates coverage report
- Output: `coverage/` directory with HTML report

---

## 5. SPECIFIC CODE EXAMPLES FOR SIDEBAR IMPLEMENTATION

### 5.1 Creating New Module (sidebar.js)

**Recommended Structure:**

```javascript
// src/js/sidebar.js
import { el, qs } from './dom.js';

let activeSection = 'casings'; // Track active section

export function initSidebar(deps = {}) {
  const { calculateVolume, scheduleSave } = deps;

  setupNavigationHandlers(deps);
  setupSectionToggles(deps);
  loadSidebarState();

  // Initial active state
  updateActiveNavItem(activeSection);
}

function setupNavigationHandlers(deps) {
  const navItems = qs('.sidebar-nav-item');

  navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = item.dataset.section;
      scrollToSection(sectionId);
      updateActiveNavItem(sectionId);
      saveSidebarState(sectionId);
    });
  });
}

function scrollToSection(sectionId) {
  const section = el(sectionId);
  if (!section) return;

  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateActiveNavItem(sectionId) {
  activeSection = sectionId;

  qs('.sidebar-nav-item').forEach((item) => {
    if (item.dataset.section === sectionId) {
      item.classList.add('active');
      item.setAttribute('aria-current', 'page');
    } else {
      item.classList.remove('active');
      item.removeAttribute('aria-current');
    }
  });
}

function saveSidebarState(sectionId) {
  try {
    localStorage.setItem('keino_sidebar_active', sectionId);
  } catch (e) {
    /* ignore */
  }
}

function loadSidebarState() {
  try {
    const stored = localStorage.getItem('keino_sidebar_active');
    if (stored) {
      activeSection = stored;
      updateActiveNavItem(stored);
    }
  } catch (e) {
    /* ignore */
  }
}

// Export for testing
export function _testHelpers() {
  return { updateActiveNavItem, scrollToSection };
}
```

### 5.2 HTML Structure for Sidebar

**Recommended Markup:**

```html
<div class="container">
  <!-- New sidebar column -->
  <aside class="sidebar" aria-label="Main navigation">
    <nav class="sidebar-nav">
      <h2 class="sidebar-title">Sections</h2>

      <button class="sidebar-nav-item" data-section="casings-section">
        <svg class="sidebar-icon"><!-- icon --></svg>
        <span>Casings</span>
      </button>

      <button class="sidebar-nav-item" data-section="upper_completion_section">
        <svg class="sidebar-icon"><!-- icon --></svg>
        <span>Completion/DP</span>
      </button>

      <button class="sidebar-nav-item" data-section="poi-section">
        <svg class="sidebar-icon"><!-- icon --></svg>
        <span>Point of Interest</span>
      </button>

      <h2 class="sidebar-title">Settings</h2>

      <div class="sidebar-control">
        <span>Theme</span>
        <label class="switch">
          <input id="theme_toggle" type="checkbox" />
          <span class="slider"></span>
        </label>
      </div>

      <button class="sidebar-nav-item" data-action="export">
        <svg class="sidebar-icon"><!-- icon --></svg>
        <span>Export Presets</span>
      </button>

      <button class="sidebar-nav-item" data-action="import">
        <svg class="sidebar-icon"><!-- icon --></svg>
        <span>Import Presets</span>
      </button>

      <h2 class="sidebar-title">Future Features</h2>

      <button class="sidebar-nav-item disabled">
        <svg class="sidebar-icon"><!-- icon --></svg>
        <span>Flow Velocity</span>
      </button>

      <button class="sidebar-nav-item disabled">
        <svg class="sidebar-icon"><!-- icon --></svg>
        <span>Volume Pressure</span>
      </button>
    </nav>
  </aside>

  <!-- Existing panels -->
  <main class="left-panel" id="main"><!-- form --></main>
  <div class="right-panel"><!-- canvas, tables --></div>
</div>
```

### 5.3 CSS for Sidebar

**Recommended Styles:**

```css
/* 3-column grid on desktop */
.container {
  max-width: 1280px; /* Wider to accommodate sidebar */
  grid-template-columns: 240px 1fr 400px; /* sidebar + form + right panel */
  gap: 24px;
}

.sidebar {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
  margin: 16px 0 8px 0;
}

.sidebar-title:first-child {
  margin-top: 0;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: none;
  background: transparent;
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.sidebar-nav-item:hover {
  background: var(--surface-bg);
}

.sidebar-nav-item.active {
  background: linear-gradient(90deg, var(--equinor-red), var(--equinor-accent));
  color: #fff;
  box-shadow: 0 4px 12px rgba(227, 27, 35, 0.15);
}

.sidebar-nav-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sidebar-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Mobile: bottom navigation bar */
@media (max-width: 900px) {
  .container {
    grid-template-columns: 1fr;
    padding-bottom: 80px; /* Space for bottom nav */
  }

  .sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    max-height: none;
    border-radius: 16px 16px 0 0;
    padding: 12px 16px;
    z-index: 1000;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    gap: 12px;
  }

  .sidebar-nav-item {
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    min-width: 64px;
    font-size: 0.75rem;
  }

  .sidebar-icon {
    width: 24px;
    height: 24px;
  }

  .sidebar-title {
    display: none; /* Hide section titles on mobile */
  }
}
```

### 5.4 Integration with script.js

**Updated init() function:**

```javascript
function init() {
  persistence = createPersistence({ captureStateObject });
  const { scheduleSave, loadState } = persistence;

  initDraw(canvas);
  initUI({ calculateVolume, scheduleSave, captureStateObject, applyStateObject, initDraw });

  // Add sidebar initialization
  const sidebarModule = await import('./sidebar.js');
  sidebarModule.initSidebar({ calculateVolume, scheduleSave });

  loadState({ applyStateObject, calculateVolume, scheduleSave });
  setupPresetsUI({ captureStateObject, applyStateObject, onPresetApplied, onPresetSaved });

  calculateVolume();
  scheduleSave();
}
```

---

## 6. RESPONSIVE BREAKPOINTS REFERENCE

| Breakpoint   | Width     | Layout                                         | Notes                              |
| ------------ | --------- | ---------------------------------------------- | ---------------------------------- |
| Desktop      | > 900px   | 3-column grid (sidebar + form + right panel)   | Sidebar sticky, full height        |
| Tablet       | 720-900px | 2-column grid (form + right panel), bottom nav | Sidebar becomes bottom bar         |
| Mobile       | < 720px   | Single column, bottom nav                      | Stack all panels, floating sidebar |
| Small Mobile | < 480px   | Single column, bottom nav                      | Tighter padding, smaller fonts     |

---

## 7. CONSTRAINTS & GOTCHAS

### 7.1 Known Constraints

1. **No Build-Time Transformation:**

   - Pure Vite setup, no PostCSS/Sass
   - CSS custom properties must work in all browsers
   - No CSS preprocessor features

2. **localStorage Size Limits:**

   - Typical limit: 5-10 MB
   - Current state ~10-20 KB per save
   - Presets can accumulate (user + built-in)
   - Consider cleanup for old presets

3. **Module Load Order:**

   - `presets.js` must load before `script.js` (separate script tag)
   - UI initialization must complete before loading state
   - Drill pipe inputs only exist after rendering

4. **Canvas Drawing:**

   - requestAnimationFrame-based (no immediate draw)
   - High-DPI scaling handled in draw.js
   - Drawing scheduled after calculations

5. **No Framework:**
   - Pure DOM manipulation (no Virtual DOM)
   - Manual state management
   - Event delegation for efficiency

### 7.2 Gotchas Discovered

1. **Casing Section Collapse:**

   - Checkbox state determines collapse, not just class
   - Clicking h3 toggles checkbox (event delegation)
   - Must sync `aria-expanded` attribute

2. **Dynamic Inputs (Drill Pipe):**

   - Inputs rendered after mode toggle
   - Event listeners attached after render
   - State restoration must wait for render completion

3. **Theme Toggle Duplication:**

   - Can be in header OR sidebar (not both simultaneously)
   - localStorage key is shared: `keino_theme`
   - Moving requires updating only HTML, not JS

4. **Preset Name Field:**

   - Must be cleared after loading preset (avoid accidental overwrite)
   - Built-in presets are read-only (check `dataset.builtin`)

5. **Upper Completion Fit Warnings:**

   - Only shown in tubing mode
   - Hidden when switching to drill pipe mode
   - Dynamic warning element created/removed

6. **Mobile Bottom Nav:**

   - Must not overlap with form content
   - Add bottom padding to container
   - z-index layering required

7. **Accessibility:**
   - All interactive elements need proper ARIA labels
   - Focus states required for keyboard navigation
   - Screen reader announcements for dynamic content (`aria-live`)

---

## 8. RECOMMENDATIONS FOR SIDEBAR IMPLEMENTATION

### 8.1 Architectural Recommendations

1. **Use Existing Patterns:**

   - Follow `ui.js` structure: Export `initSidebar(deps)` function
   - Use dependency injection for `calculateVolume`, `scheduleSave`
   - Import helpers from `dom.js` (el, qs)

2. **Maintain Module Separation:**

   - Create `src/js/sidebar.js` for navigation logic
   - Keep UI behaviors in `ui.js` (theme toggle stays there)
   - Coordinate in `script.js` init function

3. **Preserve Existing Functionality:**

   - Theme toggle: Move HTML only, reuse `setupThemeToggle()` from `ui.js`
   - Hide casings: Move button HTML, reuse `setupHideCasingsToggle()` from `ui.js`
   - Presets: Keep export/import in right panel OR move to sidebar (not both)

4. **State Persistence:**
   - Add `keino_sidebar_active` to localStorage (active section)
   - Add `keino_sidebar_collapsed` for future expandable sections
   - Use existing `saveState`/`loadState` pattern

### 8.2 Styling Recommendations

1. **Use CSS Custom Properties:**

   ```css
   .sidebar {
     background: var(--card-bg);
     color: var(--text-color);
     border: 1px solid var(--input-border);
   }
   ```

2. **Match Existing Component Styles:**

   - Buttons: Reuse `.default-top-btn` base styles
   - Active state: Reuse gradient from `.casing-btn.active`
   - Hover: Reuse transitions and colors

3. **Ensure Dark Mode Support:**

   - Test all sidebar styles with `data-theme="dark"`
   - Verify icon visibility in both themes
   - Check border contrast

4. **Responsive Mobile-First:**
   - Base styles: Bottom navigation bar
   - `@media (min-width: 901px)`: Desktop left sidebar
   - Smooth transitions between breakpoints

### 8.3 Icon Library Integration

**React Icons (as requested):**

- Install: `npm install react-icons`
- Import SVG paths (not React components - pure vanilla JS)
- Alternative: Use SVG sprites or inline SVG

**Suggested Icons:**

- Casings: `FiLayers` or `FaLayerGroup` (pipe layers)
- Completion/DP: `FiTool` or `GiDrill` (drilling tool)
- Point of Interest: `FiMapPin` or `GoLocation` (location marker)
- Settings: `FiSettings` (gear)
- Export: `FiDownload` (download arrow)
- Import: `FiUpload` (upload arrow)
- Flow Velocity: `FiWind` or `GiWaterDrop` (flow)
- Volume Pressure: `FiActivity` or `GiPressureCooker` (pressure gauge)
- String Lift: `FiArrowUp` (upward arrow)
- Cement: `GiConcreteBag` (cement)

**SVG Inline Example:**

```html
<svg
  class="sidebar-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
>
  <path d="M12 2l9 4.5v9L12 22l-9-6.5v-9L12 2z"></path>
  <!-- FiLayers paths -->
</svg>
```

### 8.4 Testing Strategy

1. **Unit Tests:**

   - Test `initSidebar()` initializes correctly
   - Test `updateActiveNavItem()` updates classes
   - Test `scrollToSection()` calls scrollIntoView
   - Test `saveSidebarState()` writes to localStorage

2. **Integration Tests:**

   - Test clicking nav item scrolls and updates UI
   - Test theme toggle still works from new location
   - Test hide casings button still works from new location
   - Test mobile bottom nav renders correctly

3. **Manual Testing:**

   - Test on Chrome, Firefox, Safari
   - Test on mobile devices (iOS, Android)
   - Test keyboard navigation (Tab, Enter, Arrow keys)
   - Test screen reader (NVDA, VoiceOver)
   - Test dark mode rendering

4. **Visual Regression:**
   - Screenshot desktop layout
   - Screenshot mobile layout
   - Screenshot tablet layout
   - Compare with existing layout (no regressions)

### 8.5 Implementation Priority

**Phase 1 (MVP):**

1. Create `sidebar.js` with basic navigation
2. Update HTML: Add sidebar, move theme toggle
3. Update CSS: 3-column grid, basic sidebar styles
4. Wire up in `script.js` init
5. Test desktop layout

**Phase 2 (Mobile):**

1. Add mobile bottom nav styles
2. Test on mobile devices
3. Add touch interactions
4. Test keyboard navigation

**Phase 3 (Polish):**

1. Add icons
2. Add smooth transitions
3. Add future feature buttons (disabled)
4. Add accessibility improvements
5. Performance optimization

### 8.6 Preset Dropdown Recommendation

**Option 1: Keep in Right Panel (Recommended)**

- **Pros:** Near the volume table (related functionality), doesn't clutter sidebar, well-established location
- **Cons:** Further from form inputs

**Option 2: Move to Sidebar**

- **Pros:** All controls in one place, easier to find
- **Cons:** Takes up vertical space, less room for other controls, harder to see while reviewing volumes

**Option 3: Duplicate (Not Recommended)**

- **Pros:** Maximum convenience
- **Cons:** Confusing, sync issues, maintenance burden

**My Recommendation:** Keep presets in the right panel. It's already well-positioned near the volume table and doesn't compete for sidebar space. The sidebar should focus on navigation and high-level settings (theme, export/import, hide casings).

---

## 9. ADDITIONAL NOTES

### 9.1 Future Extensibility

The sidebar architecture should support:

1. **Adding New Sections:** Simply add new `.sidebar-nav-item` buttons
2. **Collapsible Groups:** Add expand/collapse behavior to `.sidebar-title`
3. **Contextual Actions:** Show/hide sidebar items based on active section
4. **Keyboard Shortcuts:** Add data attributes for key bindings
5. **Search:** Add search input to filter sections

### 9.2 Performance Considerations

1. **Debounce Scroll Listener:** If implementing scroll-based active section detection
2. **RAF for Smooth Scroll:** Use requestAnimationFrame for custom scroll
3. **Event Delegation:** Single listener on sidebar, not per button
4. **CSS Transforms:** Use `transform` for animations (GPU-accelerated)
5. **Lazy Load Future Sections:** Only load module JS when needed

### 9.3 Accessibility Checklist

- [ ] `aria-label` on sidebar navigation
- [ ] `aria-current="page"` on active nav item
- [ ] `role="navigation"` on nav element
- [ ] Focus visible indicators on all interactive elements
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen reader announces active section changes
- [ ] Touch targets minimum 44x44 pixels
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Dark mode meets same contrast requirements

---

## 10. SUMMARY

**The Volume Calculator is a well-architected vanilla JavaScript application with:**

- Modern Vite build system (ES modules, fast dev server)
- Modular, testable code structure (13+ focused modules)
- Comprehensive state management (capture/apply pattern)
- Robust persistence (debounced localStorage saves)
- Accessible, responsive UI (mobile-first, ARIA labels)
- Comprehensive test coverage (Vitest with jsdom)
- Clean separation of concerns (logic/render/ui/state)

**Key patterns to follow for sidebar implementation:**

1. Create `src/js/sidebar.js` following `ui.js` patterns
2. Use dependency injection for shared functions
3. Move HTML elements, reuse existing JS handlers
4. Match existing CSS component patterns
5. Ensure dark mode and responsive support
6. Persist sidebar state to localStorage
7. Test thoroughly across devices and themes

**Architecture is stable and well-suited for adding sidebar navigation.**
