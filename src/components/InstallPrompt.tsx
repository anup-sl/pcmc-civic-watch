import { useState, useEffect } from 'react';
import { Download, X, Share2, PlusSquare, Smartphone, Check } from 'lucide-react';
import type { Language } from '../utils/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallPromptProps {
  language: Language;
}

export const InstallPrompt = ({ language }: InstallPromptProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [installed, setInstalled] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if already installed / running in standalone PWA mode
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((navigator as unknown as { standalone?: boolean }).standalone);
    
    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('pcmc_pwa_prompt_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    // 2. Check if iOS device (iPhone / iPad / iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !('MSStream' in window);
    setIsIOS(isIOSDevice);

    // 3. Listen for Android / Chromium beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setTimeout(() => setInstalled(false), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      // Fallback for browsers without beforeinstallprompt
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pcmc_pwa_prompt_dismissed', 'true');
  };

  if (isStandalone || isDismissed) {
    return null;
  }

  // Only show if deferredPrompt is available (Android/Desktop) or on iOS Safari
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <>
      {/* Sleek Floating Install Banner */}
      <aside 
        aria-label="Install PCMC CivicWatch App"
        className="fixed bottom-20 left-3 right-3 z-30 max-w-lg mx-auto bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200"
      >
        <div className="flex items-center justify-between gap-3">
          {/* App Icon & Details */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md ring-1 ring-cyan-400/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black text-white tracking-tight block truncate">
                {language === 'mr' ? 'CivicWatch ॲप इन्स्टॉल करा' : 'Install CivicWatch App'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block truncate">
                {installed 
                  ? (language === 'mr' ? '✓ यशस्वीरित्या इन्स्टॉल झाले!' : '✓ Installed Successfully!')
                  : (language === 'mr' ? 'होम स्क्रीनवर जोडा • जलद कॅमेरा' : 'Add to Home Screen • Instant Camera')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              {installed ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'इन्स्टॉल' : 'Install'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Safari "Add to Home Screen" Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[1300] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {language === 'mr' ? 'iPhone वर ॲप जोडा' : 'Install on iPhone / iPad'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === 'mr' ? 'Safari ब्राउझर द्वारे होम स्क्रीनवर जोडा' : 'Add to Home Screen via Safari'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step-by-Step iOS Safari Guide */}
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <span className="font-bold text-white block">
                    {language === 'mr' ? 'खालील शेअर (Share) बटण दाबा' : 'Tap the Share Button'}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    {language === 'mr' ? 'Safari च्या तळाशी असलेले' : 'At the bottom bar in Safari:'}
                    <Share2 className="w-3.5 h-3.5 text-blue-400 inline" />
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <span className="font-bold text-white block">
                    {language === 'mr' ? '"Add to Home Screen" निवडा' : 'Select "Add to Home Screen"'}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    {language === 'mr' ? 'खाली स्क्रोल करा आणि निवडा:' : 'Scroll down the share sheet and tap:'}
                    <PlusSquare className="w-3.5 h-3.5 text-cyan-400 inline" />
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <span className="font-bold text-white block">
                    {language === 'mr' ? 'उजवीकडे वर "Add" दाबा' : 'Tap "Add" in Top-Right'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    {language === 'mr' ? 'ॲप आपल्या होम स्क्रीनवर लगेच दिसेल.' : 'The app icon will now appear on your home screen.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              {language === 'mr' ? 'समजले' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
