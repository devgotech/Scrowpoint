# 4_ui_system.md — Gadget Escrow App Design System

> **Source of truth:** Figma file *Gadget Escrow App* combined with standard Next.js 16/Tailwind v4/Shadcn architecture rules.
> **Machine-readable tokens:** `tokens.css` (CSS custom properties) mapped to Tailwind configuration.
>
> **Status tags used in this file**
> - *(no tag)* — read directly from Figma, or explicitly confirmed rules.
> - `[OBSERVED]` — measured from a Figma component; off the token scale, kept as-is until confirmed.

---

## 0. Quick Reference

> Copy-paste into `CLAUDE.md` or `.cursorrules` for immediate effect.

**Stack:** Light-mode web app · CSS custom properties · Roboto (primary) + Geist / Geist Mono (secondary) · 4px spacing base · Trust Green reserved for escrow signals · Breakpoints 320 / 768 / 1024 / 1280

```css
/* === CORE TOKENS — Gadget Escrow App === */
:root {
  /* Colour (Hex codes optimized for Tailwind opacity modifiers) */
  --color-bg-base: #f8fafc;            /* Page background (Off-white Slate) */
  --color-bg-surface: #ffffff;         /* Panels, artboards */
  --color-bg-card: #ffffff;            /* Listing card fill */
  --color-text-primary: #020617;       /* Deep Slate */
  --color-text-secondary: #64748b;     /* Muted Slate */
  --color-action-primary: #0f172a;     /* Primary Button/CTA */
  --color-border-default: #e2e8f0;
  
  /* Semantic Escrow States */
  --color-state-success: #088235;      /* Escrow Funded */
  --color-state-warning: #ecc94b;      /* Dispute Open / Action Required */
  --color-state-error: #f56565;        /* Verification Failed */
  
  /* Trust Signals (Strict Usage) */
  --color-trust: #22c55e;              /* Backgrounds, badges, icons */
  --color-trust-strong: #15803d;       /* Text on white backgrounds (WCAG contrast) */

  /* Typography */
  --font-primary: "Roboto", sans-serif;
  --font-secondary: "Geist", sans-serif;
  --font-mono: "Geist Mono", monospace;

  /* Spacing */
  --space-xs: 4px;  --space-sm: 8px;  --space-md: 12px; --space-lg: 16px;
  --space-xl: 20px; --space-2xl: 24px; --space-3xl: 32px; --space-4xl: 40px;

  /* Radius */
  --radius-control: 4px;   /* Buttons, form controls */
  --radius-card: 8px;      /* Cards, containers */
  --radius-badge: 9999px;  /* Trust badges ONLY */
}
```

**NEVER rules:**
1. NEVER use Trust Green (`--color-trust`) for anything except escrow signals: Escrow Active, Verified, funds released.
2. NEVER place `--color-trust` text on a white background (fails WCAG). Use `--color-trust-strong`.
3. NEVER use `--radius-badge` (pill) on anything except trust badges.
4. NEVER use Warning amber for failures or Error red for disputes: Dispute Open = warning, Verification Failed = error, Escrow Funded = success.
5. NEVER set money amounts, IDs or reference numbers in `--font-primary` — use `mono-data` (Geist Mono).
6. NEVER use "bouncy" animations. Use strict `duration-200 ease-out` transitions.

---

## 1. Design Direction & Philosophy

### Character
Authoritative, transparent, and frictionless. Gadget Escrow is a **trust-first marketplace**: buyers and sellers transact through escrow, so the interface must make *who is verified* and *where the money is* obvious at a glance.

### Mood & Feeling
- **Credible and calm** — deep Blue-Slate on an off-white page; no loud colour in structural UI.
- **Signal over decoration** — colour carries meaning (escrow state, verification), not ornament.
- **Unambiguous** — Every financial state (locked, disputed, released) must be instantly clear without the user needing to read fine print.

### What this design explicitly rejects
- **No Dark Mode (V1):** Light-only for launch to ensure absolute clarity of semantic trust and error colors without contrast risks.
- **No decorative green:** Trust Green appears only on escrow signals.
- **No arbitrary spacing:** Every gap comes from the spacing scale.
- **No state colour swaps:** Success, warning and error each map to exactly one escrow condition.

---

## 2. Colour System

### Trust Green rules
- Reserved for **Escrow Active**, **Verified** and **funds released**. 
- Success (`#088235`) is a *different* green on purpose: it marks the *Escrow Funded* status; Trust Green marks the *trust signal itself*.
- **Contrast Rule:** Never place `--color-trust` (`#22C55E`) text on white. Always step down to `--color-trust-strong` (`#15803d`) for high-contrast text rendering.

