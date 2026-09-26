import { useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Download, Trash2 } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthContext";
import {
  borrarArchivos,
  borrarProximo,
  borrarVueloAventura,
  fetchProximo,
  fetchVuelosAventura,
  fetchVuelosVolanta,
  guardarProximo,
  insertarVueloAventura,
  subirArchivo,
  type ProximoDestino,
  type RedAventura,
  type VueloAventura,
  type VueloVolanta,
} from "../features/aventura/aventura";
import { distanciaNm, fechaMexico, formatoDuracion } from "../features/aventura/calculos";
import { FOUNDER_EMAIL } from "../lib/constants";
import { ROUTES } from "../lib/routes";

type Aeropuerto = [icao: string, nombre: string, lat: number, lon: number];

let baseAeropuertos: Promise<Map<string, Aeropuerto>> | null = null;
/** La base (OurAirports, dominio público) pesa unos 270 KB: solo se descarga al entrar aquí. */
function buscarAeropuerto(icao: string): Promise<Aeropuerto | undefined> {
  baseAeropuertos ??= import("../data/aeropuertos.json").then(
    (m) => new Map((m.default as Aeropuerto[]).map((a) => [a[0], a])),
  );
  return baseAeropuertos.then((mapa) => mapa.get(icao));
}

interface Extremo {
  icao: string;
  nombre: string;
  lat: string;
  lon: string;
}
const VACIO: Extremo = { icao: "", nombre: "", lat: "", lon: "" };

const INPUT =
  "w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60";

function Campo({ etiqueta, children, className = "" }: { etiqueta: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs text-white/60">{etiqueta}</span>
      {children}
    </label>
  );
}

function CamposAeropuerto({ titulo, valor, onChange }: { titulo: string; valor: Extremo; onChange: (e: Extremo) => void }) {
  const [aviso, setAviso] = useState("");

  async function alCambiarIcao(texto: string) {
    const icao = texto.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
    onChange({ ...valor, icao });
    setAviso("");
    if (icao.length !== 4) return;
    const a = await buscarAeropuerto(icao);
    if (a) onChange({ icao, nombre: a[1], lat: String(a[2]), lon: String(a[3]) });
    else setAviso("No está en la base: escribe el nombre y las coordenadas a mano.");
  }

  return (
    <fieldset className="grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-4">
      <legend className="px-1 font-display text-sm font-semibold text-white">{titulo}</legend>
      <Campo etiqueta="ICAO">
        <input className={INPUT} value={valor.icao} onChange={(e) => alCambiarIcao(e.target.value)} placeholder="MMGL" required />
      </Campo>
      <Campo etiqueta="Nombre" className="sm:col-span-3">
        <input className={INPUT} value={valor.nombre} onChange={(e) => onChange({ ...valor, nombre: e.target.value })} required />
      </Campo>
      <Campo etiqueta="Latitud">
        <input className={INPUT} inputMode="decimal" value={valor.lat} onChange={(e) => onChange({ ...valor, lat: e.target.value })} required />
      </Campo>
      <Campo etiqueta="Longitud">
        <input className={INPUT} inputMode="decimal" value={valor.lon} onChange={(e) => onChange({ ...valor, lon: e.target.value })} required />
      </Campo>
      {aviso && <p className="text-xs text-gold-400 sm:col-span-2">{aviso}</p>}
    </fieldset>
  );
}

