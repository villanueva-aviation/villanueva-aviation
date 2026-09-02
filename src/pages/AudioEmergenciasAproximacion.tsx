import { AudioPhraseologyPage } from "../features/academia/AudioPhraseologyPage";
import { FRASEOLOGIA_EMERGENCIAS_APROXIMACION } from "../data/fraseologiaATC";

export function AudioEmergenciasAproximacion() {
  return (
    <AudioPhraseologyPage
      titulo="Fraseología ATC: emergencias y aproximación"
      descripcion="Practica las llamadas de aproximación, tránsito y los dos niveles de emergencia por radio: PAN-PAN y MAYDAY."
      cards={FRASEOLOGIA_EMERGENCIAS_APROXIMACION}
    />
  );
}
