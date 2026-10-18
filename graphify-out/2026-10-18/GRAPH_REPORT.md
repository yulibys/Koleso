# Graph Report - longrid  (2026-10-18)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 574 nodes · 1277 edges · 22 communities (16 shown, 6 thin omitted)
- Extraction: 76% EXTRACTED · 24% INFERRED · 0% AMBIGUOUS · INFERRED: 308 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cdf56e5a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Журнал решений
- Фото, вырезки, права (1.7)
- Типографика (1.4)
- Первый экран и внимание (1.6)
- Интерактив и проверка читателем
- Движок сцен и звуки (app.js)
- Колесо-проводник и гравюра
- Раскадровка и двери (1.3)
- Сетки и модуль (1.5)
- Пейзажи (scenery.js)
- Сборка, источники, финал
- Выпуск и предзащита (1.8)
- Рисунки повозок
- scenery.js
- Лекция 1.8. Предзащита и финальная редактура
- SVG defs: hatch/xhatch/dots patterns
- boil0–2 «дрожь линии» filters (feTurbulence)

## God Nodes (most connected - your core abstractions)
1. `Лекция 1.6. Управление вниманием: первый экран, паузы` - 44 edges
2. `Лекция 1.4. Экранная типографика и выбор шрифта` - 42 edges
3. `Лекция 1.5. Модульные системы и сетки` - 42 edges
4. `Лекция 1.7. Сборка и публикация, адаптив, редактура` - 39 edges
5. `Рабочий контекст и журнал решений (context.md)` - 32 edges
6. `open — «Далеко собрались?» / дата (счётчик 17 октября 2026 → около 4000 г. до н. э.)` - 30 edges
7. `#guide — главное колесо-проводник (морфинг gMorph/gArt/gChalk/gShade)` - 30 edges
8. `lab — «Соберите свою повозку» (интерактив)` - 18 edges
9. `line()` - 17 edges
10. `line()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Мобильное преобразование — не общий Scale` --conceptually_related_to--> `layout()`  [INFERRED]
  docs/lectures/1.5.txt → src/app.js
- `Вопрос на входе — ответ в финале` --rationale_for--> `rewind()`  [INFERRED]
  docs/lectures/1.6.txt → src/app.js
- `Гигиена набора: «ёлочки»/„лапки“, тире, минус, ×` --rationale_for--> `prepType()`  [INFERRED]
  docs/lectures/1.4.txt → src/app.js
- `Неразрывные пробелы — только для смысловых пар` --rationale_for--> `prepType()`  [INFERRED]
  docs/lectures/1.4.txt → src/app.js
- `batten()` --references--> `#wheelArt — гравюра колеса (SVG defs, штриховка wa-h1)`  [INFERRED]
  art/wheel.py → src/body.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Протокол базовой доступности** — docs_lectures_1_5_kontrast_wcag, docs_lectures_1_5_cvet_ne_edinstvennyy, docs_lectures_1_5_reflow_320, docs_lectures_1_5_zoom_200, docs_lectures_1_5_smyslovoy_poryadok, docs_lectures_1_5_alt_tekst [EXTRACTED 1.00]
