# Stress test

Take UI that looks right with demo data and feed it the realistic worst case for every value it renders. Demo data is chosen, usually without anyone noticing, to make the design look good: names that fit on one line, counts that never need a separator, every optional field filled in. Undo that choice, one field at a time.

Two failure modes, and the first is worse:

1. **Nonsense data.** `"aaaaaaaaaaaaaaaaaaaa"` and 5,000-character names prove nothing. Every worst-case value is something a real user could produce, or the longest value the schema actually accepts. If you find no limit, that's a finding: "unbounded".
2. **Stopping at long text.** The breaks that ship are the short name that leaves an orphaned dash, the missing avatar, "1 members", the empty list, the badge whose text got translated.

Change the data, not the component: the worst case enters through the same boundary the demo data does (fixture, mock, props). Report before fixing; some breaks are design decisions.

## 1. Map the surface

List every value the component renders with its source, type, limit (from Zod, migrations, API types, `maxLength`) and whether it's optional. Include counts in headers, relative timestamps, badge text, labels from data, avatars, and the list itself: its length is a value too.

## 2. Stress only what varies

A scenario earns a slot when the component accepts something that can take that shape in production. Keep only the axes whose cue matches, and say in one line which you dropped and why:

| Axis | Cue |
| --- | --- |
| Content length and shape | The component renders text it does not author: user input, CMS, API data, translations |
| Quantity | It repeats over items: lists, tables, grids, tag rows, avatar stacks |
| Container | Always: 320px, squeezed by a sibling, very wide |
| State | It has the state: loading, error, disabled arriving as props |
| Environment | The project supports the mode: dark, zoom, reduced motion. Name them for the user to toggle; never simulate them on the page |

A text input gets content length and states, never item quantity. A static button with a fixed label gets container and environment only.

## 3. Build the worst case

One dataset that hits every applicable row at once, spread across the first rows, as real data does. Also: **empty** (zero items), **one** (every count at exactly 1) and **huge** (1,000+ rows if unpaginated). Use `example.com` and `.test` domains.

| Value | Breaks |
| --- | --- |
| `Aleksandra Wiśniewska-Kowalczyk` | Long, hyphenated, diacritics; wraps, and the hyphen is a break point |
| `Christopher Alexander Montgomery III` | Naive first + last initials give `CI` |
| `Jo` / `J` | Name column mostly empty; tiny click target if the name is the link |
| `Đặng Thị Ngọc Hân` | Stacked diacritics clipped by tight `line-height` + `overflow: hidden` |
| `王秀英` / `نور الهدى عبد الرحمن` | No spaces; RTL punctuation and icons on the wrong side without `dir="auto"` |
| `🦊 Fox` / `👩🏽‍💻 Priya` | `.charAt(0)` returns half a surrogate pair; slicing breaks ZWJ sequences |
| *(missing name)* | The UI must fall back to something |
| `bartholomew.fitzgerald@northwind-industries-holdings.example.com` | Unbreakable; pushes every sibling off the row |
| Long URL, UUID, `Q3 Board Deck (revised) v12 [approved].pdf` | End-truncation hides the part that differs |
| `Benachrichtigungseinstellungen` / French expansion | Unbreakable label; UI copy runs about 30% longer in translation |
| Twelve tags, or one 45-character tag | Tag rows that wrap into a wall; needs a `+8` overflow |
| Empty string, `   `, newline in a single-line field | Collapsed heading, doubled row height |
| `<script>alert(1)</script>`, `&amp;`, `**bold**` | Must render as literal text |
| `0`, `1`, `1284`, `1000000`, `-42.5`, `0.1 + 0.2`, `142%` | Zero states, plurals, separators, width, negatives, raw floats, bars past bounds |
| `null`, `undefined`, `NaN` | Rendered literally |
| Exactly page size, and page size + 1 | Off-by-one, empty page 2 |
| Now, 12 days ago, a future date, a timezone edge | "0 seconds ago", thresholds, "-3 days ago", wrong day |
| Avatar URL that 404s, a 4000×200 image, slow image | Broken icon, distortion, layout shift |
| Loading, API error, partial data, every status at once, no permission | Shifting skeletons, raw error text, misaligned rows, varying badge widths |

## 4. Put it behind a toggle

Put a segmented control labeled **Demo data / Worst case** where the user can flip it while looking at the component, with extra segments for **Empty / One / 1,000 rows**. Swap the fixture at the data boundary.

- **In a project with a dev server:** a dev-only switch, a `?data=worst` URL param read where the fixture is chosen, or a scratch route rendering the real component imported untouched. The selection persists in the URL. In Next, the page is client code.
- **No project:** a single self-contained HTML file with the component and every dataset inline.

Fixed at the bottom-center of the viewport, out of the component's way. Small, neutral, obviously chrome: a gray track, a white pill on the active segment, system font. Switching is instant, with no animation on the content. It never ships to production.

## 5. Look for the signatures

Load once and skim every state. Note what visibly broke ("text escapes the field's right edge"), never "spacing feels tight". A predicted failure is not a finding. Mark each break with a one-line note on the page, so the page reads as the report on its own.

Check at the component's real container width, then 320px and the widest layout; at 200% zoom; in dark mode and `dir="rtl"` if supported.

| What you see | Fix |
| --- | --- |
| Avatar or icon squished into an oval | `flex-shrink: 0` on fixed-size boxes |
| Text overflows instead of wrapping or truncating | `min-width: 0` on the text column (`minmax(0, 1fr)` in grid) |
| Email or URL runs past the edge | `overflow-wrap: anywhere` on that element |
| Trailing action pushed off-screen | `min-width: 0` on the middle, `flex-shrink: 0` on the action |
| Badge wraps onto two lines | `white-space: nowrap; flex-shrink: 0`, and decide what yields instead |
| Avatar adrift beside a three-line name | `align-items: flex-start` once text can wrap |
| Long word breaks mid-word in a heading | `overflow-wrap: anywhere`, never `word-break: break-all` |
| Wrong initials | Grapheme clusters (`Intl.Segmenter`), first + last word, fallback icon |
| Orphaned dash or empty line for a missing field | Omit the line, or reserve its height intentionally |
| "1 members" | `Intl.PluralRules` |
| Numbers jitter, columns misalign | `tabular-nums` |
| `1284`, `NaN` | `Intl.NumberFormat`; guard null |
| Translated label overflows a fixed-width button | Width from content with `min-width` |
| Truncated text with no way to read it | A tooltip or the full value in a detail view |
| Scrolling 1,000 rows stutters | Virtualize or paginate, and say which |

**Truncate, wrap or clamp, per field:** wrap what the user needs to identify something (names, titles in a detail view); truncate at the end for secondary metadata; truncate in the middle when items differ at the end (file names, emails sharing a domain, hashes); clamp multi-line previews in cards; never truncate numbers, amounts, dates or anything compared.

## 6. Report

| # | Severity | Field | Worst-case value | What happens | Fix |
| --- | --- | --- | --- | --- | --- |

Severity: **Broken** (unreadable, unreachable, wrong data), **Ugly** (readable but visibly wrong), **Fragile** (fine now, one realistic step from breaking). Then the decisions with more than one right answer, one line each with a recommendation, and what held up. Close with where the toggle is and its states. Leave it running; delete the harness only on the user's word. Apply fixes when asked, then flip through every state again, the demo included. Keep the worst-case fixture as the regression test.
