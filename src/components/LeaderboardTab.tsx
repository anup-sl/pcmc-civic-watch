import { useEffect, useState, useMemo } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Flame,
  ArrowUpDown,
  Download,
  MapPin,
  Search,
  ChevronDown,
  X,
  Map,
  Phone,
  Users
} from 'lucide-react';
import { supabase } from '../supabase';
import type { Hotspot } from '../types';
import { getSLAStatus, PCMC_PRESETS, reverseGeocodeLocation } from '../utils/geo';
import { getWardForArea, ZONAL_OFFICES } from '../utils/pcmcDirectory';
import type { WardInfo } from '../utils/pcmcDirectory';
import { exportHotspotsToCSV } from '../utils/csvExport';
import { DirectoryModal } from './DirectoryModal';
import { CorporatorSection } from './CorporatorSection';
import type { Language } from '../utils/i18n';
import { TRANSLATIONS } from '../utils/i18n';

interface AreaStats {
  areaName: string;
  wardInfo: WardInfo;
  total: number;
  openCount: number;
  overdueCount: number;
  chronicCount: number;
  resolvedCount: number;
  resolutionRate: number;
  categories: Record<string, number>;
  sampleHotspotId?: string;
}

interface LeaderboardTabProps {
  language: Language;
  onNavigateToMap?: (hotspotId?: string) => void;
}

