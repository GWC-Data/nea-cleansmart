import { useState, useEffect } from 'react';

export type SessionState = 'idle' | 'scanning' | 'active' | 'logging_off';

export interface CleanUpSession {
  state: SessionState;
  startTime: Date | null;
  elapsedSeconds: number;
  location: string;
}

export const useCleanUpSession = () => {
  const [session, setSession] = useState<CleanUpSession>({
    state: 'idle',
    startTime: null,
    elapsedSeconds: 0,
    location: '',
  });

  useEffect(() => {
    let interval: number;
    if (session.state === 'active' && session.startTime) {
      interval = window.setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - session.startTime!.getTime()) / 1000);
        // Max 2 hours = 7200 seconds
        if (diff >= 7200) {
          setSession(prev => ({ ...prev, elapsedSeconds: 7200 }));
        } else {
          setSession(prev => ({ ...prev, elapsedSeconds: diff }));
        }
      }, 1000);
    }
    return () => window.clearInterval(interval);
  }, [session.state, session.startTime]);

  const startScanning = () => {
    setSession(prev => ({ ...prev, state: 'scanning' }));
  };

  const startSession = () => {
    // Location is mocked for now as per user instruction (will be fetched from Admin app soon)
    setSession({
      state: 'active',
      startTime: new Date(),
      elapsedSeconds: 0,
      location: 'East Coast Park - Zone A', 
    });
  };

  const cancelScanning = () => {
    setSession(prev => ({ ...prev, state: 'idle' }));
  };

  const initiateLogOff = () => {
    setSession(prev => ({ ...prev, state: 'logging_off' }));
  };

  const completeLogOff = () => {
    setSession({
      state: 'idle',
      startTime: null,
      elapsedSeconds: 0,
      location: '',
    });
  };

  const cancelLogOff = () => {
    setSession(prev => ({ ...prev, state: 'active' }));
  };

  return {
    ...session,
    startScanning,
    startSession,
    cancelScanning,
    initiateLogOff,
    completeLogOff,
    cancelLogOff
  };
};
