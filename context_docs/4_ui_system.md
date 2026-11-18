# 4_ui_system.md: Frontend Design System & UI Rules

The design system works like Figma variables: **every visual value lives once in
`frontend-web/app/globals.css`** (the `@theme` block). Components only reference
tokens, so changing a token updates every screen.

## 0. Golden Rules
*   **Never** hard-code a colour (`bg-[#111113]`), radius (`rounded-[8px]`, `rounded-none`)
    or small font size (`text-[10px]`) in a component. Use the token class.
*   Need a new value? Add a token to `globals.css` first, then use it.
*   New custom `--text-*` or `--radius-*` tokens must also be added to the
    `extendTailwindMerge` lists in `frontend-web/lib/utils.ts`, otherwise `cn()` can drop classes.
*   Shared UI belongs in a component (`components/ui/*`), not copy-pasted class strings —
    edit the component once and every usage updates.

## 1. Colour Tokens
| Token (class suffix) | Value | Use |
|---|---|---|
| `ink` | `#111113` | Text, primary CTA fill, strong borders |
| `ink-faint` | `rgba(17,17,19,.12)` | Default hairline border |
| `ink-medium` | `rgba(17,17,19,.65)` | Secondary text |
| `paper` | `#F8F7F4` | Page background |
| `surface` | `#FFFFFF` | Cards, panels, inputs (`bg-surface`, not `bg-white`) |
| `surface-muted` / `surface-muted-alt` | `#F0EFEA` / `#E8E6DF` | Muted panels, chips, table heads |
| `accent-orange` | `#FF5A25` | Brand accent, hover states |
| `trust` / `trust-strong` | `#22c55e` / `#15803d` | Escrow-protected signals only. `trust-strong` for text on light backgrounds |
| `state-success` (`-bright`, `-strong`) | `#088235` | Escrow funded |
| `state-warning` (`-strong`) | `#ecc94b` (`#975a16`) | Dispute open / action required. `-strong` for text |
| `state-error` (`-hover`, `-strong`, `-dark`, `-deep`) | `#f56565` … | Verification failed. `-strong` for text |

Opacity modifiers work on every token: `text-ink/65`, `bg-trust/10`.
shadcn names (`bg-background`, `bg-card`, `bg-muted`, `border-border`, `ring-ring`, …) are aliases of the tokens above.

## 2. Corner Radius (responsive)
One knob — `--radius-base` — drives every radius:

| Breakpoint | `--radius-base` |
|---|---|
| Mobile (< 768px) | `4px` |
| Tablet (768–1023px) | `6px` |
| Desktop (≥ 1024px) | `8px` |

| Class | Value | Use |
|---|---|---|
| `rounded-card` | base | Cards, panels, containers, alerts |
| `rounded-ui` | base | Inputs, icon tiles, chips, small elements |
| `rounded-sm` / `rounded-md` / `rounded-lg` / `rounded-xl` | base −2 / base / base +2 / base +4 | shadcn primitives (menus, dialogs, tooltips) |
| `rounded-full` / `rounded-control` / `rounded-badge` | pill | Primary buttons, status & trust badges |

To make the whole product sharper or softer, change only the three `--radius-base` values in `globals.css`.

## 3. Typography Tokens
*   Fonts: `font-primary` (Space Grotesk, headings), `font-secondary` (Plus Jakarta Sans, body), `font-mono` (Space Grotesk, tabular numbers).
*   Small sizes: `text-micro` (9px), `text-caption` (10px), `text-meta` (11px), `text-label` (0.65rem — the `.label` eyebrow).
    Above those, use Tailwind's standard scale (`text-xs`, `text-sm`, …).
