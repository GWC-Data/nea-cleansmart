import { useState } from 'react';

export type SessionState = 'idle' | 'checked_in' | 'logging_activity';

export interface CleanUpSession {
  state: SessionState;
  activeEventId: number | null;
  activeLogId: number | null;
  checkInTime: string | null;
}

export const useCleanUpSession = () => {
  const [session, setSession] = useState<CleanUpSession>({
    state: 'idle',
    activeEventId: null,
    activeLogId: null,
    checkInTime: null,
  });

  const handleCheckIn = (eventId: number, logId: number) => {
    setSession({
      state: 'checked_in',
      activeEventId: eventId,
      activeLogId: logId,
      checkInTime: new Date().toISOString(),
    });
  };

  const initiateCheckout = () => {
    setSession(prev => ({ ...prev, state: 'logging_activity' }));
  };

  const cancelCheckout = () => {
    setSession(prev => ({ ...prev, state: 'checked_in' }));
  };

  const completeSession = () => {
    setSession({
      state: 'idle',
      activeEventId: null,
      activeLogId: null,
      checkInTime: null,
    });
  };

  return {
    ...session,
    handleCheckIn,
    initiateCheckout,
    cancelCheckout,
    completeSession
  };
};
