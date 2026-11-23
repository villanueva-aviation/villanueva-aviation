# Programa ATIS, plan 3: ATIS en todo el mundo con los datos de MSFS

Amplía el diseño `docs/superpowers/specs/2026-11-16-programa-atis-design.md`. Ese diseño sigue valiendo en todo lo que este no cambia: reglas de red, sonido, alcance, piezas pegadas y anti-metas. Los planes 1 (ATIS generado en México) y 2 (reglas de IVAO y VATSIM) ya están en main.

## Intención

Que el programa funcione **en el mayor número posible de aeropuertos del mundo**, no solo en los 21 de México, y que lo use **un piloto de cualquier país, también en inglés**. Erik lo pidió el 2026-11-22.

Hoy los aeropuertos salen de OurAirports, que solo trae frecuencia ATIS de 1,554 aeropuertos en todo el mundo (Colombia 5, Argentina 6). MSFS sí las tiene todas, así que los datos ahora salen del simulador.

## Lo que decidió Erik (2026-11-22)

- **Solo MSFS 2020 y 2024.** X-Plane queda en pausa: este plan no lo toca.
- Es **para pilotos de cualquier país**, también en inglés.
- Los aeropuertos y sus frecuencias **salen de MSFS** (enfoque A, ver «Enfoques»).
- El D-ATIS real de EE. UU. y PilotEdge **pasan al plan 4**. La parte educativa, la página de producto y la descarga pasan al plan 5.

## Prueba hecha (2026-11-22, desechable, en el scratchpad)

Con la DLL de SimConnect de SimHub, sin volar, en el menú principal del simulador:

- `RequestFacilitiesList(AIRPORT)` da la lista **del mundo entero**: 41,235 aeropuertos en MSFS 2020 (KittyHawk 11.0) y 42,167 en MSFS 2024 (SunRise 12.2). Cada entrada trae `Ident`, `Region`, `Latitude`, `Longitude` y `Altitude`.
- `RequestFacilityData` con la definición `OPEN AIRPORT` → `LATITUDE, LONGITUDE, ALTITUDE, NAME, N_RUNWAYS, N_FREQUENCIES` → `OPEN FREQUENCY` `TYPE, FREQUENCY, NAME` `CLOSE FREQUENCY` → `OPEN RUNWAY` `LATITUDE, LONGITUDE, ALTITUDE, HEADING, LENGTH, PRIMARY_NUMBER, PRIMARY_DESIGNATOR, SECONDARY_NUMBER, SECONDARY_DESIGNATOR` `CLOSE RUNWAY` → `CLOSE AIRPORT` funciona con **cualquier ICAO del mundo**, esté cerca o no. Los dos simuladores dan los mismos datos.
- El ATIS es la frecuencia de **`TYPE` 1** y viene en Hz. Por ejemplo:

  | Aeropuerto | ATIS |
  |---|---|
  | SKRG | 127.700 |
  | MMGL | 127.900, igual a OurAirports |
  | SKBO | 127.800 |
  | SAEZ | 127.800 |
  | SCEL | 132.100 y 132.700 |
  | KLAX | 133.800 y 135.650 |
  | EGLL | 121.935 (8.33 kHz) y 128.080 |
  | LFPG | 127.130 y 128.230 |

- `ALTITUDE` viene en metros y `LENGTH` en metros. `HEADING` es el rumbo **verdadero** del extremo primario: MMGL 11 da 114.0.
- `PRIMARY_DESIGNATOR` y `SECONDARY_DESIGNATOR`: 0 es sin letra, 1 izquierda (L), 2 derecha (R). La prueba vio 0, 1 y 2. El constructor confirma en el SDK los demás valores, como el central (C).
- `NAME` del aeropuerto es de 32 caracteres y viene abreviado: «Don Miguel Hidalgo Intl», «Jose Maria Cordova». Solo sirve en pantalla.

## Metas

