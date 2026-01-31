/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initializeSidebar, setSection, getActiveSection } from '../sidebar.js';

describe('sidebar.js', () => {
  let originalBody;

  beforeEach(() => {
    originalBody = document.body.innerHTML;
    localStorage.clear();
    document.body.innerHTML = `
      <nav id="sidebar">
        <button class="sidebar-nav-button" data-section="casings">Casings</button>
        <button class="sidebar-nav-button" data-section="completion">Completion</button>
        <button class="sidebar-nav-button" data-section="flow">Flow</button>
        <button class="sidebar-nav-button" data-section="pressure">Pressure</button>
        <button class="sidebar-nav-button" data-section="lift">Lift</button>
        <button class="sidebar-nav-button" data-section="settings">Settings</button>
      </nav>
      <main>
        <section class="app-view" data-view="casings">Casings Content</section>
        <section class="app-view" data-view="completion" hidden>Completion Content</section>
        <section class="app-view" data-view="flow" hidden>Flow Content</section>
        <section class="app-view" data-view="pressure" hidden>Pressure Content</section>
        <section class="app-view" data-view="lift" hidden>Lift Content</section>
        <section class="app-view" data-view="settings" hidden>Settings Content</section>
      </main>
      <div class="sidebar-section sidebar-section-controls">Controls</div>
      <div id="settings-controls-host"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = originalBody;
    localStorage.clear();
  });

  describe('initializeSidebar()', () => {
    it('initializes without errors', () => {
      expect(() => initializeSidebar()).not.toThrow();
    });

    it('sets default section to casings', () => {
      initializeSidebar();
      expect(getActiveSection()).toBe('casings');
    });

    it('restores section from localStorage if present', () => {
      localStorage.setItem('volumeCalc_activeSection', 'flow');
      initializeSidebar();
      expect(getActiveSection()).toBe('flow');
    });

    it('handles invalid localStorage section gracefully', () => {
      setSection('casings', { focus: false });
      localStorage.setItem('volumeCalc_activeSection', 'invalid_section');
      initializeSidebar();
      expect(getActiveSection()).toBe('casings');
    });
  });

  describe('setSection()', () => {
    beforeEach(() => {
      initializeSidebar();
    });

    it('changes active section', () => {
      setSection('flow', { focus: false });
      expect(getActiveSection()).toBe('flow');
    });

    it('updates nav button active state', () => {
      setSection('flow', { focus: false });
      const flowBtn = document.querySelector('[data-section="flow"]');
      expect(flowBtn.classList.contains('active')).toBe(true);
    });

    it('removes active state from previous button', () => {
      setSection('flow', { focus: false });
      const casingBtn = document.querySelector('[data-section="casings"]');
      expect(casingBtn.classList.contains('active')).toBe(false);
    });

    it('shows corresponding view section', () => {
      setSection('flow', { focus: false });
      const flowView = document.querySelector('[data-view="flow"]');
      expect(flowView.hidden).toBe(false);
    });

    it('hides previous view section', () => {
      setSection('flow', { focus: false });
      const casingView = document.querySelector('[data-view="casings"]');
      expect(casingView.hidden).toBe(true);
    });

    it('saves section to localStorage', () => {
      setSection('pressure', { focus: false });
      expect(localStorage.getItem('volumeCalc_activeSection')).toBe('pressure');
    });

    it('dispatches keino:sectionchange event', () => {
      const handler = vi.fn();
      document.addEventListener('keino:sectionchange', handler);
      setSection('pressure', { focus: false });
      expect(handler).toHaveBeenCalled();
      document.removeEventListener('keino:sectionchange', handler);
    });

    it('handles invalid section name gracefully', () => {
      expect(() => setSection('nonexistent', { focus: false })).not.toThrow();
      expect(getActiveSection()).toBe('casings');
    });

    it('handles null options gracefully', () => {
      expect(() => setSection('drillpipe')).not.toThrow();
    });
  });

  describe('getActiveSection()', () => {
    it('returns current active section', () => {
      initializeSidebar();
      expect(getActiveSection()).toBe('casings');
    });

    it('updates after setSection call', () => {
      initializeSidebar();
      setSection('settings', { focus: false });
      expect(getActiveSection()).toBe('settings');
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      initializeSidebar();
    });

    it('moves focus with ArrowDown', () => {
      const casingsBtn = document.querySelector('[data-section="casings"]');
      const completionBtn = document.querySelector('[data-section="completion"]');
      casingsBtn.focus();
      casingsBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(document.activeElement).toBe(completionBtn);
    });

    it('moves focus with ArrowUp', () => {
      const casingsBtn = document.querySelector('[data-section="casings"]');
      const settingsBtn = document.querySelector('[data-section="settings"]');
      casingsBtn.focus();
      casingsBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(document.activeElement).toBe(settingsBtn);
    });
  });

  describe('Click Navigation', () => {
    beforeEach(() => {
      initializeSidebar();
    });

    it('changes section on button click', () => {
      const flowBtn = document.querySelector('[data-section="flow"]');
      flowBtn.click();
      expect(getActiveSection()).toBe('flow');
    });

    it('handles rapid consecutive clicks', () => {
      const buttons = document.querySelectorAll('.sidebar-nav-button');
      buttons.forEach((btn) => btn.click());
      expect(getActiveSection()).toBe('settings');
    });
  });
});
