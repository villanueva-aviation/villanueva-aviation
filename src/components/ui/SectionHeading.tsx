export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <span className="mb-3 inline-block font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-white/65">{description}</p>
      )}
    </div>
  );
}
