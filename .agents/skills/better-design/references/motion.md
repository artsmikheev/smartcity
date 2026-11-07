# Motion

Turn a request for motion into an implementation that would survive a strict review. Two failure modes, and the first is worse:

1. **Animating something that shouldn't animate.** The gate below exists to produce zero lines of code sometimes. That's a success, not a dodge.
2. **Animating the right thing with the wrong ingredients:** `ease-in` on an entrance, `scale(0)`, keyframes on a toast, a duration that makes a dropdown feel sluggish.

Run the sequence in order. Steps 1 and 2 gate everything. Don't reach for a curve before you know whether it animates at all.

## 1. Should this animate at all?

| Frequency | Decision |
| --- | --- |
| 100+ times/day (keyboard shortcuts, command palette toggle) | **No animation. Ever.** Stop here. |
| Tens of times/day (hover effects, list navigation) | Near-imperceptible only: fast and subtle, or nothing |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare / first-time (onboarding, success, celebration) | The delight budget lives here |

**Keyboard-initiated actions are a disqualifier, not a judgment call.** Raycast has no open/close animation. That is correct for something opened hundreds of times a day.

Repeated interactions such as keystrokes, row hovers and tab switches get instant feedback, or a transition of `150ms` or less on `opacity` or `background-color`.

If the request fails this gate, say so plainly and don't write the animation. Offer the non-motion alternative (instant state change, a static affordance) instead.

## 2. What is the purpose?

Name it in one of these words before continuing:

- **Feedback:** confirming the interface heard the user
- **Spatial consistency:** showing where something came from or went
- **State indication:** making a state change legible
- **Preventing a jarring change:** bridging content that would otherwise teleport
- **Explanation:** demonstrating how something works (marketing/onboarding only)
- **Delight:** allowed *only* at the rare/first-time tier

Can't name it? Don't build it. "It looks cool" on a frequently-seen element is a reason to stop.

Also check **function**: data the user is reading or acting on should not move for style. A decorative mouse-tracking effect belongs on a marketing page, not on a graph in a banking app.

Motion is never the only feedback channel. Every animated state change also leaves a static cue in the form of a color, icon or label.

## 3. Pick the tool: cheapest that works

| Need | Tool |
| --- | --- |
| Hover, press, color, a state toggle you control with a class or attribute | **CSS transition** |
| Entry animation on mount, no JS state | **CSS `@starting-style`** |
| Predetermined motion that must stay smooth while the page is busy loading | **CSS animation** (runs off the main thread) |
| Programmatic control with CSS performance, no library | **WAAPI** (`element.animate()`) |
| Springs, layout animations, exit animations, gesture-driven values | **Motion** (`motion.dev`) |

CSS for simple motion and anything that plays while the page is busy; Motion for complex, interruptible, gesture-driven motion. Don't install a motion library for a fade. If the task needs a *component* rather than an animation (a toast, a drawer, a command menu, a dropdown), read `libraries.md`.

## 4. Pick the properties

