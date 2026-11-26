p='src/components/ReportTab.tsx'
s=open(p,encoding='utf-8').read()
start=s.index('          {/* GPS Auto-locate and Switch Ward strictly on line 1 */}')
end=s.index('        </div>\n\n        {/* LINE 2: Corporators & Zone Office Info (Always on line 2) */}')
s=s[:start]+s[end:]
# remove Edit2 button block
old_edit='''                <button
                  type="button"
                  onClick={() => setIsEditingArea(true)}
                  className="p-1 rounded text-slate-400 hover:text-cyan-400 shrink-0"
                  title={language === 'mr' ? 'स्ट्रीट / लँडमार्क बदला' : 'Edit street / landmark'}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
'''
s=s.replace(old_edit,'')
open(p,'w',encoding='utf-8').write(s)
print('ok')
