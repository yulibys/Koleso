# Graph Report - graph  (2026-10-17)

## Corpus Check
- Corpus is ~32,574 words - fits in a single context window. You may not need a graph.

## Summary
- 286 nodes · 608 edges · 16 communities (13 shown, 3 thin omitted)
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 110 edges (avg confidence: 0.8)
- Token cost: 359,000 input · 0 output

## Community Hubs (Navigation)
- Движок сцен app.js
- Журнал решений
- Финал и сансара
- Голос и тезис (1.1, 1.2, 1.7)
- Ритм, паузы, разрывы
- Колесо-проводник и гравюра
- Фотоэкраны и сетка (1.5)
- Предзащита и выпуск (1.8)
- Сборка и фото
- Раскадровка и двери (1.3)
- Пейзажи scenery.js
- Счётчик, титры, шрифты
- Рисунки повозок
- Плёнка и зерно
- Дрожь линии
- Кнопка звука

## God Nodes (most connected - your core abstractions)
1. `Рабочий контекст и журнал решений (context.md)` - 32 edges
2. `open — «Далеко собрались?» / дата (счётчик 17 октября 2026 → около 4000 г. до н. э.)` - 26 edges
3. `#guide — главное колесо-проводник (морфинг gMorph/gArt/gChalk/gShade)` - 22 edges
4. `KF — ключевые кадры колеса-проводника` - 17 edges
5. `later — «Колесо придумали позже флейты» (лента изобретений)` - 17 edges
6. `eq — «Одного колеса мало» (колесо + ось + кузов + груз + бык + дорога)` - 17 edges
7. `lab — «Соберите свою повозку» (интерактив)` - 17 edges
8. `rounds — «Колесо… Это как всё вокруг» / колесо сансары` - 17 edges
9. `Лекция 1.1. Лонгрид как особый медиум` - 17 edges
10. `day — «Этот распорядок никто не придумывал» (день вокруг колеса)` - 16 edges

## Surprising Connections (you probably didn't know these)
- `wheel.py — генератор гравюры #wheelArt` --semantically_similar_to--> `FIG — фигуры колёс (wheel, potter, spoked, pill, steer, ferris, bus, mouse, gear, dharma)`  [INFERRED] [semantically similar]
  art/wheel.py → src/app.js
- `nag() пейзаж — колонны` --references--> `nag — Нагасена и Милинда: «колесо — это колесница?»`  [INFERRED]
  src/scenery.js → src/body.html
- `wheel.py — генератор гравюры #wheelArt` --references--> `#wheelArt — гравюра колеса (SVG defs, штриховка wa-h1)`  [INFERRED]
  art/wheel.py → src/body.html
- `«5200 лет» заменено на «больше пяти тысяч лет» (датировка музея)` --rationale_for--> `find — «Ему больше пяти тысяч лет, и его нашли в болоте» (паспорт находки: 72 см, ясень, дуб)`  [AMBIGUOUS]
  docs/context.md → src/body.html
- `Отвергнуто: пиксельный мигающий фон и красные экраны (фидбек 2-10)` --semantically_similar_to--> `Тёмный медиум (Такер): убрать приём, который ничего не преобразует`  [INFERRED] [semantically similar]
  docs/context.md → lectures/1.1.txt

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Синтез звука: KS-буферы → ksPlay/air/soft → fx → play** — src_app_snd_ks, src_app_snd_ksplay, src_app_snd_air, src_app_snd_soft, src_app_snd_fx, src_app_snd_play, src_app_play [EXTRACTED 1.00]
- **Колесо-проводник: FIG → sampleFig → pairOf → morphD → guideFrame по KF** — src_app_fig, src_app_samplefig, src_app_pairof, src_app_morphd, src_app_kf, src_app_guideframe, guide_wheel [EXTRACTED 1.00]
- **Фото Викисклада: meta.json → стикеры gc.py → инлайн и подписи в b10.sh** — photos_meta, cut_gc_sticker, b10_build_v10, b10_photo_credits [INFERRED 0.85]
- **Фотоэкраны-паузы между сценами** — scene_ps1, scene_ps2, scene_ps3, scene_ps4, src_body_pscreen [EXTRACTED 1.00]
- **Система фото-вырезок, выезжающих по прогрессу --k** — src_body_collage, src_body_cut, src_body_stk, src_style_collage_css, src_style_cut_css, src_style_stk_css [INFERRED 0.85]
- **Слой немого кино: интертитры, мерцание, царапины, зерно** — src_body_rip_intertitle, src_body_silent_overlays, src_style_grain_css, src_body_fx_canvas [INFERRED 0.85]
- **Соседская дверь через лекции 1.1, 1.3, 1.8 и её отсутствие в проекте** — lectures_1_1_sosedskaya_dver, lectures_1_3_stvol_i_dveri, lectures_1_8_ssylka_kak_obeshchanie, lectures_1_8_finalnyy_porog, docs_map_fix_sosedskaya_dver, scene_find, scene_eq [EXTRACTED 1.00]
- **Колесо как ритурнель: проводник, меловая метка, возврат к началу и сансара** — lectures_1_3_riturnel, guide_wheel, wheel_art, docs_context_melovaya_metka, docs_context_koleso_provodnik, docs_map_final_k_nachalu, scene_open, scene_rounds [INFERRED 0.85]
- **Три тяжёлые зоны подряд без передышки** — lectures_1_3_plotnost, lectures_1_3_ma, docs_map_fix_tri_tyazhelye_zony, scene_later, scene_eq, scene_lab [EXTRACTED 1.00]

