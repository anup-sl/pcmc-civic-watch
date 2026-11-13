import { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  Eye, 
  MapPin, 
  Calendar, 
  ShieldCheck
} from 'lucide-react';
import { 
  fetchModerationQueue, 
  deleteModeratedContent, 
  dismissModerationFlag, 
  deleteHotspotDirect, 
  supabase 
} from '../supabase';
import type { ModerationQueueItem } from '../supabase';
import type { Hotspot } from '../types';
import type { Language } from '../utils/i18n';

interface ModeratorPortalProps {
  language: Language;
  onClose: () => void;
}

const MODERATOR_PIN = (import.meta.env.VITE_MODERATOR_PIN || 'PCMC-ADMIN-2026').trim().toUpperCase();

export const ModeratorPortal = ({ onClose }: ModeratorPortalProps) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'queue' | 'hotspots'>('queue');
  const [queue, setQueue] = useState<ModerationQueueItem[]>([]);
  const [allHotspots, setAllHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Check existing session auth
  useEffect(() => {
    const isAuth = sessionStorage.getItem('pcmc_mod_auth') === 'true';
    if (isAuth) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim().toUpperCase() === MODERATOR_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('pcmc_mod_auth', 'true');
      setPinError(null);
    } else {
      setPinError('Invalid Moderator PIN. Please check and retry.');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const q = await fetchModerationQueue();
      setQueue(q);

      const { data: hData } = await supabase.from('hotspots').select('*').order('created_at', { ascending: false });
      if (hData) setAllHotspots(hData as Hotspot[]);
    } catch (e) {
      console.warn('Error loading moderation data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleDeleteItem = async (item: ModerationQueueItem) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this flagged content? This action cannot be undone.')) {
      return;
    }

    setActionInProgress(item.id);
    try {
      await deleteModeratedContent(item.id, item.target_report_id, item.hotspot_id);
      setQueue(prev => prev.filter(q => q.id !== item.id));
      setAllHotspots(prev => prev.filter(h => h.id !== item.hotspot_id));
      showToast('Flagged content & violating photo deleted successfully.');
    } catch (e) {
      alert('Error deleting content: ' + String(e));
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDismissFlag = async (item: ModerationQueueItem) => {
    setActionInProgress(item.id);
    try {
      await dismissModerationFlag(item.id);
      setQueue(prev => prev.filter(q => q.id !== item.id));
      showToast('Flag dismissed. Civic issue remains active.');
    } catch (e) {
      alert('Error dismissing flag: ' + String(e));
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteHotspotDirect = async (hotspotId: string) => {
    if (!window.confirm('Delete this entire civic hotspot and all associated photos?')) {
      return;
    }

    setActionInProgress(hotspotId);
    try {
      await deleteHotspotDirect(hotspotId);
      setAllHotspots(prev => prev.filter(h => h.id !== hotspotId));
      setQueue(prev => prev.filter(q => q.hotspot_id !== hotspotId));
      showToast('Hotspot permanently removed from database.');
    } catch (e) {
      alert('Error deleting hotspot: ' + String(e));
    } finally {
      setActionInProgress(null);
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>CivicWatch Moderator Desk</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                  ADMIN ONLY
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Review flagged reports, remove violating uploads, and enforce safety guidelines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Refresh queue"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="my-2 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-150 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* PIN LOGIN SCREEN */}
        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="py-8 max-w-sm mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-cyan-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Enter Moderator Access PIN</h4>
              <p className="text-xs text-slate-400 mt-1">
                Restricted to authorized project maintainers & ward coordinators.
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter access PIN..."
                autoComplete="current-password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center text-sm font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-rose-400 font-medium">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              Unlock Moderator Portal
            </button>
          </form>
        ) : (
          /* AUTHENTICATED MODERATOR DESK */
          <div className="flex-1 flex flex-col min-h-0 pt-3 space-y-3">
            {/* Tab switchers */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('queue')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'queue'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Flagged Queue</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-white">
                  {queue.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('hotspots')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'hotspots'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>All Live Hotspots</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-white">
                  {allHotspots.length}
                </span>
              </button>
            </div>

            {/* TAB CONTENT: FLAGGED QUEUE */}
            {activeTab === 'queue' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
                {loading ? (
                  <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Loading flagged reports queue...</span>
                  </div>
                ) : queue.length === 0 ? (
                  <div className="py-12 text-center space-y-2 bg-slate-950/40 rounded-2xl border border-slate-800/80">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Moderation Queue is Clean!</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      No citizen flags are pending review. The pre-submission AI guardrails and community filters are keeping uploads clean.
                    </p>
                  </div>
                ) : (
                  queue.map((item) => {
                    const isProcessing = actionInProgress === item.id;
                    const dateStr = new Date(item.created_at).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-slate-950/90 border border-rose-500/30 space-y-3 shadow-lg"
                      >
                        {/* Queue Item Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-rose-400" />
                                {item.reason_label}
                              </span>
                              {item.hotspot && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700 text-[10px] font-bold">
                                  {item.hotspot.category} • {item.hotspot.area_name}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>Flagged on {dateStr}</span>
                            </p>
                          </div>
                        </div>

                        {/* Photo Evidence & Report Note */}
                        <div className="flex gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                          {item.target_report?.photo_url ? (
                            <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-black border border-slate-700">
                              <img
                                src={item.target_report.photo_url}
                                alt="Flagged Evidence"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 text-center p-1 shrink-0">
                              No photo attached
                            </div>
                          )}

                          <div className="flex-1 min-w-0 space-y-1 text-xs">
                            <div className="text-[11px] text-slate-300">
                              <span className="text-slate-500 font-semibold">Report Note: </span>
                              {item.target_report?.notes || 'No description provided'}
                            </div>
                            {item.notes && (
                              <div className="text-[11px] text-rose-300/90 bg-rose-950/40 p-1.5 rounded border border-rose-900/60">
                                <span className="font-semibold text-rose-400">Citizen Flag Context: </span>
                                {item.notes}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons: Delete & Purge or Dismiss */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleDismissFlag(item)}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Dismiss (Benign)</span>
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleDeleteItem(item)}
                            className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/50 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isProcessing ? 'Deleting...' : 'Delete & Purge'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB CONTENT: ALL LIVE HOTSPOTS QUICK MANAGER */}
            {activeTab === 'hotspots' && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                {allHotspots.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    No active hotspots in database.
                  </div>
                ) : (
                  allHotspots.map((h) => (
                    <div
                      key={h.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white truncate">{h.category}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                            {h.sub_tag}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            h.status === 'OPEN' ? 'bg-amber-950 text-amber-300' :
                            h.status === 'CHRONIC_REOPENED' ? 'bg-purple-950 text-purple-300' :
                            'bg-emerald-950 text-emerald-300'
                          }`}>
                            {h.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{h.area_name}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-500">{h.corroboration_count} citizen votes</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={actionInProgress === h.id}
                        onClick={() => handleDeleteHotspotDirect(h.id)}
                        className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-400 hover:text-white transition-colors shrink-0"
                        title="Delete entire hotspot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
