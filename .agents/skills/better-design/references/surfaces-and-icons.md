# Surfaces and icons

Visual polish for surfaces and icons, with the exact value each detail takes. It applies once the underlying interaction is sound, and a polish finding never outranks a broken interaction.

## Outer radius equals inner radius plus padding

Mismatched radii on nested elements is one of the most common things that makes interfaces feel off. Where nested surfaces share a visible, even inset:

```
outerRadius = innerRadius + padding + borderWidth
```

```tsx
// Good: outer radius accounts for padding
<div className="rounded-2xl p-2">       {/* 16px radius, 8px padding */}
  <div className="rounded-lg">          {/* 8px radius = 16 - 8 */}

// Bad: same radius on both
<div className="rounded-xl p-2">
  <div className="rounded-xl">
```

Past `24px` of padding, or where the padding is deliberately asymmetric, treat the layers as separate surfaces and keep each one's radius token.

## Align optically where geometry looks off

- **Button with text and icon:** start the icon side at `2px` less padding than the text side, then judge by eye (`ps-4 pe-3.5`).
- **Play triangles:** the geometric center sits left of the visual center, so shift toward the point: `transform: translateX(2px)`. Playback icons never mirror.
- **Asymmetric icons** (stars, arrows, carets): fix the `viewBox` or path in the SVG itself, so the component needs no offset. Where the asset cannot change, nudge its wrapper by `1px`.

## Shadows for elevation, borders for structure

Agents choose a solid border where a semi-transparent shadow belongs. Shadows adapt to any background since they use transparency; solid borders only work on the background they were designed for. Where a border exists only to create depth (buttons, cards, containers, dropdowns, modals), replace it with layered transparent `box-shadow` values. Keep borders on dividers, separators, table cells, selected states and form inputs.

Light mode, three layers: a 1px ring, a lift, an ambient depth.

```css
:root {
  --shadow-border:
    0px 0px 0px 1px oklch(0 0 0 / 0.06),
    0px 1px 2px -1px oklch(0 0 0 / 0.06),
    0px 2px 4px 0px oklch(0 0 0 / 0.04);
  --shadow-border-hover:
    0px 0px 0px 1px oklch(0 0 0 / 0.08),
    0px 1px 2px -1px oklch(0 0 0 / 0.08),
    0px 2px 4px 0px oklch(0 0 0 / 0.06);
}
```

Dark mode: depth shadows vanish on dark backgrounds, so keep one white ring.

```css
/* Redefine under the project's dark selector */
--shadow-border: 0 0 0 1px oklch(1 0 0 / 0.08);
--shadow-border-hover: 0 0 0 1px oklch(1 0 0 / 0.13);
```

```css
.card {
  border: 1px solid transparent; /* forced-colors mode drops box-shadow and paints this border */
  box-shadow: var(--shadow-border);
  transition: box-shadow 150ms var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .card:hover { box-shadow: var(--shadow-border-hover); }
}
```

The transparent border keeps the box the same size as the border it replaces. Bigger surfaces read as thicker: a deeper shadow than small chips.

## Translucent materials

Translucency conveys hierarchy. Build nav, toolbars and sheets as translucent layers with content scrolling underneath, rather than opaque bars that consume a fixed strip:

```css
.toolbar {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.4); /* bright top edge = light catching the material */
}
```

- Heavier materials separate structural regions (sidebars); lighter materials draw attention to interactive elements. **Never stack a light translucent surface on another:** legibility collapses.
- Dim to focus, separate to keep flow. A modal task pairs the surface with a dimming scrim. A parallel, non-blocking panel uses translucency and offset without a scrim.
- Over translucent surfaces, text gets higher contrast, a slightly heavier weight and a small letter-spacing bump. Put color on a solid layer, not the translucent foreground.
- Prefer a small blur or gradient mask where content meets floating chrome over a hard 1px divider, only where floating UI actually overlaps content.
- Under `prefers-reduced-transparency: reduce`, raise background opacity and drop the blur. Under `prefers-contrast: more`, near-solid backgrounds with a defined border.

## Outline images in pure black or white

Give content images a `1px` outline inset by `1px`. `oklch(0 0 0 / 0.1)` in light mode and `oklch(1 0 0 / 0.1)` in dark. Never a palette near-black, a tinted neutral (`slate`, `zinc`, `neutral`, `#111827`) or the accent color: the tint shows as dirt on the image edge. Skip transparent artwork such as logos and illustrations.

```tsx
<img className="outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10" />
```

`outline` never changes the image's size, and at `outline-offset: -1px` it follows the corner radius.

## Hover only on hover-capable pointers

Put hover styling behind `@media (hover: hover) and (pointer: fine)`. On touch, `:hover` latches after a tap and reads as a stuck selected state. Tailwind 4's `hover:` variant compiles under `(hover: hover)`; in Tailwind 3 set `future.hoverOnlyWhenSupported`. Increase contrast on hover and active. Never change font weight on hover: the line reflows.

## Match icon stroke to text weight

| Adjacent text | Rendered stroke width |
| --- | --- |
| Regular (400), 14-16px | `1.5px` |
| Medium or semibold (500-600) | `2px` |
| Bold (700), or an emphasized standalone icon | `2.5px` |

The widths are rendered pixels. A 24px-grid icon drawn at 16px scales its stroke by 16/24, so use the library's absolute-stroke option (Lucide's `absoluteStrokeWidth`) or `vector-effect: non-scaling-stroke`.

- One icon library per surface, never mixed on one toolbar.
- Size inline icons at `1em`-`1.25em` of the adjacent font size.
- Test every icon at the smallest size it renders, often `16px`. Prefer a simplified glyph for small contexts. Use the grid that matches the render size (`16`, `20`, `24`). Always SVG, never raster.
- An icon next to a label beats an icon alone. Never emoji as icons.

## One SVG, recolored per state

Draw every icon with `currentColor` and let CSS state drive hover, selected and disabled, never separate assets. Strip hardcoded `fill="#666"` when importing.

```html
<button class="text-icon-muted hover:text-icon-strong aria-pressed:text-icon-active disabled:opacity-40">
  <BookmarkIcon />
</button>
```

Outline is the default variant; fill marks the selected or active state (active tab, toggled bookmark, liked heart). Never filled everywhere, or the active tab has no state signal.

## Icons in RTL

Under `dir="rtl"`, flip back and forward arrows, navigation chevrons, text-block glyphs and directional glyphs such as "send" (`rtl:-scale-x-100`). Never flip logos, checkmarks, physical objects or media playback. Use one mechanism per element: two flips compound back to unflipped.
