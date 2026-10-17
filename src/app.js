/* «Далеко собрались?» v10 — движок сцен, колесо-проводник с морфингом, разрывы, повозки, звук */
(function(){
const $=id=>document.getElementById(id),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const html=document.documentElement;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp01=x=>x<0?0:x>1?1:x,lerp=(a,b,t)=>a+(b-a)*t;
const sm=(a,b,x)=>{const t=clamp01((x-a)/(b-a));return t*t*(3-2*t)};
let W=innerWidth,H=innerHeight;
const G={userDeg:0,snap:false,fast:false};

/* ══ ЗВУК: всё синтезируется на месте, без файлов ══ */
const SND={on:true,ctx:null,last:{},
  init(){if(this.ctx)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=this.ctx=new C();
    const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=6500;const comp=c.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=3;
    this.out=c.createGain();this.out.gain.value=.3;this.out.connect(lp);lp.connect(comp);comp.connect(c.destination);
    const len=c.sampleRate*1.8,ir=c.createBuffer(2,len,c.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2)}
    const cv=c.createConvolver();cv.buffer=ir;this.rev=c.createGain();this.rev.gain.value=.12;this.rev.connect(cv);cv.connect(lp);
    const b=this.noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const ks=(f,dur,damp,soft)=>{const sr=c.sampleRate,N=Math.round(sr/f),L=Math.round(sr*dur),buf=c.createBuffer(1,L,sr),y=buf.getChannelData(0);let prev=0;for(let i=0;i<N;i++){const r=Math.random()*2-1;prev=prev*soft+r*(1-soft);y[i]=prev}
      for(let i=N;i<L;i++)y[i]=damp*.5*(y[i-N]+y[i-N-1]);let m=0;for(let i=0;i<L;i++)m=Math.max(m,Math.abs(y[i]));for(let i=0;i<L;i++)y[i]/=m||1;return buf};
    this.KS={wood:ks(330,.35,.93,.55),thump:ks(110,.5,.975,.75),pluck:ks(220,2.2,.997,.45),tick:ks(1200,.08,.9,.3)}}catch(e){this.ctx=null}},
  ksPlay(name,t,rate=1,v=.5,lp=4000){const c=this.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.KS[name];s.playbackRate.value=rate*(1+(Math.random()-.5)*.03);f.type='lowpass';f.frequency.value=lp;g.gain.value=v;s.connect(f);f.connect(g);this.send(g);s.start(t)},
  send(node){node.connect(this.out);node.connect(this.rev)},
  mallet(f,t,v=1,dur=.45,bright=.12){const c=this.ctx,g=c.createGain();this.send(g);g.gain.value=v;
    const o=c.createOscillator(),og=c.createGain();o.type='sine';o.frequency.value=f;og.gain.setValueAtTime(.0001,t);og.gain.exponentialRampToValueAtTime(.32,t+.004);og.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(og);og.connect(g);o.start(t);o.stop(t+dur+.05);
    const o2=c.createOscillator(),g2=c.createGain();o2.type='sine';o2.frequency.value=f*3.98;g2.gain.setValueAtTime(.0001,t);g2.gain.exponentialRampToValueAtTime(bright,t+.002);g2.gain.exponentialRampToValueAtTime(.0001,t+dur*.18);o2.connect(g2);g2.connect(g);o2.start(t);o2.stop(t+dur*.2+.05)},
  soft(f,t,v,dur,f2,type='sine'){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur*.8);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);this.send(g);o.start(t);o.stop(t+dur+.05)},
  air(t,dur,v,f0,f1,q=.8){const c=this.ctx,s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=this.noise;s.loop=true;fl.type='bandpass';fl.Q.value=q;fl.frequency.setValueAtTime(f0,t);fl.frequency.exponentialRampToValueAtTime(f1,t+dur);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+dur*.35);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl);fl.connect(g);this.send(g);s.start(t,Math.random());s.stop(t+dur+.05)},
  note:0,
  ok(name,gap=0){if(!this.on||!this.ctx||this.ctx.state!=='running')return false;const n=performance.now();if(gap&&this.last[name]&&n-this.last[name]<gap)return false;this.last[name]=n;return true},
  env(g,t,a,peak,dec){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+dec)},
  osc(type,f,t,dur,peak,f2,dest){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);this.env(g,t,.005,peak,dur);o.connect(g);g.connect(dest||this.out);o.start(t);o.stop(t+dur+.05);return o},
  nz(t,dur,peak,ftype,f,q,dest){const c=this.ctx,s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=this.noise;s.loop=true;fl.type=ftype;fl.frequency.value=f;fl.Q.value=q||1;this.env(g,t,.004,peak,dur);s.connect(fl);fl.connect(g);g.connect(dest||this.out);s.start(t,Math.random());s.stop(t+dur+.05);return {s,fl,g}},
  play(name,v=1){if(!this.ok(name,name==='scribble'?55:name==='plank'?35:120))return;const c=this.ctx,t=c.currentTime;const F=this.fx[name];if(F)F.call(this,t,v)},
  proj:null,
  projector(on){if(!this.ctx||this.ctx.state!=='running'||!this.on)on=false;
    if(on&&!this.proj){const c=this.ctx,g=c.createGain();g.gain.value=0;g.connect(this.out);g.gain.linearRampToValueAtTime(1,c.currentTime+.3);
      const hum=c.createOscillator(),hf=c.createBiquadFilter(),hg=c.createGain();hum.type='sawtooth';hum.frequency.value=47;hf.type='lowpass';hf.frequency.value=180;hg.gain.value=.006;hum.connect(hf);hf.connect(hg);hg.connect(g);hum.start();
      let next=c.currentTime+.05;const tick=()=>{while(next<c.currentTime+.3){this.osc('sine',1800+Math.random()*200,next,.006,.006,null,g);next+=1/18}};tick();
      this.proj={g,hum,iv:setInterval(tick,120)}}
    else if(!on&&this.proj){const P=this.proj,c=this.ctx;this.proj=null;clearInterval(P.iv);P.g.gain.linearRampToValueAtTime(0,c.currentTime+.25);setTimeout(()=>{try{P.hum.stop()}catch(e){}},400)}},
  fx:{
    wood(t,v){this.ksPlay('wood',t,1.4,.32*v,3200)},
    knock(t,v){this.ksPlay('wood',t,1,.36*v,2400)},
    click(t,v){this.ksPlay('wood',t,1.8,.24*v,3600)},
    plank(t,v){v=Math.max(.3,Math.min(1,v));this.ksPlay('thump',t,.9+Math.random()*.25,.32*v,900);this.ksPlay('wood',t+.004,.7+Math.random()*.2,.1*v,1400);if(Math.random()<.6)this.air(t,.08,.012*v,2600,1800,1.5)},
    roll(t){for(let i=0;i<5;i++)this.fx.plank.call(this,t+i*.16+Math.random()*.03,.8-i*.12)},
    steps(t){for(let i=0;i<6;i++)this.ksPlay('thump',t+i*.18,.75+Math.random()*.15,.18,500)},
    scribble(t){this.air(t,.05+Math.random()*.04,.012,3400+Math.random()*1200,2600,2.5)},
    tear(t){this.air(t,.45,.05,700,3600,.6);for(let i=0;i<8;i++)this.air(t+i*.05,.035,.018,2800+Math.random()*2000,2200,2)},
    moo(t){const c=this.ctx,o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain(),v=c.createOscillator(),vg=c.createGain();
      o.type='sawtooth';o.frequency.setValueAtTime(120,t);o.frequency.linearRampToValueAtTime(138,t+.3);o.frequency.linearRampToValueAtTime(98,t+1.05);v.frequency.value=5;vg.gain.value=2.5;v.connect(vg);vg.connect(o.frequency);
      f.type='lowpass';f.frequency.setValueAtTime(380,t);f.frequency.linearRampToValueAtTime(820,t+.35);f.frequency.linearRampToValueAtTime(360,t+1.05);f.Q.value=5;
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.13,t+.18);g.gain.setValueAtTime(.12,t+.8);g.gain.exponentialRampToValueAtTime(.0001,t+1.15);o.connect(f);f.connect(g);this.send(g);[o,v].forEach(x=>{x.start(t);x.stop(t+1.2)})},
    clop(t){for(let i=0;i<8;i++)this.ksPlay('wood',t+i*.14+(i%2?.04:0),i%2?1.6:2,.18,3000)},
    klaxon(t){[[0,330],[.26,262]].forEach(([d,f])=>{this.soft(f*.5,t+d,.06,.22,f*.55,'triangle');this.soft(f,t+d,.035,.22,f*1.06,'triangle')})},
    piano(t){[[659,0],[587,.2]].forEach(([f,d])=>this.ksPlay('pluck',t+d,f/220,.22,3000));[220,330,440,523].forEach((f,i)=>this.ksPlay('pluck',t+.42+i*.02,f/220,.16,2600))},
    squeak(t){this.soft(900,t,.025,.14,1300);this.soft(1000,t+.18,.02,.14,1500)},
    whoosh(t){this.air(t,.32,.035,300,2000,.7)},
    bubble(t){this.soft(260,t,.07,.14,720);this.soft(360,t+.15,.05,.12,900)},
    gong(t){[[147,.1,3.4],[220,.06,2.8],[294,.04,2.2]].forEach(([f,a,d])=>this.soft(f,t,a,d));this.ksPlay('pluck',t,147/220,.12,1800)},
    rewind(t){for(let i=0;i<18;i++)this.ksPlay('tick',t+i*.09,.9+(i%3)*.1,.08,3000);this.air(t,1.6,.02,3000,400,.5)}
  }
};
const play=(n,v)=>SND.play(n,v);
function gesture(){SND.init();if(SND.ctx&&SND.ctx.state==='suspended')SND.ctx.resume()}
addEventListener('pointerdown',gesture,{passive:true});addEventListener('keydown',gesture);
const sbtn=$('sndBtn');
if(sbtn){const sync=()=>{sbtn.setAttribute('aria-pressed',SND.on);sbtn.querySelector('.st-l').textContent=SND.on?'звук вкл':'звук выкл'};
  try{if(localStorage.getItem('koleso-snd')==='0')SND.on=false}catch(e){}sync();
  sbtn.addEventListener('click',()=>{gesture();SND.on=!SND.on;try{localStorage.setItem('koleso-snd',SND.on?'1':'0')}catch(e){}sync();if(SND.on)setTimeout(()=>play('click'),30)})}
