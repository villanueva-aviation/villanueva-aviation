import { AudioPhraseologyPage } from "../features/academia/AudioPhraseologyPage";
import { FRASEOLOGIA_RODAJE_DESPEGUE } from "../data/fraseologiaATC";

export function AudioRodajeDespegue() {
  return (
    <AudioPhraseologyPage
      titulo="Fraseología ATC: rodaje y despegue"
      descripcion="Escucha la fraseología correcta para cada situación y compárala con lo que tú dirías, desde la solicitud de rodaje hasta la autorización de despegue."
      cards={FRASEOLOGIA_RODAJE_DESPEGUE}
    />
  );
}
