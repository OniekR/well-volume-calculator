const STORAGE_KEY = 'volumeCalc_activeSection';

const DEFAULT_SECTION = 'casings';
const KNOWN_SECTIONS = new Set([
  'casings',
  'completion',
  'flow',
  'pressure',
  'settings'
]);

let activeSection = localStorage.getItem(STORAGE_KEY) || DEFAULT_SECTION;

let controlsOriginalParent = undefined;
let controlsOriginalNextSibling = undefined;

export function initializeSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) {
    console.warn('Sidebar element not found');
    return;
  }

  sidebar.classList.add('sidebar-loading');

  try {
    setupNavigationHandlers();
    setupKeyboardNavigation();
    restoreActiveSection();

    const controlsSection = document.querySelector(
      '.sidebar-section.sidebar-section-controls'
    );
    if (controlsSection && !controlsOriginalParent) {
      controlsOriginalParent = controlsSection.parentElement;
      controlsOriginalNextSibling = controlsSection.nextElementSibling;
    }

    setTimeout(() => {
      sidebar.classList.remove('sidebar-loading');
      sidebar.classList.add('sidebar-loaded');
    }, 100);
  } catch (error) {
    console.error('Error initializing sidebar:', error);
    sidebar.classList.remove('sidebar-loading');
  }
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
        setSection(targetSection, { focus: true });
      }
    });
  });
}

function normalizeSectionName(sectionName) {
  return KNOWN_SECTIONS.has(sectionName) ? sectionName : DEFAULT_SECTION;
}

function setActiveView(sectionName, { focus } = {}) {
  const normalized = normalizeSectionName(sectionName);
  const views = Array.from(document.querySelectorAll('.app-view[data-view]'));

  if (!views.length) {
    return;
  }

  views.forEach((viewEl) => {
    const viewName = viewEl.getAttribute('data-view');
    viewEl.hidden = viewName !== normalized;
  });

  moveControlsForView(normalized);

  announceToScreenReader(`Showing ${normalized} section`);

  if (focus) {
    const activeView = views.find(
      (viewEl) => viewEl.getAttribute('data-view') === normalized
    );
    focusView(activeView);
  }
}

function moveControlsForView(sectionName) {
  const host = document.getElementById('settings-controls-host');
  const controlsSection = document.querySelector(
    '.sidebar-section.sidebar-section-controls'
  );
  if (!controlsSection) return;

  if (sectionName === 'settings') {
    if (host && controlsSection.parentElement !== host) {
      host.appendChild(controlsSection);
    }
    return;
  }

  if (!controlsOriginalParent) return;
  if (controlsSection.parentElement === controlsOriginalParent) return;

  controlsOriginalParent.insertBefore(
    controlsSection,
    controlsOriginalNextSibling || null
  );
}

function focusView(viewEl) {
  if (!viewEl) return;
  const focusTarget =
    viewEl.querySelector('h2, h3, input, select, button, [tabindex]') || viewEl;

  if (focusTarget.hasAttribute && focusTarget.hasAttribute('tabindex')) {
    focusTarget.focus();
    return;
  }

  if (focusTarget !== viewEl && focusTarget.focus) {
    focusTarget.focus();
    return;
  }

  viewEl.setAttribute('tabindex', '-1');
  viewEl.focus();
  viewEl.addEventListener(
    'blur',
    () => {
      viewEl.removeAttribute('tabindex');
    },
    { once: true }
  );
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
      activeSection = normalizeSectionName(savedSection);
      setActiveView(activeSection, { focus: false });
    }
  } else {
    const firstButton = document.querySelector(
      '.sidebar-nav-button:not([disabled])'
    );
    if (firstButton) {
      setActiveButton(firstButton);
      setActiveView(DEFAULT_SECTION, { focus: false });
    }
  }
}

function setupKeyboardNavigation() {
  const navButtons = Array.from(
    document.querySelectorAll('.sidebar-nav-button:not([disabled])')
  );

  navButtons.forEach((button, index) => {
    button.addEventListener('keydown', (e) => {
      let targetButton = undefined;

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
        default:
          break;
      }

      if (targetButton) {
        targetButton.focus();
      }
    });
  });
}

export function setSection(sectionName, { focus } = {}) {
  const normalized = normalizeSectionName(sectionName);
  const button = document.querySelector(
    `.sidebar-nav-button[data-section="${normalized}"]`
  );
  if (button) setActiveButton(button);
  saveActiveSection(normalized);
  setActiveView(normalized, { focus: !!focus });

  try {
    document.dispatchEvent(
      new CustomEvent('keino:sectionchange', { detail: normalized })
    );
  } catch (error) {
    console.warn('Unable to broadcast section change:', error);
  }
}

export function getActiveSection() {
  return activeSection;
}
