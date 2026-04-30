import React, { useState, useEffect } from "react";
import { Camera, X, ScanLine } from "lucide-react";

interface QRScannerModalProps {
  onScanSuccess: () => void;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  onScanSuccess,
  onClose,
}) => {
  const [scanning, setScanning] = useState(true);

  // Auto-mock a successful scan after 2 seconds for smooth UX demo flow
  useEffect(() => {
    let timer: number;
    if (scanning) {
      timer = window.setTimeout(() => {
        setScanning(false);
        setTimeout(() => {
          onScanSuccess();
        }, 700);
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [scanning, onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-linear-to-b from-black/80 to-transparent">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-green-400" /> Check In
        </h2>
        <button
          onClick={onClose}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors backdrop-blur-sm"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="relative w-[80vw] max-w-sm aspect-square bg-gray-900 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
        <div className="absolute inset-0 flex items-center justify-center">
          {scanning ? (
            <div className="w-full h-full relative">
              <Camera className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white/30 animate-pulse" />
              {/* Animated scan line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-500 shadow-[0_0_20px_4px_rgba(34,197,94,0.6)] animate-scan-line" />
            </div>
          ) : (
            <div className="flex flex-col items-center text-white scale-in-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="font-extrabold text-2xl tracking-tight">Success!</p>
              <p className="text-green-100 font-medium text-sm mt-1">
                Starting timer...
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="absolute bottom-[10vh] text-center text-gray-400 text-sm font-medium max-w-[260px] leading-relaxed">
        {scanning
          ? "Point your camera at the location QR code to begin your clean-up session."
          : "Location identified. Preparing dashboard..."}
      </p>
    </div>
  );
};