document.addEventListener('click',e=>{const b=e.target.closest('button,a');if(b&&b!==sbtn&&!b.classList.contains('part')&&!b.classList.contains('o-opt'))play('click')});

/* ══ ФИГУРЫ: одно колесо, которое перетекает в другие ══ */
const C=(r,x=0,y=0)=>`M${x} ${y-r}A${r} ${r} 0 1 1 ${x} ${y+r}A${r} ${r} 0 1 1 ${x} ${y-r}Z`;
const L=(a,b,c,d)=>`M${a} ${b}L${c} ${d}`;
const R=(x,y,w,h)=>`M${x} ${y}H${x+w}V${y+h}H${x}Z`;
const RR=(x,y,w,h,r)=>`M${x+r} ${y}H${x+w-r}A${r} ${r} 0 0 1 ${x+w} ${y+r}V${y+h-r}A${r} ${r} 0 0 1 ${x+w-r} ${y+h}H${x+r}A${r} ${r} 0 0 1 ${x} ${y+h-r}V${y+r}A${r} ${r} 0 0 1 ${x+r} ${y}Z`;
const spokes=(n,r1,r2,o=0)=>Array.from({length:n},(_,i)=>{const a=o+i/n*Math.PI*2,s=Math.sin(a),c=-Math.cos(a);return L(+(s*r1).toFixed(1),+(c*r1).toFixed(1),+(s*r2).toFixed(1),+(c*r2).toFixed(1))});
const GEAR='M56.8 -11.8 L69.6 -7.7 L69.6 7.7 L56.8 11.8 L55.1 18.2 L64.1 28.1 L56.4 41.4 L43.3 38.6 L38.6 43.3 L41.4 56.4 L28.1 64.1 L18.2 55.1 L11.8 56.8 L7.7 69.6 L-7.7 69.6 L-11.8 56.8 L-18.2 55.1 L-28.1 64.1 L-41.4 56.4 L-38.6 43.3 L-43.3 38.6 L-56.4 41.4 L-64.1 28.1 L-55.1 18.2 L-56.8 11.8 L-69.6 7.7 L-69.6 -7.7 L-56.8 -11.8 L-55.1 -18.2 L-64.1 -28.1 L-56.4 -41.4 L-43.3 -38.6 L-38.6 -43.3 L-41.4 -56.4 L-28.1 -64.1 L-18.2 -55.1 L-11.8 -56.8 L-7.7 -69.6 L7.7 -69.6 L11.8 -56.8 L18.2 -55.1 L28.1 -64.1 L41.4 -56.4 L38.6 -43.3 L43.3 -38.6 L56.4 -41.4 L64.1 -28.1 L55.1 -18.2Z';
const FIG={
  wheel:[C(80),C(74),'M-1 -74C2 -36 -3 4 1 74','~M4 -73C7 -36 2 4 5 73','M-60 -41L60 -41L64 -28L-64 -28Z','M-64 28L64 28L60 41L-60 41Z',R(-11,-11,22,22),'~M-7 -7H7V7H-7Z','~M-11 -11L-7 -7','~M11 -11L7 -7','~M11 11L7 7','~M-11 11L-7 7',C(2.6,-50,-34),C(2.6,50,-34),C(2.6,-50,34),C(2.6,50,34),'~'+C(7,-31,4),'~'+C(3,-31,4),'~M-40 -20C-42 -6 -42 12 -40 20','~M-22 -20C-20 -6 -21 12 -23 20','~M74 -20L66 -15L70 -8','~M-70 44L-62 47L-64 53','~M-57.3 -23.0C-57.3 -17.4 -57.3 -14.6 -57.3 -9.0C-57.3 -3.4 -58.4 -0.6 -58.4 5.0C-58.4 10.6 -58.9 13.4 -58.9 19.0','~M-46.2 -51.8C-46.2 -50.9 -46.9 -50.4 -46.9 -49.5C-46.9 -48.6 -46.3 -48.2 -46.3 -47.3C-46.3 -46.4 -45.3 -45.9 -45.3 -45.0','~M-46.2 11.0C-46.2 12.6 -46.9 13.4 -46.9 15.0C-46.9 16.6 -46.3 17.4 -46.3 19.0C-46.3 20.6 -45.3 21.4 -45.3 23.0','~M-46.2 45.0C-46.2 45.9 -46.9 46.4 -46.9 47.3C-46.9 48.2 -46.3 48.6 -46.3 49.5C-46.3 50.4 -45.3 50.9 -45.3 51.8','~M-19.3 -66.1C-19.3 -63.3 -20.4 -61.9 -20.4 -59.1C-20.4 -56.2 -20.9 -54.8 -20.9 -52.0C-20.9 -49.2 -20.1 -47.8 -20.1 -45.0','~M-19.3 -23.0C-19.3 -21.9 -20.4 -21.4 -20.4 -20.3C-20.4 -19.3 -20.9 -18.7 -20.9 -17.7C-20.9 -16.6 -20.1 -16.1 -20.1 -15.0','~M-19.3 45.0C-19.3 47.8 -20.4 49.2 -20.4 52.0C-20.4 54.8 -20.9 56.2 -20.9 59.1C-20.9 61.9 -20.1 63.3 -20.1 66.1','~M21.1 -65.5C21.1 -62.7 21.5 -61.4 21.5 -58.6C21.5 -55.9 22.6 -54.5 22.6 -51.8C22.6 -49.1 22.8 -47.7 22.8 -45.0','~M21.1 15.0C21.1 16.1 21.5 16.6 21.5 17.7C21.5 18.7 22.6 19.3 22.6 20.3C22.6 21.4 22.8 21.9 22.8 23.0','~M21.1 45.0C21.1 47.7 21.5 49.0 21.5 51.7C21.5 54.3 22.6 55.7 22.6 58.3C22.6 61.0 22.8 62.3 22.8 65.0','~M38.9 -57.8C38.9 -56.1 38.5 -55.2 38.5 -53.5C38.5 -51.8 37.4 -51.0 37.4 -49.3C37.4 -47.6 37.2 -46.7 37.2 -45.0','~M38.9 -23.0C38.9 -18.7 38.5 -16.6 38.5 -12.3C38.5 -8.1 37.4 -5.9 37.4 -1.7C37.4 2.6 37.2 4.7 37.2 9.0','~M38.9 45.0C38.9 46.7 38.5 47.6 38.5 49.3C38.5 51.0 37.4 51.8 37.4 53.5C37.4 55.2 37.2 56.1 37.2 57.8','~M55.1 -23.0C55.1 -16.9 55.9 -13.8 55.9 -7.7C55.9 -1.5 56.8 1.5 56.8 7.7C56.8 13.8 56.5 16.9 56.5 23.0'],
  potter:[C(80),C(64),C(46),C(28),C(8)],
  spoked:[C(80),C(70),C(14),...spokes(6,14,70)],
  pill:[RR(-72,-32,144,64,32),RR(-72,-32,144,64,32).replace(/^/,''),L(0,-32,0,32)],
  steer:[C(80),C(66),C(18),L(-18,0,-66,0),L(18,0,66,0),L(0,18,0,66)],
  ferris:[C(74),C(66),C(8),...spokes(8,8,66),L(-6,8,-40,96),L(6,8,40,96),L(-52,96,52,96)],
  bus:[C(80),C(62),C(36),C(9),C(5,0,-22),C(5,21,-7),C(5,13,18),C(5,-13,18),C(5,-21,-7)],
  mouse:[RR(-46,-80,92,160,46),RR(-40,-74,80,148,40),L(0,-80,0,-22),L(-46,-22,46,-22),RR(-6,-64,12,28,6)],
  gear:[GEAR,C(30),C(8)],
  dharma:[C(80),C(70),C(14),...spokes(8,14,70),C(5,0,-80),C(5,80,0),C(5,0,80),C(5,-80,0)]
};
FIG.pill[1]=RR(-64,-24,128,48,24);
const FROT={pill:-32};
const NP=72,tmp=document.createElementNS('http://www.w3.org/2000/svg','path');
const hid=document.createElementNS('http://www.w3.org/2000/svg','svg');hid.setAttribute('width',0);hid.setAttribute('height',0);hid.style.position='absolute';hid.appendChild(tmp);document.body.appendChild(hid);
const SAMP={};
function sampleFig(name){const rot=(FROT[name]||0)*Math.PI/180,cs=Math.cos(rot),sn=Math.sin(rot);
  return FIG[name].map(d0=>{const thin=d0[0]==='~',d=thin?d0.slice(1):d0;tmp.setAttribute('d',d);const len=tmp.getTotalLength(),closed=/z\s*$/i.test(d),n=NP,pts=new Float32Array(n*2);let cx=0,cy=0;
    for(let i=0;i<n;i++){const q=tmp.getPointAtLength(len*i/(closed?n:n-1)),x=q.x*cs-q.y*sn,y=q.x*sn+q.y*cs;pts[i*2]=x;pts[i*2+1]=y;cx+=x;cy+=y}
    return {pts,closed,thin,cx:cx/n,cy:cy/n}})}
