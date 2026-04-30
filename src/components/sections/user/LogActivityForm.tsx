import React, { useState } from "react";
import { Camera, X } from "lucide-react";

interface LogActivityFormProps {
  elapsedSeconds: number;
  location: string;
  onCancel?: () => void;
  onSubmit: (
    weight: number,
    type: string,
    finalLocation: string,
    photo?: File,
  ) => Promise<void> | void;
  isMandatory?: boolean;
}

const WASTE_TYPES = [
  "Food waste (Styrofoam/packet/plastic)",
  "Packet/canned drinks",
  "Cigarette butts",
  "Tissue paper",
  "Flyers/Brochures/Pamphlets",
  "Stationery (Pens/Pencils/Erasers etc)",
];

export const LogActivityForm: React.FC<LogActivityFormProps> = ({
  elapsedSeconds,
  location,
  // onCancel,
  onSubmit,
  isMandatory,
}) => {
  const [weight, setWeight] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [manualLocation, setManualLocation] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getDurationText = () => {
    const h = Math.floor(elapsedSeconds / 3600);
    const m = Math.floor((elapsedSeconds % 3600) / 60);
    const s = elapsedSeconds % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  };

  const handleToggleType = (type: string) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type); // always allow uncheck
      }
      if (prev.length >= 3) return prev; // 👈 block if already 3 selected
      return [...prev, type];
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || isSubmitting) return;
    const typesJoined =
      selectedTypes.length > 0 ? selectedTypes.join(", ") : "mixed";
    const finalLocation = location || manualLocation;

    setIsSubmitting(true);
    try {
      await onSubmit(
        parseFloat(weight),
        typesJoined,
        finalLocation,
        photoFile ?? undefined,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Log Activity</h2>
            <p className="text-xs text-gray-500 font-medium">
              {isMandatory
                ? "⚠️ Please complete your previous session report"
                : "Session Report Checkout"}
            </p>
          </div>
          {/* {!isMandatory && ( // 👈 hide X when mandatory
            <button
              onClick={onCancel}
              className="cursor-pointer p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )} */}
        </div>

        <div className="overflow-y-auto p-5 pb-8 space-y-6">
          {/* Auto-filled details */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 shadow-sm">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Date</span>
              <span className="font-bold text-gray-900">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Duration so far</span>
              <span className="font-bold text-secondary">
                {getDurationText()}
              </span>
            </div>
            {location && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Location</span>
                <span
                  className="font-bold text-gray-900 text-right w-1/2 line-clamp-1 truncate"
                  title={location}
                >
                  {location}
                </span>
              </div>
            )}
          </div>

          <form id="logForm" onSubmit={handleSubmit} className="space-y-6">
            {!location && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">
                  Location <span className="text-red-500 font-medium">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="e.g. East Coast Park"
                  className="w-full bg-background border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all placeholder:text-gray-400"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Estimated Weight Collected{" "}
                <span className="text-red-500 font-medium">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 5.5"
                  className="w-full bg-background border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all placeholder:text-gray-400"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                  kg
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Photo Evidence{" "}
                <span className="text-gray-400 font-medium">(Optional)</span>
              </label>

              {/* Hidden real file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {photoPreview ? (
                <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-black/80 backdrop-blur-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <span className="text-white text-[10px] font-medium truncate max-w-[200px] block">
                      {photoFile?.name}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-secondary hover:bg-green-50/50 p-6 rounded-xl text-center flex flex-col items-center gap-3 transition-all group"
                >
                  <div className="bg-gray-100 group-hover:bg-soft p-3 rounded-full transition-colors">
                    <Camera className="w-6 h-6 text-gray-400 group-hover:text-secondary" />
                  </div>
                  <span className="text-sm text-gray-500 group-hover:text-secondary font-semibold">
                    Tap to upload a photo
                  </span>
                  <span className="text-xs text-gray-400">
                    JPG, PNG, WEBP supported
                  </span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900">
                Select up to 3 waste types{" "}
                <span className="text-red-500 font-medium">*</span>
              </label>
              <div className="space-y-2.5">
                {WASTE_TYPES.map((type) => (
                  <label
                    key={type}
                    className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-all shadow-sm ${selectedTypes.includes(type) ? "bg-soft border-secondary/40" : "border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50"}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleToggleType(type)}
                      className="mt-0.5 w-4 h-4 text-secondary bg-white border-gray-300 rounded focus:ring-secondary accent-secondary"
                    />
                    <span
                      className={`text-sm leading-snug font-medium ${selectedTypes.includes(type) ? "text-primary-dark" : "text-gray-700"}`}
                    >
                      {type}
                    </span>
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
            disabled={isSubmitting}
            className="cursor-pointer w-full bg-secondary hover:bg-secondary-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] text-base"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
};
