# UI/UX audit — R1.6 pre-change

**Дата:** 2026-11-07
**Scope:** только production UI экранов Home, Catalog, Detail и Lead в Expo/React Native. Backend, SQL, Edge Function, Package 2 и tab-bar source не изменялись.
**Режим:** full read-only audit до правок.
**Стилизация:** `StyleSheet` + центральные токены `constants/app-data.ts` / `constants/theme.ts`; Expo Router; `expo-image`; `expo-linear-gradient`; `react-native-safe-area-context`.
**Reference limitation:** ожидаемая папка `design/references/` в восстановленном checkout отсутствует, поэтому Image 1–5 нельзя проверить как локальные файлы. Визуальное сравнение выполнено по принятому тёмному editorial-направлению проекта, доступному Grok reference image и фактическим Expo Web screenshots R1.4/R1.5. Отсутствие локальных референсов — ограничение, а не finding интерфейса.

## 1. Применённые правила установленных skills

### `appllama-app-design-skill`

1. Сначала изучать реальные экраны и паттерны, а не рисовать с нуля; в аудите использованы фактические Expo screenshots и существующая структура экранов.
2. Нативность важнее имитации: safe-area insets, нативные `Pressable`/`TextInput`, platform-aware shadows и единый icon family.
3. Типографика — иерархия; display family отделена от body, цены используют tabular numerals.
4. Один accent и единая shape/spacing vocabulary вместо случайных декоративных решений.
5. Все async screens должны иметь полноценный цикл loading / empty / error / populated.

### `design-audit` (`abdulwasey/skills`, финальная установленная директория)

1. Finding принимается только с evidence: screenshot + `source:line`.
2. Контраст считается по реальным hex-парам, а не «на глаз».
3. Проверяются readable text, alignment, spacing/radii, contrast, touch targets, states и responsive.
4. Аудит read-only; после объединения findings нужно остановиться и дать triage.
5. Состояния должны покрывать loading, empty, error и populated, а ошибка должна содержать способ восстановления.

### `better-design`

1. Работать внутри существующей token/styling system и не вводить второй способ стилизации.
2. Точные значения токенов важнее приблизительных значений; не добавлять одноразовые spacing/radius/color literals.
3. Не использовать анимацию как косметику; частые действия должны быть быстрыми и почти незаметными.
4. Любая ошибка должна объяснять, что произошло и что сделать дальше.
5. Типографика, surfaces, spacing, color и copy оцениваются как одна система, а не как отдельные CSS-улучшения.

### `react-native-design`

1. В RN нет web CSS: градиенты только через `expo-linear-gradient`, layout — Flexbox, размеры — density-independent.
2. Safe area и edge-to-edge должны учитываться отдельно для header, hero и нижних CTA/tab surfaces.
3. Все text/surface pairs измеряются через `scripts/contrast.mjs`; контраст не оценивается визуально.
4. Network images должны иметь размер; изображения и clipping должны быть разделены с elevation/shadow wrapper.
5. Touch targets — минимум 44pt iOS / 48dp Android; экран обязан иметь loading, empty, error и success states.

## 2. Evidence set

| Экран | Actual evidence |
|---|---|
| Home | `/home/ubuntu/recovery-r1-4/home-after-375x812.png` |
| Catalog | `/home/ubuntu/recovery-r1-4/catalog-after-375x812.png` |
| Detail, актуальный после R1.5 CTA fix | `/home/ubuntu/recovery-r1-5/detail-one-cta.png` |
| Lead default | `/home/ubuntu/recovery-r1-4/lead-default-375x812.png` |
| Lead validation / submitting / success | `/home/ubuntu/recovery-r1-4/lead-validation-375x812.png`, `lead-submitting-375x812.png`, `lead-success-preview-375x812.png` |
| Touch-target measurement | `/home/ubuntu/recovery-r1-4/touch-targets.json` and `touch-targets.txt` |

The Detail evidence used here is the R1.5 screenshot with one visible sticky CTA. The older R1.4 Detail screenshot with two CTA buttons is not used as current evidence because R1.5 explicitly removed the duplicate content CTA.

