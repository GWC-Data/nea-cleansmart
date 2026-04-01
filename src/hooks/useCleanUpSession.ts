import { useState, useEffect } from 'react';

export type SessionState = 'idle' | 'scanning' | 'selecting_duration' | 'active' | 'logging_off';

export interface CleanUpSession {
  state: SessionState;
  startTime: Date | null;
  elapsedSeconds: number;
  targetDuration: number;
  remainingSeconds: number;
  location: string;
}

export const useCleanUpSession = () => {
  const [session, setSession] = useState<CleanUpSession>({
    state: 'idle',
    startTime: null,
    elapsedSeconds: 0,
    targetDuration: 0,
    remainingSeconds: 0,
    location: '',
  });

  useEffect(() => {
    let interval: number;
    if (session.state === 'active' && session.startTime && session.targetDuration > 0) {
      interval = window.setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - session.startTime!.getTime()) / 1000);
        
        let newElapsed = diff;
        // Clamp to max target duration
        if (newElapsed >= session.targetDuration) {
          newElapsed = session.targetDuration;
        }
        
        const newRemaining = Math.max(0, session.targetDuration - newElapsed);

        setSession(prev => ({ 
          ...prev, 
          elapsedSeconds: newElapsed,
          remainingSeconds: newRemaining
        }));
      }, 1000);
    }
    return () => window.clearInterval(interval);
  }, [session.state, session.startTime, session.targetDuration]);

  const startScanning = () => {
    setSession(prev => ({ ...prev, state: 'scanning' }));
  };

  const handleScanSuccess = () => {
    setSession(prev => ({ ...prev, state: 'selecting_duration' }));
  };

  const startSession = (duration: number) => {
    setSession({
      state: 'active',
      startTime: new Date(),
      elapsedSeconds: 0,
      targetDuration: duration,
      remainingSeconds: duration,
      location: 'East Coast Park - Zone A', 
    });
  };

  const cancelScanning = () => {
    setSession(prev => ({ ...prev, state: 'idle' }));
  };

  const cancelDurationSelection = () => {
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
      targetDuration: 0,
      remainingSeconds: 0,
      location: '',
    });
  };

  const cancelLogOff = () => {
    setSession(prev => ({ ...prev, state: 'active' }));
  };

  return {
    ...session,
    startScanning,
    handleScanSuccess,
    startSession,
    cancelScanning,
    cancelDurationSelection,
    initiateLogOff,
    completeLogOff,
    cancelLogOff
  };
};
