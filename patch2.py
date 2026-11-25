p='src/components/ReportTab.tsx'
s=open(p,encoding='utf-8').read()
marker='      {!photoPreviewUrl ? ('
i=s.index(marker)
j=s.index('      ) : (', i)
# Build new zero-state block ending with ) : (
new='''      {!photoPreviewUrl ? (
        <div className="space-y-4">
          <div className="w-full flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs shadow-sm">
              <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-semibold tracking-tight">
                {language === 'mr' ? 'LOCK 100% Anonymous' : 'LOCK 100% Anonymous and Secure'}
              </span>
            </div>
          </div>
          <div className="relative flex flex-col items-center justify-center py-4 sm:py-6">
            <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-orange-500/20 via-amber-500/10 to-transparent blur-xl animate-pulse -z-10" />
            <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-orange-500/30 animate-ping opacity-25 duration-1000 -z-10" />
            <button type="button" onClick={() => { triggerHaptic('heavy'); triggerCameraSnap(); }} className="group relative w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1.5 bg-gradient-to-b from-orange-400 via-orange-500 to-amber-600 shadow-[0_12px_36px_rgba(249,115,22,0.45)] hover:shadow-[0_16px_44px_rgba(249,115,22,0.6)] active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer select-none border-2 border-white/30">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex flex-col items-center justify-center text-white shadow-inner ring-4 ring-black/15 group-hover:from-orange-500 group-hover:to-amber-400">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-md mb-1 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 sm:w-9 sm:h-9 text-white drop-shadow-sm" />
                </div>
                <span className="text-xs sm:text-sm font-black tracking-wider uppercase drop-shadow-md">
                  {language === 'mr' ? 'Photo Kadhya' : 'SNAP ISSUE'}
                </span>
              </div>
            </button>
            <p className="mt-3.5 text-xs text-slate-300 font-medium text-center flex items-center gap-1.5 bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {language === 'mr' ? 'GPS stamped instantly' : 'GPS coordinates stamped instantly'}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { num: '1', icon: 'P', titleMr: 'Photo Kadhya', titleEn: 'Snap Photo', descMr: 'Proof', descEn: 'Photo Proof' },
              { num: '2', icon: 'L', titleMr: 'Auto GPS', titleEn: 'Auto GPS', descMr: 'GPS', descEn: 'Auto GPS' },
              { num: '3', icon: 'A', titleMr: 'Nagari Nond', titleEn: 'Logged for Escalation and Tracking', descMr: 'Tracking', descEn: 'Civic complaint logged and tracked' },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700 transition-all shadow-sm">
                <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/30 text-[11px] font-bold text-orange-400 flex items-center justify-center mb-1.5">{step.num}</div>
                <div className="text-xl mb-1">{step.icon}</div>
                <h4 className="text-[12px] sm:text-xs font-bold text-white leading-tight">{language === 'mr' ? step.titleMr : step.titleEn}</h4>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">{language === 'mr' ? step.descMr : step.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      ) : ('''
s=s[:i]+new+s[j+len('      ) : ('):]
open(p,'w',encoding='utf-8').write(s)
print("ok")
