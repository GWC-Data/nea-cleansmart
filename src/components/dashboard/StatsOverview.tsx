import React from "react";
import { Clock, Recycle, BarChart2 } from "lucide-react";

export const StatsOverview: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 2x2 Square Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Logged Hours Card */}
        <div className="bg-[#f8faf9] p-6 rounded-[2rem] flex flex-col items-start shadow-sm border border-gray-100/50">
          <div className="mb-6 bg-white p-2 rounded-full shadow-sm">
            <Clock className="w-5 h-5 text-[#08351e]" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">
            12.5 <span className="text-xl">h</span>
          </span>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5">
            Time logged
          </span>
        </div>

        {/* Collected Weight Card */}
        <div className="bg-[#f8faf9] p-6 rounded-[2rem] flex flex-col items-start shadow-sm border border-gray-100/50">
          <div className="mb-6 bg-white p-2 rounded-full shadow-sm">
            <Recycle className="w-5 h-5 text-[#caa46e]" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">
            9 <span className="text-xl">kg</span>
          </span>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5">
            Waste
          </span>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">
            Collected
          </span>
        </div>
      </div>

      {/* Hero Rank Pill */}
      <div className="bg-[#c2f2d1] p-4 pr-5 rounded-full flex items-center justify-between shadow-sm border border-[#a8e8bd]">
        <div className="flex items-center gap-4">
          <div className="bg-[#a8e8bd] w-12 h-12 rounded-full flex items-center justify-center shrink-0">
            <BarChart2 className="w-6 h-6 text-[#08351e]" />
          </div>
          <div className="flex flex-col">
            <h4 className="font-extrabold text-gray-900 text-[15px] mb-0.5">
              #12
            </h4>
            <p className="text-[11px] text-[#0a4527] uppercase font-medium opacity-80">
              Ranking
            </p>
          </div>
        </div>

        {/* Action Button */}
        {/* <button className="bg-[#08351e] hover:bg-[#0a4527] active:scale-95 transition-all w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md">
          <Plus className="w-5 h-5 text-white" />
        </button> */}
      </div>
    </div>
  );
};