- **Первый экран как договор** — docs_lectures_1_6_porog_pyat_funktsiy, docs_lectures_1_6_dva_vkhoda, docs_lectures_1_6_obeshchanie_opyta, docs_lectures_1_6_audit_prosb, docs_lectures_1_6_saundchek [EXTRACTED 1.00]
- **Ритм: акцент, пауза, выход** — docs_lectures_1_6_aktsent_otnositelno_okruzheniya, docs_lectures_1_6_pauza_s_funktsiey, docs_lectures_1_6_pravo_vykhoda, docs_lectures_1_6_karta_vnimaniya [EXTRACTED 1.00]
- **Три линзы цены внимания** — docs_lectures_1_6_ostranenie, docs_lectures_1_6_nasyshchennyy_fenomen, docs_lectures_1_6_pamyat_otvetstvennost [EXTRACTED 1.00]
- **Проверка адаптива телом** — docs_lectures_1_7_reflow_320, docs_lectures_1_7_resize_200, docs_lectures_1_7_bez_hover_drag, docs_lectures_1_7_klaviatura_fokus, docs_lectures_1_7_ostanovit_dvizhenie_zvuk [EXTRACTED 1.00]
- **Три линзы сборки: молоток, фармакон, палимпсест** — docs_lectures_1_7_slomannyy_molotok, docs_lectures_1_7_farmakon, docs_lectures_1_7_palimpsest [EXTRACTED 1.00]
- **Фиксация выпуска версии** — docs_lectures_1_7_publikatsionnyy_porog, docs_lectures_1_7_kartochka_vypuska, docs_lectures_1_7_arkhivnyy_slepok, docs_lectures_1_7_zhurnal_resheniy [EXTRACTED 1.00]
- **Проверка системы в реальных состояниях** — docs_lectures_1_4_masshtab_200, docs_lectures_1_4_text_spacing, docs_lectures_1_4_sostoyaniya, docs_lectures_1_4_komplektnost [EXTRACTED 1.00]
- **Связка параметров тела чтения** — docs_lectures_1_4_stroka_50_75, docs_lectures_1_4_interlinyazh, docs_lectures_1_4_kegl_vret, docs_lectures_1_4_vyklyuchka_vlevo [EXTRACTED 1.00]
- **Фотоэкраны-паузы между сценами** — scene_ps1, scene_ps2, scene_ps3, scene_ps4, src_body_pscreen [EXTRACTED 1.00]
- **Соседская дверь через лекции 1.1, 1.3, 1.8 и её отсутствие в проекте** — docs_lectures_1_1_sosedskaya_dver, docs_lectures_1_3_stvol_i_dveri, docs_lectures_1_8_ssylka_kak_obeshchanie, docs_lectures_1_8_finalnyy_porog, docs_map_fix_sosedskaya_dver, scene_find, scene_eq [EXTRACTED 1.00]
- **Три тяжёлые зоны подряд без передышки** — docs_lectures_1_3_plotnost, docs_lectures_1_3_ma, docs_map_fix_tri_tyazhelye_zony, scene_later, scene_eq, scene_lab [EXTRACTED 1.00]
- **Мобильное превращение фрагмента** — docs_lectures_1_5_operacii_preobrazovaniya, docs_lectures_1_5_granica_perestroyki, docs_lectures_1_5_smyslovoy_uzel, docs_lectures_1_5_smyslovoy_poryadok, docs_lectures_1_5_zakony_glagolami [INFERRED 0.85]
- **Система интервалов от строки** — docs_lectures_1_5_shkala_intervalov, docs_lectures_1_5_mikromodul_8, docs_lectures_1_5_vertikalnyy_ritm, docs_lectures_1_5_zhestkaya_myagkaya, docs_lectures_1_5_pauza_ne_privilegiya [INFERRED 0.85]
- **Одна семья Alegreya: роли внутри суперсемейства** — docs_lectures_1_4_odna_garnitura, docs_lectures_1_4_nastoyashchaya_kapitel, docs_lectures_1_4_cherez_odnogo, src_style_font_alegreya, src_style_font_alegreya_sc [INFERRED 0.85]
- **Система фото-вырезок, выезжающих по прогрессу --k** — src_body_collage, src_body_cut, src_body_stk, src_style_collage_css, src_style_cut_css, src_style_stk_css [INFERRED 0.85]
- **Колесо как ритурнель: проводник, меловая метка, возврат к началу и сансара** — docs_lectures_1_3_riturnel, guide_wheel, wheel_art, docs_context_melovaya_metka, docs_context_koleso_provodnik, docs_map_final_k_nachalu, scene_open, scene_rounds [INFERRED 0.85]
- **Слой немого кино: интертитры, мерцание, царапины, зерно** — src_body_rip_intertitle, src_body_silent_overlays, src_style_grain_css, src_body_fx_canvas [INFERRED 0.85]

## Communities (22 total, 6 thin omitted)

### Community 0 - "Журнал решений"
Cohesion: 0.07
Nodes (19): Рабочий контекст и журнал решений (context.md), Олег Пащенко (преподаватель), Юлия Бысова (автор), Фабрика вариантов и дом у реки, Кантастория: рассказчик перед последовательностью изображений, Карточка необходимости, Viewport и скролл: пространство превращается в длительность, Свиток: последовательность и жест разворачивания (+11 more)

