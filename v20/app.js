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
  $$('.sc').forEach((s) => s.style.setProperty('--len', (s.dataset.len * (COARSE ? 1.45 : 1)).toFixed(2)));
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
  const ul = (host, v) => { const p = host.querySelector('.ul path'); if (p) p.style.setProperty('--d', cl(v).toFixed(3)); };
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
  $('s1ohg').innerHTML = FIG.s1oh;
  $('s1stick').innerHTML = A.stick(400);
  // 2
  $('s2rot').innerHTML = A.wheel(278, { seed: 51 });
  $('s2mo').innerHTML = (() => {
    const arc = (R, a0, a1) => { const r = (d) => d * Math.PI / 180, p = (d) => `${(R * Math.cos(r(d))).toFixed(1)} ${(R * Math.sin(r(d))).toFixed(1)}`; return `<path d="M${p(a0)}A${R} ${R} 0 0 1 ${p(a1)}"/>`; };
    return [[318, 150, 182], [318, 196, 214], [352, 160, 198], [386, 172, 188], [318, -12, 22], [318, 34, 50], [352, -22, 14], [386, -6, 8]].map((v) => arc(...v)).join('');
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
  $('s7tr').innerHTML = FIG.s7trees;
  $('s7gr').innerHTML = FIG.s7grass;
  { const t = (k, x, y, sc, bx, by) => `<g transform="translate(${x} ${y}) scale(${sc}) translate(${-bx} ${-by})">${FIG[k]}</g>`;
    $('s7far').innerHTML = '<g opacity=".5" transform="translate(0 579) scale(1 .42) translate(0 -627)">' + FIG.s1mL + FIG.s1mR + '</g>' + t('treeR', 420, 579, 0.5, 1327, 575) + t('treeL', 1010, 579, 0.45, 128, 586) + A.birds(560, 250, 3, 13) + A.birds(900, 200, 2, 17); }
  $('s7sayg').innerHTML = FIG.s7say;
  $('s6qg').innerHTML = FIG.s6no; $('s6nog').innerHTML = FIG.s6q;
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
  let hint = false, s2done = false, ending = false, chase = 0, chaseT0 = null;
  const word = $('s1word'), letters = $$('span', word);
  // центры белки на шагах 2–9 из Figma (группа 101×74), затем — внутрь последней «о»
  const HOP = [[111, 29], [76, 128], [229, 204], [399, 303], [562, 342], [729, 347], [831, 378], [988, 346], [1033, 450]];
  const SQ = 0.45; // масштаб маленькой белки (≈101 px шириной)
  // колесо: шаг 10 → 11 → 12 → 13
  const RING = [[0.32, 1033, 450, 64], [0.39, 1091, 489, 187], [0.45, 750, 516, 187], [0.52, 720, 544, 218]];
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
    const swp = sg(p, 0.62, 0.67);
    op(word, 1 - swp);
    const cat = $('s1catch'); op(cat, swp > 0 ? 1 : 0); sw(cat, swp);
    letters[5].style.opacity = (1 - sg(p, 0.31, 0.33) + sg(p, 0.35, 0.39)).toFixed(3);

    // колесо
    const [cx0, cy, r] = ringAt(p);
    const roll = sg(p, 0.67, 0.77);
    const rx = roll < 0.23 ? lerp(720, 876, roll / 0.23) : roll < 0.46 ? lerp(876, 1001, (roll - 0.23) / 0.23) : lerp(1001, 1760, ez((roll - 0.46) / 0.54) * 0.5 + ((roll - 0.46) / 0.54) * 0.5);
    const cx = p < 0.67 ? (PORT ? lerp(cx0, 720, 0) : cx0) : rx;
    const rot = p * 1800 + ((cx - 720) / 218) * 57.3;
    put($('s1wheel'), cx, cy, r / 220, rot, sg(p, 0.315, 0.33));
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
    const live = p > 0.67 && p < 0.76;
    zone.style.pointerEvents = live ? 'auto' : 'none';
    put(zone, cx, cy, 1, 0);
    hn.classList.toggle('on', live && hint);
    hn.style.transform = `translate(${(cx - 102).toFixed(1)}px,${(387).toFixed(1)}px)`;

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
  };

  S.s2 = (p) => {
    const c = ez(sg(p, 0.05, 0.28));
    const i = Math.round(c * 5175);
    $('s2year').textContent = i <= 2025 ? 2026 - i : i - 2025;
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
    put($('s3say'), PH ? zx(mx) + 85 : mx + (PORT ? (TAB ? 90 : 60) : 237), PH ? 400 : PORT ? 380 : 428, PORT ? 0.85 : 1, 0);
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
    if (!Object.values(P).some(Boolean)) return 'Начните с&nbsp;колеса. С&nbsp;чего же ещё?';
    if (!P.wheel) return 'Без колеса её можно только тащить. Кряхтя.';
    if (!P.axle) return 'держаться не&nbsp;за&nbsp;что&nbsp;— оси нет';
    if (!P.body) return 'Колёса крутятся, а&nbsp;груз лежит на&nbsp;земле';
    if (!P.ox) return 'Тянуть некому. Самим впрягаться?';
    if (!P.load) return 'Везём воздух. Очень разумно.';
    return 'Готово. Теперь быка надо кормить, а&nbsp;ось&nbsp;— смазывать';
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
    const rig = cart.querySelector('.rig');
    if (rig) { rig.style.transition = 'none'; rig.style.transform = ready ? `translateX(${(1500 * sg(p, 0.46, 0.73)).toFixed(1)}px)` : ''; }
    coverSeq($('s5cov'), p, 0.74, 0.82);
  };

  S.s6 = (p) => {
    const h = $('s6h');
    sw(h, sg(p, 0.02, 0.13));
    h.style.transform = `translateY(${lerp(0, -256, ez(sg(p, 0.13, 0.18))).toFixed(1)}px)`;
    const f = sg(p, 0.18, 0.24);
    ['s6bg', 's6m', 's6k', 's6ch'].forEach((id) => op($(id), f));
    const s = 1.55;
    const s6s = PORT ? (TAB ? 1.4 : 1.15) : s; put($('s6k'), PORT ? (TAB ? 430 : 540) : 220, 839 - 145 * s6s, s6s, 0); put($('s6m'), PORT ? (TAB ? 1010 : 900) : 1220, 839 - 140 * s6s, s6s, 0);
    const win = (a, b) => sg(p, a, a + 0.02) - sg(p, b - 0.02, b);
    const Q = [['колесо — это колесница?', 0.26, 0.36], ['а&nbsp;ось?', 0.38, 0.48], ['а&nbsp;кузов?', 0.50, 0.60]];
    let qi = 0;
    Q.forEach((q, i) => { if (p >= q[1]) qi = i; });
    const qt = $('s6qt');
    if (qt.dataset.i !== String(qi)) { qt.dataset.i = qi; qt.innerHTML = Q[qi][0]; }
    op($('s6q'), win(Q[qi][1], Q[qi][2]));
    op($('s6no'), Math.max(win(0.30, 0.36), win(0.42, 0.48), win(0.54, 0.60)));
    const w = ez(sg(p, 0.32, 0.38)), ax = ez(sg(p, 0.44, 0.5)), bd = ez(sg(p, 0.56, 0.62));
    $('s6wheel').style.transform = `translateX(${(-700 * w).toFixed(1)}px)`;
    const spin = $('s6wheel').querySelector('.spin');
    spin.style.transform = `rotate(${(-w * 700).toFixed(1)}deg)`;
    $('s6axle').style.transform = `translateY(${(400 * ax).toFixed(1)}px)`;
    $('s6body').style.transform = $('s6pole').style.transform = `translateX(${(900 * bd).toFixed(1)}px)`;
    op($('s6end'), sg(p, 0.68, 0.72));
    sw($('s6fin'), sg(p, 0.73, 0.85));
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
    if (n.dataset.i !== String(cur)) { n.dataset.i = cur; n.firstChild.nodeValue = VNAME[cur][0]; $('s7c').innerHTML = VNAME[cur][1]; }
    const t = sg(p, WN[cur][0], WN[cur][1]);
    const vis = sg(t, 0.12, 0.25) - sg(t, 0.82, 0.95);
    op(n, vis); ul(n, vis);
    { const v = vehs[cur], RS = PORT ? (TAB ? 0.85 : 0.74) : 1, h = (v.el.offsetHeight || 200) * RS;
      const bx = PORT ? Math.min(720 + v.w * RS / 2 - 120, TAB ? 930 : 800) : Math.min(720 + v.w / 2 - 150, 1000), by = PORT ? 612 - h - (TAB ? 60 : -60) : Math.max(612 - h - 70, 300);
      $('s7say').style.transform = `translate(${(bx - 1082).toFixed(0)}px,${(by - 234).toFixed(0)}px)`;
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
    const cap = k === 4 ? `а это колесо вы прокрутили ${turns.toLocaleString('ru-RU')} ${wrd}` : CAPS[k];
    const capEl = $('s8cap');
    if (capEl.firstChild.nodeValue !== cap) capEl.firstChild.nodeValue = cap;
    const ct = (p - (B[k] - 0.0125)) / 0.07;
    ul(capEl, sg(ct, 0.25, 0.6));
    coverSeq($('s8c1'), p, 0.47, 0.52); textOut($('s8c1'), p, 0.56, 0.59);
    $('s8c2').style.transform = p >= 0.59 ? 'none' : 'translateY(100%)';
    const up = ez(sg(p, 0.64, 0.68));
    op($('s8wh'), spinOn ? 0 : 1);
    $('s8wh').style.transform = `translateY(${(90 * (1 - up)).toFixed(1)}px) rotate(${(sg(p, 0.63, 1) * 1440 + (ending ? performance.now() / 6 : 0)).toFixed(1)}deg)`;
    const outT = sg(p, 0.82, 0.86);
    const t1 = $('s8t1');
    op(t1, (p > 0.66 ? 1 : 0) - outT); sw(t1, sg(p, 0.66, 0.74));
    op($('s8t2'), sg(p, 0.72, 0.76) - outT);
    op($('s8arrow'), 0);
    if (p > 0.95 && !ending) startEnding();
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
      tick();
      if (t < 1) requestAnimationFrame(step);
      else { root.classList.remove('rewinding', 'locked'); done && done(); }
    })(t0);
  }
  const posIn = (sec, p) => sec.offsetTop + p * (sec.offsetHeight - H);
  function rewindToS1() {
    $('live').textContent = 'Перемотка назад';
    scrollAnim(posIn($('s1'), 0.95), 4200, () => { $('s2').hidden = true; sizes.clear(); $('live').textContent = ''; tick(); });
  }
  let endTimer = null, spinOn = false;
  $('spinw').innerHTML = A.wheel(170, { seed: 93 });
  function spin(on) { spinOn = on; $('spinov').classList.toggle('on', on); root.classList.toggle('spinning', on); $('rew').querySelector('em').textContent = on ? 'вы возвращаетесь в начало' : 'вернёмся к колесу'; }
  function cancelEnding() { if (endTimer) { clearTimeout(endTimer); endTimer = null; ending = false; } }
  function startEnding() {
    ending = true;
    endTimer = setTimeout(() => {
      endTimer = null;
      spin(true);
      scrollAnim(0, 5200, () => {
        spin(false);
        const end = $('end');
        end.hidden = false; end.classList.remove('out');
        const ew = $('endw'), t0 = performance.now();
        (function swp(now) { const t = cl((now - t0) / 1700); sw(ew, t); if (t < 1) requestAnimationFrame(swp); })(t0);
        $('s2').hidden = false; s2done = false;
        for (const k in P) { P[k] = 0; delete touched[k]; }
        labUpd(); chase = 0; chaseT0 = null; s3jump = false; sizes.clear();
        setTimeout(() => { end.classList.add('out'); setTimeout(() => { end.hidden = true; ending = false; tick(); }, 800); }, 5500);
      });
    }, 1800);
  }
  addEventListener('wheel', (e) => { if (endTimer && e.deltaY < 0) cancelEnding(); }, { passive: true });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') cancelEnding(); });

  /* ── события ── */
  const zone = $('s1stickzone');
  zone.addEventListener('pointerenter', () => { hint = true; });
  zone.addEventListener('pointerleave', () => { hint = false; });
  zone.addEventListener('click', () => { hint = !hint; });
  zone.addEventListener('focus', () => { hint = true; });
  zone.addEventListener('blur', () => { hint = false; });
  $('s3run').addEventListener('click', () => { if (chaseT0 === null) chaseT0 = performance.now(); });

  /* ── главный цикл ── */
  const secs = $$('.sc');
  function tick() {
    for (const sec of secs) {
      if (sec.hidden) continue;
      const r = sec.getBoundingClientRect();
      if (r.top > H || r.bottom < 0) continue;
      const stage = sec.firstElementChild;
      
      const target = cl(-r.top / (r.height - H));
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
    sizes.clear(); restore(); loop();
    // первое слово проявляется слева направо при открытии
    const t0 = performance.now(), w = $('s1word');
    (function swp(now) { const t = cl((now - t0) / 1900); if (scrollY < 10) sw(w, t); else sw(w, 1); if (t < 1) requestAnimationFrame(swp); })(t0);
  });
  window.__tick = tick;
})();
