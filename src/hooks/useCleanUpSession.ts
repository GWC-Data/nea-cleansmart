import { useState, useEffect, useRef, useCallback } from "react";

export type SessionState =
  | "idle"
  | "selecting_duration"
  | "checked_in"
  | "logging_activity";

export interface CleanUpSession {
  state: SessionState;
  activeEventId: string | null;
  activeLogId: number | null;
  checkInTime: string | null;
  durationSeconds: number; // Selected countdown duration
  remainingSeconds: number; // Live countdown value
  elapsedSeconds: number; // How long they actually ran
}

export const useCleanUpSession = () => {
  const [session, setSession] = useState<CleanUpSession>({
    state: "idle",
    activeEventId: null,
    activeLogId: null,
    checkInTime: null,
    durationSeconds: 0,
    remainingSeconds: 0,
    elapsedSeconds: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

// Initialize from server
  const initializeTimer = useCallback((serverData: {
    checkInTime: string;
    hoursEnrolled: string;
    eventId: string;
    logId: number;
  }) => {
    try {
      const checkInTimeMs = new Date(serverData.checkInTime).getTime();
      const nowMs = Date.now();
      const elapsed = Math.floor((nowMs - checkInTimeMs) / 1000);
      
      let durationSeconds = 0;
      const hoursStr = serverData.hoursEnrolled.toLowerCase();
      if (hoursStr.endsWith("min")) {
         durationSeconds = parseFloat(hoursStr) * 60;
      } else if (hoursStr.endsWith("hours") || hoursStr.endsWith("hour")) {
         durationSeconds = parseFloat(hoursStr) * 3600;
      } else {
         durationSeconds = parseFloat(hoursStr) * 3600; // default treating as hours or parse error
      }
      
      const remaining = durationSeconds - elapsed;

      if (remaining <= 0) {
        setSession({
          state: "logging_activity",
          activeEventId: serverData.eventId,
          activeLogId: serverData.logId,
          checkInTime: serverData.checkInTime,
          durationSeconds: durationSeconds,
          remainingSeconds: 0,
          elapsedSeconds: durationSeconds, // mark as full duration
        });
      } else {
        setSession({
          state: "checked_in",
          activeEventId: serverData.eventId,
          activeLogId: serverData.logId,
          checkInTime: serverData.checkInTime,
          durationSeconds: durationSeconds,
          remainingSeconds: remaining,
          elapsedSeconds: elapsed,
        });
      }
    } catch (e) {
      console.error("Failed to initialize timer from server", e);
    }
  }, []);

  // Start / stop timer whenever state changes
  useEffect(() => {
    if (session.state === "checked_in" && session.remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setSession((prev) => {
          if (prev.remainingSeconds <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);

            return {
              ...prev,
              state: "logging_activity", // show form immediately
              remainingSeconds: 0,
              elapsedSeconds: prev.durationSeconds,
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
  const openDurationPicker = (eventId: string) => {
    setSession((prev) => ({
      ...prev,
      state: "selecting_duration",
      activeEventId: eventId,
    }));
  };

  /** Called after user selects duration AND api check-in succeeds */
  const handleCheckIn = (logId: number, durationSecs: number) => {
    const timeNow = new Date().toISOString();

    setSession((prev) => ({
      ...prev,
      state: "checked_in",
      activeLogId: logId,
      checkInTime: timeNow,
      durationSeconds: durationSecs,
      remainingSeconds: durationSecs,
      elapsedSeconds: 0,
    }));
  };

  /** User cancelled the duration picker */
  const cancelDurationPicker = () => {
    setSession((prev) => ({ ...prev, state: "idle", activeEventId: null }));
  };

  /** User clicks "Stop Clean-up" */
  const initiateCheckout = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const elapsed = session.durationSeconds - session.remainingSeconds;

    setSession((prev) => ({
      ...prev,
      state: "logging_activity",
      elapsedSeconds: elapsed,
    }));
  };

  /** User cancels the log activity form */
  const cancelCheckout = () => {
    // Resume timer
    setSession((prev) => ({ ...prev, state: "checked_in" }));
  };

  /** Submitted the report — reset everything */
  const completeSession = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSession({
      state: "idle",
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
    restoredFromStorage: false,
    initializeTimer,
    openDurationPicker,
    cancelDurationPicker,
    handleCheckIn,
    initiateCheckout,
    cancelCheckout,
    completeSession,
  };
};
