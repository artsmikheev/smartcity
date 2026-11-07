# React Native / Expo

Motion for React Native and Expo. The gate and purpose in `motion.md` apply first. Mobile changes three things:

1. **There is no hover.** Every affordance the web puts in hover lives in press, position, or nothing.
2. **There are two runtimes.** The React Native runtime, where React renders, and the UI runtime, where worklets run every frame. An animation that touches the RN runtime stutters the moment the app does anything else. The whole craft is keeping motion on the UI runtime.
3. **The user's finger is on the element.** Interruptibility and velocity handoff aren't polish; they're the baseline.

## Hard rules

1. **Reanimated, not core `Animated`.** Gesture Handler, never `PanResponder`.
2. **No approximated values.** Curves and spring configs come from the tables below.
3. **Reduced motion ships with the animation.**
4. **Feel is judged on a release build on the slowest device you support.** Never in Expo Go or a dev build.

## Frequency on mobile

| Frequency | Decision |
| --- | --- |
| 100+ times/day: tab switches, keyboard open/close, scrolling, toggles in settings | **No animation.** Platform default or nothing |
| Tens of times/day: press feedback, list navigation, row selection | Near-imperceptible only: under 150ms, or nothing |
| Occasional: sheets, modals, toasts, onboarding steps | Standard animation |
| Rare: success states, empty-state illustrations, celebration | The delight budget lives here |

**Tab switches never slide.** Tabs are peers, not a hierarchy. `animation: 'none'`.

## Pick the tool: cheapest that works

| Need | Tool |
| --- | --- |
| State-driven change with no gesture: press, toggle, color | **Reanimated CSS transition** (`transitionProperty`) |
| Loop, multi-stage, or plays on mount with no state change | **Reanimated CSS animation** (`animationName`) |
| Mount, unmount, list reflow | **Layout animations** (`entering`, `exiting`, `itemLayoutAnimation`) |
| Anything a finger touches, or derived from scroll | **`useSharedValue` + `Gesture` + `useAnimatedStyle`** |
| Screen to screen | **Native stack options in Expo Router.** Never hand-roll this |
| A bottom sheet that is its own screen | **`presentation: 'formSheet'`** |
| Tab bar | **`NativeTabs`** |
| Context menu, press-and-hold preview | **`Link.Menu` / `Link.Preview`** (iOS-only) |
| Header that collapses into a large title | **`headerLargeTitleEnabled`** (iOS-only) |
| Pull to refresh | **`RefreshControl`** |
| UI that tracks the keyboard | **`react-native-keyboard-controller`** |
| Swipe to reveal row actions | **`ReanimatedSwipeable`** |
| Illustration, celebration, empty state | **Lottie**, never for UI state |
| A huge animated scene, freeform drawing | **`@shopify/react-native-skia`** |

Reach for a shared value only when the value is continuous or interruptible. A press scale is a CSS transition; a drag is a shared value. Install with `npx expo install` so versions match the SDK.

## Properties

- **`transform` and `opacity` are free.** `width`, `height`, `margin`, `padding`, `flex`, `top`, `left`, `gap` re-run Yoga every frame for that node and its siblings.
- **The one exception:** an absolutely positioned element with no children (a tab pill, a progress fill) may animate `width`, which keeps the corner radius `scaleX` would smear.
- **Never `scale(0)`.** Start from `scale(0.9-0.97)` + `opacity: 0`.
- **`transform` order matters:** `[{ translateY }, { scale }]`. Keep translate first.
- **Never animate Android `elevation` or `BlurView` intensity.** Crossfade the opacity of a static layer instead.
- **Percentages work in `translate`:** `translateY('100%')` moves a sheet by its own height.
- **Text scales.** Never animate to a hardcoded height; measure with `onLayout`, or animate a transform.

## Timing or spring

**If a finger was involved, use a spring.** Reanimated's spring takes Apple's two parameters directly:

| Interaction | Config |
| --- | --- |
| Default settle, no overshoot | `{ duration: 400, dampingRatio: 1 }` |
| Reposition / snap back after a drag | `{ duration: 400, dampingRatio: 0.8, velocity }` |
| Sheet, drawer | `{ duration: 300, dampingRatio: 0.8, velocity }` |
| Must not pass a hard edge | add `overshootClamping: true` |

Without a finger, timing with these curves, never `Easing.in(...)`:

```js
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);      // strong ease-out for UI
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);  // on-screen movement
const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);    // iOS sheet curve
```

Press feedback 100-150ms, toggles and chips 150-200ms, sheets a spring at about 300ms perceived. Mobile UI animations stay under 300ms. Navigation keeps the platform's own transitions: match the platform for navigation, beat it everywhere else.

