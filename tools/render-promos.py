"""Generate marketing tiles from central product metadata and mark geometry."""
import json,sys
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
r=json.load(sys.stdin)
font_paths=['/System/Library/Fonts/SFNS.ttf','/System/Library/Fonts/Supplemental/Arial.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']
def font(size):
    for path in font_paths:
        if Path(path).exists():
            try:return ImageFont.truetype(path,size)
            except OSError:pass
    raise RuntimeError('Install a system sans-serif font to render store assets.')
for name in ['small','marquee']:
    width,height=r['sizes'][name].values()
    image=Image.new('RGB',(width*2,height*2),r['brand']['ink']);d=ImageDraw.Draw(image)
    factor=height/280*2;size=100*factor;ox=width*.5*2-size*.5;oy=height*.16*2
    for shape in r['mark']['polygons']:
        d.polygon([(ox+x/48*size,oy+y/48*size) for x,y in shape['points']],fill=shape['fill'])
    title=r['product']['name'];title_font=font(round(37*factor));bounds=d.textbbox((0,0),title,font=title_font)
    d.text(((width*2-(bounds[2]-bounds[0]))/2,height*.57*2),title,font=title_font,fill=r['brand']['light'])
    label='JSON & XML, clearly.';label_font=font(round(15*factor));bounds=d.textbbox((0,0),label,font=label_font)
    d.text(((width*2-(bounds[2]-bounds[0]))/2,height*.77*2),label,font=label_font,fill=r['brand']['light'])
    image.resize((width,height),Image.Resampling.LANCZOS).save(f'store/promo-{name}.png')
print('Generated 440×280 and 1400×560 promotional tiles.')
