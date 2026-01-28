# Modular Left Sidebar Navigation - Implementation Plan

## Goal

Transform the single-page layout into a modular interface with a left sidebar navigation on desktop and bottom navigation bar on mobile, organizing features into logical sections (Casings, Completion/DP, Settings, and future features).

## Prerequisites

- [ ] Ensure you are on the `feature/sidebar-navigation` branch
- [ ] If branch doesn't exist, create it from main: `git checkout -b feature/sidebar-navigation`
- [ ] Ensure development server can be started: `npm run dev`

---

## Step-by-Step Instructions

### Step 1: Create Sidebar HTML Structure

#### Step 1.1: Add Sidebar Navigation to HTML

- [x] Open [index.html](index.html)
- [x] Locate the opening `<div id="app">` tag (around line 31)
- [x] Replace the app div structure to add sidebar before the form:

```html
<div id="app">
  <!-- Desktop Sidebar / Mobile Bottom Navigation -->
  <nav id="sidebar" class="sidebar" aria-label="Main navigation">
    <div class="sidebar-content">
      <!-- Main Navigation Sections -->
      <div class="sidebar-section">
        <h3 class="sidebar-section-title">Navigation</h3>
        <ul class="sidebar-nav-list">
          <li class="sidebar-nav-item">
            <button
              class="sidebar-nav-button"
              data-section="casings"
              aria-label="Casings section"
            >
              <svg
                class="sidebar-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                />
              </svg>
              <span class="sidebar-nav-text">Casings</span>
            </button>
          </li>
          <li class="sidebar-nav-item">
            <button
              class="sidebar-nav-button"
              data-section="completion"
              aria-label="Completion and drillpipe section"
            >
              <svg
                class="sidebar-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"
                />
              </svg>
              <span class="sidebar-nav-text">Completion</span>
            </button>
          </li>
          <li class="sidebar-nav-item">
            <button
              class="sidebar-nav-button"
              data-section="settings"
              aria-label="Settings section"
            >
              <svg
                class="sidebar-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
                />
              </svg>
              <span class="sidebar-nav-text">Settings</span>
            </button>
          </li>
        </ul>
      </div>

      <!-- Future Features Section -->
      <div class="sidebar-section sidebar-section-future">
        <h3 class="sidebar-section-title">Coming Soon</h3>
        <ul class="sidebar-nav-list">
          <li class="sidebar-nav-item">
            <button
              class="sidebar-nav-button"
              data-section="flow"
              aria-label="Flow velocity (coming soon)"
              disabled
            >
              <svg
                class="sidebar-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-4-4h3V9h2v4h3l-4 4z"
                />
              </svg>
              <span class="sidebar-nav-text">Flow Velocity</span>
            </button>
          </li>
          <li class="sidebar-nav-item">
            <button
              class="sidebar-nav-button"
              data-section="pressure"
              aria-label="Volume pressure calculator (coming soon)"
              disabled
            >
              <svg
                class="sidebar-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                />
              </svg>
              <span class="sidebar-nav-text">Pressure</span>
            </button>
          </li>
          <li class="sidebar-nav-item">
            <button
              class="sidebar-nav-button"
              data-section="lift"
              aria-label="String lift (coming soon)"
              disabled
            >
              <svg
                class="sidebar-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"
                />
              </svg>
              <span class="sidebar-nav-text">String Lift</span>
            </button>
          </li>
          <li class="sidebar-nav-item">
            <button
              class="sidebar-nav-button"
              data-section="cement"
              aria-label="Cement displacement (coming soon)"
              disabled
            >
              <svg
                class="sidebar-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7V7h2v10zm4 0h-2V7h2v10zm4 0h-2V7h2v10z"
                />
              </svg>
              <span class="sidebar-nav-text">Cement</span>
            </button>
          </li>
        </ul>
      </div>

      <!-- Sidebar Controls Section -->
      <div class="sidebar-section sidebar-section-controls">
        <h3 class="sidebar-section-title">Controls</h3>
        <div class="sidebar-controls">
          <!-- Hide Casings Button (will be moved here in Step 2) -->
          <div id="hide-casings-container"></div>

          <!-- POI Toggle (will be moved here in Step 2) -->
          <div id="poi-toggle-container"></div>

          <!-- Theme Toggle (will be moved here in Step 2) -->
          <div id="theme-toggle-container"></div>

          <!-- Import/Export Buttons (will be moved here in Step 2) -->
          <div id="import-export-container"></div>
        </div>
      </div>
    </div>
  </nav>

  <form id="volume-form"></form>
</div>
```

#### Step 1.2: Add Base CSS for Sidebar Layout

- [x] Open [src/css/style.css](src/css/style.css)
- [x] Find the `#app` CSS rule (around line 115-120)
- [x] Replace the #app rule with the new 3-column grid layout:

```css
#app {
  display: grid;
  grid-template-columns: 240px 1fr 1fr;
  grid-template-areas: 'sidebar form canvas';
  gap: var(--spacing-md);
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-md);
  align-items: start;
}

/* Sidebar positioning */
.sidebar {
  grid-area: sidebar;
  position: sticky;
  top: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  box-shadow: var(--box-shadow);
  max-height: calc(100vh - var(--spacing-xl));
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Form positioning */
#volume-form {
  grid-area: form;
}

/* Right panel positioning */
.canvas-container,
.results-container {
  grid-area: canvas;
}
```

#### Step 1.3: Add Sidebar Navigation Styles

- [x] Continue in [src/css/style.css](src/css/style.css)
- [x] Add these styles at the end of the file (after the last rule):

