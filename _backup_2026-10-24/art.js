/* «Колесо» v20 — рисунки в манере гравюры: тёмная заливка, штриховка на теневой стороне,
   дрожащий контур, мелкие детали. Цвет линии берётся из currentColor, штриховка — из узора #hatch
   (на кремовых экранах — #hatchI). */
window.ART = (function () {
  let seed = 7, uid = 0;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const j = (a) => (rnd() - 0.5) * 2 * a;
  const f = (n) => Math.round(n * 10) / 10;
  const setSeed = (s) => { seed = s; };

  function line(pts, wob = 1.2, closed = false) {
    let d = '';
    pts.forEach((p, i) => { d += (i ? 'L' : 'M') + f(p[0] + j(wob)) + ' ' + f(p[1] + j(wob)); });
    return d + (closed ? 'Z' : '');
  }
  function seg(x1, y1, x2, y2, wob = 1.4, n) {
    n = n || Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 22));
    const pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n; pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]); }
    return line(pts, wob);
  }
  function ringPts(cx, cy, r, wob, n) {
    const pts = [], ph = rnd() * 6;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2, rr = r + Math.sin(a * 3 + ph) * wob * 0.6 + j(wob * 0.5);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return pts;
  }
  function ring(cx, cy, r, wob = 1.6, n) { n = n || Math.max(24, Math.round(r / 4)); return line(ringPts(cx, cy, r, wob, n), 0.3); }
  function bez(p0, p1, p2, p3, n = 14) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, m = 1 - t;
      pts.push([m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
        m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]]);
    }
    return pts;
  }
  const P = (d, cls = '', extra = '') => `<path class="${cls}" d="${d}" ${extra}/>`;
  // фигура: заливка + (штриховка тени) + контур, контур проведён дважды
  function shape(d, shade, shadeOp = 0.7, wob2) {
    let s = P(d, 'bg', 'stroke="none"');
    if (shade) s += P(shade, 'hf', `opacity="${shadeOp}" stroke="none"`);
    s += P(d, '');
    if (wob2) s += P(wob2, 't', 'opacity=".55"');
    return s;
  }
  function clipped(clipD, inner) {
    const id = 'ac' + (uid++);
    return `<clipPath id="${id}"><path d="${clipD}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`;
  }

  /* КОЛЕСО: деревянный диск, обод со штриховкой, спицы — двойные бруски, ступица.
     opt.spokes=false — только обод (кольцо, в котором бегает белка). */
  function wheel(r = 200, opt = {}) {
    setSeed(opt.seed || 41);
    const n = opt.n || 8, rin = r * 0.86, hub = r * 0.13;
    let disc = '', s = '';
    const discD = ring(0, 0, r, r * 0.006 + 0.8);
    disc += P(discD, 'bg', 'stroke="none"');
    disc += clipped(discD, `<circle class="hf" cx="${f(r * 0.42)}" cy="${f(r * 0.42)}" r="${f(r * 1.05)}" opacity=".32" stroke="none"/>`);
    // спицы
    let sp = '';
    if (opt.spokes !== false) {
      const w = Math.max(2.5, r * 0.028);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + 0.2, ca = Math.cos(a), sa = Math.sin(a), nx = -sa * w, ny = ca * w;
        const a1 = [ca * hub * 0.9, sa * hub * 0.9], a2 = [ca * rin, sa * rin];
        const poly = line([[a1[0] + nx, a1[1] + ny], [a2[0] + nx * 1.4, a2[1] + ny * 1.4], [a2[0] - nx * 1.4, a2[1] - ny * 1.4], [a1[0] - nx, a1[1] - ny]], 0.4, true);
        sp += P(poly, 'bg', 'stroke="none"') + P(poly, 'hf', 'opacity=".35" stroke="none"') + P(seg(a1[0] + nx, a1[1] + ny, a2[0] + nx * 1.4, a2[1] + ny * 1.4, r * 0.004 + 0.6), 'spk') + P(seg(a1[0] - nx, a1[1] - ny, a2[0] - nx * 1.4, a2[1] - ny * 1.4, r * 0.004 + 0.6), 'spk');
      }
      const hubD = ring(0, 0, hub, 0.6, 18);
      sp += P(hubD, 'bg', 'stroke="none"') + P(hubD, 'hf', 'opacity=".6" stroke="none"') + P(hubD, '') + P(ring(0, 0, hub * 0.42, 0.3, 12), 'bg') + P(ring(0, 0, hub * 1.35, 0.5, 20), 't', 'opacity=".6"');
    }
    // обод
    let rim = '';
    const outD = ring(0, 0, r, r * 0.006 + 0.9), inD = ring(0, 0, rin, r * 0.006 + 0.9);
    let h = '';
    const k = Math.round(r * 0.75);
    for (let i = 0; i < k; i++) {
      const a = (i / k) * Math.PI * 2, a2 = a + 0.07;
      h += seg(Math.cos(a) * rin, Math.sin(a) * rin, Math.cos(a2) * r, Math.sin(a2) * r, 0.3, 1);
    }
    rim += P(outD + inD.replace('M', 'M'), 'bg', 'fill-rule="evenodd" stroke="none"') + P(h, 'hatch') + P(outD, 'rim') + P(inD, 'rim') + P(ring(0, 0, r * 1.012, 0.8), 't', 'opacity=".5"');
    // сучки на ободе
    for (let i = 0; i < 3; i++) { const a = 0.8 + i * 2.1, rr = (r + rin) / 2; s += P(ring(Math.cos(a) * rr, Math.sin(a) * rr, r * 0.018 + 1, 0.2, 8), 't'); }
    if (opt.parts) return { disc, spokes: sp, rim: rim + s };
    return disc + sp + rim + s;
  }

  /* БЕЛКА (смотрит вправо). Коробка ~ -20..215 по x, -190..0 по y; 0 — лапы. */

  // белка в стиле быка из старой версии: силуэт с фоном, штриховая полоса, короткие штрихи шерсти
  function squirrel2() {
    // белка в манере быка: простые мягкие формы, штриховая полоса снизу, точка-глаз, ноги палочками
    const S = (d, c = '', x = '') => `<path ${c ? `class="${c}"` : ''} ${x} d="${d}"/>`;
    const tail = 'M78 -46C44 -42 24 -66 28 -98C31 -124 22 -144 36 -164C50 -184 86 -184 100 -162C110 -146 102 -126 86 -126C74 -126 70 -138 78 -144C70 -132 72 -112 80 -94C88 -76 92 -60 78 -46Z';
    const body = 'M70 -50C76 -78 116 -86 146 -80C164 -76 172 -64 170 -50C168 -34 156 -22 140 -22L92 -22C78 -22 68 -34 70 -50Z';
    const head = 'M158 -84C162 -100 180 -108 196 -102C204 -98 208 -92 212 -84L216 -78C218 -72 212 -68 206 -68L184 -66C170 -66 160 -72 158 -84Z';
    return '<g transform="translate(-8 0)">' +
      // ноги позади
      `<g class="legA">${S('M100 -26C102 -14 99 -6 101 0M96 0H106')}${S('M156 -26C158 -14 155 -6 157 0M152 0H162')}</g>` +
      `<g class="legB">${S('M98 -26C94 -14 88 -6 84 -2M80 -2H90')}${S('M156 -26C162 -14 166 -6 170 -2M166 -2H176')}</g>` +
      S(tail, 'bg', 'stroke="none"') +
      S('M30 -98C28 -68 46 -48 74 -46L80 -56C58 -58 44 -76 44 -100C44 -128 38 -146 50 -166C36 -152 32 -126 30 -98Z', 'hf', 'opacity=".55" stroke="none"') +
      S(tail) +
      S('M52 -150C60 -164 74 -170 86 -168M46 -108C48 -88 56 -74 66 -64', 't') +
      S(body, 'bg', 'stroke="none"') +
      S('M78 -30C96 -24 136 -24 160 -32L166 -44C140 -36 100 -36 72 -42Z', 'hf', 'opacity=".6" stroke="none"') +
      S(body) +
      S('M98 -70C112 -74 130 -74 144 -70', 't') +
      S(head, 'bg', 'stroke="none"') + S(head) +
      S('M178 -102C176 -114 182 -122 190 -118C192 -112 190 -106 188 -102', 'bg') +
      `<circle class="fill" cx="194" cy="-88" r="2.3"/><circle class="fill" cx="214" cy="-78" r="1.8"/>` +
      // передняя лапка
      S('M164 -60C172 -60 176 -54 174 -48') +
      '</g>';
  }
  function squirrel(opt = {}) {
    setSeed(opt.seed || 5);
    const w = 0.8;
    let s = '';
    // хвост — пушистый силуэт вокруг осевой
    const C = bez([86, -36], [36, -40], [14, -96], [38, -132], 16).concat(bez([38, -132], [58, -166], [16, -186], [-4, -164], 12).slice(1), bez([-4, -164], [-16, -150], [0, -140], [8, -150], 6).slice(1));
    const Lr = [], Rr = [];
    C.forEach((pt, i) => {
      const a = C[Math.max(0, i - 1)], b = C[Math.min(C.length - 1, i + 1)];
      const nx = -(b[1] - a[1]), ny = b[0] - a[0], L = Math.hypot(nx, ny) || 1;
      const t = i / (C.length - 1);
      const wd = (6 + 20 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.7)) * (t > 0.85 ? (1 - t) / 0.15 * 0.7 + 0.3 : 1);
      const fl = i % 2 ? 4 : 0;
      Lr.push([pt[0] + nx / L * (wd + fl), pt[1] + ny / L * (wd + fl)]);
      Rr.push([pt[0] - nx / L * wd * 0.8, pt[1] - ny / L * wd * 0.8]);
    });
    const tailD = line(Lr.concat(Rr.slice().reverse()), w, true);
    const tailShade = line(C.concat(Rr.slice().reverse()), 0.3, true);
    s += shape(tailD, tailShade, 0.75);
    let th = '';
    for (let i = 2; i < C.length - 6; i += 3) {
      const a = C[i], b = C[i + 2], c2 = C[i + 3];
      const nx = -(b[1] - a[1]), ny = b[0] - a[0], L = Math.hypot(nx, ny) || 1, k = 6;
      th += line([[a[0] + nx / L * k, a[1] + ny / L * k], [b[0] + nx / L * k, b[1] + ny / L * k], [c2[0] + nx / L * k * 0.8, c2[1] + ny / L * k * 0.8]], 0.4);
    }
    s += P(th, 'fur');
    // туловище
    const bodyPts = bez([80, -30], [70, -52], [96, -68], [124, -66]).concat(bez([124, -66], [144, -64], [154, -56], [158, -48]).slice(1), bez([158, -48], [150, -32], [136, -24], [116, -23]).slice(1), bez([116, -23], [96, -22], [84, -22], [80, -30]).slice(1));
    const bodyD = line(bodyPts, w, true);
    const belly = line(bez([84, -34], [110, -40], [140, -40], [156, -44]).concat(bez([156, -44], [148, -30], [134, -24], [116, -23]).slice(1), bez([116, -23], [96, -22], [84, -24], [84, -34]).slice(1)), 0.3, true);
    // лапы под туловищем
    const legsA = line([[90, -26], [82, -10], [94, -1]], w) + line([[104, -24], [112, -8], [124, -2]], w) +
      line([[138, -28], [144, -12], [156, -6]], w) + line([[150, -34], [160, -20], [168, -14]], w);
    const legsB = line([[90, -26], [100, -10], [112, -2]], w) + line([[104, -24], [94, -8], [84, -2]], w) +
      line([[138, -28], [132, -10], [124, -2]], w) + line([[150, -34], [156, -16], [150, -4]], w);
    s += `<g class="legA">${P(legsA, 'body')}</g><g class="legB">${P(legsB, 'body')}</g>`;
    s += shape(bodyD, belly, 0.8);
    let sp = [];
    for (let i = 0; i <= 18; i++) { const a = i / 18 * Math.PI * 1.7 + 1.2, rr = 15 - i * 0.55; sp.push([98 + Math.cos(a) * rr, -38 + Math.sin(a) * rr]); }
    s += P(line(sp, 0.4), 'fur');
    // голова
    const headD = line(bez([152, -52], [154, -72], [172, -80], [184, -72]).concat(bez([184, -72], [192, -66], [198, -60], [200, -54]).slice(1), bez([200, -54], [194, -48], [180, -44], [166, -45]).slice(1), bez([166, -45], [158, -46], [152, -48], [152, -52]).slice(1)), w, true);
    s += shape(line([[164, -74], [168, -97], [181, -76]], 0.5, true), line([[170, -90], [181, -76], [172, -76]], 0.2, true), 0.6);
    s += shape(headD, line([[160, -48], [196, -52], [184, -45], [166, -45]], 0.3, true), 0.6);
    s += `<circle class="fill" cx="183" cy="-62" r="2.6"/><circle class="fill" cx="199.5" cy="-55" r="1.6"/>`;
    s += P(seg(196, -52, 214, -57, 0.4, 1) + seg(196, -50, 213, -45, 0.4, 1) + seg(192, -49, 206, -40, 0.4, 1), 'fur');
    return s;
  }

  // пучок травы и одуванчик
  function tuft(x, y, s = 14) { return line([[x, y], [x + s * 0.2, y - s], [x + s * 0.35, y], [x + s * 0.55, y - s * 0.8], [x + s * 0.7, y], [x + s * 0.9, y - s * 0.6], [x + s, y]], 0.6); }
  function grassAt(list, s = 22) { setSeed(3); return list.map(([x, y]) => tuft(x, y + 16, s * (0.85 + rnd() * 0.3))).join(''); }
  function grass(w = 1440, y0 = 640, y1 = 880, n = 22, sd = 3) {
    setSeed(sd);
    let d = '';
    for (let i = 0; i < n; i++) d += tuft(rnd() * (w - 40) + 10, y0 + rnd() * (y1 - y0), 12 + rnd() * 10);
    return d;
  }
  function flower(x, y, h) { return P(seg(x, y, x + j(3), y - h, 0.6, 3), 't') + `<circle class="bg" cx="${f(x)}" cy="${f(y - h - 4)}" r="4.5"/>` + P(ring(x, y - h - 4, 4.5, 0.3, 10), 't'); }

  /* ГОРЫ: залитый хребет, штриховка, складки склонов */
  function mountains(x0, x1, base, top, sd = 9) {
    setSeed(sd);
    const n = Math.round((x1 - x0) / 14), pts = [];
    const ph = [rnd() * 6, rnd() * 6, rnd() * 6];
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = x0 + (x1 - x0) * t;
      const env = Math.pow(Math.sin(t * Math.PI), 0.55);
      const hgt = 0.55 + 0.25 * Math.sin(t * 7 + ph[0]) + 0.15 * Math.sin(t * 17 + ph[1]) + 0.05 * Math.sin(t * 41 + ph[2]);
      pts.push([x, base - env * (base - top) * hgt]);
    }
    const ridge = line(pts, 1);
    const body = ridge + `L${x1} ${base}L${x0} ${base}Z`;
    // тень: правые склоны каждого пика
    let shade = '';
    for (let i = 1; i < n; i++) {
      if (pts[i][1] < pts[i - 1][1] && pts[i][1] <= pts[i + 1][1]) {
        let k = i;
        while (k < n && pts[k + 1][1] >= pts[k][1]) k++;
        const poly = pts.slice(i, k + 1).concat([[pts[k][0], base], [pts[i][0] + (pts[k][0] - pts[i][0]) * 0.25, base]]);
        shade += line(poly, 0.3, true);
      }
    }
    let folds = '';
    for (let i = 4; i < n - 3; i += 4 + Math.round(rnd() * 3)) {
      const p = pts[i];
      if (base - p[1] < 50) continue;
      const len = (base - p[1]) * (0.35 + rnd() * 0.4);
      folds += line(bez([p[0], p[1] + 6], [p[0] + j(10), p[1] + len * 0.4], [p[0] + j(14), p[1] + len * 0.7], [p[0] + j(18), p[1] + len], 5), 0.8);
    }
    return `<path class="bg" d="${body}" stroke="none"/><path class="hf" d="${body}" opacity=".22" stroke="none"/><path class="hf" d="${shade}" opacity=".55" stroke="none"/><path class="t" d="${folds}"/><path d="${ridge}"/>`;
  }

  // небрежная рамка-лист
  function frame(x0 = 79, y0 = 98, w = 1280, h = 746, sd = 13) {
    setSeed(sd);
    const pts = [];
    const side = (x1, y1, x2, y2) => { for (let i = 0; i < 9; i++) { const t = i / 9; pts.push([x1 + (x2 - x1) * t + j(6), y1 + (y2 - y1) * t + j(6)]); } };
    const x1 = x0 + w, y1 = y0 + h;
    side(x0, y0, x1, y0); side(x1, y0, x1, y1); side(x1, y1, x0, y1); side(x0, y1, x0, y0);
    let d = line(pts, 1.4, true);
    setSeed(sd + 1);
    d += line([[x0 + 20, y0 - 6], [x0 + w * 0.45, y0 + 7], [x1 - 30, y0 - 4]], 2) + line([[x1 + 6, y0 + 40], [x1 - 6, y0 + h * 0.55]], 2);
    return d;
  }
  function underline(w = 200, sd = 21) { setSeed(sd); return line([[0, 0], [w * 0.3, 3], [w * 0.62, 1], [w, 4]], 1.2) + line([[w * 0.1, 7], [w * 0.55, 6], [w * 0.92, 9]], 1); }
  function bubble(w = 160, h = 56, tail = 'left', sd = 31) {
    setSeed(sd);
    const pts = [];
    for (let i = 0; i <= 18; i++) { const a = (i / 18) * Math.PI * 2; pts.push([w / 2 + Math.cos(a) * (w / 2 + j(3)), h / 2 + Math.sin(a) * (h / 2 + j(3))]); }
    const tx = tail === 'left' ? w * 0.18 : w * 0.82, dir = tail === 'left' ? -1 : 1;
    return line(pts, 0.6) + ring(tx + dir * 10, h + 10, 4, 0.3, 10) + ring(tx + dir * 20, h + 22, 2.6, 0.3, 8);
  }
  // палка: брусок с сучком и корой
  function stick(len = 400, sd = 17) {
    setSeed(sd);
    const w = 9;
    const top = [[0, -w], [len * 0.35, -w + 3], [len * 0.7, -w + 1], [len, -w + 4]], bot = [[len, w - 2], [len * 0.7, w + 1], [len * 0.35, w - 1], [0, w]];
    const d = line(top.concat(bot), 1, true);
    let bark = '';
    for (let x = 18; x < len - 10; x += 26 + rnd() * 20) bark += seg(x, -w * 0.4 + j(2), x + 14, -w * 0.2 + j(2), 0.4, 1);
    return shape(d, line([[0, 1], [len, 2], [len, w - 2], [0, w]], 0.3, true), 0.7) + P(bark, 't') +
      shape(line([[len * 0.42, -w + 2], [len * 0.47, -w - 26], [len * 0.5, -w + 2]], 0.6, true), '', 0) + P(ring(len * 0.8, 0, 4, 0.3, 8), 't');
  }
  function motion(r = 230, sd = 23) {
    setSeed(sd);
    let d = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + rnd() * 0.3, r1 = r * (1.18 + rnd() * 0.15), r2 = r1 + 50 + rnd() * 70;
      d += seg(Math.cos(a) * r1, Math.sin(a) * r1, Math.cos(a + 0.12) * r2, Math.sin(a + 0.12) * r2, 2, 3);
    }
    return d;
  }

  /* ЧЕЛОВЕК в кафтане (ноги в y=0, рост ~320). pose 0 — стоит, 1/2 — бег. */
  function man(pose = 0, sd = 51) {
    setSeed(sd);
    const run = pose > 0, lean = run ? 14 : 0;
    let s = '';
    // ноги
    const L = pose === 0 ? [[[-14, -120], [-18, -60], [-20, 0]], [[14, -120], [18, -60], [22, 0]]]
      : pose === 1 ? [[[-10, -120], [-44, -70], [-70, -40]], [[10, -120], [30, -64], [24, 0]]]
        : [[[-10, -120], [-6, -60], [-28, -4]], [[10, -120], [46, -78], [74, -66]]];
    L.forEach((leg) => {
      s += P(line(leg, 0.8), 'th');
      const e = leg[2];
      s += shape(line([[e[0] - 6, e[1] - 6], [e[0] + 16, e[1] - 6], [e[0] + 20, e[1] + 2], [e[0] - 6, e[1] + 2]], 0.4, true), '', 0);
    });
    // кафтан
    const coat = line([[-26 + lean, -262], [26 + lean, -262], [44 + lean * 0.4, -112], [-44 + lean * 0.4, -112]], 1, true);
    const coatSh = line([[4 + lean, -262], [26 + lean, -262], [44 + lean * 0.4, -112], [8 + lean * 0.4, -112]], 0.4, true);
    // руки
    const arms = run ? line([[-22 + lean, -250], [-56 + lean, -200], [-60 + lean, -160]], 0.8) + line([[22 + lean, -250], [56 + lean, -232], [80 + lean, -250]], 0.8)
      : line([[-24, -250], [-36, -196], [-34, -150]], 0.8) + line([[24, -250], [36, -196], [34, -150]], 0.8);
    s += P(arms, 'th');
    s += shape(coat, coatSh, 0.7);
    s += P(seg(lean * 0.7, -258, lean * 0.4, -116, 0.6), 't') + P(seg(-40 + lean * 0.4, -140, 40 + lean * 0.4, -140, 0.8), 't');
    for (let k = 0; k < 4; k++) s += P(ring(lean * 0.6 - 2, -240 + k * 28, 1.6, 0.1, 6), 't');
    // голова и шапка
    const hx = lean + 2, hy = -288;
    s += `<g class="head" data-hx="${hx}" data-hy="${hy}">`;
    s += shape(ring(hx, hy, 24, 0.8, 22), '', 0);
    s += shape(line([[hx - 26, hy - 14], [hx - 20, hy - 34], [hx + 18, hy - 36], [hx + 26, hy - 14]], 0.6, true), line([[hx, hy - 35], [hx + 18, hy - 36], [hx + 26, hy - 14], [hx, hy - 14]], 0.3, true), 0.7);
    s += `<g class="eyes"><circle class="fill" cx="${hx - 8}" cy="${hy + 2}" r="1.8"/><circle class="fill" cx="${hx + 8}" cy="${hy + 2}" r="1.8"/></g>` + P(line([[hx - 7, hy + 11], [hx, hy + 14], [hx + 7, hy + 11]], 0.3), 't') + '</g>';
    return s;
  }
  // дуб: курчавая крона с заштрихованной половиной, ствол-брусок
  function oak(x, y, h, sd = 61) {
    setSeed(sd);
    const r = h * 0.36, cy = y - h * 0.64;
    let d = '';
    const n = 14;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2, rr = r * (0.88 + rnd() * 0.2), px = x + Math.cos(a) * rr * 1.12, py = cy + Math.sin(a) * rr * 0.92;
      if (!i) d = `M${f(px)} ${f(py)}`;
      else { const a2 = a - Math.PI / n, qx = x + Math.cos(a2) * rr * 1.35, qy = cy + Math.sin(a2) * rr * 1.12; d += `Q${f(qx)} ${f(qy)} ${f(px)} ${f(py)}`; }
    }
    d += 'Z';
    const trunk = line([[x - h * 0.05, y], [x - h * 0.04, y - h * 0.3], [x + h * 0.04, y - h * 0.3], [x + h * 0.05, y]], 0.6, true);
    return shape(trunk, line([[x, y], [x, y - h * 0.3], [x + h * 0.04, y - h * 0.3], [x + h * 0.05, y]], 0.2, true), 0.6) +
      P(d, 'bg', 'stroke="none"') + clipped(d, `<circle class="hf" cx="${f(x + r * 0.55)}" cy="${f(cy + r * 0.45)}" r="${f(r * 1.05)}" opacity=".75" stroke="none"/>`) + P(d, '');
  }
  function stone(x, y, s) {
    const d = `M${f(x - s)} ${f(y)}C${f(x - s)} ${f(y - s * 0.8)} ${f(x + s)} ${f(y - s * 0.9)} ${f(x + s)} ${f(y)}Z`;
    return shape(d, `M${f(x)} ${f(y)}C${f(x + s * 0.4)} ${f(y - s * 0.5)} ${f(x + s)} ${f(y - s * 0.5)} ${f(x + s)} ${f(y)}Z`, 0.7);
  }

  /* БОЛОТО (кадр 1440×1476 как в Figma): волнистые пласты, торф точками, камыш, камни, пузыри */
  function bog() {
    setSeed(71);
    const W = 1440;
    const layer = (y0, amp = 26) => {
      const pts = [];
      for (let x = -20; x <= W + 20; x += 30) pts.push([x, y0 + Math.sin(x / 150 + y0) * amp * 0.5 + j(4)]);
      return pts;
    };
    const Ls = [layer(410), layer(612), layer(842), layer(1096), layer(1372)];
    let s = '';
    // пласты: заливка полос разной фактурой
    const fills = ['dot', 'hf', 'dot', 'hf', 'dot'];
    Ls.forEach((pts, k) => {
      const next = Ls[k + 1] || [[-20, 1500], [W + 20, 1500]];
      const poly = line(pts, 0.6) + `L${W + 20} ${next === Ls[k + 1] ? next[next.length - 1][1] : 1500}` + line(next.slice().reverse(), 0.6).replace('M', 'L') + 'Z';
      s += P(poly, fills[k], `opacity="${fills[k] === 'dot' ? 0.35 : 0.18}" stroke="none"`);
    });
    Ls.forEach((pts) => { s += P(line(pts, 1.2), ''); s += P(line(pts.map((p) => [p[0], p[1] + 8]), 1.4), 't', 'opacity=".5"'); });
    // штрихи и кусочки
    let fine = '';
    for (let k = 0; k < 5; k++) for (let x = 30; x < W; x += 60 + rnd() * 90) { const y = Ls[k][Math.round((x + 20) / 30)][1] + 40 + rnd() * 140; fine += seg(x, y, x + 24 + rnd() * 40, y + j(10), 1, 2); }
    for (let i = 0; i < 26; i++) fine += ring(rnd() * W, 440 + rnd() * 1000, 3 + rnd() * 4, 0.4, 9);
    s += P(fine, 't');
    // камни в толще
    [[285, 560, 22], [120, 780, 16], [505, 760, 26], [740, 530, 18], [1125, 740, 14], [1128, 525, 28], [1270, 1000, 20], [1105, 1220, 16], [820, 980, 30], [655, 1260, 24], [205, 1258, 22], [300, 1010, 12]].forEach(([x, y, r]) => { s += stone(x, y, r); });
    // корни-заусенцы под верхним слоем
    let roots = '';
    for (let x = 10; x < W; x += 22 + rnd() * 16) roots += seg(x, 420 + j(6), x + j(6), 446 + rnd() * 12, 0.6, 1);
    s += P(roots, 't');
    // камыш (рогоз): стебель, бархатная головка
    let reeds = '';
    [[90, 344, 95], [230, 354, 95], [450, 281, 95], [914, 339, 95], [1227, 301, 95], [1403, 324, 95], [1228, 342, 61], [1332, 353, 61], [946, 370, 61], [907, 370, 61], [1036, 364, 61], [456, 331, 61], [580, 366, 61], [228, 393, 61], [213, 395, 61], [88, 392, 61], [39, 388, 61], [338, 334, 61], [730, 334, 61], [759, 334, 61], [816, 353, 61], [741, 314, 81]].forEach(([x, y, h]) => {
      reeds += P(seg(x, y + h + 30, x + j(3), y, 0.6, 4), 't');
      const hh = h > 80 ? 26 : 17, ww = h > 80 ? 5 : 3.5;
      reeds += shape(line([[x - ww, y + hh], [x - ww, y + 2], [x, y - 3], [x + ww, y + 2], [x + ww, y + hh]], 0.3, true), line([[x, y], [x + ww, y + 2], [x + ww, y + hh], [x, y + hh]], 0.2, true), 0.8) + P(seg(x, y - 3, x, y - 12, 0.3, 1), 't');
    });
    s += reeds;
    return s;
  }

  /* ВИДЫ КОЛЕСА для финала: каждый — один путь для перерисовки линией */
  function pill(r = 150) { setSeed(81); return ring(0, 0, r, 2) + seg(-r * 0.86, 0, r * 0.86, 0, 2, 6) + ring(0, 0, r * 0.82, 1.2); }
  function steering(r = 150) { setSeed(83); return ring(0, 0, r, 2) + ring(0, 0, r * 0.86, 2) + ring(0, 0, r * 0.2, 1) + seg(-r * 0.86, 0, -r * 0.2, 0, 1.5) + seg(r * 0.2, 0, r * 0.86, 0, 1.5) + seg(0, r * 0.2, 0, r * 0.86, 1.5); }
  function ferris(r = 150) {
    setSeed(85);
    let d = ring(0, 0, r, 2) + ring(0, 0, r * 0.12, 1);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, cx = Math.cos(a) * r, cy = Math.sin(a) * r;
      d += seg(0, 0, cx, cy, 1, 4) + line([[cx - 9, cy + 4], [cx + 9, cy + 4], [cx + 7, cy + 18], [cx - 7, cy + 18]], 0.6, true);
    }
    return d + seg(0, 0, -r * 0.6, r * 1.25, 1.5) + seg(0, 0, r * 0.6, r * 1.25, 1.5);
  }
  function mouse(r = 150) {
    setSeed(87);
    let d = line([[-r * 0.62, -r * 0.3], [-r * 0.55, -r * 0.9], [0, -r * 1.05], [r * 0.55, -r * 0.9], [r * 0.62, -r * 0.3], [r * 0.6, r * 0.6], [0, r * 1.05], [-r * 0.6, r * 0.6]], 2, true);
    d += seg(0, -r * 1.02, 0, -r * 0.25, 1) + seg(-r * 0.6, -r * 0.25, r * 0.6, -r * 0.25, 1) + line([[-r * 0.08, -r * 0.82], [r * 0.08, -r * 0.82], [r * 0.08, -r * 0.48], [-r * 0.08, -r * 0.48]], 0.5, true);
    for (let i = 0; i < 4; i++) d += seg(-r * 0.06, -r * 0.76 + i * r * 0.08, r * 0.06, -r * 0.76 + i * r * 0.08, 0.3, 1);
    return d;
  }
  function gear(r = 150) {
    setSeed(89);
    const pts = [], n = 12;
    for (let i = 0; i < n * 4; i++) { const a = (i / (n * 4)) * Math.PI * 2, rr = i % 4 < 2 ? r : r * 0.82; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
    return line(pts, 1.2, true) + ring(0, 0, r * 0.25, 1) + ring(0, 0, r * 0.08, 0.5);
  }

  /* Колесница по частям (из прошлой версии, координаты 356..780 × 216..402); колесо — новое */
  function chariotParts() {
    setSeed(93);
    return {
      wheel: `<g transform="translate(430 340)"><g class="spin">${wheel(62, { seed: 95 })}</g></g>`,
      axle: shape('M372 334H548V344H372Z', 'M372 334H548V344H372Z', 0.6),
      body: shape('M360 330C356 280 380 248 420 240L520 240C534 240 540 252 532 272L512 330Z', 'M370 326C368 290 386 262 414 254L420 326Z', 0.8) + P('M390 240C400 226 440 222 470 228', '') + P('M380 300H520M390 270H526', 't', 'opacity=".6"'),
      pole: P('M520 326L760 318M752 300L768 336M740 306H780', ''),
    };
  }
  // монах и царь (из прошлой версии, увеличены); ноги на y=0
  function monk() {
    return shape('M-34 0C-38 -100 -30 -170 0 -204C30 -170 40 -100 36 0Z', 'M0 -204C30 -170 40 -100 36 0H10C16 -80 12 -150 0 -204Z', 0.8) +
      P('M-20 -186L30 -70M20 -160L80 -174L106 -186') + shape(ring(0, -226, 22, 0.6, 20), '', 0) + P('M-10 -228h4M6 -228h4M-6 -216c4 3 8 3 12 0', 't');
  }
  function king() {
    return shape('M-50 0C-50 -100 -34 -180 0 -214C34 -180 52 -100 52 0Z', 'M0 -214C34 -180 52 -100 52 0H20C26 -100 16 -170 0 -214Z', 0.8, 'M-30 -40C-10 -48 10 -48 30 -40') +
      P('M-30 -138C-10 -150 10 -150 30 -138') + shape(ring(0, -238, 22, 0.6, 20), '', 0) +
      shape('M-22 -256L-18 -282L-8 -268L0 -288L8 -268L18 -282L22 -256Z', 'M0 -288L8 -268L18 -282L22 -256H0Z', 0.6) + P('M-14 -226C-12 -204 12 -204 14 -226M-10 -240h4M6 -240h4', 't');
  }
  // аркада для сцены Нагасены
  function arcade(W = 1440, base = 839, top = 380) {
    let s = '';
    for (let i = 0; i < 7; i++) {
      const x = W / 2 - 22 + (i - 3) * 240;
      s += shape(`M${x} ${base}V${top}h44V${base}Z`, `M${x + 26} ${base}V${top}h18V${base}Z`, 0.6) + P(`M${x - 12} ${top}h68v-16h-68ZM${x - 10} ${base}h64v12h-64Z`, '');
      if (i < 6) s += P(`M${x + 44} ${top + 90}C${x + 80} ${top} ${x + 204} ${top} ${x + 240} ${top + 90}`, 't');
    }
    return s;
  }
  // полоса земли под повозкой (как в лаборатории прошлой версии)
  function soil(x0, x1, y, h) {
    setSeed(101);
    const d = `M${x0} ${y}H${x1}V${y + h}H${x0}Z`;
    let s = shape(d, d, 0.5);
    let fine = '';
    for (let i = 0; i < 18; i++) { const x = x0 + rnd() * (x1 - x0), yy = y + 10 + rnd() * (h - 20); fine += i % 3 ? seg(x, yy, x + 14 + rnd() * 20, yy, 0.5, 1) : ring(x, yy, 3 + rnd() * 2, 0.3, 8); }
    s += P(fine, 't');
    let gr = '';
    for (let x = x0 + 30; x < x1 - 20; x += 34 + rnd() * 40) gr += tuft(x, y, 14 + rnd() * 12);
    s += P(gr, 't');
    for (let k = 0; k < 6; k++) s += flower(x0 + 80 + k * (x1 - x0 - 160) / 5 + j(20), y, 18 + rnd() * 10);
    return s;
  }


  // пологий холм со штриховкой (как в прошлой версии)
  function hill(x0, x1, base, top, op = 0.3) {
    const mid = (x0 + x1) / 2, w = x1 - x0;
    const d = `M${x0} ${base}C${f(x0 + w * 0.2)} ${f(top + (base - top) * 0.4)} ${f(mid - w * 0.18)} ${top} ${f(mid)} ${top}S${f(x1 - w * 0.2)} ${f(top + (base - top) * 0.45)} ${x1} ${base}`;
    return `<path class="bg" d="${d}Z" stroke="none"/><path class="hf" d="${d}Z" opacity="${op}" stroke="none"/><path d="${d}"/>`;
  }
  // изба с дымом
  function hut(x, y, s) {
    const w = s, h = s * 0.6;
    return shape(`M${x} ${y}V${f(y - h)}H${f(x + w)}V${y}Z`, '', 0) + P(`M${x} ${f(y - h * 0.33)}H${f(x + w)}M${x} ${f(y - h * 0.66)}H${f(x + w)}`, 't') +
      shape(`M${f(x - s * 0.12)} ${f(y - h)}L${f(x + w * 0.5)} ${f(y - h - s * 0.55)}L${f(x + w + s * 0.12)} ${f(y - h)}Z`, `M${f(x + w * 0.5)} ${f(y - h - s * 0.55)}L${f(x + w + s * 0.12)} ${f(y - h)}H${f(x + w * 0.5)}Z`, 0.7) +
      shape(`M${f(x + w * 0.38)} ${y}V${f(y - h * 0.6)}H${f(x + w * 0.62)}V${y}Z`, '', 0) + P(`M${f(x + w * 0.72)} ${f(y - h * 0.7)}h${f(w * 0.18)}v${f(h * 0.22)}h${f(-w * 0.18)}Z`, '') +
      P(`M${f(x + w * 0.72)} ${f(y - h - s * 0.2)}v${f(-s * 0.3)}h${f(s * 0.1)}v${f(s * 0.2)}`, '') +
      P(`M${f(x + w * 0.77)} ${f(y - h - s * 0.55)}c-10 -14 14 -22 0 -38s12 -22 4 -40M${f(x + w * 0.8)} ${f(y - h - s * 0.7)}c12 -12 -8 -22 6 -36`, 't smoke');
  }
  function birds(x, y, n, sd = 5) {
    setSeed(sd);
    let d = '';
    for (let i = 0; i < n; i++) { const bx = x + rnd() * 160, by = y + rnd() * 60, k = 6 + rnd() * 6; d += `M${f(bx)} ${f(by)}q${f(k * 0.5)} ${f(-k * 0.6)} ${f(k)} 0q${f(k * 0.5)} ${f(-k * 0.6)} ${f(k)} 0`; }
    return P(d, 't');
  }
  function flowers(list) { return list.map(([x, y, h]) => flower(x, y, h)).join(''); }

  return { squirrel2, hill, hut, birds, flowers, wheel, squirrel, grass, grassAt, mountains, frame, underline, bubble, stick, motion, man, oak, stone, bog, pill, steering, ferris, mouse, gear, chariotParts, king, monk, arcade, soil, ring, seg, line, setSeed, shape };
})();
