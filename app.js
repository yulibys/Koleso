/* «Колесо» v20 — движок прокрутки и сцены. Положения и шаги — по кадрам Figma «Колсео» (1440×900).
   Всё движение привязано к прокрутке; по времени идут только перемотки, бег белки в колесе
   и кнопка «побежать за ним». */
(function () {
  const $ = (id) => document.getElementById(id);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const sg = (p, a, b) => cl((p - a) / (b - a));
  const ez = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const A = window.ART;
  let H = innerHeight, PORT = false, TAB = false, PS = 0.6, MM = 0; // MM: сколько холста видно сбоку сверх 1440
  const sizes = new Map();

  function fit() {
    H = innerHeight;
    const W = innerWidth;
    // портрет (телефон, планшет): не общий масштаб, а своя раскладка в полосе 560 px по центру кадра и с запасом по высоте
    const k = W >= H ? Math.min(W / 1440, H / 810) : Math.min(W / 560, H / 1150);
    MM = Math.max(0, (W / k - 1440) / 2);
    root.style.setProperty('--m', MM.toFixed(1));
    root.style.setProperty('--k', k.toFixed(4));
    root.style.setProperty('--v', ((H / k - 900) / 2).toFixed(1)); // v92: сколько холста видно сверху/снизу сверх 900 (минус — обрезано)
    PORT = W < H; TAB = PORT && W / k >= 760; PS = TAB ? 0.8 : 0.6;
    root.classList.toggle('port', PORT); root.classList.toggle('tab', TAB); sizes.clear();
  }
  fit();
  const COARSE = matchMedia('(pointer: coarse)').matches;
  // на сенсорных экранах прокрутка «легче» — растягиваем секции, чтобы сцены шли медленнее
  $$('.sc').forEach((s) => s.style.setProperty('--len', (s.dataset.len * (COARSE ? 1.3 : 1)).toFixed(2)));
  if (COARSE) root.classList.add('coarse');
  // на телефонах и планшетах «дрожание» линий выключено: SVG-фильтр каждые 140 мс перерисовывает весь экран и тормозит прокрутку
  if (!reduce && !COARSE) { let b = 0; setInterval(() => { root.classList.remove('boil0', 'boil1', 'boil2'); root.classList.add('boil' + (b = (b + 1) % 3)); }, 140); }
  // на телефоне адресная строка при прокрутке меняет высоту окна — не пересчитываем раскладку из-за этого
  let lastW = innerWidth, lastH = innerHeight;
  addEventListener('resize', () => {
    const w = innerWidth, h = innerHeight;
    if (COARSE && w === lastW && Math.abs(h - lastH) < 160) return;
    lastW = w; lastH = h; fit(); tick();
  });

  /* ── помощники ── */
  let SPIN = 0;
  function put(el, x, y, s = 1, r = 0, o) {
    let sz = sizes.get(el);
    if (!sz) { const cs = getComputedStyle(el); sz = [parseFloat(cs.width) || 0, parseFloat(cs.height) || 0]; sizes.set(el, sz); }
    el.style.transform = `translate(${(x - sz[0] / 2).toFixed(1)}px,${(y - sz[1] / 2).toFixed(1)}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
    if (o !== undefined) el.style.opacity = cl(o).toFixed(3);
  }
  const op = (el, v) => { el.style.opacity = cl(v).toFixed(3); };
  const dr = (el, v) => { el.style.setProperty('--d', cl(v).toFixed(4)); };
  // проявление слева направо; если в надписи несколько строк — по очереди, строка за строкой
  const sw = (el, v) => {
    if (!el) return;
    if (el._ln) { const n = el._ln.length; el._ln.forEach((l, i) => l.style.setProperty('--sw', cl(v * n - i).toFixed(4))); }
    else el.style.setProperty('--sw', cl(v).toFixed(4));
  };
  function splitLines(el) {
    if ([...el.children].some((c) => c.tagName !== 'BR')) return; // буквы «Колесо» и т. п. не трогаем
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((p) => p.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ')).join('<br>');
    const ws = [...el.querySelectorAll('.w')], lines = [];
    let top = null;
    ws.forEach((w) => { const t = w.offsetTop; if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; } lines[lines.length - 1].push(w.innerHTML); });
    if (lines.length < 2) { el.innerHTML = parts.join('<br>'); return; }
    el.innerHTML = lines.map((l) => `<span class="ln"><span class="lt">${l.join(' ')}</span></span>`).join('');
    el.classList.add('lined');
    el._ln = [...el.querySelectorAll('.lt')];
  }
  // подчёркивание всегда во всю длину подписи (берём реальную ширину текста, а не заданную заранее)
  function balance(el, maxW) {
    el.style.width = maxW + 'px'; const h0 = el.offsetHeight; let lo = maxW * 0.4, hi = maxW;
    while (hi - lo > 2) { const m = (lo + hi) / 2; el.style.width = m + 'px'; if (el.offsetHeight > h0) lo = m; else hi = m; }
    el.style.width = Math.ceil(hi) + 'px';
  }
  function fitUl(host) {
    const svg = host.querySelector('svg.ul'); if (!svg) return;
    if (host.id === 's5st') { const t = $('s5bt'); if (PORT && !TAB) { t.style.display = 'inline-block'; balance(t, 540); } else { t.style.display = ''; t.style.width = ''; } }
    let par = svg.parentElement; while (par && par !== host && getComputedStyle(par).position === 'static') par = par.parentElement; if (!par) return;
    const r = document.createRange(), pr = par.getBoundingClientRect(), sc = pr.width / (par.offsetWidth || 1) || 1;
    let L = Infinity, R = -Infinity;
    const walk = (n) => { for (const c of n.childNodes) { if (c.nodeType === 3 && c.nodeValue.trim()) { r.selectNodeContents(c); for (const q of r.getClientRects()) { L = Math.min(L, q.left); R = Math.max(R, q.right); } } else if (c.nodeType === 1 && c.tagName.toLowerCase() !== 'svg') walk(c); } };
    walk(host); if (!(R > L)) return;
    svg.style.marginLeft = '0'; svg.style.left = ((L - pr.left) / sc).toFixed(1) + 'px'; svg.style.width = ((R - L) / sc).toFixed(1) + 'px';
  }
  const ul = (host, v) => {
    const key = host.textContent + '|' + innerWidth + 'x' + innerHeight + '|' + (document.fonts ? document.fonts.status : '');
    if (v > 0 && host._fk !== key) { host._fk = key; fitUl(host); }
    const p = host.querySelector('.ul path'); if (p) p.style.setProperty('--d', cl(v).toFixed(3));
  };
  // обложка наезжает снизу плавно: положение догоняет прокрутку с инерцией, без рывков при быстром пролистывании
  function cover(el, t) {
    const target = 100 * (1 - ez(cl(t)));
    const cur = el._cy === undefined ? target : el._cy + (target - el._cy) * 0.14;
    el._cy = Math.abs(cur - target) < 0.05 ? target : cur;
    el.style.transform = `translateY(${el._cy.toFixed(2)}%)`;
  }
  // обложка: наезжает сверху, затем заголовок проявляется слева направо; можно увести вверх с исчезновением
  function coverSeq(el, p, a, b, outA, outB) {
    cover(el, sg(p, a, b));
    sw(el.querySelector('.sweep'), sg(p, b, b + 0.06));
    if (outA !== undefined) {
      const o = sg(p, outA, outB);
      if (o > 0) el.style.transform = `translateY(${(-6 * o).toFixed(2)}%)`;
      op(el, 1 - o);
    }
  }
  // следующий заголовок на той же рамке: прежний текст гаснет, новый проявляется слева направо
  function textOut(el, p, a, b) { op(el.querySelector('.sweep'), 1 - sg(p, a, b)); }
  function nextCover(el, p, a) {
    el.style.transform = p >= a ? 'none' : 'translateY(100%)';
    sw(el.querySelector('.sweep'), sg(p, a, a + 0.06));
  }
  const pathsD = (svg) => [...svg.matchAll(/ d="([^"]*)"/g)].map((m) => m[1]).join('');

  /* ── рисунки ── */
  $$('[data-ul]').forEach((p) => { p.setAttribute('d', A.underline(+p.dataset.ul, 20 + +p.dataset.ul % 7)); p.setAttribute('pathLength', '1'); p.classList.add('draw'); });
  $$('[data-bub]').forEach((p) => { const [w, h, side] = p.dataset.bub.split(','); p.setAttribute('d', A.bubble(+w, +h, side, 30 + +w % 9)); });
  { const st = $('s5st'), u = st.querySelector('.ul'); u.setAttribute('preserveAspectRatio', 'none'); const t = document.createElement('span'); t.id = 's5bt'; t.innerHTML = $('s5b').innerHTML; $('s5b').innerHTML = ''; $('s5b').append(t, u); }
  $$('svg.ul').forEach((s) => { s.setAttribute('preserveAspectRatio', 'none'); const p = s.querySelector('[data-ul]'); if (p) s.setAttribute('viewBox', `-2 -6 ${+p.dataset.ul + 4} 20`); });
  $$('svg.frame').forEach((f) => f.setAttribute('preserveAspectRatio', 'none')); // v92: рамка тянется под экран
  $$('[data-frame]').forEach((p) => { const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.innerHTML = FIG.frame; p.replaceWith(g); });
  $$('svg.frame').forEach((s) => s.setAttribute('preserveAspectRatio', 'none'));
  $('defs').insertAdjacentHTML('beforeend', VEH.pats + VEH.defs);

  const GRASS = [[1161, 719], [744, 767], [72, 645], [180, 843], [1279, 658], [1020, 827], [945, 642], [482, 801], [543, 650], [1308, 808], [296, 693], [225, 719], [726, 852], [442, 843], [1142, 749]];
  // 1
  $('s1mL').innerHTML = FIG.s1mL;
  $('s1mR').innerHTML = FIG.s1mR;
  $('s1hz').innerHTML = FIG.s1ground;
  $('s1gr').innerHTML = FIG.s1grass;
  const W1 = A.wheel(220, { seed: 41, parts: true });
  $('s1disc').innerHTML = W1.disc; $('s1spk').innerHTML = W1.spokes; $('s1rim').innerHTML = W1.rim;
  $('s1sqg').innerHTML = A.squirrel2();
  $('s1bigsq').innerHTML = A.squirrel2();
  $('rewsqg').innerHTML = A.squirrel2();
  $('s1ohg').innerHTML = FIG.s1oh;
  $('s1stick').innerHTML = A.stick(400);
  // 2
  $('s2rot').innerHTML = A.wheel(278, { seed: 51 });
  $('s2mo').innerHTML = (() => {
    const arc = (R, a0, a1) => { const r = (d) => d * Math.PI / 180, p = (d) => `${(R * Math.cos(r(d))).toFixed(1)} ${(R * Math.sin(r(d))).toFixed(1)}`; return `<path d="M${p(a0)}A${R} ${R} 0 0 1 ${p(a1)}"/>`; };
    return [[318, 150, 182], [318, 196, 214], [352, 160, 198], [318, -12, 22], [318, 34, 50], [352, -22, 14]].map((v) => arc(...v)).join('');
  })();
  $('s2ulp').innerHTML = FIG.s2ul;
  // 3
  $('s3gr').innerHTML = FIG.s3grass;
  $('s3ulg').innerHTML = FIG.s3ul;
  $('s3sayg').innerHTML = FIG.s3b;
  $('s3rot').innerHTML = A.wheel(80, { seed: 61 });
  // 4
  $('s4bogg').innerHTML = FIG.bog;
  // v93: на широком экране по краям болота тоже растения, корешки и штрихи — копии крайних деталей, отражённые по месту
  // (каждая деталь переносится на зеркальную позицию, но сама не переворачивается — «b» не превращается в «d»)
  { const g = $('s4bogg'); let side = '';
    g.querySelectorAll(':scope > path.t').forEach((pth) => {
      const xs = (pth.getAttribute('d').match(/-?\d+\.?\d*/g) || []).filter((_, i) => i % 2 === 0).map(Number);
      const mn = Math.min(...xs), mx = Math.max(...xs), c = (mn + mx) / 2;
      if (mx < 460) side += `<g transform="translate(${(-2 * c).toFixed(1)} 0)">${pth.outerHTML}</g>`;
      else if (mn > 980) side += `<g transform="translate(${(2880 - 2 * c).toFixed(1)} 0)">${pth.outerHTML}</g>`;
    });
    g.insertAdjacentHTML('beforeend', `<g class="bogside">${side}</g>`); }
  $('s4rot').innerHTML = A.wheel(270, { seed: 71 });
  // 5: повозка из прежней версии, колесо — новое, под ней полоса земли
  (function () {
    const tpl = document.getElementById('tCart').cloneNode(true);
    tpl.removeAttribute('id');
    tpl.querySelectorAll('.red').forEach((n) => n.remove());
    const fig = tpl.querySelector('[data-fig="wheel"]');
    if (fig) { fig.innerHTML = A.wheel(80, { seed: 81 }); const c = fig.parentNode.querySelector('circle.bg'); c && c.remove(); }
    $('cart').querySelector('.labcart').appendChild(tpl);
  })();
  $('s5gr').innerHTML = FIG.s5grass.split('/>').filter((x) => { const m = x.match(/M([\d.]+) ([\d.]+)/); if (!m) return true; const X = +m[1], Y = +m[2]; return !(X > 300 && X < 1150 && Y > 690); }).join('/>');
  { const t = (k, x, y, sc, bx, by) => `<g transform="translate(${x} ${y}) scale(${sc}) translate(${-bx} ${-by})">${FIG[k]}</g>`;
    $('s5far').innerHTML = t('treeL', 120, 579, 1, 128, 586) + t('treeR', 250, 579, 0.6, 1327, 575) + t('treeR', 1330, 579, 1, 1327, 575) + t('treeL', 1200, 579, 0.62, 128, 586); }
  $('s5soil').innerHTML = A.soil(-520, 1960, 600, 64); $('s5soil').setAttribute('transform', 'translate(0 639) scale(1 1.18) translate(0 -639)'); $('s5far').innerHTML = '';
  // 6
  $('s6arc').innerHTML = A.arcade(1440, 839, 330);
  $('s6mg').innerHTML = A.monk();
  $('s6kg').innerHTML = A.king();
  const CH = A.chariotParts();
  $('s6wheel').innerHTML = CH.wheel; $('s6axle').innerHTML = CH.axle; $('s6body').innerHTML = CH.body; $('s6pole').innerHTML = CH.pole;
  // 7
  $('s7gr').innerHTML = FIG.s7grass;
  { const t = (k, x, y, sc, bx, by) => `<g transform="translate(${x} ${y}) scale(${sc}) translate(${-bx} ${-by})">${FIG[k]}</g>`;
    void t; // горы и деревья убраны — смене транспорта ничто не мешает; только птицы по небу
    const BW = [[40, 120], [170, 300], [300, 90], [95, 430], [380, 230], [520, 60], [610, 330], [880, 300], [960, 70], [1080, 210], [1200, 90], [1290, 330], [1395, 170], [1350, 440], [230, 520], [1180, 500], [740, 40]];
    const BP = [[470, 150], [640, 300], [820, 120], [960, 260], [520, 420], [900, 440], [720, 470], [990, 520]];
    $('s7far').innerHTML = '<g class="bd-wide">' + BW.map(([x, y], i) => A.birds(x, y, 1, 11 + i * 7)).join('') + '</g><g class="bd-port">' + BP.map(([x, y], i) => A.birds(x, y, 1, 13 + i * 5)).join('') + '</g>'; }
  $('s7sayg').innerHTML = FIG.s7say;
  $('s6qg').innerHTML = FIG.s6q; $('s6nog').innerHTML = FIG.s6no;
  $('s6q').querySelector('svg').setAttribute('viewBox', '61 225 234 124'); $('s6no').querySelector('svg').setAttribute('viewBox', '1145 225 234 124');
  $('s8arrowg').innerHTML = FIG.s8arrow;
  // v92: пятый транспорт — электрокар будущего (выдуманный, без марки): человек садится, колёса поджимаются, и он улетает
  VEH.v[4] = `<svg class="ill boil" viewBox="-460 20 1220 260" aria-hidden="true"><g class="walking">
    <g class="runner" transform="translate(-420 136)"><use href="#tRunner"/></g>
    <g class="flyer">
     <g transform="translate(760 0) scale(-1 1)"><!-- v93: нос вправо, по ходу движения -->
     <g class="thrust"><path class="t" d="M200 250l-10 22M232 252l-4 26M520 252l-4 26M552 250l-10 22"/></g>
     <path class="bg f-dark" d="M58 218C56 200 74 188 112 182L244 154C300 124 410 112 520 126L636 164C676 176 700 194 702 214L698 230H62Z"/>
     <path class="hf" d="M64 214H698L700 230H62Z"/>
     <path d="M270 156C320 132 420 126 500 136L566 164H292Z"/>
     <path class="t" d="M300 158C350 140 420 136 488 142"/>
     <path class="door" d="M330 166C328 186 330 204 334 222M440 166L444 222M392 182h18"/>
     <path class="t" d="M650 180C670 184 686 192 694 204M72 196l26-4"/>
     <circle class="fill pass" cx="402" cy="148" r="0"/>
     </g>
     <g class="wf" data-cy="236"><g class="spin" data-cx="170" data-cy="236" data-r="40"><circle class="bg f-dark" cx="170" cy="236" r="40"/><circle cx="170" cy="236" r="28"/><circle cx="170" cy="236" r="5"/><path class="t" d="M170 208C182 220 182 252 170 264M142 236C154 224 186 224 198 236"/></g></g>
     <g class="wf" data-cy="236"><g class="spin" data-cx="590" data-cy="236" data-r="40"><circle class="bg f-dark" cx="590" cy="236" r="40"/><circle cx="590" cy="236" r="28"/><circle cx="590" cy="236" r="5"/><path class="t" d="M590 208C602 220 602 252 590 264M562 236C574 224 606 224 618 236"/></g></g>
    </g>
   </g></svg>`;
  const VW = [[0, 940, 880], [1, 860, 700], [2, 560, 420], [3, 940, 830], [4, 1220, 1220]];
  const vehs = VW.map(([i, w, vw]) => {
    const d = document.createElement('div');
    d.className = 'veh';
    d.style.width = w + 'px';
    d.innerHTML = VEH.v[i];
    d.querySelectorAll('.red').forEach((n) => n.remove());
    $('s7road').appendChild(d);
    return { el: d, w, vw, spins: $$('.spin', d).map((g) => ({ g, cx: +g.dataset.cx, cy: +g.dataset.cy, r: +g.dataset.r })), px: null };
  });
  const VNAME2 = [['', 'опять она'], ['', 'спицы всё те&nbsp;же'], ['', 'педалей<br>всё ещё нет'], ['', 'он снова<br>уехал без&nbsp;вас'], ['', 'и снова<br>без колёс']];
  const VNAME = [['Телега', 'медленно,<br>зато верно'], ['Колесница', 'со&nbsp;спицами'], ['Дрезина', 'педалей<br>ещё нет'], ['Автобус', 'он сейчас<br>уедет без&nbsp;вас'], ['Электрокар', 'а&nbsp;колёса<br>ещё нужны?']];
  // 8
  // финал: одни и те же 12 линий перестраиваются из одного колеса в другое
  const NP = 48, NS = 12;
  const C = (cx, cy, r, a0 = 0, a1 = Math.PI * 2, ry = r) => (t) => [cx + r * Math.cos(a0 + (a1 - a0) * t), cy + ry * Math.sin(a0 + (a1 - a0) * t)];
  const L = (x0, y0, x1, y1) => (t) => [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
  const RR = (w, h, r, cy = 0) => (t) => { // скруглённый прямоугольник по периметру
    const P = 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r; let d = t * P; const x0 = -w / 2, y0 = cy - h / 2;
    const seg = [[w - 2 * r, (u) => [x0 + r + u, y0]], [Math.PI * r / 2, (u) => { const q = -Math.PI / 2 + u / r; return [x0 + w - r + r * Math.cos(q), y0 + r + r * Math.sin(q)]; }], [h - 2 * r, (u) => [x0 + w, y0 + r + u]], [Math.PI * r / 2, (u) => { const q = u / r; return [x0 + w - r + r * Math.cos(q), y0 + h - r + r * Math.sin(q)]; }], [w - 2 * r, (u) => [x0 + w - r - u, y0 + h]], [Math.PI * r / 2, (u) => { const q = Math.PI / 2 + u / r; return [x0 + r + r * Math.cos(q), y0 + h - r + r * Math.sin(q)]; }], [h - 2 * r, (u) => [x0, y0 + h - r - u]], [Math.PI * r / 2, (u) => { const q = Math.PI + u / r; return [x0 + r + r * Math.cos(q), y0 + r + r * Math.sin(q)]; }]];
    for (const [l, f] of seg) { if (d <= l) return f(d); d -= l; } return [x0 + r, y0]; };
  const GEAR = (R, r, n) => (t) => { const a = t * Math.PI * 2, k = (a * n / (Math.PI * 2)) % 1, rr = k < 0.15 ? r + (R - r) * k / 0.15 : k < 0.5 ? R : k < 0.65 ? R - (R - r) * (k - 0.5) / 0.15 : r; return [rr * Math.cos(a), rr * Math.sin(a)]; };
  const spokes = (n, r0, r1, a0 = 0) => Array.from({ length: n }, (_, i) => { const q = a0 + i * Math.PI * 2 / n; return L(r0 * Math.cos(q), r0 * Math.sin(q), r1 * Math.cos(q), r1 * Math.sin(q)); });
  const pad = (arr) => { while (arr.length < NS) arr.push(arr[arr.length % 3]); return arr.slice(0, NS); };
  const FORMS = [
    pad([C(0, 0, 175), C(0, 0, 150), C(0, 0, 22), ...spokes(8, 22, 150, -Math.PI / 8), C(0, 0, 8)]),               // колесо из болота
    pad([C(0, 0, 165), C(0, 0, 140), L(-120, 0, 120, 0), L(-100, -10, 100, -10), L(-100, 10, 100, 10), C(0, 0, 165), C(0, 0, 140), L(-120, 0, 120, 0), L(-120, 0, 120, 0), L(-120, 0, 120, 0), L(-120, 0, 120, 0), C(0, 0, 140)]), // таблетка
    pad([C(0, 0, 175), C(0, 0, 150), C(0, 0, 34), L(-150, 0, -34, 0), L(150, 0, 34, 0), L(0, 150, 0, 34), L(-150, 8, -34, 8), L(150, 8, 34, 8), L(-8, 150, -8, 34), L(8, 150, 8, 34), L(0, 150, 0, 34), C(0, 0, 14)]), // руль
    pad([C(0, -30, 160), C(0, -30, 150), C(0, -30, 16), ...spokes(6, 16, 150, 0).map((f) => (t) => { const [x, y] = f(t); return [x, y - 30]; }), L(0, -30, -110, 190), L(0, -30, 110, 190), L(-150, 190, 150, 190)]), // колесо обозрения
    pad([RR(190, 300, 90, 10), L(-95, -60, 95, -60), L(0, -140, 0, -60), RR(26, 60, 13, -95), L(0, -140, 0, -140), L(0, -140, 0, -140), L(0, -140, 0, -140), L(-95, -60, -95, -60), L(95, -60, 95, -60), RR(26, 60, 13, -95), L(0, -140, 0, -60), C(0, 80, 6)]), // мышка
    pad([GEAR(178, 150, 12), C(0, 0, 120), C(0, 0, 34), ...spokes(6, 34, 120, Math.PI / 6), C(0, 0, 14), C(0, 0, 100), C(0, 0, 22)]), // шестерёнка
  ];
  const FP = FORMS.map((F) => F.map((f) => Array.from({ length: NP }, (_, i) => f(i / (NP - 1)))));
  $('s8shapes').innerHTML = Array.from({ length: NS }, () => '<path class="draw" pathLength="1"/>').join('');
  const shapes = $$('#s8shapes path');
  function morph(i, j, t) {
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    shapes.forEach((p, s) => {
      const A0 = FP[i][s], A1 = FP[j][s];
      let d = '';
      for (let k = 0; k < NP; k++) { const x = A0[k][0] + (A1[k][0] - A0[k][0]) * e, y = A0[k][1] + (A1[k][1] - A0[k][1]) * e; d += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
      p.setAttribute('d', d);
    });
  }
  morph(0, 0, 0);
  $('s8shades').innerHTML = [
    '<path class="hf" d="M0 -150A150 150 0 0 1 0 150A100 150 0 0 0 0 -150Z" opacity=".4"/>',
    '<path class="hf" d="M0 0H140A140 140 0 0 1 -140 0Z" opacity=".5"/>',
    '<path class="hf" d="M0 -175A175 175 0 0 1 175 0H150A150 150 0 0 0 0 -150Z" opacity=".6"/><circle class="hf" r="34" opacity=".6"/>',
    '<circle class="hf" cy="-30" r="16" opacity=".7"/>',
    '<path class="hf" d="M0 -60H95V100Q95 160 0 160Z" opacity=".45"/>',
    '<circle class="hf" r="120" opacity=".35"/>',
  ].map((g) => `<g style="opacity:0">${g}</g>`).join('');
  const shades = [...$('s8shades').children];
  $('s8rot').innerHTML = A.wheel(170, { seed: 93 });
  A.setSeed(95);
  const CAPS = ['то самое, из болота', 'таблетка — тоже колесо', 'этим колесом можно рулить', 'а на этом даже покататься)', '', 'оно даже в шестерёнке'];

  /* ── счётчик настоящих прокруток ── */
  let turns = 0, lastTouch = null;
  addEventListener('wheel', () => { turns++; }, { passive: true });
  addEventListener('touchmove', (e) => { const y = e.touches[0].clientY; if (lastTouch === null) lastTouch = y; else if (Math.abs(y - lastTouch) > 60) { turns++; lastTouch = y; } }, { passive: true });
  addEventListener('touchend', () => { lastTouch = null; });
  addEventListener('keydown', (e) => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(e.key)) turns++; });

  /* ── сцены ── */
  const S = {};
  let s1covT = null, lap = 0, hint = false, s2done = false, ending = false, chase = 0, chaseT0 = null;
  const word = $('s1word'), letters = $$('span', word);
  // центры белки на шагах 2–9 из Figma (группа 101×74), затем — внутрь последней «о»
  const HOP = [[111, 29], [76, 128], [229, 204], [399, 303], [562, 342], [729, 347], [831, 378], [988, 346], [1033, 450]];
  const SQ = 0.45; // масштаб маленькой белки (≈101 px шириной)
  // колесо: шаг 10 → 11 → 12 → 13
  const RING = [[0.335, 1042.2, 450, 62.6], [0.39, 1091, 489, 187], [0.45, 750, 516, 187], [0.52, 720, 544, 218]];
  // v71: колесо и последняя белка — по настоящей букве «о» (шрифт Desyatiy)
  function calibrate() {
    try {
      const o = letters[5], cs = getComputedStyle(word), fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight) || 265;
      const c = document.createElement('canvas').getContext('2d');
      c.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
      const m = c.measureText('о');
      const A = m.fontBoundingBoxAscent, D = m.fontBoundingBoxDescent;
      const base = 318 + (lh - (A + D)) / 2 + A;
      const cx = o.offsetLeft + o.offsetWidth / 2 + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft - m.width) / 2;
      const cy = base - (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
      const r = (m.actualBoundingBoxRight + m.actualBoundingBoxLeft) / 2 * 1.04;
      if (isFinite(cx) && isFinite(cy) && r > 20) { RING[0][1] = cx; RING[0][2] = cy; RING[0][3] = r; HOP[HOP.length - 1] = [cx - 9, cy]; }
    } catch (e) {}
  }
  // v86: «Ловите!» / «Ещё раз!» — по центру экрана по реальному контуру букв, подписи на одной линии под краями слова
  function alignHead() {
    try {
      const el = $('s1catch'), cs = getComputedStyle(el), c = document.createElement('canvas').getContext('2d');
      c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const txt = el.textContent.trim(), m = c.measureText(txt), fs = parseFloat(cs.fontSize);
      const inkW = m.actualBoundingBoxRight + m.actualBoundingBoxLeft, shift = m.width / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
      el.style.translate = `${shift.toFixed(1)}px 0`;
      // v91: подписи снова лесенкой (как в макете), позиции — в style.css
    } catch (e) {}
  }
  // v97: «что смотрите?» начинается ровно под левым краем «К», «листайте дальше!» кончается под правым краем «о»
  function alignIntro() {
    const i1 = $('s1i1'), i2 = $('s1i2');
    if (PORT) { i1.style.left = i2.style.left = ''; return; }
    try {
      const cs = getComputedStyle(word), c = document.createElement('canvas').getContext('2d');
      c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const a = letters[0], b = letters[letters.length - 1], ma = c.measureText(a.textContent), mb = c.measureText(b.textContent);
      const x0 = word.offsetLeft + a.offsetLeft - ma.actualBoundingBoxLeft, x1 = word.offsetLeft + b.offsetLeft + mb.actualBoundingBoxRight;
      i1.style.left = x0.toFixed(0) + 'px'; i2.style.left = (x1 - i2.offsetWidth).toFixed(0) + 'px';
    } catch (e) {}
  }
  addEventListener('resize', () => setTimeout(alignIntro, 60));
  addEventListener('resize', () => setTimeout(alignHead, 60));
  // v71: буквы «Колесо» выкатываются из разных углов экрана к центру
  function rollIn(done) {
    const w = word;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !w.animate) { w.classList.add('in'); introCaps(); if (done) done(); return; }
    w.classList.add('roll');
    const vw = innerWidth, vh = innerHeight, k = w.getBoundingClientRect().width / w.offsetWidth || 1;
    // v87: буквы катятся по линии, как колёса: К-о-л слева, е-с-о справа, оборот — по пройденному пути, в конце колесо качается и встаёт
    const rects = letters.map((el) => el.getBoundingClientRect());
    const half = Math.ceil(letters.length / 2);
    const DL = Math.max(...rects.slice(0, half).map((b) => b.right)) + 40, DR = vw - Math.min(...rects.slice(half).map((b) => b.left)) + 40;
    let left = letters.length;
    letters.forEach((el, i) => {
      const fromLeft = i < half, sgn = fromLeft ? 1 : -1;
      const dx = (fromLeft ? -DL : DR) / k, r = el.offsetHeight * 0.33;
      const turn = (-dx / r) * 57.2958; // качение без проскальзывания
      const delay = 100;
      // едут поездом и с разгона врезаются друг в друга в середине слова
      const a = el.animate([
        { transform: `translateX(${dx.toFixed(1)}px) rotate(${(-turn).toFixed(0)}deg)`, easing: 'cubic-bezier(.3,.45,.55,1)' },
        { transform: 'translateX(0) rotate(0deg)' }
      ], { duration: 1500, delay, fill: 'backwards' });
      a.onfinish = () => { if (--left === 0) { crash(); introCaps(); if (done) done(); } };
    });
  }
  // удар: импульс расходится от места столкновения (между «л» и «е») к краям слова и затухает
  const INTRO = [0, 0];
  function introCaps() {
    if (lap) return;
    const els = [$('s1i1'), $('s1i2')], t0 = performance.now() + 800; // v103: 0,8 с после выкатывания букв
    (function st(now) {
      let busy = false;
      els.forEach((el, i) => { const t = cl((now - t0 - i * 700) / 350); /* v101: целиком, без прорисовки слева направо */ INTRO[i] = t; ul(el, t > 0 ? 1 : 0); if (t < 1) busy = true; });
      tick();
      if (busy) requestAnimationFrame(st);
    })(performance.now());
  }
  function crash() {
    const half = Math.ceil(letters.length / 2);
    letters.forEach((el, i) => {
      const side = i < half ? -1 : 1, dist = i < half ? half - 1 - i : i - half, amp = 44 * Math.pow(0.62, dist), r = el.offsetHeight * 0.33;
      const R = (x) => (x / r * 57.3).toFixed(1);
      el.animate([
        { transform: 'translate(0,0) rotate(0deg) scale(1,1)' },
        { transform: `translate(${(side * amp * 0.2).toFixed(1)}px,0) rotate(0deg) scale(${(1 - amp * 0.004).toFixed(3)},${(1 + amp * 0.003).toFixed(3)})`, offset: 0.08 },
        { transform: `translate(${(side * amp).toFixed(1)}px,${(-amp * 0.45).toFixed(1)}px) rotate(${R(side * amp)}deg) scale(1,1)`, offset: 0.3 },
        { transform: `translate(${(-side * amp * 0.32).toFixed(1)}px,0) rotate(${R(-side * amp * 0.32)}deg)`, offset: 0.55 },
        { transform: `translate(${(side * amp * 0.1).toFixed(1)}px,0) rotate(${R(side * amp * 0.1)}deg)`, offset: 0.78 },
        { transform: 'translate(0,0) rotate(0deg) scale(1,1)' }
      ], { duration: 900, delay: dist * 55, easing: 'ease-out' });
    });
  }
  // белка приземляется на букву — буква проседает под ней и пружинит обратно
  let landed = -1;
  function bump(hx, hy, dir) {
    if (hy < 230 || hy > 480) return;
    let best = null, bd = 1e9;
    letters.forEach((el) => { const cx = el.offsetLeft + el.offsetWidth / 2, d = Math.abs(cx - hx); if (d < bd) { bd = d; best = el; } });
    if (!best || bd > best.offsetWidth * 0.8 || reduce) return;
    const r = dir * 9;
    best.animate([
      { transform: 'translateY(0) rotate(0deg) scale(1,1)' },
      { transform: `translateY(26px) rotate(${r}deg) scale(1.08,.84)`, offset: 0.18 },
      { transform: `translateY(-14px) rotate(${(-r * 0.6).toFixed(1)}deg) scale(.96,1.06)`, offset: 0.45 },
      { transform: `translateY(4px) rotate(${(r * 0.25).toFixed(1)}deg) scale(1,1)`, offset: 0.7 },
      { transform: 'translateY(0) rotate(0deg) scale(1,1)' }
    ], { duration: 650, easing: 'ease-out' });
  }
  // портрет: слово «Колесо» меньше (PS), прыжки белки и первые кольца сжимаются к центру слова
  const pt = (x, y) => (PORT ? [720 + (x - 720) * PS, 450 + (y - 450) * PS] : [x, y]);
  function ringAt(p) {
    const R0 = RING.map((q, i) => (PORT && i < 2 ? [q[0], ...pt(q[1], q[2]), q[3] * PS] : q));
    return ringAt0(p, R0);
  }
  function ringAt0(p, RING) {
    if (p <= RING[0][0]) return RING[0].slice(1);
    for (let i = 1; i < RING.length; i++) {
      if (p <= RING[i][0]) { const t = ez(sg(p, RING[i - 1][0], RING[i][0])); return [0, 1, 2].map((k) => lerp(RING[i - 1][k + 1], RING[i][k + 1], t)); }
    }
    return RING[RING.length - 1].slice(1);
  }

  S.s1 = (p) => {
    // слово: маленькое → большое; затем вверх (шаг 12 — top 207, шаг 13 — top 68)
    const ws = 1; // v83: слово сразу крупное — буквы выкатываются уже в полном размере
    const top = p < 0.39 ? 318 : p < 0.45 ? lerp(318, 207, ez(sg(p, 0.39, 0.45))) : lerp(207, TAB ? -30 : PORT ? 20 : 68, ez(sg(p, 0.45, 0.52)));
    const PT = PORT ? 0.62 : 1;
    word.style.transform = `translateY(${(top - 68).toFixed(1)}px) scale(${(ws * (PORT ? PS : 1)).toFixed(4)})`;
    const swp = sg(p, 0.64, 0.68);
    op(word, 1 - sg(p, 0.6, 0.635));
    // v91: «смотрите?» / «листайте дальше!» — появляются сами после удара букв, растворяются с первым скроллом
    { const out = lap ? 0 : 1 - sg(p, 0.003, 0.016); op($('s1i1'), INTRO[0] * out); op($('s1i2'), INTRO[1] * out); } // v93: при повторе — только «о, вы вернулись»
    { const bk = $('s1back'), v = lap ? 1 - sg(p, 0.07, 0.1) : 0; op(bk, v); ul(bk, lap ? sg(p, 0.005, 0.03) : 0); }
    const cat = $('s1catch'); op(cat, swp > 0 ? 1 : 0); sw(cat, swp);
    letters[5].style.opacity = (1 - sg(p, 0.31, 0.335) + sg(p, 0.35, 0.39)).toFixed(3);

    // колесо
    const [cx0, cy, r] = ringAt(p);
    const roll = sg(p, 0.67, 0.77);
    const rx = roll < 0.23 ? lerp(720, 876, roll / 0.23) : roll < 0.46 ? lerp(876, 1001, (roll - 0.23) / 0.23) : lerp(1001, 1860 + MM, ez((roll - 0.46) / 0.54) * 0.5 + ((roll - 0.46) / 0.54) * 0.5); // v95: на широком экране уезжает дальше за край
    const cx = p < 0.67 ? (PORT ? lerp(cx0, 720, 0) : cx0) : rx;
    const rot = p * 1800 + ((cx - 720) / 218) * 57.3;
    put($('s1wheel'), cx, cy, r / 220, rot, sg(p, 0.31, 0.335));
    op($('s1disc'), sg(p, 0.46, 0.52)); op($('s1spk'), sg(p, 0.47, 0.53));

    // белка
    const sq = $('s1sq');
    const hopA = 0.02, hopW = 0.0275; // v91: белка стартует почти сразу, как только начали листать
    let x, y, s = SQ, o = sg(p, 0.004, 0.02), rr = 0;
    if (p < 0.43) {
      const k = Math.floor((p - hopA) / hopW);
      if (p < hopA) { [x, y] = pt(...HOP[0]); landed = -1; }
      else if (k < HOP.length - 1) {
        const t = ez(sg(p, hopA + k * hopW, hopA + (k + 0.8) * hopW));
        const a = pt(...HOP[k]), b = pt(...HOP[k + 1]);
        x = lerp(a[0], b[0], t); y = lerp(a[1], b[1], t) - Math.sin(Math.PI * t) * (k < 2 ? 40 : 70);
        rr = t > 0 && t < 1 ? lerp(-14, 12, t) : 0;
        if (k === HOP.length - 2) s = lerp(SQ, (r / 220) * 0.9, t);
        { const ld = t >= 1 ? k : k - 1; if (ld > landed && ld >= 0) bump(HOP[ld + 1][0], HOP[ld + 1][1], HOP[ld + 1][0] >= HOP[ld][0] ? 1 : -1); landed = ld; }
      } else { x = cx; y = cy; s = (r / 220) * 0.9; }
      if (p >= hopA + (HOP.length - 1.2) * hopW) { // внутри колеса — бежит
        x = cx; y = cy + r * 0.38; s = (r / 220) * 0.95;
        sq.classList.toggle('alt', Math.floor(performance.now() / 110) % 2 === 1);
      } else sq.classList.remove('alt');
    } else { x = cx; y = cy + r * 0.38; s = (r / 220) * 0.95; sq.classList.toggle('alt', Math.floor(performance.now() / 110) % 2 === 1); }
    o = Math.min(o, 1 - sg(p, 0.47, 0.5));
    if (PORT && p < hopA + (HOP.length - 1.2) * hopW) s *= PS;
    put(sq, x, y, s, rr, o);

    // пейзаж
    const land = sg(p, 0.50, 0.565);
    dr($('s1mL'), land); dr($('s1mR'), land); dr($('s1gr'), sg(p, 0.52, 0.575));
    $('s1hz').style.opacity = land.toFixed(3);

    // палка в колесо
    const zone = $('s1stickzone'), hn = $('s1hint');
    zone.style.pointerEvents = 'none';
    put(zone, cx, cy, 1, 0);
    // подсказка появляется сама, по скроллу, когда колесо уже покатилось
    hn.classList.toggle('on', p > 0.695 && p < 0.765);
    hn.style.transform = PORT && !TAB ? 'translate(470px,300px)' : `translate(${(cx - 102).toFixed(1)}px,${(387).toFixed(1)}px)`;

    // не успели / оно укатилось
    const n1 = sg(p, 0.765, 0.785), n2 = sg(p, 0.795, 0.815); // v91: строго по одной
    op($('s1n1'), n1); ul($('s1n1'), n1); op($('s1n2'), n2); ul($('s1n2'), n2);

    // большая белка выглядывает справа: «о нет((»
    const inn = ez(sg(p, 0.81, 0.84)), out = ez(sg(p, 0.895, 0.92));
    const big = $('s1big');
    const bt = PORT ? (TAB ? 845 : 600) : 1120;
    const bx = out > 0 ? lerp(bt, 1900 + MM, out) : lerp(1900 + MM, bt, inn); // v95: прячется дальше за край
    big.style.transform = `translate(${bx.toFixed(1)}px,${(250).toFixed(1)}px) scale(${PORT ? (TAB ? 1.05 : 0.5) : 1}) scaleX(${out > 0 ? 1 : -1})`;
    big.classList.toggle('alt', ((inn > 0 && inn < 1) || (out > 0 && out < 1)) && Math.floor(performance.now() / 110) % 2 === 1);
    op($('s1oh'), sg(p, 0.84, 0.85) - sg(p, 0.885, 0.895));
    // после перемотки от счётчика — заставка «Попробуй всё-таки догнать колесо»
    { const cv = $('s1cov'), on = s2done && p > 0.9;
      cv.style.transform = on ? 'none' : 'translateY(100%)';
      sw($('s1covt'), on && s1covT !== null ? cl((performance.now() - s1covT) / 1400) : on ? 1 : 0); }
  };

  // прыжки белки по слову проходят быстрее: участок 0.07–0.31 занимает на 40% меньше прокрутки
  { const f = S.s1, A0 = 0.07, A1 = 0.31, K = 0.6;
    S.s1 = (q) => {
      const L = parseFloat(getComputedStyle($('s1')).getPropertyValue('--len')) || 11.85, Lo = L * 13 / 11.85;
      const R = L - 1, Ro = Lo - 1, x = q * R, a = A0 * Ro, b = (A1 - A0) * Ro * K;
      const p = x < a ? x / Ro : x < a + b ? A0 + (x - a) / b * (A1 - A0) : A1 + (x - a - b) / Ro;
      f(Math.min(1, p));
    }; }
  // v75: барабанный счётчик — каждая цифра на своём барабане, старшие доворачиваются при переносе
  function odo(el, y) {
    if (!el._od) { el.textContent = ''; el._od = []; for (let k = 0; k < 4; k++) { const s = document.createElement('span'); s.className = 'od'; const b = document.createElement('b'); b.innerHTML = '01234567890'.split('').map((d) => `<i>${d}</i>`).join(''); s.appendChild(b); el.prepend(s); el._od.push({ s, b }); } el.setAttribute('aria-label', ''); }
    const n = Math.max(1, Math.round(y)), digits = String(n).length;
    el.setAttribute('aria-label', String(n));
    for (let k = 0; k < 4; k++) {
      const { s, b } = el._od[k], d = Math.floor(n / Math.pow(10, k)) % 10;
      s.style.display = k < digits ? '' : 'none';
      if (el._od[k].d === d) continue;
      // быстрые разряды (единицы, десятки) щёлкают, медленные (сотни, тысячи) прокатываются барабаном
      const prev = el._od[k].d, roll = k >= 2 && prev !== undefined && Math.abs(d - prev) === 1;
      b.style.transition = roll ? 'transform .32s cubic-bezier(.3,1.4,.5,1)' : 'none';
      b.style.transform = `translateY(${(-d * 0.86).toFixed(2)}em)`;
      el._od[k].d = d;
    }
  }
  S.s2 = (p) => {
    const c = ez(sg(p, 0.05, 0.28));
    const i = Math.round(c * 5175);
    { const v = c * 5175, yr = v <= 2025 ? 2026 - v : v - 2025; odo($('s2year'), Math.max(1, yr)); }
    const era = $('s2era'), lbl = i === 0 ? 'сегодня' : i <= 2025 ? 'нашей эры' : 'до нашей эры';
    if (era.firstChild.nodeValue !== lbl) era.firstChild.nodeValue = lbl;
    op($('s2tick'), sg(p, 0.29, 0.34) - sg(p, 0.40, 0.44));
    $('s2tick').textContent = 'тик-так';
    const out = sg(p, 0.40, 0.44), cnt = $('s2count');
    op($('s2frame'), 1 - out);
    const u = $('s2ulp'); if (u.dataset.w !== (i === 0 ? 's' : 'l')) { u.dataset.w = i === 0 ? 's' : 'l'; u.setAttribute('transform', i === 0 ? 'translate(633 -10) scale(0.559 1) translate(-572 0)' : ''); }
    cnt.style.opacity = (1 - out).toFixed(3); cnt.style.transform = `translateY(${(-50 * out).toFixed(1)}px)`;
    const tx = $('s2text');
    op(tx, sg(p, 0.44, 0.45) - sg(p, 0.68, 0.72));
    sw($('s2h'), sg(p, 0.44, 0.53));
    op($('s2sub'), sg(p, 0.5, 0.53));
    const t1 = ez(sg(p, 0.55, 0.62)), t2 = ez(sg(p, 0.62, 0.69)), t3 = ez(sg(p, 0.69, 0.75));
    tx.style.transform = `translateY(${(lerp(0, -224, t1) + lerp(0, -242, t2)).toFixed(1)}px)`;
    const wx = lerp(104, 701, t1) /* v91: колесо въезжает с левого края */, wy = lerp(824, 711, t1) + lerp(0, -223, t2) + lerp(0, -67, t3) + (TAB ? lerp(150, -70, t3) : PORT ? lerp(120, -60, t3) : 0);
    put($('s2wheel'), wx, wy, 1, ((wx - 104) / 278) * 57.3 + sg(p, 0.62, 1) * 1500 + SPIN, sg(p, 0.545, 0.56));
    dr($('s2mo'), sg(p, 0.64, 0.7));
    op($('s2where'), sg(p, 0.76, 0.8));
    if (p > 0.9 && !s2done && !ending) { s2done = true; rewindToS1(); }
  };

  let s3jump = false;
  // v79: пыльный след за колесом в погоне — рисованные клубки пыли растут, поднимаются и рассеиваются
  const DUST = [];
  let dustX = null;
  function dust(x, y, wx, Z, show) {
    const lay = $('s3dust'); if (!lay) return;
    const now = performance.now();
    if (dustX === null || show < 0.5) dustX = wx;
    const dx = wx - dustX;
    if (Math.abs(dx) > 16 && DUST.length < 40 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const dir = Math.sign(dx), n = 1 + (Math.random() < 0.5);
      for (let k = 0; k < n; k++) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = '';
        const r0 = 9 + Math.random() * 7, gap = 0.5 + Math.random() * 0.6, st = Math.random() * 6.28;
        for (let i = 0; i <= 12; i++) { const a = st + (i / 12) * (6.28 - gap), r = r0 * (0.8 + Math.random() * 0.4); d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r * 0.8).toFixed(1); }
        el.setAttribute('d', d); el.setAttribute('class', 't');
        lay.appendChild(el);
        DUST.push({ el, x: x - dir * (30 + Math.random() * 30) * Z, y: y - Math.random() * 14 * Z, dir, Z, t0: now, life: 1100 + Math.random() * 700, sp: 0.6 + Math.random() * 0.8 });
      }
      dustX = wx;
    }
    for (let i = DUST.length - 1; i >= 0; i--) {
      const q = DUST[i], a = (now - q.t0) / q.life;
      if (a >= 1) { q.el.remove(); DUST.splice(i, 1); continue; }
      const sc = (0.5 + a * 1.6) * q.Z, xx = q.x - q.dir * a * 50 * q.sp * q.Z, yy = q.y - a * 34 * q.sp * q.Z;
      q.el.setAttribute('transform', `translate(${xx.toFixed(1)} ${yy.toFixed(1)}) scale(${sc.toFixed(2)})`);
      q.el.style.opacity = (0.75 * Math.pow(1 - a, 1.4) * show).toFixed(3);
    }
  }
  S.s3 = (p) => {
    sw($('s3h'), sg(p, 0, 0.1));
    op($('s3run'), sg(p, 0.05, 0.08)); op($('s3ulg'), sg(p, 0.05, 0.08));
    { // на телефоне подчёркивание со стрелкой подгоняем под длину «побежать за ним»
      const g = $('s3ulg'), l = $('s3run'), key = innerWidth + 'x' + innerHeight + (document.fonts ? document.fonts.status : '');
      if (g._fk !== key) { g._fk = key;
        {
          const r = document.createRange(); r.selectNodeContents(l); const q = r.getBoundingClientRect(), lr = l.getBoundingClientRect(), sc = lr.width / l.offsetWidth;
          const L = l.offsetLeft + (q.left - lr.left) / sc, R = L + q.width / sc, B = l.offsetTop + (q.bottom - lr.top) / sc;
          const sx = (R - L + 6) / 191.5, sy = parseFloat(getComputedStyle(l).fontSize) / 24;
          g.style.transform = `translate(${(L - 589.8 * sx).toFixed(1)}px,${(B + 2 * sy - 316 * sy).toFixed(1)}px) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
        }
      } }
    const show = sg(p, 0.07, 0.12);
    if (chaseT0 !== null) chase = cl((performance.now() - chaseT0) / 2800);
    const c = Math.max(sg(p, 0.1, 0.64), ez(chase));
    const m0 = PORT ? (TAB ? 480 : 605) : 327, w0 = PORT ? (TAB ? 880 : 850) : 744;
    const PH0 = PORT && !TAB, mx = lerp(m0, PH0 ? 1113 : 1750, c), wx = lerp(w0, PH0 ? 1187 : 1950, Math.pow(c, 0.85));
    const running = c > 0.001 && c < 0.999;
    const pose = running ? 1 + (Math.floor(performance.now() / 140) % 2) : 0;
    const mg = $('s3mang');
    if (mg.dataset.pose !== String(pose)) { mg.dataset.pose = pose; mg.innerHTML = A.man(pose, 51); }
    const PH = PORT && !TAB, Z = PH ? 1.35 : 1, zx = (x) => 720 + (x - 720) * Z, zy = (y) => 300 + (y - 300) * Z;
    put($('s3man'), zx(mx), zy(776 - 165), Z, 0, show);
    put($('s3wh'), zx(wx), zy(601), Z, (wx - w0) / 80 * 57.3 + SPIN, show);
    dust(zx(wx), zy(601) + 80 * Z, wx, Z, show);
    if (show > 0) look($('s3man'));
    op($('s3say'), sg(c, 0.08, 0.14) - sg(c, 0.6, 0.66));
    put($('s3say'), PH ? zx(mx) + 110 : mx + (PORT ? (TAB ? 90 : 60) : 237), PH ? 390 : PORT ? 380 : 428, PH ? 1.25 : PORT ? 0.85 : 1, 0);
    coverSeq($('s3cov'), p, 0.68, 0.76);
  };

  // v88: пузыри в болоте — пока колесо тонет, из торфа поднимаются рисованные пузырьки и лопаются
  const BUB = [];
  let bubT = null, bubShift = 0, bubAcc = 0;
  function bubPath(r) {
    let d = '';
    for (let i = 0; i <= 10; i++) { const a = i / 10 * 6.2832, rr = r * (0.92 + Math.random() * 0.16); d += (i ? 'L' : 'M') + (Math.cos(a) * rr).toFixed(1) + ' ' + (Math.sin(a) * rr).toFixed(1); }
    return d + 'Z';
  }
  function bubbles(p, shift, wcy) {
    const lay = $('s4bub'); if (!lay) return;
    const now = performance.now(), dt = bubT === null ? 16 : Math.min(60, now - bubT); bubT = now;
    const ds = shift - bubShift; bubShift = shift;
    const on = p > 0.37 && p < 0.72 && !reduce;
    if (on) {
      bubAcc += dt / 1000 * (4 + Math.min(12, Math.abs(ds) * 0.3));
      while (bubAcc >= 1 && BUB.length < 30) {
        bubAcc -= 1;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const r = 8 + Math.random() * 12;
        g.innerHTML = `<path class="t" d="${bubPath(r)}"/><path class="t" d="M${(-r * 0.5).toFixed(1)} ${(-r * 0.15).toFixed(1)}Q${(-r * 0.45).toFixed(1)} ${(-r * 0.55).toFixed(1)} ${(-r * 0.1).toFixed(1)} ${(-r * 0.6).toFixed(1)}"/>`;
        lay.appendChild(g);
        const side = Math.random() < 0.5 ? -1 : 1, near = Math.random() < 0.6;
        const mm = Math.max(0, parseFloat(getComputedStyle(root).getPropertyValue('--m')) || 0); // v92: на широком экране пузыри и по краям
        const x = near ? 720 + side * (310 + Math.random() * 140) : 120 - mm + Math.random() * (1200 + 2 * mm);
        const y = near ? wcy - 60 + Math.random() * 300 : 420 + Math.random() * 460;
        BUB.push({ g, x, y, r, t0: now, life: 1300 + Math.random() * 1200, rise: 70 + Math.random() * 130, ph: Math.random() * 6, pop: null });
      }
    } else bubAcc = 0;
    for (let i = BUB.length - 1; i >= 0; i--) {
      const b = BUB[i];
      b.y -= ds; // пузырь едет вместе с торфом
      const a = (now - b.t0) / b.life;
      if (b.pop === null && (a >= 1 || !on)) {
        b.pop = now;
        // лопнул: колечко и брызги
        let sp = `<circle class="t" r="${b.r.toFixed(1)}"/>`;
        for (let k = 0; k < 5; k++) { const ang = k / 5 * 6.2832 + Math.random() * 0.5; sp += `<circle class="fill" cx="${(Math.cos(ang) * b.r * 1.4).toFixed(1)}" cy="${(Math.sin(ang) * b.r * 1.4).toFixed(1)}" r="1.3"/>`; }
        b.g.innerHTML = sp; b.pa = Math.min(1, a);
      }
      if (b.pop !== null) {
        const q = (now - b.pop) / 280;
        if (q >= 1) { b.g.remove(); BUB.splice(i, 1); continue; }
        const yy = b.y - b.rise * b.pa;
        b.g.setAttribute('transform', `translate(${b.x.toFixed(1)} ${yy.toFixed(1)}) scale(${(1 + q * 1.3).toFixed(2)})`);
        b.g.style.opacity = (0.9 * (1 - q)).toFixed(2);
        continue;
      }
      const e = 1 - Math.pow(1 - a, 1.6), sc = 0.4 + Math.min(1, a * 2.5) * 0.6;
      const xx = b.x + Math.sin(b.ph + a * 7) * 5, yy = b.y - b.rise * e;
      b.g.setAttribute('transform', `translate(${xx.toFixed(1)} ${yy.toFixed(1)}) scale(${sc.toFixed(2)},${(sc * (1 + Math.sin(a * 20) * 0.06)).toFixed(2)})`);
      b.g.style.opacity = Math.min(1, a * 5).toFixed(2);
    }
  }
  S.s4 = (p) => {
    sw($('s4h'), sg(p, 0, 0.08));
    op($('s4ph'), sg(p, 0.06, 0.09)); op($('s4y'), sg(p, 0.09, 0.11));
    op($('s4p1'), sg(p, 0.11, 0.14)); op($('s4p2'), sg(p, 0.14, 0.17));
    // текст уезжает, сверху падает колесо; дальше колесо крутится на месте, а болото уходит вверх — колесо тонет
    const shift = 900 * ez(sg(p, 0.22, 0.36)) + 576 * sg(p, 0.40, 0.60);
    $('s4top').style.transform = `translateY(${(-shift - (PORT ? 420 * ez(sg(p, 0.22, 0.36)) : 0)).toFixed(1)}px)`;
    $('s4bog').style.transform = `translateY(${(-shift).toFixed(1)}px)`;
    const fall = ez(sg(p, 0.28, 0.40));
    const wx = 720, wy = lerp(-560, 450, fall) + shift, ws = 280 / 270;
    $('s4wh').style.transform = `translate(${(wx - 300).toFixed(1)}px,${(wy - 300 - 900).toFixed(1)}px) rotate(${(p * 1600 + SPIN).toFixed(1)}deg) scale(${ws.toFixed(3)})`;
    bubbles(p, shift, wy - shift);
    const tagsOut = sg(p, 0.71, 0.725);
    op($('s4t1'), sg(p, 0.60, 0.62) - tagsOut); op($('s4t2'), sg(p, 0.62, 0.64) - tagsOut);
    coverSeq($('s4c1'), p, 0.725, 0.75); textOut($('s4c1'), p, 0.8, 0.82);
    nextCover($('s4c2'), p, 0.82); textOut($('s4c2'), p, 0.88, 0.9);
    nextCover($('s4c3'), p, 0.9);
  };

  // лаборатория
  const P = { wheel: 0, axle: 0, body: 0, load: 0, ox: 0 };
  const cart = $('cart');
  function sayL() {
    if (!Object.values(P).some(Boolean)) return lap ? 'Снова с&nbsp;колеса. Порядок вы уже знаете' : 'Начните с&nbsp;колеса. С&nbsp;чего же ещё?';
    if (!P.wheel) return 'Без колеса её можно только тащить. Кряхтя.';
    if (!P.axle) return 'Держаться не&nbsp;за&nbsp;что&nbsp;— оси нет';
    if (!P.body) return 'Колёса крутятся, а&nbsp;груз лежит на&nbsp;земле';
    if (!P.ox) return 'Тянуть некому. Самим впрягаться?';
    if (!P.load) return 'Везём воздух. Очень разумно.';
    return lap ? 'Готово. Быка по-прежнему надо кормить' : 'Готово. Теперь быка надо кормить, а&nbsp;ось&nbsp;— смазывать';
  }
  let awayT = null;
  function labUpd() {
    for (const k in P) cart.classList.toggle('has-' + k, !!P[k]);
    const go = P.wheel && P.axle && P.body && P.ox;
    cart.classList.toggle('solo', !!(P.wheel && !P.axle));
    cart.querySelectorAll('.walking,.p-ox,.p-ox>g').forEach((x) => x.classList.toggle('moving', !!go));
    $('s5bt').innerHTML = sayL();
    $$('#parts .part').forEach((x) => x.setAttribute('aria-pressed', String(!!P[x.dataset.p])));
    clearTimeout(awayT);
    cart.classList.remove('away');
  }
  // если читатель не нажимает кнопки, повозка собирается сама по прокрутке; нажатая кнопка дальше управляется только читателем
  const touched = {};
  const EXP6P = { s6wheel: [-150, -440], s6axle: [140, -470], s6body: [-90, -640], s6pole: [-60, -540] };
  const EXP6 = { s6wheel: [-300, -90], s6axle: [160, 30], s6body: [-170, -230], s6pole: [330, -190] };
  const AUTO = [['wheel', 0.16], ['axle', 0.23], ['body', 0.30], ['ox', 0.37], ['load', 0.44]];
  $$('#parts .part').forEach((x) => x.addEventListener('click', () => { const k = x.dataset.p; touched[k] = true; P[k] = P[k] ? 0 : 1; labUpd(); }));
  labUpd();
  S.s5 = (p) => {
    sw($('s5h'), sg(p, 0.02, 0.12));
    op($('s5st'), sg(p, 0.06, 0.09)); ul($('s5st'), sg(p, 0.07, 0.11));
    op($('s5land'), sg(p, 0.08, 0.12)); op(cart, sg(p, 0.08, 0.12)); op($('parts'), sg(p, 0.1, 0.14));
    $('parts').style.pointerEvents = p > 0.08 && p < 0.74 ? 'auto' : 'none';
    let ch = false;
    for (const [k, t] of AUTO) { if (touched[k]) continue; const v = p >= t ? 1 : 0; if (P[k] !== v) { P[k] = v; ch = true; } }
    if (ch) labUpd();
    // собранная повозка уезжает только по прокрутке — экран не сменится, пока она не скроется за краем
    const ready = P.wheel && P.axle && P.body && P.ox && P.load;
    if (ready && Object.keys(touched).length && p < 0.44) shortcut($('s5'), p, 0.46);
    const rig = cart.querySelector('.rig');
    if (rig) { rig.style.transition = 'none'; rig.style.transform = ready ? `translateX(${(1500 * sg(p, 0.46, 0.73)).toFixed(1)}px)` : ''; }
    coverSeq($('s5cov'), p, 0.74, 0.82);
  };

  S.s6 = (p) => {
    const h = $('s6h');
    sw(h, sg(p, 0.02, 0.13));
    { const t = ez(sg(p, 0.13, 0.2)); h.style.transform = `translateY(${lerp(0, -520, t).toFixed(1)}px)`; h.style.opacity = (1 - sg(p, 0.14, 0.19)).toFixed(3); }
    const f = sg(p, 0.17, 0.21);
    op($('s6ch'), f); ['s6bg', 's6m', 's6k'].forEach((id) => op($(id), sg(p, 0.33, 0.42)));
    const s = 1.55;
    const s6s = PORT ? (TAB ? 1.4 : 1.15) : s; put($('s6m'), PORT ? (TAB ? 430 : 540) : 220, 839 - 140 * s6s, s6s, 0); put($('s6k'), PORT ? (TAB ? 1010 : 900) : 1220, 839 - 145 * s6s, s6s, 0);
    const win = (a, b) => sg(p, a, a + 0.02) - sg(p, b - 0.02, b);
    // сцена появляется с колесницей, разобранной на части, и вопросом внизу; по скроллу части собираются, потом диалог
    { const ex = 1 - ez(sg(p, 0.29, 0.41));
      const E = PORT && !TAB ? EXP6P : EXP6;
      for (const id in E) $(id).style.translate = `${(E[id][0] * ex).toFixed(1)}px ${(E[id][1] * ex).toFixed(1)}px`;
      op($('s6name'), sg(p, 0.2, 0.23) - sg(p, 0.29, 0.32)); ul($('s6name'), sg(p, 0.22, 0.26)); }
    const Q = [['колесо — это колесница?', 0.46, 0.58], ['а&nbsp;ось?', 0.6, 0.71], ['а&nbsp;кузов?', 0.73, 0.84]];
    let qi = 0;
    Q.forEach((q, i) => { if (p >= q[1]) qi = i; });
    const qt = $('s6qt');
    if (qt.dataset.i !== String(qi)) { qt.dataset.i = qi; qt.innerHTML = Q[qi][0]; }
    op($('s6q'), win(Q[qi][1], Q[qi][2]));
    op($('s6no'), Math.max(win(0.515, 0.58), win(0.65, 0.71), win(0.78, 0.84)));
    const w = ez(sg(p, 0.545, 0.585)), ax = ez(sg(p, 0.675, 0.715)), bd = ez(sg(p, 0.805, 0.845));
    $('s6wheel').style.transform = `translateX(${(-700 * w).toFixed(1)}px)`;
    const spin = $('s6wheel').querySelector('.spin');
    spin.style.transform = `rotate(${(-w * 700).toFixed(1)}deg)`;
    $('s6axle').style.transform = `translateY(${(400 * ax).toFixed(1)}px)`;
    $('s6body').style.transform = $('s6pole').style.transform = `translateX(${(900 * bd).toFixed(1)}px)`;
    op($('s6end'), sg(p, 0.86, 0.89));
    sw($('s6fin'), sg(p, 0.895, 0.97));
  };

  // v92: сцена с электрокаром — подъезжает, человек подходит и садится, колёса поджимаются, машина взлетает
  function carScene(v, t) {
    const cx = 720 - 840, sc = v.w / v.vw; // кузов (центр viewBox x=380) встаёт по центру экрана
    const inT = ez(sg(t, 0, 0.28)), walk = sg(t, 0.3, 0.5), enter = sg(t, 0.5, 0.55), fold = ez(sg(t, 0.56, 0.68)), fly = sg(t, 0.7, 1);
    const x = lerp(-900, cx, inT) + 1100 * Math.pow(fly, 2), dy = -760 * Math.pow(fly, 1.5) - 14 * fold, tilt = -10 * ez(sg(t, 0.68, 0.82));
    v.el.style.transform = `translate(${x.toFixed(1)}px,calc(-100% + ${dy.toFixed(1)}px)) rotate(${tilt.toFixed(1)}deg)`;
    v.el.style.visibility = t > 0 && t < 1 ? 'visible' : 'hidden';
    const rolling = inT > 0 && inT < 1;
    for (const s of v.spins) s.g.setAttribute('transform', `rotate(${(x / sc / s.r * 57.2958).toFixed(1)} ${s.cx} ${s.cy})`);
    v.el.querySelectorAll('.wf').forEach((g) => g.setAttribute('transform', `translate(0 ${(236 * fold).toFixed(1)}) scale(1 ${(1 - fold).toFixed(3)})`));
    const rn = v.el.querySelector('.runner');
    rn.setAttribute('transform', `translate(${lerp(-420, 300, walk).toFixed(1)} 136)`);
    rn.style.opacity = (1 - enter).toFixed(2);
    v.el.querySelector('.pass').setAttribute('r', (9 * enter).toFixed(1));
    v.el.querySelector('.door').style.opacity = enter > 0 && enter < 1 ? (Math.floor(enter * 6) % 2 ? 0.3 : 1) : 1;
    v.el.querySelector('.thrust').style.opacity = (fold * (0.6 + 0.4 * Math.sin(performance.now() / 60))).toFixed(2);
    v.el.querySelectorAll('.walking').forEach((g) => g.classList.toggle('moving', rolling || (walk > 0 && walk < 1)));
    v.px = x;
  }
  S.s7 = (p) => {
    sw($('s7h'), sg(p, 0.01, 0.1));
    const WN = [[0.05, 0.21], [0.21, 0.37], [0.37, 0.53], [0.53, 0.69], [0.69, 0.875]];
    let cur = 0;
    vehs.forEach((v, i) => {
      const t = sg(p, WN[i][0], WN[i][1]);
      if (p >= WN[i][0]) cur = i;
      const u = (t - 0.5) * 2, w = v.w;
      let x = (1440 - w) / 2 + Math.sign(u) * Math.pow(Math.abs(u), 2.2) * (720 + w / 2 + 60);
      if (i === 4) { carScene(v, t); return; }
      v.el.style.transform = `translate(${x.toFixed(1)}px,-100%)`;
      v.el.style.visibility = t > 0 && t < 1 ? 'visible' : 'hidden';
      const sc = w / v.vw;
      for (const s of v.spins) s.g.setAttribute('transform', `rotate(${(x / sc / s.r * 57.2958).toFixed(1)} ${s.cx} ${s.cy})`);
      const mv = v.px !== null && Math.abs(x - v.px) > 0.25;
      v.el.querySelectorAll('.walking').forEach((g) => g.classList.toggle('moving', mv));
      v.px = x;
      if (i === 3) { const rn = v.el.querySelector('g[transform^="translate(-110"]'); if (rn) rn.setAttribute('transform', `translate(${(-110 - 260 * t).toFixed(1)} 132)`); }
    });
    const n = $('s7n');
    if (n.dataset.i !== String(cur)) { n.dataset.i = cur; n.firstChild.nodeValue = VNAME[cur][0]; $('s7c').innerHTML = (lap ? VNAME2 : VNAME)[cur][1]; }
    const t = sg(p, WN[cur][0], WN[cur][1]);
    const vis = sg(t, 0.12, 0.25) - sg(t, 0.82, 0.95);
    op(n, vis); ul(n, vis);
    { const v = vehs[cur], RS = PORT ? (TAB ? 0.85 : 0.74) : 1, h = (v.el.offsetHeight || 200) * RS;
      const bx = PORT ? Math.min(720 + v.w * RS / 2 - 120, TAB ? 930 : 735) : Math.min(720 + v.w / 2 - 150, 1000), by = PORT ? 612 - h - (TAB ? 110 : -10) : Math.max(612 - h - 150, 250);
      $('s7say').style.transform = `translate(${(bx - 1082).toFixed(0)}px,${(by - 234).toFixed(0)}px)` + (PORT && !TAB ? ' scale(1.3)' : '');
      // реплика гаснет, когда транспорт доезжает до неё
      const front = 720 + ((v.px === null ? 0 : v.px) + v.w - 720) * RS;
      op($('s7say'), cur === 4 ? sg(t, 0.1, 0.22) - sg(t, 0.6, 0.68) : Math.min(sg(t, 0.12, 0.25), 1 - sg(front, bx + 20, bx + 170))); }
    coverSeq($('s7cov'), p, 0.88, 0.93);
  };

  S.s8 = (p) => {
    sw($('s8h'), sg(p, 0, 0.05));
    const B = [0.04, 0.11, 0.18, 0.25, 0.32, 0.39];
    const draw = sg(p, 0.005, 0.035);
    shapes.forEach((sh) => sh.style.setProperty('--d', draw.toFixed(4)));
    let fi = 0, ft = 0;
    for (let i = 1; i < 6; i++) { if (p >= B[i] - 0.03) { fi = i - 1; ft = sg(p, B[i] - 0.03, B[i]); } }
    morph(fi, ft >= 1 ? fi + 1 : Math.min(fi + 1, 5), ft);
    const cur = ft >= 1 ? fi + 1 : fi;
    shades.forEach((sd, i) => { sd.style.opacity = i === cur ? (cl((draw - 0.8) / 0.2) * (ft > 0 && ft < 1 ? 0 : 1)).toFixed(3) : '0'; });
    let k = 0;
    for (let i = 0; i < 6; i++) if (p >= B[i] - 0.0125) k = i;
    const n10 = turns % 10, n100 = turns % 100, wrd = n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14) ? 'раза' : 'раз';
    const cap = k === 0 && lap ? 'то самое, узнали?' : k === 4 ? `а это колесо вы прокрутили ${turns.toLocaleString('ru-RU')} ${wrd}` : CAPS[k];
    const capEl = $('s8cap');
    if (capEl.firstChild.nodeValue !== cap) capEl.firstChild.nodeValue = cap;
    const ct = (p - (B[k] - 0.0125)) / 0.07;
    ul(capEl, sg(ct, 0.25, 0.6));
    coverSeq($('s8c1'), p, 0.47, 0.52); textOut($('s8c1'), p, 0.56, 0.59);
    $('s8c2').style.transform = p >= 0.59 ? 'none' : 'translateY(100%)';
    const up = ez(sg(p, 0.64, 0.68));
    op($('s8wh'), spinOn ? 0 : 1);
    $('s8wh').style.transform = `translateY(${(90 * (1 - up) - endZ * 170).toFixed(1)}px) scale(${(1 - endZ * 0.985).toFixed(4)}) rotate(${(sg(p, 0.63, 1) * 1440 + SPIN + (ending ? performance.now() / 6 : 0)).toFixed(1)}deg)`;
    const outT = sg(p, 0.84, 0.87);
    const t1 = $('s8t1');
    op(t1, (p > 0.66 ? 1 : 0) - outT); sw(t1, sg(p, 0.66, 0.74));
    op($('s8t2'), sg(p, 0.72, 0.76) - outT);
    op($('s8arrow'), 0);
    if (p > 0.88 && !ending) startEnding();
  };

  /* ── перемотки ── */
  function scrollAnim(to, dur, done) {
    root.style.scrollBehavior = 'auto';
    const from = scrollY, t0 = performance.now();
    root.classList.add('rewinding', 'locked');
    if (reduce) dur = 1;
    (function step(now) {
      const t = cl((now - t0) / dur);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      scrollTo(0, from + (to - from) * e);
      $('rewsq').classList.toggle('alt', Math.floor(now / 110) % 2 === 1);
      tick();
      if (t < 1) requestAnimationFrame(step);
      else { root.classList.remove('rewinding', 'locked'); done && done(); }
    })(t0);
  }
  const posIn = (sec, p) => sec.offsetTop + p * (sec.offsetHeight - H);
  function rewTxt(t) { $('rewt').innerHTML = t; }
  function rewindToS1() {
    $('live').textContent = 'Перемотка назад';
    rewTxt(lap ? 'а у&nbsp;тебя опять колесо убежало' : 'а у&nbsp;тебя же колесо убежало');
    scrollAnim(posIn($('s1'), 0.95), 1500, () => { $('s2').hidden = true; sizes.clear(); $('live').textContent = ''; s1covT = performance.now(); tick(); });
  }
  let endTimer = null, spinOn = false;
  function applyLap() {
    const T = (id, t) => { const e = $(id); if (e && e.firstChild) e.firstChild.nodeValue = t; };
    T('s1catch', 'Ещё раз!'); T('s1n1', 'теперь вы знаете,'); T('s1n2', 'куда оно укатится');
    $('s1oh').querySelector('span').textContent = 'опять?!';
    alignHead();
    $('s2where').textContent = 'вы ведь знаете, где оно?';
    $('s3run').textContent = 'побежать ещё раз';
    $('s3say').querySelector('span').textContent = 'в тот раз почти';
    $('s6nt').textContent = 'И снова: что такое колесница?';
    $('s8t2').textContent = 'И снова всё повторяется';
    [$('s1n1'), $('s1n2'), $('s6name'), $('s1back')].forEach((e) => { e._fk = null; }); $('s3ulg')._fk = null;
  }
  $('spinw').innerHTML = A.wheel(170, { seed: 93 });
  function spin(on) { spinOn = on; $('spinov').classList.toggle('on', on); root.classList.toggle('spinning', on); if (on) rewTxt(lap ? 'и опять в&nbsp;начало' : 'снова в&nbsp;начало'); }
  function cancelEnding() { if (endTimer) { clearTimeout(endTimer); endTimer = null; ending = false; } }
  function startEnding() {
    ending = true;
    endTimer = setTimeout(() => {
      endTimer = null;
      (reduce ? (f) => f() : irisOut)(() => {
      spin(true);
      if (!reduce) irisIn(innerWidth / 2, innerHeight / 2, 750);
      scrollAnim(0, 1500, () => {
        endZ = 0;
        spin(false);
        $('endsub').innerHTML = lap ? 'Круг снова замкнулся.<br>Листайте дальше — посмотрим, что изменится' : 'Круг замкнулся.<br>Листайте дальше — кое-что изменилось';
        lap++; applyLap();
        const end = $('end');
        end.hidden = false; end.classList.remove('out');
        const ew = $('endw'), t0 = performance.now();
        (function swp(now) { const t = cl((now - t0) / 1700); sw(ew, t); if (t < 1) requestAnimationFrame(swp); })(t0);
        $('s2').hidden = false; s2done = false; s1covT = null;
        for (const k in P) { P[k] = 0; delete touched[k]; }
        labUpd(); chase = 0; chaseT0 = null; s3jump = false; unshort($('s3')); unshort($('s5')); sizes.clear();
        // титры не исчезают сами: подсказка остаётся, пока читатель не продолжит листать
        const t1 = performance.now();
        const go = (e) => { if (performance.now() - t1 < 1200) return; if (e && e.type === 'keydown' && !['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) return;
          ['wheel', 'touchmove', 'keydown'].forEach((t) => removeEventListener(t, go));
          end.classList.add('out'); setTimeout(() => { end.hidden = true; ending = false; tick(); }, 800); };
        ['wheel', 'touchmove', 'keydown'].forEach((t) => addEventListener(t, go, { passive: true }));
      });
      });
    }, 500);
  }
  addEventListener('wheel', (e) => { if (endTimer && e.deltaY < 0) cancelEnding(); }, { passive: true });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') cancelEnding(); });
  // во время перемотки палец не перехватывает прокрутку (body не делаем отдельным скроллером — иначе липкие сцены «отваливаются»)
  addEventListener('touchmove', (e) => { if (root.classList.contains('locked')) e.preventDefault(); }, { passive: false });

  /* ── события ── */
  const zone = $('s1stickzone');
  zone.addEventListener('pointerenter', () => { hint = true; });
  zone.addEventListener('pointerleave', () => { hint = false; });
  zone.addEventListener('click', () => { hint = !hint; });
  zone.addEventListener('focus', () => { hint = true; });
  zone.addEventListener('blur', () => { hint = false; });
  $('s3run').tabIndex = -1;

  /* ── главный цикл ── */
  const secs = $$('.sc');
  // если читатель собрал повозку кнопками или нажал «побежать за ним», остаток сцены не тянется:
  // секция укорачивается так, чтобы до ухода осталось столько же прокрутки, сколько в варианте «по скроллу»
  function shortcut(sec, p0, to) {
    if (sec._map || p0 >= to) return;
    const r = sec.getBoundingClientRect(), Hs = r.height, scrolled = -r.top, rangeOld = Hs - H;
    if (scrolled <= 0) return;
    const R2 = scrolled + (1 - to) * rangeOld, len = parseFloat(getComputedStyle(sec).getPropertyValue('--len')) || +sec.dataset.len;
    sec._map = { a: scrolled / R2, p0, to, len0: len };
    sec.style.setProperty('--len', (len * (R2 + H) / Hs).toFixed(3));
  }
  function unshort(sec) { if (sec._map) { sec.style.setProperty('--len', sec._map.len0); sec._map = null; } }
  function tick() {
    for (const sec of secs) {
      if (sec.hidden) continue;
      const r = sec.getBoundingClientRect();
      if (r.top > H || r.bottom < 0) continue;
      const stage = sec.firstElementChild;
      
      let target = cl(-r.top / (r.height - H));
      if (sec._map) { const m = sec._map; target = target < m.a ? target / m.a * m.p0 : m.to + (target - m.a) / (1 - m.a) * (1 - m.to); }
      // на телефоне и планшете прогресс догоняет прокрутку плавно, без рывков от резкого свайпа
      let p = target;
      if (COARSE && !root.classList.contains('rewinding')) {
        const now = performance.now(), dt = Math.min(64, now - (sec._t || now)); sec._t = now;
        p = sec._p === undefined || r.top > H || r.bottom < 0 ? target : sec._p + (target - sec._p) * (1 - Math.pow(0.86, dt / 16.7));
        if (Math.abs(target - p) < 0.0005) p = target;
      }
      sec._p = p;
      S[sec.id] && S[sec.id](p);
    }
  }
  // v82: человечек в погоне следит за курсором — зрачки и лёгкий поворот головы
  let MX = null, MY = null;
  addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { MX = e.clientX; MY = e.clientY; } }, { passive: true });
  function look(svg) {
    const h = svg.querySelector('.head'); if (!h) return;
    const eyes = h.querySelector('.eyes'), hx = +h.dataset.hx, hy = +h.dataset.hy;
    if (MX === null) { h.removeAttribute('transform'); eyes.removeAttribute('transform'); return; }
    const r = eyes.getBoundingClientRect(), cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
    const dx = MX - cx, dy = MY - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 160);
    eyes.setAttribute('transform', `translate(${(dx / d * 3.2 * k).toFixed(2)} ${(dy / d * 2.6 * k).toFixed(2)})`);
    const ang = Math.max(-14, Math.min(14, Math.atan2(dy, Math.abs(dx)) * 57.3 * 0.25 * Math.sign(dx || 1)));
    h.setAttribute('transform', `rotate(${ang.toFixed(1)} ${hx} ${hy + 22})`);
  }
  // v82: финал — колесо уходит вглубь, кадр закрывается круглой шторкой (ирисом) и открывается снова
  let endZ = 0;
  const IRIS = (() => {
    const el = document.createElement('div'); el.id = 'iris'; el.setAttribute('aria-hidden', 'true');
    let d = '';
    for (let i = 0; i <= 48; i++) { const a = i / 48 * 6.2832, rr = 1 + Math.sin(a * 5 + 1) * 0.008 + Math.sin(a * 11) * 0.005; d += (i ? 'L' : 'M') + (Math.cos(a) * rr).toFixed(4) + ' ' + (Math.sin(a) * rr).toFixed(4); }
    el.innerHTML = `<svg><path d="${d}Z"/></svg>`;
    document.body.appendChild(el);
    return el;
  })();
  function irisSet(x, y, r) {
    IRIS.style.setProperty('--x', x.toFixed(1) + 'px'); IRIS.style.setProperty('--y', y.toFixed(1) + 'px'); IRIS.style.setProperty('--r', Math.max(0, r).toFixed(1) + 'px');
    IRIS.querySelector('path').setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${Math.max(0.01, r).toFixed(1)})`);
  }
  function irisOut(done) {
    const t0 = performance.now(), w0 = $('s8wh').getBoundingClientRect(), x0 = (w0.left + w0.right) / 2, y0 = (w0.top + w0.bottom) / 2;
    const D = Math.max(Math.hypot(x0, y0), Math.hypot(innerWidth - x0, y0), Math.hypot(x0, innerHeight - y0), Math.hypot(innerWidth - x0, innerHeight - y0)) + 4;
    IRIS.classList.add('on');
    (function st(now) {
      const t = now - t0, e = cl(t / 1700);
      endZ = e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
      const w = $('s8wh').getBoundingClientRect(), x = (w.left + w.right) / 2, y = (w.top + w.bottom) / 2;
      const ir = cl((t - 150) / 1750), ie = ir * ir * (3 - 2 * ir);
      irisSet(x, y, D * (1 - ie) + 6 * (1 - endZ));
      if (t < 2150) requestAnimationFrame(st); else done();
    })(t0);
  }
  function irisIn(x, y, dur = 750) {
    if (x === undefined) { x = innerWidth / 2; y = innerHeight / 2; }
    const t0 = performance.now(), D = Math.max(Math.hypot(x, y), Math.hypot(innerWidth - x, y), Math.hypot(x, innerHeight - y), Math.hypot(innerWidth - x, innerHeight - y)) + 4;
    IRIS.classList.add('on'); irisSet(x, y, 0);
    (function st(now) {
      const t = cl((now - t0) / dur), e = t * t * (3 - 2 * t);
      irisSet(x, y, D * e);
      if (t < 1) requestAnimationFrame(st); else IRIS.classList.remove('on');
    })(t0);
  }
  // кадр сходится в точку и сразу раскрывается — как смена эпизода в немом кино
  function irisCut(x, y) {
    const t0 = performance.now(), D = Math.max(Math.hypot(x, y), Math.hypot(innerWidth - x, y), Math.hypot(x, innerHeight - y), Math.hypot(innerWidth - x, innerHeight - y)) + 4;
    IRIS.classList.add('on');
    (function st(now) {
      const t = cl((now - t0) / 420), e = t * t;
      irisSet(x, y, D * (1 - e));
      if (t < 1) requestAnimationFrame(st); else setTimeout(() => irisIn(x, y, 1100), 140);
    })(t0);
  }
  // v83: ирис открывает новые главы — притчу о колеснице (s6) и финальное «Колесо» (s8), когда листаешь вниз
  const IRIS_SEC = { s6: ['s6ch', 0.205], s8: ['s8fig', 0.006] }, irisPrev = {};
  let irisCool = 0;
  function irisChapters() {
    if (reduce || root.classList.contains('rewinding') || root.classList.contains('spinning') || IRIS.classList.contains('on')) return;
    const now = performance.now();
    for (const id in IRIS_SEC) {
      const sec = $(id); if (!sec || sec.hidden || sec._p === undefined) continue;
      const [el, at] = IRIS_SEC[id], p = sec._p, prev = irisPrev[id];
      irisPrev[id] = p;
      const r = sec.getBoundingClientRect();
      if (prev !== undefined && prev < at && p >= at && p - prev < 0.05 && r.top <= 0 && r.bottom >= innerHeight && now > irisCool) {
        irisCool = now + 2500;
        const q = $(el).getBoundingClientRect();
        const x = q.width ? Math.min(innerWidth - 40, Math.max(40, (q.left + q.right) / 2)) : innerWidth / 2, y = q.height ? Math.min(innerHeight - 40, Math.max(40, (q.top + q.bottom) / 2)) : innerHeight / 2;
        irisCut(x, y);
      }
    }
  }
  // v78: инерция колёс — после остановки прокрутки колесо чуть докатывается и качается назад
  let iy = scrollY, iv = 0, py = scrollY, fastN = 0;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function inertia() {
    const y = scrollY;
    iv = (iv + (y - iy) * 0.08) * 0.82; iy += iv;
    SPIN = RM ? 0 : Math.max(-140, Math.min(140, (iy - y) * 0.42));
    const v = Math.abs(y - py); py = y;
    fastN = v > 38 ? 6 : Math.max(0, fastN - 1);
    root.classList.toggle('whirl', !RM && fastN > 0);
  }
  function loop() { inertia(); tick(); requestAnimationFrame(loop); } // v84: ирис внутри лонгрида убран, остался только в финале
  // при обновлении страницы — всегда с самого начала
  try { history.scrollRestoration = 'manual'; sessionStorage.removeItem('koleso-pos'); } catch (e) {}
  addEventListener('beforeunload', () => scrollTo(0, 0));
  function restore() { scrollTo(0, 0); }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    $$('.sweep').forEach(splitLines);
    calibrate(); alignHead(); alignIntro(); sizes.clear(); restore(); loop();
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('boot')));
    // первое слово проявляется слева направо при открытии
    const w = $('s1word');
    sw(w, 1); calibrate(); rollIn();
  });
  window.__tick = tick;
})();

/* v74: склейка на стыках и указки на фото находки */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const sp = document.createElement('div'); sp.id = 'splice'; sp.setAttribute('aria-hidden', 'true'); sp.innerHTML = '<i></i>'; document.body.appendChild(sp);
  const targets = [...document.querySelectorAll('.cover.paper'), document.querySelector('#s2 .stage')].filter(Boolean);
  const seen = new WeakMap();
  let busy = false, lastY = scrollY, lastT = 0;
  function splice() {
    if (performance.now() - lastT < 1500) return; lastT = performance.now();
    if (reduce || busy || root.classList.contains('rewinding') || root.classList.contains('spinning')) return;
    busy = true; sp.style.setProperty('--y', (20 + Math.random() * 60).toFixed(0) + '%');
    root.classList.add('splicing');
    setTimeout(() => { root.classList.remove('splicing'); busy = false; }, 320);
  }
  // указки на фото
  const fig = document.getElementById('s4ph'), img = fig && fig.querySelector('img');
  let note = null;
  if (fig && img) {
    fig.insertAdjacentHTML('beforeend', `<svg id="s4note" viewBox="0 0 1600 1225" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path class="d1" pathLength="1" d="M1078 196C1048 186 1024 200 1006 228M1006 228L1013 200M1006 228L1031 213"/>
      <text class="d1" x="1092" y="214">колесо</text>
      <path class="d2" pathLength="1" d="M1092 896C1072 838 1042 760 1014 694M1014 694L1008 724M1014 694L1034 716"/>
      <text class="d2" x="1050" y="952">дубовая ось</text>
      <path class="d3" pathLength="1" d="M1140 1080C1220 1072 1300 1084 1390 1074"/>
      <text class="d3" x="1146" y="1052">≈ 5200 лет</text></svg>`); // v93: стрелки в пустых местах нового фото: справа от колеса и под осью
    note = document.getElementById('s4note');
  }
  function fit() { if (note && img) { note.style.width = img.offsetWidth + 'px'; note.style.height = img.offsetHeight + 'px'; } }
  addEventListener('resize', fit); fit();
  const H = () => innerHeight;
  function watch() {
    for (const el of targets) {
      const r = el.getBoundingClientRect();
      const vis = Math.max(0, Math.min(r.bottom, H()) - Math.max(r.top, 0)) / H();
      const st = el.closest('.cover') ? parseFloat(getComputedStyle(el).opacity || 1) : 1;
      const hit = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
      const top = hit && (el.contains(hit) || (el.closest('#s2') && hit.closest('#s2')));
      const on = vis > 0.55 && st > 0.5 && !!top;
      if (on && !seen.get(el) && scrollY > lastY) splice();
      seen.set(el, on);
    }
    lastY = scrollY;
    if (note) {
      const o = parseFloat(fig.style.opacity || getComputedStyle(fig).opacity);
      const r = fig.getBoundingClientRect(), inView = r.top < H() * 0.8 && r.bottom > H() * 0.2;
      if (o > 0.9 && inView) note.classList.add('on'); else if (o < 0.1 || !inView) note.classList.remove('on');
    }
    requestAnimationFrame(watch);
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(() => { fit(); targets.forEach((el) => { const r = el.getBoundingClientRect(); seen.set(el, Math.max(0, Math.min(r.bottom, H()) - Math.max(r.top, 0)) / H() > 0.55); }); watch(); }, 400));

  /* v78: колесо вместо курсора и интертитр, который встаёт в кадровое окно */
  (() => {
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!RM && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      // v79: рисованная мышка вместо курсора — кончик носа там, куда указывает мышь
      const c = document.createElement('div'); c.id = 'wcur'; c.setAttribute('aria-hidden', 'true');
      // v80: обычная стрелка-курсор, только нарисованная от руки, со штриховкой и дрожащим контуром
      const ARROW = 'M2 2L2.5 27.2L8.7 21.3L13.2 31.4L17.4 29.5L12.9 19.7L21.2 19.3L2 2';
      const HATCH = 'M3.6 9.4L6.2 12M3.6 13.6L8.6 18.6M3.6 18L7.2 21.6M3.8 22.4L5.4 24M6 9.2L12.4 15.6M9.8 13.2L14.6 18';
      const jit = (d, k) => d.replace(/-?\d+(\.\d+)?/g, (m) => (+m + Math.sin(k * 7.3 + m * 3.1) * 0.4).toFixed(2));
      const mk = (k) => `<g class="fr f${k}"><path class="bgf" d="${k ? jit(ARROW, k) : ARROW}"/><path class="ink" d="${k ? jit(ARROW, k) : ARROW}"/><path class="ink h" d="${k ? jit(HATCH, k) : HATCH}"/></g>`;
      c.innerHTML = `<svg viewBox="0 0 24 34"><g class="ms">${mk(0)}${mk(1)}</g></svg>`;
      document.body.appendChild(c); root.classList.add('wcur');
      let x = -100, y = -100, px = null, face = 1, still = 0;
      addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        x = e.clientX; y = e.clientY;
        if (px !== null && Math.abs(x - px) > 1.5) face = x > px ? -1 : 1;
        if (px !== null && Math.hypot(x - px, e.movementY || 0) > 0.5) still = 8;
        px = x; c.classList.add('on');
        const t = e.target.closest && e.target.closest('a,button,[role="button"],.part,input,label,summary');
        c.classList.toggle('hot', !!t);
      }, { passive: true });
      addEventListener('pointerdown', () => c.classList.add('down'));
      addEventListener('pointerup', () => c.classList.remove('down'));
      document.documentElement.addEventListener('mouseleave', () => { c.classList.remove('on'); px = null; });
      (function fr() {
        c.style.transform = `translate(${x}px,${y}px)`;
        still = Math.max(0, still - 1); c.classList.toggle('run', still > 0);
        requestAnimationFrame(fr);
      })();
    }
    if (!RM) {
      // интертитр «встаёт в кадровое окно», когда реально выходит на экран (виден, непрозрачен и сверху всех слоёв)
      const ps = [...document.querySelectorAll('.cover.paper p.h1')];
      (function gw() {
        for (const p of ps) {
          const q = p.getBoundingClientRect(), vis = (Math.min(q.bottom, innerHeight) - Math.max(q.top, 0)) / (q.height || 1);
          let on = false;
          if (vis > 0.5 && +getComputedStyle(p.closest('.cover')).opacity > 0.5) {
            const r = p.closest('.sc').getBoundingClientRect(); on = r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5;
            if (!on) { const t = document.elementFromPoint(Math.min(innerWidth - 2, Math.max(2, (q.left + q.right) / 2)), Math.min(innerHeight - 2, Math.max(2, (q.top + q.bottom) / 2))); on = !!(t && p.closest('.cover').contains(t)); }
          }
          if (on && !p._gated) { p._gated = true; p.classList.remove('gate'); void p.offsetWidth; p.classList.add('gate'); }
          else if (!on && vis <= 0) { p._gated = false; p.classList.remove('gate'); }
        }
        requestAnimationFrame(gw);
      })();
    }

    // v79: колея внизу экрана вместо полосы прогресса — следы колеса и маленькое колёсико на конце
    {
      const r = document.createElement('div'); r.id = 'rut'; r.setAttribute('aria-hidden', 'true');
      r.innerHTML = '<svg><defs><clipPath id="rutc"><rect height="60" y="-10" width="0"/></clipPath></defs><g clip-path="url(#rutc)"><path class="tr"/><path class="tk"/></g><g class="wh"><circle r="11"/><path d="M0 -11V11M-11 0H11M-7.8 -7.8L7.8 7.8M-7.8 7.8L7.8 -7.8"/><circle r="2.2"/></g></svg>';
      document.body.appendChild(r);
      const svg = r.firstChild, rect = r.querySelector('rect'), tr = r.querySelector('.tr'), tk = r.querySelector('.tk'), wh = r.querySelector('.wh');
      let W = 0;
      const build = () => {
        W = innerWidth; svg.setAttribute('viewBox', `0 0 ${W} 34`); svg.setAttribute('width', W); svg.setAttribute('height', 34);
        let a = 'M0 17', b = 'M0 27', t = '';
        for (let x = 0; x <= W + 12; x += 12) {
          const w1 = Math.sin(x * 0.013) * 0.7 + Math.sin(x * 0.051) * 0.35, w2 = Math.sin(x * 0.011 + 2) * 0.7 + Math.sin(x * 0.047) * 0.35;
          a += `L${x} ${(17 + w1).toFixed(2)}`; b += `L${x} ${(27 + w2).toFixed(2)}`;
          if (x % 24 === 0) t += `M${x + 3} ${(19 + w1).toFixed(1)}L${x + 8} ${(25 + w2).toFixed(1)}`;
        }
        tr.setAttribute('d', a + b); tk.setAttribute('d', t);
      };
      build(); addEventListener('resize', build);
      (function rf() {
        const max = document.documentElement.scrollHeight - innerHeight, f = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0, x = f * W;
        rect.setAttribute('width', x.toFixed(1));
        wh.setAttribute('transform', `translate(${Math.max(12, Math.min(W - 12, x)).toFixed(1)} 22) rotate(${(x / 11 * 57.3 % 360).toFixed(1)})`);
        r.classList.toggle('on', scrollY > 40);
        requestAnimationFrame(rf);
      })();
    }
    // v79: белочка из начала иногда выглядывает снизу из-за края экрана
    if (!RM) {
      const src = document.getElementById('s1sqg');
      const pk = document.createElement('div'); pk.id = 'peek'; pk.setAttribute('aria-hidden', 'true');
      pk.innerHTML = `<svg class="ill" viewBox="-24 -196 244 202"><g>${src ? src.innerHTML : ''}</g></svg>`;
      document.body.appendChild(pk);
      const inner = pk.firstChild;
      // v91: белка выглядывает предсказуемо — в каждой главе по два раза (в первой и во второй половине),
      // только когда читатель остановился, ближе к центру, куда смотрит взгляд, и задерживается дольше
      const SECS = ['s3', 's4', 's5', 's6', 's7', 's8'], used = new Set();
      let last = performance.now(), busy = false;
      addEventListener('scroll', () => { last = performance.now(); }, { passive: true });
      setInterval(() => {
        const now = performance.now(), idle = now - last;
        if (busy || idle < 650 || idle > 8000 || root.classList.contains('rewinding') || root.classList.contains('spinning')) return;
        for (const id of SECS) {
          const sec = document.getElementById(id); if (!sec || sec.hidden) continue;
          const q = sec.getBoundingClientRect();
          if (!(q.top <= 0 && q.bottom >= innerHeight)) continue;
          const pr = -q.top / (q.height - innerHeight), slot = pr < 0.5 ? 'a' : 'b', key = id + slot;
          if (used.has(key) || pr < 0.12 || pr > 0.92) return;
          const t = document.elementFromPoint(innerWidth / 2, innerHeight - 30);
          if (!t || !sec.contains(t) || t.closest('.cover.paper')) return;
          used.add(key);
          busy = true;
          const small = innerWidth < 700, w = small ? 140 : 200;
          pk.style.width = w + 'px'; pk.style.height = (w * 202 / 244) + 'px';
          const side = Math.random() < 0.5 ? -1 : 1, cx = innerWidth * (0.5 + side * (0.12 + Math.random() * 0.14));
          pk.style.left = (cx - w / 2).toFixed(0) + 'px';
          // смотрит в сторону центра экрана (рисунок белки смотрит вправо)
          inner.style.transform = side > 0 ? 'scaleX(-1)' : '';
          const tilt = -side * (5 + Math.random() * 4);
          pk.animate([
            { transform: 'translateY(105%) rotate(0deg)' },
            { transform: 'translateY(62%) rotate(0deg)', offset: 0.12 },
            { transform: 'translateY(64%) rotate(0deg)', offset: 0.24 },
            { transform: `translateY(8%) rotate(${tilt}deg)`, offset: 0.34 },
            { transform: `translateY(13%) rotate(${(tilt * 0.3).toFixed(1)}deg)`, offset: 0.5 },
            { transform: `translateY(8%) rotate(${tilt}deg)`, offset: 0.66 },
            { transform: `translateY(10%) rotate(${(-tilt * 0.4).toFixed(1)}deg)`, offset: 0.8 },
            { transform: 'translateY(105%) rotate(0deg)' }
          ], { duration: 4200, easing: 'cubic-bezier(.4,0,.3,1)' }).onfinish = () => { busy = false; };
          return;
        }
      }, 250);
    }

  })();
})();
