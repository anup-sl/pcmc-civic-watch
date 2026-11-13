import { useState } from 'react';
import { Phone, ExternalLink, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { getCorporatorsForWard } from '../utils/pcmcCorporators';
import type { Language } from '../utils/i18n';

interface CorporatorSectionProps {
  wardNo: number | string;
  wardLocality?: string;
  zone?: string;
  language: Language;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  showWardSwitcher?: boolean;
  onSelectWard?: (wardNo: number) => void;
  title?: string;
}

export const CorporatorSection = ({
  wardNo,
  wardLocality,
  zone,
  language,
  collapsible = true,
  defaultExpanded = true,
  showWardSwitcher = false,
  onSelectWard,
  title
}: CorporatorSectionProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [selectedWard, setSelectedWard] = useState<number>(
    typeof wardNo === 'number' ? wardNo : parseInt(wardNo || '16', 10) || 16
  );

  // If prop wardNo changes, keep in sync
  const currentWardNo = showWardSwitcher ? selectedWard : (typeof wardNo === 'number' ? wardNo : parseInt(wardNo || '16', 10) || 16);
  const corporators = getCorporatorsForWard(currentWardNo);

  const handleWardChange = (newWard: number) => {
    setSelectedWard(newWard);
    if (onSelectWard) {
      onSelectWard(newWard);
    }
  };

  const seatLabels: Record<'A' | 'B' | 'C' | 'D', { en: string; mr: string }> = {
    A: { en: 'Seat A', mr: 'जागा अ' },
    B: { en: 'Seat B', mr: 'जागा ब' },
    C: { en: 'Seat C', mr: 'जागा क' },
    D: { en: 'Seat D', mr: 'जागा ड' }
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-md animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-xs text-white truncate">
                {title || (language === 'mr' ? `प्रभाग ${currentWardNo} चे नगरसेवक` : `Ward ${currentWardNo} Elected Corporators`)}
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 shrink-0">
                W-{String(currentWardNo).padStart(2, '0')}
              </span>
              {zone && (
                <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                  • {zone}
                </span>
              )}
            </div>
            {wardLocality && (
              <p className="text-[10px] text-slate-400 truncate">
                {wardLocality}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {showWardSwitcher && (
            <select
              value={currentWardNo}
              onChange={(e) => handleWardChange(parseInt(e.target.value, 10))}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-cyan-400 text-[11px] font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500"
            >
              {Array.from({ length: 32 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Ward {w}
                </option>
              ))}
            </select>
          )}

          {collapsible && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Corporator Grid */}
      {isExpanded && (
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {corporators.map((corp) => {
              const seatLabel = language === 'mr' ? seatLabels[corp.seat].mr : seatLabels[corp.seat].en;

              return (
                <div
                  key={corp.seat + corp.name}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700/80 transition-all flex flex-col justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1 text-[10px]">
                      <span className="font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-950/90 border border-cyan-800/80 px-1.5 py-0.5 rounded">
                        {seatLabel}
                      </span>
                      {corp.profileUrl && (
                        <a
                          href={corp.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-cyan-400 inline-flex items-center gap-0.5 text-[10px]"
                          title="Official PCMC Profile"
                        >
                          <span>PCMC</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-100 leading-snug pt-0.5">
                      {corp.name}
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-900 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-300 font-semibold tracking-wide">
                      {corp.phone}
                    </span>
                    <a
                      href={`tel:${corp.phone}`}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 font-bold text-[11px] inline-flex items-center gap-1 transition-all active:scale-95"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{language === 'mr' ? 'कॉल करा' : 'Call'}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 px-0.5 pt-1">
            <span>{language === 'mr' ? 'अधिकृत स्रोत: pcmcindia.gov.in/corporator' : 'Official data: pcmcindia.gov.in/corporator'}</span>
            <a
              href="https://www.pcmcindia.gov.in/corporator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400/80 hover:text-cyan-400 hover:underline flex items-center gap-0.5"
            >
              <span>{language === 'mr' ? 'पूर्ण यादी' : 'View Portal'}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
