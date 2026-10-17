cd /home/claude/koleso
python3 - <<'P'
v9=open('v9.html').read()
i=v9.index('<script type="module">');j=v9.index('</script>',i)+9
shader=v9[i:j]
head='''<title>Далеко собрались?</title>
<meta name="description" content="Рисованный анимационный лонгрид о том, почему колесо — это не круг, а целая сборка из оси, дороги, груза, тяги и человека.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alegreya+SC:wght@400;700&family=Alegreya:wght@400;700&display=swap">
<style>
'''+open('v10/style.css').read()+'\n</style>\n'
import json,base64
meta=json.load(open('photos/meta.json'))
body=open('v10/body.html').read()
for k in meta:
    body=body.replace('__IMG_'+k+'__','data:image/jpeg;base64,'+base64.b64encode(open('photos/'+k+'.jpg','rb').read()).decode())
import glob,os
for f in glob.glob('photos/[CTS]_*.webp'):
    body=body.replace('__CUT_'+os.path.basename(f)[:-5]+'__','data:image/webp;base64,'+base64.b64encode(open(f,'rb').read()).decode())
for k in ('H1','H2','H3','H4'):
    body=body.replace('__HI_'+k+'__','data:image/jpeg;base64,'+base64.b64encode(open('photos/'+k+'.jpg','rb').read()).decode())
cred='Фотографии и рисунки — Викисклад: '+'; '.join('<a href="%s">%s</a> (%s, %s)'%(v['url'],v['t'].rsplit('.',1)[0][:60],(v['art'] or 'автор неизвестен').replace('Unknown authorUnknown author','автор неизвестен')[:60],v['lic']) for k,v in meta.items() if k not in ('F2','X13','X14') and ('__IMG_'+k+'__' in open('v10/body.html').read() or k in ('F1','P2','X1','X11','R1','N1','X8','H1','H2','H3','H4','L1','E1','P1')))+'.'
body=body.replace('<p class="credits-photo" id="photoCredits"></p>','<p class="credits-photo" id="photoCredits">'+cred+'</p>')
page=head+body+'\n<script>\n'+open('v10/scenery.js').read()+'\n'+open('v10/app.js').read()+'\n</script>\n'+shader+'\n'
open('v10.html','w').write(page)
open('v10s.html','w').write('<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'+head+'</head><body>'+body+'\n<script>\n'+open('v10/scenery.js').read()+'\n'+open('v10/app.js').read()+'\n</script>\n'+shader+'</body></html>')
print(len(page))
P