1. Sintonizas la frecuencia ATIS que trae MSFS para **cualquier aeropuerto del simulador con ATIS** y oyes su ATIS. Todo lo de los planes 1 y 2 sigue igual: alcance, reglas de red, loop y cambio de letra.
2. El ATIS sale en el **formato del país**:
   - **México:** el bilingüe de hoy, sin cambios, con millas y altímetro en pulgadas.
   - **Latinoamérica de habla hispana:** bilingüe, español y luego inglés, en formato OACI. Prefijos MG, MH, MN, MR, MS, MP, MU, MD, SK, SV, SE, SP, SL, SC, SA, SU y SG.
   - **EE. UU.:** formato FAA, solo en inglés. Prefijos K, PA, PH, PG y TJ.
   - **Resto del mundo:** formato OACI, solo en inglés. Incluye España, Brasil y Canadá.
   - [Decisión de Claude, Erik la vio el 2026-11-22 sin corregirla.]
3. Las **unidades salen del METAR**:
   - visibilidad en metros (`9999`, `4000`) → kilómetros o metros;
   - en millas (`10SM`) → millas;
   - `Q1013` → «QNH uno cero uno tres hectopascales»;
   - `A2992` → «altímetro dos nueve nueve dos».
4. **Ningún aeropuerto se queda mudo por no tener la pieza de su nombre.** Si falta `ap-XXXX`, se dice el código en alfabeto fonético con las piezas `letra-X`, que ya existen («Sierra Kilo Romeo Golf»). En pantalla sale el código.
5. La **pantalla** sale en español si el idioma de la computadora empieza con `es`, y en inglés si no.

## No metas (por ahora)

- X-Plane. Tampoco D-ATIS real ni lectura de ATIS de texto: eso es el plan 4.
- AWOS y ASOS, frecuencias `TYPE` 12 y 13: tienen otro formato. Solo cuenta `TYPE` 1.
- Decir el nivel de transición, las tendencias (`TEMPO`, `BECMG`), el RVR o los NOTAM. Salen como «Solo en texto», como ya pasa con lo que no tiene pieza. `NOSIG` sí se dice («Sin cambios significativos» / «No significant change»).
- Abrirlo a todos. Sigue **solo para el fundador** (`ACCESO_ATIS`) hasta el plan 5.
- Selector de idioma de pantalla. Basta con el idioma de la computadora.

## Anti-metas

Valen las del diseño principal. Además:

- Que el programa anuncie una frecuencia o un aeropuerto distintos a los que el piloto ve en su simulador.
- Que un aeropuerto con ATIS en MSFS se quede **en silencio** porque falta una pieza. Siempre se oye algo; lo que falta se dice en fonético o sale como «Solo en texto».
  - [Decisión de Claude] **Sin METAR sí hay silencio**, como hoy: la pantalla dice «Sin METAR» / «No METAR». No se toma el METAR de otra estación, porque sería un clima que no es el del aeropuerto.
- Que el lector haga más lento el simulador o lo tumbe: pedir datos de aeropuertos no debe notarse en vuelo.

## Enfoques considerados

- **A. Datos del simulador (elegido por Erik).** El lector le pide a MSFS los aeropuertos cercanos con ATIS. Cubre todo lo que tiene el simulador, con la misma frecuencia que ve el piloto. En contra: el lector crece. Y si el piloto tiene la navegación vieja, su frecuencia puede no coincidir con la que usa el controlador de la red; es raro, y aun así coincide con lo que ve en su simulador.
- **B. OurAirports para todo el mundo.** Es lo más fácil, pero se queda en 1,554 aeropuertos, con huecos grandes en Latinoamérica.
- **C. B ahora y A después.** Sale rápido, pero se construye dos veces.

## Piezas

### 1. Lector: aeropuertos con ATIS desde MSFS

- Al conectarse pide la **lista del mundo** (`RequestFacilitiesList(AIRPORT)`) y la guarda en memoria: ICAO, región, latitud y longitud.
- Busca los aeropuertos que están a **menos de 200 NM** del avión. El alcance máximo de radio en FL400 es de unos 183 NM. Lo hace al tener la primera posición y otra vez cada que el avión se mueve 10 NM o más.
  - De los que no tiene guardados pide los datos (`RequestFacilityData`, definición de arriba), **de a poco**: unas pocas solicitudes abiertas a la vez, para que no se note en el simulador.
  - Guarda la respuesta durante toda la sesión, incluidos los que no tienen ATIS, para no volver a pedirlos.
