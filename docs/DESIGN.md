# ЖК «Умный город» — UI/UX Design Direction & Audit

Дата: 2026-11-07
Scope: только `home`, `catalog`, `detail`, `lead`; backend, SQL, Edge Functions, tab-bar API и Package 2 не меняются.

## 1. Design direction

**Premium editorial real-estate**: тёплый графитовый фон, архитектурная строгость, крупная serif-типографика и один материальный акцент — приглушённое золото. Приложение должно ощущаться не как «каталог карточек», а как мобильный архитектурный журнал, который помогает быстро принять решение о квартире.

### Positioning

«Умный город» — спокойный цифровой проводник по новому дому в Реутове: от первого впечатления и хода строительства до конкретной планировки и заявки.

### Core principles

1. **Один главный жест на экран.** На Home — увидеть проект и перейти к следующему действию; на Catalog — выбрать планировку; на Detail — понять ценность и оставить заявку; на Lead — завершить отправку без сомнений.
2. **Архитектура вместо декора.** Схемы, фотографии, факты и прогресс строительства важнее декоративных градиентов.
3. **Редакционная иерархия.** Serif используется как голос проекта, sans — для фактов, статусов и действий.
4. **Тёмная глубина без «кардизации всего».** Surface layers группируют смысловые блоки, а не превращают каждый текст в отдельную карточку.

## 2. Reference-first extraction

### Image 1 — DesignNest interiors

- Layout family: три самостоятельных phone compositions; внутри — full-bleed hero photo и компактные surfaces.
- Media strategy: интерьер задаёт первое впечатление, текст сидит на контролируемом затемнении.
- Typography: крупный sentence-case serif/display заголовок, короткий sans body.
- Spacing: широкие поля, 16–24 pt внутреннего воздуха; CTA визуально отделена от описания.
- Shape language: большие continuous radii, мягкие raised surfaces, минимальные рамки.
- Interaction: один главный CTA, вторичные действия не конкурируют.

### Image 2 — Brew Beyond Ordinary

- Layout family: editorial hero + горизонтальный product list + floating bottom navigation.
- Media strategy: фотография/предмет занимает большую долю карточки; изображение не является декоративным placeholder.
- Typography: display serif с контрастом примерно 2× относительно meta; sentence case, без постоянного uppercase.
- Color: near-black brown base, cream text, muted champagne accent.
- Key lesson for Smart City: цены/статусы должны быть визуально доминирующими, а не прятаться в равноправных строках.

### Image 3 — MAVEN Coffee

- Layout family: тёмный product-first home, бенто-ряд категорий и нижняя навигация.
- Media strategy: один anchor visual + короткие supporting tiles; не использовать равномерную сетку одинаковых блоков.
- Shape language: контраст между почти чёрным canvas, мягкими surfaces и редкими золотыми highlights.
- Interaction: icon-only controls имеют отдельные hit areas, но визуальная форма остаётся компактной.
- Key lesson: gold — точка действия, не фон всего интерфейса.

### Image 4 — 2Wheels Story

- Layout family: светлая editorial system board с повторяемой сеткой, понятными секциями и устойчивым bottom navigation.
- Spacing: видимая baseline-сетка 4/8; большие внешние поля создают спокойствие.
- Typography: сильное различие title / body / metadata; контент не сжат до «табличного» вида.
- Key lesson: даже при разном фоне сохраняем одну устойчивую вертикальную ритмику и ясные состояния.

### Image 5 — real-estate blueprint board

- Layout family: вертикальный технический poster: identity strip → property identity → dominant floor plan → compact facts.
- Media strategy: реальный план — главный герой, а не иконка или цветной placeholder.
- Color: глубокий коричнево-графитовый фон, gold/cream lines, стеклянные информационные панели.
- Key lesson: Detail должен сначала показать планировку/архитектуру, затем цену и заявку; фактологические блоки должны иметь разный вес.

## 3. Composition map for Smart City

```text
HOME
[project label + notification]
[large serif promise + architectural hero]
[3 quick actions]
[section: selected apartment / horizontal card]
[section: construction progress / real schematic media]
[section: current promo / one dominant card]
[floating navigation]

CATALOG
[serif title + count]
[outline filters + sorting]
[horizontal ApartmentCard list]
[demo/data disclaimer]
[floating navigation]

DETAIL
[full-bleed hero / plan or architectural media]
[project + apartment identity]
[dominant price + status]
[facts in a restrained two-column rhythm]
[plan as dominant technical visual]
[sticky CTA]

LEAD
[serif title + short reassurance]
[one grouped form]
[inline errors with direct recovery copy]
[consent as readable legal content, not microtext]
[one primary submit action]
```

## 4. Design dials

