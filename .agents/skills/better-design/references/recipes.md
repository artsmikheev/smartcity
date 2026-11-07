# Recipes

Ready-to-build implementations for the cases that come up most. Start from the recipe, then adapt; don't rebuild from scratch. Curves are the `--ease-out`, `--ease-in-out` and `--ease-drawer` tokens from `motion.md`.

## Button press

Any pressable element. Instant feedback that the interface heard the user.

```css
.button {
  transition: transform 160ms var(--ease-out);
}

.button:not(:disabled):active {
  transform: scale(0.97);
}
```

```tsx
// Tailwind
<button className="transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] enabled:active:scale-[0.97]">

// Motion
<motion.button whileTap={disabled ? undefined : { scale: 0.97 }} disabled={disabled}>
```

`scale()` scales children too: the label and icons come along, which is what makes it read as a physical press. Keep it subtle (0.95-0.98); never below 0.95. A disabled button never scales. Give the button an opt-out where the motion would distract, through the component's variant API or a `static` prop:

```tsx
const tapScale = "enabled:active:scale-[0.97]";

function Button({ static: isStatic, className, children, ...props }) {
  return (
    <button
      className={cn("transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]", !isStatic && tapScale, className)}
      {...props}
    >
      {children}
    </button>
  );
}
```

No hover gating needed here: `:active` is a real press on touch. Gate any `:hover` styling separately.

## Dropdown, popover, menu, select

Scales out of its trigger, not out of thin air.

```css
.popover {
  transform-origin: var(--transform-origin); /* Base UI supplies this */
  transition:
    opacity 200ms var(--ease-out),
    transform 200ms var(--ease-out);
}

.popover[data-starting-style],
.popover[data-ending-style] {
  opacity: 0;
  transform: scale(0.95);
}
```

The `transform-origin` is the whole point: the panel should look like it came out of the thing you clicked.

## Tooltip

```css
.tooltip {
  transform-origin: var(--transform-origin);
  transition:
    transform 125ms var(--ease-out),
    opacity 125ms var(--ease-out);
}

.tooltip[data-starting-style],
.tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}

/* Once one tooltip is open, neighbours open instantly */
.tooltip[data-instant] {
  transition-duration: 0ms;
}
```

The initial delay prevents accidental activation. After that, skipping both the delay and the animation makes the whole toolbar feel faster.

## Modal

The one popover that stays centered.

```css
.modal {
  transform-origin: center; /* exempt, not anchored to a trigger */
  transition:
    opacity 250ms var(--ease-out),
    transform 250ms var(--ease-out);
}

.modal[data-starting-style],
.modal[data-ending-style] {
  opacity: 0;
  transform: scale(0.96);
}

.backdrop {
  transition: opacity 250ms var(--ease-out);
}
```

Animate the backdrop's opacity alongside it so they read as one surface.

## Entering from display: none

A popover, dialog or element toggled from `display: none` has no previous style to transition from. `@starting-style` supplies one, and `transition-behavior: allow-discrete` keeps it rendered through the exit. The open state's duration applies on enter and the closed state's on exit.

```css
[popover] {
  opacity: 0;
  transform: scale(0.95);
  transition-property: opacity, transform, display, overlay;
  transition-duration: 150ms;
  transition-timing-function: var(--ease-out);
  transition-behavior: allow-discrete;
}

[popover]:popover-open {
  opacity: 1;
  transform: scale(1);
  transition-duration: 200ms;
}

@starting-style {
  [popover]:popover-open {
    opacity: 0;
    transform: scale(0.95);
  }
}
```

`@starting-style` and discrete `display` transitions are Baseline 2024. `overlay` is Chromium only, and browsers without support show and hide instantly.

## Drawer / sheet

```css
.drawer {
  transform: translateY(0);
  transition: transform 500ms var(--ease-drawer);
}

.drawer[data-closed] {
  transform: translateY(100%);
}
```

This is how Vaul hides a drawer before animating it in. Add drag and it becomes a gesture problem: see **Drag to dismiss**.

