# Lector v1.4 y fases del vuelo — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seguir un vuelo completo de rampa a rampa en el C172, con el aeropuerto y la pista sacados del simulador. Es el paso 1 del programa de 14 lecciones y no lleva voz nueva.

**Architecture:**
- **El lector C#** gana los campos de un vuelo completo, el aeropuerto más cercano con pistas y frecuencias (por la API de aeropuertos de SimConnect), y los modos `--grabar` y `--reproducir`, para que un vuelo real de Erik sirva después de prueba.
- **En el sitio**, un módulo puro `fasesVuelo.ts` avanza las fases con cada muestra, igual que los evaluadores de maniobras.
- **Una página del fundador** (`/admin/vuelo`) muestra el seguimiento en vivo para probarlo en MSFS.

**Tech Stack:** C# (csc, .NET Framework, SimConnect managed de SimHub), TypeScript, React 19, `node --experimental-strip-types --test`.

**Spec:** `docs/superpowers/specs/2026-11-06-instructor-programa-lecciones-design.md`. Este plan cubre «Orden de construcción → 1» y la sección «Lector v1.4», salvo el push-to-talk. Ese va en el plan de torre (paso 3), donde se puede probar con voz. Costo si fuera mejor tenerlo ahora: los cadetes bajan el lector una vez más.

## Global Constraints

- El repositorio es público: nada de llaves, tokens ni URLs privadas. Nunca hacer commit de `simhub-sixpack/` ni de `g1000-prueba/`.
- Hacer `git add` solo de archivos con nombre, nunca `git add .`.
- Commits con PowerShell: `git commit -q -m "..." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`.
- No se sube nada sin que Erik diga «Sí, súbelo».
- El lector sigue en `127.0.0.1:8766`, con `GET /muestra?desde=` y el JSON plano en español que ya existe. Los campos nuevos se agregan, ninguno cambia de nombre.
- La interfaz en inglés no lleva caracteres españoles (`/[áéíóúñ¿¡]/`). La página de este plan es solo del fundador y va en español.
- MSFS 2020. Compilar con `python -I tools/instructor-lector/build.py`. El autoprueba es `tools/instructor-lector/out/VillanuevaInstructorLector.exe --probar`.
- Checks: `npm.cmd test`, `npx tsc -b --noEmit`, `npm.cmd run build` (ya sale un aviso de tamaño de chunk que no es nuevo).
- Las pruebas no pueden importar `.tsx`. Todo archivo `*.test.ts` nuevo se agrega al script `"test"` de `package.json`.

## Review Focus

1. **Rebote al aterrizar o al despegar.** Un rebote de medio segundo, o un brinco en la carrera con ráfagas, no cuenta como despegue ni como aterrizaje. Lo prueba la Tarea 5, «un rebote de 0.5 s no es aterrizaje».
2. **Cruzar una pista rodando** (por ejemplo la 02/20 de camino a la 11R) no es despegue y no cambia la pista de salida. Lo prueba la Tarea 5, «cruzar una pista a 10 kt sigue siendo rodaje».
3. **El aeropuerto más cercano cambia en vuelo** al pasar sobre otro aeródromo. El aeropuerto del vuelo es el de salida y no cambia. Lo prueba la Tarea 5, «el aeropuerto del vuelo es el de salida».
4. **Lector reiniciado a media hora de vuelo.** Un hueco de más de 2 s se anota como evento y el vuelo sigue, no se anula como una maniobra. Lo prueba la Tarea 5, «un hueco anota sin conexión y sigue».
5. **Sin datos de aeropuerto**, por ejemplo una pista de tierra sin frecuencias o antes de que llegue el dato. Las fases se siguen igual y la pista queda `null`. Lo prueba la Tarea 5, «sin aeropuerto las fases avanzan».

---

### Task 1: Lector v1.4 — campos del vuelo completo

**Files:**
- Modify: `tools/instructor-lector/LectorInstructor.cs` (`Muestra`, `Json()`, `Probar()`, `Sim.Vars`, `Sim.Correr`)
- Modify: `tools/instructor-lector/LEEME.txt`

