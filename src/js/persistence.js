import {
  saveState as storageSave,
  loadState as storageLoad
} from './storage.js';

export function createPersistence({ captureStateObject }) {
  const STORAGE_KEY = 'keino_volume_state_v2';
  let saveTimer = null;

  function saveState() {
    try {
      const state = captureStateObject();
      storageSave(STORAGE_KEY, state);
    } catch (e) {
      /* ignore */
    }
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 200);
  }

  function loadState({
    applyStateObject,
    calculateVolume,
    scheduleSave: externalSchedule
  } = {}) {
    try {
      const state = storageLoad(STORAGE_KEY);
      if (!state) return;
      if (applyStateObject && typeof applyStateObject === 'function') {
        applyStateObject(state, {
          calculateVolume,
          scheduleSave: externalSchedule || scheduleSave
        });
      }
    } catch (e) {
      /* ignore */
    }
  }

  return { saveState, scheduleSave, loadState };
}