for(const k in FIG)SAMP[k]=sampleFig(k);
const PAIR={};
function pairOf(a,b){const key=a+'>'+b;if(PAIR[key])return PAIR[key];const A=SAMP[a],B=SAMP[b],n=Math.max(A.length,B.length),out=[];
  for(let k=0;k<n;k++){let sa=A[k],sb=B[k];
    if(!sa){sa={pts:new Float32Array(NP*2).map((_,i)=>i%2?sb.cy:sb.cx),closed:sb.closed}}
    if(!sb){sb={pts:new Float32Array(NP*2).map((_,i)=>i%2?sa.cy:sa.cx),closed:sa.closed}}
    let pb=sb.pts;
    if(sa.closed&&sb.closed){let best=0,bd=1e18;for(let o=0;o<NP;o+=2){let d=0;for(let i=0;i<NP;i+=3){const j=(i+o)%NP;d+=(sa.pts[i*2]-pb[j*2])**2+(sa.pts[i*2+1]-pb[j*2+1])**2}if(d<bd){bd=d;best=o}}
      if(best){const r=new Float32Array(NP*2);for(let i=0;i<NP;i++){const j=(i+best)%NP;r[i*2]=pb[j*2];r[i*2+1]=pb[j*2+1]}pb=r}}
    out.push({a:sa.pts,b:pb,closed:sa.closed&&sb.closed||(!A[k]?sb.closed:!B[k]?sa.closed:false),ca:!A[k],cb:!B[k],thin:(B[k]||A[k]).thin})}
  return PAIR[key]=out}
function morphD(a,b,t,only,sel){const P=pairOf(a,b);let d='';const n=only?Math.min(only,P.length):P.length;
  for(let k=0;k<n;k++){const s=P[k];if((s.cb&&t>.92)||(s.ca&&t<.08))continue;if(sel!==undefined&&!!s.thin!==sel)continue;let seg='';for(let i=0;i<NP;i++){const x=s.a[i*2]+(s.b[i*2]-s.a[i*2])*t,y=s.a[i*2+1]+(s.b[i*2+1]-s.a[i*2+1])*t;seg+=(i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)}d+=seg+(s.closed?'Z':'')}
  return d}
/* статичные фигуры в разметке */
$$('[data-fig]').forEach(g=>{const f=g.dataset.fig,r=FROT[f]||0;if(f==='wheel'){g.innerHTML='<use href="#wheelArt"/>';return}g.innerHTML=(r?`<g transform="rotate(${r})">`:'')+FIG[f].map(d=>d[0]==='~'?`<path class="t" d="${d.slice(1)}"/>`:`<path d="${d}"/>`).join('')+(r?'</g>':'')});
/* заготовки рисунков: <use href="#tX"> → настоящая копия, чтобы ноги и колёса двигались */
$$('use').forEach(u=>{const id=(u.getAttribute('href')||'').slice(1);const t=document.getElementById(id);if(!t||!/^t[A-Z]/.test(id))return;const g=t.cloneNode(true);g.removeAttribute('id');g.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));u.replaceWith(g)});

/* ══ ПЕЙЗАЖИ ══ */
const SCN=$$('.scenery').map(el=>{const kind=el.dataset.kind,color=el.dataset.color==='1',wide=+el.dataset.wide||1,vw=1600*wide,hy=+el.dataset.hy||600;
  el.innerHTML=`<svg class="ill boil" viewBox="0 0 ${vw} 900" aria-hidden="true">${window.SCENERY?window.SCENERY(kind,color,vw):''}</svg>`;
  return {el,svg:el.firstChild,kind,wide,vw,hy,hz:el.dataset.hz?+el.dataset.hz:null,anchor:el.dataset.anchor||null,w:0,shift:0}});
function layScenery(){for(const s of SCN){const host=s.el.parentElement,hr=host.getBoundingClientRect(),Wh=hr.width||W,Hh=hr.height||H;let hz;
    if(s.anchor){const [id,fr]=s.anchor.split(':'),a=$(id);if(a){const r=a.getBoundingClientRect();hz=r.top-hr.top+r.height*(+fr)}}
    if(hz===undefined)hz=s.kind==='hero'?hzY():(s.kind==='day'&&Wh<=900?.985:(s.hz||.68))*Hh;
    const k=s.vw/900,w=Math.max(Wh*s.wide,hz*s.vw/s.hy,(Hh-hz)*s.vw/(900-s.hy)+1),h=w*900/s.vw;
    s.svg.style.width=w+'px';s.svg.style.height=h+'px';s.svg.style.top=(hz-w*s.hy/s.vw)+'px';s.w=w;s.Wh=Wh;s.svg.style.left=(s.wide>1?0:(Wh-w)/2)+'px'}}
