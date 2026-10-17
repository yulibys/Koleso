import math,random
random.seed(11)
R=78   # outer
r_in=73
def f(x):return f'{x:.1f}'
out=[]
A=out.append
A('<g id="wheelArt">')
A('<defs><clipPath id="wa-disc"><circle r="72.5"/></clipPath>'
  '<clipPath id="wa-shade"><path fill-rule="evenodd" d="M-90 -90H90V90H-90ZM-20 -96A84 84 0 1 1 -20 68A84 84 0 1 1 -20 -96Z"/></clipPath>'
  '<pattern id="wa-h1" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)"><line x1="0" y1="0" x2="0" y2="3.2" stroke="#EDE4D1" stroke-width=".55"/></pattern>'
  '<pattern id="wa-h2" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(50)"><line x1="0" y1="0" x2="0" y2="3.2" stroke="#EDE4D1" stroke-width=".5"/></pattern></defs>')
# disc base
A(f'<circle r="{R}" fill="#0B0A08"/>')
# rim end-grain ticks
ticks=[]
for i in range(180):
    a=i/180*2*math.pi
    if random.random()<.15: continue
    r1=r_in+0.6;r2=R-0.4-random.random()*1.2
    ticks.append(f'M{f(math.cos(a)*r1)} {f(math.sin(a)*r1)}L{f(math.cos(a)*r2)} {f(math.sin(a)*r2)}')
A('<path d="'+''.join(ticks)+'" stroke="#EDE4D1" stroke-width=".45" opacity=".55" fill="none"/>')
# grain lines in planks (clipped to disc)
g=[]
def knot(cx,cy,rx,ry):
    s=''
    for k in range(4):
        k1=1-k*.24
        s+=f'<ellipse cx="{f(cx)}" cy="{f(cy)}" rx="{f(rx*k1)}" ry="{f(ry*k1)}" fill="none" stroke="#EDE4D1" stroke-width="{.7 if k==0 else .5}" opacity="{.85-k*.12}"/>'
    s+=f'<ellipse cx="{f(cx)}" cy="{f(cy)}" rx="{f(rx*.18)}" ry="{f(ry*.18)}" fill="#EDE4D1" opacity=".6"/>'
    return s
knots=[(-34,6,5,9),(46,-6,3.5,6),(24,56,3,5)]
xs=[]
x=-71
while x<71:
    xs.append(x);x+=3.1+random.random()*1.6
for x in xs:
    if abs(x+1)<2.2: continue
    pts=[];y=-80
    while y<=80:
        dx=math.sin(y*.03+x*.21)*1.7+math.sin(y*.11+x*1.3)*.45
        for (kx,ky,kr,kry) in knots:
            dy=y-ky;d=x-kx
            if abs(dy)<kry*2.6 and abs(d)<kr*3.2:
                push=(kr*2.4-abs(d))*max(0,1-abs(dy)/(kry*2.6))
                if push>0: dx+=math.copysign(push,d if d!=0 else 1)
        pts.append((x+dx,y));y+=6
    segs=[];cur=[]
    for pt in pts:
        cur.append(pt)
        if len(cur)>3 and random.random()<.12: segs.append(cur);cur=[pt] if random.random()<.5 else []
    if len(cur)>1: segs.append(cur)
    for sg in segs:
        d='M'+' L'.join(f'{f(px)} {f(py)}' for px,py in sg)
        w=.4+random.random()*.4
        g.append(f'<path d="{d}" stroke="#EDE4D1" stroke-width="{f(w)}" opacity="{f(.4+random.random()*.4)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')
