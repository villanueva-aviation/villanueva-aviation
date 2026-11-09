# Niveles de dificultad del instructor — plan

> Ejecución inline (Erik aprobó la propuesta en el chat el 2026-11-08 y pidió «hazlo»).

**Goal:** Fácil / Medio / Difícil en las tres maniobras y el repaso, con tolerancias más amplias abajo; Difícil = lo de hoy (ACS).

**Architecture:** `nivel.ts` da las tolerancias por nivel. Cada evaluación lleva `nivel` (opcional, falta = 3) y su resultado también, así que voz, explicaciones, hojas y gráficas leen las tolerancias del nivel con que se voló. El nivel se guarda dentro de `detalle` (sin migración). `useIntento` tiene el selector (recordado en localStorage, empieza en 1) y fuerza 3 en checkride.

**Spec (aprobado en el chat):**

| | 1 Fácil | 2 Medio | 3 Difícil |
|---|---|---|---|
| Altitud | ±200 | ±150 | ±100 |
| Velocidad (lento: banda +X/−0) | ±20 | ±15 | ±10 |
| Rumbo / rumbo de salida | ±20 | ±15 | ±10 |
| Inclinación viraje 45° | ±10 | ±7 | ±5 |
| Inclinación vuelo lento | ±20 | ±15 | ±10 |
| Bola | ×2 | ×1.5 | ×1 |
| Desviación breve que no reprueba | 6 s | 4 s | 3 s |
| Mínimo para que cuente el 360° | 300° | 315° | 330° |
| Recto y nivelado dura | 60 s | 90 s | 120 s |
| Final del repaso | −10/+15 | −7/+12 | −5/+10 |

Checkride siempre 3. Insignias: ya solo salen de checkrides aprobados por Erik, así que quedan en 3 sin tocar nada. Voz avisa al 60 % de la tolerancia del nivel. Tras 2 prácticas aprobadas seguidas en el mismo nivel: «Ya puedes intentarlo en Medio/Difícil». Debriefing y Admin muestran el nivel. El checklist por voz no cambia.

## Global Constraints
- Sin «certificado», «CFI», «oficial»; UI en inglés sin acentos.
- Intentos viejos sin `nivel` = Difícil.

## Review Focus
1. Cambiar de nivel con un intento armado sin empezar: el intento toma el nivel nuevo; uno ya empezado conserva el suyo.
2. Pasar a checkride con el selector en Fácil: el intento se arma en Difícil.
3. Un resultado guardado en Fácil se reabre/explica con las tolerancias de Fácil, no las de Difícil.
4. Intentos viejos sin nivel en Admin y en la sugerencia de subir de nivel.
5. Recto y nivelado en Fácil: el aviso de «mitad» sale a los 30 s, no a los 60.

## Tasks
1. `nivel.ts` + pruebas de la tabla.
2. Viraje: `armar(ev, m, nivel)`, `avanzar` conserva `nivel`; tolerancias, NS, giro mínimo y resultado por nivel. Voz, explicación, briefing, hoja, gráfica y elementos del reporte por nivel. Pruebas: 318° cuenta en Fácil y no en Difícil; ±150 ft aprueba en Fácil.
3. Recto: lo mismo + duración y mitad por nivel. Prueba: termina a los 60 s en Fácil.
4. Lento: lo mismo (banda +20/−0 en Fácil). Prueba: 72 kt en banda en Fácil.
5. Repaso: final por nivel; nivel en el estado y en lo guardado. Prueba: final 74 kt aprueba en Fácil.
6. `useIntento`: selector, localStorage, checkride = 3, re-nivelar intento armado; `sugerirNivel` puro con prueba. Selector en las tres páginas; nivel en debriefing y Admin.
7. Suite, tsc, build, revisión final.