```css
/* ========================================
   SIDEBAR NAVIGATION
   ======================================== */

.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.sidebar-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin: 0;
  padding: 0 var(--spacing-sm);
}

.sidebar-nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.sidebar-nav-item {
  margin: 0;
}

.sidebar-nav-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.sidebar-nav-button:hover:not(:disabled) {
  background: var(--bg-tertiary);
}

.sidebar-nav-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.sidebar-nav-button.active {
  background: var(--bg-tertiary);
  font-weight: 600;
}

.sidebar-nav-button.active .sidebar-icon {
  color: var(--equinor-red);
}

.sidebar-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: currentColor;
  transition: color 0.2s ease;
}

.sidebar-nav-text {
  flex: 1;
}

/* Future Features Styling */
.sidebar-section-future .sidebar-nav-button {
  opacity: 0.6;
}

.sidebar-section-future .sidebar-section-title::after {
  content: ' ✨';
}

/* Sidebar Controls Section */
.sidebar-section-controls {
  margin-top: auto;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.sidebar-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.sidebar-controls button {
  width: 100%;
  justify-content: center;
}

/* Equinor Red Color Variable (if not already defined) */
:root {
  --equinor-red: #ff1243;
}

[data-theme='dark'] {
  --equinor-red: #ff1243;
}

/* ========================================
   RESPONSIVE - MOBILE BOTTOM NAV
   ======================================== */

@media (max-width: 900px) {
  #app {
    grid-template-columns: 1fr;
    grid-template-areas:
      'form'
      'canvas';
    padding-bottom: 80px; /* Space for bottom nav */
  }

  /* Hide desktop sidebar */
  .sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    max-height: none;
    border-radius: 0;
    border-top: 1px solid var(--border-color);
    padding: var(--spacing-sm);
    z-index: 1000;
    overflow-x: auto;
    overflow-y: visible;
  }

  .sidebar-content {
    flex-direction: row;
    gap: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
  }

  .sidebar-content::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }

  /* Show only main navigation on mobile */
  .sidebar-section {
    display: none;
  }

  .sidebar-section:first-child {
    display: flex;
    flex-direction: row;
  }

  .sidebar-section-title {
    display: none;
  }

  .sidebar-nav-list {
    flex-direction: row;
    gap: 0;
  }

  .sidebar-nav-button {
    flex-direction: column;
    padding: var(--spacing-xs) var(--spacing-sm);
    gap: 2px;
    min-width: 70px;
    white-space: nowrap;
  }

  .sidebar-nav-text {
    font-size: 0.7rem;
  }

  .sidebar-icon {
    width: 20px;
    height: 20px;
  }

  /* Hide controls section on mobile (they'll be accessible via Settings section) */
  .sidebar-section-controls {
    display: none;
  }
}

/* Touch target sizes for mobile */
@media (max-width: 900px) {
  .sidebar-nav-button {
    min-height: 44px;
    min-width: 44px;
  }
}
```

#### Step 1 Verification Checklist

- [x] Run `npm run dev` to start the development server
- [x] Open browser to http://localhost:5173 (or the port shown)
- [ ] **Desktop view (>900px):**
  - [x] Verify 3-column layout appears (sidebar on left, form in middle, canvas on right)
  - [x] Sidebar has "Navigation" section with 3 buttons (Casings, Completion, Settings)
  - [x] Sidebar has "Coming Soon" section with 4 greyed-out buttons
  - [x] Sidebar has empty "Controls" section with containers for future buttons
  - [ ] Sidebar is sticky when scrolling down the page
- [ ] **Mobile view (<900px):**
  - [x] Resize browser to mobile width
  - [x] Verify sidebar moves to bottom of screen as a navigation bar
  - [x] Bottom nav shows only 3 main buttons (Casings, Completion, Settings)
  - [ ] Icons and text are visible and properly sized
  - [x] Bottom nav is fixed to bottom of viewport
- [x] **Theme toggle:**
  - [x] Click theme toggle in header (still in original location for now)
  - [x] Verify sidebar colors change appropriately for dark mode
  - [x] Verify border colors and backgrounds look correct
- [x] **No console errors**
- [x] **No build errors** in terminal

#### Step 1 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

```bash
git add index.html src/css/style.css
git commit -m "feat: add sidebar navigation HTML structure and base CSS

- Add 3-column grid layout (sidebar + form + canvas)
- Create sidebar with Navigation and Coming Soon sections
- Add 7 navigation buttons (3 active, 4 future features)
- Implement sticky sidebar on desktop
- Add mobile bottom navigation bar
- Style active states and disabled future features
- Add Equinor red color for active icons"
```

---

### Step 2: Move Controls into Sidebar Sections

#### Step 2.1: Move Hide Casings Button to Sidebar

- [x] Open [index.html](index.html)
- [x] Find the "Hide casings" button in the form header (search for `id="hide-casings-btn"`)
- [x] Cut the entire button element (including wrapping div if present)
- [x] Locate the `<div id="hide-casings-container"></div>` in the sidebar (added in Step 1)
- [x] Paste the button inside this container

The hide casings section should now look like:

```html
<!-- Inside sidebar controls section -->
<div id="hide-casings-container">
  <button id="hide-casings-btn" class="btn-secondary" type="button">
    <span id="hide-casings-btn-text">Hide casings</span>
  </button>
</div>
```

#### Step 2.2: Add POI Toggle to Sidebar

- [x] Open [index.html](index.html)
- [x] Locate the `<div id="poi-toggle-container"></div>` in the sidebar
- [x] Add the POI toggle button:

```html
<div id="poi-toggle-container">
  <button id="poi-toggle-btn" class="btn-secondary" type="button">
    <span id="poi-toggle-btn-text">Show POI Section</span>
  </button>
</div>
```

#### Step 2.3: Move Theme Toggle to Sidebar

