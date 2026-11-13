import { useState } from 'react';
import { 
  X, 
  Flag, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  EyeOff, 
  Car, 
  Home, 
  RefreshCw 
} from 'lucide-react';
import type { Language } from '../utils/i18n';
import { submitFlagReport } from '../supabase';

interface FlagModalProps {
  language: Language;
  onClose: () => void;
  reportId?: string;
  hotspotId?: string;
}

export const FlagModal = ({ language, onClose, reportId, hotspotId }: FlagModalProps) => {
  const [selectedReason, setSelectedReason] = useState<string>('abusive_vulgar');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const flagOptions = [
    {
      id: 'abusive_vulgar',
      icon: EyeOff,
      title: language === 'mr' ? 'अश्लील, नग्न किंवा आक्षेपार्ह मजकूर' : 'Abusive, Vulgar or NSFW Content',
      desc: language === 'mr' 
        ? 'नग्नता, अश्लीलता, हिंसाचार किंवा आक्षेपार्ह प्रतिमा' 
        : 'Nudity, pornography, abusive gestures, or inappropriate content'
    },
    {
      id: 'private_property',
      icon: Home,
      title: language === 'mr' ? 'खाजगी मालमत्ता / घराचा अंतर्गत भाग' : 'Private Property Interior',
      desc: language === 'mr'
        ? 'घराच्या आतला भाग किंवा सार्वजनिक नसलेली खाजगी जागा'
        : 'Captures inside a private home, residential balcony, or non-public space'
    },
    {
      id: 'personal_dispute',
      icon: Car,
      title: language === 'mr' ? 'व्यक्तिगत वाद / वाहनाची नंबर प्लेट' : 'Personal Dispute / Vehicle Plate',
      desc: language === 'mr'
        ? 'व्यक्तिगत भांडण किंवा शेजाऱ्यांशी वादात वाहनाचा नंबर मुद्दाम दाखवणे'
        : 'Targeting an individual, vehicle number plate, or private dispute'
    },
    {
      id: 'harassment_spam',
      icon: AlertTriangle,
      title: language === 'mr' ? 'स्पॅम किंवा खोटी तक्रार' : 'Spam or False Report',
      desc: language === 'mr'
        ? 'जाहिरात, चुकीची तक्रार किंवा नागरी समस्येशी संबंध नसलेला मजकूर'
        : 'Commercial advertisement, duplicate spam, or non-civic harassment'
    }
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const chosenOption = flagOptions.find(o => o.id === selectedReason);
    await submitFlagReport({
      reportId,
      hotspotId,
      reason: selectedReason,
      reasonLabel: chosenOption?.title || selectedReason,
      notes: details.trim() || undefined
    });
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {language === 'mr' ? 'आक्षेपार्ह मजकुराची तक्रार करा' : 'Flag Inappropriate Content'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'mr' 
                  ? 'नागरी व्यासपीठ सुरक्षित आणि स्वच्छ ठेवण्यासाठी मदत करा' 
                  : 'Help keep this public civic platform safe & respectful'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">
              {language === 'mr' ? 'तक्रार प्राप्त झाली!' : 'Report Submitted!'}
            </h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              {language === 'mr'
                ? 'आपल्या दक्षतेबद्दल धन्यवाद. हा मजकूर तातडीने तपासणीसाठी पाठवण्यात आला असून उल्लंघन आढळल्यास तो तत्काळ काढून टाकला जाईल.'
                : 'Thank you for keeping CivicWatch safe. This content has been queued for immediate review and will be removed if it violates community rules.'}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              {language === 'mr' ? 'बंद करा' : 'Close'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Community Standard Banner */}
            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold text-rose-300 block mb-0.5">
                  {language === 'mr' ? 'कडक आक्षेपार्ह सामग्री धोरण' : 'Zero Tolerance for Inappropriate Content'}
                </span>
                {language === 'mr'
                  ? 'CivicWatch फक्त खड्डे, कचरा, ड्रेनेज अशा सार्वजनिक नागरी समस्यांसाठी आहे. खाजगी घरे, व्यक्तिगत वाद किंवा अश्लील फोटो त्वरित काढून टाकले जातात.'
                  : 'CivicWatch is exclusively for public civic infrastructure (potholes, garbage, lighting, drainage). Private property interiors, personal dispute license plates, and vulgar photos are strictly barred.'}
              </div>
            </div>

            {/* Select Reason Radios */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                {language === 'mr' ? 'तक्रारीचे कारण निवडा' : 'Reason for reporting'}
              </label>
              <div className="space-y-2">
                {flagOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedReason === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedReason(opt.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        isSelected 
                          ? 'bg-rose-950/30 border-rose-500/70 text-white ring-1 ring-rose-500/40 shadow-md' 
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-850 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white leading-tight">
                          {opt.title}
                        </div>
                        <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                          {opt.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Description / Context */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                {language === 'mr' ? 'अधिक माहिती (पर्यायी)' : 'Additional Details (Optional)'}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={language === 'mr' ? 'उदा. या फोटोमध्ये खाजगी वाहन नंबर किंवा घराचा आतील भाग दिसत आहे...' : 'e.g. This photo clearly shows a private residential balcony...'}
                rows={2}
                maxLength={300}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                {language === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-900/30 active:scale-95 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'mr' ? 'नोंदवत आहे...' : 'Submitting...'}</span>
                  </>
                ) : (
                  <>
                    <Flag className="w-3.5 h-3.5" />
                    <span>{language === 'mr' ? 'तक्रार नोंदवा' : 'Submit Flag'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