**Interfaces:**
- Produces: claves nuevas en el JSON de cada muestra, todas siempre presentes en v1.4:
  - `lat`, `lon` (grados);
  - `gs` (kt sobre el terreno);
  - `rumboV` (grados verdaderos);
  - `motor` (bool, combustión);
  - `mezcla`, `acelerador` (0–100);
  - `magIzq`, `magDer` (bool);
  - `master`, `luzBeacon`, `luzNav`, `luzAterrizaje`, `luzStrobe`, `luzTaxi`, `freno` (bool);
  - `xpdr` (string de 4 dígitos, p. ej. `"1200"`), `xpdrModo` (número de TRANSPONDER STATE: 0 off, 1 standby, 2 test, 3 on, 4 alt);
  - `altimetro`, `qnh` (inHg, con 2 decimales);
  - `com1` (MHz, con 3 decimales);
  - `tren` (bool, palanca abajo);
  - `vientoDir` (grados verdaderos), `vientoKt`.

- [ ] **Step 1: Escribir primero el chequeo de `--probar`.** En `Probar()`, una muestra con `Lat=20.52, Xpdr="1200", Com1=118.1, Motor=true` debe dar un JSON que contenga `"lat":20.52`, `"xpdr":"1200"`, `"com1":118.1` y `"motor":true`. Si no, sale con código 1 y el mensaje `Json v1.4: FALLA`.
- [ ] **Step 2: Compilar y correr `--probar`.** Expected: falla la compilación porque `Muestra` no tiene `Lat`.
- [ ] **Step 3: Implementar.**
  - En `Muestra`: los campos nuevos (`Xpdr` es string) y su salida en `Json()`.
  - En `Sim.Vars`, agregar en este orden:
    - `PLANE LATITUDE`/degrees, `PLANE LONGITUDE`/degrees, `GROUND VELOCITY`/knots, `PLANE HEADING DEGREES TRUE`/degrees;
    - `GENERAL ENG COMBUSTION:1`/bool, `GENERAL ENG MIXTURE LEVER POSITION:1`/percent, `GENERAL ENG THROTTLE LEVER POSITION:1`/percent, `RECIP ENG LEFT MAGNETO:1`/bool, `RECIP ENG RIGHT MAGNETO:1`/bool;
    - `ELECTRICAL MASTER BATTERY`/bool, `LIGHT BEACON`/bool, `LIGHT NAV`/bool, `LIGHT LANDING`/bool, `LIGHT STROBE`/bool, `LIGHT TAXI`/bool, `BRAKE PARKING POSITION`/bool;
    - `TRANSPONDER CODE:1`/Bco16, `TRANSPONDER STATE:1`/number;
    - `KOHLSMAN SETTING HG:1`/inHg, `SEA LEVEL PRESSURE`/inHg;
    - `COM ACTIVE FREQUENCY:1`/MHz, `GEAR HANDLE POSITION`/bool;
    - `AMBIENT WIND DIRECTION`/degrees, `AMBIENT WIND VELOCITY`/knots.
  - `SizeConst` pasa a 40.
  - `Xpdr` sale del BCD: `((int)x).ToString("X4")`.
  - Agregar `sim.OnRecvException` que imprima `"SimConnect: excepcion " + d.dwException + " en la variable " + d.dwIndex`, para que un nombre de variable mal escrito se vea en la consola.
  - En `LEEME.txt`, una línea v1.4.
- [ ] **Step 4: Compilar y correr `--probar`.** Expected: `Json v1.4: OK` y código 0.
- [ ] **Step 5: Commit** `tools/instructor-lector/LectorInstructor.cs tools/instructor-lector/LEEME.txt` — «Reader v1.4: position, engine, lights, transponder, altimeter, radio and wind».

### Task 2: Lector — aeropuerto más cercano con pistas y frecuencias

