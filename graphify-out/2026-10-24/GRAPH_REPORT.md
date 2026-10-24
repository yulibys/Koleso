# Graph Report - longrid  (2026-10-22)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 743 nodes · 1625 edges · 33 communities (23 shown, 10 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 314 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8c6aec04`
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
- re
- fig.js
- nag — Нагасена и Милинда: «колесо — это колесница?»
- open — «Далеко собрались?» / дата (счётчик 17 октября 2026 → около 4000 г. до н. э.)
- Лекция 1.1. Лонгрид как особый медиум
- Шрифт Alegreya SC (--display, .disp)
- Шрифт Alegreya (--serif/--hand, .voice/.hand)
- .sc/.stick/.frame — высокая секция с липким кадром
- :root токены (--black, --cream, --paper, --red, --gut)
- boil0–2 «дрожь линии» filters (feTurbulence)

## God Nodes (most connected - your core abstractions)
1. `Лекция 1.6. Управление вниманием: первый экран, паузы` - 44 edges
2. `Лекция 1.5. Модульные системы и сетки` - 42 edges
3. `Лекция 1.4. Экранная типографика и выбор шрифта` - 42 edges
4. `Лекция 1.7. Сборка и публикация, адаптив, редактура` - 39 edges
5. `Рабочий контекст и журнал решений (context.md)` - 32 edges
6. `#guide — главное колесо-проводник (морфинг gMorph/gArt/gChalk/gShade)` - 30 edges
7. `open — «Далеко собрались?» / дата (счётчик 17 октября 2026 → около 4000 г. до н. э.)` - 30 edges
8. `lab — «Соберите свою повозку» (интерактив)` - 18 edges
9. `line()` - 17 edges
10. `line()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Мобильное преобразование — не общий Scale` --conceptually_related_to--> `layout()`  [INFERRED]
  docs/lectures/1.5.txt → src/app.js
- `Вопрос на входе — ответ в финале` --rationale_for--> `rewind()`  [INFERRED]
  docs/lectures/1.6.txt → src/app.js
- `sticker()` --references--> `Стикер .stk (вырезанный предмет с бумажной подписью)`  [INFERRED]
  cut/gc.py → src/body.html
- `Гигиена набора: «ёлочки»/„лапки“, тире, минус, ×` --rationale_for--> `prepType()`  [INFERRED]
  docs/lectures/1.4.txt → src/app.js
- `Неразрывные пробелы — только для смысловых пар` --rationale_for--> `prepType()`  [INFERRED]
  docs/lectures/1.4.txt → src/app.js

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

## Communities (33 total, 10 thin omitted)

### Community 0 - "Журнал решений"
Cohesion: 0.05
Nodes (47): b10.sh script, Эффект Кулешова: значение кадра меняется от соседа, Карта соседства, «Маша» Фёдора Сваровского (разбор финала), Монтаж аттракционов (Эйзенштейн), 5–9 смысловых зон, Метрическая основа и ритм композиции, Повтор с отклонением на третьем (Делёз) (+39 more)

### Community 1 - "Фото, вырезки, права (1.7)"
Cohesion: 0.07
Nodes (51): Память как ответственность (Мец): финал помнит первый экран, #guide — главное колесо-проводник (морфинг gMorph/gArt/gChalk/gShade), parade — Парад повозок: телега, колесница, дрезина 1817, автобус в 7:40, rounds — «Колесо… Это как всё вокруг» / колесо сансары, air(), applyK(), click(), clop() (+43 more)

### Community 2 - "Типографика (1.4)"
Cohesion: 0.07
Nodes (40): alignHead(), applyLap(), balance(), bubbles(), bubPath(), bump(), cover(), coverSeq() (+32 more)

### Community 3 - "Первый экран и внимание (1.6)"
Cohesion: 0.05
Nodes (31): Разборчивость знака ≠ удобство длительного чтения, Акцент работает относительно окружения, Лицо становится главным говорящим, Мультистабильность продлевает рассматривание, У пустоты есть работа, Рабочая память и чанкинг, Визуальный триггер: остановка должна вести в содержание, Задача зрителя меняет маршрут взгляда (+23 more)

### Community 4 - "Интерактив и проверка читателем"
Cohesion: 0.07
Nodes (40): alignHead(), applyLap(), balance(), bubbles(), bubPath(), bump(), cover(), coverSeq() (+32 more)

