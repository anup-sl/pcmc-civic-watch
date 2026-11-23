import { FileText, Map, LayoutDashboard } from 'lucide-react';
import type { Language } from '../utils/i18n';
import { TRANSLATIONS } from '../utils/i18n';

export type TabKey = 'report' | 'map' | 'leaderboard';

interface BottomNavProps {
  activeTab: TabKey;
  language: Language;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNav = ({ activeTab, language, onTabChange }: BottomNavProps) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#090D16]/90 backdrop-blur-2xl border-t border-white/[0.08] pb-safe md:hidden">
      <div className="max-w-lg mx-auto px-6 h-16 flex items-center justify-around">
        {/* MAP TAB */}
        <button
          type="button"
          onClick={() => onTabChange('map')}
          aria-label={t.mapTab}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center gap-1 w-20 py-1 transition-all ${
            activeTab === 'map'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'map' ? 'bg-emerald-950/50 text-emerald-400' : ''}`}>
            <Map className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight">{t.mapTab}</span>
        </button>

        {/* REPORT TAB (Prominent Center Emerald Button) */}
        <button
          type="button"
          onClick={() => onTabChange('report')}
          aria-label={t.reportTab}
          className="relative -top-4 flex flex-col items-center group active:scale-95 transition-transform"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all border-2 ${
              activeTab === 'report'
                ? 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 text-white border-emerald-300 shadow-emerald-500/35 ring-4 ring-emerald-500/25 animate-pulse-subtle'
                : 'bg-[#111827] text-slate-300 border-white/[0.1] hover:border-emerald-500 group-hover:text-emerald-400 shadow-black/50'
            }`}
          >
            <FileText className="w-6.5 h-6.5" />
          </div>
          <span
            className={`text-[11px] font-bold mt-1 tracking-tight ${
              activeTab === 'report' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            {t.reportTab}
          </span>
        </button>

        {/* DASHBOARD TAB */}
        <button
          type="button"
          onClick={() => onTabChange('leaderboard')}
          aria-label={t.leaderboardTab}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center gap-1 w-20 py-1 transition-all ${
            activeTab === 'leaderboard'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'leaderboard' ? 'bg-emerald-950/50 text-emerald-400' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight">{t.leaderboardTab}</span>
        </button>
      </div>
    </div>
  );
};
