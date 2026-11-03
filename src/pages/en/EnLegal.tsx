import { Link } from "react-router-dom";
import { PageHero } from "../../components/layout/PageHero";
import { Container } from "../../components/ui/Container";
import { CONTACT_EMAIL, PRECIO_CONTENIDO_EXCLUSIVO, PRECIO_SESION_1A1, SITE } from "../../lib/constants";
import { ROUTES } from "../../lib/routes";

// Traducción de /legal. Si cambias la página en español, cambia esta igual.
const SECCIONES = [
  { id: "terms", label: "Terms of use" },
  { id: "privacy", label: "Privacy" },
  { id: "refunds", label: "Refunds" },
];

const correo = (
  <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold-400 hover:text-gold-300">
    {CONTACT_EMAIL}
  </a>
);

export function EnLegal() {
  return (
    <div>
      <PageHero
        eyebrow="Legal information"
        title="Terms, privacy and refunds"
        description={`Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}.`}
      />

      <Container className="py-12 md:py-16">
        <nav className="flex flex-wrap gap-2">
          {SECCIONES.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition-colors hover:border-gold-500/40 hover:text-gold-400"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <p className="mt-8 text-sm text-white/50">
          This is a translation of our{" "}
          <Link to={ROUTES.legal} lang="es" className="text-gold-400 hover:text-gold-300">
            Spanish legal page
          </Link>
          . If the two versions differ, the Spanish version applies.
        </p>

        <div className="mt-10 flex flex-col gap-14 text-sm leading-relaxed text-white/70">
          <section id="terms" className="scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-white">Terms of use</h2>
            <div className="mt-4 flex flex-col gap-4">
              <p>
                {SITE.name} is an independent online community and academy for learning aviation theory and practicing flight
                simulation. We are not a certified flight school and we are not affiliated with any aviation authority, airline or
                official institution. The content in the Academy, the premium library (Contenido Exclusivo) and Downloads is
                educational support material and does not replace instruction from a certified flight instructor or the official
                requirements to obtain a pilot license.
              </p>
              <p>
                The <span className="text-white">practice flight log</span> inside the premium library is a personal tracking tool
                for community cadets, confirmed manually by the founder. It is not an official logbook recognized by any aviation
                authority and must not be used in place of your official pilot logbook.
              </p>
              <p>
                By creating an account, you agree to use it personally; it cannot be transferred. Paid content is for your
                individual use only: you may not share your access, or redistribute or resell the downloadable material or the
                module content.
              </p>
              <p>
                All content (text, diagrams, audio, PDFs and exercises) belongs to {SITE.name}, except the official ICAO flight
                plan form included in Downloads, which is a public ICAO document (Doc 4444) provided without changes.
              </p>
              <p>
                We may update these terms as we add new features to the platform. Relevant changes will be reflected in the "last
                updated" date at the top of this page.
              </p>
            </div>
          </section>

          <section id="privacy" className="scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-white">Privacy</h2>
            <div className="mt-4 flex flex-col gap-4">
              <p>
                To create your account we use email sign-in (a one-time link) or your Google account, managed by Supabase. We store
                your email, name and your progress on the platform (completed modules, exams, logged practice flights) so we can
                show you your progress and your certificates.
              </p>
              <p>
                Your theory progress in the Academy (lessons, quizzes) is stored locally in your browser: if you switch devices,
                that progress does not transfer automatically. Your premium access, your payments and your practice flights are
                stored centrally and linked to your account.
              </p>
              <p>
                If you subscribe to our updates from the site, we only store your email (and which section you signed up from) to
                write to you about classes, events and new guides. You can ask to be removed from the list at any time by writing
                to our contact email.
              </p>
              <p>
                Payments are processed directly by PayPal: we never see or store your card or bank details, only the confirmation
                that the payment went through.
              </p>
              <p>
                We do not sell or share your data with third parties for advertising. The only external services that process your
                data are Supabase (database and authentication), Google (if you choose to sign in with Google) and PayPal (payment
                processing).
              </p>
              <p>You can ask us to delete your account and your data by writing to {correo}.</p>
            </div>
          </section>

          <section id="refunds" className="scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-white">Refunds</h2>
            <div className="mt-4 flex flex-col gap-4">
              <p>
                The premium library (Contenido Exclusivo) is a one-time payment of ${PRECIO_CONTENIDO_EXCLUSIVO} USD that unlocks
                immediate, lifetime access to digital content (checklists, mock exams, audio and the practice flight log). Because
                it is digital content with immediate access, <span className="text-white">we do not offer refunds</span> once the
                payment is complete.
              </p>
              <p>
                The only exception is a verified technical error on our side (for example, a duplicate charge, or a payment
                confirmed by PayPal that did not unlock access). In those cases, write to {correo} with your payment receipt and
                we'll sort it out.
              </p>
              <p>
                <span className="text-white">One-on-one sessions.</span> The first session with the founder is included in the
                premium library. Additional sessions cost ${PRECIO_SESION_1A1} USD per hour (60 minutes) and are paid through
                PayPal once we confirm the date and hours by email; booking a time does not create any charge by itself.
              </p>
              <p>
                You can reschedule or cancel a paid session with at least <span className="text-white">24 hours' notice</span>: it
                is rescheduled at no cost or fully refunded, whichever you prefer. With less than 24 hours' notice, or if you don't
                show up, the session counts as delivered and is not refunded. If the founder is the one who cancels or can't
                connect, the session is always rescheduled at no cost or fully refunded. Sessions are personal and cannot be
                transferred, and what we cover in them does not replace instruction from a certified flight instructor.
              </p>
            </div>
          </section>
        </div>

        <p className="mt-14 border-t border-white/10 pt-6 text-sm text-white/50">Questions about these terms? {correo}</p>
      </Container>
    </div>
  );
}
