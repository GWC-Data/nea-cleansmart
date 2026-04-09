import { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/apiService';

export type SessionState = 'idle' | 'selecting_duration' | 'checked_in' | 'logging_activity';

export interface CleanUpSession {
  state: SessionState;
  activeEventId: number | null;
  activeLogId: number | null;
  checkInTime: string | null;
  durationSeconds: number;    // Selected countdown duration
  remainingSeconds: number;   // Live countdown value
  elapsedSeconds: number;     // How long they actually ran
}

export const useCleanUpSession = () => {
  const [session, setSession] = useState<CleanUpSession>({
    state: 'idle',
    activeEventId: null,
    activeLogId: null,
    checkInTime: null,
    durationSeconds: 0,
    remainingSeconds: 0,
    elapsedSeconds: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('nea_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const checkInTime = new Date(parsed.checkInTime).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - checkInTime) / 1000);
        const remaining = parsed.durationSeconds - elapsed;

        if (remaining <= 0) {
          // Timer expired in background — auto checkout
          apiService.checkOutEvent(parsed.activeLogId, {
            checkOutTime: new Date().toISOString(),
            garbageWeight: 0,
            garbageType: ""
          });
          localStorage.removeItem('nea_session');
        } else {
          // Restore active session
          setSession({
            state: 'checked_in',
            activeEventId: parsed.activeEventId,
            activeLogId: parsed.activeLogId,
            checkInTime: parsed.checkInTime,
            durationSeconds: parsed.durationSeconds,
            remainingSeconds: remaining,
            elapsedSeconds: elapsed,
          });
        }
      } catch (e) {
        localStorage.removeItem('nea_session');
      }
    }
  }, []);

  // Start / stop timer whenever state changes
  useEffect(() => {
    if (session.state === 'checked_in' && session.remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setSession(prev => {
          if (prev.remainingSeconds <= 1) {
            // Time's up natively — auto checkout & bypass form
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (prev.activeLogId) {
              apiService.checkOutEvent(prev.activeLogId, {
                checkOutTime: new Date().toISOString(),
                garbageWeight: 0,
                garbageType: ""
              });
            }
            localStorage.removeItem('nea_session');
            return {
              state: 'idle',
              activeEventId: null,
              activeLogId: null,
              checkInTime: null,
              durationSeconds: 0,
              remainingSeconds: 0,
              elapsedSeconds: 0,
            };
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
            elapsedSeconds: prev.elapsedSeconds + 1,
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session.state]);

  /** Open the duration picker for an event */
  const openDurationPicker = (eventId: number) => {
    setSession(prev => ({ ...prev, state: 'selecting_duration', activeEventId: eventId }));
  };

  /** Called after user selects duration AND api check-in succeeds */
  const handleCheckIn = (logId: number, durationSecs: number) => {
    const timeNow = new Date().toISOString();
    
    // Persist to storage
    localStorage.setItem('nea_session', JSON.stringify({
      activeEventId: session.activeEventId,
      activeLogId: logId,
      checkInTime: timeNow,
      durationSeconds: durationSecs
    }));

    setSession(prev => ({
      ...prev,
      state: 'checked_in',
      activeLogId: logId,
      checkInTime: timeNow,
      durationSeconds: durationSecs,
      remainingSeconds: durationSecs,
      elapsedSeconds: 0,
    }));
  };

  /** User cancelled the duration picker */
  const cancelDurationPicker = () => {
    setSession(prev => ({ ...prev, state: 'idle', activeEventId: null }));
  };

  /** User clicks "Stop Clean-up" */
  const initiateCheckout = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSession(prev => ({
      ...prev,
      state: 'logging_activity',
      // capture elapsed before stopping
      elapsedSeconds: prev.durationSeconds - prev.remainingSeconds,
    }));
  };

  /** User cancels the log activity form */
  const cancelCheckout = () => {
    // Resume timer
    setSession(prev => ({ ...prev, state: 'checked_in' }));
  };

  /** Submitted the report — reset everything */
  const completeSession = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    localStorage.removeItem('nea_session');
    setSession({
      state: 'idle',
      activeEventId: null,
      activeLogId: null,
      checkInTime: null,
      durationSeconds: 0,
      remainingSeconds: 0,
      elapsedSeconds: 0,
    });
  };

  return {
    ...session,
    openDurationPicker,
    cancelDurationPicker,
    handleCheckIn,
    initiateCheckout,
    cancelCheckout,
    completeSession,
  };
};
