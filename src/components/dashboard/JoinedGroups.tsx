import React from 'react';
import { Waves, Leaf, Recycle, ChevronRight } from 'lucide-react';

export const JoinedGroups: React.FC = () => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-[1.35rem] font-bold text-gray-900 tracking-tight">Joined Groups</h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="bg-[#08351e] text-white p-3 rounded-xl shrink-0">
            <Waves className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-extrabold text-gray-900 text-[13px] tracking-tight mb-0.5">
              Ocean Warriors
            </h4>
            <p className="text-[10px] text-gray-500 font-medium">
              2.4k Members &bull; 12 active
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="bg-[#a16207] text-white p-3 rounded-xl shrink-0">
            <Leaf className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-extrabold text-gray-900 text-[13px] tracking-tight mb-0.5">
              Green Tech SF
            </h4>
            <p className="text-[10px] text-gray-500 font-medium">
              850 Members &bull; 3 active
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-4 bg-[#f8faf9] p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="bg-[#475569] text-white p-3 rounded-xl shrink-0">
            <Recycle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-extrabold text-gray-900 text-[13px] tracking-tight mb-0.5">
              Urban Composter
            </h4>
            <p className="text-[10px] text-gray-500 font-medium">
              1.1k Members &bull; 5 active
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        <button className="w-full py-4 mt-2 border-2 border-dashed border-gray-300 rounded-2xl text-[13px] font-bold text-gray-600 bg-transparent hover:bg-gray-50 transition-colors">
          Discover New Groups
        </button>
      </div>
    </div>
  );
};
