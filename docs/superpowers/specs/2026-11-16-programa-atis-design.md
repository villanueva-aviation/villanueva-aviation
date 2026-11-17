# Programa ATIS de Villanueva — ATIS realista para volar en IVAO, VATSIM y PilotEdge

Fecha: 2026-11-16. Producto nuevo, aparte del instructor virtual. Se construye con el mismo patrón que el instructor (`docs/superpowers/specs/2026-11-05-instructor-programa-voz-design.md`): un lector pequeño en la PC y una ventana de Edge `--app` que abre una página del sitio.

## Intención

Erik quiere un programa que le diga el ATIS al piloto cuando sintoniza la frecuencia del aeropuerto, con el clima real, y que **suene lo más real posible**. Está pensado para quien vuela en IVAO, VATSIM o PilotEdge con ATC humano, sin depender del tráfico de SayIntentions ni de BeyondATC. Si el aeropuerto real tiene ATIS, se usa ese.

Hoy, en IVAO, casi nunca hay controlador en México. El ATIS que trae MSFS suena robótico, tiene frecuencias y pistas que no siempre son las reales, e ignora lo que pasa en la red.

Además, el programa **enseña**. Mientras suena el ATIS, el texto aparece por partes. Cada parte se puede tocar para ver qué significa, con un enlace a la página. Así el programa lleva pilotos al sitio y a la Academia.

Éxito: Erik vuela en IVAO por MMGL sin controlador, sintoniza 127.9 y escucha un ATIS con el METAR real, en español y luego en inglés, que suena a radio. Si se aleja, el ATIS se llena de estática. Si toca "QNH 30.14", entiende qué es y llega a la guía del sitio.

## Lo que decidió Erik

- Es un **producto aparte** del instructor. Venderlo o regalarlo **está por decidir**.
- Simuladores: **MSFS 2024** y **X-Plane**. MSFS 2020 sale sin trabajo extra, porque usa el mismo SimConnect.
- Redes: **IVAO, VATSIM y PilotEdge**.
- Incluye la **parte educativa**: texto del ATIS por partes, con explicaciones y enlaces al sitio.
- Debe sonar **lo más real posible**. Erik escuchó 6 muestras del ATIS de MMGL (`atis-prueba/`, prueba que se tira) y eligió la **05**:
  - **Jorge** (es-MX-JorgeNeural) en español y **Christopher** (en-US-ChristopherNeural) en inglés;
  - velocidad −8 %;
  - **efecto de radio normal**: dos pasa-altos de 300 Hz, dos pasa-bajos de 3000 Hz, compresión fuerte (umbral −24 dB, razón 8), saturación suave tanh y estática rosa leve.
- **La voz nunca cuesta dinero.** Erik oyó también la 07 (piezas pegadas) y la 08 (Piper, voz local) y eligió **solo la 07**:
  - todo el ATIS se arma **pegando piezas grabadas una sola vez** con Jorge y Christopher;
  - no hay voz que genere texto libre (ni Azure en vivo ni Piper).
- Arquitectura **A**: lector pequeño + ventana web en el sitio + datos y piezas servidos desde Cloudflare. Se descartaron el programa de escritorio completo (B) y los paneles dentro del simulador (C).

## Metas

1. Sintonizas en COM1 o COM2 la frecuencia ATIS de un aeropuerto en alcance y escuchas su ATIS en loop, con voz de radio.
2. Fuente correcta según la red (ver «De dónde sale el ATIS»). El programa nunca contradice al ATC de la red.
3. ATIS generado con el METAR real cuando no hay otro: formato mexicano bilingüe (español y luego inglés) en México, formato FAA en inglés en EE. UU. y OACI en inglés en el resto del mundo.
4. Se comporta como uno real:
   - entras **a media frase**;
   - la **letra cambia** con cada METAR nuevo;
   - la **estática y el volumen** dependen de la distancia;
   - **se corta** fuera del alcance de la radio.
5. Texto en pantalla por partes, cada una con su explicación en español o inglés y un enlace al sitio.
6. Funciona con MSFS 2020/2024 y X-Plane 11/12 en Windows.

## No metas (por ahora)

