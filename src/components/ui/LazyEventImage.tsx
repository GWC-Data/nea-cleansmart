import React, { useState, useEffect, useRef } from "react";
import { CalendarDays } from "lucide-react";
import { getEventImageUrl } from "../../utils/imageUtils";

interface LazyEventImageProps {
  imagePath: string | null | undefined;
  alt: string;
  className?: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

/**
 * LazyEventImage
 *
 * Renders an event image asynchronously with the following behaviour:
 * 1. Shows a shimmer skeleton while loading.
 * 2. If the first load fails (e.g. file not yet fully written to disk after POST),
 *    it retries up to `maxRetries` times with an exponential back-off.
 * 3. Falls back to a neutral placeholder icon if all retries fail.
 */
export const LazyEventImage: React.FC<LazyEventImageProps> = ({
  imagePath,
  alt,
  className = "w-full h-full object-cover",
  maxRetries = 3,
  retryDelayMs = 800,
}) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    imagePath ? "loading" : "error"
  );
  const [attempt, setAttempt] = useState(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const src = getEventImageUrl(imagePath);

  // Reset when imagePath changes (e.g. list refresh after creation)
  useEffect(() => {
    if (!imagePath) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    setAttempt(0);
  }, [imagePath]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, []);

  const handleLoad = () => setStatus("loaded");

  const handleError = () => {
    if (attempt < maxRetries) {
      // Exponential back-off: 800ms, 1600ms, 3200ms…
      const delay = retryDelayMs * Math.pow(2, attempt);
      retryTimer.current = setTimeout(() => {
        setAttempt((a) => a + 1);
        setStatus("loading");
      }, delay);
    } else {
      setStatus("error");
    }
  };

  // Generate a cache-busted URL on each retry so the browser re-fetches
  const retrySrc = attempt > 0 ? `${src}?retry=${attempt}` : src;

  if (!imagePath || status === "error") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <CalendarDays className="text-gray-300" size={24} />
      </div>
    );
  }

  return (
    <>
      {/* Shimmer placeholder shown while loading */}
      {status === "loading" && (
        <div className="absolute inset-0 bg-linear-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
      )}
      <img
        key={retrySrc}
        src={retrySrc}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          status === "loaded" ? "opacity-100" : "opacity-0"
        }`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
};
