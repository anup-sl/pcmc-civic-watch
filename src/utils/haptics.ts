// Utility for haptic feedback on supported mobile devices
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' = 'light') => {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'selection':
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(40);
        break;
      case 'success':
        navigator.vibrate([15, 30, 20]);
        break;
      case 'warning':
        navigator.vibrate([30, 50, 30]);
        break;
      default:
        navigator.vibrate(15);
    }
  } catch {
    // Graceful fallback on devices blocking or lacking vibration
  }
};
