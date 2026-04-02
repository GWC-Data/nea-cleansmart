import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';

interface LogActivityFormProps {
  checkInTime: string | null;
  location: string;
  onCancel: () => void;
  onSubmit: (weight: number, type: string) => void;
}

const WASTE_TYPES = [
  'Food waste (Styrofoam/packet/plastic)',
  'Packet/canned drinks',
  'Cigarette butts',
  'Tissue paper',
  'Flyers/Brochures/Pamphlets',
  'Stationery (Pens/Pencils/Erasers etc)'
];

export const LogActivityForm: React.FC<LogActivityFormProps> = ({
  checkInTime,
  location,
  onCancel,
  onSubmit,
}) => {
  const [weight, setWeight] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [photoMock, setPhotoMock] = useState<string | null>(null);

  const getDurationText = () => {
    if (!checkInTime) return '0h 00m';
    const diff = Math.floor((new Date().getTime() - new Date(checkInTime).getTime()) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    return `${h.toString()}h ${m.toString().padStart(2, '0')}m`;
  };

  const handleToggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return; // Prevent submission without weight
    const primaryType = selectedTypes.length > 0 ? selectedTypes[0] : 'mixed';
    onSubmit(parseFloat(weight), primaryType);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Log Activity</h2>
            <p className="text-xs text-gray-500 font-medium">Session Report Checkout</p>
          </div>
          <button onClick={onCancel} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 pb-8 space-y-6">
          {/* Auto-filled details */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 shadow-sm">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Date</span>
              <span className="font-bold text-gray-900">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Duration so far</span>
              <span className="font-bold text-secondary">{getDurationText()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Location</span>
              <span className="font-bold text-gray-900 text-right w-1/2 line-clamp-1 truncate" title={location}>{location}</span>
            </div>
          </div>

          <form id="logForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Estimated Weight Collected <span className="text-red-500 font-medium">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder="e.g. 5.5"
                  className="w-full bg-background border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all placeholder:text-gray-400"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">kg</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Photo Evidence <span className="text-gray-400 font-medium">(Optional)</span>
              </label>
              {photoMock ? (
                <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium border border-gray-300 px-3 py-1.5 rounded-lg bg-white shadow-sm flex items-center gap-2">
                      <Camera className="w-4 h-4 text-secondary" /> AttachedPhoto.jpg
                    </span>
                  </div>
                  <button type="button" onClick={() => setPhotoMock(null)} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-black/80 backdrop-blur-sm transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPhotoMock('mocked')}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-secondary hover:bg-green-50/50 hover:text-secondary p-6 rounded-xl text-center flex flex-col items-center gap-3 transition-all group"
                >
                  <div className="bg-gray-100 group-hover:bg-soft p-3 rounded-full transition-colors">
                    <Camera className="w-6 h-6 text-gray-400 group-hover:text-secondary" />
                  </div>
                  <span className="text-sm text-gray-500 group-hover:text-secondary font-semibold">Tap to upload a photo</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900">
                Type of Waste <span className="text-red-500 font-medium">*</span>
              </label>
              <div className="space-y-2.5">
                {WASTE_TYPES.map(type => (
                  <label key={type} className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-all shadow-sm ${selectedTypes.includes(type) ? 'bg-soft border-secondary/40' : 'border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50' }`}>
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleToggleType(type)}
                      className="mt-0.5 w-4 h-4 text-secondary bg-white border-gray-300 rounded focus:ring-secondary accent-secondary"
                    />
                    <span className={`text-sm leading-snug font-medium ${selectedTypes.includes(type) ? 'text-primary-dark' : 'text-gray-700'}`}>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-white sticky bottom-0 z-10 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
          <button
            type="submit"
            form="logForm"
            className="w-full bg-secondary hover:bg-secondary-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] text-base"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
};
