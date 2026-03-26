import React from 'react';
import { Info } from 'lucide-react';

export const EventGuidelines: React.FC = () => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
        <Info className="w-5 h-5 text-yellow-500" /> Event Guidelines
      </h2>
      <ul className="text-[13px] sm:text-sm text-gray-600 list-disc pl-5 space-y-2 leading-relaxed">
        <li>Ensure you are properly hydrated during your sessions.</li>
        <li>Wear covered shoes and safety gloves at all times.</li>
        <li>Separate recyclables from general waste if possible.</li>
        <li>Log your hours accurately; maximum active session allowed is 2 hours.</li>
      </ul>
    </div>
  );
};
