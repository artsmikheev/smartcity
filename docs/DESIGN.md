

## 10. Canonical visual specification

### Project

ЖК «Умный город» в Реутове. Mobile-first приложение для покупки квартиры. Основная аудитория — 28–45 лет; продукт должен быть быстрым, ясным и премиальным без снобизма.

### Aesthetic

Premium editorial. Не fintech, не crypto и не AI-startup. Ориентир — Kinfolk + Linear + Wallpaper*: тёплый графит, архитектурная строгость, выразительная Playfair Display и спокойный sans-serif для фактов.

### Canonical palette

| Token | Value | Use |
|---|---|---|
| `background` | `#1C1B1A` | глубокий тёплый графитовый фон |
| `cardBackground` | `#262422` | raised card surface |
| `cardDeep` | `#121212` | blueprint и технические схемы |
| `foreground` | `#EDEAE4` | основной текст |
| `muted` | `#BCB9B7` | вторичный текст и metadata |
| `accent` | `#B88F00` | только акценты, статусы и primary actions |
| `accentForeground` | `#1A1A1A` | текст на золотом фоне |
| `border` | `#9A9896` | тонкие границы и outline controls |
| `error` | `#F37A72` | ошибки и destructive feedback |
| `success` | `#4ADE80` | подтверждённые success states при необходимости |
| `scrim` | `rgba(18,18,18,0.65)` | затемнение поверх media/modal |
| `overlay` | `rgba(28,27,26,0.70)` | компактные translucent controls |
| `overlayStrong` | `rgba(28,27,26,0.85)` | controls поверх насыщенного media |

`constants/app-data.ts` — источник значений. `constants/theme.ts` — единственная публичная точка входа для экранов. Новые raw hex и дубликаты палитры запрещены.

### Typography

Display roles используют `PlayfairDisplay_400Regular` в размерах 36 / 32 / 28 / 22 / 20. Body и metadata используют системный sans-serif в размерах 15 / 13 / 11. Uppercase допустим только для eyebrow/meta и использует tracking 0.5–1.0. Serif не используется для body; sans не используется для display.

### Composition

На каждом экране один доминирующий элемент: hero или заголовок. В карточке максимум три уровня типографики. Spacing scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48. Между секциями — 32; между заголовком и контентом — 24. Радиусы: 20 для карточек, 12 для media, 999 для pill и 32 для floating tab bar.

Тени применяются только к карточкам и tab bar: направление вниз, `0 10px 24px rgba(0,0,0,0.55)`. Радиальные, цветные и глобальные тени запрещены.

### Motion

Press feedback: scale 0.97 за 160ms с ease-out, если для конкретного control есть motion implementation. Tab switch не получает декоративного slide — меняется только selected state. Sheet open использует native transition; loading остаётся статичным skeleton с opacity без shimmer. Reduced motion должен уважаться через native accessibility settings. В текущем проходе новая декоративная animation code не добавлялась.

### Anti-patterns

В UI запрещены emoji, цветные тени, neon accents, плотные сетки без воздуха, более двух шрифтов, текстовые символы вместо Ionicons, serif в body, sans в display и сторис-эстетика с яркими плашками или огромными emoji.

### Reference manifest

`design/references/Image1.png` — DesignNest, hero/depth; `Image2.png` — Brew Beyond, editorial card/list; `Image3.png` — MAVEN, dark product-first composition; `Image4.png` — 2Wheels, structure and spacing; `Image5.png` — real-estate blueprint board. Все пять файлов присутствуют в проекте и используются как visual reference set.
