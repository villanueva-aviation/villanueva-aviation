# Instructor virtual: viraje escarpado del C172

Fecha: 2026-11-05. Estado: borrador para aprobación de Erik.

## Intención

Al cadete que practica solo en el simulador le falta alguien que le diga qué hizo mal. El instructor virtual lee su vuelo en MSFS 2020, lo califica con tolerancias de checkride real y al terminar le muestra qué falló y cómo corregirlo, con un reporte con formato de examen práctico.

Es la primera de tres piezas acordadas, en este orden:
1. Este instructor, que mide.
2. Una voz de IA que pregunta, escucha y califica respuestas orales. Será una suscripción mensual aparte del Contenido Exclusivo.
3. Un type rating simulado del Citation X, cuyo checkride usará este instructor.

Empieza con una sola maniobra, el viraje escarpado del C172, para probar que califica bien. Las siguientes maniobras de la página se agregan después sobre la misma base.

**Éxito:** Erik vuela la maniobra, el reporte coincide con lo que él sintió, atrapa sus errores reales y le dan ganas de repetirla para mejorar la calificación.

## Metas

- Calificar dos virajes de 360° a 45°, uno a cada lado, con las tolerancias que ya publica la página en `src/data/checkrideVuelo.ts`: altitud ±100 ft, velocidad ±10 kt, inclinación ±5° y rumbo de salida ±10°.
- Calificar también la preparación: virajes de limpieza, altura segura y velocidad de entrada no mayor a Va.
- Calificar la coordinación con la bola del coordinador de viraje.
- Tener dos modos:
  - **Práctica:** avisos en vivo, visuales y con sonido que se puede apagar.
  - **Checkride:** silencio total y resultado solo al final.
- Mostrar el resultado de tres formas en la misma pantalla, en este orden:
  1. **Hoja de checkride:** aprobado o no, y el peor valor de cada tolerancia por lado.
  2. **Explicación del instructor:** qué pasó, cómo corregirlo, calificación de 0 a 100 y qué repetir.
  3. **Gráficas en el tiempo:** altitud, inclinación, velocidad y bola, con la banda de tolerancia y los tramos fuera en rojo.
- Generar un reporte final con formato de examen práctico, inspirado en cómo la FAA entrega un checkride:
  - cada elemento del ACS con su código (PA.V.A.S1 a S5) y S o NS;
  - si no aprueba, "Aviso de no aprobación" con las áreas a re-examinar;
  - si aprueba, "Examen práctico aprobado" con calificación y folio.
- Guardar cada intento en la cuenta del cadete y mostrar su progreso: calificación por intento y la tolerancia que más falla.
- Botón para mandar el reporte a revisión de Erik, que da la insignia, y para descargarlo en PDF.

## No metas (por ahora)

- La voz de IA (pieza 2) y el Citation X (pieza 3).
- Otras maniobras. La base sí debe permitir agregarlas sin reescribir el lector.
- Mapa del círculo volado visto desde arriba.
- MSFS 2024: no se promete. Si funciona, bien, pero no se prueba en esta versión.
- Página pública para verificar folios.

## Anti-metas (si pasa esto, falló aunque funcione)

- **Que el reporte parezca un documento oficial.** Nada de logo ni formularios de la FAA, y nada de "certificado" ni "licencia". Lleva marca Villanueva Aviation y la línea "Práctica en simulador. No es un documento oficial ni sustituye un examen ante una autoridad aeronáutica."
- **Que califique mal por datos falsos:** pausa, modo slew o velocidad de simulación distinta de 1×. Esos intentos no se califican, o se marcan como inválidos.
- **Que califique distinto de lo que dice la página.** Las tolerancias salen de una sola fuente de datos, la misma que usa `checkrideVuelo.ts`.
- **Que pida SimHub o cualquier otro programa de terceros.**
- **Que aparezca la marca "Garmin" en cualquier parte.**

## Restricciones

