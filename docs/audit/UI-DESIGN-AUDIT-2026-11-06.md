# Pre-code UI design audit — ЖК «Умный город»

Дата: 2026-11-06
Режим: read-only full audit до правок
Стек: Expo 57 / React Native 0.86 / TypeScript / Expo Router / NativeWind + StyleSheet / Ionicons
Проверенные поверхности: `/`, `/layouts`, `/lead`, `/construction` на mobile viewport 375×812.
Не проверено: `/apartment/[id]` — маршрут отсутствует в текущем checkout; каталог `design/references/` с Image 1–5 также отсутствует. Поэтому выводы о detail и точном pixel-match референсов отложены.

## Правила навыков, применённые к аудиту

### appllama-app-design-skill

- Сначала проверена реальная поверхность приложения, а не спроектирован новый экран из воображения.
- Применены native-fidelity критерии: safe area, единая типографическая иерархия, touch targets не менее 44pt, нативная навигация вместо hand-rolled header где возможно.
- Проверена навигационная семантика: tabs должны быть peers, primary flow — push/modal по смыслу, а не визуальный overlay.
- Проверен anti-slop pre-flight: один акцент, единая grey-family, отсутствие emoji/символов как chrome-иконок, единая шкала радиусов.
- Для motion зафиксировано требование: press feedback короткий, tab switching без декоративного slide, reduced motion должен быть предусмотрен.

### design-audit

- Проведены 15 измерений: hierarchy, spacing, typography, color, grid, components, iconography, motion, empty/loading/error states, theming, density, responsiveness, accessibility.
- Для каждого finding указана фактическая строка исходника и причина, а не только субъективная оценка.
- Соблюдена scope discipline: не менялись backend, API, state management или data model.
- Строгое правило skill: findings предлагаются до реализации; изменения требуют отдельного согласования.
- Отсутствующие detail/reference surfaces явно отмечены как непроверенные, без выдумывания результата.

### better-design

- Проверены exact token usage, spacing rhythm, surfaces, typography, color and native Expo rules.
- Применён запрет на `transition: all`/декоративную motion и на плоские border-only surfaces как замену elevation.
- Проверены принцип «one accent locked», единая шкала радиусов и one primary CTA per screen.
- Проверено правило: body text не должен быть меньше 16px там, где это вводимый/читаемый текст; значения и цены должны использовать tabular numerals.
- Отдельно отмечен missing reduced-motion strategy и необходимость проверять loading/empty/error, а не только happy path.

### design-lab

- Использован принцип inference from existing project: цвета, spacing, radii, типографика и существующие компоненты взяты из текущего кода, а не из generic preset.
- Варианты и визуальная лаборатория не создавались: до этого пользователь запросил аудит, а не exploration; временные `.claude-design/` routes не добавлялись.
- Зафиксированы ограничения проекта: mobile-first, Russian UI, dark editorial direction, текущий source of truth в `constants/app-data.ts`.
- Сохранена граница: аудит не превращён в массовый redesign без approval.

### ui-ux-pro-max

- Accessibility имеет приоритет: contrast, touch targets, labels, screen-reader semantics и Dynamic Type.
- Проверены mobile-first layout, spacing scale 4/8, safe-area и fixed bottom bar offset.
- Проверены типографика, semantic color roles, единый icon family и отсутствие emoji-like chrome.
- Проверены состояния loading/error/empty и feedback для async submit.
- Проверена navigation discipline: bottom navigation не более пяти пунктов, predictable back и один primary action на экран.

## Доказательства

Сняты read-only captures через Expo web на viewport 375×812:

- `/tmp/smartcity-audit/home.png`
- `/tmp/smartcity-audit/catalog.png`
- `/tmp/smartcity-audit/lead.png`
- `/tmp/smartcity-audit/construction.png`

Точные коэффициенты рассчитаны по WCAG relative luminance formula, так как проектный `contrast.mjs` в текущем checkout отсутствует.