**Files:**
- Modify: `tools/instructor-lector/LectorInstructor.cs` (`Sim`, `LectorInstructor.Estado`, `Probar`)

**Interfaces:**
- Produces: `Estado()` agrega `,"aeropuerto":<json o null>` a la raíz de la respuesta de `/muestra`, junto a `conectado`. La forma cruda es:
  `{"icao":"MMGL","nombre":"...","lat":20.52,"lon":-103.31,"altM":1528,"pistas":[{"lat":..,"lon":..,"rumboV":..,"largoM":..,"anchoM":..,"n1":11,"d1":2,"n2":29,"d2":1}],"frecuencias":[{"tipo":6,"hz":118100000,"nombre":"..."}]}`.
  - `lat`/`lon` de una pista son su centro.
  - `n`/`d` son PRIMARY/SECONDARY NUMBER y DESIGNATOR de SimConnect.
- Produces: `LectorInstructor.PonerAeropuerto(string json)`, guardado bajo `Candado`.

- [ ] **Step 1: Chequeo en `--probar`.** Después de `PonerAeropuerto("{\"icao\":\"MMGL\"}")`, `Estado(double.NaN)` contiene `"aeropuerto":{"icao":"MMGL"}`. Sin aeropuerto puesto, contiene `"aeropuerto":null`.
- [ ] **Step 2: Compilar y correr `--probar`.** Expected: FALLA (no existe `PonerAeropuerto`).
- [ ] **Step 3: Implementar.**
  - En `Sim.Correr`, cada 30 s del reloj del lector y al conectar: `RequestFacilitiesList(SIMCONNECT_FACILITY_LIST_TYPE.AIRPORT, Req.Aeropuertos)`.
  - En `OnRecvAirportList`, juntar los `SIMCONNECT_DATA_FACILITY_AIRPORT` de todas las páginas (`dwEntryNumber` / `dwOutOf`). En la última, quedarse con el más cercano a la última muestra (distancia en grados con `cos(lat)` sobre la longitud).
  - Si el ICAO cambió, pedir `RequestFacilityData(Def.Aeropuerto, Req.DatosAeropuerto, ident, "")`.
  - La definición, en este orden: `OPEN AIRPORT`, `LATITUDE`, `LONGITUDE`, `ALTITUDE`, `NAME`, `OPEN RUNWAY`, `LATITUDE`, `LONGITUDE`, `ALTITUDE`, `HEADING`, `LENGTH`, `WIDTH`, `PRIMARY_NUMBER`, `PRIMARY_DESIGNATOR`, `SECONDARY_NUMBER`, `SECONDARY_DESIGNATOR`, `CLOSE RUNWAY`, `OPEN FREQUENCY`, `TYPE`, `FREQUENCY`, `NAME`, `CLOSE FREQUENCY`, `CLOSE AIRPORT`.
  - Registrar tres structs secuenciales con `RegisterFacilityDataDefineStruct<T>`:
    - AIRPORT: `double lat, lon, alt; char[32] name`;
    - RUNWAY: `double lat, lon, alt; float heading, length, width; int pn, pd, sn, sd`;
    - FREQUENCY: `int type, frequency; char[64] name`.
  - En `OnRecvFacilityData`, clasificar por `d.Type` y acumular. En `OnRecvFacilityDataEnd`, armar el JSON y llamar `PonerAeropuerto`.
  - Una excepción al registrar o al pedir no tumba el lector: se imprime y `aeropuerto` queda `null`.
- [ ] **Step 4: Compilar y correr `--probar`.** Expected: OK.
- [ ] **Step 5: Commit** `tools/instructor-lector/LectorInstructor.cs` — «Reader: nearest airport with runways and frequencies from the sim».

### Task 3: Lector — `--grabar` y `--reproducir`

**Files:**
- Modify: `tools/instructor-lector/LectorInstructor.cs` (`Opciones`, `Main`, `LectorInstructor.Publicar`, `Simulado`)
- Modify: `tools/instructor-lector/LEEME.txt`

