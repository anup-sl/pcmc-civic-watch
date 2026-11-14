import { useState, useMemo } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Mail, 
  Download, 
  MapPin,
  Phone,
  ChevronDown
} from 'lucide-react';
import type { Hotspot, Report } from '../types';
import { getSLAStatus } from '../utils/geo';
import { buildEscalationRouting } from '../config/escalationConfig';
import { downloadFile, createWatermarkedImage } from '../utils/watermark';
import type { Language } from '../utils/i18n';

interface EscalateModalProps {
  hotspot: Hotspot;
  reports?: Report[];
  language: Language;
  onClose: () => void;
}

export const EscalateModal = ({ hotspot, reports = [], language, onClose }: EscalateModalProps) => {
  const [emailsCopied, setEmailsCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [photoSaved, setPhotoSaved] = useState<boolean>(false);
  const [forceCommissionerTier, setForceCommissionerTier] = useState<boolean>(false);
  const [showRecipients, setShowRecipients] = useState<boolean>(false);

  const sla = useMemo(() => {
    return getSLAStatus(hotspot.created_at, hotspot.sla_hours, hotspot.status, hotspot.resolved_at, language);
  }, [hotspot, language]);

  const routing = useMemo(() => {
    return buildEscalationRouting({
      category: hotspot.category,
      areaName: hotspot.area_name,
      isOverdue: sla.isOverdue,
      forceCommissionerTier
    });
  }, [hotspot, sla.isOverdue, forceCommissionerTier]);

  const combinedReports = (reports && reports.length > 0) ? reports : (hotspot.reports || []);
  const photoUrls = combinedReports
    .map(r => r.photo_url)
    .filter((url): url is string => Boolean(url && url.trim().length > 0));
  const distinctPhotos = Array.from(new Set(photoUrls));
  const photoUrl = distinctPhotos.length > 0 ? distinctPhotos[distinctPhotos.length - 1] : '';

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${hotspot.latitude},${hotspot.longitude}`;
  
  const subject = (routing.isHighTier || forceCommissionerTier)
    ? `[URGENT ESCALATION] PCMC Civic Grievance: ${hotspot.category} (${hotspot.sub_tag}) at ${hotspot.area_name}`
    : `Urgent Civic Grievance: ${hotspot.category} (${hotspot.sub_tag}) at ${hotspot.area_name}`;

  // Concise formal letter (<1,500 characters for iOS mailto URL limit safety)
  const formalLetter = `To,
PCMC Municipal Administration & Zonal Officer (${routing.zone.zone}),
${routing.catConfig.primary_official.name} (${routing.catConfig.primary_official.role}),
${routing.catConfig.department},
Pimpri Chinchwad Municipal Corporation (PCMC)

Subject: ${subject}

Respected Sir / Madam,

This is a formal citizen grievance regarding an active municipal issue requiring inspection and resolution:

• Ticket ID: #${hotspot.id.substring(0, 8)}
• Category: ${hotspot.category} • ${hotspot.sub_tag}
• Department: ${routing.catConfig.department}
• Locality: ${hotspot.area_name}
• GPS Coordinates: ${hotspot.latitude.toFixed(5)}° N, ${hotspot.longitude.toFixed(5)}° E
• Google Maps Location: ${googleMapsUrl}
• Status: ${hotspot.status} (${sla.durationOpenStr} / ${hotspot.sla_hours}h limit)
• Citizen Confirmations: Confirmed on-site by ${hotspot.corroboration_count} residents

${distinctPhotos.length > 0 ? `• Photo Evidence Link: ${distinctPhotos[0]}\n` : ''}${(routing.isHighTier || forceCommissionerTier) ? 'URGENT ESCALATION: This issue has remained unresolved beyond municipal SLA guidelines and is escalated to the Municipal Commissioner for intervention.\n\n' : ''}Note: A geotagged photographic evidence image is attached with this email.

Please arrange field inspection and resolve at the earliest.

Sincerely,
Concerned Residents & Taxpayers of ${hotspot.area_name}`;

  // Comma-separated with NO spaces around commas for iOS/Android RFC compliance
  const toRecipients = routing.toEmails.join(',');
  const ccRecipients = routing.ccEmails.join(',');

  // Cross-platform iOS & Android mailto trigger
  const openDefaultEmailApp = () => {
    const mailtoUri = `mailto:${toRecipients}?cc=${ccRecipients}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formalLetter)}`;
    window.location.href = mailtoUri;
  };

  // Gmail Web Compose Link
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toRecipients)}&cc=${encodeURIComponent(ccRecipients)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(formalLetter)}`;

  const handleCopyEmails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`TO: ${routing.toEmails.join(', ')}\nCC: ${routing.ccEmails.join(', ')}`);
    setEmailsCopied(true);
    setTimeout(() => setEmailsCopied(false), 2500);
  };

  const handleDownloadWatermark = async () => {
    setDownloading(true);
    try {
      const targetPhoto = photoUrl || (distinctPhotos.length > 0 ? distinctPhotos[0] : '');
      const stamped = await createWatermarkedImage(targetPhoto, {
        id: hotspot.id,
        category: hotspot.category,
        subTag: hotspot.sub_tag,
        areaName: hotspot.area_name,
        latitude: hotspot.latitude,
        longitude: hotspot.longitude,
        createdAt: hotspot.created_at
      });
      await downloadFile(stamped, `PCMC_Evidence_${hotspot.id.substring(0, 8)}.jpg`);
      setPhotoSaved(true);
    } catch (err) {
      console.error('Watermark error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#090D16] border border-white/[0.1] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto p-4 sm:p-5 space-y-3.5 shadow-2xl no-scrollbar">
        {/* 1. Modal Header: Title + Monospace Ticket Badge + Close Button */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
              {language === 'mr' ? 'अधिकृत महानगरपालिका तक्रार निवारण' : 'Official Municipal Escalation'}
            </h3>
            <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1] text-emerald-400 font-mono text-[11px] font-bold shrink-0">
              #{hotspot.id.substring(0, 8)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Single Issue Summary Card */}
        <div className="bg-[#111827] p-3.5 rounded-2xl border border-white/[0.07] space-y-2 shadow-sm">
          <div>
            <div className="font-extrabold text-sm text-white truncate">
              {hotspot.category} • {hotspot.sub_tag}
            </div>
            <p className="text-slate-400 flex items-center gap-1.5 text-xs mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{hotspot.area_name}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 font-bold">
              {routing.zone.zone}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/80 font-medium truncate max-w-[200px]">
              {routing.catConfig.department}
            </span>
            <span className={`px-2 py-0.5 rounded-md border font-bold ${
              sla.isOverdue 
                ? 'bg-rose-950/70 text-rose-300 border-rose-800/70' 
                : 'bg-amber-950/70 text-amber-300 border-amber-800/70'
            }`}>
              {sla.isOverdue 
                ? (language === 'mr' ? `मुदत संपली (${sla.durationOpenStr})` : `SLA Breached (${sla.durationOpenStr})`)
                : (language === 'mr' ? `SLA: ${sla.durationOpenStr} / ${hotspot.sla_hours} तास मर्यादा` : `SLA: ${sla.durationOpenStr} / ${hotspot.sla_hours}h limit`)}
            </span>
          </div>
        </div>

        {/* 3. Segmented Escalation Tier Toggle */}
        <div className="p-1 bg-[#111827] border border-white/[0.08] rounded-xl grid grid-cols-2 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setForceCommissionerTier(false)}
            className={`py-2 px-2.5 rounded-lg font-bold text-center transition-all ${
              !forceCommissionerTier
                ? 'bg-[#10B981] text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'mr' ? 'स्तर १: विभाग व क्षेत्रीय प्रमुख' : 'Tier 1: Dept & Zone Head'}
          </button>
          <button
            type="button"
            onClick={() => setForceCommissionerTier(true)}
            className={`py-2 px-2.5 rounded-lg font-bold text-center transition-all ${
              forceCommissionerTier
                ? 'bg-[#10B981] text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'mr' ? '+ आयुक्तांकडे पाठवा' : '+ Escalate to Commissioner'}
          </button>
        </div>

        {/* 4. Compact Designated Authority Card + Collapsible Recipients */}
        <div className="bg-[#111827] p-3.5 rounded-2xl border border-white/[0.07] space-y-2.5 text-xs shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                {language === 'mr' ? 'नियुक्त जबाबदार अधिकारी' : 'Designated Authority'}
              </span>
              <div className="font-extrabold text-white text-xs sm:text-sm mt-0.5 truncate">
                {routing.catConfig.primary_official.name}
              </div>
              <span className="text-slate-400 text-[11px] block truncate">
                {routing.catConfig.primary_official.role}
              </span>
            </div>

            <a
              href={`tel:${routing.catConfig.primary_official.phone.replace(/[^0-9]/g, '')}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 px-3 py-1.5 rounded-xl border border-emerald-500/30 active:scale-95 transition-all shrink-0"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'कॉल करा' : 'Call'}</span>
            </a>
          </div>

          {/* Collapsible Recipients Accordion Row */}
          <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => setShowRecipients(!showRecipients)}
                className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-medium transition-colors"
              >
                <span>
                  {language === 'mr'
                    ? `ईमेल प्राप्तकर्ते: ${routing.toEmails.length + routing.ccEmails.length} PCMC अधिकारी (To व CC)`
                    : `Recipients: ${routing.toEmails.length + routing.ccEmails.length} PCMC Officials (To & CC)`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showRecipients ? 'rotate-180' : ''}`} />
              </button>

              <button
                type="button"
                onClick={handleCopyEmails}
                className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 text-[10px] font-semibold py-0.5 px-1.5 rounded hover:bg-white/[0.05] transition-colors"
                title="Copy email addresses"
              >
                {emailsCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{emailsCopied ? (language === 'mr' ? 'कॉपी झाले!' : 'Copied!') : (language === 'mr' ? 'ईमेल कॉपी' : 'Copy Emails')}</span>
              </button>
            </div>

            {showRecipients && (
              <div className="pt-1.5 space-y-1 font-mono text-[10px] bg-[#090D16]/60 p-2.5 rounded-xl border border-white/[0.05] animate-in fade-in duration-150">
                <div className="flex items-start gap-1.5">
                  <span className="text-[9px] uppercase font-bold text-emerald-400 w-6 shrink-0 pt-0.5">TO:</span>
                  <span className="text-emerald-300/90 break-all select-all leading-relaxed">{routing.toEmails.join(', ')}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-[9px] uppercase font-bold text-slate-500 w-6 shrink-0 pt-0.5">CC:</span>
                  <span className="text-slate-400 break-all select-all leading-relaxed">{routing.ccEmails.join(', ')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Clean 2-Step Action Dock + WhatsApp & SMS Row */}
        <div className="space-y-2.5 pt-1">
          {/* Row 1 — Step 1: Download Watermarked Photo */}
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadWatermark}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border active:scale-[0.98] transition-all shadow-sm ${
              photoSaved
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-[#111827] hover:bg-slate-800 text-slate-200 border-white/10'
            }`}
          >
            {photoSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'mr' ? '✓ फोटो सेव्ह झाला' : '✓ Photo Saved'}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {downloading
                    ? (language === 'mr' ? 'फोटो तयार करत आहे...' : 'Generating Evidence...')
                    : (language === 'mr' ? '📥 टप्पा १: वॉटरमार्क फोटो डाउनलोड करा' : '📥 Step 1: Download Watermarked Photo')}
                </span>
              </>
            )}
          </button>

          {/* Row 2 — Step 2: Open Default Email App (Glowing Emerald CTA) */}
          <div>
            <button
              type="button"
              onClick={openDefaultEmailApp}
              className="w-full py-3 px-4 rounded-xl bg-[#10B981] hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all"
            >
              <Mail className="w-4 h-4 text-slate-950" />
              <span>{language === 'mr' ? '✉️ टप्पा २: ईमेल ॲप उघडा' : '✉️ Step 2: Open Default Email App'}</span>
            </button>
            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-[11px] text-slate-400 hover:text-emerald-400 underline transition-colors pt-1.5 block"
            >
              {language === 'mr' ? 'किंवा Gmail Web मध्ये उघडा (Auto-Routed)' : 'or Open in Gmail Web (Auto-Routed)'}
            </a>
          </div>

          {/* Helper Micro-Caption */}
          <p className="text-[12px] text-slate-400 text-center leading-relaxed pt-0.5">
            {language === 'mr'
              ? 'टीप: डाऊनलोड केलेला फोटो पुरावा जोडण्यासाठी तुमच्या ईमेल ॲपमधील Attach (📎) वर टॅप करा.'
              : 'Tip: Tap Attach (📎) in your email app to add your downloaded photo proof.'}
          </p>
        </div>
      </div>
    </div>
  );
};
