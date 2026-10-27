import React, { useState } from "react";
import { CalendarDays } from "lucide-react";
import { getEventImageUrl } from "../../utils/imageUtils";

export interface LazyEventImageProps {
  imagePath: string | null | undefined;
  alt: string;
  className?: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

/**
 * LazyEventImage
 *
 * Renders an event image reliably across all devices and screen sizes:
 * 1. The <img> is never hidden with opacity or display: none based on load state,
 *    ensuring that cached images whose browser onLoad event does not fire still display immediately.
 * 2. An animated shimmer skeleton is rendered as an absolutely positioned layer behind the image (z-0);
 *    the relative <img> (z-10) paints directly on top, covering the shimmer as soon as decoded.
 * 3. State is derived per src (`loadedSrc === src` and `failedSrc === src`) without useEffect state resets.
 * 4. onLoad purely hides the shimmer (cosmetic). onError switches to the fallback CalendarDays icon.
 * 5. Uses native loading="lazy" and decoding="async" for responsive performance and fast page paint.
 */
export const LazyEventImage: React.FC<LazyEventImageProps> = ({
  imagePath,
  alt,
  className = "w-full h-full object-cover",
}) => {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const src = imagePath ? getEventImageUrl(imagePath) : "";
  const isLoaded = Boolean(src && loadedSrc === src);
  const isFailed = Boolean(src && failedSrc === src);

  // Fallback to neutral calendar icon when imagePath is absent or if loading failed
  if (!imagePath || isFailed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <CalendarDays className="text-gray-300" size={24} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Shimmer skeleton rendered behind the image while loading */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-linear-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse z-0"
          aria-hidden="true"
        />
      )}

      {/* The <img> is positioned relative (z-10) so it paints on top and covers the shimmer */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`relative z-10 ${className}`}
        onLoad={() => setLoadedSrc(src)}
        onError={() => setFailedSrc(src)}
      />
    </div>
  );
};
