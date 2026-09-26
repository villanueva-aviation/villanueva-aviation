import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Container } from "../../components/ui/Container";
import { ROUTES } from "../../lib/routes";
import { fetchVuelosAventura, type VueloAventura } from "./aventura";
import { formatoDuracion, resumenAventura } from "./calculos";

/** Panel de la portada: el último vuelo de la aventura. No se muestra hasta que haya uno. */
export function PanelAventura() {
  const [vuelos, setVuelos] = useState<VueloAventura[]>([]);

  useEffect(() => {
    fetchVuelosAventura().then(setVuelos);
  }, []);

  if (vuelos.length === 0) return null;
  const ultimo = vuelos[vuelos.length - 1];
  const resumen = resumenAventura(vuelos);

  return (
    <section className="border-t border-white/10 py-20 md:py-28">
      <Container>
        <div className="grid items-center gap-8 rounded-3xl border border-gold-500/20 bg-gold-500/[0.04] p-8 md:grid-cols-[1.2fr_1fr] md:p-12">
          <div>
            <span className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
              The Adventure
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">
              Último vuelo: {ultimo.origen_icao} <span className="text-gold-500">→</span> {ultimo.destino_icao}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">
              {ultimo.avion} · {formatoDuracion(ultimo.minutos)} · {ultimo.distancia_nm} NM. Un vuelo a la vez, sin
              saltarme ningún aeropuerto.
            </p>
            <div className="mt-6">
              <Button to={ROUTES.aventura}>
                Ver la aventura <ArrowRight size={16} />
              </Button>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-3 text-center">
            {[
              [resumen.vuelos, "Vuelos"],
              [resumen.aeropuertos, "Aeropuertos"],
              [resumen.nm.toLocaleString("es-MX"), "NM"],
            ].map(([valor, etiqueta]) => (
              <div key={etiqueta} className="rounded-2xl border border-white/10 bg-navy-950/60 p-4">
                <dd className="font-display text-2xl font-bold text-white">{valor}</dd>
                <dt className="mt-1 text-[11px] uppercase tracking-[0.15em] text-white/50">{etiqueta}</dt>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
