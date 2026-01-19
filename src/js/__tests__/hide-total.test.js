/**
 * @vitest-environment jsdom
 */
import { setupHideTotalToggle } from '../ui.js';

describe('Hide total toggle', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="well-form">
        <button id="toggle_hide_total_btn">Hide total</button>
        <div class="result" id="result"> <p id="totalVolume">1.23 m³</p></div>
      </form>
    `;
  });

  it('toggles total-hidden class on the form and updates aria/label', () => {
    const btn = document.getElementById('toggle_hide_total_btn');
    const form = document.getElementById('well-form');
    setupHideTotalToggle();

    expect(form.classList.contains('total-hidden')).toBe(false);

    btn.click();
    expect(form.classList.contains('total-hidden')).toBe(true);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.textContent).toBe('Show total');

    btn.click();
    expect(form.classList.contains('total-hidden')).toBe(false);
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(btn.textContent).toBe('Hide total');
  });

  it('is keyboard accessible (Enter/Space)', () => {
    const btn = document.getElementById('toggle_hide_total_btn');
    const form = document.getElementById('well-form');
    setupHideTotalToggle();

    const enter = new KeyboardEvent('keydown', { key: 'Enter' });
    btn.dispatchEvent(enter);
    expect(form.classList.contains('total-hidden')).toBe(true);

    const space = new KeyboardEvent('keydown', { key: ' ' });
    btn.dispatchEvent(space);
    expect(form.classList.contains('total-hidden')).toBe(false);
  });
});