A('<g clip-path="url(#wa-disc)">'+''.join(g)+''.join(knot(*k) for k in knots)+'</g>')
# plank seam (gap)
A('<path d="M-2.4 -72.5C-1 -36 -3.4 4 -1.6 72.5L1.6 72.5C0 4 2.4 -36 1 -72.5Z" fill="#0B0A08"/>')
A('<path d="M-2.4 -72.5C-1 -36 -3.4 4 -1.6 72.5M1 -72.5C2.4 -36 0 4 1.6 72.5" stroke="#EDE4D1" stroke-width=".9" fill="none"/>')
# battens
def batten(y0,y1,flip):
    xl0=-math.sqrt(72.5**2-y0**2)+2;xl1=-math.sqrt(72.5**2-y1**2)+2
    top,bot=(y0,y1) if not flip else (y1,y0)
    d=f'M{f(xl0)} {f(y0)}L{f(-xl0)} {f(y0)}L{f(-xl1)} {f(y1)}L{f(xl1)} {f(y1)}Z'
    s=f'<path d="{d}" fill="#0B0A08" stroke="#EDE4D1" stroke-width="1.6" stroke-linejoin="round"/>'
    # grain along batten
    for k in range(1,5):
        yy=y0+(y1-y0)*k/5
        s+=f'<path d="M{f(xl0+3)} {f(yy+random.uniform(-.4,.4))}C-20 {f(yy+1)} 20 {f(yy-1)} {f(-xl0-3)} {f(yy+random.uniform(-.4,.4))}" stroke="#EDE4D1" stroke-width=".45" opacity=".55" fill="none"/>'
    # shadow edge under batten
    ys=y1 if y1>y0 else y0
    sh=f'M{f(xl1)} {f(ys)}L{f(-xl1)} {f(ys)}L{f(-xl1+1)} {f(ys+3.4)}L{f(xl1-1)} {f(ys+3.4)}Z'
    s+=f'<path d="{sh}" fill="url(#wa-h1)" opacity=".9"/>'
    # pegs
    yc=(y0+y1)/2
    for px in (-48,-16,16,48):
        s+=f'<circle cx="{px}" cy="{f(yc)}" r="2.6" fill="#0B0A08" stroke="#EDE4D1" stroke-width=".9"/><circle cx="{px-.6}" cy="{f(yc-.6)}" r=".8" fill="#EDE4D1" opacity=".8"/>'
    return s
A(batten(-41,-29,False))
A(batten(29,41,False))
# hub
A('<rect x="-16" y="-16" width="32" height="32" rx="2" fill="none" stroke="#EDE4D1" stroke-width=".6" opacity=".5"/>')
A('<path d="M-11.5 -11.5H11.5V11.5H-11.5Z" fill="#0B0A08" stroke="#EDE4D1" stroke-width="1.8" stroke-linejoin="round"/>')
A('<path d="M-7 -7H7V7H-7Z" fill="#000" stroke="#EDE4D1" stroke-width=".7"/>')
A('<path d="M-11.5 -11.5L-7 -7M11.5 -11.5L7 -7M11.5 11.5L7 7M-11.5 11.5L-7 7" stroke="#EDE4D1" stroke-width=".7"/>')
A('<path d="M-7 7L7 7L11.5 11.5L-11.5 11.5Z" fill="url(#wa-h2)" opacity=".8"/><path d="M7 -7L11.5 -11.5L11.5 11.5L7 7Z" fill="url(#wa-h2)" opacity=".8"/>')
# cracks
A('<path d="M70 -22L63 -18L66 -12L60 -9" stroke="#EDE4D1" stroke-width=".7" fill="none"/><path d="M-69 40L-62 43L-64 49" stroke="#EDE4D1" stroke-width=".7" fill="none"/><path d="M12 -12L20 -20L23 -27" stroke="#EDE4D1" stroke-width=".5" fill="none" opacity=".7"/>')
# shading crescent (lower right)
A('<g clip-path="url(#wa-disc)"><path fill-rule="evenodd" d="M-90 -90H90V90H-90ZM-22 -100A88 88 0 1 1 -22 76A88 88 0 1 1 -22 -100Z" fill="url(#wa-h1)" opacity=".95"/><path fill-rule="evenodd" d="M-90 -90H90V90H-90ZM-12 -92A84 84 0 1 1 -12 76A84 84 0 1 1 -12 -92Z" fill="url(#wa-h2)" opacity=".8"/></g>')
# rim outlines
A(f'<circle r="{R}" fill="none" stroke="#EDE4D1" stroke-width="2.4"/><circle r="{r_in}" fill="none" stroke="#EDE4D1" stroke-width="1"/>')
# chips on rim
for a in (200,265,330,40,120):
    t=math.radians(a);cx,cy=math.cos(t)*R,math.sin(t)*R
    A(f'<path d="M{f(cx*1.0)} {f(cy*1.0)}L{f(cx*.955+2*math.sin(t))} {f(cy*.955-2*math.cos(t))}L{f(cx*.99+4*math.sin(t))} {f(cy*.99-4*math.cos(t))}" fill="#0B0A08" stroke="#EDE4D1" stroke-width=".7"/>')
# highlights upper-left
A('<path d="M-60 -48A76 76 0 0 1 -30 -70M-66 -36A76 76 0 0 1 -62 -44" stroke="#EDE4D1" stroke-width="2.2" fill="none" opacity=".9" stroke-linecap="round"/>')
# chalk X
A('<path d="M30 -60l14 14M44 -60L30 -46" stroke="#D6402F" stroke-width="3.4" stroke-linecap="round" fill="none"/>')
A('</g>')
open('wheel.svg.frag','w').write(''.join(out))
open('preview.svg','w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200" width="600" height="600" style="background:#0B0A08">'+''.join(out).replace('<g id="wheelArt">','<g>')+'</svg>')
print(len(''.join(out)))
