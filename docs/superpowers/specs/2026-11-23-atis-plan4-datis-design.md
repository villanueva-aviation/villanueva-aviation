# Programa ATIS, plan 4: el ATIS real de EE. UU. (D-ATIS), avisos incluidos

Diseño del 2026-11-23. Sigue a los planes 1–3 (en main hasta 58f544f). Diseño padre: `2026-11-16-programa-atis-design.md`; plan 3: `2026-11-22-atis-plan3-mundial-design.md`.

## Intención

Villanueva Aviation quiere que todo lo que hace sea **lo más real posible**. Hoy, en un aeropuerto grande de EE. UU. sin controlador en la red, el programa dice un ATIS **generado**: el METAR es real, pero la letra y la pista las elige el programa. En la vida real ese aeropuerto transmite otro ATIS, con otra letra, a veces otra pista y una lista de avisos (pistas cerradas, pájaros, grúas, «readback all runway assignments»).

El plan 4 hace que, donde existe el ATIS real en texto (D-ATIS), el cadete oiga **ese** ATIS, completo, avisos incluidos, con la voz y el efecto de radio de siempre.

## Lo que decidió Erik (2026-11-23)

- La meta es «lo más real posible»: también se dicen los avisos, no solo letra, pista y clima.
- **Enfoque A** (ver «Enfoques»): lo que ya tiene pieza (letra, hora, clima, pistas, cierre) se dice con las piezas grabadas; **lo demás se dice con voz en vivo de Azure**, la misma voz `en-US-ChristopherNeural`, una sola vez por ATIS, y se guarda hasta que el ATIS cambia.
- Esto cambia, **solo para el D-ATIS**, la regla del 2026-11-16 de no usar voz en vivo.

## La fuente (comprobada el 2026-11-23)

- `https://atis.info/api/all` (antes `datis.clowd.io`, que redirige con 302; por eso falló antes: no se seguía la redirección). No oficial.
- Una sola consulta trae todos: el 2026-11-23 eran **76 aeropuertos, 89 ATIS** (63 `combined`, 13 `arr` + 13 `dep`). Incluye KLAX, KJFK, KATL, KORD, PANC, PHNL, TJSJ.
- Cada entrada: `{ airport, type: "combined"|"arr"|"dep", code: "H", datis: "<texto>", time: "0451", updatedAt }`.
- El texto trae **su propio METAR** sin estación ni fecha. Ejemplo (KJFK):

  > JFK ATIS INFO H 0451Z. 35011G22KT 10SM BKN095 BKN120 11/M01 A3008 (THREE ZERO ZERO EIGHT). APPROACH IN USE ILS RY 31R, VISUAL APCH RY 31L. DEPG RY 31L. NOTAMS, . RWY 4R, 22L CLSD. RY 31L PAPI OTS. NUM CRANES OPERATING AT JFK. BIRD ACTIVITY VICINITY ARPT. READBACK ALL RWY ASSIGNMENTS AND HOLD SHORT INSTRUCTIONS. ...ADVS YOU HAVE INFO H.

- Solo existe en ~76–80 aeropuertos grandes. En el resto de EE. UU. el ATIS solo sale por radio y no se publica en texto: ahí **sigue el ATIS generado** del plan 3.

## Metas

1. En un aeropuerto con D-ATIS, sin controlador en la red (o con «Sin red»), al sintonizar su frecuencia ATIS de MSFS se oye el D-ATIS **completo**, en su orden, con la letra, la hora, el clima, las aproximaciones, las pistas y los avisos **de la fuente**.
2. Nada del texto queda mudo: lo que el programa entiende va con piezas; **todo lo demás** va con voz en vivo.
3. El texto completo se ve en la página, por partes, como hoy.
4. Cada ATIS se convierte a voz **una vez** (por aeropuerto, tipo y texto) y se reusa para todos los que lo sintonicen.
5. La clave de Azure vive **solo en Cloudflare** (secreto que pone Erik). Nunca en el navegador ni en el repositorio.

