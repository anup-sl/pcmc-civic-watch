import { useState, useEffect } from 'react';

/**
 * Returns true only when running on a mobile device (narrow viewport < 768px AND coarse pointer / touch / mobile user-agent).
 * Desktop / laptop displays (width >= 768px or fine mouse pointer) return false.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  const isNarrow = window.innerWidth < 768;
  const isCoarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints != null && navigator.maxTouchPoints > 0);
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || ''
  );

  // Viewports narrower than 768px are mobile view; touch tablets under 1024px also count as mobile
  return isNarrow || (window.innerWidth < 1024 && Boolean(isCoarse || hasTouch || isMobileUA));
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(isMobileDevice);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    let mql: MediaQueryList | null = null;
    if (typeof window.matchMedia === 'function') {
      mql = window.matchMedia('(max-width: 767px)');
      if (mql.addEventListener) {
        mql.addEventListener('change', handleResize);
      } else if ('addListener' in mql) {
        (mql as any).addListener(handleResize);
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (mql) {
        if (mql.removeEventListener) {
          mql.removeEventListener('change', handleResize);
        } else if ('removeListener' in mql) {
          (mql as any).removeListener(handleResize);
        }
      }
    };
  }, []);

  return isMobile;
}
