import { X, Phone, Mail, ExternalLink, ShieldCheck, ShieldAlert, UserCheck } from 'lucide-react';
import { ZONAL_OFFICES, PCMC_SARATHI } from '../utils/pcmcDirectory';
import { PCMC_ESCALATION_CONFIG } from '../config/escalationConfig';
import { CorporatorSection } from './CorporatorSection';
import type { Language } from '../utils/i18n';
import { TRANSLATIONS } from '../utils/i18n';

interface DirectoryModalProps {
  language: Language;
  onClose: () => void;
  initialWardNo?: number | string;
}

export const DirectoryModal = ({ language, onClose, initialWardNo = 16 }: DirectoryModalProps) => {
  const t = TRANSLATIONS[language];
  const leadership = PCMC_ESCALATION_CONFIG.escalation_leadership;
  const categories = PCMC_ESCALATION_CONFIG.categories;

  return (
    <div className="fixed inset-0 z-[1200] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.wardDirectory}</h3>
              <p className="text-[11px] text-slate-400">Official Municipal Contacts & Helplines</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 24x7 Sarathi Helpline Card */}
        <div className="bg-gradient-to-br from-cyan-950/70 to-slate-900 border border-cyan-500/40 rounded-2xl p-4 space-y-2.5 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                {language === 'mr' ? '२४×७ अधिकृत नागरिक हेल्पलाइन' : '24×7 Official Municipal Helpline'}
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">{t.sarathiHelpline}</h4>
              <p className="text-xl font-black text-cyan-400 tracking-wider mt-1">{PCMC_SARATHI.helpline}</p>
              <p className="text-[11px] text-slate-400">WhatsApp: 9922501450 • {PCMC_ESCALATION_CONFIG.central_grievance.egov_email}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl">
              📞
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={`tel:${PCMC_SARATHI.helpline}`}
              className="py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{t.callSarathi}</span>
            </a>
            <a
              href={`mailto:${PCMC_SARATHI.email}`}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate">{PCMC_SARATHI.email}</span>
            </a>
          </div>
        </div>

        {/* PCMC Corporators Section (As per location with 32-Ward Switcher) */}
        <CorporatorSection
          wardNo={initialWardNo}
          language={language}
          collapsible={false}
          showWardSwitcher={true}
          title={language === 'mr' ? 'प्रभागानुसार अधिकृत नगरसेवक (३२ प्रभाग)' : 'Official PCMC Corporators (32 Wards)'}
        />

        {/* Escalation Leadership Contacts */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Escalation Leadership (Tier 2 & Vigilance)</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Commissioner */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-start gap-2">
              <div>
                <span className="font-bold text-white block">{leadership.commissioner.name}</span>
                <span className="text-[10px] text-slate-400">{leadership.commissioner.role}</span>
              </div>
              <a
                href={`mailto:${leadership.commissioner.emails[0]}`}
                className="text-[10px] font-mono text-cyan-300 hover:underline shrink-0"
              >
                {leadership.commissioner.emails[0]}
              </a>
            </div>

            {/* Vigilance Joint Commissioner */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-start gap-2">
              <div>
                <span className="font-bold text-white block">{leadership.vigilance.name}</span>
                <span className="text-[10px] text-slate-400">{leadership.vigilance.role}</span>
              </div>
              <a
                href={`mailto:${leadership.vigilance.emails[0]}`}
                className="text-[10px] font-mono text-cyan-300 hover:underline shrink-0"
              >
                {leadership.vigilance.emails[0]}
              </a>
            </div>
          </div>
        </div>

        {/* Nodal Department Heads */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>Nodal Department Authorities</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {Object.entries(categories).map(([key, cat]) => (
              <div key={key} className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-cyan-400 block truncate">
                  {cat.display_name}
                </span>
                <div className="font-semibold text-white text-[11px] truncate">
                  {cat.primary_official.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {cat.primary_official.role}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                  <a href={`tel:${cat.primary_official.phone.replace(/[^0-9]/g, '')}`} className="text-cyan-400 font-bold hover:underline">
                    📞 {cat.primary_official.phone}
                  </a>
                  <a href={`mailto:${cat.primary_official.to_emails[0]}`} className="text-slate-400 hover:text-white truncate max-w-[100px]">
                    ✉️ {cat.primary_official.to_emails[0]}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All 8 PCMC Zonal Offices (Zone A to H) */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
            {t.zonalOffices}
          </span>
          <div className="space-y-2">
            {ZONAL_OFFICES.map((z) => (
              <div key={z.zone} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-cyan-400 font-extrabold text-[11px] block">
                      {z.zone} ({language === 'mr' ? z.marathiZone : z.officer})
                    </span>
                    <p className="text-[11px] text-slate-300 mt-0.5">{z.coverage}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${z.phone}`}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 flex items-center justify-center gap-1 font-mono text-[11px]"
                  >
                    <Phone className="w-3 h-3 text-cyan-400" />
                    <span>{z.phoneFormatted}</span>
                  </a>
                  <a
                    href={`mailto:${z.email}`}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-cyan-300 flex items-center justify-center gap-1 text-[11px] truncate"
                  >
                    <Mail className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{z.email}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Working Official Municipal Web Portals */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {language === 'mr' ? 'थेट अधिकृत पोर्टल्स' : 'Direct Official Portals'}
          </span>
          <div className="space-y-1 text-xs">
            <a
              href={PCMC_SARATHI.aapleSarkar}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 flex items-center justify-between text-slate-200"
            >
              <div>
                <span className="font-bold text-white block">Aaple Sarkar Grievance Portal</span>
                <span className="text-[10px] text-slate-400">Maharashtra State escalation desk</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>

            <a
              href={PCMC_SARATHI.webGrievance}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 flex items-center justify-between text-slate-200"
            >
              <div>
                <span className="font-bold text-white block">PCMC Direct Web Grievance Form</span>
                <span className="text-[10px] text-slate-400">Legacy E-Seva grievance portal</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>
            <a
              href={PCMC_SARATHI.propertyTax}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 flex items-center justify-between text-slate-200"
            >
              <div>
                <span className="font-bold text-white block">PCMC Property Tax & Water Portals</span>
                <span className="text-[10px] text-slate-400">publicptaxpcmc.in & water.pcmcindia.gov.in</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>
          </div>
        </div>

        {/* NON-AFFILIATION CITIZEN INITIATIVE NOTICE */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
          <p className="text-[11px] font-bold text-slate-300">
            {language === 'mr'
              ? 'एक स्वतंत्र, गैर-व्यावसायिक नागरिक पुढाकार. पिंपरी चिंचवड महानगरपालिका (PCMC) शी संलग्न किंवा मान्यताप्राप्त नाही.'
              : 'An independent, non-commercial citizen initiative. Not affiliated with or endorsed by Pimpri Chinchwad Municipal Corporation (PCMC).'}
          </p>
          <p className="text-[10px] text-slate-500">
            {language === 'mr'
              ? 'संपर्क माहिती नागरिकांच्या सोयीसाठी अधिकृत सार्वजनिक स्रोतांवरून संकलित करण्यात आली आहे.'
              : 'Directory information compiled from public records for citizen civic access.'}
          </p>
        </div>
      </div>
    </div>
  );
};