- Transmitir algo a la red. Solo suena en la PC del piloto: en IVAO y VATSIM solo un controlador puede publicar un ATIS.
- Tráfico, ATC por voz, torre o autorizaciones.
- Panel dentro del simulador. Mac y Linux.
- La voz de Erik clonada o ElevenLabs. Sería la opción premium de después.
- NOTAM reales para el ATIS generado. Solo traen NOTAM las fuentes que ya los incluyen (D-ATIS y ATIS de red).
- Decidir el precio. La primera versión entra con **cuenta gratis** de Villanueva, y el cobro se decide después.

## Anti-metas (si pasa esto, salió mal aunque funcione)

- Que el piloto llame al controlador de la red con una letra, pista o QNH distintos a los de **su** ATIS.
- Que suene encima del ATIS de voz que ya pone el cliente de VATSIM o de PilotEdge.
- Que la voz cueste dinero. Las piezas se graban una vez y el programa nunca llama a un servicio de voz.
- Que diga "oficial" o "certificado", o que parezca servir para la aviación real. Se aclara "Solo para simulación".

## Enfoques considerados

- **A. Lector pequeño + ventana web en el sitio + piezas de voz servidas desde el sitio** — elegido. Reusa el lector, la ventana Edge `--app` y el login del instructor. Las mejoras llegan sin reinstalar nada. El login y los enlaces llevan gente al sitio. Necesita internet, pero igual lo necesita para el METAR.
- **B. Programa de escritorio completo (.exe con su pantalla y su audio)** — descartado. Habría que hacer toda la pantalla de nuevo, cada mejora obliga a reinstalar y el vínculo con el sitio queda débil.
- **C. Paneles dentro del simulador** — descartado. Son dos desarrollos distintos (panel de MSFS y plugin de X-Plane) para el mismo resultado.

## Piezas

### 1. Lector ATIS (C#, Windows)

- Programa nuevo **derivado** de `tools/instructor-lector/LectorInstructor.cs`: mismo HTTP mínimo, mismos CORS y misma ventana Edge `--app` con perfil propio. Es otro ejecutable, con otro nombre, otro puerto (**8767**) y otra carpeta de perfil. No comparte instalación con el instructor.
- Sirve `GET /muestra` con: simulador, COM1 y COM2 activos (MHz), qué COM está escuchando y el volumen de cada uno si el simulador lo da, latitud, longitud, altitud MSL y altura AGL.
- **MSFS:** SimConnect, igual que el instructor. Busca los DLL en la PC del piloto y no los incluye.
- **X-Plane 11/12:** UDP `RREF` al puerto 49000, sin plugin. Datarefs:
  - frecuencias: `sim/cockpit2/radios/actuators/com1_frequency_hz_833` y `com2_…`;
  - selección de audio: `sim/cockpit2/radios/actuators/audio_selection_com1` y `…com2`;
  - volumen: `…audio_volume_com1` y `…com2`;
  - posición: `sim/flightmodel/position/latitude`, `longitude`, `elevation` (m) y `y_agl` (m).
- Detecta solo el simulador: prueba SimConnect y, si no responde, X-Plane por UDP. `--simulado` sirve para probar sin simulador, igual que el instructor.
- Al abrirse, abre la ventana en `https://villanueva-aviation.pages.dev/atis/programa`.

### 2. Datos de aeropuertos (estáticos, en el sitio)

- Frecuencias ATIS, pistas (rumbo y umbrales) y elevación salen de **OurAirports** (dominio público), convertidos con un script en JSON compacto por país en `public/data/atis/`. Se usa la frecuencia **real** porque es la que trae la carta del piloto y la que usan las redes. La del simulador puede estar desactualizada.
- Si un aeropuerto no tiene frecuencia ATIS en los datos, no hay ATIS. (Llenar huecos a mano con las guías de `/aeropuertos` queda para después.)

### 3. Servidor (Cloudflare Pages Functions)

- `GET /api/atis/red?icao=XXXX&red=ivao|vatsim`: sirve de intermediario de los feeds públicos (VATSIM `https://data.vatsim.net/v3/vatsim-data.json`, IVAO `https://api.ivao.aero/v2/tracker/whazzup`). Responde si hay ATC en ese aeropuerto y su ATIS (texto, letra y frecuencia), con caché de 60 s. Comprobado el 2026-11-16:
  - VATSIM tiene `atis[]` con `callsign` `XXXX_ATIS`, `frequency`, `atis_code` y `text_atis[]`;
  - IVAO tiene `clients.atcs[]`, y el ATIS va pegado a la estación (`EDDB_TWR`) con `atis.lines[]` y `atis.revision`.
