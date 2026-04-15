import { useState, useEffect, useRef } from "react";
// import { apiService } from "../services/apiService";

export type SessionState =
  | "idle"
  | "selecting_duration"
  | "checked_in"
  | "logging_activity";

export interface CleanUpSession {
  state: SessionState;
  activeEventId: number | null;
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
  const restoredFromStorage = useRef<boolean>(false);
  const PENDING_KEY = "nea_pending_report";

  // Initialize from LocalStorage
  useEffect(() => {
    const pending = localStorage.getItem(PENDING_KEY);
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        const checkInTimeMs = new Date(parsed.checkInTime).getTime();
        const nowMs = Date.now();
        const elapsedSinceStart = Math.floor((nowMs - checkInTimeMs) / 1000);

        // Timer is considered completed if the real time elapsed from check-in 
        // is >= target duration, or if it was saved with full elapsedSeconds.
        const isTimerCompleted = 
          elapsedSinceStart >= parsed.durationSeconds || 
          parsed.elapsedSeconds >= parsed.durationSeconds;

        if (isTimerCompleted) {
          // Conditions met: show the Log Activity form
          // Mark as restored from storage — X icon should be hidden
          restoredFromStorage.current = true;
          setSession({
            state: "logging_activity",
            activeEventId: parsed.activeEventId,
            activeLogId: parsed.activeLogId,
            checkInTime: parsed.checkInTime,
            durationSeconds: parsed.durationSeconds,
            remainingSeconds: 0,
            elapsedSeconds: parsed.elapsedSeconds,
          });
          return; // Don't process nea_session if pending exists and is valid
        } else {
          // Timer not actually completed, remove the pending lock 
          // so it falls back to parsing `nea_session` and resuming the timer.
          localStorage.removeItem(PENDING_KEY);
        }
      } catch (e) {
        localStorage.removeItem(PENDING_KEY);
      }
    }

    const saved = localStorage.getItem("nea_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const checkInTime = new Date(parsed.checkInTime).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - checkInTime) / 1000);
        const remaining = parsed.durationSeconds - elapsed;

        if (remaining <= 0) {
          // Timer expired in background — save as pending report instead of auto-checkout
          localStorage.setItem(
            PENDING_KEY,
            JSON.stringify({
              activeEventId: parsed.activeEventId,
              activeLogId: parsed.activeLogId,
              checkInTime: parsed.checkInTime,
              durationSeconds: parsed.durationSeconds,
              elapsedSeconds: parsed.durationSeconds, // full duration elapsed
            }),
          );
          localStorage.removeItem("nea_session");
          // Don't auto-checkout — let user submit the form
        } else {
          // Restore active session
          setSession({
            state: "checked_in",
            activeEventId: parsed.activeEventId,
            activeLogId: parsed.activeLogId,
            checkInTime: parsed.checkInTime,
            durationSeconds: parsed.durationSeconds,
            remainingSeconds: remaining,
            elapsedSeconds: elapsed,
          });
        }
      } catch (e) {
        localStorage.removeItem("nea_session");
      }
    }
  }, []);

  // Start / stop timer whenever state changes
  useEffect(() => {
    if (session.state === "checked_in" && session.remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setSession((prev) => {
          if (prev.remainingSeconds <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);

            // Save pending report — user must submit form on next login
            localStorage.setItem(
              PENDING_KEY,
              JSON.stringify({
                activeEventId: prev.activeEventId,
                activeLogId: prev.activeLogId,
                checkInTime: prev.checkInTime,
                durationSeconds: prev.durationSeconds,
                elapsedSeconds: prev.durationSeconds, // full duration
              }),
            );
            localStorage.removeItem("nea_session");

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
  const openDurationPicker = (eventId: number) => {
    setSession((prev) => ({
      ...prev,
      state: "selecting_duration",
      activeEventId: eventId,
    }));
  };

  /** Called after user selects duration AND api check-in succeeds */
  const handleCheckIn = (logId: number, durationSecs: number) => {
    const timeNow = new Date().toISOString();

    localStorage.setItem(
      "nea_session",
      JSON.stringify({
        activeEventId: session.activeEventId,
        activeLogId: logId,
        checkInTime: timeNow,
        durationSeconds: durationSecs,
      }),
    );

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

    // Save pending report for the first time here
    localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({
        activeEventId: session.activeEventId,
        activeLogId: session.activeLogId,
        checkInTime: session.checkInTime,
        durationSeconds: session.durationSeconds,
        elapsedSeconds: elapsed,
      }),
    );

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
    localStorage.removeItem("nea_session");
    localStorage.removeItem(PENDING_KEY);
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
    restoredFromStorage: restoredFromStorage.current,
    openDurationPicker,
    cancelDurationPicker,
    handleCheckIn,
    initiateCheckout,
    cancelCheckout,
    completeSession,
  };
};
