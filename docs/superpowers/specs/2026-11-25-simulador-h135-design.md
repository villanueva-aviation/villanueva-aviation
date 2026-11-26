# Simulador web H135 — diseño

Fecha: 2026-11-25. Decisiones de Erik (fundador) salvo lo marcado **(mi decisión)**, que Erik puede cambiar.

## Para qué

Un cadete de Villanueva se prepara para volar por instrumentos y no tiene simulador, controles ni dinero para comprarlos. Lo único que tiene es un simulador con vista desde arriba. Erik quiere un simulador **gratis, en el navegador**, centrado en la **cabina** de un helicóptero (no en el paisaje de afuera), para que el cadete practique lo que ya vieron con el instructor virtual IFR: interceptar radiales, TO/FROM, arcos DME y esperas, usando el HSI, el piloto automático y los radios como en la cabina real.

Es un éxito cuando el cadete abre la página en su laptop (o en su celular), escoge su VOR local (Guadalajara, Burgos, Valladolid, uno de Chile...), despega el H135 y practica la navegación con el HSI, a mano o con el piloto automático, y Erik lo aprueba después de probarlo.

## Qué sí

### El helicóptero: H135 primero (Erik)

- El primero es el **H135 (EC135)**. Su cabina sirve de referencia: la foto que pasó Erik tiene, frente a cada piloto, la pantalla de actitud arriba y la de navegación (HSI) abajo, los indicadores de motor al centro y dos navegadores con mapa abajo.
- Después se agregan, cada uno con su ficha de datos y su cabina: **H125** (Erik va a mandar foto de su panel) y **un avión** (Erik pidió avión además de helicóptero). No entran en esta primera etapa, pero el código deja lugar para una ficha por aeronave (velocidades, régimen de ascenso, cabina).
- Realismo: «lo más realista posible» en velocidad, altitud, rumbo y regímenes, sin pretender ser MSFS (Erik).

### Modelo de vuelo

- **Con estabilización, como el H135 real (Erik eligió la A):** el cíclico pide actitud (cabeceo e inclinación) y el helicóptero la sostiene; al soltar vuelve a nivelado. El colectivo manda potencia: con más colectivo sube o acelera. Los pedales controlan la guiñada: hacen falta al cambiar potencia y a baja velocidad, y en crucero un amortiguador de guiñada los ayuda.
- **Sin estabilización (la B):** opción para después, cuando el cadete domine la A (Erik). No entra en esta etapa, pero el modelo se arma de modo que la estabilización sea una capa que se pueda quitar **(mi decisión)**.
- Cifras de referencia del H135 **(mi decisión, ajustables en la ficha)**: crucero 120–135 kt, VNE 150 kt, ascenso hasta ~1,500 ft/min, viraje estándar 3°/s, techo práctico 15,000–20,000 ft. Puede quedarse en vuelo estacionario y despegar en vertical desde la plataforma.
- **Viento** configurable (dirección y velocidad) para practicar la corrección de deriva **(mi decisión)**; ya existe el METAR en vivo en el sitio (`MetarEnVivo`), y tomar el viento real del METAR del aeropuerto queda como mejora posterior.
- Las cifras finas se calibran a mano con perillas en la ficha; no se busca un modelo aerodinámico de rotor.

### Controles (Erik: laptop y, si se puede, celular; ratón o teclado, a elección del cadete)

- **Ratón**: mover = cíclico, rueda = colectivo, botón derecho + mover = pedales **(mapa exacto: mi decisión)**.
- **Teclado**: flechas = cíclico, Re Pág / Av Pág = colectivo, Z / X = pedales **(mi decisión)**.
- **Celular**: palancas táctiles en pantalla (cíclico a la derecha, colectivo y pedales a la izquierda).
- Las perillas y botones de cabina (CRS, HDG, ALT, frecuencias, modos del piloto automático) se manejan con clic o toque, y la rueda del ratón gira una perilla cuando el puntero está encima **(mi decisión)**.
- Un control de juego (USB) por la API Gamepad del navegador sería barato de agregar, pero el cadete no tiene; queda fuera.

