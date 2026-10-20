# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two groups, both Spanish-speaking (Mexico first, then the rest of Latin America and Spain):

- **Flight-sim enthusiasts (the real audience today).** Social data (Oct 2026): ~93% men, two thirds aged 35-64, following on Facebook (31.5k), Instagram (11.4k) and TikTok. They fly MSFS/X-Plane at home, often on IVAO/VATSIM, and want to fly *like a real pilot*: IFR, radio, procedures, a specific aircraft. They pay to fix a concrete thing they want to do now, not for "an academy".
- **Aspiring pilots** before (or during) real ground school, who want structure and a way to check whether they are ready, including people preparing for a real theory exam.

Most visitors arrive from a short Reel on their phone, curious, with no account and little patience.

## Product Purpose

Villanueva Aviation is an independent digital academy that teaches real aviation theory through flight simulation, in Spanish. The free core (Academia of 14 modules, guides, checklists, tools, Discord) builds trust; the business is **personal guidance from the founder**: 1-on-1 sessions with a written plan made for each cadet. Success is a visitor discovering their level, starting to learn, and booking a free diagnostic that turns into paid sessions.

## Positioning

Unlike recorded video courses (Eddie Aviation Services) and English/FAA-centred platforms (Sporty's), and unlike exam-bank platforms (FlightPath), Villanueva Aviation puts a real person in the loop: the founder reviews projects, runs sessions over Discord, and builds each cadet's plan, all inside the simulator the cadet already owns.

## Operating Context

- **Academia**: 14 modules (Fundamentos, Meteorología, Aerodinámica, Navegación 1 and 2, Cartografía, Comunicaciones, Instrumentos, Rendimiento, VFR, Operación, Espacios Aéreos, Reglamentación, IFR), each Lección → Interactividad → Práctica → Evaluación → Proyecto final (founder-reviewed).
- **Funnel pages**: `/nivel` (public 12-question level test, no account), `/asesorias` (1-on-1 offer), `/asesorias/diagnostico` (free 30-min diagnostic request), `/empieza` (landing for social traffic).
- **Aircraft**: a fleet of 10 aircraft flown in sim with the academy's XB- registrations (real in-sim photos exist for each); per-aircraft checklists and badge exams (Bronce/Plata/Oro) for 9 of them.
- **Tools**: pilot briefing with live METAR/TAF, Mexican VFR route packs with .pln files, controls and cockpit-panel guides, Discord bot (/metar, /taf), an "Aventura" log of the founder's real sim flights.
- **Contenido Exclusivo**: premium checklists, checkride simulators, paid aircraft exams, one included founder session.
- Auth: Supabase (magic link + Google). Payments: PayPal.

## Capabilities and Constraints

- **Pricing that exists (USD):** Contenido Exclusivo $29 one-time; extra 1-on-1 session $15.99/hour; asesorías shown as $32 per 2-hour session or $120 for 4 sessions; diagnostic free. Do not invent other prices, plans or discounts.
- **Capacity is real and small:** the founder gives sessions ~2 hours a day. Scarcity copy (limited spots) must match the constants in `src/lib/constants.ts`.
- Content must work for total beginners and for experienced simmers at once.
- Regulatory scope is Latin America broadly; AFAC/RAC is one example, not the default.
- **Never imply official status.** Villanueva Aviation is not a certified flight school and grants no licences. The founder is not a certified instructor (real-world Private Pilot licence with 120 h, currently expired; plans to renew it, then go for Commercial; 6,884 h on IVAO). His own licence may be stated as a personal fact (as on `/quienes-somos`), never as something the academy confers. Use "el fundador revisa personalmente", "asesoría", "preparación"; never "instructor certificado", "CFI", "licencia", or "piloto" as a title the site confers.

## Brand Commitments

- Name: **Villanueva Aviation**. Founder: Erik Villanueva ("No es solo volar. Es vivir la aviación." / "El cielo no es el límite, es el comienzo.").
- Tagline: "Aprende. Practica. Comunica. Vuela."; the logo carries "LEARN. NAVIGATE. FLY."
- Palette: navy (`#060e1a`, `#0b1d34`) and gold (`#d4af37`). Typefaces: Sora (display) and Inter (body).
- Logo: compass + "V" + climbing plane, transparent PNG on the dark background.
- Imagery: the founder's own in-sim captures of the XB- fleet. Prefer them over stock photos; label them as simulator captures.

## Evidence on Hand

Real (Oct 2026): 41 registered accounts, 19 started a lesson, 6 submitted a final project, 2 paid the $29 pack, and a first paying 1-on-1 IFR client from Spain (2 hours, $33). 6,884 h logged on IVAO. Social reach ~250k viewers/28 days on Facebook. No testimonial is approved for publication yet; use one only with the person's written permission. Never fabricate quotes, counts or results.

## Product Principles

1. A real person closing the loop beats a self-graded quiz or a passive video.
2. Meet people where they already are: in their own simulator, on their phone, curious after a Reel.
3. Give real value free first (level test, Academia, tools); charge for personal time.
4. Built in Spanish first, not a translation.
5. Honest by default: real photos, real numbers, no implied certification.