- Windows y MSFS 2020, con el C172 de Asobo, clásico o G1000. Las variables que se leen son estándar en los dos.
- Sitio: React 19, Vite, TypeScript, Tailwind v4, Supabase y Cloudflare Pages.
- El repo es público. Nada de llaves ni secretos en el código.
- Acceso: **el viraje escarpado es gratis** para cualquiera con cuenta del sitio. La cuenta hace falta para guardar el historial y mandar a revisión. Es el gancho, como el dash del C152 gratis en Descargas. Las maniobras siguientes irán en el Contenido Exclusivo, así que la base debe poder marcar cada maniobra como gratis o exclusiva. El zip del lector también es gratis.
- Erik sube cambios solo después de decir "Sí, súbelo".

## Lo que Erik decidió

- **Dos piezas:**
  - un **lector** pequeño en la PC del cadete que lee SimConnect y sirve los datos solo en `127.0.0.1`;
  - una **página del sitio** abierta en el navegador del segundo monitor, que hace todo lo demás: modos, calificación, reporte, historial y PDF.
- **Las cinco extras entran en la primera versión:** preparación previa, coordinación, dos modos, progreso y mandar a revisión.
- **Las tres formas de resultado juntas,** más el reporte con formato de examen práctico de los mockups aprobados: "Aviso de no aprobación" y "Examen práctico aprobado", con códigos ACS, S/NS, áreas a re-examinar, folio y "Revisó: Erik Villanueva".
- **La insignia la da Erik** al revisar el reporte. El programa no la da solo.
- **Una insignia por maniobra.** Esta es "Viraje escarpado · C172". Si encaja, se reutiliza el sistema de insignias que ya existe ("Experto en C152").
- **El viraje escarpado es gratis** con cuenta. Las siguientes maniobras van en el Contenido Exclusivo.

## Diseño

### Lector (PC del cadete)

- C# x64 compilado con `csc` de .NET Framework 4, como `MotorReader.cs` en `simhub-sixpack/`. Así no hace falta instalar .NET.
- Se reconecta solo cuando el simulador abre o cierra.
- Lee a unos 10–20 Hz:
  - `PLANE BANK DEGREES`
  - `INDICATED ALTITUDE`
  - `AIRSPEED INDICATED`
  - `PLANE HEADING DEGREES MAGNETIC`
  - `TURN COORDINATOR BALL`
  - `PLANE ALT ABOVE GROUND`
  - `TOTAL WEIGHT`
  - `SIM ON GROUND`
  - `IS SLEW ACTIVE`
  - `SIMULATION RATE`
  - el título del avión, para saber si es un C172
  - el evento de sistema de pausa
- Sirve los datos en un puerto fijo de `127.0.0.1`. No usar el 8765, que es del puente de aterrizaje de Erik. Responde con estado `conectado` / `sin simulador`, igual que el puente.
- **CORS:** solo el origen del sitio de producción y `localhost` de desarrollo. Incluye la respuesta de *Private Network Access* (`Access-Control-Allow-Private-Network: true`), porque Chrome y Edge piden permiso la primera vez.
- **Distribución:** un zip gratis en Descargas con el lector, las DLL de SimConnect y un `.bat` para instalar, como el paquete del SimHub. Arranque con Windows opcional.

### Página del instructor (ruta a decidir por el constructor; esta maniobra no va bajo `/premium` porque es gratis)

- **Estados de la maniobra:**
  1. Armado
  2. Preparación (limpieza)
  3. Entrada
  4. Viraje 1
  5. Salida 1
  6. Viraje 2, al lado contrario
  7. Salida 2
  8. Resultado
