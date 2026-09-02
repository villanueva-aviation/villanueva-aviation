import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ROUTES } from "../lib/routes";

interface Fila {
  id: string;
  nombre: string;
  peso: string;
  brazo: string;
}

const FILAS_INICIALES: Fila[] = [
  { id: "vacio", nombre: "Peso vacío de la aeronave", peso: "", brazo: "39.0" },
  { id: "delanteros", nombre: "Asientos delanteros (piloto + copiloto)", peso: "", brazo: "37.0" },
  { id: "traseros", nombre: "Asientos traseros", peso: "", brazo: "73.0" },
  { id: "combustible", nombre: "Combustible", peso: "", brazo: "48.0" },
  { id: "equipaje", nombre: "Equipaje", peso: "", brazo: "95.0" },
];

function num(v: string) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export function PesoBalance() {
  const [filas, setFilas] = useState<Fila[]>(FILAS_INICIALES);
  const [pesoMaximo, setPesoMaximo] = useState("2550");
  const [cgMin, setCgMin] = useState("35.0");
  const [cgMax, setCgMax] = useState("47.3");

  function actualizar(id: string, campo: "peso" | "brazo", valor: string) {
    setFilas((prev) => prev.map((f) => (f.id === id ? { ...f, [campo]: valor } : f)));
  }

  const { totalPeso, totalMomento, cg } = useMemo(() => {
    let peso = 0;
    let momento = 0;
    for (const f of filas) {
      const p = num(f.peso);
      const b = num(f.brazo);
      peso += p;
      momento += p * b;
    }
    return { totalPeso: peso, totalMomento: momento, cg: peso > 0 ? momento / peso : 0 };
  }, [filas]);

  const pesoOk = totalPeso <= num(pesoMaximo) || num(pesoMaximo) === 0;
  const cgOk = totalPeso === 0 || (cg >= num(cgMin) && cg <= num(cgMax));

  return (
    <div>
      <PageHero
        eyebrow="Formulario oficial"
        title="Peso y balance"
        description="Calcula el peso total y el centro de gravedad de tu vuelo. Los brazos precargados son un ejemplo genérico — reemplázalos con los datos reales de tu aeronave (POH)."
      >
        <Link
          to={ROUTES.descargas}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-gold-400 print:hidden"
        >
          <ArrowLeft size={15} />
          Volver a Descargas
        </Link>
      </PageHero>

      <Container className="py-12 md:py-16 print:py-0">
        <div className="flex justify-end print:hidden">
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer size={16} /> Imprimir
          </Button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 print:border-none print:bg-transparent print:p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-white/45 print:text-black/60">
                  <th className="pb-2 pr-2">Elemento</th>
                  <th className="pb-2 pr-2">Peso</th>
                  <th className="pb-2 pr-2">Brazo (in)</th>
                  <th className="pb-2">Momento</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={f.id} className="border-t border-white/10 print:border-black/20">
                    <td className="py-1.5 pr-2 text-white/80 print:text-black">{f.nombre}</td>
                    <td className="py-1.5 pr-2">
                      <input
                        value={f.peso}
                        onChange={(e) => actualizar(f.id, "peso", e.target.value)}
                        className="w-24 rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 text-white outline-none transition-colors focus:border-gold-500/50 print:border-black/30 print:bg-transparent print:text-black"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        value={f.brazo}
                        onChange={(e) => actualizar(f.id, "brazo", e.target.value)}
                        className="w-24 rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 text-white outline-none transition-colors focus:border-gold-500/50 print:border-black/30 print:bg-transparent print:text-black"
                      />
                    </td>
                    <td className="py-1.5 text-white/60 print:text-black">{(num(f.peso) * num(f.brazo)).toFixed(1)}</td>
                  </tr>
                ))}
                <tr className="border-t border-white/20 font-semibold print:border-black/30">
                  <td className="py-2 text-white print:text-black">Total</td>
                  <td className="py-2 text-white print:text-black">{totalPeso.toFixed(1)}</td>
                  <td></td>
                  <td className="py-2 text-white print:text-black">{totalMomento.toFixed(1)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-sm text-white/70 print:text-black">
              Peso máximo certificado
              <input
                value={pesoMaximo}
                onChange={(e) => setPesoMaximo(e.target.value)}
                className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-white outline-none transition-colors focus:border-gold-500/50 print:border-black/30 print:bg-transparent print:text-black"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-white/70 print:text-black">
              CG mínimo (in)
              <input
                value={cgMin}
                onChange={(e) => setCgMin(e.target.value)}
                className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-white outline-none transition-colors focus:border-gold-500/50 print:border-black/30 print:bg-transparent print:text-black"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-white/70 print:text-black">
              CG máximo (in)
              <input
                value={cgMax}
                onChange={(e) => setCgMax(e.target.value)}
                className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-white outline-none transition-colors focus:border-gold-500/50 print:border-black/30 print:bg-transparent print:text-black"
              />
            </label>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 print:border-black/20">
              <p className="text-xs uppercase tracking-wide text-white/45 print:text-black/60">Peso total</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-display text-2xl font-semibold text-white print:text-black">{totalPeso.toFixed(1)}</span>
                <Badge tone={pesoOk ? "green" : "red"}>{pesoOk ? "Dentro de límite" : "Excede el máximo"}</Badge>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 print:border-black/20">
              <p className="text-xs uppercase tracking-wide text-white/45 print:text-black/60">Centro de gravedad (CG)</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-display text-2xl font-semibold text-white print:text-black">{cg.toFixed(2)} in</span>
                <Badge tone={cgOk ? "green" : "red"}>{cgOk ? "Dentro del envolvente" : "Fuera del envolvente"}</Badge>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