- Sirve `GET /aeropuertos` en el mismo puerto 8767, con el mismo CORS que `/muestra`. Responde los aeropuertos guardados que tienen al menos una frecuencia `TYPE` 1 y están a menos de 200 NM:

  ```json
  [{"icao":"SKRG","nombre":"Jose Maria Cordova","lat":6.1645,"lon":-75.4231,"elevFt":6955,
    "atisMhz":[127.7],"pistas":[{"ident":"01","rumboV":2,"largoFt":11483},{"ident":"19","rumboV":182,"largoFt":11483}]}]
  ```

  - `pistas` tiene los dos extremos de cada pista, como `ExtremoPista` hoy.
  - El rumbo del extremo secundario es el del primario + 180.
  - `ident` es el número con dos dígitos más L, R o C.
  - `atisMhz` lleva los MHz redondeados a 3 decimales.
- Sin simulador, o sin posición, responde `[]`. El modo `--simulado` da MMGL con los datos de MX.json, para que la prueba sin simulador siga igual.
- `/muestra` no cambia.
- **Modo `--volcar <archivo>`**, una sola vez, en la PC de Erik con el simulador en el menú: pide los datos de **todos** los aeropuertos de la lista y escribe en un JSON los que tienen ATIS (icao, nombre, lat, lon, región). Sirve para saber qué nombres grabar (pieza 3) y cuántos aeropuertos con ATIS hay de verdad.

### 2. Página

- Los aeropuertos salen de `GET http://127.0.0.1:8767/aeropuertos`, pedido al conectar y luego cada 30 s, y ya no de `/data/atis/MX.json`. `sintonizado()` no cambia.
- Cada aeropuerto lleva un **nombre para decir y mostrar** en español e inglés, si está en el archivo de nombres (pieza 3). Si no está, se usa su ICAO y se dice en fonético.
- **Formato por prefijo del ICAO** (Meta 2): sale de una función que recibe el ICAO y devuelve `"mx" | "latam" | "faa" | "oaci"`.
  - El ATIS generado se arma con el armador de ese formato.
  - Los idiomas salen del formato: es+en para mx y latam, solo en para faa y oaci.
- La **pantalla en inglés**: todos los textos de `/atis/programa` en los dos idiomas, según `navigator.language`. Los textos del ATIS siguen el formato del aeropuerto, no el idioma de la pantalla.
- La red se pregunta igual que hoy, pero mandando la posición del aeropuerto (pieza 4).

### 3. Nombres de aeropuertos (piezas `ap-XXXX`)

- Un archivo estático `public/data/atis/nombres.json`: `{ "SKRG": { "es": "Aeropuerto Internacional de Medellín", "en": "Medellín International Airport" }, ... }`.
  - Lleva `es` solo en los formatos mx y latam.
  - Sale de un script que cruza el volcado del lector con OurAirports `airports.csv` por ICAO.
  - **[Decisión de Claude] Qué nombre se dice**, para que nunca haya dos aeropuertos con el mismo nombre:
    - en **mx y latam**, la regla `nombres()` de `datos.ts` con `municipality`, más `NOMBRES_FIJOS`, solo si en esa ciudad no hay otro aeropuerto con ATIS. Si hay otro (SAEZ y SABE en Buenos Aires), se usa el `name` de OurAirports tal cual, en los dos idiomas;
    - en **faa y oaci**, el `name` de OurAirports tal cual: «London Heathrow Airport», «Los Angeles International Airport», «George Bush Intercontinental Houston Airport». Es único por aeropuerto y se parece a lo que dice el ATIS real;
    - el script avisa de los nombres repetidos que queden, para agregarlos a `NOMBRES_FIJOS`.
  - Los aeropuertos que OurAirports no tenga quedan fuera y se dicen en fonético.
- Las piezas `ap-XXXX` se graban con el generador de siempre (Azure F0, Jorge y Christopher), que ahora lee `nombres.json` en vez de MX.json.
  - El script del volcado imprime **cuántos caracteres** suman los nombres.
  - Si pasan de unos 400,000, se graban en dos meses: primero los aeropuertos con ATIS grandes y medianos (`type` de OurAirports), después el resto.
