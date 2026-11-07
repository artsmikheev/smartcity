# Color

Build and audit color systems: ramps, step roles, token names, notation and rendered contrast. Never report a contrast value you did not measure, and never estimate a color you could compute. Notation, a tinted neutral and a gradient's interpolation space are project choices, not findings. A broken role mapping, a failing pair and an out-of-gamut step are findings. Perceived lightness means OKLCH `L`, from `0` to `1`.

## Match the project's color system

Reuse the project's tokens and notation. A consistent hex system beats hex with `oklch()` scattered through it. For a new system, `oklch()` is the best default. Never bulk-convert notation as a side effect: it is a migration.

## A system is ramps, not colors

One neutral ramp (it carries 80-90% of the interface), one accent ramp and only the status ramps the product actually renders. A `warning` ramp nothing imports is maintenance for zero pixels. A second accent hue earns its place only when two things must be distinguishable at a glance.

## Every step has a job

| Role | Tailwind | Radix |
| --- | --- | --- |
| Page background | `50` | `1` |
| Subtle background | `50` | `2` |
| Component background | `100` | `3` |
| Component hover | `200` | `4` |
| Component active / selected | `200` | `5` |
| Subtle border, separator | `200` | `6` |
| Border | `300` | `7` |
| Hovered border | `400` | `8` |
| Solid fill | `600` | `9` |
| Solid fill hover | `700` | `10` |
| Low-contrast text | `700` | `11` |
| High-contrast text | `900` | `12` |

Radix defines steps by role, so the dark scale reuses the same numbers. Tailwind defines them by lightness, so the mapping inverts in dark and components read a semantic token that swaps once. Solid fill sits on `600` because white text on most Tailwind `500` hues fails 4.5:1.

## Hold the hue across the ramp

Build ramps with a color library (`culori`, `colorjs.io`, `chroma.js`), never by eye. A correct ramp: lightness changes steadily in OKLCH `L`; hue is constant end to end; vividness peaks mid-ramp and falls off at both ends; `50`-`200` step about `0.04`-`0.05` apart and mid-ramp steps `0.07`-`0.10`; no two adjacent steps closer than `0.03`; both ends stop short of pure black and white. Across hues, match perceived lightness exactly and vividness as the same proportion of each hue's own maximum.

A brand color meant for buttons belongs on the solid-fill step. A brand color that fails contrast behind white text is still the brand color, just not the fill step. Never quietly darken the brand.

## Neutrals

A pure gray ramp is a perfectly good default. Tinting toward the accent hue (OKLCH chroma `0.005`-`0.02`) is a stylistic option. Warm neutrals read approachable and editorial, cool ones technical and precise. Whichever, hold it across the whole ramp, and tint borders and shadows toward the same hue.

## Name primitives by hue, semantics by role

Primitives name a value (`--blue-600`) and are never applied in a component. Semantic tokens name a job (`--color-text-secondary`), point at a primitive and are the only tier components reference. That seam is what lets a theme repoint colors without touching components.

Grammar: neutral roles lead with the property, `--color-{bg|text|border}-{variant}-{state}`; accent and status roles lead with the role, `--color-{accent|danger}-{subtle|border|solid|text}-{state}`. One word per concept: `text` (never `fg`, `ink`), `bg`, `border`, `accent` for the brand. Reserve `primary` for "most prominent of its group", never the brand.

Role inventory: surfaces (page, surface, raised, sunken, overlay scrim); text (primary, secondary, disabled, inverse, on-accent); borders (subtle, default, strong, separator); accent and each status (subtle background, border, solid, solid hover, text).

Never borrow a token because its value is right today: a separator used as a text color goes lighter with the borders. If a role has no token, add the token. In Tailwind 4, declare both tiers in `@theme` and repoint semantics in a `.dark` block outside it.

## One color, one meaning

Use a color for one purpose across the whole interface, treating anything within `15°` of OKLCH hue as the same color. The rule runs both ways: if the accent means interactive, an interactive element rendered neutral is just as misleading. Keep every status hue at least `15°` from the accent; where convention leaves nowhere to move, give the destructive action a distinct treatment. Never let color be the only carrier of meaning.

## Fill exactly one action per view

One primary action gets the filled color and peers stay neutral. Put the color on the background, not the label. Selected states (an active tab) may use the accent on the glyph and label: that is state, not emphasis.

## Measure the rendered pair

Measure a foreground against the background it actually renders on, not the page background. Text over alpha, `color-mix()`, an image or a translucent surface: measure the rendered result, or use a solid token.

| Content | WCAG 2 AA | APCA |
| --- | --- | --- |
| Body text | 4.5:1 | Lc 75, preferred Lc 90 |
| Labels, headlines | 4.5:1 | Lc 60 |
| Large text (`24px`, or `18.67px` bold) | 3:1 | Lc 45 |
| UI components, meaningful graphics | 3:1 | Lc 30 |
| Dividers | n/a | Lc 15 |

Disabled controls and logos are exempt. When a pair fails, report the pair, its value and the threshold, and leave the colors alone unless asked. To fix, change lightness first, holding hue. A mid-lightness background caps what any text can reach.

## Gradients

The interpolation space is a look, not a correctness setting. Default to `in oklab`; reach for `in oklch` when a two-hue gradient goes gray in the middle. Large low-contrast gradients band on 8-bit displays: widen the contrast, shrink the area or add subtle noise. Keep text off gradients where you can. No gradient text, glowing buttons or gradient washes as decoration.

## Light, dark and increased contrast

A dark palette is not the light one reversed. Swap the semantic roles first, then tune: vividness comes down a step or two, the dark end needs more separation, and every pair is remeasured.

Use one switching mechanism: `prefers-color-scheme` alone with no toggle; a `.dark` class once users can override; or `light-dark()` with `color-scheme: light dark`. Never tokens split between a media query and a class.

Set `color-scheme: dark` on `<html>` for dark themes, and a `theme-color` per scheme matching the top of the page. Native `<select>` needs an explicit `background-color` and `color` (Windows). Under `prefers-contrast: more`, give each appearance its own value, widening the gap by at least `0.15` OKLCH `L`.

Gamut: declare the sRGB value first, then the vivid one inside `@media (color-gamut: p3)`.
