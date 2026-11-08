# Torre por voz (MMGL, español): plan de implementación

Diseño: `docs/superpowers/specs/2026-11-07-torre-por-voz-design.md` (manda) y `2026-11-06-instructor-programa-lecciones-design.md`.
Alcance de este plan: el lado web en TypeScript puro y probado. **No** toca el lector C# ni `AdminVuelo.tsx`; eso se hace en la PC de Erik con el simulador.

Comprobaciones antes de cada commit: `npm test`, `npx tsc -b --noEmit`, `npm run build`. Cada archivo de prueba nuevo se agrega a la lista del script `test` de `package.json`. Las pruebas no importan `.tsx`. Commits con `git add` de archivos específicos.

## Tarea 0: campos nuevos del lector v1.6 (tipos)

Archivos: `src/features/instructor/evaluador.ts`, `evaluador.test.ts`.

1. Prueba primero (`evaluador.test.ts`): `lectorViejoTorre({ ...base })` es `true`; con `ptt: false` es `false`.
2. Agregar a `Muestra` (opcionales, "Desde el lector v1.6"): `ptt?: boolean` (botón de radio apretado), `atcId?: string` (matrícula del avión en el simulador, p. ej. "XB-VNA").
3. `export const lectorViejoTorre = (m: Muestra) => m.ptt === undefined;`

## Tarea a: rutas de rodaje

Archivos: `src/features/instructor/rodaje.ts`, `rodaje.test.ts`.

Tipos (SDK de MSFS, tipos de tramo: 1 rodaje, 2 pista, 3 estacionamiento):

```ts
export type TipoTramo = 1 | 2 | 3;
export interface PuntoCalle { lat: number; lon: number }
/** inicio y fin son índices en `puntos`; en tramos tipo 3, inicio es índice en `estacionamientos`. nombre: índice en `nombres`, -1 = sin nombre. */
export interface TramoCalle { inicio: number; fin: number; tipo: TipoTramo; nombre: number }
export interface DatosCalles { puntos: PuntoCalle[]; tramos: TramoCalle[]; nombres: string[]; estacionamientos: (PuntoCalle & { nombre?: string })[] }
export type Origen = { punto: number } | { estacionamiento: number };

export function rutaRodaje(d: DatosCalles, desde: Origen, hastaPunto: number): string[] | null;
export function puntoMasCercano(d: DatosCalles, lat: number, lon: number): number | null;
```

Reglas (valores del diseño): Dijkstra con peso = distancia en NM entre los extremos (`aNm`); solo tramos tipo 1 y 3, nunca tipo 2; grafo no dirigido; nombres sin repetir los seguidos y sin tramos sin nombre; `[]` si origen = destino; `null` si no hay ruta o los índices no existen.

Pruebas (grafo sintético pequeño, **no** son datos reales de MMGL): la ruta más corta gana sobre una larga; un atajo por tramo de pista (tipo 2) se ignora; nombres repetidos seguidos se juntan; tramos sin nombre no aparecen; origen en estacionamiento; sin ruta → `null`; `puntoMasCercano`.

## Tarea b: flujo del ATC de MMGL (máquina de estados pura)

Archivos: `src/features/instructor/atcMmgl.ts`, `atcMmgl.test.ts`.

Constantes (carta 10-9): `FREQ = { atis: 127.9, terrestre: 121.9, rampa: 134.1, torre: 118.1 }`, `PISTA = "29L"`, `TEXTO_PISTA = "2-9 izquierda"`, `ESPERA_FRECUENCIA_S = 20`, `DIST_RAMPA_A_TORRE_NM = 0.15`, `BASE_NM = 0.5`, `FINAL_NM = 0.8`, `ALINEADO_NM = 0.3`, `REPORTE_LEJOS_NM = 2`.