$$('.stick').forEach(st=>{if(!st.querySelector(':scope>.flick')){st.insertAdjacentHTML('beforeend','<div class="flick" aria-hidden="true"></div><div class="scratch" aria-hidden="true"><i></i><i></i><i></i></div>')}});
/* ══ ДВИЖОК СЦЕН ══ */
const SC={},LIST=[];
function prepType(e){const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();for(const ch of c.textContent){const s=document.createElement('span');s.className='ch';s.textContent=ch;f.appendChild(s)}c.replaceWith(f)}else if(c.nodeType===1&&!c.classList.contains('type'))walk(c)})};walk(e);return $$('.ch',e).filter(s=>s.closest('.type')===e)}
function parseK(e){const v=e.dataset.k.split(',').map(Number);return {e,a:v[0],b:v[1],c:v[2],d:v[3],last:-1,type:e.classList.contains('type')?prepType(e):null,nOn:0,snd:e.dataset.snd}}
function scene(id,fn){const el=$(id);if(!el)return null;const s={id,el,fn,p:0,sp:0,ks:$$('[data-k]',el).map(parseK),vis:false};SC[id]=s;LIST.push(s);return s}
function applyK(s,p){for(const k of s.ks){const inn=sm(k.a,k.b,p),out=isNaN(k.c)?1:1-sm(k.c,k.d,p),v=k.type?out:inn*out;
  if(Math.abs(v-k.last)>.002||(v!==k.last&&(v===0||v===1))){k.e.style.setProperty('--k',v.toFixed(3));if(k.snd&&k.last<.5&&v>=.5&&s.vis)play(k.snd);k.last=v}
  if(k.type){const n=Math.round(inn*k.type.length);if(n!==k.nOn){const up=n>k.nOn;for(let i=Math.min(n,k.nOn);i<Math.max(n,k.nOn);i++)k.type[i].classList.toggle('on',up);if(up)play('scribble');k.nOn=n}}}}
const secP=el=>{const r=el.getBoundingClientRect();return clamp01(-r.top/Math.max(1,r.height-H))};

/* ══ РАЗРЫВ ИНТЕРТИТРА ══ */
const RIPS=[];
$$('.rip').forEach((rp,ri)=>{const [a,b]=rp.dataset.rip.split(',').map(Number);let seed=ri*97+13;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  const pts=[];const n=110;let yy=50;for(let i=0;i<=n;i++){const x=i/n*100;yy+=(rnd()-.5)*1.1;yy=Math.max(47,Math.min(53,yy));pts.push([x,yy+(rnd()-.5)*.7])}
  const top='polygon(0% 0%,100% 0%,'+pts.slice().reverse().map(([x,y])=>`${x.toFixed(2)}% ${y.toFixed(2)}%`).join(',')+')';
  const bot='polygon('+pts.map(([x,y])=>`${x.toFixed(2)}% ${y.toFixed(2)}%`).join(',')+',100% 100%,0% 100%)';
  const [ht,hb]=$$('.half',rp);ht.querySelector('.sheet').style.clipPath=top;hb.querySelector('.sheet').style.clipPath=bot;
  const pl=pts.map(([x,y])=>`${x.toFixed(2)},${y.toFixed(2)}`).join(' ');$$('polyline',rp).forEach(p=>p.setAttribute('points',pl));
  const scn=rp.closest('.sc').id;RIPS.push({rp,a,b,ht,hb,scn,last:0})});
function ripFrame(s,p){for(const r of RIPS){if(r.scn!==s.id)continue;const k=sm(r.a,r.b,p);
  if(k>.02&&r.last<=.02)play('tear');r.last=k;
  r.ht.style.transform=`translate3d(${-k*2}vw,${-k*78}vh,0) rotate(${-k*6}deg)`;r.hb.style.transform=`translate3d(${k*3}vw,${k*80}vh,0) rotate(${k*5}deg)`;
  r.rp.style.visibility=k>=.999?'hidden':'visible';r.rp.style.setProperty('--e',k>0?1:0)}}

/* ══ 1 · ВХОД ══ */
const MONTHS=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const pad=n=>String(n).padStart(2,'0');
const hzY=()=>H*(W<=760?.7:.68);
const R0=()=>Math.min(W<=760?W*.26:Math.max(120,Math.min(210,W*.13)),H*.2);
const R1=()=>R0()*.4;
let rewound=false,busy=false,arrived=false,caught=false,upAcc=0,lastY=scrollY,rolled=false,lastCnt=-1;
const o1=$('open'),o2=$('open2');
const t1=$('openStick').querySelector('.o-t1'),t2=$('openStick').querySelector('.o-t2'),t3=$('openStick').querySelector('.o-t3'),flash=$('openStick').querySelector('.cutflash'),cnt=$('oCount');
const cd=$('cntDate'),ct=null,reel=$('cnReel');
function clock(){const now=new Date();cd.textContent=`${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`}
clock();setInterval(clock,1000);
scene('open',(p,t)=>{
  t1.style.opacity=1-sm(.08,.11,p);t2.style.opacity=sm(.09,.12,p)*(1-sm(.27,.3,p));t3.style.opacity=sm(.3,.33,p)*(p<.488?1:0);{const fl=Math.max(0,1-Math.abs(p-.489)/.004);flash.style.opacity=(fl*.85).toFixed(3);if(p>.489&&!G.cut){G.cut=1;play('knock');}if(p<.48)G.cut=0}
  const ck2=sm(.488,.491,p)*(1-sm(.86,.89,p));cnt.style.setProperty('--k',ck2.toFixed(3));{const r=reduce?(p>.58?1:0):sm(.555,.6,p);reel.style.transform=`translate3d(0,${(-r*50).toFixed(2)}%,0)`;reel.style.filter=`blur(${(Math.sin(r*Math.PI)*7).toFixed(2)}px)`;if(r>.5&&!G.reelDone){G.reelDone=1;play('piano')}if(r<.3)G.reelDone=0}
  const raw=SC.open.p;if(raw>=.93&&raw<.999&&!rewound&&!busy&&!reduce)rewind()});
function rewind(){rewound=true;busy=true;G.fast=true;const from=scrollY,to=o1.offsetTop+.125*(o1.offsetHeight-H),dur=1900,t0=performance.now();
  html.classList.add('locked','rewinding');play('rewind');
  (function step(n){const k=Math.min(1,(n-t0)/dur),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;scrollTo(0,from+(to-from)*e);if(window.__fxRew)window.__fxRew(Math.sin(k*Math.PI));
    if(k<1)requestAnimationFrame(step);else{html.classList.remove('locked','rewinding');scrollTo(0,o2.offsetTop);G.snap=true;G.fast=false;busy=false;arrived=true;lastY=scrollY;if(window.__fxRew)window.__fxRew(0)}})(t0)}
/* «Сейчас вы, конечно, прокрутите дальше» — и ответ, если читатель вернулся назад */
const nudge=$('nudge'),say=$('say');
const u1=$('open2Stick').querySelector('.o-t1'),u2=$('open2Stick').querySelector('.o-t2');
scene('open2',p=>{u1.style.opacity=1-sm(.16,.2,p);u2.style.opacity=sm(.2,.25,p);nudge.style.opacity=sm(.3,.36,p)*(1-sm(.74,.8,p));
  $$('.o-opt',o2).forEach(b=>{const on=parseFloat(b.style.getPropertyValue('--k')||0)>.5;b.style.pointerEvents=on?'auto':'none';b.tabIndex=on?0:-1})});
