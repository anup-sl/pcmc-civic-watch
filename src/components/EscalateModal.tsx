import { useState, useMemo } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Mail, 
  Download, 
  MapPin,
  Paperclip,
  Phone,
  ShieldAlert,
  Flame,
  MessageCircle
} from 'lucide-react';
import type { Hotspot, Report } from '../types';
import { PCMC_SARATHI } from '../utils/pcmcDirectory';
import { getSLAStatus } from '../utils/geo';
import { buildEscalationRouting, PCMC_ESCALATION_CONFIG } from '../config/escalationConfig';
import { downloadFile, createWatermarkedImage } from '../utils/watermark';
import type { Language } from '../utils/i18n';
import { TRANSLATIONS } from '../utils/i18n';

interface EscalateModalProps {
  hotspot: Hotspot;
  reports?: Report[];
  language: Language;
  onClose: () => void;
}

export const EscalateModal = ({ hotspot, reports = [], language, onClose }: EscalateModalProps) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [forceCommissionerTier, setForceCommissionerTier] = useState<boolean>(false);
  const t = TRANSLATIONS[language];

  const sla = useMemo(() => {
    return getSLAStatus(hotspot.created_at, hotspot.sla_hours, hotspot.status, hotspot.resolved_at);
  }, [hotspot]);

  const routing = useMemo(() => {
    return buildEscalationRouting({
      category: hotspot.category,
      areaName: hotspot.area_name,
      isOverdue: sla.isOverdue,
      forceCommissionerTier
    });
  }, [hotspot, sla.isOverdue, forceCommissionerTier]);

  const photoUrls = reports
    .map(r => r.photo_url)
    .filter((url): url is string => Boolean(url && url.trim().length > 0));
  const distinctPhotos = Array.from(new Set(photoUrls));
  const photoUrl = distinctPhotos.length > 0 ? distinctPhotos[distinctPhotos.length - 1] : '';

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${hotspot.latitude},${hotspot.longitude}`;
  
  const subject = routing.isHighTier 
    ? `[OVERDUE ESCALATION] Urgent Civic Grievance: ${hotspot.category} (${hotspot.sub_tag}) at ${hotspot.area_name}` 
    : `Urgent Civic Grievance: ${hotspot.category} (${hotspot.sub_tag}) at ${hotspot.area_name}`;

  const formalLetter = `To,
${routing.isHighTier ? `The Municipal Commissioner (Dr. Vijay Suryawanshi, IAS),\nThe Joint Commissioner - Vigilance & Quality Control (Mr. Manoj Lonkar),\n` : ''}The Zonal Officer (${routing.zone.zone} - ${routing.zone.officer}),
The Designated Authority: ${routing.catConfig.primary_official.name} (${routing.catConfig.primary_official.role}),
${routing.catConfig.department},
PCMC Sarathi Grievance Cell,
Pimpri Chinchwad Municipal Corporation (PCMC)

Subject: ${subject}

Respected Sir / Madam,

This is a formal citizen grievance regarding an active public issue requiring urgent municipal attention and field inspection:

• Issue Type: ${hotspot.category} (${hotspot.sub_tag})
• Department: ${routing.catConfig.department}
• Locality: ${hotspot.area_name}
• GPS Coordinates: ${hotspot.latitude.toFixed(5)}° N, ${hotspot.longitude.toFixed(5)}° E
• Google Maps Location: ${googleMapsUrl}
• Status: ${hotspot.status} ${sla.isOverdue ? '(OVERDUE - SLA EXCEEDED)' : '(ACTIVE)'}
• Citizen Verifications: Confirmed on-site by ${hotspot.corroboration_count} local residents
• Standard Municipal SLA: ${hotspot.sla_hours} hours (${sla.durationOpenStr} elapsed)