- [x] Open [index.html](index.html)
- [x] Find the theme toggle in the header (search for `id="theme-toggle"`)
- [x] Cut the entire button element
- [x] Locate the `<div id="theme-toggle-container"></div>` in the sidebar
- [x] Paste the button inside this container

The theme toggle section should now look like:

```html
<div id="theme-toggle-container">
  <button
    id="theme-toggle"
    class="btn-secondary"
    type="button"
    aria-label="Toggle dark mode"
  >
    <span class="theme-icon">🌙</span>
  </button>
</div>
```

#### Step 2.4: Move Import/Export Buttons to Sidebar

- [x] Open [index.html](index.html)
- [x] Find the import/export buttons in the right panel presets area (search for `id="import-json-btn"` and `id="export-json-btn"`)
- [x] Cut both button elements (they might be in a div together)
- [x] Locate the `<div id="import-export-container"></div>` in the sidebar
- [x] Paste the buttons inside this container

The import/export section should now look like:

```html
<div id="import-export-container">
  <button id="import-json-btn" class="btn-secondary" type="button">
    Import JSON
  </button>
  <button id="export-json-btn" class="btn-secondary" type="button">
    Export JSON
  </button>
  <input
    type="file"
    id="import-file-input"
    accept=".json"
    style="display: none;"
  />
</div>
```

Note: The hidden file input should move with the import button if they're together.

#### Step 2.5: Update DOM References

- [x] Open [src/js/dom.js](src/js/dom.js)
- [x] Verify all DOM element IDs still match (no changes needed if IDs remain the same)
- [x] If there are cached selectors that need updating, update them

Expected: No changes needed since we moved elements with their IDs intact.

#### Step 2.6: Add POI Toggle Functionality

- [x] Open [src/js/ui.js](src/js/ui.js)
- [x] Add POI toggle handler after the existing initialization code (look for similar button handlers):

```javascript
// Add after existing button handlers (around line 200-300, find appropriate location)

// POI Section Toggle Handler
export function initPOIToggle() {
  const poiToggleBtn = document.getElementById('poi-toggle-btn');
  const poiToggleBtnText = document.getElementById('poi-toggle-btn-text');
  const poiSection = document.getElementById('poi-section');

  if (!poiToggleBtn || !poiSection) {
    console.warn('POI toggle elements not found');
    return;
  }

  const updatePOIToggleButton = () => {
    const isHidden = poiSection.style.display === 'none';
    poiToggleBtnText.textContent = isHidden
      ? 'Show POI Section'
      : 'Hide POI Section';
  };

  poiToggleBtn.addEventListener('click', () => {
    const isCurrentlyHidden = poiSection.style.display === 'none';
    poiSection.style.display = isCurrentlyHidden ? '' : 'none';
    updatePOIToggleButton();
  });

  updatePOIToggleButton();
}
```

- [x] Open [src/js/script.js](src/js/script.js)
- [x] Find the initialization section where UI handlers are called (look for `initializeUI` or similar)
- [x] Add the POI toggle initialization:

```javascript
// Add to initialization sequence (look for other ui.init* calls)
import { initPOIToggle } from './ui.js';

// In the initialization function, add:
initPOIToggle();
```

#### Step 2 Verification Checklist

- [x] Run `npm run dev` and open browser
- [x] **Hide Casings Button:**
  - [x] Verify button appears in sidebar "Controls" section
  - [x] Click button - casings should hide/show as before
  - [x] Button text should toggle between "Hide casings" and "Show casings"
- [x] **POI Toggle Button:**
  - [x] Verify button appears in sidebar "Controls" section
  - [x] Click button - POI section in main form should show/hide
  - [x] Button text should toggle between "Show POI Section" and "Hide POI Section"
- [x] **Theme Toggle:**
  - [x] Verify button appears in sidebar "Controls" section
  - [x] Click button - dark mode should toggle on/off
  - [x] Theme preference should persist on page reload
- [ ] **Import/Export Buttons:**
  - [x] Verify both buttons appear in sidebar "Controls" section
  - [x] Click Export - JSON file should download
  - [x] Click Import - file picker should open
  - [x] Import a valid JSON file - state should restore correctly
- [x] **Mobile view:**
  - [x] Resize to mobile - controls should NOT appear in bottom nav
  - [x] Controls should be accessible by navigating to Settings section (implement in Step 3)
- [x] **No console errors**
- [x] **All calculations still work correctly**

#### Step 2 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

```bash
git add index.html src/js/dom.js src/js/ui.js src/js/script.js
git commit -m "feat: move controls to sidebar sections

- Move Hide Casings button to sidebar controls
- Add POI toggle button to sidebar controls
- Move theme toggle to sidebar controls
- Move import/export buttons to sidebar controls
- Implement POI toggle functionality in ui.js
- All controls remain fully functional from new locations"
```

---

### Step 3: Implement Sidebar Navigation Logic

#### Step 3.1: Create Sidebar Module

- [x] Create new file [src/js/sidebar.js](src/js/sidebar.js)
- [x] Add the complete sidebar module:

