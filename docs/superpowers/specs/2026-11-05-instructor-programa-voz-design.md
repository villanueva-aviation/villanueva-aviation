# Instructor virtual como programa con voz — viraje escarpado del C172

Fecha: 2026-11-05. Proyecto 1 de 5 del instructor virtual (los otros, en orden: arranque y procedimientos, rodaje, examinador con IA, retroalimentación con enlaces a material). Se construye sobre el instructor web ya publicado (`docs/superpowers/specs/2026-11-05-instructor-virtual-viraje-escarpado-design.md`, commits 642808d..73cafee) y sobre el arreglo de pausa del lector (009f04a, local).

## Intención

Erik quiere que el cadete viva el instructor como en la vida real: está en su avión en MSFS, abre un programa aparte, lo activa y un instructor le habla. Hoy todo pasa en una pestaña del navegador y en silencio salvo un pitido. El cadete tiene que voltear a ver la pantalla, y con MSFS en pantalla completa eso rompe la inmersión. Con voz, el cadete vuela mirando su simulador y el instructor le dice qué hacer, le advierte antes de salirse de una tolerancia y al final le explica cómo le fue.

Éxito: Erik abre el programa, vuela el viraje escarpado en su C172 sin ver otra pantalla y escucha las órdenes, los avisos y la explicación final; el intento queda en su cuenta igual que desde la página.

## Lo que decidió Erik

- Es un **programa aparte** de la página, que el cadete abre junto con MSFS.
- **Inicia sesión dentro del programa** con su cuenta de Villanueva Aviation. Cada intento se guarda en su cuenta: aparece en "Tu progreso" y el checkride va a revisión de Erik para la insignia, igual que hoy.
- **La página del instructor se queda** para quien no quiera el programa.
- **Voz en Práctica y en Checkride.** En los dos, la voz da las órdenes del examinador y **advierte antes de salirse** ("ojo con tu altitud", "revisa tu velocidad") para que el cadete lo prevenga.
- **Al final, la voz lee toda la explicación**: resultado, calificación, qué hizo bien, qué hizo mal y cómo corregirlo, y qué repetir.

## Metas

1. Un solo programa para descargar que reemplaza la ventana negra del lector: lee el avión y abre la ventana del instructor.
2. Ventana del instructor compacta, pensada para un segundo monitor o para no verse.
3. Voz en español con órdenes, avisos y lectura final.
4. Misma calificación, mismos intentos y misma revisión que la página.

## No metas (vienen en los proyectos 2–5 o después)

- Arranque, procedimientos, rodaje, otras maniobras u otros aviones.
- IA, que el cadete le hable al programa o que se le den órdenes al azar.
- Enlaces a videos o material en la retroalimentación.
- Mac, MSFS 2024.
- Cobro: el viraje escarpado sigue gratis con cuenta.

## Anti-metas (fallaría aunque funcione)

- Que la voz sea una chicharra: avisos repetidos sin parar.
- Que el programa y la página califiquen distinto.
- Que el programa vea o guarde contraseñas.
- Palabras de certificación oficial ("certificado", "licencia", "CFI") o imitar documentos de la FAA. El aviso del reporte se queda igual.
- La marca "Garmin" visible.

## Cómo (decisiones de Claude, marcadas)

**[Propuesto por Claude, aprobado por Erik] El programa = el lector + una ventana de Edge en modo aplicación.**
- Al abrir `VillanuevaInstructorLector.exe` sin argumentos, el lector arranca como hoy y además lanza Microsoft Edge en modo aplicación, sin barra de direcciones ni pestañas, con la vista nueva `/instructor/programa` del sitio en línea.
- Edge viene en todo Windows 10/11.
- Usa un perfil propio en `%LOCALAPPDATA%\VillanuevaInstructor\Edge`, que guarda la sesión del programa aparte de su navegador.
- Se lanza con las banderas que evitan que Edge frene la página cuando MSFS la tapa: `--disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding`.
- Por qué:
  - El motor de calificación, las explicaciones, el guardado y el inicio de sesión son el mismo código de la página. Así los dos califican igual por construcción.
  - Al mejorar algo no se reinstala nada.
  - Edge trae voces naturales en español de México.
