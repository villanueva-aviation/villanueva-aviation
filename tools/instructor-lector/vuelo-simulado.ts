// Escribe out/vuelo-mmgl.jsonl con el vuelo simulado, para el lector:
//   node --experimental-strip-types tools/instructor-lector/vuelo-simulado.ts
//   tools/instructor-lector/out/VillanuevaInstructorLector.exe --reproducir tools/instructor-lector/out/vuelo-mmgl.jsonl --rapido 10
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { simularVuelo } from "../../src/features/instructor/simularVuelo.ts";
import { AEROPUERTO_PRUEBA, aCrudo } from "../../src/features/instructor/aeropuertoSim.ts";

const ruta = new URL("./out/vuelo-mmgl.jsonl", import.meta.url);
mkdirSync(new URL("./out/", import.meta.url), { recursive: true });
const ms = simularVuelo();
const lineas = [JSON.stringify({ aeropuerto: aCrudo(AEROPUERTO_PRUEBA) }), ...ms.map((m) => JSON.stringify(m))];
writeFileSync(ruta, lineas.join("\n") + "\n");
console.log(`${ms.length} muestras (${Math.round(ms[ms.length - 1].t)} s) en ${fileURLToPath(ruta)}`);