```ts
export type TipoElemento = "pista" | "qnh" | "codigo" | "punto-espera" | "matricula" | "punto-vfr" | "frecuencia";
export type Elemento = { tipo: TipoElemento; valor: string }; // pista "29L", qnh "3002", codigo "4521", punto-espera "P1", matricula "XB-VNA", punto-vfr "Cajititlán", frecuencia "134.1"
export type Etapa = "atis" | "terrestre-llamada" | "terrestre-colacion" | "rampa-llamada" | "rampa-colacion" | "rodando"
  | "torre-llamada" | "torre-despegue-colacion" | "zona" | "regreso-llamada" | "regreso-colacion" | "piramide"
  | "viento-cola" | "cola-reportada" | "base" | "final" | "autorizado" | "rampa-regreso-llamada" | "rampa-regreso-colacion" | "fin";
export type Quien = "terrestre" | "rampa" | "torre" | "instructor";
export interface Mensaje { quien: Quien; texto: string }
export type TipoNota = "faltante" | "ininteligible" | "frecuencia-tarde" | "fuera-de-frecuencia" | "reporte-lejos";
export interface Nota { etapa: Etapa; tipo: TipoNota; detalle?: string; t: number }
export interface Registro { etapa: Etapa; completa: boolean; faltaron: TipoElemento[] }
export interface ContextoAtc {
  matricula: string; // ATC ID del lector; "XB-VNA" si viene vacío
  zona: "Cajititlán" | "Chapala"; // la que el cadete pide en la llamada a Terrestre
  qnhInHg: number; vientoDir: number; vientoKt: number;
  codigo: string; // 4 dígitos octales ≠ 1200, 7500, 7600, 7700
  rutaSalida: string[] | null; rutaRegreso: string[] | null; // de rodaje.ts; null = sin datos de calles
  puntoEspera: { lat: number; lon: number } | null; // P1
  pista: Extremo | null; // umbral 29L del simulador (aeropuertoSim.ts)
}
export interface EstadoAtc {
  etapa: Etapa; ordenFrecuencia: { mhz: number; t: number; avisada: boolean } | null;
  notas: Nota[]; registros: Registro[]; pos: { lat: number; lon: number } | null; pasoCola: boolean;
}
export interface Salida { estado: EstadoAtc; decir: Mensaje[] }

export const matriculaHablada = (id: string): string;            // "XB-VNA" → "X-ray Bravo Victor November Alpha"
export const qnhHablado = (inHg: number): string;                // 30.02 → "QNH 3-0-0-2"
export const qnhDigitos = (inHg: number): string;                // 30.02 → "3002"
export const calleHablada = (n: string): string;                 // "P2" → "Papa 2"
export const codigoTransponder = (azar?: () => number): string;
export const frecuenciaCerca = (com1: number | null, mhz: number): boolean; // null (lector viejo) cuenta como sí
export const frecuenciaDeEtapa = (e: Etapa): number | null;
export const esperado = (e: Etapa, c: ContextoAtc): Elemento[];   // elementos obligatorios de la llamada o colación
export const textoAtis = (c: ContextoAtc): string;
export function crearEstado(): EstadoAtc;
/** El cadete hizo la llamada o colación de `etapa` (con `faltaron` sin decir, ya pedidos una vez): el ATC contesta y la etapa avanza. */
export function completarEtapa(e: EstadoAtc, c: ContextoAtc, faltaron: Elemento[], t: number): Salida;
/** Sigue sin oír nada claro por segunda vez: el ATC actúa como si hubiera oído lo esperado. */
export function ininteligible(e: EstadoAtc, c: ContextoAtc, t: number): Salida;
/** Rampa pasa a Torre sin esperar la llamada (el cadete ya está en 118.1 en el rodaje). */
export function adelantarATorre(e: EstadoAtc): EstadoAtc;
/** Cada muestra del lector: COM1 de ATIS a Terrestre, cercanía a P1, circuito (base/final/autorizado), toma y vigilancia de frecuencia. */
export function alMuestrear(e: EstadoAtc, m: Muestra, c: ContextoAtc): Salida;
```

Textos: los que dictó Erik, tal cual (pista y calles, «contacte Torre uno uno ocho punto uno», «notifique establecido en el área de trabajo», todo el regreso, «abandone pista vía Papa 1, contacte Rampa uno tres cuatro punto uno»). Los demás (Terrestre, ATIS, «enterado», «correcto») los propone el constructor; **Erik los revisa antes de publicar**.

Pruebas: helpers de texto; `esperado` por etapa; recorrido completo salida → regreso con `completarEtapa` y muestras sintéticas; Rampa no pasa a Torre al salir de la plataforma sino cerca de P1; ruta nula → «ruede a punto de espera pista 2-9 izquierda»; vigilancia de frecuencia a los 20 s (una sola vez); base y final por geometría con un umbral sintético; toma → «abandone pista…».

## Tarea c: calificación de colaciones y comportamiento

Archivos: `src/features/instructor/colacion.ts`, `colacion.test.ts`. Reusa `normalizar` de `preguntas.ts` y el estilo de `checklistVoz.ts`.