## 3. Contrast verification before changes

Command used for token pairs: `node scripts/contrast.mjs <foreground> <background>`.

| Pair | Ratio | Normal text AA | Large/UI AA | Usage |
|---|---:|---|---|---|
| `#EDEAE4` / `#1C1B1A` | 14.32:1 | PASS | PASS | primary text on app background |
| `#BCB9B7` / `#1C1B1A` | 8.81:1 | PASS | PASS | metadata/body secondary text |
| `#B88F00` / `#1C1B1A` | 5.71:1 | PASS | PASS | accent links/status on background |
| `#EDEAE4` / `#262422` | 12.88:1 | PASS | PASS | card text |
| `#BCB9B7` / `#262422` | 7.93:1 | PASS | PASS | card metadata |
| `#1A1A1A` / `#B88F00` | 5.77:1 | PASS | PASS | text on gold CTA |
| `#9A9896` / `#1C1B1A` | 5.98:1 | PASS | PASS | borders / control outlines |
| `#F37A72` / `#262422` | 5.77:1 | PASS | PASS | error text on card surface |

The measured token system is not the current blocker. Alpha overlays (`rgba(...)`) and image-backed hero text require pixel sampling under each media asset; they are reported as unverified where relevant rather than inferred from the token table.

## 4. Findings — ranked table before UI changes