```javascript
// Sidebar navigation module
// Handles section navigation, active states, smooth scrolling, and persistence

const STORAGE_KEY = 'volumeCalc_activeSection';
const SCROLL_OFFSET = 20; // Pixels above target for better visibility

let activeSection = localStorage.getItem(STORAGE_KEY) || 'casings';

export function initializeSidebar() {
  setupNavigationHandlers();
  setupScrollSpy();
  restoreActiveSection();
}

function setupNavigationHandlers() {
  const navButtons = document.querySelectorAll(
    '.sidebar-nav-button:not([disabled])'
  );

  navButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSection = button.getAttribute('data-section');

      if (targetSection) {
        navigateToSection(targetSection);
        setActiveButton(button);
        saveActiveSection(targetSection);
      }
    });
  });
}

function navigateToSection(sectionName) {
  const sectionMap = {
    casings: 'casings-section',
    completion: 'poi-section',
    settings: 'import-export-container'
  };

  const targetId = sectionMap[sectionName];
  const targetElement = document.getElementById(targetId);

  if (targetElement) {
    const elementPosition =
      targetElement.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - SCROLL_OFFSET;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  } else {
    console.warn(`Section element not found for: ${sectionName}`);
  }
}

function setActiveButton(activeButton) {
  const allButtons = document.querySelectorAll('.sidebar-nav-button');
  allButtons.forEach((btn) => btn.classList.remove('active'));
  activeButton.classList.add('active');
}

function saveActiveSection(sectionName) {
  activeSection = sectionName;
  try {
    localStorage.setItem(STORAGE_KEY, sectionName);
  } catch (error) {
    console.warn('Could not save active section to localStorage:', error);
  }
}

function restoreActiveSection() {
  const savedSection = localStorage.getItem(STORAGE_KEY);
  if (savedSection) {
    const button = document.querySelector(
      `.sidebar-nav-button[data-section="${savedSection}"]`
    );
    if (button) {
      setActiveButton(button);
      activeSection = savedSection;
    }
  } else {
    const firstButton = document.querySelector(
      '.sidebar-nav-button:not([disabled])'
    );
    if (firstButton) {
      setActiveButton(firstButton);
    }
  }
}

function setupScrollSpy() {
  const sectionMap = {
    'casings-section': 'casings',
    'poi-section': 'completion',
    'import-export-container': 'settings'
  };

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observerCallback = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        const sectionName = sectionMap[sectionId];

        if (sectionName) {
          const button = document.querySelector(
            `.sidebar-nav-button[data-section="${sectionName}"]`
          );
          if (button) {
            setActiveButton(button);
            saveActiveSection(sectionName);
          }
        }
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  Object.keys(sectionMap).forEach((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      observer.observe(element);
    }
  });
}

export function setSection(sectionName) {
  const button = document.querySelector(
    `.sidebar-nav-button[data-section="${sectionName}"]`
  );
  if (button) {
    setActiveButton(button);
    saveActiveSection(sectionName);
  }
}

export function getActiveSection() {
  return activeSection;
}
```

#### Step 3.2: Integrate Sidebar Module

- [x] Open [src/js/script.js](src/js/script.js)
- [x] Add sidebar import at the top with other imports:

```javascript
import { initializeSidebar } from './sidebar.js';
```

- [x] Find the main initialization function (look for `document.addEventListener('DOMContentLoaded'` or similar)
- [x] Add sidebar initialization after UI initialization:

```javascript
// Add after other initialization calls (look for ui.js, dom.js initializations)
initializeSidebar();
```

#### Step 3.3: Update Section IDs for Navigation

- [x] Open [index.html](index.html)
- [x] Ensure the casings fieldset has an ID for navigation targeting:

```html
<fieldset id="casings-section">
  <legend>Casings</legend>
  <!-- existing casings content -->
</fieldset>
```

- [x] Ensure the POI section has an ID (it should already exist):

```html
<fieldset id="poi-section" style="display: none;">
  <legend>Points of Interest (POI)</legend>
  <!-- existing POI content -->
</fieldset>
```

Note: If these IDs already exist, no changes are needed.

#### Step 3.4: Add Keyboard Navigation Support

- [x] Open [src/js/sidebar.js](src/js/sidebar.js)
- [x] Add keyboard navigation handler after the `setupNavigationHandlers` function:

```javascript
// Add this function after setupNavigationHandlers
function setupKeyboardNavigation() {
  const navButtons = Array.from(
    document.querySelectorAll('.sidebar-nav-button:not([disabled])')
  );

  navButtons.forEach((button, index) => {
    button.addEventListener('keydown', (e) => {
      let targetButton = null;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          targetButton = navButtons[index + 1] || navButtons[0];
          break;
        case 'ArrowUp':
          e.preventDefault();
          targetButton =
            navButtons[index - 1] || navButtons[navButtons.length - 1];
          break;
        case 'Home':
          e.preventDefault();
          targetButton = navButtons[0];
          break;
        case 'End':
          e.preventDefault();
          targetButton = navButtons[navButtons.length - 1];
          break;
      }

      if (targetButton) {
        targetButton.focus();
      }
    });
  });
}

// Update initializeSidebar to include keyboard navigation
export function initializeSidebar() {
  setupNavigationHandlers();
  setupScrollSpy();
  setupKeyboardNavigation(); // Add this line
  restoreActiveSection();
}
```

#### Step 3 Verification Checklist

- [x] Run `npm run dev` and open browser
- [ ] **Navigation Click Behavior:**
  - [x] Click "Casings" button - page scrolls smoothly to casings section
  - [x] Click "Completion" button - page scrolls smoothly to POI section
  - [x] Click "Settings" button - page scrolls smoothly to import/export area
  - [x] Active button shows red icon (Equinor red)
  - [x] Inactive buttons show white/default icons
- [x] **Scroll Spy (Auto-highlight):**
  - [x] Manually scroll down the page slowly
  - [x] Verify active button updates automatically as sections come into view
  - [x] Active state should reflect the section currently in viewport
- [x] **Persistence:**
  - [x] Click "Completion" button
  - [x] Refresh the page (F5 or Ctrl+R)
  - [x] Verify "Completion" button is still active/highlighted
  - [x] Verify localStorage has key `volumeCalc_activeSection` with value `completion`
