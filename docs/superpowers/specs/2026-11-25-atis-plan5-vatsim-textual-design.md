# Programa ATIS, plan 5: el ATIS de VATSIM de EE. UU., leído textual

Diseño del 2026-11-25. Sigue al plan 4 (D-ATIS real + voz en vivo, en main hasta f101b73). Diseño del plan 4: `2026-11-23-atis-plan4-datis-design.md`; plan 3 (redes): `2026-11-22-atis-plan3-mundial-design.md`.

## Intención

La meta de Villanueva Aviation sigue siendo **lo más real posible**.

Con VATSIM elegido y el interruptor «Leer en voz el ATIS de la red» encendido, la página hoy dice el ATIS de la red **con piezas**:
- la letra y la pista sí salen del texto de la red;
- el clima sale del METAR de aviationweather;
- el resto del texto no suena: aproximaciones, avisos, NOTAMs, «readback…».

Erik lo probó en KATL el 2026-11-24 y lo notó: no lo dice «exacto como viene en el ATIS de VATSIM».

El plan 5 hace que, en EE. UU., ese ATIS se diga **tal cual está escrito**, completo. Usa la misma tubería del D-ATIS del plan 4: piezas grabadas donde hay pieza, y voz en vivo de Azure para lo demás.

De paso arregla un error del plan 3. Cuando un aeropuerto tiene ATIS de llegadas y de salidas en VATSIM (KATL_A_ATIS y KATL_D_ATIS), la página tomaba solo uno. En KATL era el de salidas, y sonaba también en la frecuencia de llegadas.

## Lo que decidió Erik

- (2026-11-24) Sí: leer textual el ATIS de la red con la voz en vivo, después del plan 4.
- (2026-11-25) **Primero EE. UU.** Las demás regiones irán después, una por una, porque cada una escribe distinto:
  - Múnich lo escribe en palabras;
  - México usa un formato parecido al de EE. UU., con etiquetas `[RWY]`;
  - Sídney abrevia mucho (`[WIND] 090/12 XW 12 KTS`).
- (2026-11-25) **Enfoque A**: voz en vivo comprobada contra VATSIM (ver «Enfoques»).
- Las pruebas en vivo pueden hacerse en MSFS 2020 o 2024.

## Lo que hay en VATSIM (muestra del 2026-11-25, ~05Z)

- **Cantidad:** 30 estaciones ATIS en línea, 13 de ellas en EE. UU.; todas traían texto.
- **Datos de cada estación** (`vatsim-data.json` → `atis[]`):
  - `callsign` (`KDEN_A_ATIS`, `KSEA_ATIS`);
  - `frequency` (`"125.600"`);
  - `atis_code` (`"M"`);
  - `text_atis`, un arreglo de renglones que se unen con espacio.
- **Formato:** casi todas en EE. UU. usan el formato del D-ATIS (lo genera vATIS):
  - `KSEA ATIS INFO D 0453Z. 18011KT 10SM BKN065 OVC075 13/05 A2986 (TWO NINER EIGHT SIX). ILS ...`
  - `KDEN ARR INFO M 0453Z. ...` / `KDEN DEP INFO Z 0453Z. ...`
  - `PHL DEP INFO V 0454Z. ...`, con 3 letras como el D-ATIS.
- **Encabezados que no son del D-ATIS:**
  - `BOSTON LOGAN AIRPORT ATIS INFORMATION Z. 0454Z. 36006KT ...`
  - `KASE ATIS INFORMATION C. 0453Z. ...`
- **Llegadas y salidas por separado:** `_A_ATIS` / `_D_ATIS` (KDEN, KPHL, KATL, KCLT).
  - Su `frequency` suele ser la real: KPHL 133.400 llegadas y 135.925 salidas.
  - Algunas estaciones publican una frecuencia **de relleno** (`118.000`, `135.000`) que no es la del aeropuerto.

## Metas