PHOTO EVIDENCE LINKS (CLICK TO VIEW ORIGINAL FULL-RESOLUTION IMAGES):
${distinctPhotos.length > 0 
  ? distinctPhotos.map((url, i) => `• Photo ${i + 1}: ${url}`).join('\n') 
  : `• Photo Evidence: Geotagged JPG attached with this email`}

${routing.isHighTier ? 'URGENT ESCALATION: This issue has remained unresolved beyond the stipulated municipal SLA deadline and is hereby escalated to the Municipal Commissioner and Vigilance & Quality Control cell for immediate enforcement.\n\n' : ''}Note: A geotagged & timestamped photographic evidence image is also attached with this email.

Please arrange for an on-site inspection and dispatch work teams to resolve this issue at the earliest.

Sincerely,
Concerned Residents & Taxpayers of ${hotspot.area_name}`;

  const toRecipients = routing.toEmails.join(',');
  const ccRecipients = routing.ccEmails.join(',');

  // Gmail Web Compose Link with TO and CC
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toRecipients)}&cc=${encodeURIComponent(ccRecipients)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(formalLetter)}`;

  // Default Mail App URI
  const mailtoUri = `mailto:${toRecipients}?cc=${encodeURIComponent(ccRecipients)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formalLetter)}`;

  // WhatsApp Sarathi Link
  const whatsappSarathiUrl = `https://wa.me/91${PCMC_ESCALATION_CONFIG.central_grievance.sarathi_whatsapp}?text=${encodeURIComponent(
    `*Civic Grievance - Pimpri Chinchwad*\n\n` +
    `• *Issue*: ${hotspot.category} (${hotspot.sub_tag})\n` +
    `• *Location*: ${hotspot.area_name}\n` +
    `• *GPS*: ${hotspot.latitude.toFixed(5)}, ${hotspot.longitude.toFixed(5)}\n` +
    `• *Status*: ${hotspot.status} ${sla.isOverdue ? '(OVERDUE)' : ''}\n` +
    `• *Confirmed by*: ${hotspot.corroboration_count} residents on-site\n\n` +
    (photoUrl ? `📸 *Photo Evidence Link*:\n${photoUrl}\n\n` : '') +
    `📍 *Google Maps Location*:\n${googleMapsUrl}\n\n` +
    `Please register this grievance and dispatch field repair team.`
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`To: ${toRecipients}\nCc: ${ccRecipients}\nSubject: ${subject}\n\n${formalLetter}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadWatermark = async () => {
    setDownloading(true);
    try {
      const targetPhoto = photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop';
      const stamped = await createWatermarkedImage(targetPhoto, {
        id: hotspot.id,
        category: hotspot.category,
        areaName: hotspot.area_name,
        latitude: hotspot.latitude,
        longitude: hotspot.longitude,
        createdAt: hotspot.created_at
      });
      downloadFile(stamped, `PCMC_Evidence_${hotspot.id.substring(0, 8)}.jpg`);
    } catch (err) {
      console.warn('Watermark error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl no-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              {routing.zone.zone} • {routing.catConfig.department}
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              {language === 'mr' ? 'PCMC अधिकाऱ्यांना अधिकृत ईमेल पाठवा' : 'Official Municipal Escalation'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Issue Card Summary */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">{hotspot.category} • #{hotspot.sub_tag}</span>
            <span className="text-cyan-400 font-mono text-[11px]">#{hotspot.id.substring(0, 8)}</span>
          </div>
          <p className="text-slate-400 flex items-center gap-1 text-[11px]">
            <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate">{hotspot.area_name}</span>
          </p>
        </div>

        {/* Escalation Tier Status Badge */}
        <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 ${
          routing.isHighTier 
            ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' 
            : 'bg-slate-950/70 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            {routing.isHighTier ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <Flame className="w-5 h-5 text-cyan-400 shrink-0" />
            )}
            <div>
              <span className="font-extrabold block text-xs">
                {routing.isHighTier 
                  ? '🚨 Level 2: Municipal Commissioner & Vigilance Escalation' 
                  : 'Tier 1: Departmental Action Desk'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {routing.isHighTier 
                  ? 'Dr. Vijay Suryawanshi (IAS) & Vigilance Joint Commissioner CC\'d' 
                  : `Target SLA: ${hotspot.sla_hours}h (${sla.durationOpenStr})`}
              </span>
            </div>
          </div>

          {!sla.isOverdue && (
            <button
              type="button"
              onClick={() => setForceCommissionerTier(!forceCommissionerTier)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 transition-colors ${
                forceCommissionerTier 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
              }`}
            >
              {forceCommissionerTier ? '✓ Level 2 On' : '+ Escalate to Commissioner'}
            </button>
          )}
        </div>

        {/* Primary Nodal Official Contact Card */}
        <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Primary Designated Authority
            </span>
            <a
              href={`tel:${routing.catConfig.primary_official.phone.replace(/[^0-9]/g, '')}`}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-lg border border-cyan-800/80 hover:bg-cyan-900"
            >
              <Phone className="w-3 h-3" />
              <span>Call: {routing.catConfig.primary_official.phone}</span>
            </a>
          </div>

          <div className="font-semibold text-white">
            {routing.catConfig.primary_official.name}
            <span className="text-slate-400 font-normal block text-[11px]">
              {routing.catConfig.primary_official.role}
            </span>
          </div>

          <div className="pt-1 border-t border-slate-900 text-[11px] space-y-0.5 font-mono">
            <div className="flex items-start gap-1 text-slate-400">
              <span className="text-[10px] uppercase font-bold text-slate-500 w-7 shrink-0">TO:</span>
              <span className="text-cyan-300 break-all">{toRecipients}</span>
            </div>
            <div className="flex items-start gap-1 text-slate-400">
              <span className="text-[10px] uppercase font-bold text-slate-500 w-7 shrink-0">CC:</span>
              <span className="text-slate-300 break-all">{ccRecipients}</span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Attachment Guide Callout */}
        <div className="bg-cyan-950/40 border border-cyan-800/60 rounded-xl p-2.5 text-xs text-cyan-200 flex items-start gap-2">
          <Paperclip className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong className="text-cyan-300 block">How to attach photo proof:</strong>
            1. Tap <strong>&ldquo;Download Watermarked Proof&rdquo;</strong> below to save the official timestamped JPG to your device.
            <br />
            2. Tap <strong>&ldquo;Open in Gmail&rdquo;</strong> (the letter is already typed), tap 📎 <strong>Attach</strong>, and select the downloaded JPG!
          </div>
        </div>

        {/* Dispatch Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* 1. Download Watermarked Proof */}
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadWatermark}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>{downloading ? 'Generating Evidence Stamp...' : t.downloadWatermarked}</span>
          </button>

          {/* 2. Open Gmail Web */}
          <a
            href={gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>{t.openGmail} (Auto-Routed To & Cc)</span>
          </a>

          {/* 3. Open Default Mail App */}
          <a
            href={mailtoUri}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.openMailApp}</span>
          </a>

          {/* 4. WhatsApp Sarathi Quick Grievance */}
          <a
            href={whatsappSarathiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-emerald-600 active:scale-95 transition-all shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span>Send to Sarathi WhatsApp (9922501450)</span>
          </a>

          {/* 5. Copy Letter & Recipients */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Copied Formal Letter, To & Cc!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.copyLetter}</span>
              </>
            )}
          </button>
        </div>

        {/* State Level Escalation Banner (Aaple Sarkar) */}
        <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
          <div className="text-amber-200 text-[11px]">
            <strong>Unresolved &gt; 7 days?</strong> File directly on Maharashtra State Aaple Sarkar portal.
          </div>
          <a
            href={PCMC_SARATHI.aapleSarkar}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shrink-0 flex items-center gap-1 shadow-sm"
          >
            <span>Aaple Sarkar</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
