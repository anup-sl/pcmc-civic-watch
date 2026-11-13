import { useState, useEffect } from 'react';
import { ReportTab } from './components/ReportTab';
import { MapTab } from './components/MapTab';
import { LeaderboardTab } from './components/LeaderboardTab';
import { BottomNav, type TabKey } from './components/BottomNav';
import { DirectoryModal } from './components/DirectoryModal';
import { FeedbackModal } from './components/FeedbackModal';
import { InstallPrompt } from './components/InstallPrompt';
import type { Language } from './utils/i18n';
import { TRANSLATIONS } from './utils/i18n';
import { PhoneCall, MessageSquareHeart } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('report');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [targetCoords, setTargetCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showDirectoryModal, setShowDirectoryModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  const t = TRANSLATIONS[language];

  // Load saved language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('pcmc_civicwatch_lang') as Language;
    if (savedLang === 'en' || savedLang === 'mr') {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
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
    setTargetCoords(coords);
    setActiveTab('report');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Sticky Top Header with Brand & Bilingual Switcher */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 header-safe-top">
        <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-cyan-900/30">
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

          {/* Right Header Controls: Directory Pill & EN | मराठी Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Feedback button */}
            <button
              type="button"
              onClick={() => setShowFeedbackModal(true)}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-pink-400 text-xs font-semibold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
              title="Share Feedback / Suggestions"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden sm:inline text-[11px]">{language === 'mr' ? 'अभिप्राय' : 'Feedback'}</span>
            </button>

            {/* Help / Directory button */}
            <button
              type="button"
              onClick={() => setShowDirectoryModal(true)}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 text-xs font-semibold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
              title="PCMC Helplines & Wards"
            >
              <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline text-[11px]">Help</span>
            </button>

            {/* Bilingual EN | मराठी Toggle Switch */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Toggle Language"
              className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <span className={`px-2 py-1 rounded-lg transition-all text-[11px] ${
                language === 'en' ? 'bg-cyan-500 text-slate-950 font-black shadow-xs' : 'text-slate-400'
              }`}>
                EN
              </span>
              <span className={`px-2 py-1 rounded-lg transition-all text-[11px] ${
                language === 'mr' ? 'bg-cyan-500 text-slate-950 font-black shadow-xs' : 'text-slate-400'
              }`}>
                मराठी
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto overflow-x-hidden">
        {activeTab === 'report' && (
          <ReportTab
            language={language}
            onNavigateToMap={handleNavigateToMap}
            onNavigateToLeaderboard={() => setActiveTab('leaderboard')}
            initialCoords={targetCoords}
          />
        )}
        {activeTab === 'map' && (
          <MapTab
            language={language}
            selectedHotspotId={selectedHotspotId}
            onSnapAtLocation={handleSnapAtLocation}
          />
        )}
        {activeTab === 'leaderboard' && (
          <LeaderboardTab language={language} />
        )}
      </main>

      {/* PWA Install to Home Screen Banner & iOS Guide */}
      <InstallPrompt language={language} />

      {/* 3 Bottom Navigation Tabs */}
      <BottomNav
        activeTab={activeTab}
        language={language}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'map') setSelectedHotspotId(null);
        }}
      />

      {/* Directory & Helplines Modal */}
      {showDirectoryModal && (
        <DirectoryModal
          language={language}
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
    </div>
  );
}

export default App;