- Lo corre Erik en su PowerShell (la llave de Azure nunca pasa por Claude) y luego se suben las piezas.
- MX.json se queda solo para `--simulado` y las pruebas.

### 4. Red (IVAO y VATSIM) en todo el mundo

- `functions/api/atis/red.ts` ya **no** busca el aeropuerto en MX.json. Recibe `icao`, `lat` y `lon`:
  - valida que `icao` sea de 4 letras y que `lat` y `lon` sean números en rango;
  - si no, responde 400.
  - La posición la manda la página. Una posición falsa solo engaña a quien la manda.
- **Estaciones de EE. UU. sin K:** en VATSIM la torre de KLAX es `LAX_TWR` y el centro de Los Ángeles `LAX_CTR`.
  - `delAeropuerto` acepta también el ICAO sin su primera letra para los prefijos K, PA, PH y PG: `LAX_` en KLAX y `ANC_` en PANC.
  - `mismaRegion`, solo para aeropuertos de EE. UU.: cuenta también las estaciones cuyo prefijo del callsign no es un ICAO de 4 letras (`LAX_CTR`, `NY_CTR`, `HOU_46_CTR`).
  - Fuera de EE. UU. esas estaciones no cuentan, para que el caso de Houston en MMGL siga excluido.
- **Países de una sola letra OACI** (C Canadá, Y Australia, Z China, U Rusia): `mismaRegion` compara solo la primera letra.
- Antes de cerrar esta pieza, el constructor revisa en los feeds en vivo cómo se llaman las estaciones en EE. UU., Canadá, Australia y Europa, y ajusta estas dos reglas.
  - Si un caso sigue en duda, se resuelve contando que hay controlador (anti-meta 1).
  - Lo que no se pueda resolver queda escrito en el plan.

### 5. Formatos nuevos (piezas y armado)

El formato mx de hoy no cambia. Se agregan:

- **OACI**, inglés en oaci y es+en en latam. Mismo orden que mx:
  - aeropuerto, información, hora, pista en uso, viento, visibilidad, tiempo, nubes, temperatura y rocío, QNH, `NOSIG` y cierre.
  - Visibilidad del METAR crudo:
    - `9999` → «diez kilómetros o más» / «one zero kilometers or more»;
    - de 5000 a 9000 m → kilómetros con un dígito («ocho kilómetros» / «eight kilometers»);
    - menos de 5000 → metros en dígitos más «metros» / «meters» («uno cinco cero cero metros»).
  - `CAVOK` → «CAVOK», en lugar de visibilidad, tiempo y nubes.
  - `NSC` → «Sin nubes significativas» / «No significant cloud».
  - `Q1013` → «QNH, uno cero uno tres hectopascales» / «QNH one zero one three hectopascals».
  - Si un aeropuerto latam o oaci trae millas (`SM`) o `A2992`, se dicen como en mx.
- **FAA**, solo inglés, en el orden del ATIS de EE. UU.:
  - aeropuerto e información, hora («two two five three zulu weather»), viento («wind two five zero at one zero»), visibilidad («visibility one zero»), tiempo, nubes («few clouds at two thousand, scattered two five thousand»), temperatura y rocío, altímetro («altimeter two niner niner two»), pista («landing and departing runway two five left») y cierre («advise on initial contact you have information Delta»).
  - Con controlador de la red, no hay letra ni pista y el cierre es `f-confirme`, igual que en mx.
- [Decisión de Claude] **Los números se dicen como hoy en todos los formatos**: dígito por dígito, con el cero de adelante (`09` → «cero nueve» / «zero niner»). Temperatura y rocío reusan las piezas `f-temperatura` y `f-rocio` de hoy, también en faa.
- Cada frase nueva es una pieza nueva en `frases.ts`. Erik las graba en su PowerShell, igual que `f-confirme`.
- Las muestras de texto de cada formato están en el Anexo. El constructor las usa como prueba.

## Restricciones