### La cabina en pantalla (Erik eligió la maqueta D)

**Laptop:**
- Columna izquierda, de arriba abajo:
  - **PFD con vista sintética 3D del terreno real**: cerros, horizonte, cintas de velocidad y altitud, velocidad vertical, modos del piloto automático encendidos, marcador de trayectoria. El 3D va **desde el primer día** (Erik: «es la mejor opción»).
  - **HSI grande justo debajo**, para que el cadete vea los cerros y, al bajar la vista, dónde está respecto al VOR (Erik). Tiene rosa giratoria, lectura de rumbo, marcador de rumbo, aguja de curso de NAV1 con barra de desviación y TO/FROM, segunda aguja (BRG2) de NAV2 o GPS, VOR y curso, DME, velocidad sobre el suelo y viento.
- Columna derecha:
  - **Panel del piloto automático**.
  - **Navegador con mapa**: el helicóptero, los VOR y aeropuertos cercanos, el radial elegido como línea y el destino directo del GPS.
  - **Radios**: COM1, NAV1 y NAV2 con frecuencia activa y en espera e intercambio. Perillas CRS y HDG.
- «Solo para simulación» siempre visible.

**Celular:** la maqueta B. HSI grande al centro, actitud, velocidad, altitud y VS en tiras arriba, controles táctiles a los lados y el 3D en pequeño o sustituido por cielo y tierra planos **(mi decisión)**.

**Diseño:** propio, inspirado en la función de los instrumentos. No se copia el aspecto ni la marca de Garmin, Airbus/Helionix ni Thales. El HSI parte del de `src/features/landing/HSI.tsx` (dibujo propio que ya está en el sitio).

### Vista sintética 3D

- Se dibuja con **three.js** (gratis; dependencia nueva).
- El terreno sale de los **mosaicos de elevación abiertos de AWS** (formato Terrarium, `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`, gratis, sin cuenta; requiere atribución). Se comprobó que responden (2026-11-25).
- Los mosaicos se bajan por zonas alrededor del helicóptero mientras vuela. Hay más detalle cerca y menos lejos, hasta el horizonte. El terreno se colorea por altura y lleva sombreado. Se marca en rojo o amarillo el terreno que está por encima o cerca de la altitud del helicóptero **(mi decisión: ayuda a la conciencia del terreno, que en helicóptero IFR importa)**.
- **Rendimiento:** laptops y PCs normales, y celulares de gama media (Erik). La meta es una laptop con gráficos integrados a 30 cuadros por segundo o más **(mi decisión)**. La calidad se ajusta sola (detalle y distancia del terreno) según los cuadros por segundo reales. En celular arranca en calidad baja.
- Si el aparato no puede (WebGL lento o ausente) o el terreno no ha llegado, se ven cielo y tierra planos y todo lo demás sigue funcionando.
- Pistas y plataforma del aeropuerto de salida dibujadas sobre el terreno **(mi decisión: sin ellas el despegue y la llegada se sienten en el vacío)**.

### Piloto automático (Erik: «todo lo que tenga que incluir»)

Modos, con su lógica de captura y su anunciador en el PFD:

- **AP / SAS**: encender y apagar. El SAS (la estabilización) va siempre, salvo en la futura opción B.
- **ATT**: sostiene la actitud del momento. Es el modo base al encender el AP.
- **HDG**: sigue el marcador de rumbo.
- **NAV**: captura e intercepta el curso de NAV1 (VOR) o del GPS, según la fuente elegida en el HSI. Pasa de armado a capturado.
- **APR**: como NAV con ganancias más finas para aproximación. En esta etapa es aproximación VOR o GPS directo; el ILS no entra (ver «Qué no»).
- **ALT**: sostiene la altitud.
- **Selector de altitud con captura (ALT.A)**: sube o baja hasta la altitud seleccionada y la captura.
- **VS**: sostiene una velocidad vertical elegida.
- **IAS**: sostiene la velocidad indicada (con el colectivo o el cabeceo, como el modo real del H135).

