import React from 'react';
import { Medal } from 'lucide-react';

export const RewardsSection: React.FC = () => {
  // Demonstration: user has 12.5 hrs logged so far
  const hours = 12.5;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">Rewards & Badges</h2>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Silver Badge Milestone */}
        <div className={`flex flex-col items-center p-2 sm:p-3 rounded-xl border ${hours >= 5 ? 'border-gray-200 bg-gray-50' : 'border-dashed border-gray-200 opacity-50'}`}>
          <div className="bg-gray-200 p-2 rounded-full mb-2 shadow-inner">
            <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-gray-700">Silver</span>
          <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium mt-0.5">5 hrs</span>
        </div>

        {/* Gold Badge Milestone */}
        <div className={`flex flex-col items-center p-2 sm:p-3 rounded-xl border ${hours >= 10 ? 'border-yellow-200 bg-yellow-50 relative overflow-hidden' : 'border-dashed border-gray-200 opacity-50'}`}>
          <div className="bg-yellow-100/80 p-2 rounded-full mb-2 shadow-inner border border-yellow-200/50">
            <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-gray-800">Gold</span>
          <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium mt-0.5">10 hrs</span>
        </div>

        {/* Diamond Badge Milestone */}
        <div className={`flex flex-col items-center p-2 sm:p-3 rounded-xl border ${hours >= 15 ? 'border-blue-200 bg-blue-50 relative overflow-hidden' : 'border-dashed border-gray-200 opacity-50'}`}>
          <div className="bg-blue-100 p-2 rounded-full mb-2">
            <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-gray-800">Diamond</span>
          <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium mt-0.5">15 hrs</span>
        </div>
      </div>
      
      <p className="text-[10px] sm:text-[11px] text-center text-gray-400 mt-4 font-medium">
        Badges unlocked can be shared to social media!
      </p>
    </div>
  );
};
