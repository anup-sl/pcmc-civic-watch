import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import type { Language } from '../utils/i18n';

interface OfflineBannerProps {
  language: Language;
}

export const OfflineBanner = ({ language }: OfflineBannerProps) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-600/95 text-white px-3.5 py-1.5 text-xs font-semibold flex items-center justify-between gap-2 shadow-md animate-in slide-in-from-top-2 duration-150 sticky top-[57px] z-30 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 min-w-0">
        <WifiOff className="w-4 h-4 shrink-0 text-amber-200" />
        <span className="truncate">
          {language === 'mr'
            ? 'ऑफ़लाइन मोड: इंटरनेट कनेक्शन उपलब्ध नाही. नेटवर्क परत आल्यावर डेटा सिंक होईल.'
            : 'Offline mode: No connection. Reports will sync when back online.'}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0 text-[10px] bg-amber-700/80 px-2 py-0.5 rounded-full font-bold">
        <RefreshCw className="w-3 h-3 animate-spin text-amber-200" />
        <span>{language === 'mr' ? 'प्रतिक्षा...' : 'Queued'}</span>
      </div>
    </div>
  );
};
