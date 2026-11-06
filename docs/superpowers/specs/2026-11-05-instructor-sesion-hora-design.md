# Sesión de una hora con el instructor — viraje escarpado del C172

Fecha: 2026-11-05. Sigue al programa con voz (`docs/superpowers/specs/2026-11-05-instructor-programa-voz-design.md`, commits 009f04a..ca5597c, en main). Sale de la primera prueba de Erik con el programa en su PC.

## Intención

En la primera prueba el instructor arrancó a hablar sin presentarse, se cortaba solo a media frase y no se podía ajustar. Erik quiere que se sienta como una clase real: el instructor te dice qué vas a hacer hoy en esta hora, te lleva paso a paso, te deja terminar de escucharlo y al final te hace un debriefing. Y que el cadete pueda tomar la sesión en español o en inglés.

Éxito: Erik abre el programa, elige idioma, escucha el briefing completo, practica, hace su checkride y escucha un debriefing que compara sus intentos, sin que una frase se corte a la mitad y con la voz y la velocidad que eligió.

## Lo que decidió Erik

- **Una sesión de una hora con plan completo**, en bloques: briefing, preparación, práctica, checkride, debriefing y cierre.
- **Instrucciones más claras**: el cadete siempre sabe en qué paso va y qué hacer con los controles.
- **Que la voz termine de hablar.**
- **Opciones de voz** para configurar al instructor.
- **El cadete elige el idioma para toda la sesión**: Español o English.

## Metas

1. Plan de sesión de 60 min con reloj y bloque actual a la vista.
2. Briefing leído en voz alta, con botón "Listo, empiezo".
3. Lista de pasos con el actual marcado y una línea de qué hacer con los controles.
4. Una cola de voz que no corta frases.
5. Ajustes de voz: voz, velocidad y cuánto habla.
6. Toda la ventana del programa en el idioma elegido.
7. Debriefing que compara los intentos de la sesión y deja material para practicar.
8. La sesión se guarda como una sola, para verla completa en `/admin/maniobras`.

## No metas

- Otras maniobras, arranque, rodaje, IA o que el cadete le hable al programa (proyectos 2–5).
- Traducir la página web del viraje escarpado o el resto del sitio: el inglés es solo para el programa.
- Grabar videos nuevos: el debriefing usa lo que ya exista.
- Cambiar la calificación, las tolerancias, la revisión o la insignia.

## Anti-metas (fallaría aunque funcione)

- Que la hora sea una cárcel: el cadete no puede avanzar o el reloj lo corta a media maniobra.
- Que el instructor diga avisos viejos que ya no aplican, o se quede hablando atrasado.
- Que el inglés sea una voz en inglés leyendo texto en español, o una traducción a medias.
- Que el reporte en inglés imite un formulario de la FAA (por ejemplo "Notice of Disapproval", que es el nombre de un formulario real).
- Palabras de certificación oficial ("certificado", "licencia", "CFI", "certified") o la marca "Garmin".

## Cómo

**Plan de la sesión.**

| Min (guía) | Bloque | Qué pasa | Pasa al siguiente cuando… |
|---|---|---|---|
| 0–5 | Briefing | El instructor lee: objetivo, tolerancias, secuencia, errores comunes y cómo se califica. | El cadete da "Listo, empiezo". |
| 5–10 | Preparación | Subir a 1,500 ft sobre el terreno, compensar, estabilizar la velocidad de entrada. | Se arma el primer intento (el armado solo de hoy). |
| 10–35 | Práctica | Intentos en modo Práctica con correcciones. Tras cada intento calificado, un comentario corto. | Hay 3 intentos de práctica calificados y el cadete da "Pasar al checkride", o lo da antes. |
| 35–45 | Checkride | Intentos en modo Checkride hasta uno calificado. | Hay un checkride calificado. |
| 45–55 | Debriefing | Comparación de intentos, qué practicar, material. Se lee en voz alta. | Termina la lectura o el cadete da "Siguiente". |
| 55–60 | Cierre | Resumen guardado, "Mandar a revisión" si el checkride salió aprobado, "Nueva sesión". | — |

- Los bloques avanzan por lo que pasa, no por el reloj. Los minutos son la guía que se muestra junto a cada bloque.
- [Claude] A los 35 min, si el cadete sigue en Práctica, el instructor lo sugiere una vez: "Ya llevamos 35 minutos: cuando quieras pasamos al checkride". No lo obliga.
- [Claude] Tras el tercer intento de práctica dice "Ya tienes tres intentos: puedes pasar al checkride o seguir practicando". "Un intento más" sigue disponible.
- Los intentos anulados (pausa, slew, etc.) no cuentan para la meta, igual que hoy.
- El selector Práctica/Checkride desaparece: el modo lo pone el bloque.
- Si el cadete cierra la ventana a media sesión, al volver empieza una sesión nueva. Los intentos ya guardados quedan en su cuenta.