El cadete puede volar a mano en cualquier momento. Mover los controles con el AP puesto desconecta el eje que toca, con aviso.

### Radios y navegación

- **NAV1 y NAV2**: el cadete escribe o gira la frecuencia. Si hay un VOR a alcance con esa frecuencia, se recibe: identificador, radial, desviación, TO/FROM y señal. El alcance se calcula con la distancia y la altitud (línea de vista) **(mi decisión)**. El DME sale del VOR si lo tiene.
- **COM1**: se sintoniza; muestra el nombre de la estación si coincide con una frecuencia del aeropuerto. Sin voz ni ATC en esta etapa.
- **GPS directo a**: un aeropuerto o VOR como destino; la aguja magenta lo sigue y el modo NAV puede usarlo.
- Los cálculos de radial, desviación (1 punto = 2° en VOR), TO/FROM y DME reutilizan los del programa IFR (`navIfr.ts`, `vorSim.ts`). Las entradas a la espera usan `src/features/entrenador/esperas.ts`. **No usar `guia-hsi.pdf`, que tiene los sectores mal.**

### Elegir dónde volar (Erik)

- **Lista por país** y **búsqueda** por nombre o identificador de VOR o aeropuerto. Ejemplos: Guadalajara (Erik), Burgos y Valladolid (con el cadete de España), un VOR local en Chile.
- **Datos:** **OurAirports** (`davidmegginson.github.io/ourairports-data`, dominio público): `navaids.csv` (VOR, VOR-DME y VORTAC con frecuencia, DME, declinación y país), `airports.csv` y `runways.csv` para el aeropuerto de salida, y `airport-frequencies.csv` para COM. SkyVector no se usa, porque no permite que otro sitio tome sus datos.
- Un script convierte los CSV en archivos JSON por país dentro de `public/`, para bajar solo el país elegido **(mi decisión)**. Los VOR cambian poco; se vuelve a correr cuando haga falta.
- **Arranque:** en la plataforma o la pista del aeropuerto elegido, en tierra, para despegar en vertical. Hay también la opción «empezar en el aire» a una altitud y distancia del VOR, para practicar rápido **(mi decisión)**.

### Instructor virtual dentro del simulador (Erik)

- El simulador produce las mismas **muestras** (`Muestra` de `src/features/instructor/evaluador.ts`) que hoy manda el lector de MSFS, junto con el aeropuerto (`Aeropuerto` de `aeropuertoSim.ts`) y los VOR cercanos (`VorSim` de `vorSim.ts`), con NAV1 incluido (`navMhz`, `navObs`, `navRadial`, `navDesv`, `navDesde`, `navDme`, `navTieneDme`, `navSenal`).
- `useLector` gana una segunda fuente: si la página está dentro del simulador, toma las muestras del simulador y no del lector local. El resto del instructor (lecciones IFR 1–6, calificación, voz, preguntas por micrófono, debriefing con mapa) no se reescribe **(mi decisión, Erik aprobó el enfoque)**.
- Se pone en una segunda etapa: primero la cabina volable, después el instructor encima.
- **Una sola página (mi decisión):** la lección corre dentro de `/simulador`, en un panel lateral en laptop y en una hoja que se despliega en celular. No se usan dos pestañas, porque la pestaña oculta frena `requestAnimationFrame` y los temporizadores, y el simulador se trabaría. Además, el celular no muestra dos pestañas a la vez. Por eso el ciclo de vuelo corre fuera del render de React (un bucle propio que entrega muestras a 10 Hz), desde la etapa 1.

### Quién puede usarlo (recomendación aceptada por Erik al aprobar este documento)

- **El simulador es gratis y no pide cuenta.** Cualquiera entra a `/simulador` y vuela. Atrae tráfico, que es lo que hoy le falta al sitio.
- **El instructor dentro del simulador pide iniciar sesión**, porque guarda los intentos en `intentos_maniobra`.
  - **La lección IFR 1 (interceptación) es gratis** para cualquiera con cuenta, como prueba.
  - **Las lecciones 2 a 6 son para Exclusivo**, con la misma regla que ya existe (`cadete_acceso`).