- [x] **Keyboard Navigation:**
  - [x] Click into sidebar to focus a button
  - [x] Press Arrow Down - focus moves to next button
  - [x] Press Arrow Up - focus moves to previous button
  - [x] Press Home - focus moves to first button
  - [x] Press End - focus moves to last button
  - [x] Press Enter on focused button - navigates to that section
- [x] **Mobile Behavior:**
  - [x] Resize to mobile width
  - [x] Bottom nav buttons still show active state (red icon for active)
  - [x] Tapping buttons scrolls to sections
  - [x] Active state persists correctly on mobile
- [x] **No console errors**
- [x] **All existing functionality still works** (calculations, inputs, etc.)

#### Step 3 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

```bash
git add src/js/sidebar.js src/js/script.js index.html
git commit -m "feat: implement sidebar navigation logic

- Create sidebar.js module with navigation handlers
- Add smooth scroll to sections on button click
- Implement scroll spy to auto-highlight active section
- Add active state persistence to localStorage
- Add keyboard navigation (Arrow keys, Home, End)
- Integrate sidebar initialization into main script
- Support both desktop and mobile navigation"
```

---

### Step 4: Polish Mobile Navigation and Accessibility

#### Step 4.1: Enhance Mobile Bottom Nav Scrolling

- [x] Open [src/css/style.css](src/css/style.css)
- [x] Find the mobile sidebar styles (inside `@media (max-width: 900px)`)
- [x] Update the mobile navigation to improve scrolling UX:

```css
@media (max-width: 900px) {
  #app {
    grid-template-columns: 1fr;
    grid-template-areas:
      'form'
      'canvas';
    padding-bottom: 80px;
  }

  .sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    max-height: none;
    border-radius: 0;
    border-top: 1px solid var(--border-color);
    padding: var(--spacing-xs) 0;
    z-index: 1000;
    overflow-x: auto;
    overflow-y: visible;
    background: var(--bg-secondary);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .sidebar-content {
    flex-direction: row;
    gap: 0;
    overflow-x: auto;
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    scroll-behavior: smooth;
    padding: 0 var(--spacing-xs);
  }

  .sidebar-content::-webkit-scrollbar {
    display: none;
  }

  .sidebar-section {
    display: none;
  }

  .sidebar-section:first-child {
    display: flex;
    flex-direction: row;
    min-width: min-content;
  }

  .sidebar-section-title {
    display: none;
  }

  .sidebar-nav-list {
    flex-direction: row;
    gap: var(--spacing-xs);
    min-width: min-content;
  }

  .sidebar-nav-button {
    flex-direction: column;
    padding: var(--spacing-sm);
    gap: 4px;
    min-width: 64px;
    max-width: 80px;
    white-space: nowrap;
    font-size: 0.65rem;
    min-height: 56px;
  }

  .sidebar-nav-text {
    font-size: 0.65rem;
    line-height: 1.2;
    text-align: center;
  }

  .sidebar-icon {
    width: 24px;
    height: 24px;
  }

  .sidebar-section-controls {
    display: none;
  }

  /* Scroll indicator shadows */
  .sidebar::before,
  .sidebar::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 20px;
    pointer-events: none;
    z-index: 1;
  }

  .sidebar::before {
    left: 0;
    background: linear-gradient(to right, var(--bg-secondary), transparent);
  }

  .sidebar::after {
    right: 0;
    background: linear-gradient(to left, var(--bg-secondary), transparent);
  }
}
```

#### Step 4.2: Add ARIA Labels and Roles

- [x] Open [index.html](index.html)
- [x] Update the sidebar navigation with enhanced accessibility:

```html
<nav
  id="sidebar"
  class="sidebar"
  aria-label="Main navigation"
  role="navigation"
>
  <div class="sidebar-content">
    <div class="sidebar-section">
      <h3 class="sidebar-section-title" id="nav-section-label">Navigation</h3>
      <ul
        class="sidebar-nav-list"
        role="list"
        aria-labelledby="nav-section-label"
      >
        <li class="sidebar-nav-item" role="listitem">
          <button
            class="sidebar-nav-button"
            data-section="casings"
            aria-label="Navigate to Casings section"
            role="button"
          >
            <svg
              class="sidebar-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
              />
            </svg>
            <span class="sidebar-nav-text">Casings</span>
          </button>
        </li>
        <li class="sidebar-nav-item" role="listitem">
          <button
            class="sidebar-nav-button"
            data-section="completion"
            aria-label="Navigate to Completion and Drillpipe section"
            role="button"
          >
            <svg
              class="sidebar-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"
              />
            </svg>
            <span class="sidebar-nav-text">Completion</span>
          </button>
        </li>
        <li class="sidebar-nav-item" role="listitem">
          <button
            class="sidebar-nav-button"
            data-section="settings"
            aria-label="Navigate to Settings section"
            role="button"
          >
            <svg
              class="sidebar-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
              />
            </svg>
            <span class="sidebar-nav-text">Settings</span>
          </button>
        </li>
      </ul>
    </div>

    <div class="sidebar-section sidebar-section-future">
      <h3 class="sidebar-section-title" id="future-section-label">
        Coming Soon
      </h3>
      <ul
        class="sidebar-nav-list"
        role="list"
        aria-labelledby="future-section-label"
      >
        <li class="sidebar-nav-item" role="listitem">
          <button
            class="sidebar-nav-button"
            data-section="flow"
            aria-label="Flow velocity calculator (coming soon)"
            disabled
            aria-disabled="true"
          >
            <svg
              class="sidebar-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-4-4h3V9h2v4h3l-4 4z"
              />
            </svg>
            <span class="sidebar-nav-text">Flow Velocity</span>
          </button>
        </li>
        <li class="sidebar-nav-item" role="listitem">
          <button
            class="sidebar-nav-button"
            data-section="pressure"
            aria-label="Volume pressure calculator (coming soon)"
            disabled
            aria-disabled="true"
          >
            <svg
              class="sidebar-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
              />
            </svg>
            <span class="sidebar-nav-text">Pressure</span>
          </button>
        </li>
        <li class="sidebar-nav-item" role="listitem">
          <button
            class="sidebar-nav-button"
            data-section="lift"
            aria-label="String lift calculator (coming soon)"
            disabled
            aria-disabled="true"
          >
            <svg
              class="sidebar-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"
              />
            </svg>
            <span class="sidebar-nav-text">String Lift</span>
          </button>
        </li>
        <li class="sidebar-nav-item" role="listitem">
          <button
            class="sidebar-nav-button"
            data-section="cement"
            aria-label="Cement displacement calculator (coming soon)"
            disabled
            aria-disabled="true"
          >
            <svg
              class="sidebar-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7V7h2v10zm4 0h-2V7h2v10zm4 0h-2V7h2v10z"
              />
            </svg>
            <span class="sidebar-nav-text">Cement</span>
          </button>
        </li>
      </ul>
    </div>

    <div class="sidebar-section sidebar-section-controls">
      <h3 class="sidebar-section-title" id="controls-section-label">
        Controls
      </h3>
      <div class="sidebar-controls" aria-labelledby="controls-section-label">
        <div id="hide-casings-container"></div>
        <div id="poi-toggle-container"></div>
        <div id="theme-toggle-container"></div>
        <div id="import-export-container"></div>
      </div>
    </div>
  </div>
</nav>
```

