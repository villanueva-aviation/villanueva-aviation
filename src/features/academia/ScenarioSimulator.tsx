import { useState } from "react";
import { AlertTriangle, CheckCircle2, RotateCcw, XCircle } from "lucide-react";

export interface ScenarioOption {
  label: string;
  next: string;
}

export interface ScenarioNode {
  id: string;
  prompt: string;
  options: ScenarioOption[];
  outcome?: { correct: boolean; feedback: string };
}

const DEFAULT_SCENARIO: Record<string, ScenarioNode> = {
  inicio: {
    id: "inicio",
    prompt:
      "Vuelas VFR de MMGL a MMZO. A 30 millas de tu destino notas que la visibilidad empieza a bajar y el techo de nubes desciende.",
    options: [
      { label: "Continuar el plan original, seguro que mejora", next: "continua-ciego" },
      { label: "Consultar el clima actualizado de MMZO y alternos", next: "consulta-clima" },
    ],
  },
  "continua-ciego": {
    id: "continua-ciego",
    prompt: "",
    options: [],
    outcome: {
      correct: false,
      feedback:
        "Continuar sin más información es el error más común que lleva a VFR-en-IMC. Siempre reevalúa cuando las condiciones cambian, no asumas que van a mejorar.",
    },
  },
  "consulta-clima": {
    id: "consulta-clima",
    prompt:
      "El METAR de MMZO reporta techo bajo y visibilidad reducida por debajo de mínimos VFR. Tienes combustible para 40 minutos adicionales.",
    options: [
      { label: "Desviarte a un aeropuerto alterno con mejor clima", next: "desvio-bueno" },
      { label: "Intentar aterrizar de todas formas, ya casi llegas", next: "aterrizaje-forzado" },
    ],
  },
  "desvio-bueno": {
    id: "desvio-bueno",
    prompt: "",
    options: [],
    outcome: {
      correct: true,
      feedback:
        "Correcto. Desviarte a tiempo, con combustible de sobra y antes de quedar en una situación sin salidas, es exactamente la decisión que se espera de un piloto VFR.",
    },
  },
  "aterrizaje-forzado": {
    id: "aterrizaje-forzado",
    prompt: "",
    options: [],
    outcome: {
      correct: false,
      feedback:
        "Intentar aterrizar por debajo de mínimos VFR es una de las causas principales de accidentes CFIT (vuelo controlado contra el terreno). La proximidad al destino nunca justifica romper los mínimos.",
    },
  },
};

export function ScenarioSimulator({
  tree = DEFAULT_SCENARIO,
  startId = "inicio",
}: {
  tree?: Record<string, ScenarioNode>;
  startId?: string;
}) {
  const [nodeId, setNodeId] = useState(startId);
  const node = tree[nodeId];

  function restart() {
    setNodeId(startId);
  }

  if (node.outcome) {
    const { correct, feedback } = node.outcome;
    return (
      <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${
            correct ? "border-gold-500 bg-gold-500/10 text-gold-400" : "border-red-500/50 bg-red-500/10 text-red-400"
          }`}
        >
          {correct ? <CheckCircle2 size={26} /> : <XCircle size={26} />}
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-white">
          {correct ? "Buena decisión" : "Esa decisión pone en riesgo el vuelo"}
        </h3>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/65">{feedback}</p>
        <button
          onClick={restart}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-gold-500/40 hover:text-gold-400"
        >
          <RotateCcw size={14} /> Repetir escenario
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-gold-400" />
        <p className="text-sm leading-relaxed text-white/80">{node.prompt}</p>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {node.options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => setNodeId(opt.next)}
            className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left text-sm text-white/85 transition-all duration-200 hover:border-gold-500/30 hover:bg-white/[0.05]"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