## Toast

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 400ms ease,
    transform 400ms ease;

  @starting-style {
    opacity: 0;
    transform: translateY(100%);
  }
}
```

- `ease` rather than `ease-out`, slightly slower than typical UI: Sonner reads as elegant partly because its motion is tuned to the component's personality rather than to the generic UI budget.
- If `@starting-style` isn't available, fall back to the mount flag: `useEffect(() => { setMounted(true); }, [])` and `<div data-mounted={mounted}>`.

When toasts stack and the list reflows, the opacity change has to work against the height change. There's no formula for that pair: adjust until it feels right, then check it again the next day.

## Accordion / collapse

```css
.content {
  overflow: hidden;
  transition:
    height 200ms var(--ease-out),
    opacity 200ms var(--ease-out);
}
```

Keep it short: this is one of the few animations that costs layout on every frame, so a long duration is expensive as well as sluggish. Measure the content height in JS (or use a headless primitive that supplies it) rather than animating to `auto`.

## Staged entrance

For an infrequent entrance where sequence communicates hierarchy: a view's first load, a success state, an empty state. Split the content into semantic chunks such as title, description and actions, and stagger them. A short display headline can split into words.

```tsx
const item = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
  },
};

<motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
  <motion.h1 variants={item}>Welcome</motion.h1>
  <motion.p variants={item}>A description of the page.</motion.p>
  <motion.div variants={item}><Button>Create a project</Button></motion.div>
</motion.div>
```

CSS version. The hidden state lives in the `from` keyframe, so an item whose animation never runs stays visible. Reduced motion keeps only the opacity keyframe.

```css
.stagger-item {
  animation: fade-in 300ms var(--ease-out) both;
}

@media (prefers-reduced-motion: no-preference) {
  .stagger-item {
    animation-name: fade-in-up;
  }
}

.stagger-item:nth-child(2) { animation-delay: 60ms; }
.stagger-item:nth-child(3) { animation-delay: 120ms; }

@keyframes fade-in {
  from { opacity: 0; }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(8px);
    filter: blur(4px);
  }
}
```

For a list or grid the user sees occasionally, the same shape with 30-80ms between items. Not for a list they scroll past all day.

## Exit

Subtle exit, the default: a small fixed offset indicates direction without drama.

```tsx
<motion.div
  exit={{
    opacity: 0,
    y: -12,
    filter: "blur(4px)",
    transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] },
  }}
/>
```

Full exit, only where the destination carries meaning (a card returning to a list, a drawer closing):

```tsx
<motion.div exit={{ opacity: 0, x: "-100%", transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } }} />
```

Never the full container height with a scale-down. Sometimes the correct exit is `display: none`, at once.

## Contextual icon swap

Where an icon swaps on an infrequent state change, such as play to pause, like to liked or copy to copied, cross-fade it. Always use exactly these values: scale `0.25` to `1`, opacity `0` to `1`, blur `4px` to `0px`, spring with bounce `0`.

```tsx
import { AnimatePresence, motion } from "motion/react";

