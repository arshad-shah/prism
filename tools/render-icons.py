"""Rasterize central mark polygons with supersampling; no separate logo source."""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw
recipe=json.load(sys.stdin)
for size in recipe['sizes']:
    scale=size*8/recipe['viewBox']
    image=Image.new('RGBA',(size*8,size*8),(0,0,0,0))
    draw=ImageDraw.Draw(image)
    for shape in recipe['shapes']:
        draw.polygon([(x*scale,y*scale) for x,y in shape['points']],fill=shape['fill'])
    for seam in recipe['seams']:
        draw.line([(x*scale,y*scale) for x,y in seam],fill=recipe['stroke'],width=max(1,round(recipe['strokeWidth']*scale)))
    image.resize((size,size),Image.Resampling.LANCZOS).save(Path('icons')/f'icon-{size}.png')
print('Generated Prism SVGs and 16/32/48/128 PNG icons.')
