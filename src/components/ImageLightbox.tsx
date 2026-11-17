import { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface ImageLightboxProps {
  imageUrl: string;
  altText?: string;
  caption?: string;
  subCaption?: string;
  onClose: () => void;
}

export const ImageLightbox = ({
  imageUrl,
  altText = 'Issue Image',
  caption,
  subCaption,
  onClose
}: ImageLightboxProps) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleZoom = () => {
    triggerHaptic('selection');
    setZoomLevel((prev) => (prev === 1 ? 2 : 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel === 1 && e.touches.length === 1) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY !== null && zoomLevel === 1 && e.touches.length === 1) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY;
      if (diff > 0) {
        setSwipeOffset(diff);
      }
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 100) {
      triggerHaptic('light');
      onClose();
    } else {
      setSwipeOffset(0);
    }
    setTouchStartY(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: swipeOffset > 0 ? `translateY(${swipeOffset}px)` : 'none',
        opacity: swipeOffset > 0 ? Math.max(0.4, 1 - swipeOffset / 300) : 1,
        transition: touchStartY === null ? 'transform 0.2s ease, opacity 0.2s ease' : 'none'
      }}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-4 z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="min-w-0 pr-3">
          {caption && (
            <h4 className="text-sm font-bold text-white truncate">{caption}</h4>
          )}
          {subCaption && (
            <p className="text-xs text-slate-400 truncate">{subCaption}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleZoom}
            aria-label={zoomLevel > 1 ? 'Zoom out' : 'Zoom in'}
            className="w-12 h-12 rounded-full bg-slate-900/80 border border-slate-700 text-white flex items-center justify-center active:scale-95 transition-all shadow-lg"
          >
            {zoomLevel > 1 ? <ZoomOut className="w-5 h-5 text-cyan-400" /> : <ZoomIn className="w-5 h-5 text-cyan-400" />}
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            aria-label="Close image viewer"
            className="w-12 h-12 rounded-full bg-slate-900/80 border border-slate-700 text-white flex items-center justify-center active:scale-95 transition-all shadow-lg"
          >
            <X className="w-6 h-6 text-slate-200" />
          </button>
        </div>
      </div>

      {/* Main Center Image Display with Double-Tap Zoom */}
      <div
        className="flex-1 flex items-center justify-center p-2 overflow-hidden relative cursor-zoom-in"
        onClick={toggleZoom}
      >
        <img
          src={imageUrl}
          alt={altText}
          className="max-h-[82vh] max-w-full object-contain rounded-lg transition-transform duration-200 ease-out shadow-2xl"
          style={{
            transform: `scale(${zoomLevel})`,
            cursor: zoomLevel > 1 ? 'zoom-out' : 'zoom-in'
          }}
        />
      </div>

      {/* Bottom Dismiss Hint / Tap Tip */}
      <div className="p-3 text-center bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <span className="text-[11px] text-slate-400 font-medium inline-flex items-center gap-1.5 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
          <RotateCcw className="w-3 h-3 text-cyan-400" />
          Tap photo to zoom • Swipe down or tap ✕ to close
        </span>
      </div>
    </div>
  );
};
