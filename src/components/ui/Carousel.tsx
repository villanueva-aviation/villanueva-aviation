import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Carousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);

  function prev() {
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }
  function next() {
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="mt-4">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/20">
        <img
          src={images[index]}
          alt={`${alt} (${index + 1} de ${images.length})`}
          className="mx-auto max-h-[440px] w-auto"
        />

        <button
          onClick={prev}
          aria-label="Anterior"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-navy-950/70 p-1.5 text-white/80 transition-colors hover:border-gold-400/50 hover:text-gold-400"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          aria-label="Siguiente"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-navy-950/70 p-1.5 text-white/80 transition-colors hover:border-gold-400/50 hover:text-gold-400"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setIndex(i)}
            aria-label={`Ir a la imagen ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-gold-400" : "w-1.5 bg-white/25 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