**Interfaces:**
- Produces:
  - `--grabar <ruta.jsonl>`: en modo real, escribe a lo más 5 muestras por segundo (una línea JSON cada una) y una línea `{"aeropuerto":...}` cada vez que el aeropuerto cambia.
  - `--reproducir <ruta.jsonl> [--rapido N]`: publica las muestras del archivo respetando sus diferencias de `t`, divididas entre N (por omisión 1). Pone el aeropuerto de las líneas `{"aeropuerto":...}` y, al terminar, se detiene en la última muestra.
- Consumes: `PonerAeropuerto` (Tarea 2).

- [ ] **Step 1: Chequeo en `--probar`.**
  - Escribir un archivo temporal con 2 muestras (`t` 0 y 0.5) y una línea de aeropuerto `{"aeropuerto":{"icao":"MMGL"}}`.
  - `Simulado.LeerGrabacion(ruta)` debe dar 2 muestras con `T` 0 y 0.5, y el aeropuerto `{"icao":"MMGL"}`.
  - Un JSON leído y vuelto a escribir con `Json()` queda igual en `lat`, `xpdr` y `motor`.
- [ ] **Step 2: Compilar y correr `--probar`.** Expected: FALLA (no existe `LeerGrabacion`).
- [ ] **Step 3: Implementar.**
  - `Muestra.Desde(string json)` lee las claves que escribe `Json()`, con un lector simple de clave-valor plano. *(No hay JSON en .NET Framework sin dependencias; el formato es nuestro y plano.)*
  - `Simulado.LeerGrabacion` y el modo `--reproducir`.
  - En `Publicar`, si hay grabación abierta y pasaron 0.2 s desde la última línea, escribirla.
- [ ] **Step 4: Compilar y correr `--probar`.** Expected: OK.
- [ ] **Step 5: Commit** `tools/instructor-lector/LectorInstructor.cs tools/instructor-lector/LEEME.txt` — «Reader: record a flight and replay it».

### Task 4: Sitio — campos nuevos y aeropuerto

**Files:**
- Modify: `src/features/instructor/evaluador.ts` (`Muestra`)
- Create: `src/features/instructor/aeropuertoSim.ts`
- Test: `src/features/instructor/aeropuertoSim.test.ts` (y agregarlo a `package.json`)

**Interfaces:**
- Consumes: `aNm(lat, lon, lat0, lon0): PuntoNm` de `src/features/home/navGeo.ts`, y `distanciaNm` de `src/features/aventura/calculos.ts`. Se reusan, no se reescriben.
- Produces (en `evaluador.ts`):
  - los campos opcionales de la Tarea 1 en `Muestra`, con los mismos nombres y `xpdr?: string`;
  - `export const lectorViejoVuelo = (m: Muestra) => m.lat === undefined;`
- Produces (en `aeropuertoSim.ts`):
  - `export type TipoFrecuencia = "atis" | "rodaje" | "torre" | "autorizacion" | "aproximacion" | "salida" | "unicom" | "otra";`
  - `export type Extremo = { ident: string; rumboV: number; lat: number; lon: number }` (umbral).
  - `export type Pista = { extremos: [Extremo, Extremo]; largoFt: number; anchoFt: number }`.
  - `export type Aeropuerto = { icao: string; nombre: string; lat: number; lon: number; elevacionFt: number; pistas: Pista[]; frecuencias: { tipo: TipoFrecuencia; mhz: number; nombre: string }[] }`.
  - `export function leerAeropuerto(crudo: unknown): Aeropuerto | null`:
    - metros → ft (× 3.28084);
    - Hz → MHz con 3 decimales;
    - número 1–36 → `"01"`…`"36"` más designador (0 `""`, 1 `"L"`, 2 `"R"`, 3 `"C"`, otros `""`);
    - un número fuera de 1–36 deja esa pista fuera;
    - el segundo extremo va a `rumboV + 180`;
    - umbrales a ± largo/2 del centro;
    - tipos de frecuencia: 1 atis, 3 unicom, 5 rodaje, 6 torre, 7 autorizacion, 8 aproximacion, 9 salida, los demás otra;
    - sin `icao` o con algo que no sea objeto → `null`.
  - `export function aCrudo(a: Aeropuerto): unknown`: la inversa de `leerAeropuerto`, en la forma cruda del lector. La usa el vuelo simulado.
  - `export function pistaBajo(m: Pick<Muestra, "lat" | "lon" | "rumboV">, a: Aeropuerto): string | null`: el ident del extremo cuya pista contiene la posición (lateral ≤ ancho/2 + 15 m, longitudinal dentro del largo + 60 m) y cuyo rumbo está a ≤ 30° de `rumboV`. Dentro de la pista pero atravesado → `null`.
  - `export const AEROPUERTO_PRUEBA: Aeropuerto`: un MMGL aproximado para pruebas y simulación. ARP 20.5218, −103.3112, 5,016 ft. Pista 11R/29L de 13,123 × 148 ft a 112° verdaderos. Pista 02/20 de 5,900 × 98 ft a 20°. Torre 118.1 y Rodaje 121.9. *(Es aproximado a propósito: el aeropuerto real sale del simulador.)*

