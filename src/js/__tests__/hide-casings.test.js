import { setupHideCasingsToggle } from '../ui.js';

/**
 * @vitest-environment jsdom
 */

describe('Hide casings toggle', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="well-form">
        <button id="toggle_hide_casings_btn">Hide casings</button>
        <div class="casing-input" id="c1"></div>
        <div class="casing-input no-hide" id="uc"></div>
        <div class="casing-input" id="c2"></div>
      </form>
    `;
  });

  it('toggles casings-hidden class on the form and updates aria/label, excluding no-hide elements', () => {
    const btn = document.getElementById('toggle_hide_casings_btn');
    const form = document.getElementById('well-form');
    const c1 = document.getElementById('c1');
    const uc = document.getElementById('uc');
    const c2 = document.getElementById('c2');
    setupHideCasingsToggle();

    expect(form.classList.contains('casings-hidden')).toBe(false);

    btn.click();
    expect(form.classList.contains('casings-hidden')).toBe(true);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.textContent).toBe('Show casings');

    // hidden-by-casings-toggle should be applied to non-no-hide elements
    expect(c1.classList.contains('hidden-by-casings-toggle')).toBe(true);
    expect(uc.classList.contains('hidden-by-casings-toggle')).toBe(false);
    expect(c2.classList.contains('hidden-by-casings-toggle')).toBe(true);

    btn.click();
    expect(form.classList.contains('casings-hidden')).toBe(false);
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(btn.textContent).toBe('Hide casings');

    // hidden-by-casings-toggle should be removed
    expect(c1.classList.contains('hidden-by-casings-toggle')).toBe(false);
    expect(c2.classList.contains('hidden-by-casings-toggle')).toBe(false);
  });

  it('is keyboard accessible (Enter/Space)', () => {
    const btn = document.getElementById('toggle_hide_casings_btn');
    const form = document.getElementById('well-form');
    setupHideCasingsToggle();

    const enter = new KeyboardEvent('keydown', { key: 'Enter' });
    btn.dispatchEvent(enter);
    expect(form.classList.contains('casings-hidden')).toBe(true);

    const space = new KeyboardEvent('keydown', { key: ' ' });
    btn.dispatchEvent(space);
    expect(form.classList.contains('casings-hidden')).toBe(false);
  });
});