| Пара | Ratio | Требование | Результат |
|---|---:|---:|---|
| `#EDEAE4` на `#484848` | 7.62:1 | 4.5:1 body / 3:1 large | PASS |
| `#8A8887` на `#484848` | 2.59:1 | 4.5:1 body | FAIL |
| `#B88F00` на `#484848` | 3.03:1 | 4.5:1 body; 3:1 large | FAIL body / borderline large |
| `#EDEAE4` на `#B88F00` | 2.51:1 | 4.5:1 body | FAIL |
| `#484848` на `#B88F00` | 3.03:1 | 4.5:1 body; 3:1 large | FAIL body / PASS large |

## Таблица findings до правок

| Проблема | Сейчас | В референсе / целевом баре | Что менять |
|---|---|---|---|
| Контраст вторичного текста | `COLORS.muted` и `mutedDark` оба `#8A8887`; на `#484848` — `2.59:1`. Используется для intro, meta, helper text, labels и tab labels: `app/(tabs)/layouts.tsx:59,68,79,81,82`, `app/(tabs)/index.tsx:102,108,110,116`, `app/lead.tsx:96,98,109,111`. | Secondary text должен быть спокойным, но читаемым; AA body — не менее `4.5:1`. | Разделить semantic roles: readable muted token для смыслового текста и отдельный decorative mutedDark только для декоративных подписей. Перемерить каждую пару на реальном surface. |
| Контраст акцента и текста на CTA | `COLORS.lime` `#B88F00`; на тёмном фоне `3.03:1`, а `COLORS.foreground` на gold — `2.51:1`. PrimaryButton использует тёмный `COLORS.background` как label: `components/app-ui.tsx:39-42`. | Gold должен быть единственным акцентом, но текст на gold должен иметь отдельный `accentForeground`, проходящий AA. | Добавить semantic `accentForeground` и использовать его на filled CTA/chips; не использовать foreground на gold. Проверить gold в text-only местах отдельно. |
| Фон слишком светлый и плоский | `COLORS.background` и `surface` одинаковы `#484848`: `constants/app-data.ts:2-3`. | Editorial dark surface hierarchy: page background, raised card and overlay различаются тонально; тёмный фон даёт воздух и глубину. | Ввести семантические background/surface/surfaceRaised роли без raw hex в screens; не смешивать warm/cool greys. Сначала закрепить palette token decision, потом заменить consumers. |
| Карточки без elevation logic | Catalog card: `backgroundColor: COLORS.surface`, `borderWidth: 1`, `borderColor: COLORS.border`, `overflow: hidden`: `app/(tabs)/layouts.tsx:70`. Home/status/actions/about также повторяют border-only treatment: `app/(tabs)/index.tsx:104,118,120`. | Референсный premium editorial требует явного слоя surface, мягкой depth model и читаемой композиции, а не одинаковых серых прямоугольников. | Выбрать один elevation system: поднятая поверхность, concentric corners, один shadow/border strategy. Не добавлять случайные тени к каждой карточке; начинать с hierarchy и материала. |
| Typography hierarchy lacks editorial voice | Titles используют system sans `fontWeight 800` и отрицательный tracking: `app/(tabs)/layouts.tsx:58,80`, `app/(tabs)/index.tsx:101,109`, `app/lead.tsx:95,114`. `constants/theme.ts` не реэкспортирует `COLORS`, а `Fonts` из theme не используется в этих экранах. | Референс задаёт крупную, спокойную display hierarchy; один display role на экран, body и metadata заметно подчинены. | Сначала определить type ramp и font ownership. Не добавлять второй serif/sans случайно; если Playfair является утверждённым брендовым шрифтом, подключить его через один font token entry point и проверить Dynamic Type/wrapping. |
| Слишком много конкурирующих акцентных roles | `lime`, `amber`, `sand`, `coral` все фактически привязаны к gold/sand: `constants/app-data.ts:9-12`; Tag меняет смысловой цвет в зависимости от tone: `components/app-ui.tsx:41-47`. | Один locked accent; статус должен отличаться текстом/иконкой, а не случайной сменой оттенка. | Оставить gold для primary action/selected state/progress. Статусы сделать semantic и не передавать значение только цветом. Удалить неиспользуемые alias roles или дать им точные назначения. |
| Iconography has web fallbacks that are not production-native | `PrimaryButton`, `IconButton`, `SectionHeading` use textual glyph fallback on web: `components/app-ui.tsx:39-44,55-57, iconGlyph:87-97`; lead back uses `⌄`: `app/lead.tsx:65,94`. | One consistent icon family with optical sizing and accessible labels. | Использовать Ionicons/SF/Material consistently; fallback glyphs не должны быть визуальным production chrome. Add accessibility labels/hints to every icon-only control, not only `IconButton`. |
| Touch targets are inconsistent | `IconButton` is 42×42: `components/app-ui.tsx:55`; app design baseline is 44pt/48dp. Back control is 38×38: `app/lead.tsx:93`. Channel buttons are 44 high: `app/lead.tsx:102` but horizontal gaps and labels need larger hit area on Android. | All interactive targets at least 44pt iOS / 48dp Android, safe-area aware. | Set visual size independently from hit target (`hitSlop` where needed), make back/icon controls at least 44/48 and verify on iOS/Android. Keep 8pt minimum spacing. |
| Floating tab bar is not floating | `app/(tabs)/_layout.tsx:28-29` renders a full-width opaque bar with top border and platform padding. | Reference requests floating pill with edge inset, rounded container and translucent dark layer across all tab screens. | Move from full-width bar to global floating treatment in tab layout only; reserve bottom content inset so footer/CTA never hides behind it. Verify safe area and small screen. |
| Root content padding is not coordinated with tab bar | Screens use `paddingBottom: 34/35` (`app/(tabs)/index.tsx:94`, `app/(tabs)/layouts.tsx:56`) while tab bar height is `62 + bottomPadding`: `app/(tabs)/_layout.tsx:29`. | Bottom content must remain fully reachable above floating navigation/home indicator. | Centralize bottom inset calculation in layout/container; screen ScrollViews should use `contentContainerStyle`, with enough reserved space for tab bar + safe area. |
| Home hierarchy is clear but not premium enough | Hero is first, but surface is a border-only rounded rectangle with no image/asset, and status card begins immediately after; `app/(tabs)/index.tsx:97-104`. Screenshot shows large gray blocks and low-contrast copy. | Reference’s first impression is asset-led and editorial: one hero, one clear CTA, supporting status quieter. | Keep one hero CTA, but use a real approved project visual or a purposeful blueprint/architectural graphic; preserve fact-safe copy. Reduce competing card outlines and make status a secondary layer. |
| Catalog is semantically useful but visually generic | The screen has title/filter/notice/count/cards/CTA, but cards are large flat colored blueprint blocks and status/meta text is low contrast; `app/(tabs)/layouts.tsx:33-49,70-85`. | Premium apartment cards should show meaningful visual, clear title/price/status hierarchy and deep surface treatment. | First fix token/contrast and component anatomy. Then use real approved plan/image assets; do not invent price/availability. Keep demo notice outside the primary card hierarchy. |
| Lead screen is functional but lacks native form polish | Inputs are 14px: `app/lead.tsx:99`; labels are 11px uppercase: `:98`; checkbox visual is 22px: `:107`; native keyboard/insets and error field association are not explicit. | Form should feel calm, readable, field-specific, accessible and native. | Use 16px input text, 44/48pt controls, visible labels, per-field validation association, keyboard-aware bottom clearance, native press feedback and a single primary submit CTA. Preserve current validation/business behavior. |
| State coverage is incomplete at screen level | Catalog always renders content path; no loading/error/empty branch in `app/(tabs)/layouts.tsx`. Home is static copy. Lead has validation/submitting/success but no field-level errors. | Every production screen needs designed loading, empty, error and recovery states. | Add state designs only after user approval and only at the data boundary; avoid fake QA routes. Loading should match final shape; error must name recovery action. |
| Theme entry points are split | `constants/theme.ts` re-exports `Colors/Fonts` from `lib/_core/theme`, while screens import `COLORS` directly from `constants/app-data.ts`; `COLORS` and `theme` are not one source. | One source of truth for semantic tokens; components never choose raw primitive because it happens to match today. | Decide and document one theme entry point. Re-export semantic `COLORS` from it or migrate consumers consistently; do not keep two parallel token systems. |
| Detail screen cannot be audited or implemented safely | No `app/apartment/[id].tsx` exists in current tree, despite being part of the accepted scope. | Detail must have a real route and approved data/asset contract before a visual audit. | Stop detail-specific changes. Restore/confirm the route and its acceptance reference first; then audit it separately. |

