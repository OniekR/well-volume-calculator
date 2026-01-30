/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initializeSidebar } from '../sidebar.js';

describe('Sidebar view navigation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    document.body.innerHTML = `
      <div id="app">
        <nav id="sidebar">
          <div class="sidebar-content">
            <div class="sidebar-section">
              <button class="sidebar-nav-button" data-section="casings">Casings</button>
              <button class="sidebar-nav-button" data-section="completion">Completion</button>
              <button class="sidebar-nav-button" data-section="settings">Settings</button>
            </div>
            <div class="sidebar-section sidebar-section-controls" id="controls-section">
              <h3 class="sidebar-section-title" id="controls-section-label">Controls</h3>
              <div class="sidebar-controls" aria-labelledby="controls-section-label">

              </div>
            </div>
          </div>
        </nav>
        <form id="well-form">
          <section id="view-casings" class="app-view" data-view="casings"><h2>Casings</h2></section>
          <section id="view-completion" class="app-view" data-view="completion" hidden><h2>Completion</h2></section>
          <section id="view-settings" class="app-view" data-view="settings" hidden>
            <h2>Settings</h2>
            <div id="settings-controls-host"></div>
          </section>
        </form>
      </div>
    `;
  });

  it('shows one view at a time and updates active nav button', () => {
    initializeSidebar();
    vi.runOnlyPendingTimers();

    const casingsView = document.getElementById('view-casings');
    const completionView = document.getElementById('view-completion');
    const casingsBtn = document.querySelector(
      '.sidebar-nav-button[data-section="casings"]'
    );
    const completionBtn = document.querySelector(
      '.sidebar-nav-button[data-section="completion"]'
    );

    expect(casingsView.hidden).toBe(false);
    expect(completionView.hidden).toBe(true);
    expect(casingsBtn.classList.contains('active')).toBe(true);

    completionBtn.click();
    expect(casingsView.hidden).toBe(true);
    expect(completionView.hidden).toBe(false);
    expect(completionBtn.classList.contains('active')).toBe(true);
  });
});