## Communities (16 total, 3 thin omitted)

### Community 0 - "Движок сцен app.js"
Cohesion: 0.09
Nodes (40): applyK(), scene('eq') handler, fin() — финальная перемотка и титры, gesture() — разблокировка AudioContext, Лаборатория: сборка повозки (P, sayL, upd), scene('later') handler, layLater(), loop() — главный цикл rAF (+32 more)

### Community 1 - "Журнал решений"
Cohesion: 0.09
Nodes (9): Рабочий контекст и журнал решений (context.md), Олег Пащенко (преподаватель), Юлия Бысова (автор), Лекция 1.4. Экранная типографика и выбор шрифта, Лекция 1.6. Управление вниманием: первый экран, паузы, open — «Далеко собрались?» / дата (счётчик 17 октября 2026 → около 4000 г. до н. э.), .cutflash — вспышка склейки, .rew-fx — эффект перемотки ◀◀ (+1 more)

### Community 2 - "Финал и сансара"
Cohesion: 0.08
Nodes (31): parade — Парад повозок: телега, колесница, дрезина 1817, автобус в 7:40, rounds — «Колесо… Это как всё вокруг» / колесо сансары, swamp — «Болото. Любляна, 2002 год» / «И вдруг — тук», Болото: генератор strataSvg и пузырей, scene('swamp') handler, Коллаж .collage (фото в фигурной рамке, data-shape), Вырезка .cut (предмет выезжает из-за края), #nagSvg — монах и царь, «колесница», «ось? нет / кузов? нет» (+23 more)

### Community 3 - "Голос и тезис (1.1, 1.2, 1.7)"
Cohesion: 0.10
Nodes (14): Карта проекта «Далеко собрались?» (MAP.md), Лекция 1.1. Лонгрид как особый медиум, Лекция 1.2. Тема, тезис, редакционный угол, Лекция 1.7. Сборка и публикация, адаптив, редактура, Фабрика вариантов и дом у реки, Кантастория: рассказчик перед последовательностью изображений, Карточка необходимости, Viewport и скролл: пространство превращается в длительность (+6 more)

### Community 4 - "Ритм, паузы, разрывы"
Cohesion: 0.13
Nodes (21): day — «Этот распорядок никто не придумывал» (день вокруг колеса), eq — «Одного колеса мало» (колесо + ось + кузов + груз + бык + дорога), lab — «Соберите свою повозку» (интерактив), later — «Колесо придумали позже флейты» (лента изобретений), nag — Нагасена и Милинда: «колесо — это колесница?», open2 — «Ловите! Как теперь его догнать?» (Побегу за ним / Возьму другое), scene('day') handler, KF — ключевые кадры колеса-проводника (+13 more)

### Community 5 - "Колесо-проводник и гравюра"
Cohesion: 0.16
Nodes (13): wheel.py — генератор гравюры #wheelArt, #guide — главное колесо-проводник (морфинг gMorph/gArt/gChalk/gShade), find — «Ему больше пяти тысяч лет, и его нашли в болоте» (паспорт находки: 72 см, ясень, дуб), FIG — фигуры колёс (wheel, potter, spoked, pill, steer, ferris, bus, mouse, gear, dharma), guideFrame(), morphD() — морфинг путей, pairOf(), sampleFig() (+5 more)

### Community 6 - "Фотоэкраны и сетка (1.5)"
Cohesion: 0.23
Nodes (11): Лекция 1.5. Модульные системы и сетки, ps1 — «Пять тысяч лет в болоте» (фотоэкран H1), ps2 — «Колесо есть. Ехать не на чем.» (фотоэкран H2), ps3 — «А потом поехали» (фотоэкран H3), ps4 — «Колесо давно с нами» (фотоэкран H4, flip), scene('ps1..ps4') handlers, Фото __HI_H1__ (фон фотоэкрана), Фото __HI_H2__ (фон фотоэкрана) (+3 more)

### Community 7 - "Предзащита и выпуск (1.8)"
Cohesion: 0.19
Nodes (6): Лекция 1.8. Предзащита и финальная редактура, Алетейя: честный режим сокрытия, Доска процесса из четырёх фреймов, Финальный порог публикации, Карта и калька: ответ материалу вместо копии референса, Нигредо: распад удобных объяснений