- Costo si está mal: si Erik quiere una ventana que no sea Edge por dentro, la vista se mete en WebView2 dentro del exe. El resto del diseño no cambia.
- Si el cadete cierra la ventana, el lector sigue abierto para la página. Volver a abrir el exe reabre la ventana. Si Edge no aparece, el lector lo dice en su consola y la página sigue sirviendo.

**Inicio de sesión dentro de la ventana.**
- Google funciona dentro de la ventana de Edge.
- El correo hoy manda un enlace (`signInWithOtp`), que se abre en el navegador normal y no en la ventana del programa.
- [Propuesto por Claude, aprobado por Erik] En `/instructor/programa` el ingreso por correo pide el **código de 6 dígitos** del mismo correo (`verifyOtp` tipo `email`).
- Requiere que la plantilla "Magic Link" de Supabase incluya `{{ .Token }}`. Es un cambio de una vez en el tablero que hace Erik; el enlace sigue funcionando para la página.

**Vista `/instructor/programa`** (ruta protegida, la página actual no cambia):
- **Arriba:** estado del lector, Práctica/Checkride y el control de voz con volumen.
- **Al centro, grande:** la instrucción del paso.
- **Abajo:** un semáforo por tolerancia (altitud, velocidad, inclinación, bola) en verde, ámbar (acercándose) o rojo (fuera).
- **Al terminar:** hoja del checkride, explicación y "Mandar a revisión", con los mismos componentes de la página. Las gráficas y el reporte completo quedan en la página, con un enlace "Ver reporte completo".
- Usable desde 380 px de ancho.

**Voz.**
- Web Speech (`speechSynthesis`) con una voz `es-MX`, de preferencia las "Online (Natural)" de Edge. Si no hay, cualquier voz `es` que tenga Windows.
- Una sola cola: lo nuevo y urgente corta lo viejo, y la lectura final no se corta.
- [Claude] Lo que dice:
  - **Órdenes, en los dos modos:**
    - al armarse: "Despeje el área con sus virajes de limpieza";
    - si está bajo: "Suba a 1,500 pies sobre el terreno";
    - "Inicie el viraje" al detectar la entrada;
    - "Nivele en su rumbo de entrada" a los 300° girados;
    - "Ahora al lado contrario";
    - "Intento anulado: …" con el motivo.
  - **Aviso previo**, al pasar del 60 % de una tolerancia (`AVISO_FRACCION = 0.6`, ajustable):
    - Checkride: "Ojo con tu altitud", "Revisa tu velocidad", "Cuida la inclinación", "Centra la bola".
    - Práctica: la frase con la corrección, como el aviso en vivo de hoy ("Estás perdiendo altitud: más presión atrás").
  - **Fuera de tolerancia:** "Fuera de tolerancia: altitud".
  - **Sin repetir:** cada aviso se dice una vez y vuelve a decirse solo tras regresar a la banda o tras 8 s seguidos fuera.
  - **Final:** "Aprobado" o "No aprobado", la calificación, cada línea de `explicar()` y la de `repetir()`, sin los símbolos ✓/✗.
- Los avisos no cambian la calificación.

**Lector.**
- Incluye el arreglo de pausa por el reloj del simulador (009f04a).
- Nueva bandera `--sin-ventana` para quien solo quiera el lector.
- LEEME y la entrada de Descargas se actualizan (v1.1).
- Sigue sin traer las DLL de SimConnect.

## Qué se deja al constructor

- Cómo se parte la lógica de avisos. Va pura y probada, junto a `avisoEnVivo`.
- La redacción exacta de cada frase, dentro del tono de arriba.
- Cómo encontrar `msedge.exe`: App Paths del registro y las rutas comunes.

## Sin verificar todavía

- Que Edge con esas banderas no frene la voz cuando MSFS en pantalla completa tapa la ventana.
- Qué voces españolas trae la PC de Erik.
- El cambio de plantilla en Supabase.
