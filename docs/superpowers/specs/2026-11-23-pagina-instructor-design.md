# Página del instructor virtual (`/instructor`) — diseño

Fecha: 2026-11-23 · Rama: `pagina-instructor`

## Para qué

Erik quiere que el instructor virtual tenga su propio apartado para promocionarlo y que se vea lo grandiosa que es la herramienta, no que se quede como una tarjeta más dentro de «Aprende». Hoy esa tarjeta lleva directo a `/instructor/viraje-escarpado`, que pide sesión iniciada: quien no tiene cuenta cae en el inicio de sesión sin haber visto qué es el instructor.

**Lo único que la página debe lograr (Erik):** que el visitante cree su cuenta y pruebe gratis el viraje escarpado.

## Metas, no metas y anti-metas

- **Meta:** una página pública `/instructor` que muestre el instructor funcionando y termine en el botón «Crea tu cuenta y prueba el viraje escarpado gratis».
- **Meta:** que la gente llegue a ella: la tarjeta de «Aprende» y la portada apuntan a `/instructor`.
- **No meta:** abrir las lecciones a los cadetes (siguen «solo fundador»), versión en inglés, video promocional (opción C, se puede agregar después), cambiar el instructor en sí.
- **Anti-meta:** que alguien sienta que lo engañaron, porque la página presume 14 lecciones y al entrar solo hay candados. Lo que no está abierto se marca como «Próximamente» y todo va como beta.
- **Anti-meta:** imágenes generadas con IA o pantallas inventadas. Solo piezas y capturas reales.

## Enfoques (elegido: A)

- **A. Página propia hecha con piezas reales** (elegida por Erik): gancho, cómo funciona, debriefing de demostración en vivo, capturas reales, qué es gratis y qué viene, botón. Luce la herramienta completa con lo que ya existe.
- B. Portada encima de la página del viraje escarpado: barata, pero el programa, el IFR y el debriefing siguen sin lucirse.
- C. La A más un video en Remotion: lo más vistoso, pero depende de que Erik grabe pantalla y voz. Queda para después.

## La página, de arriba a abajo

1. **Gancho.** Etiqueta «Instructor virtual · beta». Título del estilo de «Un instructor que te califica mientras vuelas en MSFS». Subtítulo de una línea: lee tu avión en MSFS 2020, te guía con voz y te califica con las tolerancias de un checkride. Botón principal (ver «El botón»). Una captura real del instructor a un lado.
2. **Cómo funciona**, en 3 pasos (es una secuencia real, por eso va numerada): abres el lector en tu PC, vuelas el C172 en MSFS 2020 y el instructor te habla y te califica, y al aterrizar te da el debriefing. Los textos salen de los pasos que ya usa la página del viraje escarpado.
3. **El debriefing.** Una captura fija y grande del vuelo de demostración (`/instructor/vuelo/demo`): la ruta sobre el mapa satelital, los errores numerados en su punto y las pestañas por fase. Es la pieza que más impresiona. Decisión de Erik (2026-11-23): captura fija por ahora; el mapa en vivo entra cuando exista `VITE_ARCGIS_KEY`.
4. **Lo que hace por ti**, en 3 o 4 bloques con capturas reales: la voz que te guía (ES/EN), el checklist por voz (C172, C152 y Arrow), los niveles Fácil/Medio/Difícil y las hojas imprimibles gratis (enlace a `/instructor/hojas`).
5. **Gratis hoy y lo que viene.**
   - Gratis con tu cuenta: el viraje escarpado en el C172, con práctica y checkride, y las hojas imprimibles.
   - Próximamente: el programa de 14 lecciones VFR (de Familiarización a Toques y despegues) y 5 lecciones IFR (radiales, rutas pasadas, arcos DME, esperas y vuelo mezclado). Los nombres salen de `LECCIONES` y `LECCIONES_IFR` de `lecciones.ts`, para que no se desactualicen.
   - Aviso de beta con enlace al Discord para reportar, igual que en la página del viraje.
6. **Requisitos**, en una línea: Windows, MSFS 2020 y el lector gratis de Descargas.
7. **Cierre:** el mismo botón principal.

```
┌──────────────────────────────────────────────┐
│ INSTRUCTOR VIRTUAL · BETA                    │
│ Un instructor que te califica    [captura]   │
│ mientras vuelas en MSFS                      │
│ [ Crea tu cuenta y prueba gratis ]           │
├──────────────────────────────────────────────┤
│ 1 Abre el lector  2 Vuela  3 Debriefing      │
├──────────────────────────────────────────────┤
│ [ mapa del vuelo demo, errores numerados ]   │
├──────────────────────────────────────────────┤
│ Voz · Checklist por voz · Niveles · Hojas    │
├──────────────────────────────────────────────┤
│ Gratis hoy  |  Próximamente (14 VFR + 5 IFR) │
├──────────────────────────────────────────────┤
│ Requisitos · [ botón ]                       │
└──────────────────────────────────────────────┘
```

## El botón

- **Sin sesión:** «Crea tu cuenta y prueba el viraje escarpado gratis» → `ROUTES.ingresar?from=/instructor/viraje-escarpado`, el mismo patrón de `?from=` que ya usan Aventura, Contenido Exclusivo y Empieza. Al terminar el registro, el visitante cae directo en la maniobra.
- **Con sesión:** «Prueba el viraje escarpado» → `/instructor/viraje-escarpado`.

## Cómo llega la gente

- La tarjeta «Instructor virtual (beta)» de «Aprende» en `secciones.ts` cambia su `to` a `/instructor`.
- La portada (`Home.tsx`) gana un bloque destacado del instructor que lleva a `/instructor`. Así deja de ser solo una tarjeta dentro de una categoría.
- No se agrega una quinta entrada al menú: el menú de 4 secciones (Vuela, Hangar, Aprende, Comunidad) es la decisión de «casa del simulador».

## Restricciones

- Palabras prohibidas: «instructor certificado», «CFI», «licencia», «certificado», «certified», «curso oficial», «examen de la AFAC», «con IA». No se ve «Garmin».
- Todo como **beta** (decisión de Erik del 2026-11-23).
- **Mapa satelital:** la página no carga mosaicos de Esri; el debriefing va como imagen fija en `public/images/`. Sin llave de ArcGIS no se monta `MapaVuelo` en una página pública.
- Las capturas son pantallas reales del sitio. Las tomo yo en el navegador con el vuelo de demostración y las páginas del instructor; si alguna pantalla necesita a MSFS conectado, se la pido a Erik.
- Título de la pestaña en `App.tsx` (`TITULOS`), ruta en `ROUTES` y página con carga diferida (`lazy`), como las demás.

## Lo que queda a criterio de quien construye

- Diseño visual dentro del sistema actual del sitio (navy/dorado, componentes existentes como `Button`).
- El texto final de cada bloque, respetando las restricciones de arriba.
- Cuántas capturas y cuáles.

## Decisiones de Erik

- 2026-11-23: enfoque A.
- 2026-11-23: el debriefing va como captura fija mientras no haya llave de ArcGIS.
