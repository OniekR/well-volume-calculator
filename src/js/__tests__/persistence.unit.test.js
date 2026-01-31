/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPersistence } from '../persistence.js';

const STORAGE_KEY = 'keino_volume_state_v2';

describe('persistence.js', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves captured state to localStorage', () => {
    const captureStateObject = vi.fn(() => ({ foo: 'bar' }));
    const { saveState } = createPersistence({ captureStateObject });
    saveState();
    expect(captureStateObject).toHaveBeenCalled();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toEqual({ foo: 'bar' });
  });

  it('debounces scheduleSave calls', () => {
    const captureStateObject = vi.fn(() => ({ value: 1 }));
    const { scheduleSave } = createPersistence({ captureStateObject });
    scheduleSave();
    scheduleSave();
    vi.runAllTimers();
    expect(captureStateObject).toHaveBeenCalledTimes(1);
  });

  it('loads state and calls applyStateObject when stored', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ preset: 'demo' }));
    const applyStateObject = vi.fn();
    const { loadState } = createPersistence({ captureStateObject: () => ({}) });
    loadState({
      applyStateObject,
      calculateVolume: vi.fn(),
      scheduleSave: vi.fn()
    });
    expect(applyStateObject).toHaveBeenCalled();
  });

  it('does nothing when no stored state exists', () => {
    const applyStateObject = vi.fn();
    const { loadState } = createPersistence({ captureStateObject: () => ({}) });
    loadState({ applyStateObject });
    expect(applyStateObject).not.toHaveBeenCalled();
  });
});