addEventListener('scroll',()=>{const r=o2.getBoundingClientRect(),inside=r.top<=1&&r.bottom>H;if(inside)arrived=true;const dy=scrollY-lastY;lastY=scrollY;
  if(arrived&&!caught&&!busy&&dy<0&&r.top>-H*1.2&&r.top<H){upAcc-=dy;if(upAcc>60){caught=true;nudge.textContent='Да. Сначала ещё раз посмотрим.';nudge.classList.add('caught');play('scribble')}}if(dy>0)upAcc=0},{passive:true});
const REPLY=['Под горку колесо катится быстрее любого бегуна. Ради этого его, собственно, и&nbsp;придумали.',
  'Теперь колёс два, и&nbsp;оба укатились в&nbsp;разные стороны. Их&nbsp;бы чем-нибудь соединить.'];
$$('.o-opt',o2).forEach(b=>b.addEventListener('click',()=>{gesture();$$('.o-opt',o2).forEach(x=>x.setAttribute('aria-pressed',x===b));const k=+b.dataset.o;
  say.innerHTML=REPLY[k];say.classList.remove('in');void say.offsetWidth;say.classList.add('in');
  const el=k?$('wheel2'):$('runner');el.classList.remove('go');void el.getBoundingClientRect();el.classList.add('go');
  el.querySelectorAll('.walking').forEach(w=>w.classList.add('moving'));play('wood');setTimeout(()=>play(k?'roll':'steps'),120)}));
/* колесо можно покрутить, пока оно стоит */
(function(){const st=$('openStick');let lx=null;
  st.addEventListener('pointermove',e=>{if(!SC.open||SC.open.p>.06){lx=null;return}if(lx!==null){const dx=e.clientX-lx;G.userDeg+=dx*(e.pointerType==='mouse'?.5:.9);{const pk=Math.floor(G.userDeg/180);if(pk!==G.upk){G.upk=pk;play('plank',.4)}}}lx=e.clientX});
  st.addEventListener('pointerleave',()=>{lx=null})})();
window.__resetOpen=()=>{rewound=false;arrived=false;caught=false;upAcc=0;nudge.textContent='Сейчас вы, конечно, прокрутите дальше.';nudge.classList.remove('caught');say.textContent='';$$('.o-opt',o2).forEach(x=>x.setAttribute('aria-pressed','false'))};

/* ══ 2 · ПОЗЖЕ ФЛЕЙТЫ ══ */
const track=$('track'),sts=$$('.st',track);let gap=300;
function layLater(){gap=W<=760?W*.62:Math.max(300,W*.3);const ly=W<=760?66:70;$('laterStick').style.setProperty('--ly',ly+'%');sts.forEach((s,i)=>{s.style.left=(W+i*gap)+'px';s._k=-1});track.style.width=(W*2+sts.length*gap)+'px'}
scene('later',p=>{ripFrame(SC.later,p);const tx=-sm(.2,.84,p)*(W*.5+(sts.length-1)*gap);track.style.transform=`translate3d(${tx.toFixed(1)}px,0,0)`;
  sts.forEach((s,i)=>{const sx=W+i*gap+tx,k=sm(W*1.02,W*.55,sx);if(Math.abs(k-s._k)>.003){s.style.setProperty('--k',k.toFixed(3));if(s._k<.05&&k>=.05)play('scribble');s._k=k}})});

['ps1','ps2','ps3','ps4'].forEach(id=>{const st=$(id)&&$(id).querySelector('.stick');scene(id,p=>{st.style.setProperty('--p',p.toFixed(4))})});
/* ══ 3 · БОЛОТО ══ */
(function(){const sv=$('strataSvg');if(!sv)return;let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  const wave=(y,amp,ph)=>{let d=`M0 ${y}`;for(let x=0;x<=1440;x+=60)d+=`L${x} ${(y+Math.sin(x/140+ph)*amp+(rnd()-.5)*amp*.6).toFixed(1)}`;return d};
  let s='';for(let i=0;i<46;i++){const x=rnd()*1440,h=80+rnd()*160,b=(rnd()-.5)*40;s+=`<path class="ns" style="stroke:#8f9a5c" d="M${x.toFixed(0)} 300Q${(x+b/2).toFixed(0)} ${300-h/2} ${(x+b).toFixed(0)} ${300-h}"/>`;if(rnd()<.45)s+=`<ellipse class="ns" cx="${(x+b).toFixed(0)}" cy="${(300-h+14).toFixed(0)}" rx="4" ry="14" fill="currentColor"/>`}
  s+=`<path class="ns" d="${wave(300,6,0)}" stroke-width="2"/>`;
  const ys=[];for(let i=0;i<15;i++)ys.push(380+i*140);
  ys.forEach((y,i)=>{const d1=wave(y,10+i*.6,i),d2=wave(y+40+rnd()*30,10,i+1);s+=`<path class="ns" d="${d1}" opacity="${.85-i*.03}"/>`;
    const p2=d2.replace(/^M/,'L').split('L').filter(Boolean).reverse().join('L');s+=`<path class="${['f-peat','f-peat2','f-road','f-moss'][i%4]}" d="${d1}L${p2}Z" opacity=".75" stroke="none"/>`;if(i%2===0)s+=`<path class="hf" d="${d1}L${p2}Z" opacity=".3"/>`
    for(let j=0;j<6;j++){const x=rnd()*1440,yy=y+20+rnd()*90;if(rnd()<.5)s+=`<ellipse class="ns t" cx="${x.toFixed(0)}" cy="${yy.toFixed(0)}" rx="${(4+rnd()*10).toFixed(0)}" ry="${(3+rnd()*5).toFixed(0)}"/>`;else s+=`<path class="ns t" d="M${x.toFixed(0)} ${yy.toFixed(0)}c${(rnd()*30).toFixed(0)} 10 ${(rnd()*20).toFixed(0)} 30 ${(rnd()*40-20).toFixed(0)} 44"/>`}});
  sv.innerHTML=s;
  const bb=$('bubbles');let bs='';for(let i=0;i<14;i++)bs+=`<i style="--x:${(rnd()*96).toFixed(1)}%;--s:${(6+rnd()*14).toFixed(0)}px;--d:${(6+rnd()*8).toFixed(1)}s;--dl:${(-rnd()*10).toFixed(1)}s"></i>`;bb.innerHTML=bs})();
let bulped=false;
scene('swamp',p=>{const st=$('strata');st.style.transform=`translate3d(0,${(-sm(0,1,p)*(st.offsetHeight-H)).toFixed(1)}px,0)`;if(p>.52&&!bulped){bulped=true;play('bubble')}if(p<.45)bulped=false});

/* ══ 4 · НАХОДКА ══ */
scene('find',()=>{});

/* ══ 5 · ОДНОГО КОЛЕСА МАЛО ══ */
const eqRow=$('eqRow'),eqCart=$('eqCart');let mooed=false;
$$('.term.pop').forEach(t=>t.dataset.snd='knock');
scene('eq',p=>{ripFrame(SC.eq,p);eqRow.style.opacity=(1-sm(.58,.64,p)).toFixed(3);eqRow.style.transform=`translateY(-38%) scale(${(1-sm(.56,.66,p)*.1).toFixed(3)})`;
  const mv=p>.7&&p<.995;eqCart.querySelectorAll('.walking,svg>g').forEach(g=>g.classList.toggle('moving',mv));eqCart.classList.toggle('moving',mv);
  eqCart.querySelectorAll('.road-dash').forEach(d=>d.style.strokeDashoffset=(p*2400).toFixed(0));
  if(p>.72&&!mooed){mooed=true;play('moo')}if(p<.6)mooed=false});
SC.eq&&SC.eq.ks.forEach(k=>{if(k.e.classList.contains('term'))k.snd='knock'});

