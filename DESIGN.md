---
name: Villanueva Aviation
description: Digital ground-school academy for aspiring pilots — theory, simulation, and real instructor feedback before flight school.
colors:
  navy-cabin: "#060e1a"
  navy-surface: "#0b1d34"
  navy-steel: "#102847"
  navy-deep: "#16345c"
  navy-dusk: "#1d4573"
  gold-pale: "#f0d78c"
  gold-insignia-light: "#e8c766"
  gold-insignia: "#d4af37"
  gold-brass: "#b3922c"
  gold-bronze: "#8a7122"
typography:
  display:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 800
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "12px"
  md: "16px"
  full: "9999px"
spacing:
  sm: "16px"
  md: "24px"
  lg: "64px"
  xl: "112px"
components:
  button-primary:
    backgroundColor: "{colors.gold-insignia}"
    textColor: "{colors.navy-cabin}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.gold-insignia-light}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  card:
    backgroundColor: "rgba(255,255,255,0.03)"
    rounded: "{rounded.md}"
    padding: "24px"
---

# Design System: Villanueva Aviation

## Overview

**Creative North Star: "The Flight Briefing Room"**

Villanueva Aviation reads like the debrief room before a training flight: serious, procedural, and unhurried. The room is dark navy — the color of a cabin at night — and gold appears the way rank insignia and instrument backlighting do: sparingly, and only where it means something (a call to action, an active state, a value worth noticing). Nothing in this system performs for attention; it earns trust by staying composed. This is explicitly not a casual community space — the product exists to feel like a training cockpit, never like a forum or a chat app.

Surfaces stay flat until a cadet interacts with them. Depth is never faked with drop shadows; instead, a warm gold glow signals "this is active" or "this is where you act next." Typography does the same job with restraint: a bold, geometric display face (Sora) for structure and command, and a quieter body face (Inter) for the actual reading. Text itself carries hierarchy through opacity, not new colors — a deliberate ladder of whites fading from confident to quiet.

**Key Characteristics:**
- Dark-navy cabin as the constant ground; gold as an insignia, not a wash
- Flat by default; glow (not shadow) is the only depth signal, and only on interaction
- Generous rounding on anything clickable — pills for actions, soft corners for containers
- A single opacity ladder of white carries the entire text hierarchy
- Serious and procedural in tone — a cockpit, never a forum

## Colors

The palette is built from one deep navy scale (the cabin) and one gold scale (the insignia) — deliberately just two families, so nothing competes with the accent.

### Primary
- **Dorado de Insignia** (`#d4af37`): The one accent. Reserved for primary CTAs, active nav states, focus rings, the logo's flight line, and small marks of emphasis (eyebrow labels, badges). **The Insignia Rule: gold covers no more than ~10% of any given screen — its rarity is what makes it read as significant.**
- **Gold Insignia Light** (`#e8c766`): Hover state for gold surfaces (buttons, links) — never a resting color.
- **Gold Pale** (`#f0d78c`): Used only inside the `text-shine` gradient treatment on hero headline accents; not a standalone UI color.
- **Gold Brass** (`#b3922c`) / **Gold Bronze** (`#8a7122`): Deeper steps for scrollbar hover and rare pressed/deep-accent states.

### Neutral
- **Navy de Cabina** (`#060e1a`): The base background for the entire app — body, page background, deepest gradient stop.
- **Navy de Superficie** (`#0b1d34`): One step up. Cards, panels, the mobile menu, dropdowns, and gradient midpoints sit here.
- **Navy Steel** (`#102847`) / **Navy Deep** (`#16345c`) / **Navy Dusk** (`#1d4573`): Deeper steps used in decorative gradients and scrollbar track/thumb; rare in UI chrome.
- **White, at opacity**: Text does not introduce new colors for hierarchy — it steps down opacity of white instead: `white` (headings) → `/85` → `/70` → `/65` (default body) → `/60` → `/50` → `/45` (meta/caption) → `/40` (faintest, near-disabled). **The One Ladder Rule: every text hierarchy decision is an opacity choice on white, never a new hue.**
- **Hairline borders**: `white/10` is the default border for cards, dividers, and containers; `white/5` for the subtlest separators. Borders brighten toward gold only on hover or active state, never at rest.

