import React from 'react';
import { PlayCircle, MapPin, StopCircle } from 'lucide-react';

interface ActiveSessionCardProps {
  remainingSeconds: number;
  location: string;
  onLogOff: () => void;
}

export const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({
  remainingSeconds,
  location,
  onLogOff,
}) => {
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-secondary-hover to-secondary p-6 rounded-2xl shadow-lg mb-8 text-white relative overflow-hidden ring-4 ring-soft border border-secondary-hover">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-2 z-10 relative">
        <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
          <PlayCircle className="w-4 h-4" /> Active Session
        </div>
      </div>

      <div className="flex flex-col items-center justify-center my-6 z-10 relative">
        <span className="text-5xl font-mono font-bold tracking-tight mb-3 drop-shadow-sm tabular-nums">
          {formatTime(remainingSeconds)}
        </span>
        <div className="flex items-center gap-1.5 text-green-50 text-sm font-medium bg-black/10 px-3 py-1.5 rounded-full border border-black/5">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
      </div>

      <button
        onClick={onLogOff}
        className="w-full bg-white text-secondary-hover hover:bg-green-50 font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.98] z-10 relative"
      >
        <StopCircle className="w-5 h-5" /> Log Off & Submit
      </button>
    </div>
  );
};