1. Con VATSIM elegido, el interruptor «Leer en voz» encendido y un aeropuerto de EE. UU. con estación ATIS de VATSIM con texto, se oye **ese texto completo**:
   - en su orden;
   - con la letra de la estación (`atis_code`), su hora, su clima, sus aproximaciones, pistas y avisos;
   - con piezas donde hay pieza y voz en vivo para lo demás, igual que el D-ATIS.
2. En la frecuencia de llegadas suena el ATIS de llegadas, y en la de salidas el de salidas. Este arreglo vale para **cualquier región**, también cuando se lee con piezas o cuando la página calla para que suene vPilot.
3. El texto completo se ve en la página por partes, como el D-ATIS.
4. Cada parte en vivo se convierte a voz **una vez** por texto y se reusa (la caché del plan 4).
5. La función de voz **nunca** se vuelve un TTS abierto. Solo dice texto que ella misma saca del feed público de VATSIM y comprueba con la huella.

## No metas (por ahora)

- **Regiones fuera de EE. UU.** Siguen como hoy: letra y pista con piezas, más el METAR. Solo les toca el arreglo de llegadas y salidas.
- **IVAO.** Sus ATIS de texto los arma Aurora y tienen otro formato. Va después.
- Cambiar qué pasa con el interruptor apagado. Con el interruptor apagado y ATIS de la red, la página **calla**, porque el ATIS lo reproduce vPilot. Eso se queda igual.
- Cambiar el D-ATIS del plan 4 cuando no hay red. Se queda igual.

## Anti-metas

- Que alguien use `/api/atis/voz` para convertir a voz un texto suyo.
- Que siga sonando el ATIS de un controlador que ya se desconectó. La vigencia de la red sigue la regla del plan 3: una respuesta de más de 2 minutos no vale.
- Que el arreglo de llegadas y salidas o la lectura textual cambien cómo suena **fuera de EE. UU.**, salvo elegir la estación correcta.
- Que el lector haga más lento el simulador o lo tumbe. Este plan no toca el lector.

## Enfoques (Erik eligió A)

- **A. Voz en vivo comprobada contra VATSIM** (elegido).
  - Se usa la misma tubería que el D-ATIS.
  - La función de voz acepta una fuente `vatsim`: baja el feed de VATSIM (Cloudflare ya lo guarda 60 s para `/api/atis/red`), encuentra la estación, arma el ATIS igual que la página y compara la huella.
  - Misma voz, caché y costo que el D-ATIS.
- **B. Solo piezas.** Lo que no tiene pieza queda escrito en pantalla, sin sonido.
  - No gasta Azure.
  - Se descartó porque deja mudos justo los avisos, que es lo que pidió Erik.
- **C. Voz del navegador (Web Speech).**
  - Gratis, y no necesita comprobación porque no pasa por el servidor.
  - Se descartó: es otra voz, más robótica, cambia según la computadora y rompe «lo más real posible».

## Cómo funciona

### Qué estación de VATSIM corresponde a la frecuencia

- `estadoVatsim` deja de quedarse con una sola estación. Devuelve **todas** las estaciones ATIS del aeropuerto, cada una con:
  - su texto y su letra;
  - su frecuencia publicada;
  - su tipo, sacado del callsign: `_A_ATIS` → llegadas, `_D_ATIS` → salidas, otro `_ATIS` → combinada.
- La página elige la estación de la frecuencia que el cadete tiene sintonizada:
  1. La estación cuya frecuencia publicada coincide con la del COM, con la tolerancia de 5 kHz de siempre.
  2. Si ninguna coincide (frecuencia de relleno): la misma regla que el D-ATIS.
     - Una combinada gana.
     - Si no hay combinada: salidas si la frecuencia es la de salidas de la tabla `ATIS_SALIDAS` o si el nombre de MSFS dice DEP; si no, llegadas.
- Así se cubre KATL: VATSIM publica 119.650 / 125.550, y si no, la tabla dice 125.55.
- El tipo `EstadoRed` cambia de forma. Todo lo que lo usa debe seguir igual fuera de esta elección:
  - `fuente()`;
  - `datosDeRed()`;
  - la decisión de callar para vPilot.