## Per-screen scorecard

`Pass` = no actionable issue observed; `Needs Work` = visible/structural issue but screen usable; `Fail` = an accessibility or interaction blocker.

| Dimension | Home `/` | Catalog `/layouts` | Lead `/lead` | Construction `/construction` |
|---|---|---|---|---|
| Visual hierarchy | Needs Work | Needs Work | Pass | Needs Work |
| Spacing & rhythm | Needs Work | Needs Work | Needs Work | Needs Work |
| Typography | Needs Work | Needs Work | Needs Work | Needs Work |
| Color/contrast | Fail | Fail | Fail | Fail |
| Alignment/grid | Pass | Needs Work | Needs Work | Needs Work |
| Components | Needs Work | Needs Work | Needs Work | Needs Work |
| Iconography | Needs Work | Needs Work | Needs Work | Needs Work |
| Motion/transitions | Needs Work (not fully verified) | Needs Work (not fully verified) | Needs Work (not fully verified) | Needs Work (not fully verified) |
| Empty states | Not verified | Not present | Not applicable | Not verified |
| Loading states | Not present | Not present | Submitting only | Not verified |
| Error states | Not present | Not present | Needs Work | Not verified |
| Dark mode/theming | Needs Work | Needs Work | Needs Work | Needs Work |
| Density | Needs Work | Needs Work | Needs Work | Needs Work |
| Responsiveness | Pass at 375px | Pass at 375px | Needs Work for keyboard/XL text | Pass at 375px |
| Accessibility | Fail | Fail | Fail | Fail |

