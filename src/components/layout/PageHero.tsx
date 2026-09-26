import type { ReactNode } from "react";
import { Container } from "../ui/Container";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  fondo,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Imagen de fondo opcional; el texto va a la izquierda, así que el sujeto debe quedar a la derecha. */
  fondo?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-radar bg-grid border-b border-white/10">
      {fondo && (
        <div className="absolute inset-0" aria-hidden="true">
          <img src={fondo} alt="" fetchPriority="high" className="h-full w-full object-cover object-[72%_50%] md:object-center" />
          <div className="absolute inset-0 bg-navy-950/70 md:bg-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-950 to-transparent" />
        </div>
      )}
      <Container className={`relative ${fondo ? "py-28 md:py-44" : "py-20 md:py-28"}`}>
        <span className="mb-4 inline-block font-display text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
          {eyebrow}
        </span>
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </section>
  );
}