```ts
export interface Calificacion { ok: Elemento[]; faltan: Elemento[] }
export function calificar(esperados: Elemento[], dicho: string): Calificacion;

export interface EstadoHabla { atc: EstadoAtc; etapa: Etapa; yaDichos: TipoElemento[]; pidio: boolean; repeticiones: number; zona: ContextoAtc["zona"] | null }
export function crearHabla(atc: EstadoAtc): EstadoHabla;
export function muestrearHabla(h: EstadoHabla, m: Muestra, c: ContextoAtc): { habla: EstadoHabla; decir: Mensaje[] };
export function zonaDicha(texto: string): ContextoAtc["zona"] | null;
export function distanciaAlPunto(texto: string, zona: ContextoAtc["zona"], pos: { lat: number; lon: number }): { punto: string; nm: number } | null;
/** Lo que dijo el cadete con el botón apretado. `com1` decide quién contesta. */
export function hablar(h: EstadoHabla, texto: string, com1: number | null, c: ContextoAtc, t: number): { habla: EstadoHabla; decir: Mensaje[] };
```

Reglas del diseño (práctica): COM1 en otra frecuencia → nadie contesta (nota `fuera-de-frecuencia`); si falta algo, el ATC lo pide una vez («colacione QNH»), lo ya dicho cuenta; la segunda vez sigue y queda anotado; si no entiende nada, «X-ray Bravo Victor November Alpha, repita», y a la segunda sigue como si hubiera oído lo esperado (`ininteligible`). Elementos: pista («2-9 izquierda»), QNH (4 dígitos, también «3 0 0 2» o «tres cero cero dos»), código (4 dígitos), punto de espera (calle final, «Papa 1»), matrícula (completa o las últimas tres letras), punto VFR (con alias: «área/zona de trabajo»), frecuencia («uno tres cuatro punto uno»).

Pruebas: cada elemento bien y mal; matrícula abreviada; QNH con otros números alrededor; vuelo completo por texto; frecuencia equivocada; pedir una sola vez; «repita» y salto a la segunda; en `rodando` con COM1 118.1 se adelanta a Torre.

## Lo que tiene que mandar el lector v1.6 (anotado, no se hace aquí)

- `ptt` (bool) en cada muestra: estado del botón de radio asignado (mecanismo a elección del constructor del lector: winmm `joyGetPosEx`, DirectInput u otro, porque con MSFS al frente la página no recibe teclas). La asignación («Asignar botón») se guarda en el navegador; el lector necesita un endpoint para decir «el próximo botón que se apriete» y devolver su identificador.
- `atcId` (string) en cada muestra: ATC ID del avión (`ATC ID`). Vacío → la página usa XB-VNA.
- Datos de calles de MMGL en un endpoint nuevo (p. ej. `/calles`), con la forma de `DatosCalles` de `rodaje.ts`: `TAXI_POINT` → `puntos`, `TAXI_PATH` → `tramos` (`tipo` 1/2/3, `inicio`, `fin`, `nombre` = índice), `TAXI_NAME` → `nombres`, `TAXI_PARKING` → `estacionamientos`. Hay que confirmar con el simulador si, en los tramos de tipo 3, `inicio` es índice de estacionamiento (así lo supone `rutaRodaje`).
- Los puntos de espera de pista (tipo de punto «hold short») para encontrar el de P1 de la 29L.
- Ya existen: `com1`, `qnh`, `vientoDir`, `vientoKt`, `lat`, `lon`, `gs`, `enTierra`, y el aeropuerto con pistas (`aeropuertoSim.ts`).

## Estado al cierre

Rama `torre-por-voz` (solo esa rama sube; nada a main, sin PR). Al cierre: `npm test` 414 pruebas pasan, `npx tsc -b --noEmit` y `npm run build` sin errores (queda el aviso de chunk de 500 kB que ya existía).

### Hecho

| Tarea | Commit |
| --- | --- |
| Plan | a1ceae1 |
| 0. Campos `ptt` y `atcId` y `lectorViejoTorre` | e4a2eba |
| a. `rodaje.ts` (Dijkstra, sin pistas, nombres sin repetir) | 6340bb4 |
| b. `atcMmgl.ts` (flujo ATIS → Terrestre → Rampa → Torre → regreso → Rampa) | 1b47622 |
| c. `colacion.ts` (elementos, «repita», pedir lo faltante, COM1) | 962ff9a |

