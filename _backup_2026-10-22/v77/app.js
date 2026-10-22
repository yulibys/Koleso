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
  let H = innerHeight, PORT = false, TAB = false, PS = 0.6;
  const sizes = new Map();

  function fit() {
    H = innerHeight;
    const W = innerWidth;
    // портрет (телефон, планшет): не общий масштаб, а своя раскладка в полосе 560 px по центру кадра и с запасом по высоте
    const k = W >= H ? Math.min(W / 1440, H / 810) : Math.min(W / 560, H / 1150);
    root.style.setProperty('--m', Math.max(0, (W / k - 1440) / 2).toFixed(1));
    root.style.setProperty('--k', k.toFixed(4));
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
  const VW = [[0, 940, 880], [1, 860, 700], [2, 560, 420], [3, 940, 830]];
  const vehs = VW.map(([i, w, vw]) => {
    const d = document.createElement('div');
    d.className = 'veh';
    d.style.width = w + 'px';
    d.innerHTML = VEH.v[i];
    d.querySelectorAll('.red').forEach((n) => n.remove());
    $('s7road').appendChild(d);
    return { el: d, w, vw, spins: $$('.spin', d).map((g) => ({ g, cx: +g.dataset.cx, cy: +g.dataset.cy, r: +g.dataset.r })), px: null };
  });
  const VNAME2 = [['', 'опять она'], ['', 'спицы всё те&nbsp;же'], ['', 'педалей<br>всё ещё нет'], ['', 'он снова<br>уехал без&nbsp;вас']];
  const VNAME = [['Телега', 'медленно,<br>зато верно'], ['Колесница', 'со&nbsp;спицами'], ['Дрезина', 'педалей<br>ещё нет'], ['Автобус', 'он сейчас<br>уедет без&nbsp;вас']];
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
  // v71: буквы «Колесо» выкатываются из разных углов экрана к центру
  function rollIn(done) {
    const w = word;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !w.animate) { w.classList.add('in'); if (done) done(); return; }
    w.classList.add('roll');
    const vw = innerWidth, vh = innerHeight, k = w.getBoundingClientRect().width / w.offsetWidth || 1;
    const from = [[-0.1, -0.15], [1.1, 1.15], [-0.12, 1.12], [1.12, -0.12], [0.5, 1.2], [1.2, 0.5]];
    let left = letters.length;
    letters.forEach((el, i) => {
      const b = el.getBoundingClientRect(), x0 = b.left + b.width / 2, y0 = b.top + b.height / 2;
      const dx = (from[i][0] * vw - x0) / k, dy = (from[i][1] * vh - y0) / k;
      const dist = Math.hypot(dx, dy), deg = (dist / (Math.PI * el.offsetHeight * 0.55)) * 360 * (dx >= 0 ? 1 : -1);
      const a = el.animate([{ transform: `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) rotate(${deg.toFixed(0)}deg)` }, { transform: 'translate(0,0) rotate(0deg)' }],
        { duration: 1500, delay: 120 + i * 110, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'backwards' });
      a.onfinish = () => { if (--left === 0 && done) done(); };
    });
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
    const ws = lerp(96 / 241, 1, ez(sg(p, 0.03, 0.08)));
    const top = p < 0.39 ? 318 : p < 0.45 ? lerp(318, 207, ez(sg(p, 0.39, 0.45))) : lerp(207, TAB ? -30 : PORT ? 20 : 68, ez(sg(p, 0.45, 0.52)));
    const PT = PORT ? 0.62 : 1;
    word.style.transform = `translateY(${(top - 68).toFixed(1)}px) scale(${(ws * (PORT ? PS : 1)).toFixed(4)})`;
    const swp = sg(p, 0.64, 0.68);
    op(word, 1 - sg(p, 0.6, 0.635));
    { const bk = $('s1back'), v = lap ? 1 - sg(p, 0.07, 0.1) : 0; op(bk, v); ul(bk, lap ? sg(p, 0.005, 0.03) : 0); }
    const cat = $('s1catch'); op(cat, swp > 0 ? 1 : 0); sw(cat, swp);
    letters[5].style.opacity = (1 - sg(p, 0.31, 0.335) + sg(p, 0.35, 0.39)).toFixed(3);

    // колесо
    const [cx0, cy, r] = ringAt(p);
    const roll = sg(p, 0.67, 0.77);
    const rx = roll < 0.23 ? lerp(720, 876, roll / 0.23) : roll < 0.46 ? lerp(876, 1001, (roll - 0.23) / 0.23) : lerp(1001, 1760, ez((roll - 0.46) / 0.54) * 0.5 + ((roll - 0.46) / 0.54) * 0.5);
    const cx = p < 0.67 ? (PORT ? lerp(cx0, 720, 0) : cx0) : rx;
    const rot = p * 1800 + ((cx - 720) / 218) * 57.3;
    put($('s1wheel'), cx, cy, r / 220, rot, sg(p, 0.31, 0.335));
    op($('s1disc'), sg(p, 0.46, 0.52)); op($('s1spk'), sg(p, 0.47, 0.53));

    // белка
    const sq = $('s1sq');
    const hopA = 0.10, hopW = 0.0275;
    let x, y, s = SQ, o = sg(p, 0.07, 0.1), rr = 0;
    if (p < 0.43) {
      const k = Math.floor((p - hopA) / hopW);
      if (p < hopA) { [x, y] = pt(...HOP[0]); }
      else if (k < HOP.length - 1) {
        const t = ez(sg(p, hopA + k * hopW, hopA + (k + 0.8) * hopW));
        const a = pt(...HOP[k]), b = pt(...HOP[k + 1]);
        x = lerp(a[0], b[0], t); y = lerp(a[1], b[1], t) - Math.sin(Math.PI * t) * (k < 2 ? 40 : 70);
        rr = t > 0 && t < 1 ? lerp(-14, 12, t) : 0;
        if (k === HOP.length - 2) s = lerp(SQ, (r / 220) * 0.9, t);
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
    const n1 = sg(p, 0.77, 0.79), n2 = sg(p, 0.79, 0.81);
    op($('s1n1'), n1); ul($('s1n1'), n1); op($('s1n2'), n2); ul($('s1n2'), n2);

    // большая белка выглядывает справа: «о нет((»
    const inn = ez(sg(p, 0.81, 0.84)), out = ez(sg(p, 0.895, 0.92));
    const big = $('s1big');
    const bt = PORT ? (TAB ? 845 : 600) : 1120;
    const bx = out > 0 ? lerp(bt, 1800, out) : lerp(1800, bt, inn);
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
    const wx = lerp(1336, 701, t1), wy = lerp(824, 711, t1) + lerp(0, -223, t2) + lerp(0, -67, t3) + (TAB ? lerp(150, -70, t3) : PORT ? lerp(120, -60, t3) : 0);
    put($('s2wheel'), wx, wy, 1, -((1336 - wx) / 278) * 57.3 - sg(p, 0.62, 1) * 1500, sg(p, 0.545, 0.56));
    dr($('s2mo'), sg(p, 0.64, 0.7));
    op($('s2where'), sg(p, 0.76, 0.8));
    if (p > 0.9 && !s2done && !ending) { s2done = true; rewindToS1(); }
  };

  let s3jump = false;
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
    put($('s3wh'), zx(wx), zy(601), Z, (wx - w0) / 80 * 57.3, show);
    op($('s3say'), sg(c, 0.08, 0.14) - sg(c, 0.6, 0.66));
    put($('s3say'), PH ? zx(mx) + 110 : mx + (PORT ? (TAB ? 90 : 60) : 237), PH ? 390 : PORT ? 380 : 428, PH ? 1.25 : PORT ? 0.85 : 1, 0);
    coverSeq($('s3cov'), p, 0.68, 0.76);
  };

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
    $('s4wh').style.transform = `translate(${(wx - 300).toFixed(1)}px,${(wy - 300 - 900).toFixed(1)}px) rotate(${(p * 1600).toFixed(1)}deg) scale(${ws.toFixed(3)})`;
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

  S.s7 = (p) => {
    sw($('s7h'), sg(p, 0.01, 0.1));
    const WN = [[0.06, 0.27], [0.27, 0.48], [0.48, 0.68], [0.68, 0.86]];
    let cur = 0;
    vehs.forEach((v, i) => {
      const t = sg(p, WN[i][0], WN[i][1]);
      if (p >= WN[i][0]) cur = i;
      const u = (t - 0.5) * 2, w = v.w;
      const x = (1440 - w) / 2 + Math.sign(u) * Math.pow(Math.abs(u), 2.2) * (720 + w / 2 + 60);
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
      op($('s7say'), Math.min(sg(t, 0.12, 0.25), 1 - sg(front, bx + 20, bx + 170))); }
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
    $('s8wh').style.transform = `translateY(${(90 * (1 - up)).toFixed(1)}px) rotate(${(sg(p, 0.63, 1) * 1440 + (ending ? performance.now() / 6 : 0)).toFixed(1)}deg)`;
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
    T('s1catch', 'Еще раз!'); T('s1n1', 'теперь вы знаете,'); T('s1n2', 'куда оно укатится');
    $('s1oh').querySelector('span').textContent = 'опять?!';
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
      spin(true);
      scrollAnim(0, 1500, () => {
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
  function loop() { tick(); requestAnimationFrame(loop); }
  // при обновлении страницы — всегда с самого начала
  try { history.scrollRestoration = 'manual'; sessionStorage.removeItem('koleso-pos'); } catch (e) {}
  addEventListener('beforeunload', () => scrollTo(0, 0));
  function restore() { scrollTo(0, 0); }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    $$('.sweep').forEach(splitLines);
    calibrate(); sizes.clear(); restore(); loop();
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
      <path class="d1" pathLength="1" d="M1075 215C1040 210 1010 225 985 250M985 250L1000 222M985 250L1014 247"/>
      <text class="d1" x="1090" y="232">колесо</text>
      <path class="d2" pathLength="1" d="M1150 860C1120 820 1100 760 1085 700M1085 700L1078 730M1085 700L1104 723"/>
      <text class="d2" x="1100" y="925">дубовая ось</text>
      <path class="d3" pathLength="1" d="M1180 1068C1260 1060 1340 1072 1430 1062"/>
      <text class="d3" x="1185" y="1040">≈ 5200 лет</text></svg>`);
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
})();
