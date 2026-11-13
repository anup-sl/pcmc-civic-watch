import { useState } from 'react';
import { 
  X, 
  MessageSquareHeart, 
  Send, 
  CheckCircle2, 
  Star, 
  ExternalLink, 
  Mail,
  Bug,
  Lightbulb,
  Palette,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../supabase';
import type { Language } from '../utils/i18n';

interface FeedbackModalProps {
  language: Language;
  onClose: () => void;
}

type FeedbackType = 'SUGGESTION' | 'BUG' | 'UI' | 'PERFORMANCE';

export const FeedbackModal = ({ language, onClose }: FeedbackModalProps) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('SUGGESTION');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const feedbackTypes: { type: FeedbackType; labelEn: string; labelMr: string; icon: typeof Lightbulb }[] = [
    { type: 'SUGGESTION', labelEn: '💡 Suggestion', labelMr: '💡 सूचना / विचार', icon: Lightbulb },
    { type: 'BUG', labelEn: '🐛 Bug / Issue', labelMr: '🐛 त्रुटी / बग', icon: Bug },
    { type: 'UI', labelEn: '🎨 Design / UI', labelMr: '🎨 डिझाइन', icon: Palette },
    { type: 'PERFORMANCE', labelEn: '⚡ Speed', labelMr: '⚡ वेग / स्पीड', icon: Zap }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      // Try to log into Supabase if feedback table exists, otherwise continue gracefully
      await supabase.from('feedback').insert({
        feedback_type: feedbackType,
        rating,
        message: message.trim(),
        contact_name: contactName.trim() || null,
        contact_email: contactEmail.trim() || null,
        user_agent: navigator.userAgent
      }).select();
    } catch (err) {
      console.warn('Feedback save note (fallback active):', err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleOpenGitHub = () => {
    window.open('https://github.com/anup-sl/pcmc-civic-watch/issues/new', '_blank', 'noopener,noreferrer');
  };

  const handleEmailDev = () => {
    const subject = encodeURIComponent(`[PCMC CivicWatch Feedback] ${feedbackType}`);
    const body = encodeURIComponent(
      `Feedback Type: ${feedbackType}\nRating: ${rating}/5\n\nComments:\n${message}\n\nName: ${contactName || 'Citizen'}\nEmail: ${contactEmail || 'N/A'}`
    );
    window.open(`mailto:anup.sl@outlook.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto no-scrollbar space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              {language === 'mr' ? 'वेबसाईट सुधारण्यासाठी अभिप्राय' : 'Help Improve PCMC CivicWatch'}
            </h2>
            <p className="text-[11px] text-slate-400">
              {language === 'mr' 
                ? 'नागरिकांसाठी हे व्यासपीठ अधिक सुलभ व जलद करण्यासाठी आपल्या सूचना सांगा.' 
                : 'Share your inputs, report a bug, or suggest new features for citizens.'}
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {language === 'mr' ? 'आपला अभिप्राय नोंदवला गेला आहे!' : 'Thank you for your feedback!'}
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                {language === 'mr' 
                  ? 'नागरिक सेवा अधिक सक्षम करण्यासाठी आपले योगदान मोलाचे आहे.'
                  : 'Your inputs directly help us improve the platform for all PCMC residents.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
            >
              {language === 'mr' ? 'बंद करा' : 'Done'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Feedback Category Chips */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                {language === 'mr' ? 'अभिप्रायाचा प्रकार' : 'Feedback Category'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {feedbackTypes.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setFeedbackType(item.type)}
                    className={`py-2 px-3 rounded-xl text-left text-xs font-semibold border transition-all ${
                      feedbackType === item.type
                        ? 'bg-pink-500/20 border-pink-500 text-pink-300 shadow-sm'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {language === 'mr' ? item.labelMr : item.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Stars */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                {language === 'mr' ? 'आपला अनुभव' : 'Your Experience'}
              </label>
              <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-slate-400 ml-auto font-medium">
                  {rating === 5 ? '🌟 Excellent' : rating === 4 ? '👍 Good' : rating === 3 ? '👌 Average' : 'Needs work'}
                </span>
              </div>
            </div>

            {/* Message Textarea */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                {language === 'mr' ? 'आपल्या सूचना किंवा अभिप्राय *' : 'Your Input / Suggestions *'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={language === 'mr' 
                  ? 'उदा. कॅमेरा वेगवान व्हावा, वॉर्ड नंबर शोधावा, किंवा नवीन फिचर सुचवा...' 
                  : 'e.g., Ideas for new features, UI improvements, navigation feedback, or bug reports...'}
                rows={3}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-2xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none transition-colors"
              />
            </div>

            {/* Optional Contact Name & Email */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder={language === 'mr' ? 'नाव (पर्यायी)' : 'Your Name (optional)'}
                className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
              <input
                type="text"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder={language === 'mr' ? 'ईमेल किंवा संपर्क' : 'Email or phone'}
                className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/20 active:scale-98 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : language === 'mr' ? 'अभिप्राय पाठवा' : 'Send Feedback'}</span>
            </button>

            {/* Direct External Links */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <button
                type="button"
                onClick={handleOpenGitHub}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>GitHub Issues</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={handleEmailDev}
                className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Direct Email</span>
              </button>
            </div>

            {/* Non-Affiliation Disclaimer */}
            <p className="text-[10px] text-slate-500 text-center pt-1">
              {language === 'mr'
                ? 'स्वतंत्र नागरिक पुढाकार • PCMC शी संलग्न नाही'
                : 'Independent citizen initiative • Not affiliated with PCMC'}
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
