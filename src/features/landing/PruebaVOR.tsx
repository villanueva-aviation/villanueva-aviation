import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { OPCIONES, SITUACION, desviacionTras, type Eleccion } from "./datosPruebaVor";
import { HSI, useTransicion } from "./HSI";
import { PFD } from "./PFD";

interface Objetivo {
  valor: number;
  ms: number;
}

/**
 * Anima el HSI según la decisión: al cargar el avión se va desviando a la izquierda del curso
 * (la aguja se corre a la derecha); virar a la derecha intercepta y centra, virar a la izquierda
 * la aleja, y el OBS no mueve al avión.
 */
function useVuelo(elegida: Eleccion | null) {
  const [rumbo, setRumbo] = useState<Objetivo>({ valor: 2, ms: 0 });
  const [desv, setDesv] = useState<Objetivo>({ valor: 0.5, ms: 0 });
  const [marcador, setMarcador] = useState(360);
  const [alabeo, setAlabeo] = useState(0); // grados, positivo = ala derecha abajo
  const relojes = useRef<number[]>([]);

  useEffect(() => {
    const despues = (ms: number, f: () => void) => relojes.current.push(window.setTimeout(f, ms));
    relojes.current.forEach(clearTimeout);
    relojes.current = [];
    const final = desviacionTras(elegida);

    if (elegida === null || elegida === "obs") {
      despues(elegida === null ? 400 : 0, () => {
        setRumbo({ valor: 352, ms: elegida === null ? 2600 : 900 });
        setDesv({ valor: final, ms: elegida === null ? 2600 : 900 });
        setMarcador(360);
        setAlabeo(-5);
      });
      despues(elegida === null ? 2400 : 700, () => setAlabeo(0));
    } else if (elegida === "derecha") {
      setRumbo({ valor: 30, ms: 1300 });
      setMarcador(30);
      setAlabeo(20);
      despues(950, () => setAlabeo(0));
      despues(1100, () => setDesv({ valor: final, ms: 1800 }));
      despues(2900, () => {
        setRumbo({ valor: 360, ms: 1300 });
        setMarcador(360);
        setAlabeo(-20);
      });
      despues(3850, () => setAlabeo(0));
    } else {
      setRumbo({ valor: 330, ms: 1300 });
      setMarcador(330);
      setAlabeo(-20);
      despues(950, () => setAlabeo(0));
      despues(900, () => setDesv({ valor: final, ms: 2000 }));
    }
    return () => relojes.current.forEach(clearTimeout);
  }, [elegida]);

  return {
    rumbo: useTransicion(rumbo.valor, rumbo.ms, true),
    desviacion: useTransicion(desv.valor, desv.ms),
    marcador: useTransicion(marcador, 600, true),
    alabeo: useTransicion(alabeo, 450),
  };
}

export function PruebaVOR({
  href,
  cta = "Sigue con la lección 1",
  titulo = "Prueba de 20 segundos",
  ancho = false,
}: {
  href: string;
  cta?: string;
  titulo?: string;
  /** Instrumento a la derecha y texto a la izquierda (inicio); si no, todo apilado (tarjeta de /empieza). */
  ancho?: boolean;
}) {
  const id = useId();
  const [elegida, setElegida] = useState<Eleccion | null>(null);
  const opcion = OPCIONES.find((o) => o.clave === elegida);
  const vuelo = useVuelo(elegida);

  // Versión ancha: la pantalla de vuelo completa (se ve el alabeo); tarjeta angosta: solo el HSI.
  const instrumento = ancho ? (
    <div className="mx-auto w-full max-w-[40rem]">
      <PFD rumbo={vuelo.rumbo} desviacion={vuelo.desviacion} marcador={vuelo.marcador} alabeo={vuelo.alabeo} />
    </div>
  ) : (
    <div className="mx-auto mt-4 w-full max-w-[20rem]">
      <HSI rumbo={vuelo.rumbo} desviacion={vuelo.desviacion} marcador={vuelo.marcador} />
    </div>
  );

  const pregunta = (
    <>
      <h2 id={`${id}-titulo`} className={`font-display font-semibold text-white ${ancho ? "text-3xl sm:text-4xl" : "text-lg"}`}>
        {titulo}
      </h2>
      <p className={`mt-3 leading-relaxed text-white/75 ${ancho ? "max-w-xl text-base" : "text-sm"}`}>{SITUACION}</p>
      {/* En la versión ancha el instrumento va a la derecha; en pantallas chicas, aquí, antes de las opciones. */}
      {ancho ? <div className="mt-6 lg:hidden">{instrumento}</div> : instrumento}

      <p className={`font-display text-sm font-semibold text-white ${ancho ? "mt-6" : "mt-2"}`}>¿Qué haces?</p>
      <div className="mt-3 flex flex-col gap-2" role="group" aria-label="¿Qué haces?">
        {OPCIONES.map((o) => {
          const activa = elegida === o.clave;
          return (
            <button
              key={o.clave}
              type="button"
              aria-pressed={activa}
              onClick={() => setElegida(o.clave)}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition-[border-color,background-color,transform] duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 ${
                activa && o.correcta
                  ? "border-gold-500/60 bg-gold-500/10 text-white"
                  : activa
                    ? "border-white/35 bg-white/[0.07] text-white"
                    : "border-white/10 bg-white/[0.03] text-white/85 [@media(hover:hover)_and_(pointer:fine)]:hover:border-gold-500/40"
              }`}
            >
              {o.texto}
            </button>
          );
        })}
      </div>

      <div role="status" aria-live="polite">
        {opcion && (
          <div key={opcion.clave} className="animate-fade-up mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className={`font-display text-sm font-semibold ${opcion.correcta ? "text-gold-400" : "text-white"}`}>
              {opcion.titulo}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/75">{opcion.explicacion}</p>
            <Button to={href} className="mt-4 w-full sm:w-auto">
              {cta}
              <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </>
  );

  if (ancho) {
    return (
      <section aria-labelledby={`${id}-titulo`} className="grid items-center gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-14">
        <div className="max-w-xl">{pregunta}</div>
        <div className="hidden lg:block">{instrumento}</div>
      </section>
    );
  }

  return (
    <section aria-labelledby={`${id}-titulo`} className="w-full rounded-2xl border border-white/10 bg-navy-950/85 p-5 sm:p-6">
      {pregunta}
    </section>
  );
}