- **`transform` and `opacity` only.** They skip layout and paint and run on the GPU. `width`/`height`/`margin`/`padding`/`top`/`left` trigger all three. (`clip-path` is the sanctioned fourth. `height` is tolerated only for accordions, where there's no transform equivalent.)
- **Name the exact properties**, as in `transition-property: scale, opacity`, never `all`.
- **Never `scale(0)`.** Start from `scale(0.9-0.97)` + `opacity: 0`. Nothing in the real world appears from nothing.
- **`transform-origin` at the trigger** for popovers, dropdowns, menus, tooltips: `var(--transform-origin)` in Base UI, `var(--radix-popover-content-transform-origin)` in Radix. **Modals are exempt**; they're not anchored to a trigger, so they stay centered.
- **Percentages in `translate()`** are relative to the element's own size. `translateY(100%)` moves by its own height whatever the content. Prefer over hardcoded pixels.
- **In Motion, use the full transform string** when the motion has to survive a busy main thread. See `performance.md`.

## 5. Easing and duration, or a spring

**Easing**, in decision order:

| Situation | Easing |
| --- | --- |
| Entering or exiting | `ease-out` |
| Moving / morphing on screen | `ease-in-out` |
| Hover / color change | `ease` |
| Constant motion (marquee, progress) | `linear` |
| Default | `ease-out` |

**Never `ease-in` on UI.** It starts slow, delaying the exact moment the user is watching. `ease-out` at 200ms *feels* faster than `ease-in` at 200ms.

Built-in CSS easings are too weak. Use these:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* strong ease-out for UI */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* strong ease-in-out for on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-like drawer curve (Ionic) */
```

Need a curve that isn't here? Take it from [easing.dev](https://easing.dev/) or [easings.co](https://easings.co/). Don't hand-roll one.

**Duration:**

| Element | Duration |
| --- | --- |
| Button press feedback | 100-160ms |
| Tooltips, small popovers | 125-200ms |
| Dropdowns, selects | 150-250ms |
| Modals, drawers | 200-500ms |
| Marketing / explanatory | Can be longer |

**UI animations stay under 300ms.** A 180ms dropdown feels more responsive than a 400ms one. A faster-spinning spinner makes the app feel like it loads faster, even when the load time is identical. Instant tooltips after the first one is open make the whole toolbar feel faster.

**Reach for a spring instead** when the motion is drag with momentum, an element that should feel alive (Dynamic Island), a gesture the user can interrupt or reverse, or decorative mouse-tracking:

```js
{ type: "spring", duration: 0.5, bounce: 0.2 }           // Apple-style, easier to reason about
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }  // traditional physics, more control
```

Keep bounce at 0.1-0.3, and avoid bounce in most UI. Reserve it for drag-to-dismiss and playful interactions. Start most UI critically damped (`bounce: 0`), graceful and non-distracting. Add bounce **only when the gesture itself carried momentum** (a flick, a throw, a drag release). Overshoot on a menu that just faded in feels wrong; overshoot on a card you flicked feels right.

Apple's two designer parameters, with the values Apple ships:

| Interaction | Damping | Response |
| --- | --- | --- |
| Move / reposition (e.g. PiP) | `1.0` | `0.4` |
| Rotation | `0.8` | `0.4` |
| Drawer / sheet | `0.8` | `0.3` |

Response is not "duration": a spring has no fixed duration; its settle time emerges from the parameters. Motion's `bounce` + `duration` API maps closely to damping + response.

Tying visual changes directly to mouse position feels artificial because it lacks motion. Interpolate with `useSpring` instead, only when the motion is decorative.

**Cohesion.** Match motion to the component's personality: playful can be bouncier, a professional dashboard stays crisp and fast. Sonner feels right partly because easing, duration, design and name are in harmony: slightly slower, `ease` rather than `ease-out`, to feel elegant.

## 6. Interruption and exit

- **Transitions, not keyframes, for anything triggered rapidly:** toasts, toggles, anything a user can fire twice in a second. Transitions retarget from the current value; keyframes restart from zero. Reserve keyframes for sequences that run once.
- **Springs for gestures**, because they carry velocity through an interruption.
- **Never lock out input during a transition.** A closing modal the user grabs again should follow the finger, not finish closing first.
- **Always animate from the presentation (current) value, never the target value.** Starting from the logical value causes a visible jump.
- **Exit the way it entered.** A toast that slides in from the bottom leaves through the bottom. Anchor interactions to their source. Mirror the easing on reversible transitions.
- **Exits are shorter and smaller than enters.** The user's focus is moving to the next thing. Slide fully out only where the destination carries meaning, such as a drawer closing or a card returning to a list. Remove the element instantly where motion adds no information, the interaction repeats frequently, or reduced motion is requested.
- **Asymmetric timing where the user is deciding.** Slow on the deliberate phase (a hold-to-confirm press: 2s linear), snappy on the system response (release: 200ms ease-out).
- **Skip state animations on first render.** `initial={false}` on an `AnimatePresence` that wraps a state swap, never around an intentional entrance such as a staggered hero.
- **Stagger group entrances** 30-80ms between items. Longer delays feel slow. Stagger is decorative: never block interaction while it plays. Never stagger routine interactions.

## 7. Physical correctness (Apple's fluid interfaces)

An interface feels alive when motion starts from the current on-screen value, inherits the user's velocity, projects momentum forward, and can be grabbed and reversed at any instant.

- **Respond on pointer-down, not on release.** Feedback must be continuous *during* the interaction, not just at the end. For a drag, slider or drawer, update the UI 1:1 with the pointer the whole way through.
- **Direct manipulation.** A dragged element stays glued to the finger and respects the offset from where the user grabbed it.
- **Velocity handoff.** When a gesture ends, the animation continues at the finger's exact velocity, so there's no visible seam between dragging and animating.
- **Momentum projection.** Don't snap to the nearest boundary from the release point. Project the resting position from velocity, then snap to the target nearest that projected point (function in `recipes.md`).
- **Hint in the direction of the gesture.** Intermediate frames telegraph where things are going.
- **Rubber-banding.** At an edge, resist progressively instead of stopping hard.
- **Decompose 2D motion into independent X and Y springs.**
- **Materialize, don't just fade.** For glass or blur surfaces, animate blur radius and scale together on enter and exit.

## 8. Reduced motion and pointer gating

Ships with the animation, every time.

- Reduced motion means **fewer and gentler**, not zero. Keep opacity and color changes that aid comprehension; replace slides, scales and springs with opacity cross-fades; kill parallax and autoplay. Drop elastic and overshoot.
- The opacity fade runs for everyone, and movement, scale and blur join it only under `prefers-reduced-motion: no-preference` (recipe in `recipes.md`).
- In Motion, `<MotionConfig reducedMotion="user">` turns off transform and layout animations and keeps opacity. Blur still runs there, so branch on `useReducedMotion()` where a recipe animates `filter`.
- Gate hover motion behind `@media (hover: hover) and (pointer: fine)`. Touch fires false hovers on tap.
- Anything moving, blinking or updating on its own for more than 5 seconds needs a visible pause or stop control, muted looping hero videos included.
- Avoid full-viewport moving backgrounds, slow looping oscillations and abrupt brightness jumps (ease dark/light theme changes).

## 9. The delight budget

Only at the rare tier or on marketing surfaces. One orchestrated moment, one page-load sequence or one reveal, lands better than scattered effects. Fade-and-slide-up entrances on each section and hover transitions on every card read as generated.

Easing has personality: elastic and bounce never belong in professional interfaces, frequently repeated interactions, error states or anywhere users need to complete tasks quickly. Techniques for these moments:

- **`linear()`** builds bounce, elastic and spring curves in pure CSS. Generate curves with Jake Archibald's [linear() generator](https://linear-easing-generator.netlify.app/).
- **`@property`** gives a custom property a type, so it interpolates instead of swapping. Typed `--x` and `--y` animated in separate keyframes produce curved paths a single transform can't.
- **`animation-fill-mode: backwards`** prevents the pre-animation flash in delayed fade-in sequences.
- **Negative delays** (`animation-delay: calc(var(--index) * -0.2s)`) make staggered continuous loops appear already in progress.
- **Scroll-driven animations** are tied to scroll speed. Use a scroll-driven trigger that flips a custom property, then a duration-based animation activated by a style query, so timing no longer depends on how fast the user scrolls. Fall back to `IntersectionObserver` where `animation-timeline` is unsupported.
- **3D:** `rotateX/Y` with `transform-style: preserve-3d` and `perspective` give depth, orbits and flips without JavaScript.

## 10. Feel-check and output

Write the code. Then, in at most a few lines:

- **The gate result:** frequency tier and the named purpose. If something in the request was rejected, say which and why.
- **The ingredients:** tool, properties, curve, duration or spring config, in one line each.
- **What to feel-check:** play it at 2-5x duration or in the DevTools animation inspector, step it frame by frame, test gestures on a real device, look again the next day with fresh eyes. Check that colors crossfade cleanly, easing doesn't stop abruptly, `transform-origin` is right and coordinated properties stay in sync. The opacity/height balance in an entering list is trial and error; there's no formula.
