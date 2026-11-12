import { useEffect, useState, useRef, useMemo, type ChangeEvent } from 'react';
import { 
  MapPin, 
  RefreshCw, 
  Crosshair, 
  X, 
  Flame, 
  Check, 
  Share2, 
  Clock, 
  Camera, 
  Send,
  Download
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Hotspot, Report, Category } from '../types';
import { CATEGORIES } from '../types';
import { supabase, haversineDistanceMeters, submitClearanceReport } from '../supabase';
import { PCMC_CENTER, getSLAStatus } from '../utils/geo';
import { EscalateModal } from './EscalateModal';
import { exportHotspotsToCSV } from '../utils/csvExport';
import type { Language } from '../utils/i18n';
import { TRANSLATIONS } from '../utils/i18n';
import confetti from 'canvas-confetti';

interface MapTabProps {
  language: Language;
  selectedHotspotId?: string | null;
  onSnapAtLocation?: (coords: { lat: number; lng: number }) => void;
}

function MapController({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom(), { animate: true });
  }, [center, zoom, map]);
  return null;
}

function createHotspotIcon(category: string, status: string, corroborations: number) {
  const color = status === 'RESOLVED' ? '#22c55e' : status === 'CHRONIC_REOPENED' ? '#a855f7' : '#ef4444';
  const bgColor = status === 'RESOLVED' ? '#14532d' : status === 'CHRONIC_REOPENED' ? '#581c87' : '#7f1d1d';
  const emoji = category === 'Garbage' ? '🗑️' : category === 'Drainage' ? '💧' : category === 'Streetlight' ? '💡' : category === 'Encroachment' ? '🛑' : '⚠️';

  return L.divIcon({
    className: 'custom-civic-pin',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: ${bgColor};
          border: 3px solid ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0,0,0,0.6);
          font-size: 16px;
          transform: translateY(-2px);
          transition: transform 0.2s ease;
        ">
          ${emoji}
        </div>
        ${corroborations > 1 ? `
          <div style="
            position: absolute;
            top: -4px;
            right: -4px;
            background: #e11d48;
            color: white;
            font-size: 10px;
            font-weight: 800;
            border-radius: 9999px;
            padding: 1px 5px;
            border: 1.5px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.4);
          ">${corroborations}x</div>
        ` : ''}
        ${status === 'CHRONIC_REOPENED' ? `
          <div style="
            position: absolute;
            bottom: -3px;
            background: #9333ea;
            color: white;
            font-size: 8px;
            font-weight: 900;
            border-radius: 4px;
            padding: 0 3px;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.5);
          ">CHRONIC</div>
        ` : ''}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 36],
    popupAnchor: [0, -36]
  });
}

