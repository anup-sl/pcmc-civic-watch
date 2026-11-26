import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { triggerHaptic } from '../utils/haptics';
import { ImageLightbox } from './ImageLightbox';
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Droplets, 
  Lightbulb, 
  RefreshCw, 
  Sparkles, 
  Check, 
  Crosshair, 
  Plus,
  Edit2,
  Search,
  ShieldAlert,
  Flag,
  Users,
  Building2,
  Phone,
  ExternalLink,
  Send,
  X,
  Trees,
  PawPrint,
  Wind,
  Smartphone,
  Footprints
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CATEGORIES } from '../types';
import type { Category, Hotspot } from '../types';
import { submitCivicReport, supabase, haversineDistanceMeters } from '../supabase';
import type { SubmitReportResult } from '../supabase';
import { PCMC_PRESETS, PCMC_CENTER, reverseGeocodeLocation, formatZoneDisplay } from '../utils/geo';
import { getWardForArea } from '../utils/pcmcDirectory';
import { stampGPSWatermark } from '../utils/watermark';
import { FlagModal } from './FlagModal';
import { CorporatorSection } from './CorporatorSection';
import { EscalateModal } from './EscalateModal';
import { analyzeImageContent } from '../utils/contentModeration';
import type { Language } from '../utils/i18n';
import { TRANSLATIONS } from '../utils/i18n';
import { getSubTagsForCategory, getDynamicQuickPhrases } from '../utils/issueTranslations';
import { getOfficialWardByNumber, getOfficialZoneByKey } from '../utils/pcmcOfficialWardZoneData';

interface ReportTabProps {
  language: Language;
  onNavigateToMap: (hotspotId?: string) => void;
  onNavigateToLeaderboard?: () => void;
  initialCoords?: { lat: number; lng: number } | null;
}