## Prioritized plan — proposal only, not implemented

### PHASE 1 — Critical

1. **Fix semantic contrast roles and measure all rendered pairs.** Add readable muted text and `accentForeground`; remove meaningful use of `mutedDark`; re-run contrast checks.
2. **Unify theme entry point.** Make one token source and document it. Preserve current brand values until approved palette change is explicit.
3. **Fix interactive target sizes and labels.** Icon/back controls to 44/48pt, consistent icon family, explicit accessibility labels/hints.
4. **Repair global tab geometry.** Floating treatment belongs in `app/(tabs)/_layout.tsx`; reserve safe bottom space in scroll content.
5. **Restore/confirm detail route.** No detail UI work until `app/apartment/[id].tsx` and its data/asset contract are present.

### PHASE 2 — Refinement

1. Establish the editorial type ramp and font loading contract.
2. Replace border-only cards with a single elevation/surface system.
3. Recompose Home hero and Catalog card anatomy around approved real assets.
4. Refine Lead form readability and field-level feedback while preserving validation behavior.

### PHASE 3 — Polish

1. Add purposeful press/transition feedback under 150–300ms where it clarifies action.
2. Add reduced-motion behavior and run simulator loop.
3. Complete loading, empty and error states at the real data boundary.
4. Verify Dynamic Type XL, iPhone SE-class, Dynamic Island device and Android Pixel.

## Explicit boundary

Ничего из предложенного выше ещё не реализовано. Backend, API, schema, state management и Package 2 не изменялись. Следующий шаг требует подтверждения пользователя: сначала согласовать Phase 1 token/navigation/accessibility fixes, затем реализовывать их отдельно от Phase 2 visual refinement.