### Community 8 - "Сборка и фото"
Cohesion: 0.25
Nodes (14): b10.sh — сборка v10.html (инлайн CSS, JS, фото base64), Подписи фото с Викисклада (photoCredits), _sticker() — вырезка GrabCut в стикер WebP, sticker(), meta.json — метаданные фото Викисклада, F1 — Люблянское колесо с осью, N1 — Дхармачакра, Санчи, P1 — бычья повозка, Согндал (+6 more)

### Community 9 - "Раскадровка и двери (1.3)"
Cohesion: 0.26
Nodes (6): Лекция 1.3. Архитектура лонгрида: структура, раскадровка, Эффект Кулешова: значение кадра меняется от соседа, Карта соседства, «Маша» Фёдора Сваровского (разбор финала), Монтаж аттракционов (Эйзенштейн), 5–9 смысловых зон

### Community 10 - "Пейзажи scenery.js"
Cohesion: 0.26
Nodes (11): day() пейзаж, hero() пейзаж, hill(), hut() — изба, lab() пейзаж, later() пейзаж, mill() — мельница, nag() пейзаж — колонны (+3 more)

### Community 11 - "Счётчик, титры, шрифты"
Cohesion: 0.20
Nodes (11): Счётчик дат #oCount / #cnReel (Сегодня → Первое колесо), #creditsCard — титры «Конец», footer.foot — «Готовь сани летом, а телегу зимой», credits, «Наверх», Бегущая лента поговорок .tape («Не подмажешь — не поедешь…»), .cn-slot/.cn-reel/.cn-face — барабан дат, .credits-card/.foot — титры и подвал, Шрифт Alegreya (--serif/--hand, .voice/.hand), Шрифт Alegreya SC (--display, .disp) (+3 more)

### Community 12 - "Рисунки повозок"
Cohesion: 0.39
Nodes (8): Уравнение #eqRow .term (колесо+ось+кузов+груз+бык+дорога) и #eqCart, Кнопки выбора .o-opt + #runner / #wheel2 / #nudge, SVG defs: hatch/xhatch/dots patterns, #tCart — повозка с быком (template, части p-wheel/p-axle/p-body/p-load/p-ox/p-road/p-mud), #tHorse — лошадь (template), #tOx — бык (template), #tRunner — бегущий человек (template), Повозки парада .veh #v0–#v3 (телега, колесница, дрезина, автобус)

## Ambiguous Edges - Review These
- `window.SCENERY — генератор пейзажей-гравюр` → `mill() — мельница`  [AMBIGUOUS]
  src/scenery.js · relation: conceptually_related_to
- `find — «Ему больше пяти тысяч лет, и его нашли в болоте» (паспорт находки: 72 см, ясень, дуб)` → `«5200 лет» заменено на «больше пяти тысяч лет» (датировка музея)`  [AMBIGUOUS]
  docs/context.md · relation: rationale_for

## Knowledge Gaps
- **31 isolated node(s):** `prepType() — побуквенная печать`, `mill() — мельница`, `_sticker() — вырезка GrabCut в стикер WebP`, `boil0–2 «дрожь линии» filters (feTurbulence)`, `#fx canvas (пыль/зерно поверх страницы)` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 44 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `#guide — главное колесо-проводник (морфинг gMorph/gArt/gChalk/gShade)` connect `Колесо-проводник и гравюра` to `Журнал решений`, `Финал и сансара`, `Ритм, паузы, разрывы`, `Фотоэкраны и сетка (1.5)`, `Предзащита и выпуск (1.8)`?**
  _High betweenness centrality (0.171) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `open — «Далеко собрались?» / дата (счётчик 17 октября 2026 → около 4000 г. до н. э.)` (e.g. with `Снова чёрно-белое: плёнка на всех сценах (v12)` and `Минимализм: пейзажи упрощены до холмов, дороги и дерева (v15)`) actually correct?**
  _`open — «Далеко собрались?» / дата (счётчик 17 октября 2026 → около 4000 г. до н. э.)` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `prepType() — побуквенная печать`, `mill() — мельница`, `_sticker() — вырезка GrabCut в стикер WebP` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Движок сцен app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08658536585365853 - nodes in this community are weakly interconnected._
- **Why does `open — «Далеко собрались?» / дата (счётчик 17 октября 2026 → около 4000 г. до н. э.)` connect `Журнал решений` to `Движок сцен app.js`, `Финал и сансара`, `Голос и тезис (1.1, 1.2, 1.7)`, `Ритм, паузы, разрывы`, `Колесо-проводник и гравюра`, `Раскадровка и двери (1.3)`, `Пейзажи scenery.js`, `Счётчик, титры, шрифты`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `window.SCENERY — генератор пейзажей-гравюр` and `mill() — мельница`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `find — «Ему больше пяти тысяч лет, и его нашли в болоте» (паспорт находки: 72 см, ясень, дуб)` and `«5200 лет» заменено на «больше пяти тысяч лет» (датировка музея)`?**
  _Edge tagged AMBIGUOUS (relation: rationale_for) - confidence is low._