import json, math, re
from pathlib import Path
from PIL import Image
root=Path('/home/ubuntu/recovery-r1-4/contrast-analysis')
def luminance(rgb):
    c=[v/255 for v in rgb[:3]]
    c=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c]
    return .2126*c[0]+.7152*c[1]+.0722*c[2]
results=[]
for entry in json.loads((root/'regions.json').read_text()):
    im=Image.open(root/(entry['name']+'-background-only.png')).convert('RGB')
    for region in entry['regions']:
        # Exclude toolbar icon glyphs; their hit target geometry is tested separately.
        if not re.search(r'[А-Яа-я]',region['text']):continue
        fg=tuple(map(int,re.findall(r'\d+',region['color'])[:3]));fl=luminance(fg);box=region['box']
        xs=range(max(0,math.floor(box['x'])),min(im.width,math.ceil(box['x']+box['width'])))
        ys=range(max(0,math.floor(box['y'])),min(im.height,math.ceil(box['y']+box['height'])))
        values=[]
        for y in ys:
            for x in xs:
                bg=im.getpixel((x,y));bl=luminance(bg)
                values.append(((max(fl,bl)+.05)/(min(fl,bl)+.05),bg,(x,y)))
        ratio,bg,point=min(values)
        fontsize=float(region['fontSize'].replace('px',''))
        large=fontsize>=24 or fontsize>=18.67 and region['weight'] in ['700','800','900','bold']
        threshold=3 if large else 4.5
        results.append({'screen':entry['name'],'text':region['text'],'fg':fg,'worst_background':bg,'sample_at':point,'minimum_ratio':round(ratio,3),'threshold':threshold,'pass':ratio>=threshold,'method':'Conservative minimum across full label box with labels hidden; original pixels not recomposed.'})
Path('/home/ubuntu/recovery-r1-4/hero-contrast.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
for r in results:print(r['screen'],r['text'],r['minimum_ratio'],r['threshold'],'PASS' if r['pass'] else 'FAIL')
if not all(r['pass'] for r in results):raise SystemExit(1)
