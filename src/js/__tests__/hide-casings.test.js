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
        <div class="casing-input" id="c2"></div>
      </form>
    `;
  });

  it('toggles casings-hidden class on the form and updates aria/label', () => {
    const btn = document.getElementById('toggle_hide_casings_btn');
    const form = document.getElementById('well-form');
    setupHideCasingsToggle();

    expect(form.classList.contains('casings-hidden')).toBe(false);

    btn.click();
    expect(form.classList.contains('casings-hidden')).toBe(true);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.textContent).toBe('Show casings');

    btn.click();
    expect(form.classList.contains('casings-hidden')).toBe(false);
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(btn.textContent).toBe('Hide casings');
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