export const ReportTab = ({ language, onNavigateToMap, initialCoords }: ReportTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categorySectionRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  // Form states
  const [rawPhotoFile, setRawPhotoFile] = useState<File | Blob | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Pothole');
  const [selectedSubTag, setSelectedSubTag] = useState<string>(CATEGORIES.Pothole.subTags[0]);
  const [notes, setNotes] = useState<string>('');
  const [citizenEmail, setCitizenEmail] = useState<string>('');

  // Location states
  const [latitude, setLatitude] = useState<number>(initialCoords?.lat || PCMC_CENTER.latitude);
  const [longitude, setLongitude] = useState<number>(initialCoords?.lng || PCMC_CENTER.longitude);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [areaName, setAreaName] = useState<string>(PCMC_CENTER.name);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [isOutsidePCMC, setIsOutsidePCMC] = useState<boolean>(false);
  const [isEditingArea, setIsEditingArea] = useState<boolean>(false);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [wardSearchQuery, setWardSearchQuery] = useState<string>('');

  // Submission & Detection states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [nearbyHotspots, setNearbyHotspots] = useState<{ hotspot: Hotspot; distance: number }[]>([]);
  const [submissionResult, setSubmissionResult] = useState<SubmitReportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [contentCheckConfirmed, setContentCheckConfirmed] = useState<boolean>(true);
  const [showFlagInfoModal, setShowFlagInfoModal] = useState<boolean>(false);
  const [isScanningImage, setIsScanningImage] = useState<boolean>(false);
  const [imageScanError, setImageScanError] = useState<{ reason: string; marathiReason: string } | null>(null);
  const [isManualArea, setIsManualArea] = useState<boolean>(false);
  const [showCorporatorsModal, setShowCorporatorsModal] = useState<boolean>(false);
  const [showZoneModal, setShowZoneModal] = useState<boolean>(false);
  const [escalateHotspot, setEscalateHotspot] = useState<Hotspot | null>(null);
  const [citizenName, setCitizenName] = useState<string>(() => {
    try { return localStorage.getItem('pcmc_citizen_name') || ''; } catch { return ''; }
  });
  const [citizenPhone, setCitizenPhone] = useState<string>(() => {
    try { return localStorage.getItem('pcmc_citizen_contact') || ''; } catch { return ''; }
  });

  // Fetch all hotspots to calculate ward-specific dashboard metrics
  // Live reverse geocoding on coordinates
  const resolveAddressForCoords = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await reverseGeocodeLocation(lat, lng);
      setAreaName(res.formattedArea);
      setIsOutsidePCMC(!res.isWithinPCMC);
    } catch (err) {
      console.warn('Geocoding error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Initialize GPS on load
  useEffect(() => {
    if (!initialCoords) {
      grabLiveGPS();
    } else {
      setLatitude(initialCoords.lat);
      setLongitude(initialCoords.lng);
      resolveAddressForCoords(initialCoords.lat, initialCoords.lng);
    }
  }, [initialCoords]);

  const handleCategorySelect = (cat: Category) => {
    triggerHaptic('selection');
    setSelectedCategory(cat);
    const subTags = getSubTagsForCategory(cat, language);
    const defaultTag = language === 'mr' ? subTags[0].mr : subTags[0].en;
    setSelectedSubTag(defaultTag);
  };

  const appendQuickPhrase = (phrase: string) => {
    setNotes(prev => prev ? `${prev}. ${phrase}` : phrase);
  };

  // Grab live GPS from device
  const grabLiveGPS = (forceOverwrite = false) => {
    if (!navigator.geolocation) {
      if (!isManualArea || forceOverwrite) {
        resolveAddressForCoords(PCMC_CENTER.latitude, PCMC_CENTER.longitude);
      }
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setAccuracy(Math.round(pos.coords.accuracy));
        setIsLocating(false);
        if (!isManualArea || forceOverwrite) {
          resolveAddressForCoords(lat, lng);
        }
      },
      (err) => {
        console.warn('Geolocation warning, defaulting to PCMC center:', err.message);
        setIsLocating(false);
        if (!isManualArea || forceOverwrite) {
          resolveAddressForCoords(latitude, longitude);
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  };

  // Check for nearby hotspots within 20m whenever lat/lng or category changes
  useEffect(() => {
    let isCancelled = false;

    const checkProximity = async () => {
      try {
        const { data, error } = await supabase
          .from('hotspots')
          .select('*')
          .eq('category', selectedCategory);

        if (error || !data) return;

        const within20 = (data as Hotspot[])
          .map(h => ({
            hotspot: h,
            distance: Math.round(haversineDistanceMeters(latitude, longitude, h.latitude, h.longitude))
          }))
          .filter(item => item.distance <= 20)
          .sort((a, b) => a.distance - b.distance);

        if (!isCancelled) {
          setNearbyHotspots(within20);
        }
      } catch (e) {
        console.warn('Proximity check warning:', e);
      }
    };

    checkProximity();

    return () => {
      isCancelled = true;
    };
  }, [latitude, longitude, selectedCategory]);

  const triggerCameraSnap = () => {
    triggerHaptic('medium');
    if (!isManualArea) {
      grabLiveGPS();
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic('light');
      setIsScanningImage(true);
      setImageScanError(null);
      setErrorMessage(null);
      setRawPhotoFile(file);

      // Create instant preview for immediate thumbnail feedback
      const initialUrl = URL.createObjectURL(file);
      setPhotoPreviewUrl(initialUrl);
      setPhotoBlob(file);

      // Smooth-scroll to next step (Category selection)
      setTimeout(() => {
        categorySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 250);

      try {
        const mod = await analyzeImageContent(file);
        if (!mod.isAllowed) {
          triggerHaptic('warning');
          setImageScanError({
            reason: mod.reason,
            marathiReason: mod.marathiReason
          });
          setPhotoBlob(null);
          setRawPhotoFile(null);
          setPhotoPreviewUrl(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        // Apply official GPS watermark banner onto image pixels
        try {
          const wardInfo = getWardForArea(areaName, latitude, longitude);
          const watermarked = await stampGPSWatermark(file, {
            area: 'Pimpri Chinchwad, Maharashtra',
            address: areaName.trim() || 'Pimpri Chinchwad, Maharashtra',
            ward: wardInfo?.wardLabel ? `Ward: ${wardInfo.wardLabel}` : undefined,
            latitude,
            longitude,
            timestamp: new Date()
          });
          setPhotoBlob(watermarked.blob);
          setPhotoPreviewUrl(watermarked.dataUrl);
        } catch (watermarkErr) {
          console.warn('GPS watermark generation notice:', watermarkErr);
          setPhotoBlob(file);
        }

        setSubmissionResult(null);
        triggerHaptic('success');
      } catch (err) {
        console.warn('Image moderation scan notice:', err);
        setPhotoBlob(file);
      } finally {
        setIsScanningImage(false);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    triggerHaptic('heavy');
    if (imageScanError) {
      setErrorMessage(language === 'mr' ? imageScanError.marathiReason : imageScanError.reason);
      return;
    }

    if (!photoBlob && !photoPreviewUrl) {
      setErrorMessage(language === 'mr' ? 'कृपया समस्येचा फोटो घ्या.' : 'Please snap a photo of the civic issue before submitting.');
      return;
    }

    if (!contentCheckConfirmed) {
      setErrorMessage(language === 'mr' 
        ? 'कृपया पुष्टी करा की फोटोमध्ये खाजगी जागा, वैयक्तिक वाद किंवा आक्षेपार्ह मजकूर नाही.' 
        : 'Please confirm that your photo complies with public civic guidelines.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let finalBlob = photoBlob;
      const sourceForWatermark = rawPhotoFile || photoBlob;
      if (sourceForWatermark) {
        try {
          const wardInfo = getWardForArea(areaName, latitude, longitude);
          const watermarked = await stampGPSWatermark(sourceForWatermark, {
            area: 'Pimpri Chinchwad, Maharashtra',
            address: areaName.trim() || 'Pimpri Chinchwad, Maharashtra',
            ward: wardInfo?.wardLabel ? `Ward: ${wardInfo.wardLabel}` : undefined,
            latitude,
            longitude,
            timestamp: new Date()
          });
          finalBlob = watermarked.blob;
        } catch (wmErr) {
          console.warn('Watermark stamp during submission notice:', wmErr);
        }
      } else if (!finalBlob && photoPreviewUrl) {
        const res = await fetch(photoPreviewUrl);
        finalBlob = await res.blob();
      }

      const citizenParts = [
        citizenName.trim() ? `Reported by: ${citizenName.trim()}` : '',
        citizenPhone.trim() ? `Contact: ${citizenPhone.trim()}` : ''
      ].filter(Boolean).join(' | ');
      const combinedNotes = [notes.trim(), citizenParts].filter(Boolean).join(' • ');

      const result = await submitCivicReport({
        category: selectedCategory,
        subTag: selectedSubTag,
        latitude,
        longitude,
        areaName: areaName.trim() || 'Pimpri Chinchwad',
        slaHours: CATEGORIES[selectedCategory].slaHours,
        photoBlob: finalBlob!,
        notes: combinedNotes || undefined,
        citizenEmail: citizenEmail.trim() || undefined,
        citizenPhone: citizenPhone.trim() || undefined
      });

      setSubmissionResult(result);
      triggerHaptic('success');

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Submission error:', err);
      setErrorMessage(msg || 'Failed to submit report. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRawPhotoFile(null);
    setPhotoBlob(null);
    setPhotoPreviewUrl(null);
    setImageScanError(null);
    setIsScanningImage(false);
    setNotes('');
    setSubmissionResult(null);
    setErrorMessage(null);
    setIsManualArea(false);
    grabLiveGPS(true);
  };

  const openNearbyMatch = nearbyHotspots.find(
    i => i.hotspot.status === 'OPEN' || i.hotspot.status === 'CHRONIC_REOPENED'
  );
  const resolvedNearbyMatch = nearbyHotspots.find(i => {
    if (i.hotspot.status !== 'RESOLVED' || !i.hotspot.resolved_at) return false;
    const diff = Date.now() - new Date(i.hotspot.resolved_at).getTime();
    return diff <= 14 * 24 * 60 * 60 * 1000;
  });

  const filteredPresets = PCMC_PRESETS.filter(p => 
    p.name.toLowerCase().includes(wardSearchQuery.toLowerCase()) ||
    p.ward.toLowerCase().includes(wardSearchQuery.toLowerCase()) ||
    p.zone.toLowerCase().includes(wardSearchQuery.toLowerCase())
  );

  const activeWard = getWardForArea(areaName, latitude, longitude);
  const activeOfficialWard = getOfficialWardByNumber(parseInt(activeWard.wardNo, 10));
  const activeOfficialZone = activeOfficialWard
    ? getOfficialZoneByKey(activeOfficialWard.zoneKey)
    : getOfficialZoneByKey(activeWard.zone.replace(/^ZONE\s*/i, ''));

  return (
    <div className="flex flex-col min-h-full pb-28 md:pb-16 pt-2 px-4 max-w-lg md:max-w-2xl mx-auto w-full space-y-3.5">
      {/* Hidden File Input for Native Camera Snap */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ======================================================== */}
      {/* 1. LOCALITY & LIVE GPS BAR (Strict 2-Line Clean Layout) */}
      {/* ======================================================== */}
      <div className="space-y-1.5 px-1">
        {/* LINE 1: Location Name + Auto-locate GPS + Switch Ward (Strictly Single Row) */}
        <div className="flex items-center justify-between gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            {isEditingArea ? (
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <input
                  type="text"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder={language === 'mr' ? 'रस्ता किंवा खूण टाईप करा...' : 'Type street / landmark...'}
                  className="flex-1 bg-slate-900 border border-cyan-500 rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingArea(false);
                    setIsManualArea(true);
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-[11px] shrink-0"
                >
                  {language === 'mr' ? 'जतन करा' : 'Save'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-semibold text-slate-100 text-xs sm:text-sm truncate">
                  {isGeocoding ? (language === 'mr' ? 'अचूक पत्ता शोधत आहे...' : 'Detecting street...') : areaName}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingArea(true)}
                  className="p-1 rounded text-slate-400 hover:text-cyan-400 shrink-0"
                  title={language === 'mr' ? 'पत्ता संपादित करा' : 'Edit street / landmark'}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* GPS Auto-locate and Switch Ward strictly on line 1 */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsManualArea(false);
                grabLiveGPS(true);
              }}
              disabled={isLocating}
              className="min-h-[44px] flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold text-cyan-400 shadow-sm active:scale-95 transition-all shrink-0 whitespace-nowrap"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? '...' : accuracy ? `±${accuracy}m GPS` : t.locateMe}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowLocationPicker(!showLocationPicker);
              }}
              className="min-h-[44px] flex items-center text-[11px] text-slate-400 hover:text-cyan-400 underline font-semibold px-2 shrink-0 whitespace-nowrap active:scale-95 transition-all"
            >
              {showLocationPicker ? t.closeWards : t.switchWard}
            </button>
          </div>
        </div>

        {/* LINE 2: Corporators & Zone Office Info (Always on line 2) */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => setShowCorporatorsModal(true)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 shadow-xs active:scale-95 transition-all shrink-0"
            title={language === 'mr' ? 'स्थानिक नगरसेवक पहा' : 'View Elected Corporators for this location'}
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>{activeWard.badge} {language === 'mr' ? 'नगरसेवक' : 'Corporators'}</span>
          </button>

          {activeOfficialZone && (
            <button
              type="button"
              onClick={() => setShowZoneModal(true)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 shadow-xs active:scale-95 transition-all shrink-0"
              title={language === 'mr' ? 'क्षेत्रीय कार्यालय माहिती पहा' : 'View Zonal Field Office details'}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {language === 'mr'
                  ? `${activeOfficialZone.marathiName.replace(' कार्यालय', '')} (${activeOfficialZone.fortMarathi})`
                  : `${activeOfficialZone.zoneName} • ${activeOfficialZone.fortName.split(' ')[0]}`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* SEARCHABLE WARD PICKER DROPDOWN */}
      {showLocationPicker && (
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2 animate-in fade-in duration-150">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={wardSearchQuery}
              onChange={(e) => setWardSearchQuery(e.target.value)}
              placeholder={language === 'mr' ? 'वाकड, निगडी, पिंपळे सौदागर, रावेत शोधा...' : 'Search Wakad, Nigdi, Pimple Saudagar, Ravet...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1 no-scrollbar">
            {filteredPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setLatitude(preset.latitude);
                  setLongitude(preset.longitude);
                  setAreaName(language === 'mr' ? `${preset.nameMr || preset.name}, पिंपरी-चिंचवड` : `${preset.name}, Pimpri-Chinchwad`);
                  setIsOutsidePCMC(false);
                  setShowLocationPicker(false);
                  setIsManualArea(true);
                }}
                className="text-left p-2 rounded-lg text-[11px] border bg-slate-950 border-slate-800 hover:border-cyan-500/60 text-slate-300 hover:text-white transition-colors"
              >
                <div className="font-bold truncate text-white">
                  {language === 'mr' ? (preset.nameMr || preset.name) : preset.name}
                </div>
                <div className="text-[9px] text-cyan-400 flex items-center justify-between mt-0.5">
                  <span>{language === 'mr' ? preset.ward.replace('Ward', 'प्रभाग') : preset.ward}</span>
                  <span>{formatZoneDisplay(preset.zone, language)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CAMERA ACTION: COMPACT SNAP CIVIC ISSUE BUTTON         */}
      {/* ======================================================== */}
      {isScanningImage && (
        <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-200 flex items-center justify-center gap-2 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span className="font-semibold">{language === 'mr' ? 'फोटो सुरक्षा व नागरी निकष तपासत आहे...' : 'Scanning photo safety & civic context...'}</span>
        </div>
      )}

      {imageScanError && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/60 text-xs text-rose-200 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-rose-300 block text-xs">
                {language === 'mr' ? '🚫 फोटो सुरक्षा नियमांचे उल्लंघन - फोटो नाकारला' : '🚫 Photo Blocked: Prohibited Content Detected'}
              </span>
              <span className="text-[11px] text-rose-200 leading-relaxed block">
                {language === 'mr' ? imageScanError.marathiReason : imageScanError.reason}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-rose-300/80 pt-1 border-t border-rose-800/60">
            {language === 'mr'
              ? 'केवळ रस्त्यावरील सार्वजनिक नागरी समस्यांचे (खड्डे, कचरा, गटारे, दिवे) फोटो स्वीकारले जातात. खाजगी घरे, वैयक्तिक वाद किंवा अश्लील फोटो पूर्णपणे प्रतिबंधित आहेत.'
              : 'Only legitimate outdoor municipal issues (potholes, garbage, drainage, lighting) are allowed. Private homes, personal disputes, and vulgar content are strictly blocked.'}
          </p>
        </div>
      )}

      {!photoPreviewUrl ? (
        <button
          type="button"
          onClick={triggerCameraSnap}
          className="w-full group relative overflow-hidden rounded-2xl p-3 sm:p-3.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-md shadow-cyan-950/40 border border-cyan-400/30 flex items-center justify-between gap-3 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner ring-2 ring-white/20 group-hover:scale-105 transition-transform shrink-0">
              <Camera className="w-5 h-5 text-white" />
            </div>

            <div className="text-left min-w-0">
              <span className="text-sm sm:text-base font-extrabold tracking-tight block leading-tight truncate">
                {t.snapButton}
              </span>
              <span className="text-[11px] text-cyan-100 font-medium block leading-tight truncate mt-0.5">
                {t.snapSubtext}
              </span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white/20 group-hover:bg-white/30 text-white font-black text-xs uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5 shrink-0 shadow-xs">
            <span>Camera</span>
            <span>📷</span>
          </div>
        </button>
      ) : (
        /* PHOTO PREVIEW & RETAKE */
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 aspect-video shadow-lg group">
          <img
            src={photoPreviewUrl}
            alt="Snapped civic issue"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => {
              triggerHaptic('light');
              setIsPhotoLightboxOpen(true);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30 pointer-events-none" />

          {/* Tap to expand hint */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsPhotoLightboxOpen(true);
            }}
            className="absolute top-3 left-3 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs font-medium flex items-center gap-1 shadow-md active:scale-95"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tap to View</span>
          </button>

          <button
            type="button"
            onClick={triggerCameraSnap}
            className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            Retake
          </button>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 truncate max-w-[70%]">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate font-medium">{areaName}</span>
            </div>
            <span className="text-[10px] font-mono bg-black/60 px-1.5 py-0.5 rounded text-cyan-300">
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </span>
          </div>
        </div>
      )}

      {/* OUTSIDE PCMC JURISDICTION NOTICE */}
      {isOutsidePCMC && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-2.5 text-xs text-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 block">
              Location outside PCMC municipal boundary
            </span>
            <span className="text-[11px] text-amber-200/90">
              You can edit the landmark text or select your target PCMC Prabhag/Ward above.
            </span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. REPORT FORM (CATEGORY, SUB-TAG, PROXIMITY, NOTE, SUBMIT) */}
      {/* ======================================================== */}
      {submissionResult ? (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {submissionResult.actionTaken === 'CORROBORATED' && (language === 'mr' ? 'समस्येला पुष्टी देण्यात आली! (+१)' : 'Issue Corroborated! (+1)')}
              {submissionResult.actionTaken === 'CHRONIC_REOPENED' && (language === 'mr' ? 'वारंवार होणारी समस्या पुन्हा उघडली!' : 'Chronic Issue Reopened!')}
              {submissionResult.actionTaken === 'NEW_HOTSPOT' && (language === 'mr' ? 'नवीन नागरी तक्रार नोंदवली!' : 'New Civic Hotspot Logged!')}
            </h2>
            <p className="text-xs text-slate-300">
              {submissionResult.actionTaken === 'CORROBORATED' && (
                <>Existing hotspot matched within {submissionResult.distanceToExisting}m. Priority escalated with <strong>{submissionResult.hotspot.corroboration_count} citizen verifications</strong>.</>
              )}
              {submissionResult.actionTaken === 'CHRONIC_REOPENED' && (
                <>Resolved issue recurred within 14 days (at {submissionResult.distanceToExisting}m). Flagged as <strong>CHRONIC_REOPENED</strong> for municipal audit.</>
              )}
              {submissionResult.actionTaken === 'NEW_HOTSPOT' && (
                <>Assigned SLA of <strong>{submissionResult.hotspot.sla_hours} hours</strong> for municipal resolution at {submissionResult.hotspot.area_name}.</>
              )}
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span>Category:</span>
              <span className="font-semibold text-white">{submissionResult.hotspot.category} • {submissionResult.hotspot.sub_tag}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Location:</span>
              <span className="font-semibold text-slate-200 truncate max-w-[200px]">{submissionResult.hotspot.area_name}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Status:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                submissionResult.hotspot.status === 'OPEN' ? 'bg-amber-500/20 text-amber-300' :
                submissionResult.hotspot.status === 'CHRONIC_REOPENED' ? 'bg-rose-500/20 text-rose-300' :
                'bg-emerald-500/20 text-emerald-300'
              }`}>
                {submissionResult.hotspot.status}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Citizen Confirmations:</span>
              <span className="text-cyan-400 font-semibold">{submissionResult.hotspot.corroboration_count} Citizens</span>
            </div>
          </div>

          {/* PROMINENT OFFICIAL ESCALATION CALLOUT: SEND EMAIL TO PCMC */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/70 via-orange-950/50 to-slate-900 border-2 border-amber-500/70 shadow-xl shadow-amber-950/40 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0 mt-0.5 text-amber-400">
                <Send className="w-4 h-4 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                    {language === 'mr' ? 'महत्त्वाचे पुढील पाऊल' : 'Action Required'}
                  </span>
                  <span className="text-xs font-bold text-amber-200">
                    {language === 'mr' ? 'अधिकृत ईमेल पाठवणे आवश्यक' : 'Official Escalation'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-100/90 leading-snug">
                  {language === 'mr'
                    ? 'आपला फोटो नोंदवला गेला आहे! PCMC अधिकाऱ्यांकडून थेट कारवाई सुरू करण्यासाठी खालील बटण दाबून अधिकृत ईमेल पाठवा.'
                    : 'Photo logged! To initiate official municipal action, click below to dispatch this verified dossier directly to PCMC grievance officers.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                setEscalateHotspot(submissionResult.hotspot);
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all ring-2 ring-amber-400/80 animate-pulse hover:animate-none"
            >
              <Send className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>{language === 'mr' ? 'PCMC ला त्वरित ईमेल पाठवा (अधिकृत तक्रार)' : 'Send Email to PCMC Now (Official Complaint)'}</span>
            </button>
          </div>

          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onNavigateToMap(submissionResult.hotspot.id)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'mr' ? 'नकाशावर पहा' : 'View on Map'}</span>
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'mr' ? 'नवीन तक्रार नोंदवा' : 'Snap Another Issue'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* CATEGORY ICON CARDS (3x3 Grid) */}
          <div ref={categorySectionRef} className="space-y-2 scroll-mt-20">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              {t.categoryLabel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CATEGORIES) as Category[]).map((catKey) => {
                const cat = CATEGORIES[catKey];
                const isSelected = selectedCategory === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => handleCategorySelect(catKey)}
                    className={`relative p-2 rounded-2xl border text-left transition-all flex flex-col justify-between active:scale-[0.98] ${
                      isSelected
                        ? 'bg-[#111827] border-emerald-500 ring-2 ring-emerald-500/25 shadow-lg shadow-emerald-950/40'
                        : 'bg-[#111827]/70 border-white/[0.07] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-xl ${cat.bgColor} ${cat.color}`}>
                        {catKey === 'Garbage' && <Trash2 className="w-4 h-4" />}
                        {catKey === 'Drainage' && <Droplets className="w-4 h-4" />}
                        {catKey === 'Pothole' && <AlertTriangle className="w-4 h-4" />}
                        {catKey === 'Streetlight' && <Lightbulb className="w-4 h-4" />}
                        {catKey === 'Encroachment' && <ShieldAlert className="w-4 h-4" />}
                        {catKey === 'Footpath' && <Footprints className="w-4 h-4" />}
                        {catKey === 'Garden' && <Trees className="w-4 h-4" />}
                        {catKey === 'Animals' && <PawPrint className="w-4 h-4" />}
                        {catKey === 'Pollution' && <Wind className="w-4 h-4" />}
                        {catKey === 'Other' && <Smartphone className="w-4 h-4" />}
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                        isSelected ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60' : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}>
                        {cat.slaHours}h
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="font-bold text-[11px] sm:text-xs text-white flex items-center justify-between">
                        <span className="truncate">{t.categories[catKey] || cat.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-emerald-400 shrink-0 ml-0.5" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUICK SUB-TAG SPECIFICATION PILLS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                {t.subTagLabel} ({t.categories[selectedCategory] || selectedCategory})
              </label>
              <span className="text-[10px] text-slate-500 font-medium">Select exact issue</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {getSubTagsForCategory(selectedCategory, language).map((item) => {
                const isSelected = selectedSubTag === item.en || selectedSubTag === item.mr;
                const displayText = language === 'mr' ? item.mr : item.en;
                return (
                  <button
                    key={item.en}
                    type="button"
                    onClick={() => setSelectedSubTag(displayText)}
                    className={`py-1.5 px-2.5 rounded-xl text-left text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {displayText}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PROXIMITY DETECTION ALERT (20-meter Haversine Logic) */}
          {openNearbyMatch && (
            <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2.5 animate-in fade-in duration-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block">
                  ⚡ Existing {selectedCategory} issue detected ({openNearbyMatch.distance}m away)
                </span>
                <span className="text-[11px] text-amber-200/90">
                  Submitting will <strong>Corroborate (+1)</strong> this open hotspot ({openNearbyMatch.hotspot.corroboration_count} citizens already confirmed).
                </span>
              </div>
            </div>
          )}

          {resolvedNearbyMatch && !openNearbyMatch && (
            <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-3 text-xs text-rose-200 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300 block">
                  ⚠️ Recently resolved {selectedCategory} detected ({resolvedNearbyMatch.distance}m away)
                </span>
                <span className="text-[11px] text-rose-200/90">
                  Closed within 14 days. Submitting will flag it as <strong>CHRONIC_REOPENED</strong> for municipal scrutiny.
                </span>
              </div>
            </div>
          )}

          {/* OPTIONAL 1-LINE NOTE + QUICK PHRASES */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              {t.landmarkNoteLabel}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.landmarkPlaceholder}
              maxLength={140}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />

            {/* Quick Phrase Chips */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-medium">{t.quickPhrases}</span>
              <div className="flex flex-wrap gap-1.5">
                {getDynamicQuickPhrases(selectedCategory, selectedSubTag, language).map((phrase) => (
                  <button
                    key={phrase}
                    type="button"
                    onClick={() => appendQuickPhrase(phrase)}
                    className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-[10px] text-slate-300 hover:text-emerald-300 flex items-center gap-1 transition-colors active:scale-95"
                  >
                    <Plus className="w-2.5 h-2.5 text-emerald-400" />
                    <span>{phrase}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* OPTIONAL CITIZEN CONTACT INFO */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                {language === 'mr' ? 'नागरिक माहिती (पर्यायी)' : 'Citizen Contact Info (Optional)'}
              </label>
              <span className="text-[10px] text-slate-500 font-medium">
                {language === 'mr' ? 'अधिकृत पाठपुराव्यासाठी' : 'For official follow-up'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={citizenName}
                onChange={(e) => {
                  setCitizenName(e.target.value);
                  try { localStorage.setItem('pcmc_citizen_name', e.target.value); } catch (_) {}
                }}
                placeholder={language === 'mr' ? 'तुमचे नाव (पर्यायी)' : 'Your Name (Optional)'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <input
                type="tel"
                value={citizenPhone}
                onChange={(e) => {
                  setCitizenPhone(e.target.value);
                  try { localStorage.setItem('pcmc_citizen_contact', e.target.value); } catch (_) {}
                }}
                placeholder={language === 'mr' ? 'मोबाईल नंबर (पर्यायी)' : 'Phone Number (Optional)'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <input
                type="email"
                value={citizenEmail}
                onChange={(e) => setCitizenEmail(e.target.value)}
                placeholder={language === 'mr' ? 'ईमेल पत्ता (अपडेट्ससाठी)' : 'Email Address (Recommended for updates)'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <p className="text-[11px] text-cyan-300/90 leading-snug">
              {language === 'mr'
                ? '💡 तक्रार PCMC कडे नोंदवल्यानंतर थेट पाठपुरावा व निवारण अपडेट्स मिळवण्यासाठी ईमेल अवश्य प्रविष्ट करा.'
                : '💡 Enter your email to receive direct escalation & resolution updates as this issue is submitted to PCMC.'}
            </p>
          </div>

          {/* ANTI-ABUSE & COMMUNITY SAFETY DECLARATION */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={contentCheckConfirmed}
                onChange={(e) => setContentCheckConfirmed(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-cyan-500 rounded border-slate-700 shrink-0"
              />
              <div className="text-[11px] leading-relaxed text-slate-300">
                <span className="font-bold text-white block">
                  {language === 'mr' ? 'सार्वजनिक नागरी समस्या घोषणा' : 'Public Civic Issue Confirmation'}
                </span>
                {language === 'mr'
                  ? 'मी पुष्टी करतो/करते की हा फोटो केवळ सार्वजनिक नागरी समस्येचा आहे. यात खाजगी मालमत्ता, वादग्रस्त वाहन नंबर किंवा अश्लील मजकूर नाही.'
                  : 'I confirm this photo is strictly for a public civic issue and does not show private property interiors, vehicle license plates in personal disputes, or abusive/vulgar content.'}
              </div>
            </label>
            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span className="flex items-center gap-1 text-slate-400">
                <ShieldAlert className="w-3 h-3 text-cyan-400 shrink-0" />
                {language === 'mr' ? 'उल्लंघन आढळल्यास फोटो तत्काळ हटवला जातो' : 'Prohibited uploads are reviewed & deleted'}
              </span>
              <button
                type="button"
                onClick={() => setShowFlagInfoModal(true)}
                className="text-rose-400 hover:text-rose-300 underline font-semibold flex items-center gap-1"
              >
                <Flag className="w-3 h-3" />
                <span>{language === 'mr' ? 'आक्षेप नोंदवा / नियम' : 'Report / Rules'}</span>
              </button>
            </div>
          </div>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-slate-700 cursor-not-allowed opacity-75'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-600/30 active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Processing & Geotagging...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {openNearbyMatch ? t.corroborateSubmit : 
                   resolvedNearbyMatch ? t.reopenSubmit : 
                   t.submitReport}
                </span>
              </>
            )}
          </button>
        </form>
      )}

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

      {/* Content Flagging / Moderation Guidelines Modal */}
      {showFlagInfoModal && (
        <FlagModal
          language={language}
          onClose={() => setShowFlagInfoModal(false)}
        />
      )}

      {/* Local Corporators Modal */}
      {showCorporatorsModal && (
        <div 
          className="fixed inset-0 z-[1200] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setShowCorporatorsModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-3.5 max-h-[85vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {language === 'mr' ? 'स्थानिक लोकप्रतिनिधी (नगरसेवक)' : 'Elected Ward Corporators'}
                  </h3>
                  <p className="text-[11px] text-cyan-400 font-medium">
                    {language === 'mr' ? (activeOfficialWard?.marathiLocality || activeWard.marathiWardLabel) : (activeOfficialWard?.locality || activeWard.wardLabel)} • {language === 'mr' ? (activeOfficialZone?.marathiName || activeWard.marathiZone) : (activeOfficialZone?.zoneName || activeWard.zone)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCorporatorsModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <CorporatorSection
              wardNo={activeWard.wardNo}
              wardLocality={language === 'mr' ? (activeOfficialWard?.marathiLocality || activeWard.marathiWardLabel) : (activeOfficialWard?.locality || activeWard.locality)}
              zone={language === 'mr' ? (activeOfficialZone?.marathiName || activeWard.marathiZone) : (activeOfficialZone?.zoneName || activeWard.zone)}
              language={language}
              collapsible={false}
              showWardSwitcher={true}
              title={language === 'mr' ? `प्रभाग ${activeWard.wardNo} चे अधिकृत नगरसेवक` : `Ward ${activeWard.wardNo} Corporators`}
            />
          </div>
        </div>
      )}

      {/* Zonal Field Office Details Modal */}
      {showZoneModal && activeOfficialZone && (
        <div 
          className="fixed inset-0 z-[1200] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setShowZoneModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-3.5 max-h-[85vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {language === 'mr'
                      ? `${activeOfficialZone.marathiName} (${activeOfficialZone.fortMarathi})`
                      : `PCMC ${activeOfficialZone.zoneName} (${activeOfficialZone.fortName.split(' ')[0]}) Field Office`}
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-semibold">
                    {language === 'mr'
                      ? `समाविष्ट प्रभाग: ${activeOfficialZone.wardNumbers.map(w => 'प्रभाग ' + w).join(', ')}`
                      : `Administers Wards: ${activeOfficialZone.wardNumbers.map(w => 'W-' + String(w).padStart(2, '0')).join(', ')}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowZoneModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Officer & Jurisdiction Info */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
              <div className="text-[11px]">
                <span className="font-bold text-slate-300 block mb-0.5">
                  {language === 'mr' ? 'क्षेत्राधिकार (समाविष्ट भाग):' : 'Key Localities Covered:'}
                </span>
                <span className="text-slate-200 leading-relaxed block">
                  {language === 'mr' ? activeOfficialZone.coverageMarathi : activeOfficialZone.coverageAreas}
                </span>
              </div>

              <div className="text-[11px] pt-2 border-t border-slate-900">
                <span className="font-bold text-slate-300 block mb-0.5">
                  {language === 'mr' ? 'प्रशासकीय प्रमुख:' : 'Administrative Head:'}
                </span>
                <span className="text-emerald-400 font-semibold block">
                  {language === 'mr'
                    ? `सहाय्यक आयुक्त, ${activeOfficialZone.marathiName}`
                    : `Assistant Municipal Commissioner, ${activeOfficialZone.zoneName}`}
                </span>
              </div>

              <div className="text-[11px] pt-2 border-t border-slate-900">
                <span className="font-bold text-slate-300 block mb-0.5">
                  {language === 'mr' ? 'कार्यालय पत्ता:' : 'Office Address:'}
                </span>
                <span className="text-slate-300 block">
                  {activeOfficialZone.address}
                </span>
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {language === 'mr' ? 'थेट संपर्क व हेल्पलाईन' : 'Direct Contacts & Helplines'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Landline */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="min-w-0 pr-1">
                    <span className="text-[10px] text-slate-400 block font-medium truncate">
                      {language === 'mr' ? 'कार्यालय संपर्क' : 'Zone Landline'}
                    </span>
                    <span className="text-xs font-bold text-white font-mono truncate block">
                      {activeOfficialZone.phoneFormatted}
                    </span>
                  </div>
                  <a
                    href={`tel:${activeOfficialZone.phone}`}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 font-bold text-[11px] inline-flex items-center gap-1 transition-all active:scale-95 shrink-0"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{language === 'mr' ? 'कॉल' : 'Call'}</span>
                  </a>
                </div>

                {/* PCMC Sarathi 24x7 */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {language === 'mr' ? 'सारथी २४x७' : 'PCMC Sarathi 24×7'}
                    </span>
                    <span className="text-xs font-bold text-white font-mono">
                      8888006666
                    </span>
                  </div>
                  <a
                    href="tel:8888006666"
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 font-bold text-[11px] inline-flex items-center gap-1 transition-all active:scale-95 shrink-0"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{language === 'mr' ? 'कॉल' : 'Call'}</span>
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="min-w-0 pr-1">
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {language === 'mr' ? 'अधिकृत ईमेल' : 'Official Zone Email'}
                  </span>
                  <span className="text-xs font-bold text-white font-mono truncate block">
                    {activeOfficialZone.email}
                  </span>
                </div>
                <a
                  href={`mailto:${activeOfficialZone.email}`}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[11px] inline-flex items-center gap-1 transition-all active:scale-95 shrink-0"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{language === 'mr' ? 'ईमेल' : 'Email'}</span>
                </a>
              </div>
            </div>

            {/* Official Source Link */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 px-0.5 pt-1 border-t border-slate-800">
              <span>{language === 'mr' ? 'अधिकृत स्रोत: pcmcindia.gov.in/ward_info' : 'Official: pcmcindia.gov.in/ward_info'}</span>
              <a
                href="https://www.pcmcindia.gov.in/ward_info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-0.5"
              >
                <span>{language === 'mr' ? 'पोर्टल पहा' : 'View Portal'}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}
      {/* Escalation Modal directly accessible from submission success */}
      {escalateHotspot && (
        <EscalateModal
          hotspot={escalateHotspot}
          reports={
            submissionResult?.report
              ? [submissionResult.report]
              : (photoPreviewUrl || photoBlob)
                ? [{
                    id: 'submitted-evidence',
                    hotspot_id: escalateHotspot.id,
                    report_type: 'INITIAL',
                    photo_url: photoPreviewUrl || (photoBlob ? URL.createObjectURL(photoBlob) : ''),
                    notes: notes || '',
                    created_at: new Date().toISOString()
                  }]
                : (escalateHotspot.reports || [])
          }
          language={language}
          onClose={() => setEscalateHotspot(null)}
        />
      )}
      {/* Full-Screen Image Lightbox */}
      {isPhotoLightboxOpen && photoPreviewUrl && (
        <ImageLightbox
          imageUrl={photoPreviewUrl}
          caption={selectedCategory}
          subCaption={areaName}
          onClose={() => setIsPhotoLightboxOpen(false)}
        />
      )}
    </div>
  );
};