#### Step 4.3: Improve Focus Management

- [x] Open [src/js/sidebar.js](src/js/sidebar.js)
- [x] Update the `navigateToSection` function to manage focus:

```javascript
function navigateToSection(sectionName) {
  const sectionMap = {
    casings: 'casings-section',
    completion: 'poi-section',
    settings: 'import-export-container'
  };

  const targetId = sectionMap[sectionName];
  const targetElement = document.getElementById(targetId);

  if (targetElement) {
    const elementPosition =
      targetElement.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - SCROLL_OFFSET;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    // Announce to screen readers
    const announcement = `Navigating to ${sectionName} section`;
    announceToScreenReader(announcement);

    // Set focus to target section for keyboard users
    setTimeout(() => {
      if (targetElement.hasAttribute('tabindex')) {
        targetElement.focus();
      } else {
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus();
        targetElement.addEventListener(
          'blur',
          () => {
            targetElement.removeAttribute('tabindex');
          },
          { once: true }
        );
      }
    }, 500);
  } else {
    console.warn(`Section element not found for: ${sectionName}`);
  }
}

function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
```

#### Step 4.4: Add Screen Reader Only Utility Class

- [x] Open [src/css/style.css](src/css/style.css)
- [x] Add screen reader utility class at the end of the file:

```css
/* Screen reader only - hides visually but keeps accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

#### Step 4.5: Add Skip to Content Link (Accessibility)

- [x] Open [index.html](index.html)
- [x] Add skip link right after opening `<body>` tag:

```html
<body>
  <a href="#volume-form" class="skip-link">Skip to main content</a>

  <header>
    <!-- existing header content -->
  </header>
</body>
```

- [x] Open [src/css/style.css](src/css/style.css)
- [x] Add skip link styles:

```css
/* Skip to content link for keyboard users */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--equinor-red);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 10000;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
}
```

#### Step 4 Verification Checklist

- [x] Run `npm run dev` and open browser
- [x] **Mobile Navigation:**
  - [x] Resize to mobile width (<900px)
  - [x] Bottom nav has smooth backdrop blur effect
  - [x] Bottom nav shows subtle gradient edges indicating more content
  - [x] Swipe/drag horizontally to scroll through nav items
  - [x] Touch targets are at least 56px height
  - [x] Text is readable at 0.65rem size
- [x] **Accessibility - Keyboard Navigation:**
  - [x] Press Tab from page load - skip link appears
  - [x] Press Enter on skip link - focus jumps to main form
  - [x] Tab to sidebar navigation buttons
  - [x] Use Arrow keys to navigate between buttons
  - [x] Press Enter on a button - smooth scroll + focus moves to section
  - [x] All interactive elements are reachable via keyboard
- [x] **Accessibility - Screen Reader:**
  - [x] Open browser DevTools > Accessibility tree
  - [x] Verify all buttons have proper aria-labels
  - [x] Verify disabled buttons have aria-disabled="true"
  - [x] Verify nav has role="navigation" and aria-label
  - [x] Verify icons have aria-hidden="true"
  - [x] Navigation announcements work (check console or use screen reader)
- [ ] **Accessibility - Color Contrast:**
  - [x] Run Lighthouse accessibility audit (DevTools > Lighthouse)
  - [x] Score should be 90+ for accessibility
  - [x] Check contrast ratio of text against backgrounds (both light and dark themes)
  - [x] Active button red color (Equinor red) should be visible in both themes
- [x] **Focus Management:**
  - [x] Click a navigation button
  - [x] After scroll completes, focus should move to the target section
  - [x] Section should have visible focus outline
  - [x] Tab key should move to next interactive element in that section
- [ ] **Touch Interactions (use mobile device or DevTools mobile emulation):**
  - [x] All buttons respond to touch
  - [x] No accidental double-tap zoom
  - [x] Smooth scrolling on touch drag
  - [x] Active states visible on touch
- [x] **No console errors or warnings**
- [x] **All existing functionality still works**

#### Step 4 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

```bash
git add src/css/style.css src/js/sidebar.js index.html
git commit -m "feat: enhance mobile navigation and accessibility

