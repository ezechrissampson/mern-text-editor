import { useCallback, useEffect, useRef, useState } from 'react';
import autosaveApi from '../api/autosave.api';

export const SAVE_STATUS = {
  IDLE: 'idle',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error',
  CONFLICT: 'conflict',
};

/**
 * Drives autosave for the editor: debounced background saves on an
 * interval, a visual status indicator, and conflict surfacing when the
 * server reports the document changed elsewhere (see backend
 * autosave.service.detectConflict).
 */
export default function useAutosave({ documentId, getPayload, intervalMs = 15000, enabled = true }) {
  const [status, setStatus] = useState(SAVE_STATUS.IDLE);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [conflict, setConflict] = useState(null);
  const timerRef = useRef(null);

  const saveNow = useCallback(async () => {
    if (!documentId || !enabled) return;
    setStatus(SAVE_STATUS.SAVING);
    try {
      const payload = getPayload();
      await autosaveApi.save(documentId, payload);
      setStatus(SAVE_STATUS.SAVED);
      setLastSavedAt(new Date());
    } catch (err) {
      if (err.status === 409) {
        setStatus(SAVE_STATUS.CONFLICT);
        setConflict(err.details);
      } else {
        setStatus(SAVE_STATUS.ERROR);
      }
    }
  }, [documentId, enabled, getPayload]);

  useEffect(() => {
    if (!enabled) return undefined;
    timerRef.current = setInterval(saveNow, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [saveNow, intervalMs, enabled]);

  return { status, lastSavedAt, conflict, saveNow, clearConflict: () => setConflict(null) };
}
