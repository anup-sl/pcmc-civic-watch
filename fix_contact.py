p='src/components/ReportTab.tsx'
s=open(p,encoding='utf-8').read()

# Remove standalone email block
old_standalone='''            {/* Optional citizen email */}
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mt-2">
              Your Email (for updates &amp; CC) �?" optional
            </label>
            <input
              type="email"
              value={citizenEmail}
              onChange={(e) => setCitizenEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />

'''
assert old_standalone in s, "standalone not found"
s=s.replace(old_standalone,'')

# Rename citizenContact -> citizenPhone
s=s.replace('citizenContact','citizenPhone')

open(p,'w',encoding='utf-8').write(s)
print("ok")
PY