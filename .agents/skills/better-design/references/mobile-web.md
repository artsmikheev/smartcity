# Mobile web

Make a web app feel native on a phone: the small CSS and meta-tag fixes that separate "a website in a browser" from something that feels installed. Most "the app feels janky on mobile" reports are not animation problems: they're a 300ms tap delay, a gray flash on tap or a hover state that won't let go.

- **Media queries over device sniffing.** `(hover: hover)`, `(pointer: fine)`, `env()`, `dvh`. Never branch on user agent strings or screen width to guess at touch. Touch and mouse are not exclusive: gate by capability, not by device.
- **Never disable zoom.** `user-scalable=no` and `maximum-scale=1` are accessibility failures. Fix the input font size instead.
- **Test on hardware.** None of this reproduces in device emulation.

## Symptom table

| Problem | Solution |
| --- | --- |
| Hover state stuck after tap | Wrap in `@media (hover: hover) and (pointer: fine)` |
| Gray/blue flash on tap | `-webkit-tap-highlight-color: transparent`, then give every tappable its own `:active` state |
| Layout has wrong height | `100dvh` (app shell, drawers) or `100svh` (hero) |
| Page zooms into input | Input font size 16px at the minimum |
| Tap feels laggy | Feedback on pointer-down + `touch-action: manipulation` |
| Pull-to-refresh hijacks scroll | `overscroll-behavior: none` on `html, body`, `contain` on inner scrollers |
| Content stops at the notch | `viewport-fit=cover` + `env(safe-area-inset-*)` |
| Long-press selects button text | `user-select: none` on controls |
| Carousel scrolls vertically | `touch-action: pan-y` on the gesture surface |
| Status bar color doesn't match | `theme-color` per color scheme |
| Right in Chrome, wrong on phone | Test on real hardware |

## Details that matter

- `dvh` resizes as the URL bar collapses, right for an app shell but it shifts marketing content mid-scroll. `svh` is stable, right for a hero. `lvh` is the old `vh`.
- Set the keyboard: `inputmode="numeric"` for codes, `inputmode="decimal"` for amounts, `type="email"` and `type="tel"`, `autocapitalize="none"` and `autocorrect="off"` on usernames and codes, `enterkeyhint="send"` / `"search"` / `"done"`.
- Press feedback at 100-160ms and `ease-out`. Native buttons respond the instant the finger lands.
- `overscroll-behavior: contain` keeps a container's own bounce but stops the page behind it from moving. Never a `touchmove` + `preventDefault()` listener: it blocks scrolling and costs frames.
- Fixed headers, bottom tab bars, toasts and sheets pad with `env(safe-area-inset-*)`. Without `viewport-fit=cover` the values are all `0px`. Give `env()` a fallback in a `calc`: `env(safe-area-inset-bottom, 0px)`.
- `user-select: none`, `-webkit-user-select: none` and `-webkit-touch-callout: none` on buttons, tabs, chips and drag handles. Never on `body`: text that is content must stay selectable.
- `touch-action` names what the *browser* may still do. `pan-y` on a horizontal carousel, `none` only on a surface that handles every axis. A native-scroll carousel prefers `scroll-snap-type: x mandatory` and `scroll-snap-align: start`.
- Match `theme-color` to the color at the very top of the page, the header background, not the brand color. In Next.js set it through the `viewport` export.
- Test on a phone a few years old, with the keyboard open, once in landscape, and as an installed PWA if that's a target. Run the dev server on `0.0.0.0` and open it by LAN IP; Safari Web Inspector or `chrome://inspect`.

## Baseline

Ship this before the first component of a mobile-facing app:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0a0a" />
```

```css
html {
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%; /* no font inflation in landscape */
  overscroll-behavior: none;
}

input, textarea, select {
  font-size: 16px;
}

button, a, [role="button"] {
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
}

@media (hover: hover) and (pointer: fine) {
  /* all :hover rules live here */
}
```

`interactive-widget=resizes-content` makes the software keyboard shrink the layout viewport on Android Chrome, so `100dvh` and bottom-pinned inputs react to it the way they do on iOS. Drop `overscroll-behavior: none` from `html` if the app is a scrolling document where pull-to-refresh is welcome.

## Output

Apply the fixes. Then say what was wrong, what changed (file and declaration, one line each) and which fixes you could verify from code and which the user must confirm on hardware.
