# Layout

Grouping, alignment, spacing and responsive structure, then stress-testing it by resizing, translating and mirroring. The numbers below apply only where the project has no spacing scale or density system. A finding needs a failure you can show, such as a clip, an overlap, a broken mirror or a misread group.

## Group with space, not lines

Space groups first, background shapes second, separator lines last and only where space alone can't carry the structure (tables, long settings lists). The gap between groups is at least 2× the gap within one: `8px` inside a group means `16px` or more between groups. Where a separator is needed, keep it a low-contrast hairline, never paired with a gap that already did the job.

## Keep controls distinct from content

Every interactive element has a background shape, a border, an underline or a consistent placement zone such as a toolbar. A control styled like the text beside it doesn't read as a control. A non-clickable badge shaped like the buttons beside it collects dead clicks.

## Align to shared edges

A small set of alignment edges, everything on them. One spacing step per level of nesting (`16px` is a useful default). Typical stray edges: an icon 2px off the text edge, a card padded unlike its neighbor. Numbers in tables `text-align: end`, text `start`.

## Order by importance

The most important content sits near the top and the leading edge. Never bury the one number the user came for under secondary detail. Within a row, identifying content leads, metadata and actions trail. Visual order matches DOM order: never reorder with `order`, `row-reverse` or grid placement.

## One primary action per view

Secondary actions go behind a menu once there are more than 3. Prefer a short view that links deeper over one long view that shows everything.

## Hint at hidden content

Every piece of off-screen or collapsed content has a visible cue: the next item peeks `16-32px` past the scroll edge, or a disclosure names what's hidden ("Show 12 more results", not "More"). A truncated value the user needs has a way to the full text: an expand control, a detail view or a tooltip that also opens on keyboard focus.

## Control clearance

| Between | Starting point |
| --- | --- |
| Adjacent bordered or filled controls | `12px` |
| Visible glyphs of borderless text and icon controls | `24px` |
| Unrelated control groups | `24px` or more |

Preserve an established, usable density. Hit areas never overlap.

## Content bleeds, controls float

Backgrounds and media extend to the viewport edges; controls and text stay inside the layout margins and safe areas. Full-width buttons stay inset, starting near `16px` inline on mobile, with `env(safe-area-inset-bottom)` padding. Sticky chrome: set `scroll-padding-block-start` to the header's height.

## Hold structure until it breaks

Breakpoints come from the content, not device presets. Keep the expanded layout until it stops fitting, then collapse. Prefer container queries for components. Test the smallest and largest supported sizes first: 320px, laptop and ultra-wide.

## Plan for growth and clipping

Translated strings grow, and a one-word button label is the riskiest thing on screen. Size text containers with `max-width` and `min-height`, never a fixed width or height; let rows wrap. Test one long-string locale such as German.

- `minmax(0, 1fr)` on grid tracks and `min-width: 0` on flex children holding long text.
- `width: 100%`, never `100vw` (it includes the scrollbar).
- `100dvh` for full-height panes, not `100vh`.
- Never park a critical action where resizing, zoom or scrolling clips it.
- No accidental horizontal scroll.

## Logical properties for anything that mirrors

`margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `text-align: start` (`ms-4 pe-6 text-start`). Physical left and right only for physical geometry such as safe-area insets. `translateX` and `background-position` need a `[dir="rtl"]` override. Progressions (star ratings, steps) mirror; digit order never does.
