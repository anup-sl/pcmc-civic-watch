import { useEffect, useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
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
  Users,
  ArrowLeft,
  ChevronRight,
  Clock,
  Eye
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
  hotspots: Hotspot[];
  totalVerifications: number;
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

  // Ward Drill-Down State
  const [drillDownWardBadge, setDrillDownWardBadge] = useState<string | null>(null);
  const [drillDownStatusFilter, setDrillDownStatusFilter] = useState<'all' | 'open' | 'overdue' | 'resolved'>('all');
  const [activeLightboxUrl, setActiveLightboxUrl] = useState<string | null>(null);

  // GPS auto-detection
  const [gpsWardInfo, setGpsWardInfo] = useState<WardInfo | null>(null);

  const t = TRANSLATIONS[language];

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hotspots')
        .select('*, reports(id, photo_url, report_type, created_at, notes)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setHotspots(data as Hotspot[]);
      } else {
        const { data: fallback } = await supabase.from('hotspots').select('*');
        if (fallback) setHotspots(fallback as Hotspot[]);
      }
    } catch (err) {
      console.warn('Dashboard stats load warning:', err);
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

  // Aggregate stats per Area/Ward
  const rankedAreas = useMemo(() => {
    const areaMap: Record<string, AreaStats> = {};

    hotspots.forEach((h) => {
      const rawName = h.area_name || 'Pimpri-Chinchwad';
      const wardInfo = getWardForArea(rawName, h.latitude, h.longitude);
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
          sampleHotspotId: h.id,
          hotspots: [],
          totalVerifications: 0
        };
      }

      const stats = areaMap[groupingKey];
      stats.total++;
      stats.hotspots.push(h);
      stats.totalVerifications += (h.corroboration_count || 1);
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

    // Filter by selected ward if specific ward is picked and not drilled down
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

  // Active Drilled-Down Area Stats
  const activeDrillDownArea = useMemo(() => {
    if (!drillDownWardBadge) return null;
    return rankedAreas.find(a => 
      a.wardInfo.badge === drillDownWardBadge || 
      a.wardInfo.wardNo === drillDownWardBadge ||
      a.areaName.toLowerCase().includes(drillDownWardBadge.toLowerCase())
    ) || null;
  }, [drillDownWardBadge, rankedAreas]);

  const activeDrillDownZoneOffice = useMemo(() => {
    if (!activeDrillDownArea) return null;
    return ZONAL_OFFICES.find(z => z.zone.toLowerCase() === activeDrillDownArea.wardInfo.zone.toLowerCase()) || null;
  }, [activeDrillDownArea]);

  // Issues belonging to the drilled-down ward, sorted by highest citizen verifications first
  const drillDownIssues = useMemo(() => {
    if (!activeDrillDownArea) return [];
    let list = [...activeDrillDownArea.hotspots];

    if (drillDownStatusFilter === 'open') {
      list = list.filter(h => h.status !== 'RESOLVED');
    } else if (drillDownStatusFilter === 'overdue') {
      list = list.filter(h => {
        if (h.status === 'RESOLVED') return false;
        const sla = getSLAStatus(h.created_at, h.sla_hours, h.status, h.resolved_at);
        return sla.isOverdue;
      });
    } else if (drillDownStatusFilter === 'resolved') {
      list = list.filter(h => h.status === 'RESOLVED');
    }

    // Primary sort: Most verified (highest verification / confirmation count first)
    list.sort((a, b) => {
      const vA = a.corroboration_count ?? 1;
      const vB = b.corroboration_count ?? 1;
      if (vB !== vA) return vB - vA;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [activeDrillDownArea, drillDownStatusFilter]);

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
    const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F', 'Zone G', 'Zone H', 'Zone J', 'Zone L'];
    const groups: Record<string, typeof PCMC_PRESETS> = {};

    zones.forEach(z => { groups[z] = []; });

    PCMC_PRESETS.forEach(p => {
      const query = wardSearchQuery.toLowerCase();
      const matches = 
        p.name.toLowerCase().includes(query) ||
        (p.nameMr && p.nameMr.includes(query)) ||
        p.ward.toLowerCase().includes(query) ||
        p.zone.toLowerCase().includes(query);

      if (matches && groups[p.zone]) {
        groups[p.zone].push(p);
      }
    });

    return groups;
  }, [wardSearchQuery]);

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'Garbage':
        return { emoji: '🗑️', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      case 'Drainage':
        return { emoji: '💧', badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
      case 'Pothole':
        return { emoji: '🚧', badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
      case 'Streetlight':
        return { emoji: '💡', badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' };
      case 'Encroachment':
        return { emoji: '🛑', badge: 'bg-red-500/15 text-red-400 border-red-500/30' };
      case 'Garden':
        return { emoji: '🌳', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'Animals':
        return { emoji: '🐕', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30' };
      case 'Pollution':
        return { emoji: '🏭', badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
      default:
        return { emoji: '⚠️', badge: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-28 md:pb-16 pt-3 px-4 sm:px-6 max-w-lg md:max-w-5xl lg:max-w-6xl mx-auto w-full space-y-4">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & EXPORT ACTIONS                           */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <LayoutDashboard className="w-5 h-5 text-cyan-400" />
            {t.leaderboardTab}
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {language === 'mr' ? 'प्रभागनिहाय नागरी डॅशबोर्ड व अधिकारी समन्वय' : 'Area & Ward Civic Dashboard • Governance Tracking'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => exportHotspotsToCSV(activeDrillDownArea ? activeDrillDownArea.hotspots : hotspots)}
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
      {/* VIEW A: WARD DRILL-DOWN VIEW (When Ward is Clicked)      */}
      {/* ======================================================== */}
      {activeDrillDownArea ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setDrillDownWardBadge(null);
                setSelectedWardFilter('ALL');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs font-bold text-cyan-300 hover:text-white transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'सर्व प्रभागांवर परत जा' : 'Back to All Wards'}</span>
            </button>

            <span className="text-[11px] text-slate-400 font-mono">
              {activeDrillDownArea.wardInfo.badge} • {activeDrillDownArea.total} {language === 'mr' ? 'तक्रारी' : 'Issues'}
            </span>
          </div>

          {/* Ward Hero Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-lg shadow-cyan-950/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-xs font-black px-2 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-700 shrink-0">
                  {activeDrillDownArea.wardInfo.badge}
                </span>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-white truncate">
                    {language === 'mr' 
                      ? (activeDrillDownArea.wardInfo.marathiWardLabel || activeDrillDownArea.wardInfo.locality) 
                      : activeDrillDownArea.wardInfo.locality}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {language === 'mr' ? activeDrillDownArea.wardInfo.marathiZone : activeDrillDownArea.wardInfo.zone}
                  </p>
                </div>
              </div>

              {/* Quick Actions: Corporators & Call Officer */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setExpandedCorporatorsWard(expandedCorporatorsWard === activeDrillDownArea.wardInfo.wardNo ? null : activeDrillDownArea.wardInfo.wardNo)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    {expandedCorporatorsWard === activeDrillDownArea.wardInfo.wardNo 
                      ? (language === 'mr' ? 'बंद करा' : 'Hide Corporators')
                      : (language === 'mr' ? 'नगरसेवक (४)' : 'Corporators (4)')}
                  </span>
                </button>

                {activeDrillDownZoneOffice && (
                  <a
                    href={`tel:${activeDrillDownZoneOffice.phone}`}
                    className="px-2.5 py-1.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-bold flex items-center gap-1.5 hover:underline shadow-xs shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{activeDrillDownZoneOffice.phoneFormatted}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Inline Expanded Corporators Section */}
            {expandedCorporatorsWard === activeDrillDownArea.wardInfo.wardNo && (
              <div className="pt-2 border-t border-slate-800 animate-in fade-in duration-150">
                <CorporatorSection
                  wardNo={activeDrillDownArea.wardInfo.wardNo}
                  wardLocality={language === 'mr' ? (activeDrillDownArea.wardInfo.marathiWardLabel || activeDrillDownArea.wardInfo.locality) : activeDrillDownArea.wardInfo.locality}
                  zone={language === 'mr' ? (activeDrillDownArea.wardInfo.marathiZone || activeDrillDownArea.wardInfo.zone) : activeDrillDownArea.wardInfo.zone}
                  language={language}
                  collapsible={false}
                  defaultExpanded={true}
                />
              </div>
            )}

            {/* Ward Micro Stats Strip */}
            <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-800/80 text-center">
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">{t.totalOpen}</span>
                <span className="text-base sm:text-lg font-black text-amber-400 font-mono">{activeDrillDownArea.openCount}</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">{t.overdue}</span>
                <span className="text-base sm:text-lg font-black text-rose-400 font-mono">{activeDrillDownArea.overdueCount}</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">{t.resolved}</span>
                <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">{activeDrillDownArea.resolvedCount}</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">{language === 'mr' ? 'पुष्टी' : 'Verified'}</span>
                <span className="text-base sm:text-lg font-black text-cyan-400 font-mono">{activeDrillDownArea.totalVerifications}</span>
              </div>
            </div>
          </div>

          {/* Drill-Down Issues Section Header & Status Filter Pills */}
          <div className="space-y-2 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-0.5">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{language === 'mr' ? 'प्रभागातील नागरी समस्या' : 'Reported Issues in Ward'}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({drillDownIssues.length} {drillDownIssues.length === 1 ? 'issue' : 'issues'})
                  </span>
                </h3>
                <p className="text-[11px] text-cyan-400 font-medium">
                  🛡️ {language === 'mr' ? 'सर्वाधिक नागरिकांच्या पुष्टीनुसार क्रमवारी (Most Verified First)' : 'Sorted by Most Verified (Highest Citizen Confirmations First)'}
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0 text-xs">
                <button
                  type="button"
                  onClick={() => setDrillDownStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    drillDownStatusFilter === 'all' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'mr' ? 'सर्व' : 'All'} ({activeDrillDownArea.total})
                </button>
                <button
                  type="button"
                  onClick={() => setDrillDownStatusFilter('open')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    drillDownStatusFilter === 'open' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'mr' ? 'प्रलंबित' : 'Open'} ({activeDrillDownArea.openCount})
                </button>
                <button
                  type="button"
                  onClick={() => setDrillDownStatusFilter('overdue')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    drillDownStatusFilter === 'overdue' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'mr' ? 'मुदत संपली' : 'Overdue'} ({activeDrillDownArea.overdueCount})
                </button>
                <button
                  type="button"
                  onClick={() => setDrillDownStatusFilter('resolved')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    drillDownStatusFilter === 'resolved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'mr' ? 'निवारण' : 'Fixed'} ({activeDrillDownArea.resolvedCount})
                </button>
              </div>
            </div>

            {/* List of Issues */}
            {drillDownIssues.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                <p>{language === 'mr' ? 'या फिल्टरनुसार कोणतीही समस्या उपलब्ध नाही.' : 'No issues found matching this filter.'}</p>
                <button
                  type="button"
                  onClick={() => setDrillDownStatusFilter('all')}
                  className="text-xs text-cyan-400 font-bold hover:underline"
                >
                  {language === 'mr' ? 'सर्व समस्या पहा' : 'View all issues in this ward'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {drillDownIssues.map((issue) => {
                  const isResolved = issue.status === 'RESOLVED';
                  const isChronic = issue.status === 'CHRONIC_REOPENED';
                  const sla = getSLAStatus(issue.created_at, issue.sla_hours, issue.status, issue.resolved_at, language);
                  const theme = getCategoryTheme(issue.category);
                  const primaryReport = issue.reports && issue.reports.length > 0
                    ? (issue.reports.find(r => r.report_type === 'INITIAL' && r.photo_url) || issue.reports.find(r => r.photo_url) || issue.reports[0])
                    : null;
                  const photoUrl = primaryReport?.photo_url;
                  const notes = primaryReport?.notes;
                  const verifications = issue.corroboration_count || 1;

                  return (
                    <div
                      key={issue.id}
                      className="bg-[#111827] border border-white/[0.08] hover:border-cyan-500/40 rounded-2xl p-3.5 sm:p-4 shadow-sm transition-all space-y-3"
                    >
                      {/* Top Row: Category, Subtag & Verification Count */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 ${theme.badge}`}>
                            <span>{theme.emoji}</span>
                            <span>{t.categories[issue.category] || issue.category}</span>
                          </span>
                          {issue.sub_tag && (
                            <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-medium truncate max-w-[180px] sm:max-w-xs">
                              {issue.sub_tag}
                            </span>
                          )}
                        </div>

                        {/* Prominent Verification Badge */}
                        <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-950/90 border border-cyan-800 text-cyan-300 font-mono text-[11px] sm:text-xs font-black shadow-xs">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{verifications}</span>
                          <span className="font-sans text-[10px] font-semibold text-cyan-400">
                            {language === 'mr' ? 'पुष्टी' : 'Verified'}
                          </span>
                        </div>
                      </div>

                      {/* Main Body: Photo Preview + Issue Details */}
                      <div className="flex items-start gap-3">
                        {photoUrl ? (
                          <div
                            onClick={() => setActiveLightboxUrl(photoUrl)}
                            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-slate-700 shrink-0 cursor-pointer group/photo bg-slate-950"
                            title="Click to view full photo evidence"
                          >
                            <img
                              src={photoUrl}
                              alt={issue.category}
                              className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-dashed border-slate-800 bg-slate-900/60 flex flex-col items-center justify-center shrink-0 text-slate-600 text-[10px]">
                            <MapPin className="w-5 h-5 text-slate-600 mb-1" />
                            <span>No Photo</span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0 space-y-1.5">
                          {/* Status & SLA Pill */}
                          <div className="flex items-center gap-2 flex-wrap text-[11px]">
                            {isResolved ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{language === 'mr' ? 'निवारण झाले' : 'Resolved'}</span>
                              </span>
                            ) : sla.isOverdue ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-800 text-rose-400 font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{language === 'mr' ? 'मुदत संपली' : 'SLA Breached'}</span>
                              </span>
                            ) : isChronic ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-800 text-purple-400 font-bold">
                                <Flame className="w-3 h-3" />
                                <span>{language === 'mr' ? 'वारंवार समस्या' : 'Chronic'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-800 text-amber-400 font-bold">
                                <Clock className="w-3 h-3" />
                                <span>{language === 'mr' ? 'प्रलंबित' : 'Open'}</span>
                              </span>
                            )}

                            <span className="text-[10px] text-slate-400 font-medium">
                              {sla.label}
                            </span>
                          </div>

                          {/* Location / Area Name */}
                          <div className="text-xs text-slate-300 font-semibold flex items-center gap-1 truncate">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate">{issue.area_name || 'PCMC'}</span>
                          </div>

                          {/* Citizen Notes / Landmark if present */}
                          {notes && (
                            <p className="text-[11px] text-slate-400 italic bg-slate-950/70 border border-slate-800/80 rounded-lg px-2.5 py-1 line-clamp-2">
                              "{notes}"
                            </p>
                          )}

                          {/* Timestamp */}
                          <div className="text-[10px] text-slate-500">
                            {language === 'mr' ? 'नोंद तारीख: ' : 'Reported: '}
                            {new Date(issue.created_at).toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Action Row: Direct Link / Button to View on Map */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID: {issue.id.slice(0, 8)} • SLA {issue.sla_hours}h
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (onNavigateToMap) {
                              onNavigateToMap(issue.id);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                          title={language === 'mr' ? 'नकाशावर पहा' : 'View on Map'}
                        >
                          <Map className="w-3.5 h-3.5" />
                          <span>{language === 'mr' ? 'नकाशावर पहा' : 'View on Map'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* VIEW B: FULL AREA / WARD RANKINGS OVERVIEW               */
        /* ======================================================== */
        <div className="space-y-4">
          {/* SINGLE-ROW WARD FILTER & SORT BAR */}
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
                    <span className="font-bold text-cyan-300">{language === 'mr' ? 'सर्व प्रभाग (३२)' : 'All Wards (32)'}</span>
                  ) : (
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="font-mono text-[10px] font-black px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                        {activeWardInfo?.badge}
                      </span>
                      <span className="truncate text-white font-bold">
                        {language === 'mr' ? (activeWardInfo?.marathiWardLabel || activeWardInfo?.locality) : activeWardInfo?.locality}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal shrink-0">
                        ({language === 'mr' ? activeWardInfo?.marathiZone : activeWardInfo?.zone})
                      </span>
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
                  <option value="overdue">{language === 'mr' ? 'क्रमवारी: सर्वाधिक मुदत संपलेली' : 'Sort: Most Overdue'}</option>
                  <option value="open">{language === 'mr' ? 'क्रमवारी: सर्वाधिक प्रलंबित' : 'Sort: Most Open'}</option>
                  <option value="resolutionRate">{language === 'mr' ? 'क्रमवारी: निवारण दर' : 'Sort: Resolution Rate'}</option>
                  <option value="total">{language === 'mr' ? 'क्रमवारी: एकूण तक्रारी' : 'Sort: Total Reports'}</option>
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
                  {language === 'mr' ? activeZoneOffice.marathiZone : activeZoneOffice.zone}
                </span>
                <span className="truncate text-slate-300 font-medium">
                  {language === 'mr' ? `सहाय्यक आयुक्त, ${activeZoneOffice.marathiZone}` : activeZoneOffice.officer}
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

          {/* 3-COLUMN SUMMARY STRIP */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {/* TOTAL OPEN */}
            <div className="bg-[#111827] border border-white/[0.07] border-t-2 border-t-amber-400 rounded-2xl py-2 px-1.5 sm:p-4 shadow-md text-center relative overflow-hidden">
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-tight">
                <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span className="truncate">{t.totalOpen}</span>
              </div>
              <div className="text-2xl sm:text-[34px] font-black text-white mt-0.5 sm:mt-1 leading-none font-mono tabular-nums">
                {summaryStrip.totalOpen}
              </div>
              <p className="text-[9px] sm:text-[11px] text-slate-400 mt-1 truncate">
                {selectedWardFilter === 'ALL'
                  ? (language === 'mr' ? 'शहर पातळी (PCMC)' : 'City-wide PCMC')
                  : (language === 'mr' ? 'निवडलेल्या प्रभागात' : 'In selected ward')}
              </p>
            </div>

            {/* OVERDUE */}
            <div className="bg-[#111827] border border-white/[0.07] border-t-2 border-t-rose-500 rounded-2xl py-2 px-1.5 sm:p-4 shadow-md text-center relative overflow-hidden">
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-rose-400 uppercase tracking-tight">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
                <span className="truncate">{t.overdue}</span>
              </div>
              <div className="text-2xl sm:text-[34px] font-black text-rose-400 mt-0.5 sm:mt-1 leading-none font-mono tabular-nums">
                {summaryStrip.overdueCount}
              </div>
              <p className="text-[9px] sm:text-[11px] text-slate-400 mt-1 truncate">
                {language === 'mr' ? 'मुदत संपलेली' : 'Breached SLA'}
              </p>
            </div>

            {/* RESOLVED */}
            <div className="bg-[#111827] border border-white/[0.07] border-t-2 border-t-emerald-400 rounded-2xl py-2 px-1.5 sm:p-4 shadow-md text-center relative overflow-hidden">
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-tight">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{t.resolved}</span>
              </div>
              <div className="text-2xl sm:text-[34px] font-black text-emerald-400 mt-0.5 sm:mt-1 leading-none font-mono tabular-nums">
                {summaryStrip.resolvedCount}
              </div>
              <p className="text-[9px] sm:text-[11px] text-slate-400 mt-1 truncate">
                {language === 'mr' ? 'निवारण झाले' : 'Fixed & verified'}
              </p>
            </div>
          </div>

          {/* AREA CIVIC VULNERABILITY RANKING LIST */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs px-0.5">
              <h2 className="text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>{t.vulnerabilityRanking}</span>
                <span className="text-[10px] sm:text-[11px] font-normal text-slate-500">
                  ({rankedAreas.length} {rankedAreas.length === 1 ? 'area' : 'areas'})
                </span>
              </h2>

              {selectedWardFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedWardFilter('ALL')}
                  className="text-[10px] sm:text-[11px] text-cyan-400 hover:underline font-semibold"
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {rankedAreas.map((area, index) => {
                  const rank = index + 1;
                  const hasOverdue = area.overdueCount > 0;
                  const resolutionPct = area.total > 0 ? Math.round((area.resolvedCount / area.total) * 100) : 0;

                  return (
                    <div
                      key={`${area.wardInfo.badge}-${area.areaName}`}
                      onClick={() => {
                        setDrillDownWardBadge(area.wardInfo.badge);
                        setDrillDownStatusFilter('all');
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
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
                              {language === 'mr' ? (area.wardInfo.marathiWardLabel || area.areaName) : area.areaName}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                              {language === 'mr' ? area.wardInfo.marathiZone : area.wardInfo.zone} {area.chronicCount > 0 && (language === 'mr' ? `• ${area.chronicCount} वारंवार` : `• ${area.chronicCount} chronic`)}
                            </span>
                          </div>
                        </div>

                        {/* Right-aligned Count Pill */}
                        <div className="text-right shrink-0">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-bold">
                            <span className="text-amber-400">
                              {area.openCount} {language === 'mr' ? 'प्रलंबित' : 'Open'}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className={hasOverdue ? 'text-rose-400' : 'text-slate-400'}>
                              {area.overdueCount} {language === 'mr' ? 'मुदत संपलेली' : 'Overdue'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Subtle Horizontal Progress Bar (Open vs Resolved) */}
                      <div className="mt-2 pt-2 border-t border-slate-800/60 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{language === 'mr' ? 'निवारण दर' : 'Resolution Rate'}</span>
                          <span className="font-semibold text-slate-300">
                            {resolutionPct}% ({language === 'mr' ? `${area.resolvedCount}/${area.total} निवारण` : `${area.resolvedCount}/${area.total} fixed`})
                          </span>
                        </div>

                        <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden flex">
                          <div
                            className="bg-emerald-500 h-full transition-all duration-300"
                            style={{ width: `${resolutionPct}%` }}
                          />
                          {area.overdueCount > 0 && (
                            <div
                              className="bg-rose-500/80 h-full transition-all duration-300"
                              style={{ width: `${Math.round((area.overdueCount / area.total) * 100)}%` }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Row 3: Category Emoji Pills (Full-width horizontal row) */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-2">
                        {Object.entries(area.categories).map(([cat, cnt]) => {
                          const theme = getCategoryTheme(cat);
                          const emoji = cat === 'Footpath' ? '🚶' : cat === 'Pothole' ? '🚧' : theme.emoji;
                          return (
                            <span
                              key={cat}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-slate-300 text-[10px] font-medium"
                            >
                              <span>{emoji}</span>
                              <span>{(t.categories as Record<string, string>)[cat] || cat}</span>
                              <span className="font-mono text-slate-400">({cnt})</span>
                            </span>
                          );
                        })}
                      </div>

                      {/* Row 4: Card Action Footer (Corporators & View Issues) */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60 text-xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCorporatorsWard(expandedCorporatorsWard === area.wardInfo.wardNo ? null : area.wardInfo.wardNo);
                          }}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 transition-colors"
                          title="View Elected Corporators"
                        >
                          <Users className="w-3 h-3 text-cyan-400" />
                          <span>
                            {expandedCorporatorsWard === area.wardInfo.wardNo 
                              ? (language === 'mr' ? 'बंद करा' : 'Hide Corporators') 
                              : (language === 'mr' ? 'नगरसेवक (४)' : 'Corporators (4)')}
                          </span>
                        </button>

                        {/* Direct Drill-Down Trigger */}
                        <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all">
                          <span>{language === 'mr' ? 'तक्रारी पहा' : 'View Issues'} ({area.total})</span>
                          <ChevronRight className="w-3.5 h-3.5" />
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
                            wardLocality={language === 'mr' ? (area.wardInfo.marathiWardLabel || area.wardInfo.locality) : area.wardInfo.locality}
                            zone={language === 'mr' ? (area.wardInfo.marathiZone || area.wardInfo.zone) : area.wardInfo.zone}
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
        </div>
      )}

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
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {language === 'mr' ? 'PCMC प्रभाग किंवा परिसर निवडा' : 'Select PCMC Ward or Area'}
                </h3>
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
                placeholder={language === 'mr' ? 'वाकड, किवळे, निगडी, प्रभाग १७, भोसरी शोधा...' : 'Search Wakad, Kiwale, Nigdi, W-17, Bhosari...'}
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
                  setDrillDownWardBadge(null);
                  setShowWardPicker(false);
                }}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  selectedWardFilter === 'ALL' && !drillDownWardBadge
                    ? 'bg-cyan-950/50 border-cyan-500 text-white'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-black text-xs">
                    ALL
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">
                      {language === 'mr' ? 'सर्व प्रभाग (३२)' : 'All Wards (32)'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {language === 'mr' ? 'अ ते ल सर्व १० क्षेत्रीय कार्यालये व ३२ प्रभागांचा आढावा' : 'City-wide PCMC overview across Zone A through Zone H'}
                    </span>
                  </div>
                </div>
                {selectedWardFilter === 'ALL' && !drillDownWardBadge && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
              </button>

              {/* PINNED OPTION 2: MY GPS WARD */}
              {gpsWardInfo && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWardFilter(gpsWardInfo.locality);
                    setDrillDownWardBadge(gpsWardInfo.badge);
                    setShowWardPicker(false);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    drillDownWardBadge === gpsWardInfo.badge
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
                        {language === 'mr'
                          ? `माझा GPS प्रभाग: ${gpsWardInfo.badge} • ${gpsWardInfo.marathiWardLabel || gpsWardInfo.locality}`
                          : `My GPS Ward: ${gpsWardInfo.badge} • ${gpsWardInfo.locality}`}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {language === 'mr'
                          ? `थेट स्थानावरून शोधलेला (${gpsWardInfo.marathiZone || gpsWardInfo.zone})`
                          : `Auto-detected via live location (${gpsWardInfo.zone})`}
                      </span>
                    </div>
                  </div>
                  {drillDownWardBadge === gpsWardInfo.badge && (
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
                        {language === 'mr' ? zoneName.replace('Zone', 'क्षेत्रीय') : zoneName}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {presets.map((p) => {
                          const wInfo = getWardForArea(p.name, p.latitude, p.longitude);
                          const isSelected = drillDownWardBadge === wInfo.badge || (selectedWardFilter.toLowerCase().includes(p.name.toLowerCase()) && !drillDownWardBadge);

                          return (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => {
                                setSelectedWardFilter(p.name);
                                setDrillDownWardBadge(wInfo.badge);
                                setShowWardPicker(false);
                              }}
                              className={`p-2 rounded-xl text-left border text-xs transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'bg-cyan-950/50 border-cyan-500 text-white'
                                  : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white'
                              }`}
                            >
                              <div className="min-w-0 pr-1">
                                <div className="font-bold truncate text-white">
                                  {language === 'mr' ? (p.nameMr || p.name).split(' चौक')[0].split(' रोड')[0] : p.name.split(' Chowk')[0].split(' Road')[0]}
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <span className="font-mono text-cyan-400 font-bold">{wInfo.badge}</span>
                                  <span>•</span>
                                  <span>{language === 'mr' ? p.ward.replace('Ward', 'प्रभाग') : p.ward}</span>
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
      {/* 6. LIGHTBOX MODAL FOR ISSUE PHOTO EVIDENCE                */}
      {/* ======================================================== */}
      {activeLightboxUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setActiveLightboxUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActiveLightboxUrl(null)}
              className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeLightboxUrl}
              alt="Civic Issue Proof"
              className="max-h-[80vh] w-auto rounded-2xl object-contain border border-slate-700 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. NON-AFFILIATION CITIZEN INITIATIVE FOOTER              */}
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