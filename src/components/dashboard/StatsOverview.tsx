import React from 'react';
import { Clock, Trash2, Trophy } from 'lucide-react';

export const StatsOverview: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <div className="bg-blue-50 p-2 sm:p-2.5 rounded-full mb-2 sm:mb-3">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        </div>
        <span className="text-xl sm:text-2xl font-bold text-gray-900">12.5h</span>
        <span className="text-[10px] sm:text-xs text-gray-500 font-medium mt-1">Logged</span>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <div className="bg-green-50 p-2 sm:p-2.5 rounded-full mb-2 sm:mb-3">
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
        </div>
        <span className="text-xl sm:text-2xl font-bold text-gray-900">8.2kg</span>
        <span className="text-[10px] sm:text-xs text-gray-500 font-medium mt-1">Collected</span>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <div className="bg-yellow-50 p-2 sm:p-2.5 rounded-full mb-2 sm:mb-3">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
        </div>
        <span className="text-xl sm:text-2xl font-bold text-gray-900">#42</span>
        <span className="text-[10px] sm:text-xs text-gray-500 font-medium mt-1">Ranking</span>
      </div>
    </div>
  );
};