- `GET /api/atis/real?icao=XXXX`: intermediario del D-ATIS de EE. UU. (`https://atis.info/api/XXXX`, no oficial; el 2026-11-16 devolvió KLAX y nada para MMMX). Caché de 60 s.
- METAR: se reusa `functions/api/wx/[tipo].ts`.
- No hay servicio de voz en el servidor.

### 3b. Banco de piezas de voz (se graba una vez)

- **Un script** que corre una sola vez (y de nuevo solo si se agregan frases o aeropuertos) genera cada pieza con **Azure Speech**:
  - Jorge (es-MX-JorgeNeural) y Christopher (en-US-ChristopherNeural), velocidad −8 %;
  - recorta el silencio al inicio y al final de cada pieza, igual que en la muestra 07.
- Piezas:
  - **dígitos** 0–9 y **letras del alfabeto fonético** A–Z, en dos versiones (**«sigue»** y **«cierra»**, para que el último dígito de un grupo baje la entonación como en la 07);
  - **frases fijas** de cada formato (México bilingüe, FAA y OACI): «Pista en uso», «Viento», «grados», «nudos», «calma», «variable entre», «ráfagas», visibilidad, cada tipo de nube, fenómenos de tiempo del METAR, «Altímetro», «Nivel de transición», cierre, etc.;
  - **nombres de aeropuerto**: uno por cada aeropuerto con frecuencia ATIS en los datos. En México en español e inglés; en EE. UU. y el resto, en inglés.
- Se usa el **plan gratis de Azure (F0)**, que da 500 000 caracteres al mes. Todo el banco cabe holgado en un mes, unas pocas decenas de miles de caracteres más los nombres.
  - **Erik crea la cuenta gratis de Azure.** La llave se usa solo al correr el script y nunca se publica.
- Las piezas se sirven como archivos estáticos (MP3 o Opus) del sitio, con un índice JSON. La página baja solo las que necesita cada ATIS y las guarda en caché.
- Pegado: entre piezas hay pausas fijas como en la 07 (0.06 s entre piezas, 0.22 s tras coma, 0.45 s tras punto y 1.2 s entre español e inglés), con un cruce muy corto en cada unión para que no se oigan clics.

### 4. Página `/atis/programa` (React, ventana del lector)

- Login dentro de la ventana, igual que `/instructor/programa` (Google o código de 6 dígitos).
- **[Decisión de Claude] Acceso:**
  - Mientras se prueba, **solo el fundador**, con una constante en el código como `ACCESO_REPASO` en `lecciones.ts`. Sin campo nuevo en Supabase.
  - Al publicarse, cualquier cuenta gratis.
  - Como la voz no cuesta, el servidor no necesita revisar sesión: el acceso se controla solo en la página.
- Arriba, selector de red: **IVAO, VATSIM, PilotEdge o Sin red**. Se recuerda en localStorage. También selector de idioma de la pantalla.
- Cada segundo lee `/muestra`. Para cada COM que se escucha, busca un aeropuerto cuya frecuencia ATIS coincida (tolerancia de 5 kHz, el más cercano) y que esté **en alcance**.
- Elige la fuente (ver abajo), arma la lista de piezas y el texto, pega las piezas y las reproduce en loop con el efecto de radio.
- Pantalla compacta para segundo monitor:
  - aeropuerto, letra, fuente («ATIS de IVAO», «ATIS real», «Generado con el METAR de las 2240Z»);
  - texto por partes y explicación de la parte tocada;
  - botón para silenciar;
  - aviso «Solo para simulación».

### 5. De dónde sale el ATIS

En este orden:

1. **Red con ATIS de voz propio → el programa calla.** Muestra el texto de la red con sus explicaciones y la etiqueta «Escúchalo en tu cliente».
   - Aplica a **VATSIM** cuando hay estación `XXXX_ATIS` en línea: vPilot y xPilot ya reproducen su voz al sintonizarla.
   - Aplica a **PilotEdge** en los aeropuertos que cubre: su cliente ya da el ATIS.
