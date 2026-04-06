import { useState, useEffect, useRef } from 'react';

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

  // Start / stop timer whenever state changes
  useEffect(() => {
    if (session.state === 'checked_in' && session.remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setSession(prev => {
          if (prev.remainingSeconds <= 1) {
            // Time's up — auto-trigger checkout
            if (intervalRef.current) clearInterval(intervalRef.current);
            return { ...prev, remainingSeconds: 0, state: 'logging_activity' };
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
    setSession(prev => ({
      ...prev,
      state: 'checked_in',
      activeLogId: logId,
      checkInTime: new Date().toISOString(),
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
