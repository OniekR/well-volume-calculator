/** @vitest-environment jsdom */
import { test, expect, beforeEach, vi } from 'vitest';
import { initializeSidebar } from '../sidebar.js';

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  document.body.innerHTML = `
    <div id="app">
      <nav id="sidebar">
        <div class="sidebar-content" id="sidebar-content">
          <div class="sidebar-section">
            <button class="sidebar-nav-button" data-section="casings">Casings</button>
            <button class="sidebar-nav-button" data-section="settings">Settings</button>
          </div>
          <div class="sidebar-section sidebar-section-controls" id="controls-section">
            <h3 class="sidebar-section-title" id="controls-section-label">Controls</h3>
            <div class="sidebar-controls" aria-labelledby="controls-section-label">
              <button id="theme_toggle" type="button">Theme</button>
            </div>
          </div>
        </div>
      </nav>

      <form id="well-form">
        <section id="view-casings" class="app-view" data-view="casings"><h2>Casings</h2></section>
        <section id="view-settings" class="app-view" data-view="settings" hidden>
          <h2>Settings</h2>
          <div id="settings-controls-host"></div>
        </section>
      </form>
    </div>
  `;
});

test('moves the Controls section into Settings view on demand', () => {
  initializeSidebar();
  vi.runOnlyPendingTimers();

  const settingsBtn = document.querySelector(
    '.sidebar-nav-button[data-section="settings"]'
  );
  const casingsBtn = document.querySelector(
    '.sidebar-nav-button[data-section="casings"]'
  );
  const host = document.getElementById('settings-controls-host');
  const controls = document.getElementById('controls-section');
  const sidebarContent = document.getElementById('sidebar-content');

  expect(controls.parentElement).toBe(sidebarContent);

  settingsBtn.click();
  expect(controls.parentElement).toBe(host);

  casingsBtn.click();
  expect(controls.parentElement).toBe(sidebarContent);
});
