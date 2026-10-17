/* Пейзажи-гравюры: холмы, дорога, деревья, изба, мельница, верстовой столб. viewBox 0 0 W 900, горизонт на y=600 */
window.SCENERY=(function(){
let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
const f=n=>Math.round(n*10)/10;
let uid=0;
function wave(x0,x1,y,amp,step=40){let d=`M${x0} ${y}`;for(let x=x0+step;x<=x1;x+=step)d+=`L${x} ${f(y+(rnd()-.5)*amp)}`;return d}
function hill(x0,x1,base,top,cls,fill){const mid=(x0+x1)/2,w=x1-x0;const d=`M${x0} ${base}C${f(x0+w*.2)} ${f(top+ (base-top)*.4)} ${f(mid-w*.18)} ${top} ${f(mid)} ${top}S${f(x1-w*.2)} ${f(top+(base-top)*.45)} ${x1} ${base}`;
  return `<path class="${fill||''}" d="${d}Z" stroke="none"/><path class="hf" d="${d}Z" opacity="${cls||.35}" stroke="none"/><path d="${d}"/>`}
function cloud(x,y,s,c){let d=`M${x} ${y}`;let cx=x;const n=4+Math.floor(rnd()*3);for(let i=0;i<n;i++){const r=f(s*(.5+rnd()*.5));d+=`a${r} ${r} 0 0 1 ${f(r*1.6)} 0`;cx+=r*1.6}d+=`Z`;
  return `<path class="${c?'f-bone':'bg'}" d="${d}"/><path class="hf" d="M${x} ${y}H${f(cx)}V${f(y-s*.35)}H${x}Z" opacity=".5" stroke="none"/><path d="${d}"/>`}
function oak(x,y,h,c){const r=h*.38,cy=y-h*.66;let d='';const n=14;for(let i=0;i<=n;i++){const a=i/n*Math.PI*2-Math.PI/2,rr=r*(.88+rnd()*.2),px=x+Math.cos(a)*rr*1.12,py=cy+Math.sin(a)*rr*.92;
    if(!i)d=`M${f(px)} ${f(py)}`;else{const a2=a-Math.PI/n,qx=x+Math.cos(a2)*rr*1.35,qy=cy+Math.sin(a2)*rr*1.12;d+=`Q${f(qx)} ${f(qy)} ${f(px)} ${f(py)}`}}
  const id='cl'+(uid++);
  return `<path class="${c?'f-wood':'bg'}" d="M${f(x-h*.05)} ${y}C${f(x-h*.04)} ${f(y-h*.2)} ${f(x-h*.06)} ${f(y-h*.36)} ${f(x-h*.02)} ${f(y-h*.46)}L${f(x+h*.03)} ${f(y-h*.46)}C${f(x+h*.06)} ${f(y-h*.3)} ${f(x+h*.05)} ${f(y-h*.16)} ${f(x+h*.07)} ${y}Z"/>
   <clipPath id="${id}"><path d="${d}Z"/></clipPath><path class="${c?'f-moss':'bg'}" d="${d}Z"/><g clip-path="url(#${id})"><circle class="hf" cx="${f(x+r*.55)}" cy="${f(cy+r*.45)}" r="${f(r*1.05)}" opacity=".75" stroke="none"/></g><path d="${d}Z"/>`}
function poplar(x,y,h,c){const w=h*.13;const d=`M${f(x)} ${f(y-h)}C${f(x+w)} ${f(y-h*.75)} ${f(x+w*1.1)} ${f(y-h*.3)} ${f(x+w*.4)} ${f(y-h*.12)}L${f(x-w*.4)} ${f(y-h*.12)}C${f(x-w*1.1)} ${f(y-h*.3)} ${f(x-w)} ${f(y-h*.75)} ${f(x)} ${f(y-h)}Z`;
  return `<path class="${c?'f-moss2':'bg'}" d="${d}"/><path class="t" d="M${f(x)} ${f(y-h*.9)}V${y}"/><path d="${d}"/><path class="t" d="M${f(x+w*.3)} ${f(y-h*.7)}l${f(w*.4)} 6M${f(x+w*.4)} ${f(y-h*.5)}l${f(w*.5)} 6M${f(x-w*.3)} ${f(y-h*.6)}l${f(-w*.4)} 6M${f(x-w*.4)} ${f(y-h*.36)}l${f(-w*.5)} 6"/>`}
function bush(x,y,s,c){let d=`M${f(x-s)} ${y}`;let cx=x-s;while(cx<x+s){const r=s*(.25+rnd()*.2);d+=`a${f(r)} ${f(r)} 0 0 1 ${f(r*2)} 0`;cx+=r*2}d+='Z';return `<path class="${c?'f-moss':'bg'}" d="${d}"/><path class="hf" d="${d}" opacity=".4" stroke="none"/><path d="${d}"/>`}
function hut(x,y,s,c){const w=s,h=s*.6;return `<path class="${c?'f-wood2':'bg'}" d="M${x} ${y}V${f(y-h)}H${f(x+w)}V${y}Z"/><path class="t" d="M${x} ${f(y-h*.33)}H${f(x+w)}M${x} ${f(y-h*.66)}H${f(x+w)}"/><path d="M${x} ${y}V${f(y-h)}H${f(x+w)}V${y}Z"/>
  <path class="${c?'f-ochre':'bg'}" d="M${f(x-s*.12)} ${f(y-h)}L${f(x+w*.5)} ${f(y-h-s*.55)}L${f(x+w+s*.12)} ${f(y-h)}Z"/><path class="hf" d="M${f(x-s*.12)} ${f(y-h)}L${f(x+w*.5)} ${f(y-h-s*.55)}L${f(x+w+s*.12)} ${f(y-h)}Z" opacity=".6" stroke="none"/><path d="M${f(x-s*.12)} ${f(y-h)}L${f(x+w*.5)} ${f(y-h-s*.55)}L${f(x+w+s*.12)} ${f(y-h)}Z"/>
  <path class="${c?'f-dark':'bg'}" d="M${f(x+w*.38)} ${y}V${f(y-h*.6)}H${f(x+w*.62)}V${y}Z"/><path d="M${f(x+w*.38)} ${y}V${f(y-h*.6)}H${f(x+w*.62)}V${y}M${f(x+w*.72)} ${f(y-h*.7)}h${f(w*.18)}v${f(h*.22)}h${f(-w*.18)}Z"/>
  <path d="M${f(x+w*.72)} ${f(y-h-s*.2)}v${f(-s*.3)}h${f(s*.1)}v${f(s*.2)}"/><g class="smoke"><path class="t" d="M${f(x+w*.77)} ${f(y-h-s*.55)}c-10 -14 14 -22 0 -38s12 -22 4 -40"/><path class="t" d="M${f(x+w*.8)} ${f(y-h-s*.7)}c12 -12 -8 -22 6 -36"/></g>`}
function mill(x,y,s,c){const h=s;return `<path class="${c?'f-wood2':'bg'}" d="M${f(x-s*.18)} ${y}L${f(x-s*.1)} ${f(y-h*.7)}H${f(x+s*.1)}L${f(x+s*.18)} ${y}Z"/><path class="hf" d="M${f(x)} ${y}L${f(x)} ${f(y-h*.7)}H${f(x+s*.1)}L${f(x+s*.18)} ${y}Z" opacity=".55" stroke="none"/><path d="M${f(x-s*.18)} ${y}L${f(x-s*.1)} ${f(y-h*.7)}H${f(x+s*.1)}L${f(x+s*.18)} ${y}ZM${f(x-s*.14)} ${f(y-h*.7)}L${f(x)} ${f(y-h*.86)}L${f(x+s*.14)} ${f(y-h*.7)}"/>
  <g class="blades" style="transform-origin:${f(x)}px ${f(y-h*.78)}px"><path d="M${f(x)} ${f(y-h*.78)}l${f(s*.5)} ${f(-s*.5)}M${f(x)} ${f(y-h*.78)}l${f(-s*.5)} ${f(s*.5)}M${f(x)} ${f(y-h*.78)}l${f(s*.5)} ${f(s*.5)}M${f(x)} ${f(y-h*.78)}l${f(-s*.5)} ${f(-s*.5)}"/><path class="t" d="M${f(x+s*.15)} ${f(y-h*.78-s*.15)}l${f(s*.28)} ${f(-s*.28)}l${f(s*.08)} ${f(s*.08)}l${f(-s*.28)} ${f(s*.28)}M${f(x-s*.15)} ${f(y-h*.78+s*.15)}l${f(-s*.28)} ${f(s*.28)}l${f(-s*.08)} ${f(-s*.08)}l${f(s*.28)} ${f(-s*.28)}M${f(x+s*.15)} ${f(y-h*.78+s*.15)}l${f(s*.28)} ${f(s*.28)}l${f(-s*.08)} ${f(s*.08)}l${f(-s*.28)} ${f(-s*.28)}M${f(x-s*.15)} ${f(y-h*.78-s*.15)}l${f(-s*.28)} ${f(-s*.28)}l${f(s*.08)} ${f(-s*.08)}l${f(s*.28)} ${f(s*.28)}"/><circle cx="${f(x)}" cy="${f(y-h*.78)}" r="${f(s*.04)}"/></g>`}
function milestone(x,y,h,c){const w=h*.12;let s=`<path class="bg" d="M${f(x-w)} ${y}V${f(y-h)}H${f(x+w)}V${y}Z"/>`;for(let i=0;i<6;i++)s+=`<path class="fill" d="M${f(x-w)} ${f(y-h+i*h/6+h/12)}L${f(x+w)} ${f(y-h+i*h/6)}V${f(y-h+i*h/6+h/14)}L${f(x-w)} ${f(y-h+i*h/6+h/12+h/14)}Z" opacity=".9"/>`;
  return s+`<path d="M${f(x-w)} ${y}V${f(y-h)}H${f(x+w)}V${y}Z"/><path class="${c?'f-bone':'bg'}" d="M${f(x-w*1.6)} ${f(y-h-h*.02)}h${f(w*3.2)}v${f(-h*.16)}h${f(-w*3.2)}Z"/><path d="M${f(x-w*1.6)} ${f(y-h-h*.02)}h${f(w*3.2)}v${f(-h*.16)}h${f(-w*3.2)}Z"/>`}
function grass(x,y,s){return `<path class="t" d="M${f(x)} ${f(y)}l${f(s*.2)} ${f(-s)}l${f(s*.15)} ${f(s)}l${f(s*.25)} ${f(-s*.8)}l${f(s*.1)} ${f(s*.8)}l${f(s*.25)} ${f(-s*.6)}l${f(s*.05)} ${f(s*.6)}"/>`}
function stone(x,y,s,c){return `<path class="${c?'f-bone2':'bg'}" d="M${f(x-s)} ${f(y)}C${f(x-s)} ${f(y-s*.8)} ${f(x+s)} ${f(y-s*.9)} ${f(x+s)} ${f(y)}Z"/><path class="hf" d="M${f(x)} ${f(y)}C${f(x+s*.4)} ${f(y-s*.5)} ${f(x+s)} ${f(y-s*.5)} ${f(x+s)} ${f(y)}Z" opacity=".7" stroke="none"/><path d="M${f(x-s)} ${f(y)}C${f(x-s)} ${f(y-s*.8)} ${f(x+s)} ${f(y-s*.9)} ${f(x+s)} ${f(y)}Z"/>`}
function birds(x,y,n){let s='';for(let i=0;i<n;i++){const bx=x+rnd()*160,by=y+rnd()*60,k=6+rnd()*6;s+=`<path class="t bird" d="M${f(bx)} ${f(by)}q${f(k*.5)} ${f(-k*.6)} ${f(k)} 0q${f(k*.5)} ${f(-k*.6)} ${f(k)} 0"/>`}return s}
function sun(x,y,r,c){let s=`<circle class="${c?'f-ochre':'bg'}" cx="${x}" cy="${y}" r="${r}"/><circle cx="${x}" cy="${y}" r="${r}"/>`;for(let i=0;i<16;i++){const a=i/16*Math.PI*2;s+=`<path class="t" d="M${f(x+Math.cos(a)*r*1.3)} ${f(y+Math.sin(a)*r*1.3)}L${f(x+Math.cos(a)*r*(i%2?1.6:1.9))} ${f(y+Math.sin(a)*r*(i%2?1.6:1.9))}"/>`}return s}
function road(cx,hz,bottom,wTop,wBot,c){const d=`M${cx-wTop} ${hz}L${cx-wBot} ${bottom}H${cx+wBot}L${cx+wTop} ${hz}Z`;let s=`<path class="${c?'f-road':'bg'}" d="${d}" stroke="none"/><path class="dot" d="${d}" opacity=".25" stroke="none"/><path d="M${cx-wTop} ${hz}L${cx-wBot} ${bottom}M${cx+wTop} ${hz}L${cx+wBot} ${bottom}"/>`;
  s+=`<path class="t" d="M${cx-wTop*.45} ${hz}L${f(cx-wBot*.45)} ${bottom}M${cx+wTop*.45} ${hz}L${f(cx+wBot*.45)} ${bottom}" stroke-dasharray="2 9"/>`;
  for(let i=0;i<26;i++){const t=Math.pow(rnd(),1.4),y=hz+(bottom-hz)*t,half=wTop+(wBot-wTop)*t,x=cx+(rnd()*2-1)*half*.9;s+=`<ellipse class="t" cx="${f(x)}" cy="${f(y)}" rx="${f(1+t*5)}" ry="${f(.6+t*2.5)}"/>`}return s}
function fence(cx,hz,bottom,side,c){let s='',prev=null;for(let i=0;i<9;i++){const t=Math.pow((i+1)/9,1.7),y=hz+(bottom-hz)*t,x=cx+side*(80+620*t),h=8+t*90;
    s+=`<path class="${c?'f-wood':'bg'}" d="M${f(x-2-t*4)} ${f(y)}V${f(y-h)}H${f(x+2+t*4)}V${f(y)}Z"/><path d="M${f(x-2-t*4)} ${f(y)}V${f(y-h)}H${f(x+2+t*4)}V${f(y)}Z"/>`;
    if(prev)s+=`<path class="t" d="M${f(prev[0])} ${f(prev[1]-prev[2]*.75)}L${f(x)} ${f(y-h*.75)}M${f(prev[0])} ${f(prev[1]-prev[2]*.4)}L${f(x)} ${f(y-h*.4)}"/>`;prev=[x,y,h]}return s}
function forest(x0,x1,y,c){let d=`M${x0} ${y}`;let x=x0;while(x<x1){const r=6+rnd()*10;d+=`a${f(r)} ${f(r*1.4)} 0 0 1 ${f(r*2)} 0`;x+=r*2}return `<path class="${c?'f-moss':'bg'}" d="${d}Z"/><path class="hx" d="${d}Z" opacity=".5" stroke="none"/><path class="t" d="${d}"/>`}
function hay(x,y,s,c){const d=`M${f(x-s)} ${y}C${f(x-s)} ${f(y-s*1.2)} ${f(x-s*.3)} ${f(y-s*1.7)} ${x} ${f(y-s*1.7)}C${f(x+s*.3)} ${f(y-s*1.7)} ${f(x+s)} ${f(y-s*1.2)} ${f(x+s)} ${y}Z`;return `<path class="${c?'f-ochre':'bg'}" d="${d}"/><path class="hf" d="${d}" opacity=".5" stroke="none"/><path d="${d}"/><path class="t" d="M${x} ${f(y-s*1.7)}v${f(-s*.3)}"/>`}
function house(x,y,w,h,c,fl=2){let s=`<path class="${c?(rnd()<.5?'f-clay':'f-bone2'):'bg'}" d="M${x} ${y}V${f(y-h)}H${f(x+w)}V${y}Z"/><path d="M${x} ${y}V${f(y-h)}H${f(x+w)}V${y}Z"/><path class="${c?'f-dark':'bg'}" d="M${f(x-4)} ${f(y-h)}L${f(x+w/2)} ${f(y-h-w*.35)}L${f(x+w+4)} ${f(y-h)}Z"/><path d="M${f(x-4)} ${f(y-h)}L${f(x+w/2)} ${f(y-h-w*.35)}L${f(x+w+4)} ${f(y-h)}Z"/>`;
  for(let r=0;r<fl;r++)for(let k=0;k<3;k++){const wx=x+w*(.12+k*.3),wy=y-h+h*(.12+r*(.8/fl));s+=`<path class="${c?'f-gold':'bg'}" d="M${f(wx)} ${f(wy)}h${f(w*.16)}v${f(h*.22/fl*1.6)}h${f(-w*.16)}Z" opacity=".9"/><path class="t" d="M${f(wx)} ${f(wy)}h${f(w*.16)}v${f(h*.22/fl*1.6)}h${f(-w*.16)}Z"/>`}return s}

function hero(c){seed=11;let s='';
  s+=hill(-40,640,600,480,.25,c?'f-teal':'')+hill(940,1700,600,470,.25,c?'f-teal':'');
  s+=`<path class="ns" d="${wave(-20,1620,600,3)}" stroke-width="2.2"/>`;
  s+=road(800,600,900,18,520,c)+oak(250,720,300,c);
  for(let i=0;i<14;i++){const x=rnd()*1600,y=620+rnd()*260;if(Math.abs(x-800)<(y-600)*1.7+20)continue;s+=grass(x,y,6+((y-600)/300)*14)}
  return s}
function later(c){seed=23;let s='';s+=hill(-60,700,640,470,.22,'')+hill(900,1700,640,480,.22,'');
  s+=`<path class="ns" d="${wave(-20,1620,640,3)}" stroke-width="2"/>`;return s}
function lab(c){seed=37;let s='';s+=hill(-60,600,620,480,.3,c?'f-teal':'')+hill(900,1700,620,430,.3,c?'f-teal':'')+forest(560,900,620,c)+hut(1180,560,110,c)+oak(220,640,220,c)+poplar(1450,620,180,c)+cloud(420,200,28,c)+birds(980,160,4);
  s+=`<path class="ns" d="${wave(-20,1620,620,3)}" stroke-width="2"/>`;return s}
function parade(c,W){seed=51;let s='';const X=W||4800;
  s+=hill(-60,1300,600,420,.3,c?'f-teal':'')+hill(900,2600,600,380,.3,c?'f-teal':'')+hill(2300,3800,600,440,.3,c?'f-teal':'')+hill(3500,4900,600,470,.3,c?'f-teal':'');
  
  s+=oak(1200,612,220,c)+hut(2100,600,100,c);
  /* античность: колонны */
  for(let i=0;i<5;i++){const x=2500+i*70;s+=`<path class="${c?'f-bone2':'bg'}" d="M${x} 600V470h26V600Z"/><path d="M${x} 600V470h26V600ZM${x-6} 470h38M${x-6} 462h38"/><path class="t" d="M${x+8} 476V596M${x+17} 476V596"/>`}
  s+=`<path class="${c?'f-bone2':'bg'}" d="M2486 462L2700 410L2914 462Z"/><path d="M2486 462L2700 410L2914 462Z"/>`;
  /* город */
  let x=3300;while(x<X-80){const w=90+rnd()*80,h=120+rnd()*140;s+=house(x,600,w,h,c,h>200?3:2);x+=w+20+rnd()*30}
  s+=`<path class="ns" d="${wave(-20,X+20,600,2,60)}" stroke-width="2"/>`;return s}
function day(c){seed=61;let s='';s+=hill(-60,700,600,490,.2,'')+hill(800,1700,600,470,.2,'')+hut(1250,600,110,c);
  s+=`<path class="ns" d="${wave(-20,1620,600,2)}" stroke-width="2"/>`;return s}
function nag(c){seed=71;let s='';
  s+=`<path class="${c?'f-indigo':'bg'}" d="M0 0H1600V640H0Z" stroke="none" opacity=".6"/>`;
  for(let i=0;i<7;i++){const x=800-115-22+(i-3)*230;s+=`<path class="${c?'f-bone2':'bg'}" d="M${x} 640V250h44V640Z"/><path class="hf" d="M${x+26} 640V250h18V640Z" opacity=".6" stroke="none"/><path d="M${x} 640V250h44V640ZM${x-12} 250h68v-16h-68ZM${x-10} 640h64v12h-64Z"/>`;
    if(i<6&&i!==3)s+=`<path d="M${x+44} 330C${x+80} 250 ${x+190} 250 ${x+230} 330" />`}
  
  s+=`<path class="ns" d="M0 640H1600" stroke-width="2"/>`;
  return s}
const K={hero,later,lab,parade,day,nag};
return function(kind,color,W){return (K[kind]||hero)(color,W)}})();
