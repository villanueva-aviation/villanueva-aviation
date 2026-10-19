# Ruta "Listo para volar en red" — diseño

Fecha: 2026-10-19 · Autor del diseño: Claude con Erik (fundador de Villanueva Aviation)

## Para qué es y por qué ahora

Muchos simmers en español vuelan solos en su simulador pero se traban al conectarse a una red con control de tránsito (IVAO o VATSIM). Erik lo vio con un alumno de IFR: se trabó **al leer la autorización IFR y, sobre todo, al volar la SID**. El informe oficial de VATSIM México (Board of Governors, 1T 2025) reporta lo mismo: sus pilotos tienen problemas con SID/STAR y con aproximaciones que no son ILS, y los centros de formación de las redes están rebasados (ver `reports/Innovación en aviación virtual.md`).

Muchos cargan el plan con SimBrief en el Fenix A320 o el PMDG 737 sin entender qué están volando; cuando el controlador cambia algo, se pierden.

La ruta enseña ese puente, en español y con procedimientos mexicanos, y termina en una **prueba en vivo de pago con Erik como controlador**. Es la primera pieza del giro "más que una escuela" y un camino directo a ingresos (hoy hay ~41 registrados y casi ninguna venta).

**Éxito (lo dijo Erik):** al menos **5 personas pagan la prueba** en 2 o 3 meses.

## Qué es

Una ruta de aprendizaje con dos etapas, cada una con su insignia:

- **Etapa 1 — en español** (se construye ahora).
- **Etapa 2 — en inglés** (después): la misma ruta y la misma prueba con comunicaciones en inglés, como puente hacia volar en Estados Unidos. Erik lo está estudiando; queda fuera de la primera versión, pero el modelo de datos debe admitir `etapa = 1 | 2`.

El vuelo meta de la etapa 1: **salir de MMGL en IFR, volar la SID, la ruta, la STAR y la aproximación, y llegar a MMMX**, solo y sin ayuda.

## Lecciones (gratis)

Mezcla de formato tipo módulo de la Academia (texto, instrumentos interactivos, práctica) **más un video de Erik** por lección. Erik graba los videos en el simulador y los sube a YouTube; el sitio los muestra incrustados.

Orden (aprobado por Erik):

1. **Antes de conectarte:** qué son IVAO y VATSIM, crear la cuenta, el programa para conectarse, qué esperar de un controlador real.
2. **Tu plan de vuelo IFR:** armarlo en SimBrief y entender cada parte de la ruta, no solo cargarla.
3. **Leer la carta de la SID:** con las cartas oficiales de SENEAM; puntos, altitudes, restricciones, "climb via".
4. **La autorización (CRAFT):** escucharla, anotarla (hoja ATIS/CRAFT imprimible que ya existe) y colacionarla, con audios de práctica.
5. **Volar la SID con el Garmin** (lección central): en el C172 XB-VNA con G1000, cargar la salida, revisarla contra la carta y volarla con y sin piloto automático.
6. **Lo mismo en un FMS:** cargarla a mano en el CDU/FMC con la lógica común a Fenix, PMDG y otros, y qué revisar cuando SimBrief la carga solo. No es un tutorial por avión.
7. **En ruta y llegada:** cambios de frecuencia, la STAR de MMMX, qué hacer con vectores o cambios del controlador.
8. **La aproximación:** una aproximación sin ILS (RNAV o VOR) a MMMX.
9. **Prueba final en vivo** (de pago, ver abajo).

Las lecciones 1–5 y 7–8 se hacen en el C172 con G1000 para que nadie necesite comprar un avión de pago; la 6 es la extensión para quien vuela jets. En la prueba cada quien elige su avión.

## La prueba final (de pago)

Decidido por Erik:

- **$32 USD** con PayPal dan derecho a **3 intentos**.
- Si no pasa en esos 3, **paga la mitad ($16 USD)** para seguir intentando. *(Decisión de diseño: los $16 dan otros 3 intentos con las mismas reglas.)*
- **Primer intento:** el vuelo completo MMGL → MMMX por Discord, Erik de controlador, unas 2 horas con briefing y revisión.
- **Intentos siguientes:** **solo la parte que falló** (por ejemplo, salir de MMGL y volar la SID), de 20 a 30 minutos. Así el alumno practica lo que le falta y el tiempo de Erik rinde.
- Al final de cada intento Erik da una revisión corta: qué hizo bien y qué corregir.