### Leer el texto de VATSIM como un D-ATIS

- Se aplica cuando se cumple todo esto:
  - el aeropuerto es de formato FAA (`formatoDe(icao) === "faa"`);
  - la red es VATSIM y la fuente es `"cliente"`;
  - el interruptor «Leer en voz» está encendido;
  - el texto **se puede leer** (ver abajo).
- Cuando aplica, la página arma el ATIS con la tubería del plan 4 en lugar de `datosDeRed` + `armarAtis`.
- Si el texto no se puede leer, se queda lo de hoy: letra y pista con piezas.
- **Encabezado flexible.** Del texto de VATSIM se toman:
  - la **letra**, de `atis_code`;
  - la **hora**, del primer `\d{4}Z`;
  - el **cuerpo**, lo que sigue al punto después de esa hora. Así se aceptan tanto `KSEA ATIS INFO D 0453Z.` como `BOSTON LOGAN AIRPORT ATIS INFORMATION Z. 0454Z.`.
  - Sin letra o sin hora, el texto **no se puede leer**.
- El cuerpo pasa por lo mismo que el D-ATIS: el METAR, el RMK solo en texto, `hablado`, y las piezas o la voz en vivo.
- **Vigencia.** El ATIS de VATSIM vale mientras la red lo publique, con la regla de 2 minutos del plan 3. **No** se le aplica la regla de 90 minutos del D-ATIS, porque los controladores no siempre ponen la hora al día.
- **Cómo se marca el ATIS armado.** Cuenta como **ATIS de la red** para las reglas de la página:
  - `deRed`, con las mismas reglas de corte y espera que ya existen;
  - `huella` del texto, para que cambie cuando el controlador lo actualice;
  - **no** `real`.
  - La etiqueta sigue siendo la del ATIS de la red leído por el programa: «Leído con la voz del programa».
- Si el controlador actualiza el ATIS, la nueva letra o el nuevo texto entran en la pausa del final del loop, como hoy.

### La función de voz con fuente VATSIM

- `/api/atis/voz` acepta un parámetro de fuente.
  - Sin él, o con `datis`, todo es como hoy.
  - Con `vatsim`, la función sigue estos pasos:
    1. Baja el feed de VATSIM, con la misma caché de Cloudflare de 60 s que usa `/api/atis/red`.
    2. Encuentra la estación de ese aeropuerto y tipo.
    3. Arma el ATIS con la misma función que la página.
    4. Toma la parte en vivo número `n` y compara su huella con `h`. Si no coincide, responde 404 sin llamar a Azure.
- La URL de cada parte en vivo la arma la misma función que usa la página, como en el plan 4. Lleva la fuente y lo que la función necesita para encontrar la estación.
- Caché, secretos, tiempos límite, `User-Agent` y respuestas 503/502 funcionan igual que en el plan 4.

## Costo

- **Azure:** cada ATIS de EE. UU. gasta más o menos lo mismo que un D-ATIS, unos 700 caracteres la primera vez y 0 después, por la caché.
- **VATSIM:** la función de voz baja el feed (~1 MB). Con la caché de 60 s de Cloudflare, es a lo más una bajada por minuto por centro de datos.

## Pruebas

- **Automáticas, sin red y sin Azure, como en el plan 4.** Se guarda una muestra real del feed de VATSIM de EE. UU. con:
  - una combinada;
  - un par de llegadas y salidas;
  - un encabezado tipo Boston;
  - una frecuencia de relleno.
- **Qué prueban:**
  - la elección de estación por frecuencia;
  - la lectura flexible del encabezado;
  - que la página y la función saquen las mismas partes en vivo, para todas las estaciones de la muestra;
  - el 404 cuando la huella no coincide;
  - que fuera de EE. UU. todo siga igual.