- Valen las del diseño principal: la voz nunca cuesta, ni «oficial» ni «certificado», «Solo para simulación», la llave de Azure solo en el PowerShell de Erik.
- **El lector sigue sin traer las DLL de SimConnect.** Las busca como hoy y se compila con `build.py`.
- **Probado en MSFS 2020 y en 2024** antes de dar el plan por terminado. Erik tiene los dos.
- No se rompe nada de los planes 1 y 2: las pruebas de hoy siguen pasando, y MMGL suena igual que hoy.

## Lo que queda al constructor

- Cuántas solicitudes de datos abiertas a la vez y en qué orden: primero las más cercanas.
- Cómo se ve el aviso «Buscando aeropuertos…» mientras llega la primera respuesta del lector.
- El texto exacto en inglés de los mensajes de pantalla.
- Los valores de `PRIMARY_DESIGNATOR` que no vio la prueba, sacados del SDK.
- Los nombres internos, archivos y pruebas, siguiendo lo que ya hay en `src/features/atis/`.

## Review Focus (lo que más puede fallar)

1. **Frecuencias de 8.33 kHz** (EGLL 121.935): lo que da `COM ACTIVE FREQUENCY` debe coincidir con la frecuencia de MSFS dentro de `TOLERANCIA_MHZ` (5 kHz). Probar en vivo en EGLL.
2. **Varios aeropuertos con la misma frecuencia ATIS** a menos de 200 NM: gana el más cercano, como hoy. Probar con SKBO y SAEZ, que tienen 127.800.
3. **METAR raros fuera de México**: `9999`, `CAVOK`, `NSC`, `VRB`, `00000KT`, visibilidad con dirección (`4000NE`), `M` en temperaturas, `Q` de 3 dígitos (`Q998`). Nunca se debe tumbar el armado: lo que no se entienda va en «Solo en texto».
4. **Volar lejos**: un vuelo largo pide cientos de aeropuertos; la memoria y el ritmo de solicitudes no deben crecer sin control.
5. **El lector ya abierto con el simulador cerrado y vuelto a abrir**: la lista del mundo se pide otra vez y `/aeropuertos` no da datos de la sesión anterior con otra posición.

## Anexo: muestras de texto

**OACI (oaci), EGLL**, METAR `EGLL 221450Z 24012KT 9999 FEW030 BKN045 09/04 Q1013 NOSIG`, letra B:

> London Heathrow Airport, information Bravo. One four five zero zulu weather. Runway in use, two seven left. Wind, two four zero degrees, one two knots. Visibility, one zero kilometers or more. Few clouds at three thousand. Broken, four thousand five hundred. Temperature, zero niner. Dewpoint, zero four. QNH, one zero one three hectopascals. No significant change. Advise on initial contact you have information Bravo.

**OACI bilingüe (latam), SKBO**, METAR `SKBO 221500Z 33008KT 9999 SCT020 BKN080 15/09 Q1027 NOSIG`, letra C. Primero en español:

> Aeropuerto Internacional de Bogotá. Información Charlie. Observación de las uno cinco cero cero zulú. Pista en uso, uno cuatro izquierda. Viento, tres tres cero grados, ocho nudos. Visibilidad, diez kilómetros o más. Nubes dispersas a dos mil pies. Fragmentadas a ocho mil pies. Temperatura, uno cinco. Punto de rocío, cero nueve. QNH, uno cero dos siete hectopascales. Sin cambios significativos. Al primer contacto, notifique que tiene la información Charlie.

Luego el mismo ATIS en inglés, como el de EGLL.

**FAA (faa), KLAX**, METAR `KLAX 222253Z 25010KT 10SM FEW020 SCT250 19/12 A2992`, letra D:

> Los Angeles International Airport, information Delta. Two two five three zulu weather. Wind two five zero at one zero. Visibility one zero. Few clouds at two thousand, scattered two five thousand. Temperature, one niner. Dewpoint, one two. Altimeter two niner niner two. Landing and departing runway two five left. Advise on initial contact you have information Delta.

La pista de cada muestra sale de `pistaEnUso` con ese viento. El texto de arriba la supone y la prueba usa la que dé la función.