## No metas (por ahora)

- **PilotEdge** (estaba anotado para el plan 4). [Decisión de Claude] Se queda fuera: PilotEdge ya reproduce su propio ATIS de voz y Erik no lo ha pedido. Se agrega cuando haga falta.
- Traducir el D-ATIS al español. El D-ATIS es en inglés y **suena en inglés** aunque la página esté en español; solo las etiquetas de la página siguen el idioma.
- ATIS de texto de otros países (no hay fuente pública equivalente).
- Abrirlo a todos. Sigue **solo para el fundador** (`ACCESO_ATIS`) hasta el plan 5, donde también se revisa el costo de Azure con más usuarios.
- X-Plane.

## Anti-metas (si pasa esto, salió mal aunque funcione)

1. Anunciar una pista distinta a la del controlador de la red. Las reglas de red **siguen primero**: con ATC en la red manda el plan 2/3; el D-ATIS solo entra donde hoy entraría el generado.
2. Que la función de voz sirva para convertir **cualquier texto** (un proxy abierto de Azure con la clave de Erik). La función solo convierte texto que ella misma sacó del D-ATIS.
3. Un cobro sorpresa de Azure. Con la cuenta F0, Azure corta al llegar al límite (no cobra); al cortarse, los avisos pasan a «Solo en texto» y el resto sigue sonando.
4. Que la voz lea abreviaturas letra por letra («R-Y three one L», «A-R-P-T»). Se pasan a palabras antes.
5. Decir un D-ATIS viejo como si fuera el actual.
6. Que el D-ATIS se calle o se trabe si la fuente o Azure fallan: se cae al ATIS generado (fuente caída) o a «Solo en texto» para los avisos (Azure caído).

## Enfoques considerados

- **A. Piezas + voz en vivo para lo demás (elegido por Erik).** Dice todo, incluso avisos nunca vistos. Requiere la clave de Azure en Cloudflare; costo por uso (cero mientras quepa en F0).
- **B. Biblioteca grabada de ~50 avisos comunes.** Costo cero, pero lo que no esté en la biblioteca queda en texto: nunca dice el 100%.
- **C. B + voz en vivo para lo que falte.** Más ahorrador que A, pero dos caminos que mantener y no suena más real que A.

## Diseño

### 1. Qué fuente manda (regla)

Sin cambios para la red. Donde hoy `fuente()` daría **"generado"**:
- si el aeropuerto tiene un D-ATIS **vigente** para la frecuencia sintonizada → **"real"** (nuevo valor de `Fuente`);
- si no → "generado", como hoy.

Vigente: la hora de emisión `time` (HHMM Zulu, sin fecha; se lee contra la hora UTC actual, con cambio de día) es de hace menos de [Decisión de Claude] **90 min**. Más viejo, o la fuente no contesta → "generado". `updatedAt` **no sirve**: es la hora en que atis.info volvió a consultar (el 2026-11-23 a las 0532Z todos decían ~0531Z, y KADW tenía `time` 0255).

### 2. Llegada, salida o combinado

Si el aeropuerto tiene `combined`, ese vale para todas sus frecuencias ATIS. Si tiene `arr` y `dep`, hay que saber cuál frecuencia es cuál. [Decisión de Claude] El lector agrega el **nombre de cada frecuencia ATIS** de MSFS al JSON de `/aeropuertos` (la estructura `FrecFac` ya lee `NAME`; el plan 3 lo descarta). Es un cambio en C# y hay que recompilar el lector. Si el nombre dice `DEP`/`DEPARTURE` → `dep`; si no → `arr`. Si MSFS solo trae una frecuencia ATIS → `arr`. No se sabe si los nombres de MSFS traen `DEP`: se revisa en la prueba en vivo (KATL, KCLE tienen `arr` y `dep`); si no lo traen, todas suenan `arr` y se anota.

