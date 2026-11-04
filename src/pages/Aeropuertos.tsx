import { MMGL } from "../data/aeropuertos/mmgl";
import { MMMX } from "../data/aeropuertos/mmmx";
import { MMMY } from "../data/aeropuertos/mmmy";
import { GuiaAeropuerto, type Guia } from "../features/aeropuertos/GuiaAeropuerto";

const GUIAS: { guia: Guia; nombre: string }[] = [
  { guia: MMGL, nombre: "Guadalajara (MMGL)" },
  { guia: MMMX, nombre: "Ciudad de México (MMMX)" },
  { guia: MMMY, nombre: "Monterrey (MMMY)" },
];

const pagina = (guia: Guia) => () => (
  <GuiaAeropuerto guia={guia} otras={GUIAS.filter((g) => g.guia !== guia).map((g) => ({ nombre: g.nombre, ruta: g.guia.ruta }))} />
);

export const AeropuertoMMGL = pagina(MMGL);
export const AeropuertoMMMX = pagina(MMMX);
export const AeropuertoMMMY = pagina(MMMY);
