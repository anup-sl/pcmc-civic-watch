import { useEffect, useState, useMemo } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Flame,
  ArrowUpDown,
  ShieldAlert,
  Download,
  PhoneCall,
  MapPin,
  Crosshair,
  Edit2,
  Search
} from 'lucide-react';
import { supabase } from '../supabase';
import type { Hotspot } from '../types';
import { getSLAStatus, PCMC_PRESETS, reverseGeocodeLocation } from '../utils/geo';
import { getZoneForArea, getWardForArea } from '../utils/pcmcDirectory';
import { exportHotspotsToCSV } from '../utils/csvExport';
import { DirectoryModal } from './DirectoryModal';
import type { Language } from '../utils/i18n';
import { TRANSLATIONS } from '../utils/i18n';

interface AreaStats {
  areaName: string;
  total: number;
  openCount: number;
  overdueCount: number;
  chronicCount: number;
  resolvedCount: number;
  severityScore: number;
  categories: Record<string, number>;
}

interface LeaderboardTabProps {
  language: Language;
}

export const LeaderboardTab = ({ language }: LeaderboardTabProps) => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'overdue' | 'open' | 'total'>('overdue');
  const [showDirectoryModal, setShowDirectoryModal] = useState<boolean>(false);

  // Ward-specific interactive dashboard state
  const [selectedWardName, setSelectedWardName] = useState<string>('Pimpri-Chinchwad');
  const [isEditingWard, setIsEditingWard] = useState<boolean>(false);
  const [showWardPicker, setShowWardPicker] = useState<boolean>(false);
  const [wardSearchQuery, setWardSearchQuery] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const t = TRANSLATIONS[language];

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hotspots')
        .select('*');

      if (!error && data) {
        setHotspots(data as Hotspot[]);
      }
    } catch (err) {
      console.warn('Leaderboard stats load warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-detect current ward via GPS on load if supported
    grabWardGPS();
  }, []);

  const grabWardGPS = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setAccuracy(Math.round(pos.coords.accuracy));
        setIsLocating(false);
        try {
          const res = await reverseGeocodeLocation(pos.coords.latitude, pos.coords.longitude);
          if (res.formattedArea) {
            setSelectedWardName(res.formattedArea);
          }
        } catch {
          // fallback to current
        }
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 15000 }
    );
  };

  // Compute Ward-Specific Incident Numbers & Statuses
  const wardStats = useMemo(() => {
    const zoneInfo = getZoneForArea(selectedWardName);
    const wardInfo = getWardForArea(selectedWardName);
    const lowerArea = selectedWardName.toLowerCase();

    // Hotspots in this ward / zone / locality
    const inWard = hotspots.filter(h => {
      const hArea = (h.area_name || '').toLowerCase();
      const hZone = getZoneForArea(h.area_name);
      return hZone.zone === zoneInfo.zone || hArea.includes(lowerArea) || lowerArea.includes(hArea);
    });

    const openCount = inWard.filter(h => h.status === 'OPEN' || h.status === 'CHRONIC_REOPENED').length;
    const overdueCount = inWard.filter(h => {
      if (h.status === 'RESOLVED') return false;
      const sla = getSLAStatus(h.created_at, h.sla_hours, h.status, h.resolved_at);
      return sla.isOverdue;
    }).length;
    const resolvedCount = inWard.filter(h => h.status === 'RESOLVED').length;
    const totalConfirmations = inWard.reduce((acc, h) => acc + (h.corroboration_count || 1), 0);

    const categoryBreakdown: Record<string, number> = {};
    inWard.forEach(h => {
      if (h.status !== 'RESOLVED') {
        categoryBreakdown[h.category] = (categoryBreakdown[h.category] || 0) + 1;
      }
    });

    return {
      zoneInfo,
      wardInfo,
      inWardCount: inWard.length,
      openCount,
      overdueCount,
      resolvedCount,
      totalConfirmations,
      categoryBreakdown
    };
  }, [hotspots, selectedWardName]);

  const filteredPresets = PCMC_PRESETS.filter(p => 
    p.name.toLowerCase().includes(wardSearchQuery.toLowerCase()) ||
    p.ward.toLowerCase().includes(wardSearchQuery.toLowerCase()) ||
    p.zone.toLowerCase().includes(wardSearchQuery.toLowerCase())
  );

  const summary = useMemo(() => {
    let totalOpen = 0;
    let overdueCount = 0;
    let resolvedCount = 0;

    hotspots.forEach((h) => {
      const isResolved = h.status === 'RESOLVED';
      if (isResolved) {
        resolvedCount++;
      } else {
        totalOpen++;
        const sla = getSLAStatus(h.created_at, h.sla_hours, h.status, h.resolved_at);
        if (sla.isOverdue) {
          overdueCount++;
        }
      }
    });

    return { totalOpen, overdueCount, resolvedCount };
  }, [hotspots]);

  const rankedAreas = useMemo(() => {
    const areaMap: Record<string, AreaStats> = {};

    hotspots.forEach((h) => {
      const name = h.area_name || 'PCMC Central';
      if (!areaMap[name]) {
        areaMap[name] = {
          areaName: name,
          total: 0,
          openCount: 0,
          overdueCount: 0,
          chronicCount: 0,
          resolvedCount: 0,
          severityScore: 0,
          categories: {}
        };
      }

      const stats = areaMap[name];
      stats.total++;
      stats.categories[h.category] = (stats.categories[h.category] || 0) + 1;

      if (h.status === 'RESOLVED') {
        stats.resolvedCount++;
      } else {
        stats.openCount++;
        if (h.status === 'CHRONIC_REOPENED') {
          stats.chronicCount++;
        }
        const sla = getSLAStatus(h.created_at, h.sla_hours, h.status, h.resolved_at);
        if (sla.isOverdue) {
          stats.overdueCount++;
        }
      }

      stats.severityScore = (stats.overdueCount * 3) + (stats.chronicCount * 2) + stats.openCount;
    });

    const list = Object.values(areaMap);

    list.sort((a, b) => {
      if (sortBy === 'overdue') {
        if (b.overdueCount !== a.overdueCount) return b.overdueCount - a.overdueCount;
        return b.openCount - a.openCount;
      }
      if (sortBy === 'open') {
        if (b.openCount !== a.openCount) return b.openCount - a.openCount;
        return b.overdueCount - a.overdueCount;
      }
      return b.total - a.total;
    });

    return list;
  }, [hotspots, sortBy]);

  return (
    <div className="flex flex-col min-h-full pb-28 pt-2 px-4 max-w-lg mx-auto w-full space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            {t.leaderboardTab}
          </h1>
          <p className="text-xs text-slate-400">
            {language === 'mr' ? 'प्रभागनिहाय नागरी समस्या व अधिकारी समन्वय' : 'Area-wise Hotspots & Governance Tracking'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => exportHotspotsToCSV(hotspots)}
            className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400"
            title={t.exportCsv}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={fetchStats}
            disabled={loading}
            className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            title="Refresh stats"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. WARD CIVIC INCIDENT DASHBOARD                         */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3.5 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Ward Header & GPS indicator */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2.5 py-0.5 rounded-lg max-w-full">
              <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">{language === 'mr' ? wardStats.wardInfo.marathiWardLabel : wardStats.wardInfo.wardLabel} • {wardStats.zoneInfo.zone}</span>
            </div>

            {/* Editable Area Name / Prabhag */}
            {isEditingWard ? (
              <div className="mt-1 flex gap-1.5 pt-0.5">
                <input
                  type="text"
                  value={selectedWardName}
                  onChange={(e) => setSelectedWardName(e.target.value)}
                  placeholder="Type ward / locality name..."
                  className="flex-1 min-w-0 bg-slate-950 border border-cyan-500 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsEditingWard(false)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shrink-0"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pt-0.5 min-w-0">
                <h2 className="text-base sm:text-lg font-black text-white leading-tight truncate">
                  {selectedWardName}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditingWard(true)}
                  className="p-1 rounded text-slate-400 hover:text-cyan-400 shrink-0"
                  title="Edit ward / locality"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-0.5 truncate">
              <span className="truncate">{wardStats.zoneInfo.officer}</span>
              <span>•</span>
              <span className="font-mono shrink-0">{wardStats.zoneInfo.phoneFormatted}</span>
            </p>
          </div>

          {/* Action buttons: Locate Me & Switch Ward */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <button
              type="button"
              onClick={grabWardGPS}
              disabled={isLocating}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-[11px] font-bold text-cyan-300 shadow-sm active:scale-95 transition-all"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? '...' : accuracy ? `±${accuracy}m GPS` : t.locateMe}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowWardPicker(!showWardPicker)}
              className="text-[10px] text-slate-400 hover:text-cyan-400 underline font-semibold"
            >
              {showWardPicker ? t.closeWards : t.switchWard}
            </button>
          </div>
        </div>

        {/* WARD SEARCHABLE PICKER */}
        {showWardPicker && (
          <div className="pt-2 border-t border-slate-800 space-y-2 animate-in fade-in duration-150">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={wardSearchQuery}
                onChange={(e) => setWardSearchQuery(e.target.value)}
                placeholder="Search Wakad, Nigdi, Pimple Saudagar, Ravet..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1 no-scrollbar">
              {filteredPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setSelectedWardName(`${preset.name}, Pimpri-Chinchwad`);
                    setShowWardPicker(false);
                  }}
                  className="text-left p-2 rounded-lg text-[11px] border bg-slate-950 border-slate-800 hover:border-cyan-500/60 text-slate-300 hover:text-white transition-colors"
                >
                  <div className="font-bold truncate text-white">{preset.name}</div>
                  <div className="text-[9px] text-cyan-400 flex items-center justify-between mt-0.5">
                    <span>{preset.ward}</span>
                    <span>{preset.zone}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* WARD INCIDENT NUMBERS (DASHBOARD METRICS ROW) */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-1 text-center">
          {/* 1. Open Issues in Ward */}
          <div className="bg-slate-950/80 p-2 sm:p-2.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] sm:text-[10px] text-amber-400 uppercase font-black block truncate">
              {t.openInWard}
            </span>
            <span className="text-lg sm:text-xl font-black text-white my-0.5">
              {wardStats.openCount}
            </span>
            <span className="text-[9px] text-slate-500 block truncate">
              {t.inThisWard}
            </span>
          </div>

          {/* 2. Overdue in Ward */}
          <div className="bg-slate-950/80 p-2 sm:p-2.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] sm:text-[10px] text-rose-400 uppercase font-black block truncate">
              {t.overdueInWard}
            </span>
            <span className="text-lg sm:text-xl font-black text-rose-400 my-0.5">
              {wardStats.overdueCount}
            </span>
            <span className="text-[9px] text-slate-500 block truncate">
              {t.slaBreached}
            </span>
          </div>

          {/* 3. Resolved in Ward */}
          <div className="bg-slate-950/80 p-2 sm:p-2.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] sm:text-[10px] text-emerald-400 uppercase font-black block truncate">
              {t.resolvedInWard}
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-400 my-0.5">
              {wardStats.resolvedCount}
            </span>
            <span className="text-[9px] text-slate-500 block truncate">
              {t.cleared}
            </span>
          </div>

          {/* 4. Citizen Confirmations */}
          <div className="bg-slate-950/80 p-2 sm:p-2.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] sm:text-[10px] text-cyan-400 uppercase font-black block truncate">
              {t.verifiedCitizens}
            </span>
            <span className="text-lg sm:text-xl font-black text-cyan-400 my-0.5 flex items-center justify-center gap-0.5">
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
              <span>{wardStats.totalConfirmations}</span>
            </span>
            <span className="text-[9px] text-slate-500 block truncate">
              {t.verified}
            </span>
          </div>
        </div>

        {/* Ward Category Breakdown Mini-Pills */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.keys(wardStats.categoryBreakdown).length > 0 ? (
              Object.entries(wardStats.categoryBreakdown).map(([cat, count]) => (
                <span
                  key={cat}
                  className="bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-[10px] font-semibold text-slate-300"
                >
                  {cat === 'Garbage' ? '🗑️' : cat === 'Drainage' ? '💧' : cat === 'Streetlight' ? '💡' : '⚠️'} {cat} ({count})
                </span>
              ))
            ) : (
              <span className="text-[11px] text-emerald-400/90 font-medium flex items-center gap-1">
                <span>🌿</span>
                <span>{t.noPendingInWard}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* PCMC Helplines Quick Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/30 rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">PCMC Sarathi (8888006666)</span>
            <span className="text-[10px] text-slate-400">All 8 Zonal Offices & Direct Grievance Contacts</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowDirectoryModal(true)}
          className="px-2.5 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] shadow-sm shrink-0"
        >
          View Help
        </button>
      </div>

      {/* 1. SUMMARY CARDS: TOTAL OPEN, OVERDUE, RESOLVED */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-3 shadow-lg text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-400 uppercase tracking-tight">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            {t.totalOpen}
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {summary.totalOpen}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Active issues</p>
        </div>

        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-rose-500/40 rounded-2xl p-3 shadow-lg text-center relative overflow-hidden ring-1 ring-rose-500/20">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-rose-400 uppercase tracking-tight">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            {t.overdue}
          </div>
          <div className="text-2xl font-black text-rose-300 mt-1">
            {summary.overdueCount}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Breached SLA</p>
        </div>

        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-green-500/30 rounded-2xl p-3 shadow-lg text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-green-400 uppercase tracking-tight">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            {t.resolved}
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {summary.resolvedCount}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Cleared sites</p>
        </div>
      </div>

      {/* 2. AREA RANKING SECTION */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {t.vulnerabilityRanking}
            </h2>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'overdue' | 'open' | 'total')}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] rounded-lg px-2 py-0.5 focus:outline-none"
            >
              <option value="overdue">Sort: Most Overdue</option>
              <option value="open">Sort: Most Open</option>
              <option value="total">Sort: Total Reports</option>
            </select>
          </div>
        </div>

        {rankedAreas.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            No area data logged yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {rankedAreas.map((area, index) => {
              const rank = index + 1;
              const hasHighSeverity = area.overdueCount > 0;

              return (
                <div
                  key={area.areaName}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    rank === 1 && hasHighSeverity
                      ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/50 shadow-lg shadow-rose-950/20'
                      : rank <= 3
                      ? 'bg-slate-900/90 border-slate-700/80 shadow-md'
                      : 'bg-slate-900/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                        rank === 1 ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' :
                        rank === 2 ? 'bg-amber-500 text-slate-950' :
                        rank === 3 ? 'bg-cyan-600 text-white' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        #{rank}
                      </div>

                      <div>
                        <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                          {area.areaName}
                          {area.chronicCount > 0 && (
                            <span className="text-[9px] font-extrabold bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.2 rounded">
                              {area.chronicCount} Chronic
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 flex-wrap">
                          {Object.entries(area.categories).map(([cat, cnt]) => (
                            <span key={cat} className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                              {cat === 'Garbage' ? '🗑️' : cat === 'Drainage' ? '💧' : cat === 'Streetlight' ? '💡' : cat === 'Encroachment' ? '🛑' : cat === 'Other' ? '🌐' : '⚠️'} {t.categories[cat as keyof typeof t.categories] || cat} ({cnt})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 shrink-0">
                      {area.total} total
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-center">
                    <div className="bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/90">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold block">{t.open}</span>
                      <span className="font-bold text-xs text-amber-400">
                        {area.openCount}
                      </span>
                    </div>

                    <div className={`p-1.5 rounded-xl border ${
                      area.overdueCount > 0
                        ? 'bg-rose-950/50 border-rose-800/80 text-rose-300'
                        : 'bg-slate-950/80 border-slate-800/90 text-slate-400'
                    }`}>
                      <span className="text-[9px] uppercase font-semibold block">{t.overdue}</span>
                      <span className="font-bold text-xs">
                        {area.overdueCount}
                      </span>
                    </div>

                    <div className="bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/90">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold block">{t.resolved}</span>
                      <span className="font-bold text-xs text-green-400">
                        {area.resolvedCount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NON-AFFILIATION CITIZEN INITIATIVE FOOTER */}
      <footer className="pt-5 pb-2 text-center border-t border-slate-900 mt-4 space-y-1">
        <p className="text-[11px] font-bold text-slate-300 leading-snug">
          {language === 'mr'
            ? 'एक स्वतंत्र, गैर-व्यावसायिक नागरिक पुढाकार. पिंपरी चिंचवड महानगरपालिका (PCMC) शी संलग्न किंवा मान्यताप्राप्त नाही.'
            : 'An independent, non-commercial citizen initiative. Not affiliated with or endorsed by Pimpri Chinchwad Municipal Corporation (PCMC).'}
        </p>
        <p className="text-[10px] text-slate-500">
          {language === 'mr'
            ? 'नागरी समस्यांचे जलद निवारण व प्रभागनिहाय पारदर्शकता वाढवण्यासाठी नागरिकांनी नागरिकांसाठी तयार केलेले व्यासपीठ.'
            : 'Built by citizens for transparent municipal issue tracking & community verification.'}
        </p>
      </footer>

      {/* Directory Modal */}
      {showDirectoryModal && (
        <DirectoryModal
          language={language}
          onClose={() => setShowDirectoryModal(false)}
        />
      )}
    </div>
  );
};
