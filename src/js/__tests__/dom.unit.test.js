/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { el, qs, setAttr, toggleClass } from '../dom.js';

describe('dom.js', () => {
  let originalBody;

  beforeEach(() => {
    originalBody = document.body.innerHTML;
  });

  afterEach(() => {
    document.body.innerHTML = originalBody;
  });

  describe('el()', () => {
    it('returns element when it exists', () => {
      document.body.innerHTML = '<div id="test-element">Hello</div>';
      const result = el('test-element');
      expect(result).not.toBeNull();
      expect(result.textContent).toBe('Hello');
    });

    it('returns null when element does not exist', () => {
      document.body.innerHTML = '<div id="other"></div>';
      const result = el('nonexistent');
      expect(result).toBeNull();
    });

    it('returns null for empty string id', () => {
      document.body.innerHTML = '<div id="test"></div>';
      const result = el('');
      expect(result).toBeNull();
    });
  });

  describe('qs()', () => {
    it('returns array of matching elements', () => {
      document.body.innerHTML = `
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
      `;
      const result = qs('.item');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });

    it('returns empty array when no elements match', () => {
      document.body.innerHTML = '<div class="other"></div>';
      const result = qs('.nonexistent');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('works with complex selectors', () => {
      document.body.innerHTML = `
        <div class="container">
          <span class="target">A</span>
          <span class="target">B</span>
        </div>
        <span class="target">C</span>
      `;
      const result = qs('.container .target');
      expect(result).toHaveLength(2);
    });

    it('returns elements in document order', () => {
      document.body.innerHTML = `
        <div class="item" data-order="1">First</div>
        <div class="item" data-order="2">Second</div>
      `;
      const result = qs('.item');
      expect(result[0].dataset.order).toBe('1');
      expect(result[1].dataset.order).toBe('2');
    });
  });

  describe('setAttr()', () => {
    it('sets attribute on existing element', () => {
      document.body.innerHTML = '<input id="test-input" />';
      const input = el('test-input');
      setAttr(input, 'disabled', 'true');
      expect(input.getAttribute('disabled')).toBe('true');
    });

    it('handles null element gracefully', () => {
      expect(() => setAttr(null, 'disabled', 'true')).not.toThrow();
    });

    it('handles undefined element gracefully', () => {
      expect(() => setAttr(undefined, 'disabled', 'true')).not.toThrow();
    });

    it('overwrites existing attribute', () => {
      document.body.innerHTML = '<div id="test" data-value="old"></div>';
      const div = el('test');
      setAttr(div, 'data-value', 'new');
      expect(div.getAttribute('data-value')).toBe('new');
    });

    it('sets empty string attribute', () => {
      document.body.innerHTML = '<div id="test"></div>';
      const div = el('test');
      setAttr(div, 'data-empty', '');
      expect(div.getAttribute('data-empty')).toBe('');
    });
  });

  describe('toggleClass()', () => {
    it('adds class when condition is true', () => {
      document.body.innerHTML = '<div id="test"></div>';
      const div = el('test');
      toggleClass(div, 'active', true);
      expect(div.classList.contains('active')).toBe(true);
    });

    it('removes class when condition is false', () => {
      document.body.innerHTML = '<div id="test" class="active"></div>';
      const div = el('test');
      toggleClass(div, 'active', false);
      expect(div.classList.contains('active')).toBe(false);
    });

    it('handles null element gracefully', () => {
      expect(() => toggleClass(null, 'active', true)).not.toThrow();
    });

    it('handles undefined element gracefully', () => {
      expect(() => toggleClass(undefined, 'active', true)).not.toThrow();
    });

    it('does not affect other classes when adding', () => {
      document.body.innerHTML = '<div id="test" class="existing other"></div>';
      const div = el('test');
      toggleClass(div, 'active', true);
      expect(div.classList.contains('existing')).toBe(true);
      expect(div.classList.contains('other')).toBe(true);
      expect(div.classList.contains('active')).toBe(true);
    });

    it('does not affect other classes when removing', () => {
      document.body.innerHTML =
        '<div id="test" class="existing active other"></div>';
      const div = el('test');
      toggleClass(div, 'active', false);
      expect(div.classList.contains('existing')).toBe(true);
      expect(div.classList.contains('other')).toBe(true);
      expect(div.classList.contains('active')).toBe(false);
    });

    it('is idempotent for adding', () => {
      document.body.innerHTML = '<div id="test" class="active"></div>';
      const div = el('test');
      toggleClass(div, 'active', true);
      toggleClass(div, 'active', true);
      expect(div.classList.contains('active')).toBe(true);
      expect(div.className).toBe('active');
    });

    it('is idempotent for removing', () => {
      document.body.innerHTML = '<div id="test"></div>';
      const div = el('test');
      toggleClass(div, 'active', false);
      toggleClass(div, 'active', false);
      expect(div.classList.contains('active')).toBe(false);
    });
  });
});
