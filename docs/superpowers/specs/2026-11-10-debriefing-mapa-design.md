# Instructor virtual: debriefing con mapa satelital, repetición del vuelo y errores marcados

Fecha: 2026-11-10. Sigue a las 14 lecciones de rampa a rampa (lección 1 en main, a51103c). Bocetos aprobados por Erik en el compañero visual: `.superpowers/brainstorm/1437-1794368889/content/debrief-combinado.html` y `debrief-satelital-v2.html`.

## Intención

Hoy, al terminar una lección, el cadete escucha y lee un debriefing en texto por fases (checklist, despegue, maniobras, aterrizaje) y una hoja por maniobra. Le dice **qué** salió mal pero no **dónde**. Erik quiere que el cadete vea su vuelo: el recorrido sobre el mapa satelital, cada error señalado en el punto exacto donde lo cometió, y que pueda volver a «volar» el recorrido para ver qué traía en los instrumentos y qué le dijo el instructor en ese momento. «Algo muy detallado, con mucha información útil, que el cadete pueda ver dónde falló», con más información gráfica.

Momento que lo explica: lección 4, virajes a rumbos, en MMGL. Al apagar en la rampa aparece la imagen satelital de Guadalajara con su recorrido: rodaje punteado, despegue por la 10, la salida hacia Cajititlán, los virajes en la zona y el circuito de regreso. En la zona hay dos tramos rojos con un 1 y un 2; en la final, un 3. Toca el 1: el mapa se acerca, la repetición salta al minuto 24:10 y ve 5,860 ft, 31° de inclinación y al instructor diciendo «Estás subiendo: baja la nariz». Debajo, «Intento 2, viraje a 270° · Altitud +160 ft (tolerancia ±100)» con la explicación de cómo corregirlo.

Después del diseño, Erik y yo repasamos las lecciones una por una, volándolas de rampa a rampa, ya con esta pantalla.

## Lo que decidió Erik

- **Las tres vistas juntas** en una sola pantalla, en este orden de arriba abajo:
  1. **Fases:** botones «Todo el vuelo», Checklist, Rodaje, Despegue, Zona, Aterrizaje, Rodaje; cada uno con ✓ o con el número de errores. Tocar una fase acerca el mapa a esa parte del vuelo.
  2. **Mapa satelital** con el recorrido completo de rampa a rampa, coloreado por fase, los tramos con error en rojo y un marcador numerado por error. Un avión dorado marca dónde va la repetición.
  3. **Repetición:** el perfil de altitud (y velocidad) contra el tiempo, con las fases sombreadas y marcas rojas en cada error, hace de barra de reproducción: se arrastra o se le da play a ×1, ×4 y ×16. Debajo, los instrumentos en ese instante (altitud, velocidad, rumbo, inclinación, bola) y lo último que dijo el instructor.
  4. **Errores:** lista numerada igual que los marcadores. Cada uno dice fase, intento, qué se pasó, cuánto contra la tolerancia, el minuto del vuelo y la explicación de cómo corregirlo, con «Ver» que lleva el mapa y la repetición a ese punto. Al final, un renglón con lo que salió bien.
- **Mapa satelital**, no de calles.
- Aplica a **las lecciones de rampa a rampa** (las 14).

## Decisiones mías (Erik puede cambiarlas)

- **Imagen satelital de Esri World Imagery** (fotos de Maxar), con su atribución visible. Mientras solo el fundador entra a las lecciones (`ACCESO_REPASO = "fundador"`) se usa sin llave. Antes de abrir las lecciones a cadetes, Erik crea la cuenta gratuita de ArcGIS y la llave va en una variable de entorno (`VITE_…`), nunca en el chat. La URL de los mosaicos vive en una constante para agregar la llave sin tocar más código.
- **Leaflet**, que ya está instalado y se usa en `src/features/aventura/MapaAventura.tsx`. Nada de dependencias nuevas.
- **Se guarda el recorrido** para verlo después, en una **tabla aparte** `recorridos_leccion`, no dentro de `detalle` de `intentos_maniobra`: el panel del fundador trae `detalle` de cientos de renglones y no debe cargar cientos de KB por cada uno. Una fila por lección guardada, ligada al id del renglón de la lección. Políticas iguales a `intentos_maniobra`: el dueño inserta y lee lo suyo, el fundador lee todo. La migración la corre Erik.
- **Un punto por segundo** en el recorrido guardado (el lector manda cada 100 ms). Una hora son ~3,600 puntos; se guardan como arreglos compactos, no como objetos con nombres, con lo necesario para el mapa y la repetición: t, lat, lon, altitud, velocidad, rumbo, inclinación, bola, agl.
- **Dónde va cada error en el mapa:**
  - Errores de maniobra (todos los resultados tienen `fuera: Record<campo, Tramo[]>`, a veces anidado por lado, como el viraje escarpado): el tramo `inicio → fin` va en rojo sobre el recorrido y el marcador en el `inicio`, que es donde empezó el error. El número que se muestra es `peor`, con su unidad y la tolerancia del nivel con que se voló.
  - Errores de un solo valor (los que restan 15, como el radio de la «8» alrededor de pilones): marcador al final del intento.
  - Errores de la lección (rotación, Vy, velocidad en final, tocar fuera de la pista): marcador en el evento de `vuelo.eventos` que corresponde (despegue, aterrizaje). Si un error no tiene momento, va en la lista sin marcador.
  - Errores del checklist: en la lista y en la pestaña Checklist, sin marcador en el mapa.
