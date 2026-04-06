import React, { useState } from 'react';
import { X, Calendar, Users, MapPin } from 'lucide-react';
import type { EventData } from '../../services/apiService';

interface EventDetailsModalProps {
  event: EventData;
  onClose: () => void;
  onSuccessClose: () => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  onClose,
  onSuccessClose,
}) => {
  const [view, setView] = useState<'details' | 'confirm' | 'success'>('details');

  const handleJoinClick = () => {
    setView('confirm');
  };

  const handleConfirmJoin = () => {
    // Here an actual API call to join the event would be made
    setView('success');
  };

  const handleSuccessClose = () => {
    onSuccessClose();
  };

  if (view === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center border-t-4 border-green-500 animate-in zoom-in-95">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-extrabold text-green-700 mb-2">You're In!</h2>
          <p className="text-gray-600 font-medium mb-8">
            Thank you for joining {event.name}!
          </p>
          <button
            onClick={handleSuccessClose}
            className="w-full bg-[#428b5e] hover:bg-[#34704b] text-white font-bold py-3 rounded-lg transition-colors cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  if (view === 'confirm') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 lg:p-8 border-t-4 border-green-500 animate-in zoom-in-95">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center flex items-center justify-center gap-2">
            Ready to Join? <span className="text-xl">🌱</span>
          </h2>
          <p className="text-gray-600 text-center font-medium mb-8">
            You're about to be part of the {event.name}! Here is to contributing to keeping Singapore clean!
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setView('details')}
              className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmJoin}
              className="flex-1 py-3 bg-[#428b5e] hover:bg-[#34704b] text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Yes, Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View: Details
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center sm:justify-center p-0 md:p-4 bg-white md:bg-black/60 md:backdrop-blur-sm animate-in fade-in">
      
      {/* Mobile top bar with back arrow */}
      <div className="md:hidden flex items-center p-4 border-b border-gray-100 bg-white sticky top-0 z-10 w-full shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span className="ml-2 font-bold text-lg">{event.name}</span>
      </div>

      <div className="bg-white md:rounded-[2rem] w-full max-w-2xl h-full md:h-auto md:max-h-[85vh] flex flex-col relative overflow-hidden shadow-2xl">
        
        {/* Desktop close button */}
        <button 
          onClick={onClose}
          className="hidden md:flex absolute top-4 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full items-center justify-center text-gray-500 hover:text-gray-900 transition-colors shadow-sm cursor-pointer hover:bg-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto w-full relative">
            <div className="h-64 md:h-72 w-full relative shrink-0">
              <img 
                src="https://picsum.photos/seed/eventdetail/800/600" 
                alt="Event cover" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-block bg-white text-gray-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md mb-3">
                  Featured Event
                </span>
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-md">
                  {event.name}
                </h1>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8 pb-32">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date</p>
                    <p className="font-semibold text-gray-900 text-sm">{formattedDate} Onwards</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Joined</p>
                    <p className="font-semibold text-gray-900 text-sm">25,584</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Location</p>
                    <p className="font-semibold text-gray-900 text-sm w-[150px] truncate" title={event.location}>{event.location}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Details</h3>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <p className="text-gray-700 text-sm font-medium">1 clean-up (minimum 30 minutes to maximum 2 hours)</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  We all have a hand in keeping Singapore clean. Join us in completing 15 hours of clean-up activities throughout 2026. This is more than just a clean-up initiative—make a meaningful difference today, enjoy yourself, and become part of Singapore's continuing story of cleanliness and community pride.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Reward</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  All members who complete 15 hours of clean-up activities in 2026 will receive an attractive premium from PHC. Terms and conditions apply.
                </p>
              </div>
            </div>
        </div>

        {/* Bottom fixed action bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)]">
          <button 
            onClick={handleJoinClick}
            className="w-full bg-[#428b5e] hover:bg-[#34704b] text-white text-base font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            Yes, Join
          </button>
        </div>
      </div>
    </div>
  );
};