- [ ] **Step 1: Escribir las pruebas.**
  - «leerAeropuerto convierte unidades e idents»: crudo con `altM: 1528`, una pista `n1:11,d1:2,n2:29,d2:1`, `largoM: 4000`, y una frecuencia `tipo:6, hz:118100000`. Da `elevacionFt ≈ 5013` (±1), extremos `["11R","29L"]`, `largoFt ≈ 13123` (±1) y `{tipo:"torre", mhz:118.1}`.
  - «leerAeropuerto rechaza basura»: `null`, `{}` y `"x"` dan `null`.
  - «pistaBajo reconoce el extremo por el rumbo»: en el centro de la 11R con `rumboV:112` da `"11R"`; con `rumboV:292` da `"29L"`; con `rumboV:200` da `null`.
  - «pistaBajo fuera de la pista»: a 300 m al lado del eje da `null`.
  - «aCrudo es la inversa»: `leerAeropuerto(aCrudo(AEROPUERTO_PRUEBA))` da los mismos idents de pistas y las mismas frecuencias, con elevación ±1 ft.
- [ ] **Step 2: Correr.** `node --experimental-strip-types --test src/features/instructor/aeropuertoSim.test.ts`. Expected: FALLA (no existe el módulo).
- [ ] **Step 3: Implementar** `aeropuertoSim.ts` y los campos de `Muestra`.
- [ ] **Step 4: Correr.** Expected: 5/5 pasan.
- [ ] **Step 5: Commit** `src/features/instructor/evaluador.ts src/features/instructor/aeropuertoSim.ts src/features/instructor/aeropuertoSim.test.ts package.json` — «Read the sim's airport: runways, ends and frequencies».

### Task 5: Sitio — fases del vuelo y vuelo simulado

**Files:**
- Create: `src/features/instructor/fasesVuelo.ts`
- Create: `src/features/instructor/simularVuelo.ts`
- Create: `tools/instructor-lector/vuelo-simulado.ts` (escribe `tools/instructor-lector/out/vuelo-mmgl.jsonl`, que está en .gitignore)
- Test: `src/features/instructor/fasesVuelo.test.ts` (y agregarlo a `package.json`)