- **La lista de errores se calcula una vez, al terminar el vuelo**, con los resultados completos que ya están en memoria, y se guarda junto con el recorrido. La página de un vuelo guardado solo la lee; no recalcula nada.
- **Errores agrupados por intento.** Cada error tiene su renglón medido (campo, peor valor, tolerancia, minuto). La explicación de cómo corregir (las líneas «mal» de `explicar` de la maniobra) va una vez por intento, debajo de sus errores, porque `explicar` no dice a qué tramo pertenece cada línea.
- **Lección 14 (toques y despegues):** no hay zona; la pestaña se llama «Circuitos» y cubre del primer despegue al último aterrizaje.
- **Lección anulada** (slew, salto, sin conexión): el mapa se muestra igual al terminar, con el punto donde se anuló, pero no se guarda, igual que hoy la lección anulada no se guarda.
- **Lo que dijo el instructor:** se registra cada frase que dice en voz (órdenes, avisos, lectura final, checklist) con el `t` de la muestra de ese momento, y se guarda con el recorrido.
- **Las fases del recorrido** salen de los cambios de `vuelo.fase` y de la etapa del repaso, registrados con su `t`. «Zona» cubre las maniobras, incluyendo los ratos fuera de la zona.
- **Dónde se ve:**
  - Al terminar la lección, arriba del debriefing de texto actual (que se queda).
  - En una página propia por lección guardada (por ejemplo `/instructor/vuelo/:id`), a la que llegan el cadete desde el menú de lecciones (su último vuelo de cada lección) y el fundador desde el panel de sesiones.
- **Celular:** todo en una columna; el mapa ocupa el ancho y la barra de repetición se arrastra con el dedo.

## Metas

- El cadete encuentra en el mapa el punto exacto de cada error y entiende qué traía en ese instante.
- Todos los errores que ya calcula el programa aparecen; ninguno se inventa.
- Funciona en las 14 lecciones sin escribir código especial por maniobra (salvo lo mínimo para nombrar campos y unidades).

## Lo que no es

- No es para las páginas de maniobra suelta (las que no son de rampa a rampa).
- No exporta video ni comparte el vuelo públicamente.
- No es 3D ni dibuja la cabina.
- No cambia cómo se califica nada.

## Lo que sería un fracaso aunque funcione

- Un marcador en el lugar equivocado. Es peor que no tenerlo: el cadete corrige lo que no era.
- Que grabar el recorrido haga más lento el vuelo en vivo o retrase la voz del instructor.
- Que, si falla guardar el recorrido, se pierda la lección. Primero se guarda el renglón de la lección como hoy; el recorrido va después y su error se avisa aparte con «Reintentar».
- Una pantalla tan cargada que el cadete no sepa por dónde empezar: lo primero que ve es el mapa con los números.

## Restricciones

- Textos: nada de "instructor certificado", "CFI", "licencia", "certificado", "certified", "curso oficial", "examen de la AFAC", "con IA", ni "Garmin" visible. La versión en inglés no lleva [áéíóúñ¿¡].
- ES/EN como el resto del instructor (`Idioma`).
- Atribución de la imagen satelital siempre visible.
- Sin dependencias nuevas.
- La migración de la tabla nueva la corre Erik.
- Las pruebas siguen el patrón del repo (`node --experimental-strip-types --test`, agregadas a la lista de `package.json`).

## Lo que queda para quien lo construya

- La forma exacta de la tabla, del arreglo compacto y de los nombres de funciones.
- Cómo se reduce el recorrido a un punto por segundo y cómo se busca el punto más cercano a un `t`.
- Colores por fase, tamaños, el zoom de cada fase y la animación de la repetición.
- Cómo se nombran y formatean campos y unidades por maniobra en la lista de errores, reutilizando `celdas` y las tolerancias de `nivel.ts`.
- Cómo se registra la voz sin tocar cada llamada a `decir` una por una (por ejemplo, envolviendo `decir` de `useVoz` en la página de la lección).
