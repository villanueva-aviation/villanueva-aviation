# Revisión de Comunicaciones — ronda 1 (estilo Rise)

Fecha: 2026-11-18 · Estado: **auditoría lista, esperando la decisión de Erik**.

Qué se revisó:
- los 13 temas (texto, idea clave y puntos);
- los 2 juegos de términos (14 términos), el escenario «frecuencia ocupada» y el circuito de tráfico (10 situaciones);
- los 2 juegos de fraseología con audio (10 tarjetas, grabadas con voz real);
- las 17 preguntas (práctica, evaluación y candados com-q3, com-q12, com-q13 y com-q6);
- las 13 imágenes de los temas.

Fuentes: OACI Doc 4444 (PANS-ATM), 4.5.7.5 (colación) y cap. 12 (fraseología); OACI Doc 9432 (Manual de
radiotelefonía); OACI Anexo 10, Vol. II, cap. 5 (indicativos y procedimientos de radio); FAA AIM 4-2 (fraseología),
4-3 (circuito de tráfico) y 6-3 (emergencias); FAA Pilot/Controller Glossary.

## Errores (se proponen corregir)

| # | Dónde | Qué dice | Problema | Corrección propuesta | Fuente |
|---|---|---|---|---|---|
| E1 | Tema 3 (texto y punto «Un ejemplo»), tarjeta de audio rodaje-3, imagen del tema 3 | «Ruede a pista 20 por calle Alfa, mantenga corto de pista **02**» | La 02 y la 20 son **la misma pista** vista desde cada extremo. Mantener corto de la 02 mientras ruedas a la 20 no tiene sentido | «XB-VLA, ruede a punto de espera pista 20 por calle Alfa, mantenga corto de pista 20». Es el mantenga corto más común: el de la pista de salida, en su punto de espera | Doc 4444, cap. 12 (fraseología de control de aeródromo) |
| E2 | Tema 4 (texto e idea clave) | «Nunca cruces el **umbral** de la pista sin autorización» | El umbral es donde empieza la parte útil de la pista para aterrizar. Lo que no se cruza sin autorización es el **punto de espera**: la línea pintada antes de entrar a la pista | «Nunca cruzas el punto de espera ni entras a la pista sin autorización explícita, aunque se vea despejada» | Doc 4444, cap. 7 (control de aeródromo) |
| E3 | Tema 4 (texto y punto «Instrucciones de espera») | «Mantenga posición, o *line up and wait*» como si fueran lo mismo | Son lo contrario. *Mantenga posición* (hold position): te quedas donde estás, **sin** entrar. *Line up and wait*: **entras** a la pista, te alineas y esperas la autorización de despegue | Separarlas: «mantenga posición: no te mueves; alinee y espere (line up and wait): entras a la pista y esperas ahí la autorización» (la forma en español, ver D5) | Doc 4444, cap. 12 (fraseología de control de aeródromo) |
| E4 | Temas 8 y 9, tarjetas de audio emergencia-1 y emergencia-4, imagen del tema 9 | Cerca de Guadalajara: «descienda y mantenga **cinco mil** pies», PAN-PAN «10 millas al sur de Guadalajara, **cinco mil** pies», tránsito VFR «**seis mil** pies, sobre la ciudad» | Guadalajara está a unos 5,000 ft de elevación. Cinco mil pies es **el nivel del aeropuerto**: te estarían bajando al suelo. Seis mil sobre la ciudad son unos 1,000 ft sobre el terreno, en el límite del mínimo sobre zona poblada | Altitudes de ejemplo con margen real: aproximación «nueve mil pies», PAN-PAN «nueve mil pies», tránsito «ocho mil quinientos pies». Que el texto diga que son de ejemplo | Elevación de MMGL en el AIP; Anexo 2, 4.6 |
| E5 | Tema 11 (texto, idea clave y punto «Si te equivocas»), imagen del tema 11 | «Un readback correcto **confirmado por control** es lo que te autoriza a proceder»; la imagen: «readback correcto = autorización» | Lo que te autoriza es **la autorización**. El controlador escucha tu colación y te corrige si hay error; muchas veces no dice nada. Su silencio no es una segunda autorización, y su «colación correcta» tampoco | «Colacionas la autorización completa; el controlador escucha y, si algo está mal, te corrige y repites la versión correcta» | Doc 4444, 4.5.7.5 |
| E6 | Imágenes de los 13 temas | Infografías | Generadas por IA y repiten E1, E2, E4 y E5; la del tema 11 inventa una frecuencia de salida 119.325; la del tema 7 también se usa en el módulo VFR | Reemplazarlas por clips (D1). La de VFR se revisa en su propia ronda | — |

## Precisión (redacción que conviene ajustar)

