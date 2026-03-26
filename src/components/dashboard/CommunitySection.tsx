import React from 'react';
import { Users, Calendar } from 'lucide-react';

export const CommunitySection: React.FC = () => {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Current/Upcoming Events */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-secondary" /> Active Events
        </h2>
        <div className="border-l-2 border-secondary pl-4 py-1">
          <p className="text-sm font-bold text-gray-900">Beach Clean-up Drive</p>
          <p className="text-[13px] text-gray-500 mt-1">Saturday, 9:00 AM • East Coast Park</p>
        </div>
      </div>

      {/* Groups */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Joined Groups
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="bg-blue-50 text-primary text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
            15-Hour Virtual Challenge
          </span>
          <span className="bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200">
            RISE
          </span>
          <span className="bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200">
            CleanHood
          </span>
          <span className="bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200">
            CAN
          </span>
        </div>
      </div>
    </div>
  );
};
