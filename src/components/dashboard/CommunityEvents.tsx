import React from 'react';
import { MapPin } from 'lucide-react';

export const CommunityEvents: React.FC = () => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-[1.35rem] font-bold text-gray-900 tracking-tight">Upcoming Cleanups Events</h2>
        {/* <button className="text-[#08351e] text-sm font-bold hover:underline">View All</button> */}
      </div>

      <div className="w-full overflow-x-auto snap-x hide-scrollbar scroll-smooth">
        <div className="flex gap-4 min-w-max pb-2">
          {/* Card 1 */}
          <div className="relative w-[300px] h-[200px] rounded-[2.5rem] overflow-hidden shadow-md snap-start shrink-0 group hover:shadow-xl transition-all border border-gray-100">
            <img 
              src="https://picsum.photos/seed/beach/600/400"
              alt="Coastal Revival Drive"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-linear-to-b from-black/0 via-black/20 to-black/80"></div>
            
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <div className="mb-2">
                <span className="inline-block bg-[#9bf8b7] text-[#08351e] text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                  Upcoming : Sat, Oct 12
                </span>
              </div>
              <h3 className="text-2xl font-black text-white leading-tight mb-2 tracking-tight drop-shadow-md">
                Coastal Revival<br />Drive
              </h3>
              <div className="flex items-center gap-1.5 text-white/90">
                <MapPin className="w-4 h-4 fill-transparent stroke-2 opacity-80" />
                <span className="text-[11px] font-semibold drop-shadow-md">Pacifica State Beach</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
           <div className="relative w-[300px] h-[200px] rounded-[2.5rem] overflow-hidden shadow-md snap-start shrink-0 group hover:shadow-xl transition-all border border-gray-100">
            <img 
              src="https://picsum.photos/seed/forest/600/400"
              alt="Muir Woods Saplings"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/0 via-black/20 to-black/80"></div>
            
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <div className="mb-2">
                <span className="inline-block bg-[#9bf8b7] text-[#08351e] text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                  Upcoming : Sun, Oct 13
                </span>
              </div>
              <h3 className="text-2xl font-black text-white leading-tight mb-2 tracking-tight drop-shadow-md">
                Muir Woods<br />Saplings
              </h3>
              <div className="flex items-center gap-1.5 text-white/90">
                <MapPin className="w-4 h-4 fill-transparent stroke-2 opacity-80" />
                <span className="text-[11px] font-semibold drop-shadow-md">Redwood Valley</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative w-[300px] h-[200px] rounded-[2.5rem] overflow-hidden shadow-md snap-start shrink-0 group hover:shadow-xl transition-all border border-gray-100">
            <img 
              src="https://picsum.photos/seed/city/600/400"
              alt="Downtown Sweep"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/0 via-black/20 to-black/80"></div>
            
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <div className="mb-2">
                <span className="inline-block bg-[#9bf8b7] text-[#08351e] text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                  Upcoming : Wed, Oct 16
                </span>
              </div>
              <h3 className="text-2xl font-black text-white leading-tight mb-2 tracking-tight drop-shadow-md">
                Downtown<br />Sweep
              </h3>
              <div className="flex items-center gap-1.5 text-white/90">
                <MapPin className="w-4 h-4 fill-transparent stroke-2 opacity-80" />
                <span className="text-[11px] font-semibold drop-shadow-md">Market Street</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