**Briefing.**
- Textos fijos por idioma. Las tolerancias, la altura segura y la inclinación salen de las constantes de `virajeEscarpado.ts` (`TOLERANCIAS`, `ALTURA_SEGURA_AGL`, `INCLINACION_OBJETIVO`), no se escriben a mano.
- Contenido: qué maniobra y en qué avión; las cuatro tolerancias; la secuencia (subir, virajes de limpieza, 360° a un lado, nivelar en el rumbo de entrada, 360° al otro lado); 3 o 4 errores comunes (perder altitud al pasar de 30°, no corregir la presión atrás, salir tarde, bola descentrada); cómo se califica (práctica vs checkride, el reporte y la revisión de Erik para la insignia).
- [Claude] La redacción de los errores comunes y las líneas de "qué hacer con los controles" sale del contenido que ya tiene el sitio en `checkrideVuelo.ts` (tema "Virajes pronunciados"). Erik la revisa en el plan.
- "Listo, empiezo" también es el clic que el navegador pide para dejar hablar a la voz.

**Pasos e instrucciones en vuelo.**
- Lista fija de pasos del intento: Subir → Virajes de limpieza → Viraje 1 → Nivelar → Viraje 2 → Nivelar. El actual se marca; los pasados con ✓.
- Debajo de la orden grande, una línea de qué hacer con los controles en ese paso.

**Idioma.**
- La primera pantalla de cada sesión es elegir Español o English. Se recuerda en la PC del cadete para la próxima.
- En el idioma elegido van: la pantalla completa del programa, órdenes, avisos, briefing, debriefing, hoja del checkride, explicación y reporte.
- [Claude] El inglés usa los términos de un checkride en Estados Unidos: steep turn, clearing turns, coordinated, ACS. Unidades iguales: ft y kt.
- [Claude] Aviso legal del reporte en inglés: "Simulator practice. Not an official document and does not replace an exam before an aviation authority." El español no cambia.
- [Claude] Títulos del reporte en inglés: "Practice checkride — passed" / "Practice checkride — not passed". Nada de nombres de formularios de la FAA.
- Los enlaces del debriefing siguen siendo material en español; en inglés llevan la nota "(in Spanish)".
- El idioma no cambia lo que se guarda en la base: los intentos son datos, el texto se arma al mostrarlos.

**Voz.**
- Cola que no corta frases:
  - Las órdenes esperan su turno.
  - Un aviso espera. Cuando le toca, se vuelve a revisar: si ya no aplica, se descarta.
  - "Intento anulado" sí corta lo que se esté diciendo.
  - Si la voz está apagada, nada se encola.
- [Claude] Ajustes, en un panel de "Voz" con "Probar voz":
  - **Voz:** lista de voces de la PC en el idioma elegido. Por defecto `es-MX` Natural en español y `en-US` Natural en inglés.
  - **Velocidad:** Lenta (0.85), Normal (1), Rápida (1.15).
  - **Cuánto habla:**
    - "Detallado" (por defecto): órdenes, avisos tempranos, correcciones de práctica, comentario tras cada intento y lectura completa.
    - "Solo lo necesario": órdenes, avisos fuera de tolerancia, resultado y calificación, y el resumen del debriefing.
  - Volumen y encendido como hoy.
- Si la PC no tiene voz en el idioma elegido, el programa lo dice y sigue con texto.
- Los ajustes se guardan en la PC del cadete.

**Debriefing.**
- Mejor y peor intento de la sesión, con calificación.
- Si fue mejorando: compara el primer intento de práctica con el último y con el checkride.
- El elemento que más falló en la sesión y cómo corregirlo (de `explicacion.ts`).
- "Qué practicar": la recomendación de `repetir()` del último intento.
- Material: una lista de enlaces en datos (`materialViraje` o similar). [Claude] Al inicio lleva el tema "Virajes pronunciados" del simulacro de vuelo y la checklist del C172; los videos se agregan cuando Erik los grabe. Si un enlace es de Contenido Exclusivo, lo dice.

**Guardar la sesión.**
- Migración nueva: columna `sesion_id uuid` opcional en `intentos_maniobra`. Cada intento de la sesión lleva el mismo id; la página web sigue guardando sin él.
- `/admin/maniobras` agrupa por sesión: fecha, cuántos intentos, el checkride y su calificación. Los intentos sin sesión (desde la página) se ven como hoy.
- Erik corre la migración en el SQL Editor de Supabase antes de que se suba el código, como la 0022.
- Un checkride no aprobado también cierra la sesión; para otro checkride, "Nueva sesión".
- Las políticas y el disparador de hoy no cambian: el cadete sigue sin poder editar más que `revision`.

## Qué se deja al constructor

- Cómo se parte el plan de sesión (sugerencia: una función pura que, dado el bloque y los intentos, dice el siguiente bloque y qué decir, probada como `voz.ts`).
- Dónde viven los textos por idioma.
- La redacción exacta dentro del tono de arriba; Erik revisa el briefing y el debriefing en el plan.

## Sin verificar todavía

- Qué voces en inglés trae la PC de Erik.
- Que la cola no se atrase con avisos en un viraje real (solo se probará con `--simulado`).
- Lo pendiente del programa con voz: voz sin clic, Edge detrás de MSFS en pantalla completa y la pausa con MSFS real.
