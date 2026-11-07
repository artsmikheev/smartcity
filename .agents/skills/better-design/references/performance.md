# Animation performance

Make motion land every frame. The question here is never "does it look right?" but "does each frame finish in time?". Imagine Sonner running at 30fps: same easing, same durations. Nobody would have cared.

Two failure modes, and the first is worse:

1. **"It's smooth on my machine."** A fast laptop hides almost every problem here. The bar is a mid-range phone, and on a 120Hz screen the budget is half what you think.
2. **Sprinkling `will-change` and calling it fixed.** It's the last step, not the first. Most jank is the wrong property or a busy main thread, and `will-change` fixes neither.

Name the cause before changing code. Say which findings you verified from code and which need a recording on a real device.

## Symptom table

| Problem | Solution |
| --- | --- |
| Animation stutters | Animate `transform`/`opacity`, not `width`/`height`/`top`/`margin` |
| Shadow animation is choppy | `filter: drop-shadow()` |
| Jank only during navigation or loading | Move the animation to CSS or WAAPI so it runs off the main thread |
| Motion `x`/`y` drops frames | Animate the full `transform` string |
| Hand-rolled animation drops frames in React | Write to `ref.current.style`, not state |
| Drag gets laggier as the list grows | Stop animating an inherited CSS variable; set `transform` directly |
| Blur transition lags (especially Safari) | Keep animated `blur()` under 20px |
| Unexpected properties animate | Replace `transition: all` with explicit properties |
| Element shifts 1px when motion starts or ends | `will-change: transform`, only once you see it |
| Long list scrolls slowly | Virtualize: only render what's visible |

## The frame budget

60fps gives the browser **16.7ms** per frame. On a 120Hz screen, now most phones and many laptops, it's **8ms**. Design against the smaller number. A layout recalculation on a complex page can take over 100ms: not one missed frame, a dozen.

## What you animate

| Tier | Properties | Cost |
| --- | --- | --- |
| Composite only | `transform`, `opacity`, and in current Chrome/Firefox also `filter`, `clip-path`, `background-color` | Cheapest |
| Paint + composite | `box-shadow`, `border-radius`, `color` | A redraw every frame |
| Layout + paint + composite | `width`, `height`, `padding`, `margin`, `top`, `left`, `border-width` | Most expensive. One growing element can move everything around it |

**Swapping down a tier:**

| Instead of | Animate |
| --- | --- |
| `width` / `height` / `padding` to grow or shrink | `scale()` |
| `top` / `left` / `margin` to move | `translate()` |
| `display` / `visibility` swaps | `opacity` |
| `box-shadow` | `filter: drop-shadow(…)` |

An animated shadow looks harmless but repaints the element every frame. A `padding` animation and a `scale()` animation look the same, and only one of them can't regress on a slower device. Layout properties also move the wrong things: animating a sidebar's `margin-left` re-lays-out the content beside it 60 times a second; `translateX` doesn't.

Never `transition: all`: it animates whatever changes next, including layout properties nobody intended to animate. In Tailwind 4, `transition-transform` covers `transform, translate, scale, rotate`, in Tailwind 3 only `transform`. Mixing transform and other properties takes the bracket syntax, as in `transition-[scale,opacity,filter]`.

## Where it runs

| Driver | Thread |
| --- | --- |
| JS + `requestAnimationFrame` (GSAP, `motion/react` components) | Main thread, always |
| Web Animations API (`element.animate()`, Motion's `animate()`) | Can be hardware-accelerated |
| CSS transitions and keyframes | Can be hardware-accelerated |

The pattern to watch for is motion that runs while the page is doing heavy work: page transitions, tab indicators during navigation, anything alongside data fetching or hydration. Vercel's dashboard animated its active tab indicator with a shared layout animation while the next page loaded, and dropped frames. Moving it to a CSS animation fixed it.

Motion can be accelerated, but only when the transform is a string:

```jsx
<motion.div animate={{ x: 100 }} />                          // main thread, can jank
<motion.div animate={{ transform: "translateX(100px)" }} />  // hardware-accelerated
```

The `x`, `y`, `scale`, `rotate` shorthands are implemented with CSS variables, and animated CSS variables aren't accelerated. Keep them by default and switch to the string form when the animation has to survive a busy main thread.

Acceleration is progressive enhancement. Chrome historically didn't accelerate percentage-based transforms; that's not a reason to stop using `translateY(100%)`. Correctness beats a best-effort optimization.

## React: don't animate through state

```jsx
// Drops frames: one re-render per frame
setY(nextY);

// Smooth: no re-render
ref.current.style.transform = `translateY(${nextY}px)`;
// or with a motion value: y.set(nextY)
```

Look for state updates inside `requestAnimationFrame`, `pointermove`, `scroll` or drag handlers.

## Two traps that look correct

**Inherited CSS variables.** Vaul's drag got laggy once a drawer held more than about 20 items. The drag distance was written to a CSS variable that `translateY()` read. CSS variables inherit, so changing one on a parent recalculates styles for every child, every frame. Set `transform` on the element directly.

**Blur.** `filter: blur()` gets expensive fast, especially in Safari. Keep animated blur under 20px; 2-5px is enough to soften a crossfade.

## will-change

Add it only once you see a first-frame shift or measured dropped frames, and name the property you animate: `scale` for `scale`, `transform` for `transform`. Limit it to transform properties, `opacity` and `filter`, never `all`, never on `*` or large containers. Every promoted layer costs GPU memory. Where it earns its place is an expensive paint, like a large blurred element: promote it and keep the layer small.

`will-change` on a transform property or `filter` makes the element the containing block for its `position: fixed` descendants, so a fixed modal or tooltip inside it stops tracking the viewport. It also creates a stacking context, which can reorder `z-index` against siblings.

## Diagnose in this order

1. Which properties animate? Layout properties first, then `box-shadow` and `border-radius`.
2. Does the jank coincide with the page being busy? Move the animation to CSS or WAAPI.
3. Is React re-rendering per frame?
4. Does it get worse as content grows? An inherited CSS variable, or too many nodes animating at once.
5. Is a CSS variable animated at all, directly or through Motion's shorthands?
6. Any animated `blur()` above 20px?
7. Still shifting or stuttering? Now add `will-change` to the animating element.

Confirm with a recording, not by feel: the Performance panel for dropped frames and long tasks, the Animations panel to slow motion down. Profile on a real mid-range phone over remote debugging. CPU throttling models a slow CPU, not a weak GPU.
