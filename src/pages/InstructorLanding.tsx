import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { botonInstructor, PAGINA_INSTRUCTOR as P, PROXIMAMENTE } from "../data/paginaInstructor";
import { useAuth } from "../features/auth/AuthContext";
import { RepeticionVuelo } from "../features/instructor/RepeticionVuelo";
import { CAMPO_PUNTO } from "../features/instructor/recorrido";
import { grabacionDemo } from "../features/instructor/recorridoDemo";
import { DISCORD_URL } from "../lib/constants";
import { ROUTES } from "../lib/routes";

const marco = "overflow-hidden rounded-2xl border border-white/10 bg-navy-900 shadow-2xl shadow-black/40";

/** Una pantalla del instructor con brillo dorado detrás; llega inclinada y se endereza al bajar (index.css). */
function Pantalla({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative isolate ${className}`}>
      <div aria-hidden className="pointer-events-none absolute -inset-10 -z-10 bg-[radial-gradient(closest-side,rgba(212,175,55,0.2),transparent)] blur-2xl" />
      <figure className={`pantalla-inclinada ${marco}`}>{children}</figure>
    </div>
  );
}

/** La repetición real del vuelo demo, parada en el primer mensaje del instructor dentro de la zona. */
function DemoVuelo() {
  const g = useMemo(() => grabacionDemo(), []);
  const [t, setT] = useState(() => {
    const zona = g.fases.find((f) => f.fase === "zona");
    const voz = zona && g.voz.find((v) => v.t >= zona.inicio && v.t <= zona.fin);
    return voz ? voz.t + 2 : (g.puntos[0]?.[CAMPO_PUNTO.t] ?? 0);
  });
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <p className="font-display font-bold text-white">Vuelo de demostración · Virajes a rumbos</p>
        <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-xs font-semibold text-gold-300">Toca ▶ o arrastra</span>
      </div>
      <RepeticionVuelo grabacion={g} cursorT={t} alMover={setT} idioma="es" />
    </div>
  );
}

/** El menú de lecciones hecho en la página (nítido a cualquier tamaño) con la maniobra gratis abajo. */
function ListaLecciones() {
  return (
    <div className="p-5 sm:p-6">
      <p className="font-display font-bold text-white">¿Qué quieres practicar hoy?</p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-gold-400">Lecciones</p>
      <ol className="mt-2 grid gap-1.5 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
        {PROXIMAMENTE.vfr.slice(0, 7).map((n, i) => (
          <li key={n} className="flex items-center gap-3 rounded-lg border border-gold-500/35 bg-navy-950/60 px-3 py-2 text-sm font-semibold text-white">
            <span className="w-4 text-xs tabular-nums text-white/40">{i + 1}</span>
            {n}
          </li>
        ))}
      </ol>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-gold-500/60 bg-navy-950/60 px-4 py-3">
        <div>
          <p className="font-bold text-white">Viraje escarpado</p>
          <p className="text-xs text-white/60">360° a 45° de inclinación a cada lado, como en un checkride.</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-300">Gratis</span>
      </div>
    </div>
  );
}

/** Página pública que presenta el instructor virtual y lleva a probar gratis el viraje escarpado (spec 2026-11-23). */
export function InstructorLanding() {
  const { user } = useAuth();
  const boton = botonInstructor(!!user);
  const cta = (
    <Button to={boton.to} variant="primary" className="group">
      {boton.texto}
      <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
    </Button>
  );

  return (
    <>
      {/* GANCHO */}
      <section className="relative overflow-hidden bg-navy-950">
        <Container className="grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">{P.eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl">{P.titulo}</h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">{P.subtitulo}</p>
            <div className="mt-8">
              {cta}
            </div>
            <p className="mt-4 text-sm text-white/55">{P.requisitos}</p>
          </div>
          <Pantalla>
            <img src={P.debriefing.img} alt={P.debriefing.alt} className="block w-full" />
          </Pantalla>
        </Container>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="border-t border-white/10 py-16 md:py-20">
        <Container>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Cómo funciona</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {P.pasos.map((p, i) => (
              <li key={p.titulo} className="rounded-xl border border-white/10 bg-navy-900/60 p-5">
                <span className="font-display text-sm font-bold text-gold-400">{i + 1}</span>
                <h3 className="mt-1 font-display text-lg font-bold text-white">{p.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{p.texto}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* DEBRIEFING */}
      <section className="border-t border-white/10 py-16 md:py-20">
        <Container>
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{P.debriefing.titulo}</h2>
            <p className="mt-3 text-white/70">{P.debriefing.texto}</p>
          </div>
          <Pantalla className="mx-auto mt-10 max-w-4xl">
            <DemoVuelo />
          </Pantalla>
        </Container>
      </section>

      {/* LO QUE HACE POR TI */}
      <section className="border-t border-white/10 py-16 md:py-20">
        <Container className="grid gap-14">
          {P.funciones.map((f, i) => (
            <div key={f.titulo} className="grid items-center gap-8 md:grid-cols-2">
              <div className={`min-w-0 ${i % 2 ? "md:order-2" : ""}`}>
                <h3 className="font-display text-xl font-bold text-white sm:text-2xl">{f.titulo}</h3>
                <p className="mt-3 text-white/70">{f.texto}</p>
                {f.img?.includes("hojas") && (
                  <Link to={ROUTES.hojasInstructor} className="mt-4 inline-flex items-center gap-1 font-semibold text-gold-400 hover:text-gold-300">
                    Ver las hojas <ArrowRight size={14} />
                  </Link>
                )}
              </div>
              {f.lecciones && (
                <Pantalla className="mx-auto w-full max-w-md">
                  <ListaLecciones />
                </Pantalla>
              )}
              {f.img && (
                <Pantalla>
                  <img src={f.img} alt={f.alt} loading="lazy" className="block w-full" />
                </Pantalla>
              )}
            </div>
          ))}
        </Container>
      </section>

      {/* GRATIS HOY Y LO QUE VIENE */}
      <section className="border-t border-white/10 py-16 md:py-20">
        <Container className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gold-500/40 bg-gold-500/10 p-6">
            <h2 className="font-display text-xl font-bold text-white">Gratis hoy con tu cuenta</h2>
            <ul className="mt-4 grid gap-3">
              {P.gratis.map((g) => (
                <li key={g} className="flex gap-2 text-white/80">
                  <Check size={18} className="mt-0.5 shrink-0 text-gold-400" /> {g}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white">
              <Clock size={18} className="text-white/50" /> Próximamente
            </h2>
            <p className="mt-3 text-sm font-semibold text-white/80">Programa VFR</p>
            <p className="mt-1 text-sm text-white/60">{PROXIMAMENTE.vfr.join(" · ")}</p>
            <p className="mt-4 text-sm font-semibold text-white/80">Programa IFR</p>
            <p className="mt-1 text-sm text-white/60">{PROXIMAMENTE.ifr.join(" · ")}</p>
          </div>
          <p className="rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-sm text-gold-200 md:col-span-2">
            <span className="mr-2 rounded-full bg-gold-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-navy-950">Beta</span>
            {P.beta.split("Discord")[0]}
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold-400 underline underline-offset-2">
              Discord
            </a>
            .
          </p>
        </Container>
      </section>

      {/* CIERRE */}
      <section className="border-t border-white/10 py-16 text-center md:py-24">
        <Container className="flex flex-col items-center gap-5">
          <h2 className="font-display text-3xl font-bold text-white text-balance sm:text-4xl">Vuela tu primer viraje escarpado con instructor</h2>
          <p className="max-w-xl text-white/65">{P.requisitos}</p>
          {cta}
        </Container>
      </section>
    </>
  );
}