/* ══ 6 · ЛАБОРАТОРИЯ ══ */
(function(){const cart=$('cart');if(!cart)return;const tpl=$('tCart');const g=tpl.cloneNode(true);g.removeAttribute('id');g.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));cart.querySelector('.labcart').appendChild(g);
  const t=$('labTitle'),l=$('labLine');const P={wheel:0,axle:0,body:0,load:0,ox:0,road:0};
  function sayL(){if(!Object.values(P).some(Boolean))return['Здесь пока пусто','Начните с&nbsp;колеса. С&nbsp;чего&nbsp;же ещё?'];
    if(!P.wheel)return['Это волокуша','Без колеса её можно только тащить. Кряхтя.'];
    if(!P.axle)return['Колесо укатилось','Опять. Держаться ему не&nbsp;за&nbsp;что&nbsp;— оси-то нет.'];
    if(!P.body)return['Не&nbsp;в&nbsp;чем везти','Колёса крутятся, а&nbsp;груз лежит на&nbsp;земле.'];
    if(!P.ox)return['Повозка стоит','Тянуть некому. Самим впрягаться?'];
    if(!P.road)return['Повозка вязнет','В&nbsp;грязи колесо почти не&nbsp;едет. Нужна дорога.'];
    if(!P.load)return['Повозка едет пустой','Везём воздух. Очень разумно.'];
    return['Повозка едет','Готово. Теперь быка надо кормить, дорогу&nbsp;— чинить, а&nbsp;ось&nbsp;— смазывать.']}
  const spin=cart.querySelector('.spin');let ang=0;
  function upd(){for(const k in P)cart.classList.toggle('has-'+k,!!P[k]);const go=P.wheel&&P.axle&&P.body&&P.ox;
    cart.classList.toggle('go',!!go);cart.classList.toggle('stuck',!P.road);cart.classList.toggle('solo',!!(P.wheel&&!P.axle));
    cart.querySelectorAll('.walking,.p-ox>g').forEach(x=>x.classList.toggle('moving',!!(go&&P.road)));cart.querySelectorAll('.p-ox').forEach(x=>x.classList.toggle('moving',!!(go&&P.road)));
    const [a,b]=sayL();t.innerHTML=a;l.innerHTML=b;$$('#parts .part').forEach(x=>x.setAttribute('aria-pressed',!!P[x.dataset.p]))}
  (function rot(){const moving=cart.classList.contains('go')&&!cart.classList.contains('stuck')||cart.classList.contains('solo');if(moving&&!reduce){ang+=3;spin.setAttribute('transform',`rotate(${ang} 270 224)`)}requestAnimationFrame(rot)})();
  const S={wheel:'roll',axle:'knock',body:'knock',load:'steps',ox:'moo',road:'scribble'};
  $$('#parts .part').forEach(x=>x.addEventListener('click',()=>{gesture();const k=x.dataset.p;P[k]=P[k]?0:1;upd();play(P[k]?S[k]:'click');if(P.wheel&&P.axle&&P.body&&P.ox&&P.road)setTimeout(()=>play('roll'),350)}));
  upd()})();

/* ══ 7 · ПАРАД ══ */
const VEH=[['v0',.05,.3,880,'moo'],['v1',.27,.52,700,'clop'],['v2',.49,.72,420,'squeak'],['v3',.69,.93,830,'klaxon']].map(([id,a,b,vw,snd])=>{const el=$(id);return el&&{el,a,b,vw,snd,spins:$$('.spin',el).map(g=>({g,cx:+g.dataset.cx,cy:+g.dataset.cy,r:+g.dataset.r})),px:null,played:false}}).filter(Boolean);
scene('parade',p=>{const ps=SCN.find(x=>x.kind==='parade');if(ps)ps.svg.style.transform=`translate3d(${(-(ps.w-ps.Wh)*sm(0,1,p)).toFixed(1)}px,0,0)`;const dash=$('prDash');if(dash)dash.style.strokeDashoffset=(-p*5000).toFixed(0);
  for(const v of VEH){const t=clamp01((p-v.a)/(v.b-v.a)),w=v.el.offsetWidth,u=(t-.5)*2,x=(W-w)/2+Math.sign(u)*Math.pow(Math.abs(u),2.2)*(W/2+w/2+40);
    v.el.style.transform=`translate3d(${x.toFixed(1)}px,-100%,0)`;const sc=w/v.vw;
    for(const s of v.spins)s.g.setAttribute('transform',`rotate(${(x/sc/s.r*57.2958).toFixed(1)} ${s.cx} ${s.cy})`);
    const mv=v.px!==null&&Math.abs(x-v.px)>.25;v.el.querySelectorAll('.walking').forEach(g=>g.classList.toggle('moving',mv));v.px=x;
    if(t>.03&&t<.6&&!v.played){v.played=true;play(v.snd)}if(t<.01||t>.99)v.played=false}});

/* ══ 8 · ДЕНЬ ══ */
const HOURS=[5,6.5,7.5,9,13,18,21],sched=$$('#sched li');let dayIdx=-1,dayAng=0;
(function(){const tk=$('dayTicks');if(!tk)return;let s='<circle r="112" class="t"/>';for(let i=0;i<24;i++){const a=i/24*Math.PI*2;s+=`<line class="t" x1="${(Math.sin(a)*106).toFixed(1)}" y1="${(-Math.cos(a)*106).toFixed(1)}" x2="${(Math.sin(a)*112).toFixed(1)}" y2="${(-Math.cos(a)*112).toFixed(1)}"/>`}
  HOURS.forEach((h,i)=>{const a=h/24*Math.PI*2;s+=`<text x="${(Math.sin(a)*96).toFixed(1)}" y="${(-Math.cos(a)*96+4).toFixed(1)}" text-anchor="middle" style="font:700 11px Alegreya,serif;fill:#17130F;stroke:none">${sched[i].querySelector('time').textContent}</text>`});tk.innerHTML=s})();
const bez=(t,a,b,c,d)=>{const m=1-t;return m*m*m*a+3*m*m*t*b+3*m*t*t*c+t*t*t*d};
scene('day',p=>{ripFrame(SC.day,p);const s=sm(.16,.8,p)*6,i0=Math.floor(s),fr=s-i0,h=lerp(HOURS[Math.min(6,i0)],HOURS[Math.min(6,i0+1)],fr);
  dayAng=h/24*360;$('dayTicks').style.setProperty('--dr',(-dayAng).toFixed(2)+'deg');
  const idx=Math.round(s);if(idx!==dayIdx){sched.forEach((li,i)=>li.classList.toggle('on',i===idx));if(dayIdx>=0)play('knock');dayIdx=idx}
  const u=clamp01((h-5)/16);const sun=$('sun');if(sun)sun.setAttribute('transform',`translate(${bez(u,60,260,740,940).toFixed(1)} ${bez(u,290,40,40,290).toFixed(1)})`);
  $$('#dayWords .w').forEach((w,i)=>w.style.setProperty('--o',sm(.88+i*.016,.9+i*.016,p).toFixed(3)))});

