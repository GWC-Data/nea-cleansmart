import React from 'react';
import { Medal } from 'lucide-react';

export const RewardsSection: React.FC = () => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-[1.35rem] font-bold text-gray-900 tracking-tight">Rewards & Badges</h2>
      </div>

      <div className="bg-[#fcf8f2] rounded-[2rem] p-6 shadow-sm border border-orange-50/50 w-full mb-2">
        <div className="flex justify-around items-center">
          <div className="flex flex-col items-center gap-1 group">
            <div className="bg-[#bbf7d0] p-4 rounded-full shadow-inner border border-green-200 mb-1">
              <Medal className="w-5 h-5 text-[#0a4527]" />
            </div>
            <span className="text-[11px] font-bold text-gray-700">Silver</span>
            <span className="text-[9px] text-gray-400 font-medium">5 hrs</span>
          </div>

          <div className="flex flex-col items-center gap-1 group">
            <div className="bg-[#fde68a] p-4 rounded-full shadow-inner border border-yellow-200 mb-1">
              <Medal className="w-5 h-5 text-yellow-800" />
            </div>
            <span className="text-[11px] font-bold text-gray-700">Gold</span>
            <span className="text-[9px] text-gray-400 font-medium">10 hrs</span>
          </div>

          <div className="flex flex-col items-center gap-1 group">
            <div className="bg-[#e2e8f0] p-4 rounded-full shadow-inner border border-slate-200 mb-1">
              <Medal className="w-5 h-5 text-slate-700" />
            </div>
            <span className="text-[11px] font-bold text-gray-700">Diamond</span>
            <span className="text-[9px] text-gray-400 font-medium">15 hrs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