**No aprueba si** (criterio de Erik, debe publicarse antes de pagar):
- colaciona mal la autorización,
- se sale de la SID,
- sus comunicaciones no son claras y precisas.

*(Decisión de diseño: la página de la prueba muestra estos tres criterios como una lista de revisión, y Erik marca en cada intento cuál falló, para saber qué repetir.)*

**Partes de la prueba** *(decisión de diseño)*: el vuelo se evalúa en cuatro partes fijas: **1) Autorización** (copiar y colacionar el CRAFT), **2) Salida** (rodaje, despegue y SID), **3) En ruta y llegada** (ruta, cambios de frecuencia, STAR) y **4) Aproximación** (sin ILS) hasta el aterrizaje. Las comunicaciones claras y precisas se califican en todas. Erik marca cada parte como aprobada o no aprobada, y el criterio que falló. Las partes aprobadas se quedan aprobadas; el siguiente intento repite solo las que faltan. **Cuando las cuatro están aprobadas, el alumno gana la insignia.**

**Procedimientos de la prueba** *(decisión de diseño)*: las lecciones enseñan el método con un ejemplo resuelto de cada procedimiento (SID de MMGL, STAR de MMMX y una aproximación sin ILS). En la prueba, Erik asigna los procedimientos publicados para la pista en uso ese día, como en la red real, y los anuncia al confirmar la fecha para que el alumno los prepare.

**Cupos** (Erik): **2 horas por semana dedicadas a pruebas, aparte de las horas de asesorías.** Un primer intento usa las 2 horas de esa semana; las repeticiones (20–30 min) caben varias por semana. Los cupos se muestran como constantes en `src/lib/constants.ts`, igual que los de asesorías, y deben ser ciertos.

**Antes de pagar** (Erik): no se bloquea a nadie. Si el alumno no ha completado las lecciones de la ruta, su perfil y la página de la prueba le recomiendan terminarlas primero. Si aun así quiere continuar, puede pagar.

**Reglas que se publican antes de pagar** (Erik):
- Si el alumno no se conecta o cancela tarde, **pierde ese intento**. *(Decisión de diseño: "tarde" = menos de 24 horas antes.)*
- Los intentos **vencen 30 días después del pago**.
- **Hay reembolso** si Erik no puede darle fecha dentro de esos 30 días. *(Decisión de diseño: el reembolso se hace a mano por PayPal; el sitio solo registra el estado "reembolsado".)*

**Ver el vuelo** (Erik): Erik necesita ver el vuelo, no solo escucharlo. El alumno vuela conectado a **IVAO o VATSIM** (Erik lo sigue en el mapa de la red) **o con Volanta** (comparte su vuelo en vivo). La lección 1 enseña a preparar eso, y la página de la prueba lo pide como requisito al agendar: callsign o enlace de Volanta.

**Relación con lo demás** *(decisión de diseño)*: la prueba es un producto aparte. No viene incluida en el pago de $29 de Contenido Exclusivo ni da acceso premium, y para agendarla no hace falta ser premium. El paquete de 4 asesorías ($120) sí puede incluir la prueba, como ya se le dijo a Erik.

**Insignias:** "Listo para volar en red · Etapa 1 (español)" y, después, "· Etapa 2 (inglés)". Aparecen en el perfil del sitio junto a las insignias de avión. El rol en Discord lo asigna Erik a mano (el sitio no tiene integración de roles y no se construye ahora).

## Restricciones

- **Nunca** "habilitación", "licencia", "certificado", "instructor certificado" ni "horas válidas". Villanueva es una academia digital independiente de simulación, no una escuela AFAC. La insignia aclara que **no es una evaluación oficial de IVAO, VATSIM ni la AFAC**.
- Cartas: usar o enlazar las cartas oficiales de SENEAM con su fecha de vigencia y la leyenda "solo para simulación". Antes de publicar, confirmar en la publicación vigente los nombres de las SID de MMGL, la STAR y las aproximaciones de MMMX; no inventarlos.
- Los cupos y tiempos que se muestren deben ser ciertos (Erik da 2–3 horas por día; prefiere 2).
- Las lecciones funcionan aunque el video todavía no esté subido (el video es un complemento, no un requisito).
- Estilo visual del sitio (azul marino y dorado, componentes existentes). Instrumentos tipo G1000 sin marca ni logotipo Garmin, regla vigente del sitio.