### Status Colors
Success and error states borrow Tailwind's stock `emerald-400/500` and `red-400/500` rather than custom tokens — used narrowly for pass/fail badges, form errors, and destructive actions. They are not part of the brand palette and should not be extended into decorative use.

## Typography

**Display Font:** Sora (with ui-sans-serif, system-ui, sans-serif fallback)
**Body Font:** Inter (with ui-sans-serif, system-ui, sans-serif fallback)

**Character:** Sora is geometric and confident — it carries every heading, eyebrow label, button, and number that needs to command attention. Inter disappears into legibility for anything meant to be read at length. The pairing never mixes mid-sentence; a heading is entirely Sora, a paragraph entirely Inter.

### Hierarchy
- **Hero Display** (Sora, 800, `text-5xl` → `text-8xl` responsive, `leading-[0.95]`, uppercase): The Home page hero headline only. The single loudest moment in the whole system.
- **Headline** (Sora, 700, `text-4xl` → `text-5xl`, `leading-tight`): Page-level `<h1>` inside `PageHero`, used on every interior page.
- **Title** (Sora, 600, `text-3xl` → `text-4xl`): Section headings (`SectionHeading`) that introduce a block of content within a page.
- **Card Title** (Sora, 600, `text-lg`/`text-base`): Component-level headings — feature cards, module cards, quiz questions.
- **Body** (Inter, 400, `text-base`/`text-sm`, `leading-relaxed`, typically `white/65`): Paragraph copy. No fixed max-width rule is enforced today; most body copy sits inside a `max-w-xl`/`max-w-2xl` container by convention.
- **Label / Eyebrow** (Sora, 600, `text-xs`, `tracking-[0.2em]`–`tracking-[0.25em]`, uppercase, `text-gold-500`): The small kicker above every section and page title. Always gold, always tracked wide, never used for more than one short phrase.

### Named Rules
**The One Voice Rule.** Only one typeface carries structure (Sora) and only one carries reading (Inter). A third face has never been introduced and shouldn't be.

## Layout

Two container widths coexist by design: `Container` (`max-w-7xl`, responsive padding `px-6` → `px-10` → `px-16`) wraps ordinary page content, while the top navigation bar alone uses a wider `max-w-[100rem]` so it can host a full link row without feeling cramped. Sections stack vertically with generous, escalating rhythm — `py-16`/`py-20` for lighter sections up to `py-24`–`py-32` for hero-weight moments — rather than a single fixed section padding. Grids are simple and responsive: feature and module cards run `grid-cols-1` on mobile up to `sm:grid-cols-2`/`lg:grid-cols-3`, never denser. There is no sidebar or persistent chrome beyond the top nav and footer; every page is a single scrolling column of sections.

## Elevation & Depth

The system is flat at rest — no drop shadows are used to establish resting depth or z-order. Depth reads through **layering translucent navy/white panels** (a card is `white/[0.03]` over the navy ground) rather than shadow. The one exception is a deliberate **glow**, not a shadow: primary buttons and the active/hover states of gold elements carry a soft `box-shadow` blur tinted gold (e.g. `0 0 20px rgba(212,175,55,0.35)`, intensifying on hover), simulating backlit instrumentation rather than physical elevation.

### Shadow Vocabulary
- **Insignia Glow (resting)** (`box-shadow: 0 0 20px rgba(212,175,55,0.35)`): Primary button at rest.
- **Insignia Glow (hover)** (`box-shadow: 0 0 32px rgba(212,175,55,0.55)`): Primary button on hover — brighter, never a position shift.
- **Insignia Glow (secondary)** (`box-shadow: 0 0 20px rgba(212,175,55,0.18)`): Secondary/outline buttons, a quieter version of the same effect.

### Named Rules
**The Glow-Not-Shadow Rule.** Depth is never implied with a dark drop shadow. When something needs to feel "raised" or "active," it gets warmer (a gold glow), not darker.

## Shapes