### Community 5 - "Движок сцен и звуки (app.js)"
Cohesion: 0.11
Nodes (39): arcade(), bez(), bog(), bubble(), chariotParts(), clipped(), ferris(), flower() (+31 more)

### Community 6 - "Колесо-проводник и гравюра"
Cohesion: 0.06
Nodes (13): Фармакон (Платон, Деррида, Стиглер): ИИ — лекарство и яд, История ножа: как изменился тот, кто выбирает, Палимпсест (Женетт): прежний слой объясняет нынешнюю форму, Слабый дизайн: материал может изменить замысел, Сломанный молоток (Хайдеггер): поломка обнажает зависимость, Алетейя: честный режим сокрытия, Доска процесса из четырёх фреймов, Финальный порог публикации (+5 more)

### Community 7 - "Раскадровка и двери (1.3)"
Cohesion: 0.09
Nodes (26): applyLap(), balance(), cover(), coverSeq(), fitUl(), S, labUpd(), loop() (+18 more)

### Community 8 - "Сетки и модуль (1.5)"
Cohesion: 0.14
Nodes (35): arcade(), bez(), bog(), bubble(), chariotParts(), clipped(), ferris(), flower() (+27 more)

### Community 9 - "Пейзажи (scenery.js)"
Cohesion: 0.14
Nodes (35): arcade(), bez(), bog(), bubble(), chariotParts(), clipped(), ferris(), flower() (+27 more)

### Community 10 - "Сборка, источники, финал"
Cohesion: 0.11
Nodes (23): applyLap(), balance(), cover(), coverSeq(), fitUl(), S, labUpd(), loop() (+15 more)

### Community 11 - "Выпуск и предзащита (1.8)"
Cohesion: 0.17
Nodes (16): birds(), cloud(), day(), forest(), grass(), hero(), hill(), house() (+8 more)

### Community 12 - "Рисунки повозок"
Cohesion: 0.11
Nodes (11): sticker(), _sticker(), Подпись и изображение — одна группа, Общая судьба: совместное движение собирает группу, S_benz — Автомобиль Карла Бенца, 1886 (.stk), S_flute — Флейта из пещеры Дивье Бабе (.stk), S_oxcart — Норвегия, около 1900, повозка (.stk), S_pot — Кувшин из Броночице (.stk) (+3 more)

### Community 13 - "scenery.js"
Cohesion: 0.15
Nodes (4): Рабочий контекст и журнал решений (context.md), Олег Пащенко (преподаватель), Юлия Бысова (автор), Карта и калька: ответ материалу вместо копии референса

### Community 14 - "Лекция 1.8. Предзащита и финальная редактура"
Cohesion: 0.12
Nodes (8): Карточки: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)), Где кончается элемент: padding, border, margin, box-sizing, Ограничение создаёт возможности (Гибсон), Правило вместо координаты (Гуров, «От чертежа к закону»), Типы сетки: колоночная, модульная, коллажная, комбинированная, Жёсткая и мягкая сетка, Лекция 1.5. Модульные системы и сетки, .collage + data-shape (circle/oval/arch/blob/blob2)

### Community 15 - "SVG defs: hatch/xhatch/dots patterns"
Cohesion: 0.16
Nodes (8): Абзац — монтажная единица, не метроном, Типографика делает две работы: доступ и голос, Приём единого штриха, Шрифтовые пары как отношения персонажей, Система встречается фазами: проверять состояния (гиперобъект), Три принципа формообразования (Вильберг — Тарбеев), Типографский цвет: прищуриться и проверить пятно, Лекция 1.4. Экранная типографика и выбор шрифта

### Community 16 - "re"
Cohesion: 0.20
Nodes (6): Карточка необходимости, Палеонимия (Деррида): что «лонгрид» значит сверх длины, Паспорт необходимости, Тема — территория, конструкцию держит тезис, Карта проекта «Далеко собрались?» (MAP.md), Лекция 1.2. Тема, тезис, редакционный угол

### Community 17 - "fig.js"
Cohesion: 0.20
Nodes (8): lab — «Соберите свою повозку» (интерактив), sayL(), upd(), wood(), .lab-ground — земля мастерской (травинки .blade, ветер .wind), Детали повозки #parts .part + .lab-say, .lab/.parts/#cart.has-* — лаборатория повозки (rigmove, stuck, rollaway), .lab-ground/.blade/.wind