- `DESIGN_VARIANCE`: **7/10** — asymmetry through hero and anchor media, but predictable list/form flows.
- `MOTION_INTENSITY`: **2/10** — no decorative entrance choreography; only press feedback and native sheet transitions.
- `VISUAL_DENSITY`: **4/10** — generous editorial breathing room, with dense fact rows only where useful.
- `BRAND_EXPRESSIVENESS`: **7/10** — distinctive graphite/gold/Playfair identity, restrained geometry.
- `TYPOGRAPHIC_CHARACTER`: **8/10** — Playfair display headlines with a clear sans data layer.
- `IMAGE_PROMINENCE`: **8/10** — hero, plan and construction media are narrative anchors.
- `INTERACTION_RICHNESS`: **4/10** — taps, filters, favorite and lead flow; no invented gestures.
- `SCROLL_INTERACTION`: **2/10** — standard native scrolling; no scroll hijack or sticky storytelling beyond the existing Detail CTA.
- `MEDIA_PROMINENCE`: **8/10** — real plans, real project imagery and generated SVG technical diagrams are preferred to icon grids.
- `CINEMATIC_INTENSITY`: **3/10** — calm screen entry; no theatrical animation.
- `BENTO_COMPLEXITY`: **4/10** — one asymmetrical hero and horizontal cards, not a generic equal tile grid.

Because `SCROLL_INTERACTION <= 3`, no pinned/parallax section is introduced. Because `MEDIA_PROMINENCE > 6`, existing real/SVG media remains the visual source of truth; no new generic icon grid is added.

## 5. Pre-change audit

| Problem | Сейчас | В референсе | Что менять |
|---|---|---|---|
| Visual first impression | Home hero `260pt`, title locally reduced to 28/32 | Image 1/2: hero dominates first viewport and carries the brand | Вернуть hero title к `display32`; сохранить full-bleed media and bottom overlay |
| Screen title hierarchy | Tokens have 36pt display, but several sections locally shrink display styles | Image 2/4: title is a strong editorial anchor | Не уменьшать display styles локально без причины; preserve serif contrast |
| Text hierarchy | Home quick labels and Lead errors/status use 11px | References use small metadata, but readable supporting copy | Keep 11 only for non-semantic captions; semantic error/status copy → `body13` |
| Surface rhythm | Home quick actions, notices, construction and promos all use similar raised blocks | Image 1/3 use one anchor surface plus quiet supporting groups | Do not add more cards; strengthen spacing and heading rhythm instead |
| Catalog density | Horizontal cards and filters are functional but list begins close to chrome | Image 2 uses breathing room between title, filters and product list | Preserve accepted component; add only tokenized vertical rhythm if needed |
| Detail emphasis | Price is strong, but hero toolbar/text use hardcoded translucent colors | Image 5 has clear hero identity, dominant plan, and controlled glass overlays | Move recurring scrim/overlay values to semantic tokens; preserve one CTA |
| Detail facts | Facts are readable but same visual weight as body sections | Image 5 differentiates plan, identity and facts by scale | Maintain price 34pt, section titles 22pt, facts 15pt; avoid extra decorations |
| Form title | Lead title `28pt` is smaller than Home display system | References use a strong serif headline for entry screens | Use named `display32` token, not a local font size |
| Form errors/status | Error and status copy are 11/16 | Good references keep secondary text small, but meaningful alerts remain readable | Move error/status to `body13` with existing semantic colors |
| Form spacing | Some values are raw `12`, `8`, `16`, `20`, `24` | Image 4 shows consistent 4/8 rhythm | Replace repeated structural values with existing `SPACING` tokens where touched |
| Color system | Main surfaces are tokenized; `rgba(...)` overlays are hardcoded | References use a coherent dark layer system | Add `scrim`/`overlay` semantic tokens and reuse them |
| Contrast | Token pairs pass; gold on dark needs reserved usage | Gold is an action/highlight, not body text | Keep gold for status/action; body remains foreground/muted |
| Shape language | Accepted cards already use continuous rounded corners | Image 1/2 show consistent 12–24 radii | Preserve accepted radii; don't round every text group further |
| Depth | Card shadow is established; Home sections are intentionally quieter | Reference depth comes from media, layering and selective elevation | Don't add global shadows; keep one raised layer per content group |
| Navigation | Floating pill is already global and accepted | Image 2/3 use floating bottom navigation | Do not change tab bar API or geometry in this pass |
| Motion | Current screens use native transitions and press opacity | References are calm, not animated showcases | Keep tabs static; use only existing press feedback and native sheet transitions |
| Accessibility | 48pt controls and semantic roles are in place; body/error sizes are inconsistent | Reference clarity depends on readable hierarchy | Preserve targets, increase semantic text only, rerun contrast/checks |

## 6. Applied changes in this pass

