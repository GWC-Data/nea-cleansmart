import React from "react";
import { CalendarDays, CheckCircle2 } from "lucide-react";

export const EventGuidelines: React.FC = () => {
  const guidelines = [
    "Ensure you are properly hydrated during your sessions.",
    "Wear covered shoes and safety gloves at all times.",
    "Separate recyclables from general waste if possible.",
    "Log your hours accurately; maximum active session allowed is 2 hours.",
  ];

  return (
    <div className="bg-[#ffffff] rounded-[2rem] p-6 border border-[#ffffff] shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#08351e] p-2 rounded-xl shadow-lg shadow-green-900/10">
          <CalendarDays className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-extrabold text-gray-900 text-lg tracking-tight">
            Event Guidelines
          </h3>
          {/* <p className="text-[10px] text-green-700 font-bold uppercase tracking-widest">
            Safety & Participation
          </p> */}
        </div>
      </div>

      <div className="grid gap-4">
        {guidelines.map((g, i) => (
          <div key={i} className="flex items-start gap-4 group">
            <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shrink-0 mt-0.5 border border-green-200 shadow-sm group-hover:border-green-400 group-hover:scale-110 transition-all duration-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#08351e]" />
            </div>
            <p className="text-sm text-gray-700 font-medium leading-relaxed group-hover:text-gray-900 transition-colors">
              {g}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