### Community 18 - "nag — Нагасена и Милинда: «колесо — это колесница?»"
Cohesion: 0.22
Nodes (5): Кантастория: рассказчик перед последовательностью изображений, Авторская функция (Фуко): кто говорит первым, Остранение (Шкловский): мотивированный локальный сбой, nag — Нагасена и Милинда: «колесо — это колесница?», nag()

### Community 19 - "open — «Далеко собрались?» / дата (счётчик 17 октября 2026 → около 4000 г. до н. э.)"
Cohesion: 0.24
Nodes (3): Набор задаёт отношение к читателю («дом бытия»), open — «Далеко собрались?» / дата (счётчик 17 октября 2026 → около 4000 г. до н. э.), .cutflash — вспышка склейки

### Community 20 - "Лекция 1.1. Лонгрид как особый медиум"
Cohesion: 0.33
Nodes (5): Фабрика вариантов и дом у реки, Viewport и скролл: пространство превращается в длительность, Свиток: последовательность и жест разворачивания, Пять свойств браузера: скролл, подстройка, ссылка, отклик, жизнь после публикации, Лекция 1.1. Лонгрид как особый медиум

### Community 21 - "Шрифт Alegreya SC (--display, .disp)"
Cohesion: 0.32
Nodes (4): Акцидентный (display) и текстовый шрифт — разные назначения, Шрифт Alegreya SC (--display, .disp), .pscreen/.ps-photo/.ps-cut/.ps-big — фотоэкраны (.flip), .rip — стили рвущегося интертитра

### Community 23 - ".sc/.stick/.frame — высокая секция с липким кадром"
Cohesion: 0.33
Nodes (3): parseK(), prepType(), .sc/.stick/.frame — высокая секция с липким кадром

## Ambiguous Edges - Review These
- `find — «Ему больше пяти тысяч лет, и его нашли в болоте» (паспорт находки: 72 см, ясень, дуб)` → `«5200 лет» заменено на «больше пяти тысяч лет» (датировка музея)`  [AMBIGUOUS]
  docs/context.md · relation: rationale_for

## Knowledge Gaps
- **27 isolated node(s):** `Слабый дизайн: материал может изменить замысел`, `«Маша» Фёдора Сваровского (разбор финала)`, `Фото __HI_H2__ (фон фотоэкрана)`, `Фото __HI_H3__ (фон фотоэкрана)`, `Фото __HI_H4__ (фон фотоэкрана)` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 92 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `#guide — главное колесо-проводник (морфинг gMorph/gArt/gChalk/gShade)` connect `Фото, вырезки, права (1.7)` to `Журнал решений`, `Первый экран и внимание (1.6)`, `Движок сцен и звуки (app.js)`, `Колесо-проводник и гравюра`, `scenery.js`, `fig.js`, `nag — Нагасена и Милинда: «колесо — это колесница?»`, `open — «Далеко собрались?» / дата (счётчик 17 октября 2026 → около 4000 г. до н. э.)`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **What connects `Слабый дизайн: материал может изменить замысел`, `«Маша» Фёдора Сваровского (разбор финала)`, `Фото __HI_H2__ (фон фотоэкрана)` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Журнал решений` be split into smaller, more focused modules?**
  _Cohesion score 0.05046948356807512 - nodes in this community are weakly interconnected._
- **Why does `#wheelArt — гравюра колеса (SVG defs, штриховка wa-h1)` connect `Движок сцен и звуки (app.js)` to `Фото, вырезки, права (1.7)`, `Первый экран и внимание (1.6)`, `scenery.js`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `Фото, вырезки, права (1.7)` be split into smaller, more focused modules?**
  _Cohesion score 0.07467532467532467 - nodes in this community are weakly interconnected._
- **Should `Типографика (1.4)` be split into smaller, more focused modules?**
  _Cohesion score 0.07197763801537387 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `find — «Ему больше пяти тысяч лет, и его нашли в болоте» (паспорт находки: 72 см, ясень, дуб)` and `«5200 лет» заменено на «больше пяти тысяч лет» (датировка музея)`?**
  _Edge tagged AMBIGUOUS (relation: rationale_for) - confidence is low._