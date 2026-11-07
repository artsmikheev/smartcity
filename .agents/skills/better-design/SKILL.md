---
name: better-design
description: "Design, motion and interaction rules for building and reviewing UI on the web (React, Next.js, Tailwind) and in React Native / Expo. Use for any frontend work, even when not asked explicitly: new screens, components, forms, animations, surfaces, typography, color, polish. Also use when the user invokes /better-design, or says a UI feels off, generic or not polished."
---

# Better Design

This skill holds the small details that compound into an interface that feels right: motion, interaction, surfaces, type, color, layout and copy. It builds UI to that bar, and in audit mode it reviews existing UI against it.

## Exact values

The values in the references are exact, not ranges to approximate. `cubic-bezier(0.23, 1, 0.32, 1)` is not `cubic-bezier(0.4, 0, 0.2, 1)`. Optical nudges and the concentric padding cutoff are the exceptions: starting points, judged by eye.

Extend the codebase's tokens, components and styling system, don't fork them. Express every change in the project's system: Tailwind in a Tailwind project, plain CSS in a CSS project. Never introduce a second styling system just to apply a polish fix. A deliberate and consistent project convention is a preference, not a finding. The same detail done two ways within the project is a finding.

Never present options as a menu. Make the call, state the reasoning in one line, write the code.

## Build

Before writing UI code, read the references the task touches:

| Task | Read |
| --- | --- |
| Anything that animates or transitions | `references/motion.md`, then `references/recipes.md` for the component |
| Motion that stutters, or runs while the page is busy | `references/performance.md` |
| Buttons, forms, overlays, lists, gestures, loading and empty states | `references/interactions.md` |
| Radius, shadows, borders, images, icons | `references/surfaces-and-icons.md` |
| Text | `references/typography.md` |
| Colors, tokens, dark mode, contrast | `references/color.md` |
| Grouping, spacing, alignment, responsive structure | `references/layout.md` |
| Labels, errors, empty states, confirmations | `references/copy.md` |
| A web app used on a phone | `references/mobile-web.md` |
| React Native / Expo | `references/native.md` (the gate in motion.md still applies) |
| The task needs a component (toast, dropdown, command menu, chart, drag and drop…) | `references/libraries.md` before building one by hand |

When a browser is available, walk every state you built (hover, active, loading, empty, error) and replay motion at 10% speed in the Animations panel. What feels off at 10% speed is what's subtly wrong at full speed.

## Audit

Read `references/audit.md`. Invoked as `/better-design audit`, run the full audit. Called from another skill (such as `/ship`) or run on your own after building, run the light pass. When asked to stress-test or "try the worst case", read `references/stress-test.md`.

## Never ship

| Never | Instead |
| --- | --- |
| Animation on a keyboard shortcut or 100+/day action | No animation |
| `transition: all` | Name the exact properties |
| `transform: scale(0)` entrance | `scale(0.95)` + `opacity: 0` |
| `ease-in` on a UI element | `ease-out` or a strong custom curve |
| Built-in `ease-out` on a deliberate animation | `cubic-bezier(0.23, 1, 0.32, 1)` |
| UI duration over 300ms with no reason | 150-250ms |
| `transform-origin: center` on a trigger-anchored popover | `var(--transform-origin)` (modals exempt) |
| Keyframes on toasts, toggles, rapidly-triggered elements | CSS transitions |
| Animating `width`/`height`/`margin`/`padding`/`top`/`left` | `transform` / `opacity` |
| Ungated `:hover` motion | `@media (hover: hover) and (pointer: fine)` |
| Missing `prefers-reduced-motion` | Gentler variant, not zero |
| A state change carried by motion alone | Leave a color, icon or label behind |
| Padded parent and child with the same radius | Add the padding to the outer radius |
| A border that exists only to create depth | Layered transparent `box-shadow` |
| Proportional digits on changing numbers | `tabular-nums` |
| Fixed `width` or `height` on a box holding text | `max-width`, `min-height` |
| An error that names no way to recover | Say what failed and the next step |

Sources and licenses: `NOTICE.md`.