**Interfaces:**
- Consumes: `Aeropuerto`, `pistaBajo`, `AEROPUERTO_PRUEBA` (Tarea 4), `lectorViejoVuelo`, `esC172` (`evaluador.ts`), `distanciaNm`.
- Produces (en `fasesVuelo.ts`):
  - `export type FaseVuelo = "rampa" | "rodaje" | "carrera-despegue" | "vuelo" | "carrera-aterrizaje" | "rodaje-regreso" | "terminado" | "invalido";`
  - `export type EventoVuelo = { t: number; tipo: "motor-encendido" | "motor-apagado" | "inicio-rodaje" | "despegue" | "aterrizaje" | "toque-y-despegue" | "sin-conexion"; pista?: string | null; seg?: number };`
  - `export interface EvaluacionVuelo { fase: FaseVuelo; motivo?: string; previo: Muestra | null; aeropuerto: Aeropuerto | null; eventos: EventoVuelo[]; aireDesde: number | null; tierraDesde: number | null; pistaCarrera: string | null; maxDistNm: number }`
  - Constantes: `RODAJE_KT = 3`, `CARRERA_KT = 30`, `QUIETO_KT = 1`, `AIRE_SEG = 2`, `HUECO_SEG = 2`.
  - `export function armarVuelo(m: Muestra, a: Aeropuerto | null): EvaluacionVuelo`:
    - lector viejo → `invalido`, motivo `"Tu lector es de una versión anterior: baja el nuevo de Descargas para las lecciones."`;
    - no es C172 → `invalido`, motivo `` `En esta versión las lecciones son en el C172 y tu avión es «${m.titulo}».` ``;
    - no está en tierra o `gs ≥ QUIETO_KT` → `invalido`, motivo `"Empieza en tierra, detenido en la plataforma."`;
    - si no, `rampa`, y si el motor ya está encendido, el evento `motor-encendido` en `m.t`.
  - `export function avanzarVuelo(ev: EvaluacionVuelo, m: Muestra, a: Aeropuerto | null): EvaluacionVuelo`. Es pura: ignora muestras repetidas o viejas y las que vienen en pausa. Reglas:
    - **Anula:** slew → `invalido` («Usaste el modo slew: la lección no se califica.»). `tasa !== 1` → `invalido` («La velocidad de simulación no estaba en 1×: la lección no se califica.»).
    - **Hueco:** si pasaron más de `HUECO_SEG` desde la muestra anterior, evento `sin-conexion` con `seg`, y el vuelo sigue.
    - **Aeropuerto:** `ev.aeropuerto` toma el primer `a` no nulo y después no cambia.
    - **Motor:** los cambios de `motor` dan los eventos `motor-encendido` y `motor-apagado`.
    - **Fases en tierra antes del vuelo:**
      - de rampa a rodaje con `gs ≥ RODAJE_KT` (evento `inicio-rodaje`);
      - de rodaje a carrera-despegue con `gs ≥ CARRERA_KT` (se guarda `pistaCarrera = pistaBajo` en ese momento);
      - de carrera-despegue a vuelo cuando lleva `AIRE_SEG` seguidos fuera de tierra (evento `despegue` con la pista y la `t` del primer cuadro en el aire);
      - de carrera-despegue a rodaje si baja de `CARRERA_KT` sin despegar.
    - **Vuelo:** pasa a carrera-aterrizaje con `AIRE_SEG` seguidos en tierra (evento `aterrizaje` con `pistaBajo` del primer cuadro en tierra). `maxDistNm` sigue la distancia al aeropuerto del vuelo.
    - **Después del aterrizaje:**
      - de carrera-aterrizaje a vuelo con `AIRE_SEG` en el aire (evento `toque-y-despegue`);
      - de carrera-aterrizaje a rodaje-regreso con `gs < CARRERA_KT`;
      - de rodaje-regreso a terminado con el motor apagado, `gs < QUIETO_KT` y fuera de pista (`pistaBajo` nulo o sin aeropuerto).
