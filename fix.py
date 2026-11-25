p='src/components/ReportTab.tsx'
s=open(p,encoding='utf-8').read()
old='''        </div>
      ) : (
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
      ) : (
          <img'''
new='''        </div>
      ) : (
          <img'''
assert old in s, "not found"
s=s.replace(old,new)
open(p,'w',encoding='utf-8').write(s)
print("ok")