### Falta (se hace en la PC de Erik con el simulador)

- Lector C# v1.6: `ptt`, `atcId`, endpoint de calles (forma de `DatosCalles`), puntos de espera de pista y «asignar botón» (ver la sección de arriba).
- Página: botón «Asignar botón», escuchar solo con `ptt` apretado (al soltar se manda a `hablar`), voz propia del ATC por `Mensaje.quien`, ciclo del ATIS con `textoAtis`, armar el `ContextoAtc` (rutas con `rodaje.ts`, P1, umbral de la 29L, QNH y viento de la muestra, código con `codigoTransponder`) y mostrar el resumen de notas y registros en el debriefing. `AdminVuelo.tsx` no se tocó.
- Revisión de Erik de todos los textos del ATC que no dictó él (Terrestre, ATIS, «enterado», «correcto», «repita», «colacione …», «indique …»).
- Afinar con el simulador: `DIST_RAMPA_A_TORRE_NM` (0.15), `BASE_NM`, `FINAL_NM`, `ALINEADO_NM`, `VEL_TOMA_KT` (40) y la posición aproximada del aeropuerto y de los puntos VFR en `colacion.ts`.
- Obtener el punto de espera de P1 y la ruta de regreso de los datos reales de calles (los de las pruebas son sintéticos; no hay datos reales de MMGL en el repo).

### Decisiones mías

- **Campos nuevos en `Muestra`** (`ptt`, `atcId`) en vez de un tipo aparte: es lo mínimo y sigue el patrón de v1.4/v1.5.
- **Tramos tipo 3:** `inicio` es índice de estacionamiento y `fin` de punto; no está confirmado con el simulador (anotado arriba).
- **Peso del grafo:** distancia en NM entre extremos; un estacionamiento solo se conecta por sus tramos tipo 3.
- **Elementos por llamada:** Terrestre pide matrícula y zona; su colación pide código, 134.1 y matrícula; Rampa pide matrícula y su colación pista, punto de espera (solo la calle final, P1) y matrícula; Torre: matrícula y punto de espera; colación de despegue: pista y matrícula; regreso: pista, QNH y «Pirámide» (como aprobó Erik). La ruta de regreso de Rampa no se colaciona (solo matrícula). No se exige la letra del ATIS.
- **Matrícula:** vale completa o las tres últimas letras («Victor November Alpha»), como se dice en la práctica y porque el reconocimiento de voz falla con matrículas largas.
- **QNH y código:** se juntan las rachas de números seguidos; «treinta cero cero dos» no se entiende (da 32), solo «tres cero cero dos» o cifras.
- **Zonas:** «Cajititlán» y «Chapala» valen una por otra en los reportes y «área de trabajo» vale cualquier punto del vuelo, porque el diseño dice que el ATC acepta cualquiera. El aviso de «más de 2 NM» usa rumbo/distancia de `mmgl.ts` copiados aquí (no se importa `mmgl.ts` porque arrastra `.tsx`), con la pista «Sur» = 180° y «Sur-sureste» = 157.5°, y el aeropuerto en 20.5218, −103.3111 (aproximado).
- **Rampa → Torre:** a 0.15 NM de P1, y si el cadete ya está en 118.1 en el rodaje y llama, se pasa a Torre sin esperar (así nunca se atora si el lector no manda posición).
- **Circuito:** la base solo se ordena si antes estuvo en viento en cola (a la izquierda del eje y después de la cabecera), para que el cadete que viene de Pirámide no reciba «vire a base» al instante. Si ya está alineado con el eje a menos de 4 NM, Torre salta a «autorizado a aterrizar». Sin el umbral de la pista (`pista: null`) no hay circuito por geometría y la etapa se queda esperando.
- **Después del aterrizaje:** «abandone pista…» sale al estar en tierra a menos de 40 kt.
- **Sin COM1** (`null`) el ATC contesta (no se puede comprobar); un lector viejo se anula antes con `lectorViejoTorre`.
- **Botón apretado sin palabras** no cuenta como «no entendí».
- **Código de transponder:** también se rechaza 0000.
- **Etapas añadidas** respecto al borrador del plan: `cola-reportada` y `autorizado` (y sin `aterrizado`).
- **QNH hablado** «QNH 3-0-0-2» y viento «viento 2-7-0 grados 8 nudos» (dirección dígito por dígito, velocidad en número).