| Severity | Problem / evidence | Сейчас | В референсе / target | Что менять |
|---|---|---|---|---|
| **HIGH** | **Home content is visually occluded by the floating bar.** Evidence: `home-after-375x812.png` shows the next “Ход строительства” section beginning behind the bottom pill. Source: `app/(tabs)/index.tsx:69-74,476` and global bar `app/(tabs)/_layout.tsx:82-92`. | Home uses `paddingBottom: 130`, but the absolute floating bar plus safe-area bottom can still cover the next section at the captured viewport. | Bottom navigation must leave a clear reading zone; the last visible section must not start under chrome. | Measure actual bar bottom/height against content inset, then set one shared bottom-content token used by Home/Catalog and verify at 375pt and 430pt. Do not increase padding blindly.
| **HIGH** | **Shared ApartmentCard contains hardcoded colors outside the token system.** Source: `components/apartment-card.tsx:53-54,58,67,39`. | Shadow, border, heart underlay and translucent surfaces use `#000000`, `#2E2C2A`, `rgba(0,0,0,0.3)`, `rgba(255,255,255,0.15)` and `rgba(28,27,26,0.85)` directly. | Premium editorial reference uses a controlled graphite/gold surface stack; every layer should be named and measurable. | Add semantic shadow/border/heart-surface tokens in `constants/app-data.ts`; replace literals; run contrast/pixel checks for the actual translucent heart state. This is a shared component finding with reach across Home, Catalog and Detail.
| **HIGH** | **The active state can be communicated by accent alone in parts of the UI.** Sources: Catalog `app/(tabs)/layouts.tsx:53-58,113-116`; tab bar `app/(tabs)/_layout.tsx:51-59,102-105`. | Active catalog mode is mainly gold underline; active tabs use gold circle and color difference. | Reference grammar should preserve state through at least two cues: position/label/underline plus color; icons should remain legible in inactive state. | Keep the underline/selected semantics, but verify selected state with explicit label/icon weight or shape and test at grayscale/assistive tech. Do not rely on gold alone.
| **HIGH** | **Lead supporting copy is too small for a high-consequence form.** Evidence: `lead-default-375x812.png`; sources `app/lead.tsx:210,214`, `components/lead-fields.tsx:132,144-145`. | Consent, status and field errors are 11px/16px. Token contrast passes, but the rendered reading size is below the comfortable body level and becomes fragile under system text scaling. | Reference form keeps legal/status copy secondary but readable, with a clear primary CTA and inline recovery. | Raise meaningful status/error/legal copy to the body-small token (at least 13px/18px), reserve 11px for non-essential metadata only, and check long Russian copy at large font scale.
| **MEDIUM** | **Home hero title overrides the display token without a documented type decision.** Source: `app/(tabs)/index.tsx:511-516`; token `constants/app-data.ts:16-17`. | `heroTitle` spreads `display32`, then overrides to 28/32. | Editorial reference has a clear dominant hero headline with a stable display scale and measured contrast over the image. | Either use `display32` literally or create a named hero token; sample contrast at the title baseline over the actual image/gradient, not just the page background.
| **MEDIUM** | **Home has too many competing first-screen intents.** Evidence: `home-after-375x812.png`; sources `app/(tabs)/index.tsx:130-159,207-315`. | Hero, three equal quick actions, favorites, construction and promos all compete before the user reaches a single primary path. | Premium sales app reference establishes one dominant next step, then progressive disclosure. | Make “Подобрать квартиру” the primary action, demote the other two to secondary actions, and reduce first-viewport section competition without removing content.
| **MEDIUM** | **Home promo/construction surfaces are flatter than the hero and cards.** Sources: `app/(tabs)/index.tsx:607-648`. | Construction card and promo cards rely on flat `cardBackground` and separate image/text blocks; there is no shared depth/elevation treatment. | Reference uses coherent layered surfaces: image, controlled overlay, text, and one elevation language. | Reuse a named media-card primitive or shared surface treatment; keep one shadow system and avoid adding decorative borders solely for depth.
| **MEDIUM** | **Detail hero is visually dominant but the content transition is abrupt.** Evidence: `/home/ubuntu/recovery-r1-5/detail-one-cta.png`; source `app/apartment/[id].tsx:49-67`. | Hero is `height: 55%` of window, then price/content begins after an opaque gradient; title and price feel like separate blocks. | Detail pattern is hero → title/meta → facts with a deliberate collapse/transition and stable reading hierarchy. | Preserve full-bleed hero, but make the hero-to-content handoff explicit through a single surface boundary and consistent vertical rhythm; do not add parallax until the static hierarchy is corrected.
| **MEDIUM** | **Detail uses raw translucent colors that are not tokenized or pixel-audited.** Source: `app/apartment/[id].tsx:51,102-103,126`. | Gradient and toolbar circles use multiple literal alpha colors. | Reference uses a warm graphite overlay with predictable readability across media. | Name overlay roles and run pixel contrast against the actual schematic/hero pixels for meta, title and toolbar icons.
| **MEDIUM** | **Detail CTA has correct placement but not a complete action-state vocabulary.** Source: `app/apartment/[id].tsx:44-45,84,111-112`. | Sticky CTA is present and one-CTA R1.5 evidence passes, but the visual system only shows default/pressed opacity; request-in-flight feedback belongs to the Lead route. | Primary action should feel continuous from Detail to Lead and preserve clear feedback. | Keep one sticky CTA; align its label/state treatment with Lead’s button primitive and verify disabled/submitting handoff without duplicate CTA.
| **MEDIUM** | **Card geometry mixes canonical and one-off radii.** Sources: `components/apartment-card.tsx:56-58,67,70-77`; `constants/app-data.ts:30`. | Canonical card radius is 20, but compact card is 140px high with padding 14, heart 22 radius, plus a literal edge radius and per-variant sizes. | Reference has a deliberate radius scale: card, image, control, pill. | Keep compact variant, but express its 14px padding and all control/surface radii as named scale values; verify concentric outer/inner corners.
| **LOW** | **Catalog has a strong title but weak filter/sort grouping.** Evidence: `catalog-after-375x812.png`; source `app/(tabs)/layouts.tsx:43-66`. | Title, filter, modes, count and sort are separated by several independent spacing jumps; filter is a generic outlined circle. | Collection reference groups navigation/filter affordances as one compact control band, leaving list content dominant. | Re-group only after measuring current bounding boxes; use one compact header rhythm rather than adding more visual decoration.
| **LOW** | **Several text styles bypass the central type scale.** Sources: `app/(tabs)/index.tsx:513-516,519-521,544-550,630-635`; `app/lead.tsx:209-214`; `components/lead-fields.tsx:132,136,144-145`. | Many one-off 11/13/18/28 sizes coexist with named display/body/meta tokens. | Reference feels premium because type levels are intentionally few and repeated. | Add missing semantic tokens for hero, legal/status and compact labels; then remove local size overrides. Keep no more than two font families.
| **LOW** | **Hardcoded spacing bypasses shared rhythm.** Sources: `app/lead.tsx:204-215,217-223`; `components/lead-fields.tsx:128,133,137`. | Values such as 12, 16, 20, 8 are repeated as literals beside `SPACING`, making later visual tuning inconsistent. | Reference has an observable 4/8 rhythm and predictable form grouping. | Replace only audited spacing literals with existing tokens or named form tokens; do not change layout until the measurement baseline is recorded.
| **LOW** | **Motion is under-specified rather than visibly broken.** Sources: `app/lead.tsx:175`, Home/Detail `Modal animationType="none"`. | Modals appear/disappear with no transition. No reduced-motion branch is needed because there is currently no custom motion. | Native-feeling reference uses platform sheet/modal semantics; motion should communicate spatial relationship but not decorate frequent actions. | Prefer native presentation/sheet semantics or a short platform-appropriate transition only after static layout is accepted; no custom hero animation in this pass.
| **UNVERIFIED** | **Responsive coverage beyond phone is not evidenced.** The audit has 375×812 screenshots and touch audit, but no current 834 or 1440 captures. | Phone evidence is available; tablet/desktop Expo Web behavior is not verified. | Audit requirement calls for phone, tablet and desktop widths where responsive behavior matters. | Before implementation, capture Home/Catalog/Detail/Lead at 375, 834 and 1440; keep any finding from wider layouts marked unverified until then.