### Community 1 - "Фото, вырезки, права (1.7)"
Cohesion: 0.07
Nodes (42): Память как ответственность (Мец): финал помнит первый экран, air(), applyK(), click(), clop(), env(), fin(), gesture() (+34 more)

### Community 2 - "Типографика (1.4)"
Cohesion: 0.06
Nodes (17): b10.sh script, Абзац — монтажная единица, не метроном, Акцидентный (display) и текстовый шрифт — разные назначения, Типографика делает две работы: доступ и голос, Приём единого штриха, Шрифтовые пары как отношения персонажей, Система встречается фазами: проверять состояния (гиперобъект), Три принципа формообразования (Вильберг — Тарбеев) (+9 more)

### Community 3 - "Первый экран и внимание (1.6)"
Cohesion: 0.07
Nodes (41): Повтор с отклонением на третьем (Делёз), Насыщенный феномен (Марион): рамка входа и тихое последействие, #guide — главное колесо-проводник (морфинг gMorph/gArt/gChalk/gShade), day — «Этот распорядок никто не придумывал» (день вокруг колеса), find — «Ему больше пяти тысяч лет, и его нашли в болоте» (паспорт находки: 72 см, ясень, дуб), parade — Парад повозок: телега, колесница, дрезина 1817, автобус в 7:40, ps1 — «Пять тысяч лет в болоте» (фотоэкран H1), ps2 — «Колесо есть. Ехать не на чем.» (фотоэкран H2) (+33 more)

### Community 4 - "Интерактив и проверка читателем"
Cohesion: 0.06
Nodes (19): Остранение (Шкловский): мотивированный локальный сбой, Фармакон (Платон, Деррида, Стиглер): ИИ — лекарство и яд, История ножа: как изменился тот, кто выбирает, Палимпсест (Женетт): прежний слой объясняет нынешнюю форму, Слабый дизайн: материал может изменить замысел, Сломанный молоток (Хайдеггер): поломка обнажает зависимость, Лекция 1.7. Сборка и публикация, адаптив, редактура, lab — «Соберите свою повозку» (интерактив) (+11 more)

### Community 5 - "Движок сцен и звуки (app.js)"
Cohesion: 0.12
Nodes (39): arcade(), bez(), bog(), bubble(), chariotParts(), clipped(), ferris(), flower() (+31 more)

### Community 6 - "Колесо-проводник и гравюра"
Cohesion: 0.06
Nodes (19): Разборчивость знака ≠ удобство длительного чтения, Акцент работает относительно окружения, Лицо становится главным говорящим, Мультистабильность продлевает рассматривание, У пустоты есть работа, Визуальный триггер: остановка должна вести в содержание, Задача зрителя меняет маршрут взгляда, Лекция 1.6. Управление вниманием: первый экран, паузы (+11 more)

### Community 7 - "Раскадровка и двери (1.3)"
Cohesion: 0.14
Nodes (35): arcade(), bez(), bog(), bubble(), chariotParts(), clipped(), ferris(), flower() (+27 more)

### Community 8 - "Сетки и модуль (1.5)"
Cohesion: 0.10
Nodes (17): sticker(), _sticker(), Общая судьба: совместное движение собирает группу, Карта и калька: ответ материалу вместо копии референса, rounds — «Колесо… Это как всё вокруг» / колесо сансары, Вырезка .cut (предмет выезжает из-за края), C_dharma — Колесо дхармы (.cut), C_ferris — Колесо обозрения (.cut) (+9 more)

### Community 9 - "Пейзажи (scenery.js)"
Cohesion: 0.09
Nodes (11): Карточки: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)), Где кончается элемент: padding, border, margin, box-sizing, Метрическая основа и ритм композиции, Ограничение создаёт возможности (Гибсон), Подпись и изображение — одна группа, Правило вместо координаты (Гуров, «От чертежа к закону»), Типы сетки: колоночная, модульная, коллажная, комбинированная, Жёсткая и мягкая сетка (+3 more)

### Community 10 - "Сборка, источники, финал"
Cohesion: 0.14
Nodes (16): cover(), coverSeq(), S, labUpd(), loop(), morph(), nextCover(), put() (+8 more)

