import { useState, useEffect } from 'react';
import { ReportTab } from './components/ReportTab';
import { MapTab } from './components/MapTab';
import { LeaderboardTab } from './components/LeaderboardTab';
import { BottomNav, type TabKey } from './components/BottomNav';
import { DirectoryModal } from './components/DirectoryModal';
import { FeedbackModal } from './components/FeedbackModal';
import { ModeratorPortal } from './components/ModeratorPortal';
import { InstallPrompt } from './components/InstallPrompt';
import { OfflineBanner } from './components/OfflineBanner';
import { triggerHaptic } from './utils/haptics';
import type { Language } from './utils/i18n';
import { TRANSLATIONS } from './utils/i18n';
import { PhoneCall, MessageSquareHeart, Map, LayoutDashboard } from 'lucide-react';
import { getWardForArea } from './utils/pcmcDirectory';
import { useIsMobile, isMobileDevice } from './utils/device';
import { isStaging } from './utils/env';

export function App() {
  const isMobile = useIsMobile();
  // Mobile landing page defaults directly to 'report' (Capture & Report); desktop/laptop defaults to 'map'
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    return isMobileDevice() ? 'report' : 'map';
  });
  const [language, setLanguage] = useState<Language>('en');

  // If a desktop/laptop user is on or attempts to navigate to the report view, fallback active tab to 'map'
  useEffect(() => {
    if (!isMobile && activeTab === 'report') {
      setActiveTab('map');
    }
  }, [isMobile, activeTab]);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [targetCoords, setTargetCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showDirectoryModal, setShowDirectoryModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [showModeratorPortal, setShowModeratorPortal] = useState<boolean>(false);
  const [logoClicks, setLogoClicks] = useState<number>(0);
  const [detectedWardNo, setDetectedWardNo] = useState<number | string>(16);

  const t = TRANSLATIONS[language];

  // Auto-detect user ward for directory preselection
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const ward = getWardForArea('', pos.coords.latitude, pos.coords.longitude);
          if (ward && ward.wardNo) {
            setDetectedWardNo(ward.wardNo);
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // Auto-open moderator portal if ?admin or ?mod in URL or via custom event
  useEffect(() => {
    if (window.location.search.includes('admin') || window.location.search.includes('mod')) {
      setShowModeratorPortal(true);
    }
    const handleOpenMod = () => setShowModeratorPortal(true);
    window.addEventListener('open_moderator_portal', handleOpenMod);
    return () => window.removeEventListener('open_moderator_portal', handleOpenMod);
  }, []);

  const handleLogoClick = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next >= 5) {
      setShowModeratorPortal(true);
      setLogoClicks(0);
    }
    setTimeout(() => setLogoClicks(0), 3000);
  };

  // Load saved language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('pcmc_civicwatch_lang') as Language;
    if (savedLang === 'en' || savedLang === 'mr') {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    triggerHaptic('selection');
    const nextLang: Language = language === 'en' ? 'mr' : 'en';
    setLanguage(nextLang);
    try {
      localStorage.setItem('pcmc_civicwatch_lang', nextLang);
    } catch (e) {
      console.warn('Storage error:', e);
    }
  };

  const handleNavigateToMap = (hotspotId?: string) => {
    if (hotspotId) {
      setSelectedHotspotId(hotspotId);
    }
    setActiveTab('map');
  };

  const handleSnapAtLocation = (coords: { lat: number; lng: number }) => {
    if (!isMobile) return;
    setTargetCoords(coords);
    setActiveTab('report');
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {isStaging() && (
        <div className="w-full bg-amber-500/15 border-b border-amber-500/40 text-amber-300 text-xs font-semibold text-center py-1.5">
          QA / Test Environment (Safe Sandbox) — emails locked to anupsl.aws1@gmail.com
        </div>
      )}
      {/* Sticky Top Header with Brand & Bilingual Switcher */}
      <header className="sticky top-0 z-40 bg-[#090D16]/90 backdrop-blur-md border-b border-white/[0.07] header-safe-top">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div 
              onClick={handleLogoClick}
              role="button"
              tabIndex={0}
              title="PCMC CivicWatch"
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-cyan-900/30 cursor-pointer active:scale-90 transition-transform"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <circle cx="12" cy="11" r="2.5"/>
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate leading-tight">
                {t.appName}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Switcher (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setActiveTab('map');
              }}
              aria-label={t.mapTab}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'map'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>{t.mapTab}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setActiveTab('leaderboard');
                setSelectedHotspotId(null);
              }}
              aria-label={t.leaderboardTab}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.leaderboardTab}</span>
            </button>
          </nav>

          {/* Right Header Controls: Directory Pill & EN | मराठी Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Feedback button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowFeedbackModal(true);
              }}
              aria-label={language === 'mr' ? 'अभिप्राय आणि सूचना' : 'Share Feedback / Suggestions'}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-pink-400 text-xs font-semibold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
              title="Share Feedback / Suggestions"
            >
              <MessageSquareHeart className="w-4 h-4 text-pink-400" />
              <span className="hidden sm:inline text-[11px]">{language === 'mr' ? 'अभिप्राय' : 'Feedback'}</span>
            </button>

            {/* Help / Directory button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowDirectoryModal(true);
              }}
              aria-label={language === 'mr' ? 'PCMC हेल्पलाईन आणि प्रभाग डिरेक्टरी' : 'PCMC Helplines and Ward Directory'}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 text-xs font-semibold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
              title={language === 'mr' ? 'PCMC हेल्पलाईन आणि प्रभाग' : 'PCMC Helplines & Wards'}
            >
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline text-[11px]">{language === 'mr' ? 'मदत' : 'Help'}</span>
            </button>

            {/* Bilingual EN | मराठी Toggle Switch */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Toggle Language"
              className="min-h-[44px] flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <span className={`px-2.5 py-1.5 rounded-lg transition-all text-[11px] ${
                language === 'en' ? 'bg-cyan-500 text-slate-950 font-black shadow-xs' : 'text-slate-400'
              }`}>
                EN
              </span>
              <span className={`px-2.5 py-1.5 rounded-lg transition-all text-[11px] ${
                language === 'mr' ? 'bg-cyan-500 text-slate-950 font-black shadow-xs' : 'text-slate-400'
              }`}>
                मराठी
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Offline Status Indicator Banner */}
      <OfflineBanner language={language} />

      {/* Main Tab Content Area */}
      <main className="flex-1 w-full flex flex-col min-h-0 overflow-x-hidden">
        {isMobile && activeTab === 'report' && (
          <ReportTab
            language={language}
            onNavigateToMap={handleNavigateToMap}
            onNavigateToLeaderboard={() => {
              setActiveTab('leaderboard');
              setSelectedHotspotId(null);
            }}
            initialCoords={targetCoords}
          />
        )}
        {activeTab === 'map' && (
          <MapTab
            language={language}
            selectedHotspotId={selectedHotspotId}
            onSnapAtLocation={isMobile ? handleSnapAtLocation : undefined}
          />
        )}
        {activeTab === 'leaderboard' && (
          <LeaderboardTab 
            language={language} 
            onNavigateToMap={handleNavigateToMap} 
          />
        )}
      </main>

      {/* PWA Install to Home Screen Banner & iOS Guide */}
      <InstallPrompt language={language} isSheetOpen={Boolean(selectedHotspotId || showDirectoryModal || showFeedbackModal || showModeratorPortal)} />

      {/* 3 Bottom Navigation Tabs */}
      <BottomNav
        activeTab={activeTab}
        language={language}
        onTabChange={(tab) => {
          triggerHaptic('selection');
          setActiveTab(tab);
          if (tab !== 'map') setSelectedHotspotId(null);
        }}
      />

      {/* Directory & Helplines Modal */}
      {showDirectoryModal && (
        <DirectoryModal
          language={language}
          initialWardNo={detectedWardNo}
          onClose={() => setShowDirectoryModal(false)}
        />
      )}

      {/* Citizen Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          language={language}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}

      {/* Admin / Moderator Portal */}
      {showModeratorPortal && (
        <ModeratorPortal
          language={language}
          onClose={() => setShowModeratorPortal(false)}
        />
      )}
    </div>
  );
}

export default App;