- Improve mobile bottom nav with backdrop blur and scroll indicators
- Add comprehensive ARIA labels and roles to all nav elements
- Implement focus management for keyboard navigation
- Add screen reader announcements for navigation actions
- Add skip-to-content link for keyboard users
- Add sr-only utility class for screen reader text
- Ensure all touch targets meet 44px minimum
- Improve keyboard navigation with proper focus flow
- Enhance color contrast for better readability"
```

---

### Step 5: Final Polish and Responsive Optimization

#### Step 5.1: Fine-tune Responsive Breakpoints

- [x] Open [src/css/style.css](src/css/style.css)
- [x] Add intermediate breakpoint for tablet view (between desktop and mobile):

```css
/* Tablet view - narrower sidebar */
@media (max-width: 1200px) and (min-width: 901px) {
  #app {
    grid-template-columns: 200px 1fr 1fr;
    gap: var(--spacing-sm);
  }

  .sidebar {
    padding: var(--spacing-sm);
  }

  .sidebar-nav-button {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.85rem;
  }

  .sidebar-icon {
    width: 20px;
    height: 20px;
  }
}

/* Small desktop - 2 column layout (form + sidebar combines with canvas) */
@media (max-width: 1100px) and (min-width: 901px) {
  #app {
    grid-template-columns: 220px 1fr;
    grid-template-areas:
      'sidebar form'
      'sidebar canvas';
  }

  .canvas-container {
    margin-top: var(--spacing-md);
  }
}
```

#### Step 5.2: Add Smooth Transitions and Polish

- [x] Open [src/css/style.css](src/css/style.css)
- [x] Update sidebar button styles with enhanced transitions:

```css
.sidebar-nav-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  position: relative;
  overflow: hidden;
}

.sidebar-nav-button::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--equinor-red);
  transform: scaleY(0);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 2px 2px 0;
}

.sidebar-nav-button.active::before {
  transform: scaleY(1);
}

.sidebar-nav-button:hover:not(:disabled) {
  background: var(--bg-tertiary);
  transform: translateX(2px);
}

.sidebar-nav-button:active:not(:disabled) {
  transform: translateX(1px);
}

.sidebar-nav-button:focus-visible {
  outline: 2px solid var(--equinor-red);
  outline-offset: 2px;
}

.sidebar-nav-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.sidebar-nav-button.active {
  background: var(--bg-tertiary);
  font-weight: 600;
}

.sidebar-nav-button.active .sidebar-icon {
  color: var(--equinor-red);
  transform: scale(1.1);
}

.sidebar-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: currentColor;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### Step 5.3: Add Loading State for Sidebar

- [x] Open [src/js/sidebar.js](src/js/sidebar.js)
- [x] Add initialization loading state:

```javascript
export function initializeSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) {
    console.warn('Sidebar element not found');
    return;
  }

  sidebar.classList.add('sidebar-loading');

  try {
    setupNavigationHandlers();
    setupScrollSpy();
    setupKeyboardNavigation();
    restoreActiveSection();

    setTimeout(() => {
      sidebar.classList.remove('sidebar-loading');
      sidebar.classList.add('sidebar-loaded');
    }, 100);
  } catch (error) {
    console.error('Error initializing sidebar:', error);
    sidebar.classList.remove('sidebar-loading');
  }
}
```

- [x] Open [src/css/style.css](src/css/style.css)
- [x] Add loading state styles:

```css
.sidebar-loading {
  opacity: 0;
  transform: translateX(-10px);
}

.sidebar-loaded {
  animation: sidebar-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes sidebar-fade-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Mobile loading state */
@media (max-width: 900px) {
  .sidebar-loading {
    transform: translateY(10px);
  }

  @keyframes sidebar-fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
```

#### Step 5.4: Add Hover Tooltips for Disabled Features

- [x] Open [src/css/style.css](src/css/style.css)
- [x] Add tooltip styles for disabled buttons:

```css
/* Tooltip for future features */
.sidebar-nav-button[disabled] {
  position: relative;
}

.sidebar-nav-button[disabled]:hover::after {
  content: attr(aria-label);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 1000;
  box-shadow: var(--box-shadow);
  pointer-events: none;
  animation: tooltip-fade-in 0.2s ease;
}

@keyframes tooltip-fade-in {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

/* Hide tooltips on mobile */
@media (max-width: 900px) {
  .sidebar-nav-button[disabled]:hover::after {
    display: none;
  }
}
```

#### Step 5.5: Optimize Z-Index Layering

- [x] Open [src/css/style.css](src/css/style.css)
- [x] Add z-index management comments and ensure proper stacking:

```css
/* Z-INDEX LAYERING SYSTEM
 * 1-10: Base content (form, inputs, tables)
 * 100-500: Elevated elements (modals, dropdowns)
 * 1000: Sidebar/Navigation
 * 2000: Tooltips and overlays
 * 10000: Skip links and critical accessibility
 */

.sidebar {
  z-index: 1000;
}

.sidebar-nav-button[disabled]:hover::after {
  z-index: 2000;
}

.skip-link {
  z-index: 10000;
}

/* Ensure sidebar stays above form elements but below modals */
@media (max-width: 900px) {
  .sidebar {
    z-index: 1000;
  }
}
```

#### Step 5.6: Add Print Styles

- [x] Open [src/css/style.css](src/css/style.css)
- [x] Add print media query at the end:

```css
/* Print styles - hide navigation when printing */
@media print {
  .sidebar {
    display: none;
  }

  #app {
    grid-template-columns: 1fr;
    grid-template-areas:
      'form'
      'canvas';
    max-width: 100%;
  }

  .skip-link {
    display: none;
  }
}
```

#### Step 5 Verification Checklist