### Community 11 - "Выпуск и предзащита (1.8)"
Cohesion: 0.14
Nodes (16): cover(), coverSeq(), S, labUpd(), loop(), morph(), nextCover(), put() (+8 more)

### Community 12 - "Рисунки повозок"
Cohesion: 0.14
Nodes (11): Эффект Кулешова: значение кадра меняется от соседа, Карта соседства, «Маша» Фёдора Сваровского (разбор финала), Монтаж аттракционов (Эйзенштейн), 5–9 смысловых зон, Вертикальный ритм — расстояния во времени скролла, Лекция 1.3. Архитектура лонгрида: структура, раскадровка, eq — «Одного колеса мало» (колесо + ось + кузов + груз + бык + дорога) (+3 more)

### Community 13 - "scenery.js"
Cohesion: 0.17
Nodes (16): birds(), cloud(), day(), forest(), grass(), hero(), hill(), house() (+8 more)

### Community 14 - "Лекция 1.8. Предзащита и финальная редактура"
Cohesion: 0.18
Nodes (5): Алетейя: честный режим сокрытия, Доска процесса из четырёх фреймов, Финальный порог публикации, Нигредо: распад удобных объяснений, Лекция 1.8. Предзащита и финальная редактура

### Community 15 - "SVG defs: hatch/xhatch/dots patterns"
Cohesion: 0.39
Nodes (8): Рабочая память и чанкинг, Уравнение #eqRow .term (колесо+ось+кузов+груз+бык+дорога) и #eqCart, SVG defs: hatch/xhatch/dots patterns, #tCart — повозка с быком (template, части p-wheel/p-axle/p-body/p-load/p-ox/p-road/p-mud), #tHorse — лошадь (template), #tOx — бык (template), #tRunner — бегущий человек (template), Повозки парада .veh #v0–#v3 (телега, колесница, дрезина, автобус)

## Ambiguous Edges - Review These
- `«5200 лет» заменено на «больше пяти тысяч лет» (датировка музея)` → `find — «Ему больше пяти тысяч лет, и его нашли в болоте» (паспорт находки: 72 см, ясень, дуб)`  [AMBIGUOUS]
  docs/context.md · relation: rationale_for

## Knowledge Gaps
- **27 isolated node(s):** `Слабый дизайн: материал может изменить замысел`, `.cutflash — вспышка склейки`, `Юлия Бысова (автор)`, `Фабрика вариантов и дом у реки`, `Палеонимия (Деррида): что «лонгрид» значит сверх длины` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 74 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `#guide — главное колесо-проводник (морфинг gMorph/gArt/gChalk/gShade)` connect `Первый экран и внимание (1.6)` to `Журнал решений`, `Фото, вырезки, права (1.7)`, `Интерактив и проверка читателем`, `Движок сцен и звуки (app.js)`, `Колесо-проводник и гравюра`, `Сетки и модуль (1.5)`, `Рисунки повозок`, `Лекция 1.8. Предзащита и финальная редактура`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **What connects `Слабый дизайн: материал может изменить замысел`, `.cutflash — вспышка склейки`, `Юлия Бысова (автор)` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Журнал решений` be split into smaller, more focused modules?**
  _Cohesion score 0.07164404223227752 - nodes in this community are weakly interconnected._
- **Why does `#wheelArt — гравюра колеса (SVG defs, штриховка wa-h1)` connect `Движок сцен и звуки (app.js)` to `Сетки и модуль (1.5)`, `Первый экран и внимание (1.6)`, `SVG defs: hatch/xhatch/dots patterns`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **Should `Фото, вырезки, права (1.7)` be split into smaller, more focused modules?**
  _Cohesion score 0.07088989441930618 - nodes in this community are weakly interconnected._
- **Should `Типографика (1.4)` be split into smaller, more focused modules?**
  _Cohesion score 0.0636734693877551 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `«5200 лет» заменено на «больше пяти тысяч лет» (датировка музея)` and `find — «Ему больше пяти тысяч лет, и его нашли в болоте» (паспорт находки: 72 см, ясень, дуб)`?**
  _Edge tagged AMBIGUOUS (relation: rationale_for) - confidence is low._