export function AdminAventura() {
  const { user, loading: authLoading } = useAuth();
  const [vuelos, setVuelos] = useState<VueloAventura[]>([]);
  const [origen, setOrigen] = useState<Extremo>({ ...VACIO, icao: "MMGL" });
  const [destino, setDestino] = useState<Extremo>(VACIO);
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [avion, setAvion] = useState("Beechcraft A36TC");
  const [horas, setHoras] = useState("");
  const [minutos, setMinutos] = useState("");
  const [distancia, setDistancia] = useState("");
  const [fpm, setFpm] = useState("");
  const [red, setRed] = useState<RedAventura>("ivao");
  const [video, setVideo] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [deVolanta, setDeVolanta] = useState<VueloVolanta[] | null>(null);
  const [cargandoVolanta, setCargandoVolanta] = useState(false);
  const [errorVolanta, setErrorVolanta] = useState("");
  const [comoLoHice, setComoLoHice] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [plan, setPlan] = useState<File | null>(null);
  const [claveArchivos, setClaveArchivos] = useState(0);
  const [proximo, setProximo] = useState<Extremo>(VACIO);
  const [proximoActual, setProximoActual] = useState<ProximoDestino | null>(null);
  const [avisoProximo, setAvisoProximo] = useState("");

  const esFundador = user?.email === FOUNDER_EMAIL;

  // El siguiente vuelo sale de donde aterrizó el anterior: así no se salta ningún aeropuerto.
  useEffect(() => {
    if (authLoading || !esFundador) return;
    fetchProximo().then(setProximoActual);
    fetchVuelosAventura().then(async (lista) => {
      setVuelos(lista);
      const ultimo = lista[lista.length - 1];
      if (ultimo) {
        setOrigen({ icao: ultimo.destino_icao, nombre: ultimo.destino_nombre, lat: String(ultimo.destino_lat), lon: String(ultimo.destino_lon) });
      } else {
        const a = await buscarAeropuerto("MMGL");
        if (a) setOrigen({ icao: a[0], nombre: a[1], lat: String(a[2]), lon: String(a[3]) });
      }
    });
  }, [authLoading, esFundador]);

  if (authLoading) return null;
  if (!esFundador) return <Navigate to={ROUTES.home} replace />;

  const textos = [origen.lat, origen.lon, destino.lat, destino.lon];
  const sugerida = textos.every((t) => t.trim() !== "" && Number.isFinite(Number(t)))
    ? distanciaNm(...(textos.map(Number) as [number, number, number, number]))
    : null;

  async function traerDeVolanta() {
    setCargandoVolanta(true);
    setErrorVolanta("");
    const { vuelos: lista, error: fallo } = await fetchVuelosVolanta();
    setCargandoVolanta(false);
    if (fallo) return setErrorVolanta(fallo);
    setDeVolanta(lista);
  }

  async function extremo(icao: string): Promise<Extremo> {
    const a = await buscarAeropuerto(icao);
    return a ? { icao, nombre: a[1], lat: String(a[2]), lon: String(a[3]) } : { ...VACIO, icao };
  }

  /** Vuelca un vuelo de Volanta en el formulario. Tú lo revisas, pones el video y lo guardas. */
  async function usarVuelo(v: VueloVolanta) {
    setOrigen(await extremo(v.origen));
    setDestino(await extremo(v.destino));
    setFecha(fechaMexico(v.salida));
    setAvion(v.matricula ? `${v.avion} (${v.matricula})` : v.avion);
    const total = Math.max(1, Math.round(v.minutos));
    setHoras(String(Math.floor(total / 60)));
    setMinutos(String(total % 60));
    setDistancia("");
    setFpm(v.aterrizaje === 0 ? "" : String(Math.round(v.aterrizaje)));
    window.scrollTo({ top: document.getElementById("formulario-vuelo")?.offsetTop ?? 0, behavior: "smooth" });
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setError("");
    const duracion = Number(horas || 0) * 60 + Number(minutos || 0);
    const nm = Number(distancia || sugerida);
    const num = (t: string) => (t.trim() === "" ? NaN : Number(t));
    const [oLat, oLon, dLat, dLon] = [num(origen.lat), num(origen.lon), num(destino.lat), num(destino.lon)];
    if (![oLat, oLon, dLat, dLon].every(Number.isFinite)) return setError("Revisa las coordenadas.");
    if (!(duracion > 0)) return setError("Escribe la duración del vuelo.");
    if (!Number.isFinite(nm) || nm < 0) return setError("Revisa la distancia.");
    if (video && !video.startsWith("https://")) return setError("El link del video debe empezar con https://");

    setGuardando(true);
    const imagenSubida = imagen ? await subirArchivo("imagen", imagen) : null;
    const planSubido = plan ? await subirArchivo("plan", plan) : null;
    const falloSubida = imagenSubida?.error ?? planSubido?.error;
    if (falloSubida) {
      await borrarArchivos({ plan_imagen_path: imagenSubida?.path ?? null, plan_archivo_path: planSubido?.path ?? null });
      setGuardando(false);
      return setError(`No se pudo subir el archivo: ${falloSubida}`);
    }
    const { error: fallo } = await insertarVueloAventura({
      fecha,
      origen_icao: origen.icao,
      origen_nombre: origen.nombre.trim(),
      origen_lat: oLat,
      origen_lon: oLon,
      destino_icao: destino.icao,
      destino_nombre: destino.nombre.trim(),
      destino_lat: dLat,
      destino_lon: dLon,
      avion: avion.trim(),
      minutos: Math.round(duracion),
      distancia_nm: Math.round(nm),
      aterrizaje_fpm: fpm.trim() === "" ? null : Math.round(Number(fpm)),
      red,
      video_url: video.trim() || null,
      notas: notas.trim() || null,
      como_lo_hice: comoLoHice.trim() || null,
      plan_imagen_path: imagenSubida?.path ?? null,
      plan_archivo_path: planSubido?.path ?? null,
      plan_archivo_nombre: plan?.name ?? null,
    });
    setGuardando(false);
    if (fallo) {
      await borrarArchivos({ plan_imagen_path: imagenSubida?.path ?? null, plan_archivo_path: planSubido?.path ?? null });
      return setError(`No se pudo guardar: ${fallo.message}`);
    }

    const lista = await fetchVuelosAventura();
    setVuelos(lista);
    setOrigen(destino);
    setDestino(VACIO);
    setHoras("");
    setMinutos("");
    setDistancia("");
    setFpm("");
    setVideo("");
    setNotas("");
    setComoLoHice("");
    setImagen(null);
    setPlan(null);
    setClaveArchivos((n) => n + 1);
    // Si el vuelo terminó en el próximo destino anunciado, ya no es "próximo": es completado.
    if (proximoActual?.icao === destino.icao) {
      await borrarProximo();
      setProximoActual(null);
    }
  }

  async function fijarProximo() {
    setAvisoProximo("");
    const [lat, lon] = [Number(proximo.lat), Number(proximo.lon)];
    if (proximo.icao.length !== 4 || !proximo.nombre.trim() || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      return setAvisoProximo("Revisa el aeropuerto: ICAO, nombre y coordenadas.");
    }
    const nuevo = { icao: proximo.icao, nombre: proximo.nombre.trim(), lat, lon };
    const { error: fallo } = await guardarProximo(nuevo);
    if (fallo) return setAvisoProximo(`No se pudo guardar: ${fallo.message}`);
    setProximoActual(nuevo);
    setProximo(VACIO);
  }

  async function quitarProximo() {
    await borrarProximo();
    setProximoActual(null);
  }

  async function borrar(v: VueloAventura) {
    if (!window.confirm(`¿Borrar el vuelo ${v.origen_icao} → ${v.destino_icao}?`)) return;
    const { error: fallo } = await borrarVueloAventura(v.id);
    if (fallo) return;
    await borrarArchivos(v);
    setVuelos((prev) => prev.filter((x) => x.id !== v.id));
  }

  return (
    <div>
      <PageHero
        eyebrow="Panel del fundador"
        title="Registrar un vuelo de la aventura"
        description="Llénalo al aterrizar. El origen ya viene con el destino del vuelo anterior."
      />
      <Container className="py-12 md:py-16">
        <section className="mb-8 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-white">Traer desde Volanta</h2>
              <p className="mt-1 text-xs text-white/55">Elige un vuelo y el formulario se llena solo. Tú lo revisas antes de guardar.</p>
            </div>
            <Button variant="secondary" onClick={traerDeVolanta} disabled={cargandoVolanta}>
              <Download size={15} /> {cargandoVolanta ? "Consultando..." : "Traer mis vuelos"}
            </Button>
          </div>
          {errorVolanta && <p role="alert" className="mt-3 text-sm text-red-300">{errorVolanta}</p>}
          {deVolanta && (
            <ul className="mt-4 flex flex-col gap-2">
              {deVolanta.map((v) => {
                const registrado = vuelos.some(
                  (x) => x.fecha === fechaMexico(v.salida) && x.origen_icao === v.origen && x.destino_icao === v.destino,
                );
                return (
                  <li key={v.id}>
                    <button
                      type="button"
                      disabled={registrado}
                      onClick={() => usarVuelo(v)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 px-4 py-2.5 text-left text-sm text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:border-gold-500/40"
                    >
                      <span>
                        {fechaMexico(v.salida)} · {v.origen} → {v.destino}
                        <span className="text-white/50"> · {v.avion} · {formatoDuracion(Math.max(1, Math.round(v.minutos)))}</span>
                      </span>
                      {registrado && <span className="shrink-0 text-xs text-white/50">ya registrado</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <form id="formulario-vuelo" onSubmit={guardar} className="flex max-w-3xl flex-col gap-4">
          <CamposAeropuerto titulo="Origen" valor={origen} onChange={setOrigen} />
          <CamposAeropuerto titulo="Destino" valor={destino} onChange={setDestino} />

          <div className="grid gap-3 sm:grid-cols-4">
            <Campo etiqueta="Fecha">
              <input type="date" className={INPUT} value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </Campo>
            <Campo etiqueta="Avión" className="sm:col-span-2">
              <input className={INPUT} value={avion} onChange={(e) => setAvion(e.target.value)} required />
            </Campo>
            <Campo etiqueta="Red">
              <select className={INPUT} value={red} onChange={(e) => setRed(e.target.value as RedAventura)}>
                <option value="ivao">IVAO</option>
                <option value="vatsim">VATSIM</option>
                <option value="ninguna">Sin red</option>
              </select>
            </Campo>
            <Campo etiqueta="Horas">
              <input type="number" min="0" className={INPUT} value={horas} onChange={(e) => setHoras(e.target.value)} placeholder="1" />
            </Campo>
            <Campo etiqueta="Minutos">
              <input type="number" min="0" max="59" className={INPUT} value={minutos} onChange={(e) => setMinutos(e.target.value)} placeholder="25" />
            </Campo>
            <Campo etiqueta={`Distancia NM${sugerida !== null ? ` (recta: ${sugerida})` : ""}`}>
              <input type="number" min="0" className={INPUT} value={distancia} onChange={(e) => setDistancia(e.target.value)} placeholder={sugerida === null ? "" : String(sugerida)} />
            </Campo>
            <Campo etiqueta="Aterrizaje (fpm)">
              <input type="number" className={INPUT} value={fpm} onChange={(e) => setFpm(e.target.value)} placeholder="-180" />
            </Campo>
          </div>

          <Campo etiqueta="Cómo lo hice (opcional: altitud de crucero, ruta, clima, consejos para quien quiera repetirlo)">
            <textarea className={INPUT} rows={4} value={comoLoHice} onChange={(e) => setComoLoHice(e.target.value)} />
          </Campo>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="Imagen del plan de vuelo (PNG, JPG o WebP, máx. 5 MB)">
              <input
                key={`img-${claveArchivos}`}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className={INPUT}
                onChange={(e) => setImagen(e.target.files?.[0] ?? null)}
              />
            </Campo>
            <Campo etiqueta="Archivo del plan (.pln, .lnmpln, .fms…, máx. 1 MB)">
              <input key={`plan-${claveArchivos}`} type="file" className={INPUT} onChange={(e) => setPlan(e.target.files?.[0] ?? null)} />
            </Campo>
          </div>
          <Campo etiqueta="Link del video (https://…, opcional)">
            <input className={INPUT} value={video} onChange={(e) => setVideo(e.target.value)} />
          </Campo>
          <Campo etiqueta="Notas (opcional)">
            <textarea className={INPUT} rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} />
          </Campo>

          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          <div>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar vuelo"}
            </Button>
          </div>
        </form>

        <section className="mt-14 flex max-w-3xl flex-col gap-3">
          <h2 className="font-display text-xl font-semibold text-white">Próximo destino</h2>
          <p className="text-sm text-white/60">
            {proximoActual
              ? `Ahora: ${proximoActual.icao} · ${proximoActual.nombre}. Se quita solo cuando registres un vuelo que aterrice ahí.`
              : "Anuncia a dónde vas: se dibuja punteado en el mapa."}
          </p>
          {proximoActual && (
            <div>
              <Button variant="secondary" onClick={quitarProximo}>Quitar próximo destino</Button>
            </div>
          )}
          <CamposAeropuerto titulo="Nuevo próximo destino" valor={proximo} onChange={setProximo} />
          {avisoProximo && <p role="alert" className="text-sm text-red-300">{avisoProximo}</p>}
          <div>
            <Button variant="secondary" onClick={fijarProximo}>Fijar próximo destino</Button>
          </div>
        </section>

        <h2 className="mt-14 font-display text-xl font-semibold text-white">Vuelos registrados ({vuelos.length})</h2>
        <div className="mt-4 flex max-w-3xl flex-col gap-2">
          {[...vuelos].reverse().map((v) => (
            <div key={v.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-sm text-white">
                {v.fecha} · {v.origen_icao} → {v.destino_icao}
                <span className="text-white/50"> · {v.avion} · {formatoDuracion(v.minutos)} · {v.distancia_nm} NM</span>
              </p>
              <button
                type="button"
                onClick={() => borrar(v)}
                aria-label={`Borrar el vuelo ${v.origen_icao} a ${v.destino_icao}`}
                className="shrink-0 rounded p-2 text-white/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 [@media(hover:hover)_and_(pointer:fine)]:hover:text-red-300"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
