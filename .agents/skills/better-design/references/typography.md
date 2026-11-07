# Typography

How text renders, from the type scale and spacing to font loading, wrapping and punctuation.

## Measured, not preferred

Some values are exact: unitless line-height, weight `400` or heavier below `18px`, a 60-75 character measure, `16px` inputs on iOS and `tabular-nums` on changing values are findings when missed. Letter-spacing, pairing and scale ratios are heuristics. Report them only where they break the project's own scale. Never propose a new typeface, paid or free, unless the task asks for a type change.

## Fewer fonts, sizes and weights

Rarely use more than three fonts; marketing pages can carry more than apps. Weight and size carry hierarchy, so each extra one dilutes it. One family or two; if two, make them clearly distinct. A serif headline over a sans body reads as deliberate, two near-identical sans-serifs read as a mistake. Use the `Display` cut for large sizes and the `Text` cut for small ones where the family ships both.

Below `18px`, use weight `400` or heavier. Weights `100`-`300` belong at `28px` and up. Load every face the design uses: browsers synthesize a missing weight or style and distort the face. Use `.woff2` and the framework's font loader.

## Use a type scale with semantic names

Define a small set of sizes and pair each with its line-height and weight, so a role is one decision instead of three. A starting point for a product interface:

| Role | Size | Line-height | Weight |
| --- | --- | --- | --- |
| Display | `2.25rem` (36px) | `1.1` | `600` |
| Title | `1.5rem` (24px) | `1.2` | `600` |
| Heading | `1.125rem` (18px) | `1.3` | `600` |
| Body | `1rem` (16px) | `1.5` | `400` |
| Caption | `0.8125rem` (13px) | `1.4` | `400` |

Emphasis within a role is one weight step up (`400` to `500`), not a size change. Heading sizes descend with level; a subordinate heading never overpowers its parent. Set `font-size` in `rem` so the reader's browser font size still applies.

## Size floors

Long-form body text starts at `16px`. UI text can go smaller: inputs and menus at `14px`, captions at `13px`, rarely below `12px`.

## Line-height by role

Display `1.1`, headings `1.2`-`1.3`, body `1.5`-`1.6`. Unitless, so it scales with the font size. Anything that wraps to three or more lines needs at least `1.4`, even in a height-constrained row.

## Letter-spacing by size

Tracking is size-specific, never one value for all sizes. Headings at `24px` and up take `-0.01em` to `-0.02em`. Uppercase labels at `14px` or smaller take `0.05em`. Body copy stays at `0`. Use `em`. Kerning is on by default; `font-kerning: none` is never a fix.

## Cap the measure

Long-form text at 60-75 characters per line (`max-w-prose`, `65ch`, or `560`-`680px` at a 16px body).

## Wrap deliberately

| Scenario | Use |
| --- | --- |
| Headings, titles, short descriptions | `text-wrap: balance` (Chromium ignores it past six lines) |
| Paragraphs, descriptions, captions, UI text | `text-wrap: pretty` |
| Code blocks, pre-formatted text | Neither |

`overflow-wrap: break-word` where a long word, link or ID could escape the container. `white-space: nowrap` on labels and badges where a line break looks broken. Interface text stays `text-align: start`; never `justify` in application UI.

## Tabular numbers on changing values

`font-variant-numeric: tabular-nums` on timers, counters, prices, scoreboards, dashboards and numeric table columns, so every digit keeps one width. Leave figures in prose, phone numbers, zip codes and version numbers proportional. In Inter, the `1` becomes wider and centered: expected, but check it.

## Truncate with a way back

One line: `truncate`. Several: `line-clamp-3`, which needs `display: -webkit-box` and `-webkit-box-orient: vertical`. A truncated value always has a way back to the full text (`layout.md`).

## Properties over raw tags

`font-weight: 650`, not `font-variation-settings: "wght" 650`. `font-variant-numeric: tabular-nums`, not `font-feature-settings: "tnum" 1`. Properties keep working when a non-variable fallback renders. Leave `font-optical-sizing` at `auto`. Raw tags only for custom axes and features with no property, like `"ss01" 1`.

## Font smoothing on the root

`-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale` once on the root (Tailwind `antialiased`), never per component.

## Natural case, typographic punctuation

Store text in natural case and set case with `text-transform`. Rendered text uses typographic characters: curly quotes (straight in code), an en dash for ranges `2010–2020`, the single `…` character, `&nbsp;` in `10 km`, `⌘ K` and brand names. No em dashes.

## Underlines from the font

`text-underline-position: from-font` and `text-decoration-thickness: from-font`, or tune `text-underline-offset` and thickness by hand. A dotted underline hints a word carries extra information. Color is the only part of a real underline that animates reliably.

## Inputs at 16px on mobile

iOS Safari zooms the page when an input's text is under `16px`, and does not zoom back out. Never fix it with `maximum-scale=1`. Two fixes, so ask which the design wants: size the input up on mobile (`text-base sm:text-sm`), or keep `font-size: 16px` and render the intended size with `transform: scale()` on a wrapper-drawn field.

## Trim text boxes in tight containers

In buttons and badges, `text-box: trim-both cap alphabetic` stops text sitting low. Progressive enhancement (Chromium 133+, Safari 18.2+).

## Keep useful text selectable

Never `user-select: none` on `body` or a text container: users copy addresses, error messages and order numbers. It belongs on controls and drag surfaces only (`mobile-web.md`).

## Language and bidi

Set `lang` so browsers pick the right quotes, hyphenation and pronunciation. Set `dir` on the document and wherever direction changes. Wrap a mixed-direction value in `<bdi>`. `translate="no"` on brand names and code tokens.

## Generated-look type

Avoid accenting a single word of a headline in italic, bold or color; a tracked all-caps eyebrow above every heading; labels that add nothing above content; a monospace face for small data labels. Never a text shadow, outline or gradient fill on display text.