2. **Red con ATIS de texto → lo decimos con piezas.** Aplica a **IVAO**: si una estación del aeropuerto (DEL, GND, TWR o APP) tiene `atis`, se usa ese ATIS al sintonizar la frecuencia ATIS real del aeropuerto. Es el valor principal para IVAO. Ver «Cómo se dice un ATIS de texto».
3. **Red con ATC pero sin ATIS** → se genera con el METAR, **sin letra ni pista en uso**, y cierra con «Confirme pista y QNH con el controlador». Así no choca con el ATC.
4. **Sin ATC en la red** (o «Sin red»):
   - si existe **D-ATIS real**, se usa ese (ver «Cómo se dice un ATIS de texto»);
   - si no, se **genera** con el METAR real.

**[Decisión de Claude] Qué cuenta como «ATC en el aeropuerto».** Ante la duda, el programa supone que hay ATC (regla 3), porque anunciar una pista con un controlador trabajando es la anti-meta 1. Cuentan:
- cualquier estación con el prefijo del aeropuerto (`MMGL_DEL/GND/TWR/APP/DEP`);
- cualquier APP, DEP, CTR o FSS cuya posición publicada en el feed esté a una distancia del aeropuerto menor que su alcance visual publicado (`visual_range` en VATSIM; en IVAO, `lastTrack` y su alcance, o 150 NM para CTR y 60 NM para APP si no viene).

No se hace un mapa de sectores. Si después un caso real falla (un centro que no cubre ese aeropuerto), se agrega una lista de excepciones.

**[Decisión de Claude] Cómo se dice un ATIS de texto (IVAO y D-ATIS).** Como no hay voz para texto libre, el texto se **lee por partes** y se dice con las mismas piezas y el mismo formato del país que el ATIS generado:
- se sacan del texto la **letra**, la **hora**, el **METAR** que viene dentro (IVAO lo trae casi siempre completo), las **pistas** (`RWY`, `ARR RWY`, `DEP RWY`, `LDG & DEPTG RWY`) y el **nivel de transición** (`TL`);
- con eso se arma el ATIS como si fuera generado, pero con la letra y las pistas **de la fuente**, nunca las nuestras;
- lo demás (NOTAM, calles cerradas, avisos libres) **no se dice**: aparece en pantalla marcado «Solo en texto»;
- si no se encuentra ni la letra ni el METAR, no hay voz: solo el texto en pantalla, con la etiqueta «ATIS sin voz».

### 6. ATIS generado

- **Formato México (OACI bilingüe):**
  - Español primero y luego inglés, con 1.2 s de pausa entre los dos. El texto es el de la muestra 05 (ver Anexo).
  - Orden: aeropuerto, información (letra), hora de observación, pista en uso, viento, visibilidad, nubes, temperatura y punto de rocío, altímetro, observaciones del METAR que se puedan decir (por ejemplo «ISOL SC» → estratocúmulos aislados) y «al primer contacto notifique que tiene la información X».
  - Números dígito por dígito: «uno dos cero» en español y «one two zero» / «niner» en inglés.
- **Formato EE. UU. (FAA, inglés):** «[Airport] information X, HHMM zulu… altimeter… advise on initial contact you have information X».
- **Resto del mundo:** formato OACI en inglés.
- **Pista en uso:** la de mayor viento de frente según OurAirports. Con viento menor a 5 kt se usa la pista preferente, que por ahora es la más larga.
- **Letra:** la misma para todos los pilotos. Se calcula desde la hora del METAR (cambia cuando sale un METAR nuevo, de A a Z, vuelta a A), sin guardar estado en el servidor.
- Si el METAR trae algo que no tiene pieza (un fenómeno raro), esa parte no se dice y queda en pantalla como «Solo en texto». Al banco se le agregan piezas conforme aparezcan casos.

### 7. Sonido realista (Web Audio, en la página)

- Misma cadena que la muestra 05, hecha con `BiquadFilterNode` (2× highpass 300, 2× lowpass 3000), `DynamicsCompressorNode`, `WaveShaperNode` tanh y ruido rosa generado.
- **Loop a media frase:** el ATIS se repite sin fin con 2 s entre vueltas. Al sintonizar, la reproducción entra en `(Date.now() − inicio de la letra) mod duración`, como si llevara rato transmitiendo.
- **Distancia:**
  - alcance = 1.23 × (√altura del avión AGL ft + √altura de la antena ft) NM, con la antena a 50 ft;
  - estática y volumen se interpolan desde limpio (< 40 % del alcance) hasta sucio (≥ 90 %), con desvanecimiento leve (tremolo de 0.4 Hz) en ese último tramo;
  - fuera de alcance, solo silencio.