## Lo que ya existe y se reutiliza (resumen del repo)

- **Academia:** módulos en `src/data/academia.ts` y contenido en `src/data/moduleContent.ts`; render en `src/pages/AcademiaModulo.tsx` (`LessonFlow`, `Quiz`, widgets en `src/features/academia/`). El módulo IFR ya tiene lecciones de CRAFT, SID, STAR y aproximaciones en texto. **Ojo:** todo `/academia*` exige login y tiene un bloqueo secuencial por proyecto (`useBloqueoPorProyecto.ts`); la ruta **no** debe quedar detrás de ese bloqueo.
- **Práctica de radio:** `AudioPhraseology.tsx`, `useSpeechRecognition`, `phraseologyEvaluator.ts`, datos en `src/data/fraseologiaATC.ts` (hoy solo VFR/general; no hay sets de autorización IFR). Si no hay mp3, usa voz sintética.
- **Pagos:** `PayPalButton.tsx` llama a una función de Supabase que verifica la orden y escribe el pago (`verify-paypal-payment`, `verify-paypal-session`). **Ojo:** la vista `cadete_acceso` da acceso premium con *cualquier* pago completado en `pagos`; el pago de la prueba no debe ir ahí sin filtrar por producto.
- **Agenda:** `reservas` (estados pendiente/confirmada/completada/rechazada), `AgendarCita.tsx` (solo premium hoy), `agendaSlots.ts`, `reglasSesiones.ts` (prefijos de tema que no se cobran).
- **Insignias de avión:** `src/data/examenesTipo.ts`, `src/features/examenesTipo/reglas.ts`, nivel calculado en el cliente; la parte práctica se aprueba cuando el fundador marca una `reserva` como completada.
- **Imprimibles:** hoja ATIS/CRAFT en `Downloads\Villanueva Aviation - Documentos\Imprimibles\` (se puede publicar en Descargas).
- **Medición:** `/nivel` guarda resultados anónimos con `?ref=`; puede recomendar la ruta a quien sale Intermedio o Avanzado.

## No es

- Una escuela certificada ni una preparación para un examen oficial.
- Tutoriales por cada avión de pago (Fenix, PMDG, etc.).
- Un control de tránsito automático o con IA: el controlador es Erik.
- La etapa 2 (inglés) ni la ruta de Estados Unidos, por ahora.
- Integración automática de roles de Discord.

## Fracaso aunque funcione técnicamente

- Que suene a certificación oficial.
- Que obligue a comprar un avión o un add-on para tomar las lecciones.
- Que la prueba se coma el tiempo de Erik (por eso las repeticiones son solo de la parte que falló).
- Que nadie pague la prueba: la ruta existe para vender la prueba, así que cada lección debe dejar claro el siguiente paso.

## Fuera del sitio (después del lanzamiento)

Ofrecer la ruta gratuita a VATSIM México e IVAO México como material previo a su formación (mensaje de Erik a sus coordinadores). Usar la ruta como tema de los en vivos del martes.

## Acceso a las lecciones *(decisión de diseño)*

Las lecciones se pueden **leer y ver sin cuenta** (es la puerta de entrada que se ofrece a VATSIM México, IVAO México y desde `/nivel`). Con una cuenta gratis se guarda el avance y se ve la recomendación en el perfil; para pagar y agendar la prueba hace falta la cuenta.

## Lo que queda a criterio del constructor

- Dónde vive la ruta en el sitio (URL, si es una sección propia o un tipo nuevo de módulo), siempre que no quede detrás del bloqueo secuencial de la Academia.
- Cómo se guarda el pago, los intentos y el resultado de la prueba (del lado del servidor, porque `academia_progreso` lo puede escribir el cliente).
- Cómo agenda el alumno sus intentos y cómo marca Erik el resultado y la parte que falló.
- Qué instrumentos interactivos nuevos valen la pena (por ejemplo, leer una SID sobre un diagrama, o un set de audios de autorización IFR) y cuáles se quedan en texto.
- Cómo se ve la insignia en el perfil.
