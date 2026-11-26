p='src/components/ReportTab.tsx'
s=open(p,encoding='utf-8').read()
start=s.index('            {/* Optional citizen email */}')
end=s.index('            {/* Quick Phrase Chips */}')
block=s[start:end]
print(repr(block[:80]))
s=s[:start]+s[end:]
# rename
s=s.replace('citizenContact','citizenPhone')
open(p,'w',encoding='utf-8').write(s)
print("ok")