- Respeta el volumen del COM del simulador y que ese COM esté seleccionado para escucharse. Si escuchas COM1 y COM2 con ATIS, suenan los dos.
- Al sintonizar se oye un clic corto, y al cambiar de frecuencia el audio se corta en seco.

### 8. Parte educativa

- El texto se divide en partes con tipo: letra, hora, pista, viento, visibilidad, nubes, temperatura y rocío, altímetro, observaciones, NOTAM y cierre.
- Cada tipo tiene una explicación corta en español e inglés y un enlace.
- Página nueva **`/guia-atis`** (y su versión en inglés), con un ancla por parte. También se enlaza a `/briefing` (METAR) y a la guía del aeropuerto si existe en `/aeropuertos`.
- Los enlaces llevan `?ref=programa-atis` para medir cuántos llegan.

### 9. Descarga

- Zip en Descargas, como el lector del instructor, con un LEEME que explica cómo abrirlo, cómo activar UDP en X-Plane si hace falta y cómo elegir la red.
- Página del producto `/atis` con las muestras de audio y la descarga.

## Restricciones

- Nada de "oficial", "certificado" ni logos de redes o autoridades. Se nombra a IVAO, VATSIM y PilotEdge solo para decir con qué funciona.
- La llave de Azure solo la usa el script del banco de piezas. Nunca va en el lector, en la página ni en el servidor.
- Las piezas del producto se generan con la cuenta de Azure de Erik, no con la vía gratis de `edge-tts`, que no tiene licencia para eso y solo sirvió para la prueba.
- Windows solamente. El lector no debe pedir permisos de administrador (igual que el instructor).

## Por confirmar al empezar a construir

- Que el cliente de IVAO (Altitude) **no** lea en voz el ATIS. Si ya lo hace, IVAO pasa a la regla 1.
- Cómo saber qué aeropuertos cubre PilotEdge con ATIS (lista fija o feed). Si no se puede, PilotEdge se trata como «Sin red» y se avisa en el LEEME.
- Que vPilot y xPilot reproduzcan la voz del ATIS de VATSIM al sintonizarla, como creemos.
- Que Erik tenga su cuenta gratis de Azure Speech antes de generar el banco. Mientras no la tenga, las pruebas internas pueden usar piezas de `edge-tts` que **no se publican**.

## Lo que queda al constructor

- Estructura de archivos, nombres y cómo se reparte el código entre lector, funciones y página.
- Elegir entre Cache API y R2 para guardar el audio, y el límite exacto de peticiones.
- El formato del JSON de OurAirports y el script que lo genera.
- La lista inicial de frases del banco y de fenómenos del METAR que se pueden decir.
- Los patrones exactos para leer por partes el ATIS de IVAO y el D-ATIS. Hay que probarlos con textos reales de los feeds.
- El orden de construcción. Sugerencia: lector MSFS → banco de piezas y generado MX con radio en MMGL → parte educativa → redes → X-Plane → D-ATIS → descarga y página de producto.

## Anexo: texto de la muestra 05 (MMGL, METAR 162240Z 12004KT 7SM FEW120 BKN300 25/09 A3014 RMK 8/078 ISOL SC)

Cada punto marca una pausa. En la prueba no se usó SSML, solo puntuación y velocidad −8 %.

**Español (Jorge):** Aeropuerto Internacional de Guadalajara. Información Delta. Observación de las dos dos cuatro cero zulú. Pista en uso, uno uno. Viento, uno dos cero grados, cuatro nudos. Visibilidad, siete millas. Nubes escasas a uno dos mil pies. Fragmentadas a tres cero mil pies. Temperatura, dos cinco. Punto de rocío, cero nueve. Altímetro, tres cero uno cuatro. Estratocúmulos aislados. Al primer contacto, notifique que tiene la información Delta.

**Inglés (Christopher):** Guadalajara International Airport. Information Delta. Two two four zero zulu weather. Runway in use, one one. Wind, one two zero degrees, four knots. Visibility, seven miles. Few clouds at one two thousand. Broken, three zero thousand. Temperature, two five. Dewpoint, zero niner. Altimeter, three zero one four. Isolated stratocumulus. Advise on initial contact you have information Delta.

Pista 11 y la letra Delta eran de relleno en la prueba.
