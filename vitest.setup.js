import { vi } from 'vitest';

const shouldLog = process.env.VITEST_DEBUG_LOGS === '1';
const originalWarn = console.warn.bind(console);
const originalError = console.error.bind(console);

if (!shouldLog) {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation((...args) => {
    const message = args[0] ? String(args[0]) : '';
    if (message.includes('requestSubmit() method')) return;
    originalWarn(...args);
  });
  vi.spyOn(console, 'error').mockImplementation((...args) => {
    const message = args[0] ? String(args[0]) : '';
    if (message.includes('requestSubmit() method')) return;
    originalError(...args);
  });
}

const requestSubmitShim = function requestSubmit() {
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
  if (this.dispatchEvent(submitEvent) && typeof this.submit === 'function') {
    this.submit();
  }
};

try {
  Object.defineProperty(HTMLFormElement.prototype, 'requestSubmit', {
    configurable: true,
    writable: true,
    value: requestSubmitShim
  });
} catch (e) {
  HTMLFormElement.prototype.requestSubmit = requestSubmitShim;
}