There are more than five material differences from the reference direction, so a cosmetic pass would be insufficient. The safe next step is a bounded composition pass, but only after triage of this table.

## 5. What already works

- Token contrast table passes all measured opaque text/surface pairs.
- `touch-targets.txt` reports **58 controls, 0 failures**.
- Catalog has explicit loading, empty, error and populated branches: `app/(tabs)/layouts.tsx:27-28,70-95`.
- Lead has default, validation, submitting, consent-unavailable and success-preview branches: `app/lead.tsx:95-140,156-170` plus evidence screenshots.
- Detail has loading, error and not-found recovery paths: `app/apartment/[id].tsx:31-44`.
- ApartmentCard correctly separates shadow wrapper and clipping wrapper: `components/apartment-card.tsx:25-27,50-58`.
- Current Detail R1.5 evidence shows one visible sticky CTA, so the duplicate CTA issue is closed.

## 6. Verification performed

```text
node scripts/contrast.mjs '#EDEAE4' '#1C1B1A'      -> 14.32:1 PASS
node scripts/contrast.mjs '#BCB9B7' '#1C1B1A'      ->  8.81:1 PASS
node scripts/contrast.mjs '#B88F00' '#1C1B1A'      ->  5.71:1 PASS
node scripts/contrast.mjs '#EDEAE4' '#262422'      -> 12.88:1 PASS
node scripts/contrast.mjs '#BCB9B7' '#262422'      ->  7.93:1 PASS
node scripts/contrast.mjs '#1A1A1A' '#B88F00'      ->  5.77:1 PASS
node scripts/contrast.mjs '#9A9896' '#1C1B1A'      ->  5.98:1 PASS
node scripts/contrast.mjs '#F37A72' '#262422'      ->  5.77:1 PASS
measure-touch.mjs                                      -> 58 controls, 0 failed
```

`pnpm check`, `pnpm lint`, `pnpm test` and R1.5 Deno evidence remain green from the accepted R1.5 release; no source was changed during this audit. A new post-audit run is intentionally deferred until a concrete UI patch exists.

## 7. Verdict and stop point

**Verdict: Block for UI changes until findings are triaged.** This is not a backend block. The audit is complete and read-only. No UI source files were modified in this phase. The next implementation pass should address the two HIGH findings first, then the MEDIUM hierarchy/depth findings, while preserving R1.5 behavior and not touching backend, SQL, Edge Function or Package 2.