/* ══ 9 · ВСЁ ВОКРУГ ══ */
const RF=['wheel','pill','steer','ferris','bus','mouse','gear'];
const RCAP=['то самое, из&nbsp;болота','таблетка. В&nbsp;просторечии&nbsp;— тоже колесо','руль. Он&nbsp;же рулевое колесо','колесо обозрения. Катаемся по&nbsp;кругу добровольно','автобус в&nbsp;7:40. Следующий&nbsp;— в&nbsp;8:10','колесо мыши. Прокручено: <b id="wheelCount">0</b>','шестерёнка в&nbsp;часах. Тоже колесо, зубчатое'];
const RM=RF.map((_,i)=>.05+i*.08);let rIdx=-1,wheelN=0;
addEventListener('wheel',()=>{wheelN++;const o=$('wheelCount');if(o)o.textContent=wheelN},{passive:true});addEventListener('touchstart',()=>{wheelN++;const o=$('wheelCount');if(o)o.textContent=wheelN},{passive:true});
const SWS=[[3,8,-1,0,'pill'],[38,4,0,-1,'steer'],[76,6,1,0,'gear'],[86,40,1,0,'bus'],[78,70,1,0,'ferris'],[44,76,0,1,'mouse'],[6,70,-1,0,'potter'],[2,36,-1,0,'spoked'],[22,20,-1,-1,'dharma'],[62,22,1,-1,'wheel']];
(function(){const sw=$('swarm');if(!sw)return;sw.innerHTML=SWS.map(([x,y,dx,dy,f],i)=>{const r=FROT[f]||0;return `<svg class="ill boil" viewBox="-110 -110 220 220" style="left:${x}%;top:${y}%" data-i="${i}">${r?`<g transform="rotate(${r})">`:'<g>'}${FIG[f].map(d=>d[0]==='~'?`<path class="t" d="${d.slice(1)}"/>`:`<path d="${d}"/>`).join('')}</g></svg>`}).join('')})();
scene('rounds',p=>{if(p>.82&&!gonged){gonged=true;play('gong')}if(p<.7)gonged=false;{const raw=SC.rounds.p;if(raw>=.985&&!fired&&!reduce)fin()}let idx=-1;RM.forEach((m,i)=>{if(p>=m-.04)idx=i});if(p>.6)idx=-1;
  if(idx!==rIdx){$('rCap').innerHTML=idx>=0?RCAP[idx]:'';if(idx>=0&&rIdx!==-2)play('whoosh');const o=$('wheelCount');if(o)o.textContent=wheelN;rIdx=idx}
  const k=sm(.64,.9,p);$$('#swarm svg').forEach((s,i)=>{const [,,dx,dy]=SWS[i];s.style.transform=`translate(${((1-k)*dx*W*.6).toFixed(0)}px,${((1-k)*dy*H*.6).toFixed(0)}px) rotate(${((1-k)*dx*180).toFixed(0)}deg)`;s.style.opacity=k.toFixed(3)})});

/* ══ 10 · НАГАСЕНА ══ */
const NP_=$$('#nagSvg .np');let nagLast=[0,0,0,0],gonged=false,fired=false;
scene('nag',p=>{const no0=$('nagNo0');no0.style.opacity=(sm(.14,.17,p)*(1-sm(.3,.34,p))).toFixed(3);
  NP_.forEach(g=>{const i=+g.dataset.i,a=.18+i*.1,b=a+.08,r=sm(a,b,p),dir=i===3?1:i===2?-.4:.6;
    g.setAttribute('transform',`translate(${(dir*r*700).toFixed(1)} ${(-r*260).toFixed(1)}) rotate(${(dir*r*50).toFixed(1)} 460 300)`);g.style.opacity=(1-sm(.55,1,r)).toFixed(3);
    const lb=g.querySelector('.lbl-no');if(lb)lb.style.opacity=sm(a-.04,a,p).toFixed(3);
    if(r>.05&&nagLast[i]<=.05)play('knock');nagLast[i]=r});
  $('nagWord').style.opacity=(1-sm(.78,.84,p)).toFixed(3);
});
function fin(){fired=true;html.classList.add('locked');G.fast=true;const y0=scrollY,t0=performance.now(),dur=2800;play('rewind');
  (function f(n){const k=Math.min(1,(n-t0)/dur),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;scrollTo(0,y0*(1-e));if(window.__fxRew)window.__fxRew(Math.sin(k*Math.PI));
    if(k<1)requestAnimationFrame(f);else{G.fast=false;if(window.__fxRew)window.__fxRew(0);window.__resetOpen();const card=$('creditsCard');card.classList.add('on');card.focus();play('gong');
      const close=()=>{card.classList.remove('on');html.classList.remove('locked');card.removeEventListener('click',close);setTimeout(()=>{fired=false},4000)};card.addEventListener('click',close);setTimeout(close,5600)}})(t0)}

/* ══ КОЛЕСО-ПРОВОДНИК: ключевые кадры по всей странице ══ */
const guide=$('guide'),gLine=$('gLine'),gFill=$('gFill'),gBg=$('gBg'),gChalk=$('gChalk'),gShadow=$('gShadow'),gRot=$('gRot'),gShade=$('gShade'),gThin=$('gThin'),gArt=$('gArt'),gMorph=$('gMorph');
function slot(id){const e=$(id);if(!e)return {x:W/2,y:H/2,s:200};const st=e.closest('.stick'),r=e.getBoundingClientRect(),sr=st?st.getBoundingClientRect():{left:0,top:0};
  return {x:r.left-sr.left+r.width/2,y:r.top-sr.top+r.height/2,s:r.width*1.25}}