export const LeaderboardTab = ({ language, onNavigateToMap }: LeaderboardTabProps) => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'overdue' | 'open' | 'resolutionRate' | 'total'>('overdue');
  const [showDirectoryModal, setShowDirectoryModal] = useState<boolean>(false);
  const [expandedCorporatorsWard, setExpandedCorporatorsWard] = useState<string | null>(null);

  // Ward Filter State: 'ALL' represents "All Wards (32)" city-wide view
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('ALL');
  const [showWardPicker, setShowWardPicker] = useState<boolean>(false);
  const [wardSearchQuery, setWardSearchQuery] = useState<string>('');

  // GPS auto-detection
  const [gpsWardInfo, setGpsWardInfo] = useState<WardInfo | null>(null);

  const t = TRANSLATIONS[language];

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('hotspots').select('*');
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
    grabWardGPS();
  }, []);

  const grabWardGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await reverseGeocodeLocation(pos.coords.latitude, pos.coords.longitude);
          if (res.formattedArea) {
            const ward = getWardForArea(res.formattedArea, pos.coords.latitude, pos.coords.longitude);
            setGpsWardInfo(ward);
          }
        } catch {
          // ignore GPS reverse-geocode error
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 15000 }
    );
  };

  // Pre-calculated Ward Info for the active filter (if not ALL)
  const activeWardInfo = useMemo(() => {
    if (selectedWardFilter === 'ALL') return null;
    return getWardForArea(selectedWardFilter);
  }, [selectedWardFilter]);

  const activeZoneOffice = useMemo(() => {
    if (!activeWardInfo) return null;
    return ZONAL_OFFICES.find(z => z.zone.toLowerCase() === activeWardInfo.zone.toLowerCase()) || null;
  }, [activeWardInfo]);

  // Aggregate stats per Area
  const rankedAreas = useMemo(() => {
    const areaMap: Record<string, AreaStats> = {};

    hotspots.forEach((h) => {
      const rawName = h.area_name || 'Pimpri-Chinchwad';
      const wardInfo = getWardForArea(rawName, h.latitude, h.longitude);
      // Key grouping by ward number + locality to prevent awkward fragmenting
      const groupingKey = `${wardInfo.badge}-${wardInfo.locality}`;

      if (!areaMap[groupingKey]) {
        areaMap[groupingKey] = {
          areaName: wardInfo.locality,
          wardInfo,
          total: 0,
          openCount: 0,
          overdueCount: 0,
          chronicCount: 0,
          resolvedCount: 0,
          resolutionRate: 0,
          categories: {},
          sampleHotspotId: h.id
        };
      }

      const stats = areaMap[groupingKey];
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
    });

    let list = Object.values(areaMap).map(item => ({
      ...item,
      resolutionRate: item.total > 0 ? Math.round((item.resolvedCount / item.total) * 100) : 0
    }));

    // Filter by selected ward if specific ward is picked
    if (selectedWardFilter !== 'ALL' && activeWardInfo) {
      list = list.filter(item => 
        item.wardInfo.wardNo === activeWardInfo.wardNo ||
        item.wardInfo.badge === activeWardInfo.badge ||
        item.areaName.toLowerCase().includes(activeWardInfo.locality.toLowerCase())
      );
    }

    // Sort ranked areas
    list.sort((a, b) => {
      if (sortBy === 'overdue') {
        if (b.overdueCount !== a.overdueCount) return b.overdueCount - a.overdueCount;
        return b.openCount - a.openCount;
      }
      if (sortBy === 'open') {
        if (b.openCount !== a.openCount) return b.openCount - a.openCount;
        return b.total - a.total;
      }
      if (sortBy === 'resolutionRate') {
        if (b.resolutionRate !== a.resolutionRate) return b.resolutionRate - a.resolutionRate;
        return b.resolvedCount - a.resolvedCount;
      }
      return b.total - a.total;
    });

    return list;
  }, [hotspots, sortBy, selectedWardFilter, activeWardInfo]);

  // Unified 3-card summary counts (city-wide or specific ward)
  const summaryStrip = useMemo(() => {
    let relevantHotspots = hotspots;

    if (selectedWardFilter !== 'ALL' && activeWardInfo) {
      relevantHotspots = hotspots.filter(h => {
        const hWard = getWardForArea(h.area_name || '', h.latitude, h.longitude);
        return (
          hWard.wardNo === activeWardInfo.wardNo ||
          (h.area_name || '').toLowerCase().includes(activeWardInfo.locality.toLowerCase())
        );
      });
    }

    let totalOpen = 0;
    let overdueCount = 0;
    let resolvedCount = 0;

    relevantHotspots.forEach((h) => {
      if (h.status === 'RESOLVED') {
        resolvedCount++;
      } else {
        totalOpen++;
        const sla = getSLAStatus(h.created_at, h.sla_hours, h.status, h.resolved_at);
        if (sla.isOverdue) {
          overdueCount++;
        }
      }
    });

    return { totalOpen, overdueCount, resolvedCount, totalCount: relevantHotspots.length };
  }, [hotspots, selectedWardFilter, activeWardInfo]);

  // Grouped PCMC Presets by Zone for the Ward Picker
  const groupedPresetsByZone = useMemo(() => {
    const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F', 'Zone G', 'Zone H'];
    const groups: Record<string, typeof PCMC_PRESETS> = {};

    zones.forEach(z => { groups[z] = []; });

    PCMC_PRESETS.forEach(p => {
      const query = wardSearchQuery.toLowerCase();
      const matches = 
        p.name.toLowerCase().includes(query) ||
        p.ward.toLowerCase().includes(query) ||
        p.zone.toLowerCase().includes(query);

      if (matches && groups[p.zone]) {
        groups[p.zone].push(p);
      }
    });

    return groups;
  }, [wardSearchQuery]);

  return (
    <div className="flex flex-col min-h-full pb-28 pt-2 px-4 max-w-lg mx-auto w-full space-y-3.5">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & EXPORT ACTIONS                           */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            {t.leaderboardTab}
          </h1>
          <p className="text-[11px] text-slate-400">
            {language === 'mr' ? 'प्रभागनिहाय नागरी समस्या व अधिकारी समन्वय' : 'Area-wise Hotspots & Governance Tracking'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => exportHotspotsToCSV(hotspots)}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 active:scale-95 transition-all shadow-xs"
            title={t.exportCsv}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={fetchStats}
            disabled={loading}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white active:scale-95 transition-all shadow-xs"
            title="Refresh stats"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SINGLE-ROW WARD FILTER & SORT BAR                      */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* Ward Selector Button */}
        <button
          type="button"
          onClick={() => setShowWardPicker(true)}
          className="flex-1 min-w-0 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/70 text-left text-xs font-semibold text-white shadow-sm active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">
              {selectedWardFilter === 'ALL' ? (
                <span className="font-bold text-cyan-300">All Wards (32)</span>
              ) : (
                <span className="flex items-center gap-1.5 truncate">
                  <span className="font-mono text-[10px] font-black px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {activeWardInfo?.badge}
                  </span>
                  <span className="truncate text-white font-bold">{activeWardInfo?.locality}</span>
                  <span className="text-[10px] text-slate-400 font-normal shrink-0">({activeWardInfo?.zone})</span>
                </span>
              )}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'overdue' | 'open' | 'resolutionRate' | 'total')}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-[11px] font-semibold rounded-xl px-2.5 py-2 pr-6 appearance-none focus:outline-none focus:border-cyan-500 shadow-sm transition-all"
            >
              <option value="overdue">Sort: Most Overdue</option>
              <option value="open">Sort: Most Open</option>
              <option value="resolutionRate">Sort: Resolution Rate</option>
              <option value="total">Sort: Total Reports</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* COMPACT ZONAL OFFICER LINE (When specific ward is selected) */}
      {selectedWardFilter !== 'ALL' && activeZoneOffice && (
        <div className="px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-[11px] flex items-center justify-between gap-2 text-cyan-200 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-extrabold text-[10px] uppercase bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.2 rounded">
              {activeZoneOffice.zone}
            </span>
            <span className="truncate text-slate-300 font-medium">
              {activeZoneOffice.officer}
            </span>
          </div>
          <a
            href={`tel:${activeZoneOffice.phone}`}
            className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:underline shrink-0"
          >
            <Phone className="w-3 h-3" />
            <span>{activeZoneOffice.phoneFormatted}</span>
          </a>
        </div>
      )}

      {/* ELECTED CORPORATORS SECTION (When specific ward is selected) */}
      {selectedWardFilter !== 'ALL' && activeWardInfo && (
        <CorporatorSection
          wardNo={activeWardInfo.wardNo}
          wardLocality={activeWardInfo.locality}
          zone={activeWardInfo.zone}
          language={language}
          collapsible={true}
          defaultExpanded={true}
        />
      )}

      {/* GPS-DETECTED LOCAL CORPORATORS (When viewing All Wards) */}
      {selectedWardFilter === 'ALL' && gpsWardInfo && (
        <CorporatorSection
          wardNo={gpsWardInfo.wardNo}
          wardLocality={gpsWardInfo.locality}
          zone={gpsWardInfo.zone}
          language={language}
          collapsible={true}
          defaultExpanded={false}
          title={language === 'mr' ? `📍 तुमच्या परिसरातील नगरसेवक (${gpsWardInfo.locality})` : `📍 Corporators For Your Location (${gpsWardInfo.locality})`}
        />
      )}

      {/* ======================================================== */}
      {/* 3. UNIFIED 3-COLUMN SUMMARY STRIP                        */}
      {/* ======================================================== */}
      <div className="grid grid-cols-3 gap-2">
        {/* TOTAL OPEN */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-2.5 shadow-md text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-tight">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>{t.totalOpen}</span>
          </div>
          <div className="text-xl font-black text-white mt-0.5 leading-tight">
            {summaryStrip.totalOpen}
          </div>
          <p className="text-[9px] text-slate-400 mt-0.5">
            {selectedWardFilter === 'ALL' ? 'City-wide PCMC' : 'In selected ward'}
          </p>
        </div>

        {/* OVERDUE */}
        <div className="bg-slate-900/90 border border-rose-500/40 rounded-2xl p-2.5 shadow-md text-center relative overflow-hidden ring-1 ring-rose-500/20">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-rose-400 uppercase tracking-tight">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>{t.overdue}</span>
          </div>
          <div className="text-xl font-black text-rose-300 mt-0.5 leading-tight">
            {summaryStrip.overdueCount}
          </div>
          <p className="text-[9px] text-slate-400 mt-0.5">Breached SLA</p>
        </div>

        {/* RESOLVED */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-2.5 shadow-md text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-tight">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{t.resolved}</span>
          </div>
          <div className="text-xl font-black text-emerald-300 mt-0.5 leading-tight">
            {summaryStrip.resolvedCount}
          </div>
          <p className="text-[9px] text-slate-400 mt-0.5">Fixed & verified</p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. CLEAN AREA CIVIC VULNERABILITY RANKING LIST           */}
      {/* ======================================================== */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs px-0.5">
          <h2 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>{t.vulnerabilityRanking}</span>
            <span className="text-[10px] font-normal text-slate-500">
              ({rankedAreas.length} {rankedAreas.length === 1 ? 'area' : 'areas'})
            </span>
          </h2>

          {selectedWardFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedWardFilter('ALL')}
              className="text-[10px] text-cyan-400 hover:underline font-semibold"
            >
              Reset to All Wards
            </button>
          )}
        </div>

        {rankedAreas.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-1.5">
            <p>No civic issues currently recorded for this filter.</p>
            {selectedWardFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedWardFilter('ALL')}
                className="text-xs text-cyan-400 font-bold hover:underline"
              >
                View all PCMC wards
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {rankedAreas.map((area, index) => {
              const rank = index + 1;
              const hasOverdue = area.overdueCount > 0;
              const resolutionPct = area.total > 0 ? Math.round((area.resolvedCount / area.total) * 100) : 0;

              return (
                <div
                  key={`${area.wardInfo.badge}-${area.areaName}`}
                  onClick={() => {
                    if (onNavigateToMap && area.sampleHotspotId) {
                      onNavigateToMap(area.sampleHotspotId);
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
                    rank === 1 && hasOverdue
                      ? 'bg-slate-900/90 border-rose-500/40 hover:border-rose-500 shadow-md shadow-rose-950/20'
                      : rank <= 3
                      ? 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/50 shadow-xs'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Row 1: Rank, Crisp Ward Badge, Locality, Zone, and Counts */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Rank Pill */}
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0 ${
                        rank === 1 ? 'bg-rose-500 text-white' :
                        rank === 2 ? 'bg-amber-500 text-slate-950' :
                        rank === 3 ? 'bg-cyan-600 text-white' :
                        'bg-slate-800 text-slate-400 font-bold'
                      }`}>
                        #{rank}
                      </span>

                      {/* Crisp Ward Badge: W-17 */}
                      <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80 shrink-0">
                        {area.wardInfo.badge}
                      </span>

                      {/* Full Locality Name & Zone */}
                      <div className="min-w-0 truncate">
                        <span className="font-bold text-xs sm:text-sm text-white truncate block leading-tight group-hover:text-cyan-300 transition-colors">
                          {area.areaName}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                          {area.wardInfo.zone} {area.chronicCount > 0 && `• ${area.chronicCount} chronic`}
                        </span>
                      </div>
                    </div>

                    {/* Right-aligned Count Pill */}
                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-bold">
                        <span className="text-amber-400">{area.openCount} Open</span>
                        <span className="text-slate-600">•</span>
                        <span className={hasOverdue ? 'text-rose-400' : 'text-slate-400'}>
                          {area.overdueCount} Overdue
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Subtle Horizontal Progress Bar (Open vs Resolved) */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Resolution Rate</span>
                      <span className="font-semibold text-slate-300">
                        {resolutionPct}% ({area.resolvedCount}/{area.total} fixed)
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${resolutionPct}%` }}
                      />
                      {area.overdueCount > 0 && (
                        <div
                          className="bg-rose-500 h-full transition-all duration-300"
                          style={{ width: `${Math.round((area.overdueCount / area.total) * 100)}%` }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Row 3: Category Emoji Pills & Map Quick Action */}
                  <div className="flex items-center justify-between pt-1.5 text-[10px]">
                    <div className="flex items-center gap-1 flex-wrap">
                      {Object.entries(area.categories).map(([cat, cnt]) => (
                        <span
                          key={cat}
                          className="px-1.5 py-0.2 rounded bg-slate-950/80 border border-slate-800 text-slate-400"
                        >
                          {cat === 'Garbage' ? '🗑️' : cat === 'Drainage' ? '💧' : cat === 'Streetlight' ? '💡' : cat === 'Encroachment' ? '🛑' : '⚠️'} {cat} ({cnt})
                        </span>
                      ))}
                    </div>

                    {/* Corporators Action & Map Quick Action */}
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCorporatorsWard(expandedCorporatorsWard === area.wardInfo.wardNo ? null : area.wardInfo.wardNo);
                        }}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 hover:underline bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800"
                        title="View Elected Corporators"
                      >
                        <Users className="w-2.5 h-2.5" />
                        <span>
                          {expandedCorporatorsWard === area.wardInfo.wardNo 
                            ? (language === 'mr' ? 'बंद करा' : 'Hide') 
                            : (language === 'mr' ? 'नगरसेवक (४)' : 'Corporators (4)')}
                        </span>
                      </button>

                      {onNavigateToMap && (
                        <span className="text-cyan-400 group-hover:underline flex items-center gap-0.5 shrink-0 font-medium">
                          <Map className="w-2.5 h-2.5" />
                          <span>Map</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Inline Expanded Corporators Section */}
                  {expandedCorporatorsWard === area.wardInfo.wardNo && (
                    <div 
                      className="mt-2.5 pt-2 border-t border-slate-800 animate-in fade-in duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CorporatorSection
                        wardNo={area.wardInfo.wardNo}
                        wardLocality={area.wardInfo.locality}
                        zone={area.wardInfo.zone}
                        language={language}
                        collapsible={false}
                        defaultExpanded={true}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. SEARCHABLE WARD PICKER BOTTOM SHEET / DROPDOWN        */}
      {/* ======================================================== */}
      {showWardPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">Select PCMC Ward or Area</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWardPicker(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={wardSearchQuery}
                onChange={(e) => setWardSearchQuery(e.target.value)}
                placeholder="Search Wakad, Kiwale, Nigdi, W-17, Bhosari..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                autoFocus
              />
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
              {/* PINNED OPTION 1: ALL WARDS (32) */}
              <button
                type="button"
                onClick={() => {
                  setSelectedWardFilter('ALL');
                  setShowWardPicker(false);
                }}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  selectedWardFilter === 'ALL'
                    ? 'bg-cyan-950/50 border-cyan-500 text-white'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-black text-xs">
                    ALL
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">All Wards (32)</span>
                    <span className="text-[10px] text-slate-400">City-wide PCMC overview across Zone A through Zone H</span>
                  </div>
                </div>
                {selectedWardFilter === 'ALL' && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
              </button>

              {/* PINNED OPTION 2: MY GPS WARD */}
              {gpsWardInfo && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWardFilter(gpsWardInfo.locality);
                    setShowWardPicker(false);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedWardFilter.toLowerCase().includes(gpsWardInfo.locality.toLowerCase())
                      ? 'bg-cyan-950/50 border-cyan-500 text-white'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      📍
                    </div>
                    <div>
                      <span className="font-bold text-xs text-emerald-300 block">
                        My GPS Ward: {gpsWardInfo.badge} • {gpsWardInfo.locality}
                      </span>
                      <span className="text-[10px] text-slate-400">Auto-detected via live location ({gpsWardInfo.zone})</span>
                    </div>
                  </div>
                  {selectedWardFilter.toLowerCase().includes(gpsWardInfo.locality.toLowerCase()) && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              )}

              {/* GROUPED BY PCMC ZONES */}
              <div className="space-y-3 pt-1">
                {Object.entries(groupedPresetsByZone).map(([zoneName, presets]) => {
                  if (presets.length === 0) return null;

                  return (
                    <div key={zoneName} className="space-y-1.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400 px-1">
                        {zoneName}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {presets.map((p) => {
                          const wInfo = getWardForArea(p.name, p.latitude, p.longitude);
                          const isSelected = selectedWardFilter.toLowerCase().includes(p.name.toLowerCase());

                          return (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => {
                                setSelectedWardFilter(p.name);
                                setShowWardPicker(false);
                              }}
                              className={`p-2 rounded-xl text-left border text-xs transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'bg-cyan-950/50 border-cyan-500 text-white'
                                  : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white'
                              }`}
                            >
                              <div className="min-w-0 pr-1">
                                <div className="font-bold truncate text-white">{p.name.split(' Chowk')[0].split(' Road')[0]}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <span className="font-mono text-cyan-400 font-bold">{wInfo.badge}</span>
                                  <span>•</span>
                                  <span>{p.ward}</span>
                                </div>
                              </div>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. NON-AFFILIATION CITIZEN INITIATIVE FOOTER              */}
      {/* ======================================================== */}
      <footer className="pt-4 pb-2 text-center border-t border-slate-900 mt-4 space-y-1">
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
          initialWardNo={activeWardInfo?.wardNo || gpsWardInfo?.wardNo || 16}
          onClose={() => setShowDirectoryModal(false)}
        />
      )}
    </div>
  );
};