### 3. Función `GET /api/atis/real?icao=KJFK`

- Baja `https://atis.info/api/all` con caché de Cloudflare de 60 s (una consulta sirve a todos los aeropuertos), igual que `functions/api/atis/red.ts` con IVAO/VATSIM, con el mismo user-agent.
- Responde las entradas de ese ICAO (`[]` si no tiene). 502 si la fuente falla.
- La página la llama **solo para el aeropuerto sintonizado**, cada 60 s, como `/api/atis/red`. No hace falta una lista fija de aeropuertos con D-ATIS: `[]` → "generado".
- No usa la clave de Azure.

### 4. Leer el D-ATIS por partes (`src/features/atis/datis.ts`, nuevo)

Del texto se sacan, en su orden:
- **encabezado**: letra (`INFO H`) y hora (`0451Z`) → piezas (`f-informacion`, `letra-H`, hora con dígitos), con el nombre del aeropuerto (`ap-KJFK`) como el ATIS generado FAA;
- **METAR**: el bloque del clima se arma como `KJFK ddhhmmZ <bloque>` y pasa por el lector de METAR que ya existe (`src/lib/clima.ts`) y por el armado FAA del plan 3. Lo que ese armado manda a «Solo en texto» aquí va a **voz en vivo**;
- **aproximaciones y pistas**: `APPROACH IN USE ILS RY 31R`, `LANDING RWY…`, `DEPG RY 31L`, `ARRIVALS EXPECT…`. Las pistas con piezas (`f-pista-llegada`, `f-pista-salida`, dígitos y lado); el tipo de aproximación (ILS, visual, RNAV…) [Decisión de Claude] va a voz en vivo junto con su frase, para no crear piezas nuevas por cada tipo;
- **cierre**: `ADVS YOU HAVE INFO H` → `f-cierre` + `letra-H`;
- **avisos**: **todo lo que sobra**, en su orden original → voz en vivo.

Invariante: cada carácter con sentido del texto termina en una pieza o en voz en vivo. Ninguna parte con contenido queda solo en texto, salvo cuando Azure no esté disponible.

El texto en pantalla muestra cada parte con su texto original del D-ATIS.

### 5. Voz en vivo `GET /api/atis/voz?icao=KJFK&tipo=arr&n=2&h=<hash>`

- La función vuelve a bajar el D-ATIS (de la caché de 60 s), lo parte con **el mismo código** de `datis.ts`, toma el segmento `n` de voz en vivo (`n` cuenta solo los segmentos de voz en vivo, desde 0), lo **normaliza** y lo manda a Azure. Así solo convierte texto que salió del D-ATIS (anti-meta 2).
- `h` es el hash del texto normalizado de ese segmento, calculado por la página con el mismo código. Si el segmento `n` no existe o su hash no es `h` (el ATIS cambió, aunque sea con la misma letra), 404: nunca se mezclan avisos de dos ATIS.
- Normalizar: contracciones de la FAA a palabras (`RY`/`RWY` → runway, `APCH` → approach, `CLSD` → closed, `OTS` → out of service, `ARPT` → airport, `VCNTY` → vicinity, `TWY` → taxiway, `DEPG` → departing, `INST` → instrument, `SIMUL` → simultaneous, `NUM` → numerous, `ADVS` → advise…); identificadores de pista como se dicen («three one left»); letras sueltas de calle de rodaje en alfabeto aeronáutico («taxiway alpha»); frecuencias dígito por dígito («one two one point seven five»); números de altura como en el ATIS FAA. Lo que no esté en la lista se manda tal cual.
- Azure: misma voz y estilo que las piezas (`en-US-ChristopherNeural`, `prosody rate="-8%"`, `audio-24khz-48kbitrate-mono-mp3`, ver `tools/atis-piezas/generar.ts`).
- Caché: la respuesta MP3 se guarda en la caché de Cloudflare (`caches.default`) con una clave que incluye el **hash del texto normalizado**, por [Decisión de Claude] 3 h. El mismo ATIS no se vuelve a pedir a Azure.
- Secretos: `AZURE_SPEECH_KEY` y `AZURE_SPEECH_REGION` en las variables de Cloudflare Pages. **Los pone Erik** en el panel de Cloudflare; Claude nunca ve la clave.
- Errores: sin secretos, Azure 4xx/5xx o límite F0 → 503. La página marca ese segmento «Solo en texto» y sigue con lo demás.
- Cuenta: el recurso de Erik `villanueva-atis-voz` (East US) es **F0**. Su límite de voz neural es de unos 500 000 caracteres al mes (verificarlo en el portal de Azure). Solo se convierte lo que alguien sintoniza y una vez por ATIS: con un solo usuario son unos pocos miles de caracteres al día.