- **En vivo con Erik**, en MSFS 2020 o 2024, unas 3 pruebas:
  1. Un aeropuerto de EE. UU. con una sola estación de VATSIM (KSEA, KSFO, KBOS…): se oye el texto completo.
  2. Uno con llegadas y salidas en VATSIM (KDEN, KPHL, KATL): cada frecuencia da su ATIS y el cambio corta al momento.
  3. Un ATIS de VATSIM fuera de EE. UU.: suena como hoy, letra y pista.
- Las pruebas en vivo dependen de que haya controladores conectados. Se buscan en el feed justo antes de cada prueba.

## Decisiones de Claude (tras la revisión del constructor, 2026-11-25)

Muestra guardada: `src/features/atis/vatsim.muestra.json`. Tiene 34 estaciones de EE. UU. (con Hawái) y 4 de otros países, tomadas del feed de VATSIM el 2026-11-25. Con esa muestra se decidió lo siguiente:

1. **Tope de largo.** Un texto de más de **1,200 caracteres** no se lee textual y queda como hoy (letra y pista).
   - Por qué: el texto lo escribe cualquier controlador. Sin tope, alguien podría hacer que Azure lea un texto enorme.
   - En la muestra el más largo tiene 533 caracteres. El D-ATIS más largo del plan 4 (KORD) mandaba 1,738 caracteres a voz en vivo, pero ese tope no aplica al D-ATIS.
   - El tope vive en la misma función «se puede leer» que usan la página y la función de voz.
2. **Sin altímetro (`A\d{4}`) no se lee textual.** Queda como hoy: letra y pista con piezas, más el METAR de aviationweather. Así el clima siempre suena. En la muestra las 34 estaciones traen altímetro.
3. **Cierre.** Las 34 estaciones cierran con `...ADVS YOU HAVE INFO X`, a veces con 2 a 5 puntos antes y a veces con punto al final. El cierre del plan 4 debe aceptar cualquier cantidad de puntos.
4. **Encabezados de la muestra** que la lectura flexible debe aceptar:
   - `OXC ATIS INFORMATION Z. 0256Z.`
   - `LOUISVILLE INTERNATIONAL AIRPORT ATIS INFORMATION F 0256Z.`
   - `CINCINATTI NORTHERN KENTUCKY INTERNATIONAL AIRPORT ARRIVAL INFORMATION …`
   - `KBZN ATIS INFORMATION A. 0256Z .`, con un espacio antes del punto.
   - La hora es el primer `\d{4}Z`, y el cuerpo empieza después del punto que la sigue, aunque haya espacios en medio.
5. **Si la función de voz ve otra versión del texto** (el controlador acaba de actualizar), la huella no coincide, la función responde 404 y esa parte queda sin voz. El reintento de 15 s del plan 4 la recupera cuando las dos cachés coinciden, en a lo más 1–2 minutos. Se acepta: el resto del ATIS suena y el texto completo se ve.
6. **La URL de voz lleva el callsign de la estación** (`KCVG_A_ATIS`). La función comprueba que ese callsign sea del aeropuerto, con la misma regla `delAeropuerto` del plan 3. Así no hay empate si un aeropuerto tiene dos estaciones del mismo tipo.
7. **No se toma otra estación** si la de la frecuencia sintonizada no se puede leer: se queda como hoy para esa estación. Tomar otra pondría en la frecuencia un ATIS ajeno, por ejemplo el de llegadas en la de salidas.
8. **Frecuencias de relleno.** En la muestra hay estaciones con `135.000` (KBOS, KFLL) y `118.000` (KFTK), que no son las del aeropuerto. Como ninguna coincide con el COM, se usa la regla de respaldo.

## Lo que queda al constructor

- La forma exacta del nuevo `EstadoRed` (lista de estaciones con tipo y MHz) y cómo se adaptan `fuente`, `datosDeRed` y sus pruebas.
- Los nombres de los parámetros de la URL de voz para la fuente VATSIM.
- Si la lectura flexible del encabezado vive en `datis.ts` (generalizando `leerDatis`) o en una función aparte. La condición: la página y la función usan **la misma**.
