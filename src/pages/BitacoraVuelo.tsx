import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Printer, Trash2 } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { ROUTES } from "../lib/routes";

interface Entrada {
  id: string;
  fecha: string;
  matricula: string;
  origen: string;
  destino: string;
  salida: string;
  llegada: string;
  tiempoTotal: string;
  tipo: string;
  aterrizajes: string;
  observaciones: string;
}

const CAMPOS: { key: keyof Omit<Entrada, "id">; label: string; width?: string }[] = [
  { key: "fecha", label: "Fecha" },
  { key: "matricula", label: "Matrícula" },
  { key: "origen", label: "Origen" },
  { key: "destino", label: "Destino" },
  { key: "salida", label: "Salida" },
  { key: "llegada", label: "Llegada" },
  { key: "tiempoTotal", label: "Tiempo total" },
  { key: "tipo", label: "Tipo (VFR/IFR, día/noche)" },
  { key: "aterrizajes", label: "Aterrizajes" },
  { key: "observaciones", label: "Observaciones", width: "min-w-[160px]" },
];

function nuevaEntrada(): Entrada {
  return {
    id: crypto.randomUUID(),
    fecha: "",
    matricula: "",
    origen: "",
    destino: "",
    salida: "",
    llegada: "",
    tiempoTotal: "",
    tipo: "",
    aterrizajes: "",
    observaciones: "",
  };
}

export function BitacoraVuelo() {
  const [entradas, setEntradas] = useState<Entrada[]>([nuevaEntrada(), nuevaEntrada(), nuevaEntrada(), nuevaEntrada(), nuevaEntrada()]);

  function actualizar(id: string, campo: keyof Entrada, valor: string) {
    setEntradas((prev) => prev.map((e) => (e.id === id ? { ...e, [campo]: valor } : e)));
  }

  return (
    <div>
      <PageHero
        eyebrow="Formulario oficial"
        title="Bitácora de vuelo"
        description="Registra tus vuelos en pantalla e imprime tu bitácora — formato editable, listo para llenar."
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
        <div className="flex items-center justify-between print:hidden">
          <button
            onClick={() => setEntradas((prev) => [...prev, nuevaEntrada()])}
            className="flex items-center gap-1.5 text-sm font-medium text-gold-400 transition-colors hover:text-gold-300"
          >
            <Plus size={15} /> Agregar vuelo
          </button>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer size={16} /> Imprimir
          </Button>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-6 print:border-none print:bg-transparent print:p-0">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-white/45 print:text-black/60">
                {CAMPOS.map((c) => (
                  <th key={c.key} className="pb-2 pr-2">
                    {c.label}
                  </th>
                ))}
                <th className="pb-2 print:hidden"></th>
              </tr>
            </thead>
            <tbody>
              {entradas.map((e) => (
                <tr key={e.id} className="border-t border-white/10 print:border-black/20">
                  {CAMPOS.map((c) => (
                    <td key={c.key} className={`py-1.5 pr-2 ${c.width ?? ""}`}>
                      <input
                        value={e[c.key]}
                        onChange={(ev) => actualizar(e.id, c.key, ev.target.value)}
                        className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 text-white outline-none transition-colors focus:border-gold-500/50 print:border-black/30 print:bg-transparent print:text-black"
                      />
                    </td>
                  ))}
                  <td className="py-1.5 print:hidden">
                    <button
                      onClick={() => setEntradas((prev) => prev.filter((x) => x.id !== e.id))}
                      className="text-white/30 transition-colors hover:text-red-400"
                      title="Eliminar vuelo"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  );
}