### 6. Página y audio

- La página ya pide `/aeropuertos` al lector y `/api/atis/red`. Para un aeropuerto en la lista de D-ATIS también pide `/api/atis/real` (cada 60 s mientras esté sintonizado, como la red).
- `motorAudio.ts` hoy reproduce piezas (`/atis/piezas/...mp3`). Se extiende para que una parte pueda traer, en vez de piezas, **una URL de voz en vivo**; pasa por la misma cadena de radio (estática, distancia, corte). [Decisión de Claude] `cargarAudio` hoy junta todo en un solo buffer que se repite: antes de armarlo **espera hasta 8 s** por los segmentos de voz en vivo. Los que no llegan se arman sin ellos («Solo en texto»); cuando llegan, el buffer se rehace **al terminar la vuelta en curso**, con el mismo mecanismo que el cambio de letra (sin cortar a media frase).
- Etiqueta en la página: «ATIS real (D-ATIS)» / «Real ATIS (D-ATIS)». Sigue «Solo para simulación».
- Cambio de letra mientras suena: como hoy, se termina la lectura en curso y la siguiente vuelta ya es el ATIS nuevo.

## Restricciones

- Las del programa: «Solo para simulación»; nunca «oficial» ni «certificado»; solo fundador.
- Las Functions se compilan con el esbuild de wrangler 3: sin `with { type: "json" }`.
- La fuente es no oficial: una sola consulta a `/api/all` cada 60 s (caché), con user-agent que identifica al sitio.
- La clave de Azure solo en Cloudflare; Erik la pone. Para probar en local, Erik crea `.dev.vars` (ignorado por git) él mismo o se prueba contra la vista previa.
- Pruebas con `npm test` (node --test), no vitest. Lo nuevo entra a la lista del `test` de `package.json`.

## Lo que queda al constructor

- Los patrones exactos para partir el D-ATIS. Probarlos con **todos** los textos de `/api/all` de varios días (guardar muestras como datos de prueba).
- La lista completa de contracciones (base: FAA JO 7340.2) y las reglas de números.
- Cómo pasa la página el número de segmento y el tipo (`arr`/`dep`) a la función de voz.
- Si las pruebas de la función simulan Azure (sí: nunca llamar a Azure desde una prueba).

## Review Focus (lo que más puede fallar)

1. Un D-ATIS con un formato raro (sin METAR, METAR partido, `NOTAMS, .` vacío, typos): nada se queda mudo ni rompe el armado; cae a voz en vivo.
2. Azure sin secretos, con 429 o caído: el ATIS sigue sonando con piezas y los avisos salen «Solo en texto».
3. El ATIS cambia de letra entre que la página lo pide y la voz se genera: la función contesta 404 y la página se queda con el ATIS nuevo en la siguiente vuelta, sin mezclar avisos de dos letras.
4. Aeropuertos con `arr` y `dep`: cada frecuencia de MSFS suena el que le toca; si no se sabe, `arr`.
5. Con controlador en la red, el D-ATIS **no** suena (anti-meta 1).