Corners are generous and consistent by role: **full rounding** (`9999px`) on anything a cadet clicks as an action — buttons, badges, nav pills, the profile avatar, the mobile menu's toggle. **Medium rounding** (`16px`, `rounded-2xl`) on containers that hold content — cards, panels, the mobile menu sheet, modals-in-place. **Small rounding** (`12px`, `rounded-xl`) on compact interactive elements nested inside those containers — text inputs, checklist rows, dropdown items. Borders are hairline (1px) and translucent (`white/10` at rest); they never thicken for emphasis, they change color instead — toward gold on hover or active state.

## Components

### Buttons
- **Shape:** Fully rounded pill (`9999px`) — every button in the system, no exceptions.
- **Primary:** Gold fill (`#d4af37`) with navy text (`#060e1a`), resting insignia glow, `hover:scale-[1.03]` and a brighter glow on hover, `active:scale-[0.97]` for press feedback. Carries a diagonal shimmer sweep on hover (gated to pointer-capable devices).
- **Secondary:** Transparent fill, `white/30` border, white text; on hover the border shifts toward gold and a faint gold glow appears. Same scale/press feedback as primary.
- **Ghost:** No fill or border, gold text (`gold-400`) that lightens on hover — used for low-emphasis links like "Ver módulos →".
- **Hover/Focus (all variants):** Hover effects are gated behind `@media (hover: hover) and (pointer: fine)` so they never get stuck "on" after a tap on touch devices; `:active` scale feedback stays ungated since press feedback belongs on every input type.

### Cards
- **Corner Style:** `16px` (`rounded-2xl`).
- **Background:** `white/[0.03]` at rest.
- **Shadow Strategy:** None at rest (see Elevation & Depth); on hover, cards lift `4px` (`translateY(-4px)`) and the border warms toward `gold-500/40` — motion and color are the only "elevation" cue, never a cast shadow.
- **Border:** `1px solid white/10` at rest.
- **Internal Padding:** `24px` (`p-6`).

### Inputs / Fields
- **Style:** `white/[0.04]` background, `white/15` border, `rounded-xl` (`12px`), white text with `white/30` placeholder.
- **Focus:** Border shifts to `gold-500/50` — no glow or outline ring added.
- **Disabled/Select quirk:** Native `<select>` options must set explicit `background-color`/`color` inline, since browsers don't reliably inherit dark theming into the native option popover.

### Badges
- **Style:** Small pill (`rounded-full`), `border` + tinted background at 15% opacity + matching text color, four tones: `gold` (default/pending), `green`/emerald (success/confirmed), `red` (error), `neutral` (`white/10`, informational).

### Navigation
- **Style:** Pill-shaped links (`rounded-full`) with a hairline transparent border; the active link gets a gold-tinted background, gold border, gold text, a subtle glow, and a small pulsing gold dot indicator. Inactive links are `white/70`, brightening to full white with a faint white background on hover. Icons scale up slightly and turn gold on hover. The mobile menu is a full-screen navy overlay with staggered link entrance, using its own custom easing curve (`cubic-bezier(0.76,0,0.24,1)`) distinct from the rest of the system's default `ease-out`.

### Progress Bar
- **Style:** A `white/10` track with a gold gradient fill (`gold-600` → `gold-500` → `gold-400`) that animates width changes smoothly (`700ms ease-out`). Used throughout Academia to show module, checklist, and quiz progress.

## Do's and Don'ts

### Do:
- **Do** keep gold under ~10% of any screen — it reads as significant because it's rare (The Insignia Rule).
- **Do** use the white-opacity ladder (`white` → `/40`) for every text-hierarchy decision instead of introducing a new color.
- **Do** use full rounding on anything clickable-as-an-action, and reserve `16px`/`12px` rounding for containers and nested fields respectively.
- **Do** signal "active" or "raised" with a warmer gold glow, never a darker drop shadow.
- **Do** gate hover-only effects behind `@media (hover: hover) and (pointer: fine)` so touch devices don't get a "stuck" hover state.

### Don't:
- **Don't** add traditional drop shadows for depth or elevation — this system has none at rest.
- **Don't** let gold dominate a screen or use it decoratively outside CTAs, active states, and labels.
- **Don't** introduce a third typeface, or mix Sora and Inter within the same text element.
- **Don't** let the product feel like a casual community space (Discord, a forum) — the tone is a training cockpit: composed, procedural, serious.
- **Don't** use `transition-all` on interactive elements; name the exact properties that change.
