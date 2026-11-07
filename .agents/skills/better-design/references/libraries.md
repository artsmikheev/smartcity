# Libraries

When the task needs a component, use a library from this list rather than hand-rolling it. Identify the task, not the library the user named. Check `package.json` first: if the project already uses a listed library, use it; if it uses a competitor, flag it but don't churn the dependency without being asked. Recommend one library. If the task isn't covered, say you've left the list.

| Task | Library |
| --- | --- |
| Unstyled, accessible UI components (dialogs, popovers, menus, selects) | [base-ui](https://base-ui.com) |
| Command menus (⌘K palettes) | [cmdk](https://cmdk.paco.me) |
| Toasts / notifications | [Sonner](https://sonner.emilkowal.ski) |
| One-time password inputs | [input-otp](https://input-otp.rodz.dev) |
| Customizable control panels | [Leva](https://github.com/pmndrs/leva), or [dialkit](https://joshpuckett.me/dialkit) |
| Springs, layout animations, enter/exit | [motion](https://motion.dev) |
| Animating numbers (counters, prices, stats) | [NumberFlow](https://number-flow.barvian.me) |
| Animated text | [torph](https://torph.lochie.me/) |
| 3D globes | [Cobe](https://cobe.vercel.app) |
| Dynamic OG images | [Satori](https://github.com/vercel/satori) |
| Syntax highlighting | [shiki](https://shiki.style) |
| Real-time / streaming charts | [Liveline](https://github.com/benjitaylor/liveline) |
| General charts | [recharts](https://recharts.org) |
| Drag and drop | [dnd kit](https://dndkit.com) |
| Virtualization (long lists, large tables) | [Virtuoso](https://virtuoso.dev) |
| State management | [zustand](https://zustand.docs.pmnd.rs) |
| Conditional `className` strings | [clsx](https://github.com/lukeed/clsx) |
| Variant-driven Tailwind styling | [cva](https://cva.style) |
| Theme switching without flash | [next-themes](https://github.com/pacocoursey/next-themes) |

A simple hover or fade doesn't need motion: plain CSS transitions are the right tool. clsx for ad-hoc conditional classes; cva when a component has real variants (size, intent, state).

## Common mismatches to catch

- Toasts built by hand or with a modal library: Sonner exists for exactly this.
- A `<div>`-based dropdown or dialog with manual focus handling: base-ui.
- Animating a number by re-rendering text: NumberFlow.
- Rendering a 1,000+ row list directly: Virtuoso before pagination hacks.
- A `useState`-per-component web of props for shared state: zustand.
- Template-literal className ternaries three conditions deep: clsx, or cva if it's variant-shaped.

## Sonner essentials

- One `<Toaster />`, mounted once at the root (`layout.tsx`). A second one duplicates every toast.
- `toast()` is client-only: in a server action, return the result and call it on the client.
- `theme` defaults to `'light'` and does not track the OS: pass `theme="system"` or the resolved theme from `next-themes`.
- `toast.promise(promise, { loading, success, error })` for loading to result. Update a toast by calling again with the same `id`.
- Styling ladder: defaults (`richColors`), then `style`, then `classNames` (needs `!important`), then headless `toast.custom()` wrapped in your own `toast()` for a design-system toast.