- Produces (en `simularVuelo.ts`): `export function simularVuelo(op?: { rebote?: boolean; cruzarPista?: boolean; hueco?: { en: number; seg: number }; sobreOtro?: boolean; tocarYDespegar?: boolean }): Muestra[]`. Es un vuelo a 10 Hz en `AEROPUERTO_PRUEBA`, con todos los campos v1.4:
  - rampa 20 s con el motor apagado, arranque, 10 s quieto;
  - rodaje a 10 kt hasta el umbral de la 11R, alineado a 112°;
  - carrera hasta 60 kt y ascenso a 700 ft/min hasta 7,500 ft al sur;
  - 6 NM, vuelta, regreso, final y toque en la 11R;
  - frenado, rodaje fuera de la pista, freno puesto y motor apagado, más 5 s quieto.

  Las opciones:
  - `rebote`: un cuadro en el aire de 0.5 s después del toque;
  - `cruzarPista`: el rodaje pasa sobre la 02/20 a 10 kt;
  - `hueco`: salta `seg` segundos de muestras en `t = en`;
  - `sobreOtro`: no aplica a la simulación, la prueba pasa `a` distinto en vuelo;
  - `tocarYDespegar`: al tocar sigue y vuelve al aire, y aterriza en la segunda vuelta.

  El simulado debe durar menos de 15 minutos de muestras.
- `tools/instructor-lector/vuelo-simulado.ts`: `node --experimental-strip-types tools/instructor-lector/vuelo-simulado.ts` escribe el JSONL con una primera línea `{"aeropuerto":<AEROPUERTO_PRUEBA en forma cruda del lector>}` y una muestra por línea. Así `--reproducir` lo puede publicar.

- [ ] **Step 1: Escribir las pruebas** (con un helper `hasta(ms, a)` como el de `evaluadorLento.test.ts`):
  - «vuelo completo: fases en orden y pistas»: la secuencia de fases distintas por las que pasa es `rampa, rodaje, carrera-despegue, vuelo, carrera-aterrizaje, rodaje-regreso, terminado`. Los eventos `despegue` y `aterrizaje` tienen `pista: "11R"`. Hay un `motor-encendido` y un `motor-apagado`, y `maxDistNm` es ≥ 5.
  - «un rebote de 0.5 s no es aterrizaje»: con `rebote` hay un solo evento `aterrizaje` y ningún `toque-y-despegue`.
  - «cruzar una pista a 10 kt sigue siendo rodaje»: con `cruzarPista` no hay fase `carrera-despegue` antes de la 11R, y el despegue es en la `"11R"`.
  - «el aeropuerto del vuelo es el de salida»: dando otro aeropuerto (ICAO `"MMZZ"`) a partir de la mitad, `ev.aeropuerto.icao` sigue `"MMGL"` al final.
  - «un hueco anota sin conexión y sigue»: con `hueco: {en: 200, seg: 5}` hay un evento `sin-conexion` con `seg ≈ 5` y el vuelo termina en `terminado`.
  - «sin aeropuerto las fases avanzan»: con `a = null` en todas las muestras llega a `terminado`, y `despegue.pista` es `null`.
  - «toque y despegue»: con `tocarYDespegar` hay un `toque-y-despegue` y después un `aterrizaje`.
  - «anula con slew, no con pausa»: un cuadro con `pausa: true` en vuelo no cambia la fase, uno con `slew: true` da `invalido` con «slew».
  - «no arma en el aire, con lector viejo, ni en otro avión»: los tres motivos de `armarVuelo`.
  - «apagar el motor sobre la pista no termina»: motor apagado y detenido sobre la 11R → `rodaje-regreso`.
- [ ] **Step 2: Correr.** `node --experimental-strip-types --test src/features/instructor/fasesVuelo.test.ts`. Expected: FALLA (no existe el módulo).
- [ ] **Step 3: Implementar** `fasesVuelo.ts`, `simularVuelo.ts` y `vuelo-simulado.ts`.
- [ ] **Step 4: Correr.** Expected: todas pasan. Correr también `node --experimental-strip-types tools/instructor-lector/vuelo-simulado.ts` y confirmar que el archivo existe y que su primera línea empieza con `{"aeropuerto":`.
- [ ] **Step 5: Commit** `src/features/instructor/fasesVuelo.ts src/features/instructor/simularVuelo.ts src/features/instructor/fasesVuelo.test.ts tools/instructor-lector/vuelo-simulado.ts package.json` — «Follow a flight from ramp to ramp: phases, runways and events».

### Task 6: Página del fundador `/admin/vuelo`