const hero=(x,o=1)=>({f:'wheel',x,y:hzY()-R0(),s:R0()/.4,o,roll:1,sh:1,rot:G.userDeg,bw:1});
const small=(x,o=1)=>({f:'wheel',x,y:hzY()-R1(),s:R1()/.4,o,roll:1,sh:1,rot:G.userDeg,bw:1});
const xLov=()=>{const t=(.125-.06)/.11,e=t*t*(3-2*t);return W*.5+e*(W*.5+R0()*1.4)};
const off=()=>W+R0()*1.4;
const ctr=(f,sz,o=1,extra={})=>Object.assign({f,x:W/2,y:H*.5,s:sz,o},extra);
const dayRot=()=>-dayAng;
const KF=[
  ['open',0,()=>hero(W*.5)],['open',.06,()=>hero(W*.5)],['open',.17,()=>hero(off())],
  ['open',.18,()=>hero(off(),0)],['open',.8,()=>small(-R1()*2,0)],['open',.86,()=>small(-R1()*2,0)],['open',.93,()=>small(W*.3)],
  ['open2',0,()=>hero(xLov())],['open2',.02,()=>hero(xLov())],['open2',.14,()=>hero(off())],
  ['later',0,()=>({...hero(off()),o:0})],['later',.84,()=>({f:'potter',x:W*.72,y:H*.36,s:Math.min(W,H)*.3,o:0})],['later',.88,()=>({f:'potter',x:W*.72,y:H*.36,s:Math.min(W,H)*.3})],
  ['later',.92,()=>({f:'potter',x:W*.72,y:H*.36,s:Math.min(W,H)*.3,spin:2})],['later',.99,()=>({f:'wheel',x:W*.72,y:H*.36,s:Math.min(W,H)*.34,spin:4})],
  ['ps1',0,()=>ctr('wheel',Math.min(W,H)*.34,0,{x:W*.72,y:H*.36,spin:4})],['ps1',1,()=>ctr('wheel',Math.min(W,H)*.42,0,{y:H*.24,spin:5})],
  ['swamp',0,()=>ctr('wheel',Math.min(W,H)*.42,1,{y:H*.24,spin:5})],['swamp',.2,()=>ctr('wheel',Math.min(W,H)*.42,1,{y:H*.36,spin:6})],
  ['swamp',.68,()=>ctr('wheel',Math.min(W,H)*.5,1,{y:H*.56,rot:28,spin:6})],['swamp',1,()=>ctr('wheel',Math.min(W,H)*.5,1,{y:H*.56,rot:28,spin:6})],
  ['find',0,()=>({f:'wheel',...slot('plateSlot'),c:1,rot:0,spin:6.28})],['find',1,()=>({f:'wheel',...slot('plateSlot'),c:1,spin:6.28})],
  ['ps2',0,()=>({f:'wheel',...slot('plateSlot'),c:1,o:0,spin:6.28})],['ps2',1,()=>({f:'wheel',x:W-Math.min(W,H)*.12,y:H*.16,s:Math.min(W,H)*.16,o:0,spin:6.28})],
  ['eq',0,()=>({f:'wheel',x:W-Math.min(W,H)*.12,y:H*.16,s:Math.min(W,H)*.16,o:.9,spin:6.28})],['eq',.12,()=>({f:'wheel',x:W-Math.min(W,H)*.12,y:H*.16,s:Math.min(W,H)*.16,o:.9,spin:9})],
  ['eq',.2,()=>({f:'wheel',...slot('eqSlot'),spin:12.56})],['eq',.58,()=>({f:'wheel',...slot('eqSlot'),spin:12.56})],
  ['eq',.68,()=>({f:'wheel',...slot('eqWheel'),spin:12.56})],['eq',.7,()=>({f:'wheel',...slot('eqWheel'),spin:12.56,lin:1})],['eq',1,()=>({f:'wheel',...slot('eqWheel'),spin:12.56+40,lin:1})],
  ['lab',0,()=>{const q=slot('eqWheel');return {f:'wheel',x:q.x,y:q.y-H,s:q.s,o:0,spin:12.56+40+20,lin:1}}],
    ['nag',0,()=>({f:'spoked',...slot('nagSlot'),o:0})],['nag',.04,()=>({f:'spoked',...slot('nagSlot')})],['nag',.18,()=>({f:'spoked',...slot('nagSlot')})],
  ['nag',.26,()=>{const q=slot('nagSlot');return {f:'spoked',x:-q.s,y:q.y-H*.3,s:q.s,o:0,spin:-14}}],
  ['day',0,()=>({f:'spoked',...slot('daySlot'),c:1,o:0,rot:dayRot()})],['day',.15,()=>({f:'spoked',...slot('daySlot'),c:1,o:0,rot:dayRot()})],['day',.2,()=>({f:'spoked',...slot('daySlot'),c:1,rot:dayRot()})],['day',.9,()=>({f:'spoked',...slot('daySlot'),c:1,rot:dayRot()})],['day',1,()=>({f:'spoked',...slot('daySlot'),c:1,o:0,rot:dayRot()})],
  ['rounds',0,()=>ctr('wheel',Math.min(W,H)*.5,0)],
  ...RF.flatMap((f,i)=>[['rounds',RM[i],()=>ctr(f,Math.min(W,H)*.5,1,{spin:i*1.2})],['rounds',RM[i]+.04,()=>ctr(f,Math.min(W,H)*.5,1,{spin:i*1.2+.6})]]),
  ['rounds',.66,()=>ctr('gear',Math.min(W,H)*.2,0,{spin:9})],
  ['rounds',.78,()=>ctr('dharma',Math.min(W,H)*.46,0,{y:H*.42})],['rounds',.86,()=>ctr('dharma',Math.min(W,H)*.46,1,{y:H*.42,spin:3})],['rounds',1,()=>ctr('dharma',Math.min(W,H)*.46,1,{y:H*.42,spin:12})]
];
let KP=[];
function layoutKF(){KP=KF.map(([id,p])=>{const e=$(id);if(!e)return 0;return e.offsetTop+p*Math.max(0,e.offsetHeight-H)})}
const CRE=[237,228,209],INK=[23,19,15],BLK=[11,10,8],PAP=[230,220,198],WOOD=[110,69,36],CLAY=[155,90,55],GOLD=[201,162,74],BONE=[216,201,163],DARK=[29,25,20],TEAL=[47,85,82],OCH=[185,138,62];
const FIGC={wheel:WOOD,potter:CLAY,spoked:WOOD,pill:BONE,steer:DARK,ferris:TEAL,bus:DARK,mouse:BONE,gear:GOLD,dharma:GOLD};
const mix=(a,b,t)=>`rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')})`;
let gy=scrollY,gAng=0,prevX=null,lastD='',lastF='',lastT=-1;
function guideFrame(dt){const ty=scrollY;if(G.snap||G.fast||reduce||Math.abs(ty-gy)>H*3){gy=ty;if(G.snap){prevX=null;G.snap=false}}else gy+=(ty-gy)*Math.min(1,dt*9);
  let i=0;while(i<KF.length-2&&KP[i+1]<=gy)i++;const a=KF[i],b=KF[i+1];let t=clamp01((gy-KP[i])/Math.max(1,KP[i+1]-KP[i]));
  const A=Object.assign({o:1,c:0,spin:0,rot:0,roll:0,sh:0},a[2]()),B=Object.assign({o:1,c:0,spin:0,rot:0,roll:0,sh:0},b[2]());
  const e=B.lin?t:t*t*(3-2*t);const o=lerp(A.o,B.o,e);
  if(o<.01){guide.style.visibility='hidden';prevX=null;return}guide.style.visibility='visible';
  const x=lerp(A.x,B.x,e),y=lerp(A.y,B.y,e),s=lerp(A.s,B.s,e),c=lerp(A.c,B.c,e),roll=lerp(A.roll,B.roll,e);
  if(prevX!==null&&roll>0){const dx=x-prevX;gAng+=dx/(s*.4)*roll;const pk=Math.floor(gAng/Math.PI);if(pk!==G.pk){if(G.pk!==undefined&&Math.abs(dx)>.4&&o>.4&&!G.fast)play('plank',Math.abs(dx)/14);G.pk=pk}}prevX=x;
  if(roll<=0)gAng=((gAng%(Math.PI*2))+Math.PI*3)%(Math.PI*2)-Math.PI;
  const deg=(gAng+lerp(A.spin,B.spin,e))*57.2958+lerp(A.rot,B.rot,e);
  guide.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${(s/200).toFixed(4)})`;guide.style.opacity=o.toFixed(3);
  guide.style.color=mix(CRE,INK,c);gBg.style.fill=mix(BLK,PAP,c);
  gRot.setAttribute('transform',`rotate(${deg.toFixed(2)})`);
  const mt=A.f===B.f?0:e,key=A.f+B.f+mt.toFixed(3);
  if(key!==lastD){const ta=A.f===B.f?[A.f,A.f,0]:[A.f,B.f,mt];gLine.setAttribute('d',morphD(...ta,0,false));gThin.setAttribute('d',morphD(...ta,0,true));gFill.setAttribute('d',A.f===B.f?morphD(A.f,A.f,0,2):morphD(A.f,B.f,mt,2));gBg.setAttribute('d',A.f===B.f?morphD(A.f,A.f,0,1):morphD(A.f,B.f,mt,1));lastD=key}
  const ch=(A.f==='wheel'?1-mt:0)+(B.f==='wheel'?mt:0);gChalk.style.opacity=0;gArt.style.opacity=ch.toFixed(3);gMorph.style.opacity=(1-ch*.98).toFixed(3);const RND=['wheel','spoked','dharma','potter','bus','steer','ferris','gear'];const rw=(RND.includes(A.f)?1-mt:0)+(RND.includes(B.f)?mt:0);gShade.style.opacity=(rw*.6*(1-ch)).toFixed(3);
  gShadow.style.opacity=(lerp(A.sh,B.sh,e)*.5).toFixed(3);gShadow.setAttribute('transform',`rotate(0)`)}

/* «дрожь» рисованной линии */
if(!reduce){let b=0;setInterval(()=>{html.classList.remove('boil0','boil1','boil2');html.classList.add('boil'+(b=(b+1)%3))},140)}

/* ══ ЦИКЛ ══ */
function layout(){W=innerWidth;H=innerHeight;setTimeout(layScenery,0);const hz=(hzY()/H*100).toFixed(2)+'%';['openStick','open2Stick'].forEach(id=>$(id).style.setProperty('--hz',hz));layLater();layoutKF()}
layout();addEventListener('resize',layout);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(layout);setTimeout(layout,1500);
let lastT0=performance.now();
function loop(now){const dt=Math.min(.05,(now-lastT0)/1000);lastT0=now;
  for(const s of LIST){const r=s.el.getBoundingClientRect();s.vis=r.bottom>-H*.5&&r.top<H*1.5;if(!s.vis)continue;
    const p=clamp01(-r.top/Math.max(1,r.height-H));s.p=p;s.sp=(reduce||G.fast||Math.abs(p-s.sp)>.3)?p:s.sp+(p-s.sp)*Math.min(1,dt*8);
    applyK(s,s.sp);s.fn&&s.fn(s.sp,now/1000,dt)}
  let pj=false;for(const r of RIPS){const sc=SC[r.scn];if(!sc||!sc.vis)continue;const rr=sc.el.getBoundingClientRect();if(rr.top<H*.5&&sc.sp<r.a&&rr.bottom>H)pj=true}SND.projector(pj&&!busy);
  guideFrame(dt);requestAnimationFrame(loop)}
requestAnimationFrame(loop);
window.__G={G,SC,KF,KP,SND};
})();
