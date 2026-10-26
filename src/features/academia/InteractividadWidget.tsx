import { Lock } from "lucide-react";
import { ACADEMIA_MODULOS, type InteractividadTipo, type ModuloActividad } from "../../data/academia";
import { MODULE_TERMS, MODULE_SCENARIOS, MODULE_SLIDERS } from "../../data/moduleContent";
import { AUDIO_SETS } from "../../data/fraseologiaATC";
import { HotspotDiagram } from "./HotspotDiagram";
import { DragDropLabels } from "./DragDropLabels";
import { ScenarioSimulator } from "./ScenarioSimulator";
import { DragSlider } from "./DragSlider";
import { AudioPhraseology } from "./AudioPhraseology";
import { CircuitoTrafico } from "./CircuitoTrafico";
import { TermMatch } from "./TermMatch";

export const INTERACTIVIDAD_INTRO: Record<InteractividadTipo, string> = {
  diagrama: "Explora el diagrama y haz clic en cada componente para conocer su función.",
  dragdrop: "Practica una vez más, esta vez arrastrando el nombre correcto a su lugar en la aeronave.",
  escenario: "Toma decisiones en un escenario de vuelo y descubre las consecuencias de cada una.",
  slider: "Mueve el control y observa en vivo cómo cambian las variables involucradas.",
  audio: "Escucha la fraseología correcta y compárala con lo que tú dirías en cada situación.",
  terminos: "Relaciona cada término con su definición correcta.",
  circuito: "Recorre el circuito de tráfico paso a paso, luego pon a prueba tu ubicación.",
};

function EnPreparacion() {
  return (
    <p className="flex items-center gap-2 text-sm text-white/45">
      <Lock size={14} /> Contenido en preparación — se publicará próximamente.
    </p>
  );
}

export function InteractividadWidget({
  modulo,
  actividad,
  onComplete,
}: {
  modulo: (typeof ACADEMIA_MODULOS)[number];
  actividad: ModuloActividad;
  onComplete: () => void;
}) {
  switch (actividad.widget) {
    case "dragdrop":
      return <DragDropLabels onComplete={onComplete} setId={actividad.hotspotSetId} />;
    case "escenario": {
      const scenario = MODULE_SCENARIOS[actividad.scenarioId ?? modulo.slug];
      // Sin árbol no hay nada que simular: antes caía a un escenario de ejemplo
      // que no tenía que ver con el módulo, y nadie lo notaba.
      if (!scenario) return <EnPreparacion />;
      return <ScenarioSimulator tree={scenario.tree} startId={scenario.startId} />;
    }
    case "slider": {
      const config = MODULE_SLIDERS[modulo.slug];
      // Sin configuración no hay simulador: antes caía a un ejemplo del
      // componente que resultaba ser el de otro módulo.
      if (!config) return <EnPreparacion />;
      return <DragSlider config={config} />;
    }
    case "audio":
      return <AudioPhraseology onComplete={onComplete} cards={AUDIO_SETS[actividad.audioSetId ?? ""]} />;
    case "terminos": {
      const pairs = MODULE_TERMS[actividad.termSetId ?? modulo.slug] ?? [];
      return <TermMatch pairs={pairs} onComplete={onComplete} />;
    }
    case "circuito":
      return (
        <CircuitoTrafico
          onComplete={onComplete}
          setId={actividad.circuitoSetId}
          modoInicial={actividad.circuitoSoloPrueba ? "prueba" : "aprende"}
        />
      );
    case "diagrama":
    default:
      return <HotspotDiagram setId={actividad.hotspotSetId} />;
  }
}
