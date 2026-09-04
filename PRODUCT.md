# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Aspiring pilots across Latin America (Spanish-speaking, not limited to Mexico), before they've enrolled in a physical flight school. The audience is a mix: total beginners with no aviation background, and people who already tinker with a home flight simulator (MSFS/X-Plane) or have picked up some theory on their own and want real structure. What they share is the job-to-be-done: decide whether they're actually ready to spend real money on flight-school hours ($150-250 USD/hour is typical), without having to guess.

## Product Purpose

Villanueva Aviation is a digital ground-school academy that pairs structured theory (13 modules, from Fundamentos through IFR) with integrated flight-simulation practice and visible progress tracking, so a cadet arrives at a real flight school already prepared — spending fewer real-airplane hours on material they could master on the ground first. Success is a cadet completing a module's full arc (Lección → Interactividad → Práctica → Evaluación → Proyecto final) and feeling genuinely ready — backed by a real instructor's review, not just a self-graded quiz.

## Positioning

Unlike Eddie Aviation Services (a Spanish-language recorded video course with no integrated simulator practice) and Sporty's Pilot Training (English-language, built for the US/FAA context), Villanueva Aviation requires a cadet to demonstrate what they learned — through simulator-integrated interactivities and a capstone project a real instructor reviews — before they ever pay for an hour of real flight time.

## Operating Context

- **Academia**: 13 modules (Fundamentos, Meteorología, Aerodinámica, Navegación, Cartografía, Comunicaciones, Instrumentos, Rendimiento, VFR, Operación, Espacios Aéreos, Reglamentación, IFR), each stepping through Lección → Interactividad → Práctica → Evaluación → Proyecto final (a capstone submitted for real instructor review).
- **Contenido Exclusivo**: premium C172/C152 checklists with emergency memory flows and V-speeds, oral and in-flight checkride simulators mapped against the real FAA/ACS Areas of Operation, and a real instructor-booking flow (Supabase-backed, RLS-scoped per cadet).
- **Centro de Descargas**: branded PDF checklists (C172/C152), a VFR flight-planning guide, a real weight-and-balance calculator, an editable flight logbook.
- **Mi Formación / Tracker / Evaluaciones**: dashboards showing a cadete's level, XP, progress, and exam history.
- **Comunidad**: a Discord server that complements, not replaces, the Academia.
- Auth is Supabase (magic link + Google OAuth); there is no payment or billing flow anywhere in the product today.

## Capabilities and Constraints

- Fully free today. No pricing, checkout, or subscription logic exists in the codebase. Whether to ever charge is an open, undecided business question — future work must not imply pricing, a "free plan" vs. "paid plan" distinction, or any monetization claim that doesn't exist yet.
- Content must work for both total beginners and self-taught simulator hobbyists — it can't assume zero prior exposure, but also can't assume none of them have already picked up basics on their own.
- Geographic/regulatory scope is Latin America broadly, not Mexico-only. Where content references a specific regulator (e.g. AFAC/RAC 61), treat it as one example among Latin American authorities, not the assumed default for every cadet.
- Pre-launch: zero real, active cadets as of this writing. No usage data, completion rates, or retention numbers exist yet.

## Brand Commitments

- Name: **Villanueva Aviation**. Founder: Erik Villanueva ("No es solo volar. Es vivir la aviación." / "El cielo no es el límite, es el comienzo.").
- Tagline: "Aprende. Practica. Comunica. Vuela." (site); the logo mark itself carries "LEARN. NAVIGATE. FLY."
- Palette: navy (`--color-navy-950 #060e1a`, `--color-navy-900 #0b1d34`) and gold (`--color-gold-500 #d4af37`). Typefaces: Sora (display/headings) and Inter (body).
- Logo: compass + "V" + climbing-plane mark, transparent PNG, sits directly on the dark navbar/footer background (no card behind it).

## Evidence on Hand

Real, shipped content exists: 13 modules with real quiz banks (221 questions total, hand-classified across Bloom's taxonomy levels), real branded PDF checklists and a VFR guide, a real weight-and-balance calculator, and checkride simulators whose coverage was audited against the actual FAA/ACS Areas of Operation. What does **not** exist yet: any real cadet testimonial, usage statistic, completion rate, or paying customer. Future work must not fabricate any of these — no invented quotes, no invented "X cadetes ya se unieron" numbers.

## Product Principles

1. Prove readiness in simulation before spending real money on flight-school hours — that's the whole reason to exist.
2. A real instructor closing the loop beats a self-graded quiz or a passive video — every capstone project is reviewed by a person, not just scored.
3. Built in Spanish for Latin America first, not a translated afterthought of an English-language product.
4. Meet cadets wherever they start — total beginners and self-taught simulator hobbyists both belong here, without the content assuming either.
5. Stay free until a deliberate decision says otherwise; don't let the product's identity quietly bake in a pricing model nobody has chosen yet.
