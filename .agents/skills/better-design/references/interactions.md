# Interactions

How controls, forms, overlays, gestures and states behave. When unsure, take the platform default over a custom rebuild, and remove ARIA rather than add it.

## Respond on press

- Feedback on pointer-down, commit on release. A web button that only changes on `click` responds when the finger *leaves*, which reads as lag even at 0ms. Style `:active`; in JavaScript listen to `pointerdown`.
- Be vigilant about every latency: debounces, artificial timers, transition waits. Anything on the input path that isn't essential is a regression.
- Tap: highlight on touch-down, commit on touch-up, allow cancel by dragging away and back.

## Native elements first

`<button>` for actions, `<a href>` for navigation, never `<div onClick>`. A real link supports Cmd/Ctrl/middle-click, right-click to copy and Enter. A "button" that navigates is a styled `<a>`, and a "link" that performs an action is a styled `<button>`. If it looks clickable, it is clickable; if it is clickable, it looks it.

Don't hand-roll a dropdown, dialog or toast with manual focus handling: a headless primitive handles focus trapping and dismissal (`libraries.md`).

## Keyboard

Every pointer interaction needs a keyboard path. Escape closes overlays, arrow keys move within composite widgets, Tab moves between widgets, Enter and Space activate buttons. Use only `tabindex="0"` and `tabindex="-1"`; positive values break the order.

Prefer `<dialog>` opened with `showModal()`, which makes the background inert and handles Escape. Move focus inside on open and return it to the trigger on close. Client-side route changes reset nothing: update `document.title` and move focus to the new view's `<h1>` or `<main>`.

## Hit areas

Prefer a 44×44px hit area for touch and at least 40×40px in dense desktop interfaces. The visible element can stay small; extend the hit area with a pseudo-element on the wrapper or the `<button>`, never on the `<input>`:

```tsx
<button
  aria-label="Mark done"
  className="relative size-5 after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-1/2"
>
  <CheckIcon aria-hidden="true" />
</button>
```

Never let two hit areas overlap: shrink the pseudo-element to the largest size that does not collide. Give decorative layers (a scrim, a glow, a full-bleed `::after`) `pointer-events: none`, so they never swallow the clicks meant for the control beneath. Anything that looks clickable must be clickable across its whole visual extent.

## Names and meaning

- Icon-only buttons need an accessible name that names the action, "Delete project", never the glyph. Mark the icon `aria-hidden="true"`. Visible label text must appear in the accessible name.
- Never put `aria-hidden` on or above a focusable element.
- Status needs a redundant cue: an icon, text or an underline alongside the color.
- Decorative images get `alt=""`. Informative images describe the meaning, functional images describe the action. A missing `alt` is worse than an empty one.

## Disabled means unavailable

Use native `disabled` when a control is genuinely unavailable. A natively disabled control never shows its tooltip to keyboard or touch users, so put the reason in visible text beside it, or use `aria-disabled="true"` to keep it focusable, then block activation in the handler and style the state explicitly. Never disable submit to gate validation.

## Forms

- Every input gets a `<label for>` or a wrapping `<label>`. A placeholder is never a label. Label and control share one hit target, with no dead zone between a checkbox and its text.
- A valid `autocomplete` token, a descriptive `name`, a real `<form>`, so password managers and 2FA autofill work. The right `type` and `inputmode`: `type="text" inputmode="numeric"` for codes and card numbers, `inputmode="decimal"` for money, `type="number"` only for true quantities. `spellcheck="false"` on emails, codes and usernames. `enterkeyhint` so the return key says what it does.
- Never block paste. Accept free text and validate after; never filter characters as the user types. Trim values before validating.
- Validate on submit. Mark failing fields `aria-invalid="true"`, point `aria-describedby` at the inline error beside the field and focus the first invalid field. Never a red border alone.
- Keep submit enabled until the request starts. While it runs, show a spinner *beside the original label*, mark it `aria-disabled="true"` and ignore repeat clicks. Native `disabled` on the focused button drops focus to `<body>`.
- `Enter` submits; in a `<textarea>`, `Cmd/Ctrl+Enter` submits.
- Warn on unsaved changes before navigation. A re-render or hydration must never reset a typed value or move focus out of a field: inputs with `value` need `onChange`, or use `defaultValue`.
- Inputs render at 16px or more on mobile (`typography.md`).

## Feedback

- Optimistic UI where failure is rare and reversible; reconcile on response, roll back or offer undo on failure.
- Mutations should respond in under 500ms. Beyond that, show progress.
- Undo beats confirmation for frequent reversible actions; confirm irreversible ones (`copy.md`).
- Announce what isn't tied to a control through a polite live region rendered empty from the start, `role="status"`, then update its text. Field errors go through `aria-describedby`. `role="alert"` only for urgent, untied errors. Never move focus to a toast.
- A toast carrying an action, an error or information the user may need stays until dismissed. Where a toast must time out, give it at least 5 seconds and pause the timer while it is hovered or focused.

## States

Design every state: loading, empty, error, partial, disabled, very long content.

- Skeletons mirror the final layout, so nothing shifts when data arrives.
- No dead ends: every error or empty state offers a next step.
- Images declare their dimensions or `aspect-ratio`, so nothing shifts when they load.
- Stress the component with worst-case data before calling it done (`stress-test.md`).

## Navigation and state

- The URL reflects state: tabs, filters, pagination, open panels.
- Back and forward restore scroll position.
- `<title>` matches the current view, most specific first: `Billing · Settings · Acme`.

## Overlays

- Scrollable dialogs, drawers, menus and side panels get `overscroll-behavior: contain`, so scrolling past their end never scrolls the page behind.
- Close on Escape and on a click outside, unless data would be lost.
- A modal taller than the viewport gets `max-height: 100dvh`, a scrolling body and an action row outside the scroll area.

## Gestures

- Wait for about 10px of movement before committing to a drag direction, then track 1:1 from where the user grabbed.
- Capture the pointer during a drag, ignore extra touches, disable text selection on the drag surface.
- Dismiss on velocity or distance: a quick flick is enough. Resist progressively at edges. (Code in `recipes.md`.)
- Set `touch-action: none` only on a surface that implements its own pan or drag, never at page level.
- Detect all plausible gestures in parallel from the first move, then cancel the losers once intent is clear. Double-tap detection delays single taps; only pay that cost where double-tap truly exists.
- Every drag has a single-pointer alternative, such as move-up and move-down buttons on a sortable row.