- **El cadete sin dinero:** Erik le da Exclusivo de cortesía con un registro de pago de $0 marcado `completado`, puesto a mano en Supabase. La vista `cadete_acceso` ya lo toma, así que no hace falta código nuevo.
- **Las lecciones con MSFS** siguen con su regla actual (`ACCESO_REPASO`); esto no las cambia.

### Cómo cuentan las lecciones en el simulador web (Erik)

- **Cuentan igual que las de MSFS** para abrir la siguiente lección. Cada intento queda marcado como «simulador web» para distinguirlo en el historial y en el panel de Erik.
- **Piloto automático:** se vale en práctica. En examen y checkride, si se enciende un modo que mueve el helicóptero (HDG, NAV, APR, ALT, VS, IAS), el intento se anula con aviso. El SAS no cuenta como piloto automático.

### Dónde vive

- Dentro del sitio de Villanueva (React + Vite + Tailwind en Cloudflare Pages), en una página nueva `/simulador` (Erik aprobó el enfoque).
- Todo corre en el navegador del cadete, sin servidor propio ni servicios de pago.

## Qué no (en esta etapa)

- H125 y avión: después, con sus fichas y cabinas.
- Opción B sin estabilización: después.
- ILS y localizador: OurAirports no trae frecuencias de ILS. Si se quieren, se cargarían a mano para algunos aeropuertos (pendiente de Erik).
- ATC por voz, tráfico y ATIS: el programa ATIS existe aparte y no se conecta aquí.
- Paisaje fotográfico, edificios y cabina 3D por dentro: la vista es de instrumentos, no de ventana.
- Indicadores de motor detallados (VEMD), arranque de motores, sistemas, fallas y combustible.

## Qué haría que fracase aunque funcione

- Que con teclado o ratón no se pueda sostener rumbo y altitud con calma, y el cadete pase el tiempo peleando con los controles en lugar de mirar el HSI.
- Que el HSI y los cálculos del VOR digan algo distinto de lo que dice el instructor o de la teoría (por ejemplo, sectores de espera mal).
- Que en una laptop normal vaya a tirones por el 3D.
- Que aparezca la palabra «oficial» o «certificado», o la marca o el aspecto copiado de Garmin o Airbus.

## Enfoques considerados

1. **Dentro del sitio, con 3D a la medida en three.js y modelo de vuelo propio** (elegido). Usa el inicio de sesión y el instructor existentes, el HSI propio y los cálculos de VOR ya probados. El costo es construir el terreno y el modelo.
2. **Mapa 3D ya hecho (MapLibre):** pone el terreno con menos trabajo, pero está hecho para ver mapas. El alabeo y el horizonte quedan forzados y se ve como mapa, no como cabina.
3. **App aparte del sitio:** habría que copiar el instructor y mantenerlo en dos lugares.
4. **JSBSim (motor de física) en el navegador:** su soporte de helicópteros es pobre y pesa mucho; el modelo propio con estabilización alcanza para practicar navegación.

## Etapas

1. **Cabina volable:** modelo de vuelo con estabilización, controles de ratón, teclado y táctil, PFD con 3D, HSI, piloto automático, radios, GPS directo, elegir VOR o aeropuerto. Erik la prueba.
2. **Instructor IFR dentro del simulador.** Erik la prueba.
3. Después: H125, avión, opción B, viento del METAR, ILS si Erik lo pide.

## Lo que queda al constructor

- La estructura de archivos, los nombres y el reparto entre módulos.
- Las cifras exactas del modelo y del piloto automático, mientras se sientan como un H135 y se puedan ajustar.
- El tamaño de los mosaicos, los niveles de detalle y la paleta del terreno.
- El detalle visual de cada pantalla, dentro del estilo de la maqueta D y del sitio.
- Las pruebas: lógica pura (modelo, piloto automático, radios, conversión de datos) con `node --test`.