function IconButton({ isActive, icon: Icon }) {
  return (
    <button>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={isActive ? "active" : "inactive"}
          initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        >
          <Icon />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
```

Import from `"motion/react"` when `motion` is installed, or `"framer-motion"` when that is. Where both exist, follow the imports the component or its nearest peers already use. Where neither is present, keep both icons in the DOM and never add a dependency just for icon transitions:

```tsx
const layer = cn(
  "[grid-area:1/1] transition-[opacity,filter,scale] duration-300",
  "ease-[cubic-bezier(0.2,0,0,1)]",
  "motion-reduce:scale-100 motion-reduce:blur-[0px]"
);
const shown = "scale-100 opacity-100 blur-[0px]";
const hidden = "scale-[0.25] opacity-0 blur-[4px]";

function IconButton({ isActive, ActiveIcon, InactiveIcon }) {
  return (
    <button>
      <span className="grid place-items-center">
        <span className={cn(layer, isActive ? shown : hidden)}><ActiveIcon /></span>
        <span className={cn(layer, isActive ? hidden : shown)}><InactiveIcon /></span>
      </span>
    </button>
  );
}
```

Tailwind 4's `scale-*` utilities write the `scale` property; Tailwind 3's write `transform`, so name `transform` in the transition instead.

| Animate | Don't animate |
| --- | --- |
| Infrequent state swaps (play to pause, like to liked, copy to copied) | Hover-revealed actions in list rows |
| Icons in a toolbar that appears on selection | Tab and navigation icon swaps |
| Loading and success indicators | Decorative or always-visible icons |

## Hold to confirm

For destructive actions where a plain click is too easy to fire by accident.

```css
.overlay {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms var(--ease-out); /* release: snappy */
}

.button:active .overlay {
  clip-path: inset(0 0 0 0);
  transition: clip-path 2s linear;             /* press: slow and deliberate */
}

.button:active {
  transform: scale(0.97);
}
```

`linear` is correct here: the fill is a progress indicator, and progress shouldn't ease.

## Tab indicator with a color transition

Timing individual color transitions across a tab list never quite lands. Duplicate the tab list, style the copy as the active state (different background, different text color), clip the copy so only the active tab shows, and animate the clip:

```css
.tabs-active-copy {
  clip-path: inset(0 60% 0 20%); /* driven by the active tab's position */
  transition: clip-path 250ms var(--ease-in-out);
}
```

The text and background change together, in perfect sync, because they're one element being revealed rather than two colors being interpolated.

## Scroll reveal

Marketing surfaces only. Don't do this to functional UI a user visits daily.

```css
.reveal {
  clip-path: inset(0 0 100% 0);
  transition: clip-path 600ms var(--ease-in-out);
}

.reveal[data-visible] {
  clip-path: inset(0 0 0 0);
}
```

Trigger with `IntersectionObserver`, or Motion's `useInView` with `{ once: true, margin: "-100px" }`. Fire it once: re-animating on every scroll-by is an interface fighting its reader. Never leave content hidden if the script fails.

## Drag to dismiss

Springs, not durations, because the user can reverse mid-motion.

```js
// Dismiss on a flick, not just on distance
const timeTaken = Date.now() - dragStartTime.current;
const velocity = Math.abs(swipeAmount) / timeTaken;

if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
  dismiss();
}

// Set transform on the dragged element directly.
// Driving it through a CSS variable on the parent recalcs styles for every child.
element.style.transform = `translateY(${distance}px)`;
```

- **Pointer capture** once the drag starts (`setPointerCapture`), so it continues when the pointer leaves the element's bounds.
- **Multi-touch protection:** `if (isDragging) return` on new touch points, or switching fingers mid-drag makes the element jump.
- **Damping past boundaries:** dragging beyond a natural edge moves the element less the further it goes.
- **Friction, not a wall:** allow the over-drag with rising resistance rather than refusing it.
- **Hysteresis:** require about 10px of movement before committing to a direction, then track 1:1.

Settle with a spring so an interrupted drag keeps its velocity: `{ type: "spring", duration: 0.5, bounce: 0.2 }`, and pass the release velocity.

```js
// Where the pointer would come to rest if it kept decelerating.
// Apple's exponential-decay form, not the v²/2a from physics class.
// decelerationRate ≈ 0.998 for normal scroll feel; 0.99 for snappier
function project(initialVelocity /* px/s */, decelerationRate = 0.998) {
  return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
}

// The further past the bound, the less the element follows
function rubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

const target = nearestSnapPoint(currentPosition + project(releaseVelocity));
```

Decide reverse versus commit with the velocity **sign** at release, not the position.

## Masking a crossfade that won't settle

When two states overlap visibly and no amount of easing or duration tuning fixes it, blur the seam:

```css
.content {
  transition:
    filter 200ms ease,
    opacity 200ms ease;
}

.content.transitioning {
  filter: blur(2px);
  opacity: 0.7;
}
```

Without blur the eye reads two distinct objects swapping. Blur blends them into one perceived transformation. Keep it under 20px: heavy blur is expensive, especially in Safari.

## Reduced-motion fallback

The opacity fade runs for everyone, and movement, scale and blur join it only without the preference:

```css
.panel {
  transition: opacity 150ms var(--ease-out);
}

@media (prefers-reduced-motion: no-preference) {
  .panel {
    transition-property: opacity, transform, filter;
    transition-duration: 200ms;
  }
}
```

In Tailwind, prefix movement, scale and blur utilities with `motion-safe:`.

## Suppress transitions on theme switch

Otherwise every color transition fires at once and the switch smears. `next-themes` ships this as `disableTransitionOnChange`. Without it, inject a stylesheet that turns off every transition, force a style flush, then remove it after the next frame:

```tsx
const style = document.createElement("style");
style.append(document.createTextNode("*,*::before,*::after{transition:none !important}"));
document.head.append(style);
// change the theme here
void document.body.offsetHeight; // forces a synchronous style flush
requestAnimationFrame(() => {
  requestAnimationFrame(() => style.remove());
});
```

For an OS-level change, run the same steps in a `matchMedia("(prefers-color-scheme: dark)")` change listener.

## Programmatic, without a library

When the motion needs JS control but not a dependency, WAAPI gives you CSS-grade performance:

```js
element.animate(
  [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
  { duration: 1000, fill: 'forwards', easing: 'cubic-bezier(0.77, 0, 0.175, 1)' }
);
```

Hardware-accelerated, interruptible, no bundle cost.

## Other clip-path uses

`clip-path: inset(t r b l)` eats into the element from each side. Comparison sliders: overlay two images, clip the top one with `inset(0 50% 0 0)` and adjust the right inset with the drag position. No extra DOM, fully hardware-accelerated.
