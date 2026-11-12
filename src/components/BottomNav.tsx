import { Camera, Map, Trophy } from 'lucide-react';
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 pb-safe">
      <div className="max-w-lg mx-auto px-6 h-16 flex items-center justify-around">
        {/* MAP TAB */}
        <button
          type="button"
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center justify-center gap-1 w-20 py-1 transition-all ${
            activeTab === 'map'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'map' ? 'bg-cyan-950/70' : ''}`}>
            <Map className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight">{t.mapTab}</span>
        </button>

        {/* REPORT TAB (Prominent Center Button) */}
        <button
          type="button"
          onClick={() => onTabChange('report')}
          className="relative -top-4 flex flex-col items-center group active:scale-95 transition-transform"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all border-2 ${
              activeTab === 'report'
                ? 'bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 text-white border-cyan-300 shadow-cyan-500/30 ring-4 ring-cyan-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500 group-hover:text-cyan-400 shadow-black/50'
            }`}
          >
            <Camera className="w-7 h-7" />
          </div>
          <span
            className={`text-[11px] font-bold mt-1 tracking-tight ${
              activeTab === 'report' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            {t.reportTab}
          </span>
        </button>

        {/* LEADERBOARD TAB */}
        <button
          type="button"
          onClick={() => onTabChange('leaderboard')}
          className={`flex flex-col items-center justify-center gap-1 w-20 py-1 transition-all ${
            activeTab === 'leaderboard'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'leaderboard' ? 'bg-cyan-950/70' : ''}`}>
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-tight">{t.leaderboardTab}</span>
        </button>
      </div>
    </div>
  );
};
