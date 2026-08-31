import type { ReactNode } from "react";
import { Container } from "../ui/Container";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-radar bg-grid border-b border-white/10">
      <Container className="py-20 md:py-28">
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