export const MapTab = ({ language, selectedHotspotId }: MapTabProps) => {
  const afterFileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[language];

  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([PCMC_CENTER.latitude, PCMC_CENTER.longitude]);
  const [mapZoom, setMapZoom] = useState<number>(13);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // User GPS & Test Mode
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isTestMode, setIsTestMode] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Escalation Modal state
  const [escalateTargetHotspot, setEscalateTargetHotspot] = useState<Hotspot | null>(null);

  // Clearance Action States
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [clearancePhotoBlob, setClearancePhotoBlob] = useState<Blob | File | null>(null);
  const [clearancePhotoPreview, setClearancePhotoPreview] = useState<string | null>(null);
  const [clearanceNotes, setClearanceNotes] = useState<string>('');
  const [showClearanceForm, setShowClearanceForm] = useState<boolean>(false);
  const [clearanceError, setClearanceError] = useState<string | null>(null);

  const loadHotspots = async () => {
    try {
      const { data, error } = await supabase
        .from('hotspots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHotspots((data as Hotspot[]) || []);
    } catch (err) {
      console.error('Error fetching hotspots:', err);
    }
  };

  useEffect(() => {
    loadHotspots();
    fetchUserLocation();
  }, []);

  const fetchUserLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  const handleLocateMe = () => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setMapZoom(16);
    } else {
      fetchUserLocation();
    }
  };

  useEffect(() => {
    if (selectedHotspotId && hotspots.length > 0) {
      const match = hotspots.find(h => h.id === selectedHotspotId);
      if (match) {
        handleSelectHotspot(match);
      }
    }
  }, [selectedHotspotId, hotspots]);

  const handleSelectHotspot = async (h: Hotspot) => {
    setSelectedHotspot(h);
    setMapCenter([h.latitude, h.longitude]);
    setMapZoom(16);
    setShowClearanceForm(false);
    setClearancePhotoBlob(null);
    setClearancePhotoPreview(null);
    setClearanceError(null);

    setLoadingReports(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('hotspot_id', h.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setReports(data as Report[]);
      }
    } catch (e) {
      console.warn('Error loading reports timeline:', e);
    } finally {
      setLoadingReports(false);
    }
  };

  const distanceToPin = useMemo(() => {
    if (!selectedHotspot || !userLocation) return null;
    return Math.round(haversineDistanceMeters(
      userLocation.lat,
      userLocation.lng,
      selectedHotspot.latitude,
      selectedHotspot.longitude
    ));
  }, [selectedHotspot, userLocation]);

  const canClearHotspot = isTestMode || (distanceToPin !== null && distanceToPin <= 30);

  const handleTriggerAfterPhoto = () => {
    if (afterFileInputRef.current) {
      afterFileInputRef.current.click();
    }
  };

  const handleAfterPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setClearancePhotoBlob(file);
      setClearancePhotoPreview(URL.createObjectURL(file));
      setClearanceError(null);
    }
  };

  const handleUseSampleAfterPhoto = () => {
    const sample = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop';
    fetch(sample)
      .then(res => res.blob())
      .then(blob => {
        setClearancePhotoBlob(blob);
        setClearancePhotoPreview(sample);
        setClearanceError(null);
      })
      .catch(() => {
        setClearancePhotoPreview(sample);
      });
  };

  const handleSubmitClearance = async () => {
    if (!selectedHotspot) return;
    if (!clearancePhotoBlob && !clearancePhotoPreview) {
      setClearanceError(language === 'mr' ? 'कृपया समस्येचे निराकरण झाल्याचा प्रत्यक्ष फोटो घ्या.' : 'Please take a live "After" photo to verify clearance.');
      return;
    }

    setIsClearing(true);
    setClearanceError(null);

    try {
      let finalBlob = clearancePhotoBlob;
      if (!finalBlob && clearancePhotoPreview) {
        const res = await fetch(clearancePhotoPreview);
        finalBlob = await res.blob();
      }

      const result = await submitClearanceReport(
        selectedHotspot.id,
        finalBlob!,
        clearanceNotes.trim() || 'Verified by Nagrik Citizen Audit'
      );

      setSelectedHotspot(result.hotspot);
      setHotspots(prev => prev.map(h => h.id === result.hotspot.id ? result.hotspot : h));
      setReports(prev => [...prev, result.report]);
      setShowClearanceForm(false);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Clearance error:', err);
      setClearanceError(msg || 'Failed to submit clearance report.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!selectedHotspot) return;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedHotspot.latitude},${selectedHotspot.longitude}`;
    const latestPhoto = reports.length > 0 ? reports[reports.length - 1].photo_url : null;
    
    const message = 
      `🚨 *Civic Issue Grievance - PCMC*\n\n` +
      `• *Issue*: ${selectedHotspot.category} (${selectedHotspot.sub_tag})\n` +
      `• *Location*: ${selectedHotspot.area_name}\n` +
      `• *Status*: ${selectedHotspot.status}\n` +
      `• *Residents on-site*: ${selectedHotspot.corroboration_count} citizen verifications\n` +
      `• *SLA Deadline*: ${selectedHotspot.sla_hours} hours\n` +
      `• *GPS*: ${selectedHotspot.latitude.toFixed(5)}, ${selectedHotspot.longitude.toFixed(5)}\n\n` +
      (latestPhoto ? `📸 *Photo Evidence Link*:\n${latestPhoto}\n\n` : '') +
      `📍 *Google Maps Location*:\n${googleMapsUrl}\n\n` +
      `_Forwarded for municipal field inspection and timely resolution._`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const filteredHotspots = hotspots.filter(h => {
    if (categoryFilter !== 'ALL' && h.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-slate-950">
      {/* 1. TOP CATEGORY FILTER PILLS */}
      <div className="absolute top-3 left-3 right-3 z-[1000] max-w-lg mx-auto flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl">
          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              categoryFilter === 'ALL'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.allIssues} ({hotspots.length})
          </button>
          {(Object.keys(CATEGORIES) as Category[]).map((cat) => {
            const count = hotspots.filter(h => h.category === cat).length;
            const emoji = cat === 'Garbage' ? '🗑️' : cat === 'Drainage' ? '💧' : cat === 'Streetlight' ? '💡' : '⚠️';
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  categoryFilter === cat
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{emoji}</span>
                <span>{t.categories[cat] || cat}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Floating Controls: Locate Me, Refresh, CSV Dossier Export */}
        <div className="flex items-center justify-between text-xs px-1">
          {/* Status Color Legend */}
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 text-[10px]">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block shadow-sm" /> {t.open}
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block shadow-sm" /> {t.chronic}
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block shadow-sm" /> {t.resolved}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Export CSV Dossier Button */}
            <button
              type="button"
              onClick={() => exportHotspotsToCSV(hotspots)}
              className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 shadow-md active:scale-95 hover:text-cyan-400"
              title="Download CSV Dossier"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={handleLocateMe}
              className="p-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-cyan-400 hover:text-cyan-300 shadow-md active:scale-95"
              title={t.locateMe}
            >
              <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={loadHotspots}
              className="p-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white shadow-md active:scale-95"
              title="Refresh Hotspots"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. FULL-SCREEN REACT-LEAFLET WITH FREE OPENSTREETMAP TILES */}
      <div className="w-full h-full z-10">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          zoomControl={false}
          className="w-full h-full"
        >
          <MapController center={mapCenter} zoom={mapZoom} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {filteredHotspots.map((h) => {
            const icon = createHotspotIcon(h.category, h.status, h.corroboration_count);
            return (
              <Marker
                key={h.id}
                position={[h.latitude, h.longitude]}
                icon={icon}
                eventHandlers={{
                  click: () => handleSelectHotspot(h)
                }}
              />
            );
          })}
        </MapContainer>
      </div>

      {/* Hidden file input for capturing live After photo */}
      <input
        type="file"
        ref={afterFileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleAfterPhotoChange}
      />

      {/* 3. BOTTOM DRAWER FOR SELECTED HOTSPOT */}
      {selectedHotspot && (
        <div className="absolute bottom-16 left-0 right-0 z-[1050] max-w-lg mx-auto px-3 pb-2 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl max-h-[75vh] overflow-y-auto space-y-3.5 no-scrollbar">
            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                  selectedHotspot.status === 'RESOLVED' ? 'bg-green-950/60 border-green-500/60' :
                  selectedHotspot.status === 'CHRONIC_REOPENED' ? 'bg-purple-950/60 border-purple-500/60' :
                  'bg-red-950/60 border-red-500/60'
                }`}>
                  {selectedHotspot.category === 'Garbage' ? '🗑️' : selectedHotspot.category === 'Drainage' ? '💧' : selectedHotspot.category === 'Streetlight' ? '💡' : selectedHotspot.category === 'Encroachment' ? '🛑' : '⚠️'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{t.categories[selectedHotspot.category] || selectedHotspot.category}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      selectedHotspot.status === 'OPEN' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                      selectedHotspot.status === 'CHRONIC_REOPENED' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                      'bg-green-500/20 text-green-400 border-green-500/40'
                    }`}>
                      {selectedHotspot.status === 'OPEN' ? `🔴 ${t.open}` :
                       selectedHotspot.status === 'CHRONIC_REOPENED' ? `🟣 ${t.chronic}` :
                       `🟢 ${t.resolved}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 truncate max-w-[240px] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    {selectedHotspot.area_name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHotspot(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SLA Governance & Hours/Days Open vs SLA */}
            {(() => {
              const sla = getSLAStatus(selectedHotspot.created_at, selectedHotspot.sla_hours, selectedHotspot.status, selectedHotspot.resolved_at);
              return (
                <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {t.hoursOpenVsSla}:
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sla.badgeClass}`}>
                      {sla.label}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-200">
                    {sla.slaRatioText}
                  </div>
                </div>
              );
            })()}

            {/* Counts: Corroborations & Recurrences */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">{t.corroborations}</span>
                <span className="font-black text-sm text-cyan-400 flex items-center justify-center gap-1 mt-0.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  {selectedHotspot.corroboration_count} {language === 'mr' ? 'नागरिकांची पुष्टी' : 'Verified'}
                </span>
              </div>

              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">{t.recurrenceCount}</span>
                <span className="font-black text-sm text-purple-300 mt-0.5 block">
                  {selectedHotspot.recurrence_count > 0 ? `${selectedHotspot.recurrence_count}x Reopened` : 'Initial (0)'}
                </span>
              </div>
            </div>

            {/* Photo Timeline from Reports */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  {t.evidenceTimeline} ({reports.length})
                </span>
                {loadingReports && <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />}
              </div>

              {reports.length === 0 && !loadingReports ? (
                <div className="text-center py-3 text-xs text-slate-500 bg-slate-950/50 rounded-xl">
                  No photographic reports logged yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 no-scrollbar">
                  {reports.map((report, idx) => {
                    const dateStr = new Date(report.created_at).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={report.id}
                        className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800/90 text-xs"
                      >
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-700 bg-black">
                          <img
                            src={report.photo_url}
                            alt={`Evidence ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${
                              report.report_type === 'CLEARANCE' ? 'bg-green-950 text-green-300 border-green-700' :
                              report.report_type === 'REOPEN' ? 'bg-purple-950 text-purple-300 border-purple-700' :
                              report.report_type === 'CORROBORATION' ? 'bg-blue-950 text-blue-300 border-blue-700' :
                              'bg-amber-950 text-amber-300 border-amber-700'
                            }`}>
                              {report.report_type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{dateStr}</span>
                          </div>

                          <p className="text-[11px] text-slate-300 truncate">
                            {report.notes || (report.report_type === 'CLEARANCE' ? 'Clearance photo verified' : 'Citizen report')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Test Mode Toggle & Proximity Status */}
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-300 font-medium">GPS Range:</span>
                {distanceToPin !== null ? (
                  <span className={`font-mono text-[11px] font-bold ${distanceToPin <= 30 ? 'text-green-400' : 'text-amber-400'}`}>
                    {distanceToPin}m away {distanceToPin <= 30 ? '(Within 30m ✓)' : '(Outside 30m)'}
                  </span>
                ) : (
                  <span className="text-slate-500 text-[10px]">Checking device GPS...</span>
                )}
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTestMode}
                  onChange={(e) => setIsTestMode(e.target.checked)}
                  className="w-3.5 h-3.5 accent-cyan-500 rounded"
                />
                <span className="text-[10px] text-cyan-300 font-bold">{t.testModeLabel}</span>
              </label>
            </div>

            {/* CLEARANCE WORKFLOW FORM (WHEN MARK AS CLEARED CLICKED) */}
            {showClearanceForm ? (
              <div className="p-3 rounded-xl bg-green-950/30 border border-green-500/40 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-green-300 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-green-400" />
                    Verify Issue Clearance
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowClearanceForm(false)}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                {!clearancePhotoPreview ? (
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={handleTriggerAfterPhoto}
                      className="w-full py-3 px-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      Snap Live 'After' Photo (Rear Camera)
                    </button>
                    <button
                      type="button"
                      onClick={handleUseSampleAfterPhoto}
                      className="w-full text-center text-[10px] text-green-300/80 hover:text-green-200"
                    >
                      + Use Demo Cleaned Road Photo (Desktop Test)
                    </button>
                  </div>
                ) : (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-green-600/50">
                    <img src={clearancePhotoPreview} alt="After photo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleTriggerAfterPhoto}
                      className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-[10px] flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3 text-green-400" /> Retake
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  value={clearanceNotes}
                  onChange={(e) => setClearanceNotes(e.target.value)}
                  placeholder="Clearance note (e.g., Road resurfaced, debris cleared)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                />

                {clearanceError && (
                  <p className="text-[11px] text-rose-400">{clearanceError}</p>
                )}

                <button
                  type="button"
                  disabled={isClearing}
                  onClick={handleSubmitClearance}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
                >
                  {isClearing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting Clearance & Resolving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Submit Clearance & Mark Resolved</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* ACTION BUTTONS: MARK AS CLEARED, SHARE WHATSAPP, AND ESCALATE TO PCMC */
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  {selectedHotspot.status !== 'RESOLVED' ? (
                    <button
                      type="button"
                      disabled={!canClearHotspot}
                      onClick={() => setShowClearanceForm(true)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 ${
                        canClearHotspot
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                      title={!canClearHotspot ? 'Must be within 30m of pin (or turn on Test Mode above)' : ''}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {t.markCleared}
                    </button>
                  ) : (
                    <div className="py-2 px-2 text-center text-xs font-bold text-green-400 bg-green-950/40 border border-green-800 rounded-xl flex items-center justify-center gap-1">
                      ✓ {t.resolved}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>

                {/* ESCALATE TO PCMC OFFICIALS BUTTON */}
                <button
                  type="button"
                  onClick={() => setEscalateTargetHotspot(selectedHotspot)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.escalateEmail} (Ward Officer + Nodal Dept)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. ESCALATE TO OFFICIALS MODAL */}
      {escalateTargetHotspot && (
        <EscalateModal
          hotspot={escalateTargetHotspot}
          reports={reports}
          language={language}
          onClose={() => setEscalateTargetHotspot(null)}
        />
      )}
    </div>
  );
};
