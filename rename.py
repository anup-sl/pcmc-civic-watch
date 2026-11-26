p='src/components/ReportTab.tsx'
s=open(p,encoding='utf-8').read()
s=s.replace('citizenContact','citizenPhone')
open(p,'w',encoding='utf-8').write(s)
print('done')
