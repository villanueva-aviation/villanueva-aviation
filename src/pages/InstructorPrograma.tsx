import { useEffect, useRef } from "react";
import { AlertTriangle, Volume2, VolumeX } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthContext";
import { Explicacion } from "../features/instructor/ExplicacionInstructor";
import { HojaCheckride } from "../features/instructor/HojaCheckride";
import { puedeMandar } from "../features/instructor/reglasIntentos";
import { ReporteExamen } from "../features/instructor/ReporteExamen";
import { useIntentoViraje } from "../features/instructor/useIntentoViraje";
import { useVoz } from "../features/instructor/useVoz";
import {
  avisoVoz,
  filtrarAviso,
  lecturaFinal,
  MEMORIA_VACIA,
  ordenVoz,
  paraVoz,
  pasoVoz,
  semaforo,
  textoEspera,
  textoPaso,
  type CampoAviso,
  type Luz,
  type MemoriaAviso,
  type PasoVoz,
} from "../features/instructor/voz";

const CELDAS: { campo: CampoAviso; nombre: string }[] = [
  { campo: "altitud", nombre: "Altitud" },
  { campo: "velocidad", nombre: "Velocidad" },
  { campo: "inclinacion", nombre: "Inclinación" },
  { campo: "bola", nombre: "Bola" },
];

const COLOR: Record<Luz, string> = {
  gris: "border-white/10 bg-white/5 text-white/40",
  verde: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200",
  ambar: "border-gold-500/50 bg-gold-500/20 text-gold-200",
  rojo: "border-red-500/50 bg-red-500/20 text-red-200",
};

const ESTADO = {
  conectado: { texto: "Conectado a MSFS", color: "text-emerald-300" },
  "sin-simulador": { texto: "Abre MSFS 2020 con el C172", color: "text-gold-300" },
  "sin-lector": { texto: "No encuentro el lector: ábrelo otra vez", color: "text-red-300" },
} as const;

/** El instructor en su propia ventana: lo que abre el lector, pensado para un segundo monitor o para solo escucharse. */
export function InstructorPrograma() {
  const { user } = useAuth();
  const {
    estado, muestra, modo, cambiarModo, modoIntento, ev, resultado, anulado, enCurso,
    iniciar, guardado, guardar, intento, numero, mandar, envio,
  } = useIntentoViraje();
  const voz = useVoz();
  const pasoAntes = useRef<PasoVoz | null>(null);
  const memoria = useRef<MemoriaAviso>(MEMORIA_VACIA);

  const paso = pasoVoz(ev, muestra);
  const luces = semaforo(ev, muestra);
  const aviso = avisoVoz(ev, muestra, modoIntento);

  // Órdenes al cambiar de paso, avisos sin repetir y la lectura completa al terminar.
  const { decir } = voz;
  useEffect(() => {
    const antes = pasoAntes.current;
    pasoAntes.current = paso;
    if (paso === "terminado" && antes !== "terminado" && resultado) {
      decir(lecturaFinal(resultado), { final: true });
      return;
    }
    const orden = ordenVoz(antes, paso, ev);
    // Tras un intento anulado se vuelve a armar casi al instante: la orden nueva espera a que termine el motivo.
    if (orden) decir(paraVoz(orden), { encolar: antes === "invalido" });
    if (!muestra) return;
    const filtrado = filtrarAviso(memoria.current, aviso, muestra.t);
    memoria.current = filtrado.mem;
    if (filtrado.decir) decir(paraVoz(filtrado.decir));
  }, [paso, ev, muestra, aviso, resultado, decir]);

  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-4">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="font-display text-base font-bold text-white">Instructor virtual · Viraje escarpado C172</h1>
        <span className={`text-xs ${ESTADO[estado].color}`}>{ESTADO[estado].texto}</span>
      </header>

      <section className="space-y-3 rounded-xl border border-white/10 bg-navy-900/60 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div role="radiogroup" aria-label="Modo" className="inline-flex rounded-full border border-white/15 p-1">
            {(["practica", "checkride"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={modo === m}
                disabled={enCurso && ev?.fase !== "armado"}
                onClick={() => cambiarModo(m)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${modo === m ? "bg-gold-500 text-navy-950" : "text-white/70"}`}
              >
                {m === "practica" ? "Práctica" : "Checkride"}
              </button>
            ))}
          </div>
          {resultado && (
            <Button onClick={iniciar} disabled={estado !== "conectado"}>
              Otro intento
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
          <button type="button" onClick={() => voz.setActiva(!voz.activa)} aria-pressed={voz.activa} className="inline-flex items-center gap-1.5">
            {voz.activa ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />} Voz
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={voz.volumen}
            onChange={(e) => voz.setVolumen(Number(e.target.value))}
            aria-label="Volumen de la voz"
            className="w-28 accent-gold-500"
          />
          <button
            type="button"
            onClick={() => voz.decir("Hola, soy tu instructor. Así me vas a escuchar.")}
            className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80"
          >
            Probar voz
          </button>
          <span className="text-xs text-white/40">{voz.nombreVoz ?? "Sin voz en español"}</span>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-navy-950/60 p-5" aria-live="polite">
        <p className="font-display text-2xl font-bold leading-snug text-white">
          {ev && ev.fase !== "invalido" ? textoPaso(paso) : estado === "conectado" ? textoEspera(muestra) : ESTADO[estado].texto}
        </p>
        {anulado && ev?.fase === "armado" && (
          <p className="mt-3 text-sm text-red-200">El intento anterior no se calificó: {anulado} Ya empezó otro.</p>
        )}
        {ev?.fase === "invalido" && <p className="mt-3 text-sm text-red-200">Intento sin calificar: {ev.motivo}</p>}
      </section>

      <section>
        <div className="grid grid-cols-4 gap-2">
          {CELDAS.map(({ campo, nombre }) => (
            <div key={campo} className={`rounded-lg border px-2 py-3 text-center text-xs font-semibold ${COLOR[luces[campo]]}`}>
              {nombre}
            </div>
          ))}
        </div>
        {aviso && (
          <p className={`mt-3 flex items-center gap-2 font-display text-lg font-bold ${aviso.nivel === "rojo" ? "text-red-300" : "text-gold-300"}`}>
            <AlertTriangle className="h-5 w-5 shrink-0" /> {aviso.texto}
          </p>
        )}
      </section>

      {resultado && (
        <div className="space-y-4">
          <HojaCheckride resultado={resultado} />
          <Explicacion resultado={resultado} />
          <ReporteExamen resultado={resultado} intento={intento} nombre={user?.nombre ?? "Cadete"} numero={numero} />
          <div className="text-center text-sm">
            {guardado.guardando && <p className="text-white/60">Guardando tu intento…</p>}
            {guardado.error && (
              <div className="space-y-2">
                <p className="text-red-300">No se pudo guardar: {guardado.error}</p>
                <Button variant="secondary" onClick={() => guardar(resultado, modoIntento)}>Reintentar guardar</Button>
              </div>
            )}
            {intento?.revision === "mandado" ? (
              <p className="text-emerald-300">Mandado. Erik lo revisa para tu insignia.</p>
            ) : (
              intento && puedeMandar(intento) && <Button onClick={mandar}>Mandar a revisión</Button>
            )}
            {envio && <p className="mt-2 text-red-300">{envio}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