- **Al entrar** (inclinación pasa de 30°) se fijan la altitud, el rumbo y la velocidad de entrada como referencia.
- **Elementos calificados** (códigos del ACS de piloto privado; verificar con la edición vigente, ver pendientes):
  - **PA.V.A.S1 Despejar el área.** En los 2 minutos antes de entrar, cambios de rumbo que sumen al menos 90°. *Decisión mía.*
  - **PA.V.A.S2 Velocidad de entrada ≤ Va.** Va según el peso total (C172S: 105 kt a 2550 lb, 98 a 2200, 90 a 1900; interpolar).
  - **PA.V.A.S3 360° coordinado a ~45°.** Inclinación ±5° y bola dentro de su tolerancia.
  - **PA.V.A.S4 Repetir al lado contrario.**
  - **PA.V.A.S5 Tolerancias:** altitud ±100 ft, velocidad ±10 kt, inclinación ±5° y rumbo de salida ±10°.
  - **Altura segura:** no bajar de 1500 ft sobre el terreno. En el ACS de privado no es un elemento con código; es la práctica recomendada. Se muestra como aviso, no como S/NS. *Decisión mía.*
- **Cuándo un elemento es NS:**
  - si está fuera de tolerancia más de 3 segundos seguidos; o
  - si en algún momento se sale más de 1.5 veces la tolerancia.

  Las desviaciones breves que se corrigen no reprueban, como haría un examinador. Los dos valores deben ser constantes fáciles de ajustar después de que Erik pruebe. *Decisión mía.*
- **Calificación de 0 a 100:** empieza en 100 y resta por cada elemento, según el tiempo fuera y qué tanto se pasó. Aprobado = todos los elementos S, sin importar el número. *Decisión mía.*
- **Explicación del instructor:** frases fijas por tipo de error y momento. Por ejemplo, perder altitud en los primeros 90° se explica como falta de presión atrás al entrar; pasarse de inclinación, como detener el alabeo antes de los 45°. Sin IA en esta pieza.
- **Modo práctica:** aviso visual grande y tono cuando algo sale de tolerancia. El tono se puede apagar.
- **Modo checkride:** nada en pantalla salvo "en curso" hasta el resultado.
- **Intento inválido:** si hubo pausa, slew o una velocidad de simulación distinta de 1×, o si el avión no es un C172. Se dice por qué y no se guarda como calificado.

### Datos (Supabase)

- Una tabla nueva de intentos, con RLS para que cada cadete vea solo los suyos y Erik vea todos. Guarda:
  - cadete, maniobra, avión, modo y fecha;
  - calificación, resultado y elementos S/NS;
  - folio;
  - estado de revisión: sin mandar, mandado, revisado aprobado o revisado no aprobado;
  - las series reducidas para redibujar las gráficas.
- **Mandar a revisión:** solo se puede con intentos del modo checkride que salieron aprobados. Así Erik no recibe prácticas. *Decisión mía.* Marca el intento como mandado. Erik lo ve en una lista suya y lo marca como revisado. "Revisó: Erik Villanueva" solo aparece en el reporte después de esa revisión.
- **PDF:** con la impresión del navegador y una hoja de estilos de impresión para el reporte.

## Lo que queda al constructor

- Puerto, formato (JSON por sondeo, SSE o WebSocket) y frecuencia exacta del lector.
- Nombre final de la ruta y de la tabla, y si la revisión de Erik reutiliza el flujo de reservas/Agenda que ya usa `ProyectoFinal`.
- Tolerancia de la bola. Sugerencia: media bola, ajustable.
- Fórmula exacta de los puntos.
- Diseño visual dentro del estilo del sitio. Los mockups aprobados son la referencia.
- Cómo se ven y suenan los avisos del modo práctica.

## Pendientes por verificar antes o durante la construcción

1. Los códigos y textos del ACS de piloto privado en la edición vigente (FAA-S-ACS-6C). Los de este documento salen de la 6B.
2. Que la licencia del SDK de MSFS permita incluir las DLL de SimConnect en nuestro zip.
3. Cómo se comporta el permiso de "acceso a la red local" de Chrome y Edge, y qué instrucciones darle al cadete.
4. Que `TURN COORDINATOR BALL` y `PLANE BANK DEGREES` den valores coherentes en el C172 clásico y en el G1000.
