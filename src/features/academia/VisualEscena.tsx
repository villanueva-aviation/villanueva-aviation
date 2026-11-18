import { AnimatePresence, motion } from "framer-motion";
import type { Marca, Visual } from "../../data/escenas";

function claveDe(v: Visual): string {
  return v.tipo === "foto" ? v.src : v.tipo === "clip" ? v.mp4 : `${v.poster}|${v.superficie}|${v.eje}`;
}

/** Flechas y etiquetas encima del visual, en porcentaje de su tamaño. */
function Marcas({ marcas, quieto }: { marcas: Marca[]; quieto: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <AnimatePresence>
          {marcas.map((m) =>
            m.tipo === "flecha" ? (
              <motion.line
                key={`f-${m.texto ?? ""}-${m.desde}-${m.hasta}`}
                x1={m.desde[0]}
                y1={m.desde[1]}
                x2={m.hasta[0]}
                y2={m.hasta[1]}
                stroke="#e3b341"
                strokeWidth={4}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                // Sin pathLength: con vector-effect="non-scaling-stroke" el trazo sale punteado.
                initial={quieto ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: quieto ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : null,
          )}
        </AnimatePresence>
      </svg>
      <AnimatePresence>
        {marcas.map((m) => {
          // La punta de la flecha y el texto van en HTML para que no se deformen con el SVG estirado.
          const [x, y] = m.tipo === "flecha" ? m.hasta : m.en;
          const texto = m.texto;
          if (m.tipo === "flecha") {
            const angulo = Math.atan2(m.hasta[1] - m.desde[1], m.hasta[0] - m.desde[0]);
            return (
              <motion.div
                key={`p-${texto ?? ""}-${m.desde}-${m.hasta}`}
                className="absolute"
                style={{ left: `${x}%`, top: `${y}%` }}
                initial={quieto ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: quieto ? 0 : 0.3, delay: quieto ? 0 : 0.45 }}
              >
                <span
                  className="absolute block h-0 w-0 -translate-x-1/2 -translate-y-1/2 border-y-[9px] border-l-[16px] border-y-transparent border-l-[#e3b341]"
                  style={{ rotate: `${angulo}rad` }}
                />
                {texto && (
                  <span className="absolute left-1/2 top-1/2 mt-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-navy-950/85 px-2.5 py-1 font-display text-[11px] font-semibold uppercase tracking-wider text-gold-400 sm:text-xs">
                    {texto}
                  </span>
                )}
              </motion.div>
            );
          }
          return (
            <motion.span
              key={`e-${texto}-${m.en}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-navy-950/85 px-2.5 py-1 font-display text-[11px] font-semibold text-gold-400 sm:text-xs"
              style={{ left: `${x}%`, top: `${y}%` }}
              initial={quieto ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              {texto}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function Medio({ visual, quieto }: { visual: Visual; quieto: boolean }) {
  // El alto lo pone LeccionScroll con la variable --alto; la caja se ajusta a la imagen para que las marcas caigan en su lugar.
  const clase = "block max-h-[var(--alto,60vh)] w-auto max-w-full rounded-xl";
  if (visual.tipo === "clip" && !quieto) {
    return (
      // Se reproduce una vez y queda en su último cuadro (el spec lo pide así, sin bucle). El mp4 va primero: pesa menos.
      <video className={clase} autoPlay muted playsInline preload="none" poster={visual.poster} aria-label={visual.alt}>
        <source src={visual.mp4} type="video/mp4" />
        <source src={visual.webm} type="video/webm" />
      </video>
    );
  }
  const src = visual.tipo === "foto" ? visual.src : visual.poster;
  return <img src={src} alt={visual.alt} className={clase} />;
}

/** El visual fijo de la lectura con scroll: foto, clip o (más adelante) avión 3D, con sus marcas encima. */
export function VisualEscena({ visual, quieto }: { visual: Visual; quieto: boolean }) {
  const marcas = visual.tipo !== "avion3d" ? (visual.marcas ?? []) : [];
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={claveDe(visual)}
          className="relative inline-block"
          initial={quieto ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: quieto ? 0 : 0.4 }}
        >
          <Medio visual={visual} quieto={quieto} />
          <Marcas marcas={marcas} quieto={quieto} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
