p='src/components/ReportTab.tsx'
s=open(p,encoding='utf-8').read()
s=s.replace("  const [accuracy] = useState<number | null>(null);\n","")
s=s.replace("  const [isLocating, setIsLocating] = useState<boolean>(false);\n","")
# remove Crosshair import line
s=s.replace("  Crosshair,\n","")
open(p,'w',encoding='utf-8').write(s)
print('ok')