| # | Dónde | Qué dice | Ajuste propuesto | Fuente |
|---|---|---|---|---|
| P1 | Tema 1 (texto y punto «Números») | Los números van «dígito por dígito: tres cinco cero» | Dígito por dígito en rumbos, pistas, frecuencias, códigos y niveles de vuelo; las altitudes en miles y cientos se dicen con «mil» y «cientos» («seis mil quinientos pies», como el propio tema 7) | Anexo 10, Vol. II, 5.2.1.4 |
| P2 | Tema 2 (texto y punto «Matrícula completa»), pregunta com-q11 | Después, torre puede autorizarte a usar «solo la última parte» | La forma abreviada es el primer carácter y al menos los dos últimos (XB-VLA → X-LA), y solo después de que **la estación** te llame así | Anexo 10, Vol. II, 5.2.1.7 |
| P3 | Tema 3 (texto y punto «El readback obligatorio») | Mantenga corto es «una de las pocas» instrucciones con readback obligatorio | La lista es larga: autorizaciones de ruta; entrar, aterrizar, despegar, mantener corto, cruzar o rodar sobre cualquier pista; pista en uso; reglaje altimétrico; código del transpondedor; altitudes o niveles; rumbos y velocidades. Propuesta: «es una de las instrucciones que siempre se colacionan, junto con todo lo que tenga que ver con una pista, altitudes, rumbos y el código del transpondedor» | Doc 4444, 4.5.7.5 |
| P4 | Tarjeta de audio rodaje-1 | Llamas a Torre para «solicitar información Alfa» | Donde hay ATIS, la información Alfa **no se pide**: se escucha en la frecuencia del ATIS, y en el primer contacto confirmas que la tienes (justo lo que enseña el tema 2). Propuesta: cambiar la tarjeta a «sintonizas el ATIS y llamas con la información Alfa», o quitarla | Doc 4444, cap. 11 (ATIS) |
| P5 | Tema 4, tarjeta de audio rodaje-4 | El texto dice que la OACI recomienda «listo para salida» y que nuestras guías lo usan, pero la tarjeta enseña «listo para despegue» | Que la tarjeta use «listo para salida» y acepte las dos formas al calificar | Doc 4444, cap. 12 (fraseología de control de aeródromo) |
| P6 | Tema 11 (texto y punto «Qué recibes») | La autorización trae ruta, altitud, código y frecuencia de salida | Falta el **límite de la autorización** (la C de CRAFT, que ya usa el gimnasio de autorizaciones). Y la colación es completa, no «palabra por palabra» | Doc 4444, 4.5.7.5; AIM 4-4-3 |
| P7 | Tema 12 (texto y punto «Qué te da») | «Declarar una emergencia te da prioridad absoluta» | Precisar: MAYDAY tiene prioridad sobre todo; PAN-PAN, sobre todo menos MAYDAY. Y el formato empieza por la estación a la que llamas, cuando hay tiempo | Anexo 10, Vol. II, 5.3 |
| P8 | Circuito de tráfico (tramo 1 y situaciones sit-1, sit-2) | Llama «viento en cara» al ascenso alineado con la pista después del despegue | En la FAA ese tramo es la **salida** (departure leg); el viento en cara (upwind) es paralelo a la pista, desplazado. Propuesta: «Salida (viento en cara)» y una línea que lo explique | AIM 4-3-2 |

Todo lo demás se revisó y está bien: Roger y Wilco; el orden a quién llamas, quién eres y qué necesitas; la letra
del ATIS; la autorización de despegue y de aterrizaje y su colación con matrícula; el toque y despegue; el orden
de los reportes del circuito; los reportes sin torre en la frecuencia común; el tránsito VFR con autorización en
B, C y D (reglas OACI, igual que en Cartografía) y rodear si te lo niegan; Aproximación antes de Torre; PAN-PAN y
MAYDAY repetidos tres veces y sus ejemplos; los errores comunes; el escenario de la frecuencia ocupada; los 14
términos; y las 17 preguntas.

## Para que Erik decida

- **D1 · Clips:** hacer los clips de Remotion paso a paso para los 13 temas, unos 74 (uno por paso), en lugar de
  las 13 infografías (E6). Serían intercambios de radio dibujados: el avión, la estación, lo que dice cada uno en
  burbujas, y el mapa del aeropuerto o del circuito cuando haga falta.
- **D2 · Capítulos:** pasar de 2 a 4 capítulos sin cambiar los temas ni el avance. Los candados caen después de
  los temas 3, 6, 9 y 12:
  1. «Fraseología, primer contacto y rodaje» (temas 1–3) · candado com-q3 (colacionar mantenga corto);
  2. «Despegue y circuito» (4–6) · candado com-q12 (orden de los reportes del circuito);
  3. «En ruta y llegada» (7–9) · candado com-q13 (a quién contactas primero al llegar);
  4. «Aterrizaje, IFR, emergencias y errores» (10–13) · candado com-q6 (PAN-PAN) antes del último tema; cierra con
     el escenario.
- **D3 · Ejercicios por capítulo** (para que nada se pregunte antes de enseñarse):
  - capítulo 1: juego 1 (Wilco, Roger, Affirm, Negative, Say again, Standby y readback obligatorio);
  - capítulo 2: audio de rodaje y despegue;
  - capítulo 3: circuito de tráfico (reportes por tramo);
  - capítulo 4: juego 2 (fraseología estándar, CTAF, Traffic in sight, Frequency change approved, PAN-PAN, MAYDAY
    y Stepping on), audio de aproximación y emergencias, y el escenario.
- **D4 · Las grabaciones:** E1, E4, P4 y P5 cambian lo que dicen 5 tarjetas que tienen tu voz grabada (rodaje-1,
  rodaje-3, rodaje-4, emergencia-1 y emergencia-4). Opciones: que las regrabes con el texto nuevo (te paso el
  guion), o que esas 5 usen la voz sintética mientras tanto. No voy a editar tus grabaciones.
- **D5 · Cómo se dice en México:** tú conoces la fraseología de IVAO México mejor que yo. Antes de escribir:
  - ¿la petición de rodaje en Guadalajara va a **Torre** o a una frecuencia de superficie/rodaje? Hoy el módulo
    pide todo a Torre;
  - *line up and wait* en español, ¿«alinee y espere», «ruede a posición y mantenga» u otra?
  No voy a inventar ninguna de las dos.
- **D6 · El ejemplo «Vista Hermosa»:** el tema 7 lo usa como punto VFR, igual que lo hacía Cartografía. Propongo
  dejarlo genérico como allá («sobre la presa»), salvo que me digas un punto real de MMGL.

Efecto en el avance: ninguno. Siguen 13 lecturas y los mismos 6 ejercicios con los mismos ids.
