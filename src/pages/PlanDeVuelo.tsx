import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Printer, Trash2 } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { ROUTES } from "../lib/routes";

interface Tramo {
  id: string;
  punto: string;
  rumbo: string;
  distancia: string;
  velocidad: string;
  tiempo: string;
  combustible: string;
}

function nuevoTramo(): Tramo {
  return { id: crypto.randomUUID(), punto: "", rumbo: "", distancia: "", velocidad: "", tiempo: "", combustible: "" };
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-white/70">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-gold-500/50 print:border-black/30 print:bg-transparent print:text-black"
      />
    </label>
  );
}

export function PlanDeVuelo() {
  const [piloto, setPiloto] = useState("");
  const [matricula, setMatricula] = useState("");
  const [fecha, setFecha] = useState("");
  const [aeronave, setAeronave] = useState("");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [alterno, setAlterno] = useState("");
  const [viento, setViento] = useState("");
  const [visibilidad, setVisibilidad] = useState("");
  const [techo, setTecho] = useState("");
  const [tramos, setTramos] = useState<Tramo[]>([nuevoTramo(), nuevoTramo(), nuevoTramo()]);
  const [combSalida, setCombSalida] = useState("");
  const [combRuta, setCombRuta] = useState("");
  const [combReserva, setCombReserva] = useState("");
  const [combAlterno, setCombAlterno] = useState("");
  const [combBordo, setCombBordo] = useState("");
  const [notas, setNotas] = useState("");

  function actualizarTramo(id: string, campo: keyof Tramo, valor: string) {
    setTramos((prev) => prev.map((t) => (t.id === id ? { ...t, [campo]: valor } : t)));
  }

  return (
    <div>
      <PageHero
        eyebrow="Plantilla interactiva"
        title="Plan de vuelo VFR"
        description="Llena el formato en pantalla para practicar la planificación de un vuelo — luego imprímelo o pásalo a tu bitácora oficial."
      >
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to={ROUTES.descargas}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-gold-400 print:hidden"
          >
            <ArrowLeft size={15} />
            Volver a Descargas
          </Link>
        </div>
      </PageHero>

      <Container className="py-12 md:py-16 print:py-0">
        <div className="flex justify-end print:hidden">
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer size={16} /> Imprimir
          </Button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 print:border-none print:bg-transparent print:p-0">
          <h3 className="font-display text-base font-semibold text-white print:text-black">Datos generales</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Piloto" value={piloto} onChange={setPiloto} />
            <Field label="Matrícula" value={matricula} onChange={setMatricula} />
            <Field label="Fecha" value={fecha} onChange={setFecha} />
            <Field label="Aeronave (tipo)" value={aeronave} onChange={setAeronave} />
          </div>

          <h3 className="mt-8 font-display text-base font-semibold text-white print:text-black">Ruta</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Origen (ICAO)" value={origen} onChange={setOrigen} />
            <Field label="Destino (ICAO)" value={destino} onChange={setDestino} />
            <Field label="Alterno (ICAO)" value={alterno} onChange={setAlterno} />
          </div>

          <h3 className="mt-8 font-display text-base font-semibold text-white print:text-black">Meteorología</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Viento en ruta" value={viento} onChange={setViento} />
            <Field label="Visibilidad" value={visibilidad} onChange={setVisibilidad} />
            <Field label="Techo de nubes" value={techo} onChange={setTecho} />
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-white print:text-black">Tramos de navegación</h3>
            <button
              onClick={() => setTramos((prev) => [...prev, nuevoTramo()])}
              className="flex items-center gap-1.5 text-sm font-medium text-gold-400 transition-colors hover:text-gold-300 print:hidden"
            >
              <Plus size={15} /> Agregar tramo
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-white/45 print:text-black/60">
                  <th className="pb-2 pr-2">Punto</th>
                  <th className="pb-2 pr-2">Rumbo (°M)</th>
                  <th className="pb-2 pr-2">Dist. (NM)</th>
                  <th className="pb-2 pr-2">Vel. (kt)</th>
                  <th className="pb-2 pr-2">Tiempo (min)</th>
                  <th className="pb-2 pr-2">Combustible (L)</th>
                  <th className="pb-2 print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {tramos.map((t) => (
                  <tr key={t.id} className="border-t border-white/10 print:border-black/20">
                    {(["punto", "rumbo", "distancia", "velocidad", "tiempo", "combustible"] as const).map((campo) => (
                      <td key={campo} className="py-1.5 pr-2">
                        <input
                          value={t[campo]}
                          onChange={(e) => actualizarTramo(t.id, campo, e.target.value)}
                          className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 text-white outline-none transition-colors focus:border-gold-500/50 print:border-black/30 print:bg-transparent print:text-black"
                        />
                      </td>
                    ))}
                    <td className="py-1.5 print:hidden">
                      <button
                        onClick={() => setTramos((prev) => prev.filter((x) => x.id !== t.id))}
                        className="text-white/30 transition-colors hover:text-red-400"
                        title="Eliminar tramo"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-8 font-display text-base font-semibold text-white print:text-black">Combustible</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Field label="Salida (L)" value={combSalida} onChange={setCombSalida} />
            <Field label="Ruta (L)" value={combRuta} onChange={setCombRuta} />
            <Field label="Reserva (L)" value={combReserva} onChange={setCombReserva} />
            <Field label="Al alterno (L)" value={combAlterno} onChange={setCombAlterno} />
            <Field label="A bordo (L)" value={combBordo} onChange={setCombBordo} />
          </div>

          <h3 className="mt-8 font-display text-base font-semibold text-white print:text-black">Notas / NOTAMs</h3>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={4}
            className="mt-3 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-gold-500/50 print:border-black/30 print:bg-transparent print:text-black"
          />
        </div>
      </Container>
    </div>
  );
}