- [x] Run `npm run dev` and open browser
- [x] **Desktop Responsive Testing (>1200px):**
  - [x] Full 3-column layout appears correctly
  - [x] Sidebar is 240px wide
  - [x] All spacing looks balanced
  - [x] Hover effects work smoothly
- [x] **Tablet Responsive Testing (901px - 1200px):**
  - [x] Sidebar narrows to 200px
  - [x] Text and icons scale down appropriately
  - [x] Layout remains usable and readable
  - [x] At 1100px, verify 2-column layout if implemented
- [x] **Mobile Responsive Testing (<900px):**
  - [x] Bottom navigation appears fixed at bottom
  - [x] Navigation is horizontally scrollable
  - [x] Active state clearly visible
  - [x] No layout overflow or horizontal scroll on page
- [x] **Animations and Transitions:**
  - [x] Sidebar fades in smoothly on page load
  - [x] Button hover effects are smooth
  - [x] Active state transition is smooth
  - [x] Icon scale animation on active button
  - [x] Left border indicator animates correctly
- [x] **Disabled Button Tooltips:**
  - [x] Hover over disabled "Flow Velocity" button
  - [x] Tooltip appears to the right with full aria-label text
  - [x] Tooltip has proper styling and shadow
  - [x] Tooltip doesn't appear on mobile
- [x] **Print Preview:**
  - [x] Press Ctrl+P (or Cmd+P on Mac) to open print preview
  - [x] Sidebar should NOT appear in print
  - [x] Form and canvas should print in single column
  - [x] Content is readable and properly formatted
- [x] **Z-Index Layering:**
  - [x] Open any modal/dropdown (if exists in app)
  - [x] Verify modal appears above sidebar
  - [x] Verify tooltips appear above everything except skip link
  - [x] No visual stacking issues
- [x] **Performance:**
  - [x] Page loads quickly without layout shift
  - [x] Smooth scrolling performance
  - [x] No janky animations or transitions
  - [x] Sidebar scroll is smooth on mobile
- [x] **Cross-Browser Testing (if possible):**
  - [x] Test in Chrome/Edge
  - [ ] Test in Firefox
  - [ ] Test in Safari (if available)
  - [ ] Verify consistent appearance and behavior
- [ ] **Final Integration:**
  - [ ] All calculations still work correctly
  - [x] State persistence still works
  - [x] Theme toggle works from sidebar
  - [x] Import/export works from sidebar
  - [x] Hide casings works from sidebar
  - [x] POI toggle works from sidebar
- [x] **No console errors or warnings**

#### Step 5 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

```bash
git add src/css/style.css src/js/sidebar.js
git commit -m "feat: final polish and responsive optimization

- Add intermediate breakpoint for tablet view (901px-1200px)
- Implement smooth transitions and animations for buttons
- Add loading state animation for sidebar initialization
- Add hover tooltips for disabled future feature buttons
- Optimize z-index layering system with documentation
- Add print media query to hide navigation
- Enhance button interactions with left border indicator
- Add cubic-bezier easing for smoother animations
- Ensure consistent responsive behavior across breakpoints
- Polish mobile bottom navigation scroll experience"
```

---

## Implementation Complete! 🎉

### What Was Implemented:

1. **✅ Step 1:** Created sidebar HTML structure with 3-column grid layout and mobile bottom navigation
2. **✅ Step 2:** Moved all controls (hide casings, POI toggle, theme toggle, import/export) to sidebar
3. **✅ Step 3:** Implemented navigation logic with smooth scrolling, scroll spy, and persistence
4. **✅ Step 4:** Enhanced accessibility with ARIA labels, keyboard navigation, and screen reader support
5. **✅ Step 5:** Added final polish with responsive breakpoints, animations, and optimizations

### Key Features:

- **Desktop:** Sticky 3-column layout with 240px sidebar
- **Mobile:** Bottom navigation bar with horizontal scroll
- **Navigation:** 3 active sections (Casings, Completion, Settings) + 4 future features
- **Active State:** White icons inactive, Equinor red icons when active
- **Persistence:** Active section saved to localStorage
- **Accessibility:** Full keyboard navigation, screen reader support, WCAG compliant
- **Smooth UX:** Animated transitions, loading states, focus management

### Testing Recommendations:

1. Test all viewport sizes: 320px, 768px, 1024px, 1400px
2. Test keyboard navigation thoroughly
3. Test with screen reader (NVDA on Windows, VoiceOver on Mac)
4. Run Lighthouse audit for accessibility score
5. Test on real mobile device if possible
6. Verify all existing functionality still works

### Future Enhancements (Not in this PR):

- Implement actual functionality for future feature buttons (Flow Velocity, Pressure, String Lift, Cement)
- Add search functionality to sidebar
- Add contextual actions per section
- Consider adding keyboard shortcuts
- Add analytics tracking for navigation usage

### Recommendation for Presets Dropdown:

**Keep the presets dropdown in the right panel where it is currently located.**

**Reasoning:**

1. **Contextual relevance:** Presets are directly related to the well configuration shown in the right panel
2. **Visual proximity:** Users can see the schematic/results while selecting presets
3. **Clear separation:** Navigation (sidebar) vs. data/configuration (right panel)
4. **User flow:** Natural flow from selecting preset → viewing results → adjusting form inputs
5. **Avoiding clutter:** Sidebar is for section navigation, not data operations

The current location maintains good information architecture and user experience patterns.

---

## Branch Merge Instructions

After all steps are completed and tested:

```bash
# Ensure all changes are committed
git status

# Switch to main branch
git checkout main

# Merge feature branch
git merge feature/sidebar-navigation

# Push to remote
git push origin main

# Optionally delete feature branch
git branch -d feature/sidebar-navigation
git push origin --delete feature/sidebar-navigation
```

---

**End of Implementation Plan**