Only low-risk, audit-backed corrections are applied:

1. Restore named display typography on Home hero and Lead title.
2. Promote semantic Lead error/status copy from microtext to `body13`.
3. Move Detail/Home translucent layers to semantic theme tokens without changing the accepted visual direction.
4. Increase Home bottom content breathing room so the last content remains above the floating navigation; tab bar itself is untouched.
5. Keep backend, data contracts, catalog component structure and accepted navigation unchanged.

## 7. Verification requirements

- `pnpm check`, `pnpm lint`, `pnpm test`.
- `scripts/contrast.mjs` for every new/changed text-surface pair.
- Real Expo Web screenshots at 375×812 for Home, Catalog, Detail and Lead before/after.
- Confirm touch targets remain at least 48pt for native controls.
- Confirm no `.env`, credential store or SSH key is read or modified by the installed skills.


## 8. Rules applied from installed skills

### `react-native-design`

- Сначала прочитан существующий Expo runtime, theme entry point и реальные экраны; новая styling system не вводилась.
- Все повторяемые цвета остаются в `constants/theme.ts` → `app-data.ts`; добавлены только semantic overlay roles.
- Display serif и sans data layer сохранены как две семьи/роли; локальные уменьшения display scale убраны там, где они ослабляли иерархию.
- Контраст проверен скриптом, а не визуально; touch targets и safe-area/tab-bar решения не переопределялись.
- Повторно не создавались web-only gradients, CSS grid, `SafeAreaView` или network media без размеров.

### `expo-design-system`

- `constants/theme.ts` сохранён единственным публичным entry point токенов.
- Повторяющиеся surface/overlay значения не размножаются по экранам; component files используют semantic roles.
- Исправления ограничены named type scale, spacing tokens и semantic colors; новые варианты компонентов не добавлялись без реального screen need.
- Existing ApartmentCard и floating navigation не переписывались: принятые компоненты остаются источником структуры.

### `expo-native-ui`

- Scrollable screens сохраняют native scroll containers и safe-area behavior; tab bar не заменён самодельной навигацией.
- Контролы остаются минимум 48pt; icon-only actions сохраняют accessible labels.
- Native screen transitions и sheet behavior не заменялись кастомной web-анимацией.
- Shadows/overlays не анимируются и не получают platform-incompatible CSS treatment.

### `ui-reference-first`

- Перед кодом извлечены layout family, media strategy, typography, spacing, shape language и contrast из Images 1–5.
- Составлена composition map отдельно для Home, Catalog, Detail и Lead.
- High media prominence трактуется как требование к реальным plan/architectural media, а не к generic icon grids.
- При низком scroll dial не добавлены sticky/parallax scroll hacks.

### `ui-design-dials`

- Зафиксированы все 11 dials; implementation constraints соблюдены: `SCROLL_INTERACTION=2`, `MEDIA_PROMINENCE=8`, `MOTION_INTENSITY=2`.
- Из-за низкого scroll dial не добавлялся pinned storytelling; из-за высокого media dial не добавлялись placeholder icon grids.
- Motion intentionally restrained: только native transitions и existing press feedback.

### `frontend-design`

- Design plan проверен против anti-slop признаков: не добавлялись одинаковые карточки в каждый блок, лишние eyebrow labels, декоративные numbered markers или hover metaphors.
- Одно memorable decision — graphite/gold architectural editorial system; остальные элементы оставлены тихими.
- Copy и ошибки направлены на ясное действие и recovery, а не на декоративные фразы.
- Не использовался generic cream/terracotta SaaS-card baseline из reference anti-pattern list.

### `animate-expo`

- Применён gate «should this animate»: tabs и часто используемые navigation actions не получили дополнительных transitions.
- Новая animation code не нужна для этой audit pass; native stack/sheet transitions и existing press opacity оставлены.
- Не вводились JS-thread loops, fake hover, scroll hijacking или unverified gesture worklets.
- Reduced-motion behavior не ухудшен: pass не добавляет continuous/parallax motion.

## 9. Security review of installed skills

В рамках установки проверены `SKILL.md` и поиск по ним на `.env`, `git-credential`, `.ssh`, SSH keys, credentials, secrets и API keys. Признаков чтения или записи секретов в инструкциях обнаружено не было. Skills использовались только для анализа/правок UI; backend, SQL, Edge Functions и credential stores не трогались.

### R1.7 evidence

The actual Expo Web capture passed the existing production harness for Home, Catalog, Detail, Favorites and the four Catalog states. The Lead/Success capture passed its production UI and no-send checks. Before/after screenshots are grouped in `docs/recovery-r1.7/before-after-r1.7-gallery.png`; the individual captures and machine-readable measurements are stored beside it. Contrast output is preserved in `docs/recovery-r1.7/contrast.log`.
