// Sidebar navigation module
// Handles section navigation, active states, smooth scrolling, and persistence

const STORAGE_KEY = 'volumeCalc_activeSection';
const SCROLL_OFFSET = 20; // Pixels above target for better visibility

let activeSection = localStorage.getItem(STORAGE_KEY) || 'casings';

export function initializeSidebar() {
  setupNavigationHandlers();
  setupScrollSpy();
  setupKeyboardNavigation();
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

    const announcement = `Navigating to ${sectionName} section`;
    announceToScreenReader(announcement);

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