## Keep it off the JS thread

- **Never `setState` from a gesture or scroll handler.** Shared value into `useAnimatedStyle`, and React never re-renders.
- **Never `scheduleOnRN` inside `onUpdate` or a scroll handler.** `scheduleOnRN(fn, ...args)` replaces the deprecated `runOnJS(fn)(...args)`. Call it from `onEnd`, or fire once at a threshold with `useAnimatedReaction`.
- **Never read or write a shared value during render.** `.get()` / `.set()`, not `.value`, the compiler-safe form.
- **Functions called from a worklet start with `'worklet'`.**
- **Gestures are wrapped in `useMemo`**, or a mid-flight drag can drop. Layout-animation builders live at module scope.

## Press, not hover

- Feedback on press-in, commit on press-out.
- `scale: 0.97` in 100-150ms on every pressable, `Pressable` + a CSS transition. 120ms and 3% is the ceiling for something touched this often.
- 44×44pt minimum (48dp Android): add `hitSlop`, don't grow the visual. `pressRetentionOffset` so a drifting finger doesn't cancel.
- No Android ripple in a custom-designed app: the same scale on both platforms is more coherent.

## Haptics

| Moment | Call |
| --- | --- |
| A value ticks past a step (picker, slider detent, segmented control) | `Haptics.selectionAsync()` |
| Something snaps home, a sheet detent catches, a drag commits | `impactAsync(ImpactFeedbackStyle.Light)` |
| A heavy object lands, a destructive action fires | `impactAsync(ImpactFeedbackStyle.Medium)` |
| Operation succeeded or failed | `notificationAsync(Success / Error)` |

Same frame as the visual. One per user action, never on scroll or per frame. Never the only feedback.

## Gestures

- **`onStart` captures the current value** (`context.set(translateY.get())`), so grabbing mid-animation continues from where the eye last saw it.
- **Velocity decides, not distance:** project the resting point with `project()` (a `'worklet'` version of the function in `recipes.md`). A quick flick dismisses even a few pixels down.
- **Hand the velocity to the spring**, and use `overshootClamping` on dismissal.
- **Declare the axis:** `activeOffsetY([-10, 10])` on a sheet, `activeOffsetX([-10, 10])` on a row inside a scroll view, or it steals the scroll.
- **Rubber-band** past the top instead of stopping hard.
- Derive the backdrop opacity from the same shared value with `interpolate(..., Extrapolation.CLAMP)`.

## Recipes that matter

- **Collapsing header:** never animate the header's `height`. Fixed container, translate and fade the content inside with `interpolate` and `Extrapolation.CLAMP`.
- **List entrances:** stagger 30-80ms with `FadeInDown.duration(250).delay(index * 40)` memoized per row. **Never put `entering` on a row inside `FlatList` or `FlashList`:** recycled rows re-fire it while scrolling.
- **Keyboard:** `useReanimatedKeyboardAnimation` under a root `KeyboardProvider`. Never `Keyboard.addListener` plus a timing animation.
- **Tab indicator:** measure once with `onLayout`, animate `translateX` and `width` with `EASE_IN_OUT` over 250ms. Fire `selectionAsync()` on the press, not when the pill lands.
- **Toast:** enter 300ms, exit about 20% faster, same edge, offset by the safe-area inset.

## Screen transitions

| Navigation | Option |
| --- | --- |
| Deeper into a hierarchy | `animation: 'default'` |
| A self-contained task the user can abandon | `presentation: 'modal'` |
| A short interruption: picker, filter, share | `presentation: 'formSheet'` with detents |
| Between tabs | `animation: 'none'` |
| Reduced motion | `animation: 'fade'` |

Set `animationMatchesGesture: true` whenever you set a custom `animation`. Android caps form-sheet detents at three, `sheetGrabberVisible` is iOS-only, and `fitToContents` needs explicitly sized content.

## Setup that silently breaks motion

- `GestureHandlerRootView` wraps the app once, or gestures do nothing with no error.
- Reanimated 4 requires the New Architecture.
- On ProMotion iPhones, check `CADisableMinimumFrameDurationOnPhone` is set, then the frame budget is 8ms.

## Reduced motion

`useReducedMotion()` or `reduceMotion: ReduceMotion.System`. Keep opacity and color changes that explain a state; drop translation, scale, parallax and overshoot. Screen transitions become `fade`.

## Output

Write the code. Then the gate result, the ingredients (tool, properties, spring or curve, thread) and what to feel-check on device: flick it, interrupt it mid-flight, reverse it, run it on the slowest Android you have.