**Files:**
- Modify: `src/features/instructor/useLector.ts`
- Create: `src/pages/AdminVuelo.tsx`
- Modify: `src/lib/routes.ts` (`adminVuelo: "/admin/vuelo"`), `src/App.tsx` (ruta lazy dentro de `ProtectedRoute`, como `adminManiobras`)

**Interfaces:**
- Consumes: `leerAeropuerto` (Tarea 4), `armarVuelo`/`avanzarVuelo` (Tarea 5).
- Produces: `useLector` devuelve también `aeropuerto: Aeropuerto | null`, leído con `leerAeropuerto(json.aeropuerto)` en cada respuesta. Sus usos actuales no cambian.

- [ ] **Step 1: Implementar `AdminVuelo`.**
  - Solo el fundador: `user?.email === FOUNDER_EMAIL`, y si no, `<Navigate to={ROUTES.home} replace />`, como en `AdminPruebasRed`.
  - **Estado del lector:** «sin lector», «sin simulador» o «conectado».
  - **Aeropuerto:** ICAO, nombre, las pistas como `11R/29L` y las frecuencias de torre y rodaje.
  - **Fase actual,** en grande.
  - **Eventos con su hora** desde el inicio, en formato `mm:ss`.
  - **Los campos v1.4 de la última muestra:**
    - motor, mezcla y acelerador;
    - freno;
    - luces;
    - transponder;
    - altímetro contra el QNH;
    - COM1;
    - tren;
    - viento;
    - gs.
  - **Botón «Empezar de nuevo»,** que arma con la muestra actual.
  - El vuelo se arma solo con la primera muestra que permita `armarVuelo` sin `invalido`. Si sale `invalido`, se muestra el motivo y el botón.
- [ ] **Step 2: Verificar en el navegador con la reproducción.**
  - `python -I tools/instructor-lector/build.py`;
  - `node --experimental-strip-types tools/instructor-lector/vuelo-simulado.ts`;
  - abrir el lector con `--reproducir tools/instructor-lector/out/vuelo-mmgl.jsonl --rapido 10 --sin-ventana`;
  - Vite en el puerto 5180 y abrir `/admin/vuelo` con la sesión de Erik.

  Expected:
  - las fases van de `rampa` a `terminado`;
  - los eventos de despegue y de aterrizaje son en la `11R`;
  - el aeropuerto sale como `MMGL` con Torre 118.1.

  Al final, detener el lector que se abrió. Antes de abrirlo, confirmar que el puerto 8766 está libre.
- [ ] **Step 3: Correr** `npx tsc -b --noEmit` y `npm.cmd run build`. Expected: sin errores.
- [ ] **Step 4: Commit** `src/features/instructor/useLector.ts src/pages/AdminVuelo.tsx src/lib/routes.ts src/App.tsx` — «Founder page to watch a flight from ramp to ramp».

### Task 7: Publicar el lector v1.4 en Descargas

**Files:**
- Modify: `src/data/descargas.ts` (lector: versión `"v1.4"`, fecha del día)
- Modify: `public/downloads/villanueva-instructor-lector.zip` (lo regenera `build.py`)

- [ ] **Step 1:** `python -I tools/instructor-lector/build.py`. Expected: compila y escribe el zip.
- [ ] **Step 2:** `npm.cmd test`, `npx tsc -b --noEmit` y `npm.cmd run build`. Expected: todo verde.
- [ ] **Step 3: Commit** `src/data/descargas.ts public/downloads/villanueva-instructor-lector.zip` — «Publish reader v1.4 in Downloads».

Lo que Erik verifica después en MSFS real, porque no se puede probar aquí:
- Volar con `--grabar` de rampa a rampa en MMGL.
- Que `/admin/vuelo` muestre las pistas y las frecuencias reales del simulador. Los tipos de frecuencia y el orden de los campos del struct de aeropuerto salen de la documentación del SDK y solo se confirman ahí.
- Que no salgan excepciones de SimConnect en la consola del lector.