### Global Focus Style
Use standard Tailwind utilities to leverage Shadcn's built-in ring styles:
`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`

---

## 3. Typography System

### Font Stacks
- **Roboto:** Page headings and marketing body copy.
- **Geist:** Form inputs, buttons, toasts, and UI system text.
- **Geist Mono:** Caps labels, prices, IDs, and financial amounts.

### Primary Text Styles — Composite Groups

| Style token | Font | Weight | Size / Line-height | Letter-spacing | Use |
|---|---|---|---|---|---|
| `--type-headline-xl` | Roboto | 700 | 48 / 56 | 0 | Hero headline |
| `--type-headline-md` | Roboto | 500 | 16 / 24 | 0 | Listing card titles |
| `--type-body-md` | Roboto | 400 | 16 / 24 | 0 | Default body |
| `--type-body-sm` | Geist | 400 | 14 / 20 | 0 | Form helpers, toast body |
| `--type-label-caps` | Geist Mono | 600 | 12 / 16 | `0.04em` | Tooltips, status labels (uppercase) |
| `--type-mono-data` | Geist Mono | 500 | 14 / 20 | 0 | Prices, IDs, reference numbers |

---

## 4. Spacing & Layout

### Corner Radius Semantics
- `--radius-control`: `4px` (Buttons, inputs, selects).
- `--radius-card`: `8px` (Standard cards, dropdown menus).
- `--radius-badge`: `9999px` (Trust badges ONLY).

### Page Layout
- **Max Width:** Desktop container is `1280px`. For ultra-wide monitors (1440px+), do not stretch the UI; center the `1280px` container and allow side margins to grow.
- **Shell:** Utilizes Next.js root layout for sticky header (`h-16`) and mobile bottom nav, with route groups isolating the marketing footer.

---

## 5. Component Patterns

### 5.1 Buttons
- **Typography:** Geist Medium.
- **Radius:** `--radius-control` (4px).
- **Primary Fill:** `--brand-1000` (`#0f172a`).
- **Transitions:** `duration-200 ease-out`.

### 5.2 Listing Card
**Anatomy:** `[media] → [title] → [condition · location] → [amount] → [badge slot]`
- **Title:** `headline-md` (Roboto, Medium, 16px).
- **Price:** `mono-data` (Geist Mono, Medium, 14px) to ensure financial numbers align perfectly.
- **Hover State:** Apply `--shadow-soft-md` and a snappy `-translate-y-1` transform. Do not alter the background color on hover.

### 5.3 Trust Badges & Tooltips
Badges sit in the listing card's *badge slot* and wherever a seller or transaction needs a trust signal.

| Badge Type | Meaning | Color | Tooltip Text (`--type-label-caps`) |
|---|---|---|---|
| **Escrow Active** | Funds are locked in vault | `--trust` | FUNDS SECURED IN VAULT |
| **Verified** | Passed KYC / Biometrics | `--trust` | GOVERNMENT ID VERIFIED |
| **In Transit** | Item shipped by seller | `--brand-1000` | ITEM WITH COURIER |
| **Action Req.** | User inspection window | `--warning` | 48H INSPECTION ACTIVE |
| **Disputed** | Escrow halted due to issue | `--warning` | ESCROW LOCKED: DISPUTE |
| **Failed** | Failed KYC or IMEI check | `--destructive` | VERIFICATION FAILED |

**Accessibility (a11y):** Tooltips must use Shadcn's `<TooltipProvider delayDuration={300}>` to prevent flashing, and must trigger on both `hover` and `focus-visible`.

### 5.4 Forms & Inputs
- **Radius:** Strictly 4px.
- **Text:** Geist 16px (prevents iOS auto-zoom).
- **Validation:** Use `--state-error` (`#f56565`) for destructive borders on invalid fields.

---

## 6. Elevation & Shadows

All shadows use standard Slate (#0f172a) combined with CSS alpha for subtlety.

| Size | Soft (rgba 0.06) | Sharp (rgba 0.12) |
|---|---|---|
| `sm` | 2 2 4 | 2 2 |
| `md` | 4 4 8 | 4 4 |
| `lg` | 6 6 16 | 6 6 |

---

## 7. Motion

- **Policy:** Snappy, utilitarian, and predictable. No bouncy spring physics.
- **Duration:** `--duration-regular` = 200ms.
- **Easing:** `--ease-standard` = `ease-out`.