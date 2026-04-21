import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';

interface DurationSelectModalProps {
  onSelect: (seconds: number) => void;
  onCancel: () => void;
  todayHours?: number;
}

export const DurationSelectModal: React.FC<DurationSelectModalProps> = ({
  onSelect,
  onCancel,
  todayHours = 0,
}) => {
  const [selectedSeconds, setSelectedSeconds] = useState<number | null>(null);

  const ALL_OPTIONS = [
    { label: '30 Min', value: 1800 },
    { label: '1 Hour', value: 3600 },
    { label: '1.5 Hours', value: 5400 },
    { label: '2 Hours', value: 7200 },
  ];

  const remainingHours = Math.max(0, 2 - todayHours);
  const OPTIONS = ALL_OPTIONS.filter(opt => opt.value / 3600 <= remainingHours + 0.01); // +0.01 to handle float precision


  const handleStart = () => {
    if (selectedSeconds) {
      onSelect(selectedSeconds);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Clock className="w-6 h-6 text-secondary" />
              Session Duration
            </h2>
            <button 
              onClick={onCancel}
              className="cursor-pointer w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-500 mb-8 font-medium">
            Please select how long you plan to clean. The timer will count down from this duration (maximum 2 hours).
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedSeconds(option.value)}
                className={`cursor-pointer flex flex-col items-center justify-center py-4 px-6 rounded-2xl border-2 transition-all font-bold ${
                  selectedSeconds === option.value
                    ? 'border-[#08351e] bg-[#e6f4ea] text-[#08351e] shadow-md'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleStart}
            disabled={!selectedSeconds}
            className="cursor-pointer w-full bg-[#96c93d] hover:bg-[#86b537] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-extrabold py-4 rounded-xl transition-colors shadow-sm"
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
};
