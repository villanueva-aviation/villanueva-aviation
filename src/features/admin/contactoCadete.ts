// Lógica pura del panel de cadetes (sin Supabase, para poder probarla).

export type EtapaCadete = "sin-empezar" | "en-progreso" | "completo";

/**
 * Clasifica por número de actividades, no por porcentaje: con 240 actividades
 * una sola lección completada redondea a 0% y el cadete saldría como "sin
 * empezar" justo cuando ya dio el primer paso.
 */
export function etapaDeCadete(actividadesCompletadas: number, totalActividades: number): EtapaCadete {
  if (actividadesCompletadas <= 0) return "sin-empezar";
  if (actividadesCompletadas >= totalActividades) return "completo";
  return "en-progreso";
}

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function diasDesde(fechaIso: string, ahora: Date = new Date()): number {
  return Math.max(0, Math.floor((ahora.getTime() - new Date(fechaIso).getTime()) / MS_POR_DIA));
}

export function primerNombre(nombre: string | null): string | null {
  const primero = nombre?.trim().split(/\s+/)[0];
  return primero || null;
}

/**
 * Mensaje de primer contacto. Deliberadamente no menciona precios ni sesiones
 * gratis: lo que está incluido en cada cosa lo decide el fundador, no el
 * borrador, y el sitio dice que la primera sesión va dentro de Contenido
 * Exclusivo.
 */
export function mensajeContacto(nombre: string | null, urlFormacion: string): { asunto: string; cuerpo: string } {
  const saludo = primerNombre(nombre) ? `Hola ${primerNombre(nombre)},` : "Hola,";
  return {
    asunto: "¿Te ayudo a arrancar en Villanueva Aviation?",
    cuerpo: [
      saludo,
      "",
      "Soy Erik, fundador de Villanueva Aviation. Vi que creaste tu cuenta y quería preguntarte directamente: ¿qué te gustaría aprender o practicar?",
      "",
      "Si quieres empezar ya, tu primera lección te espera aquí:",
      urlFormacion,
      "",
      "Y si prefieres platicar primero, respóndeme este correo y lo vemos.",
      "",
      "Saludos,",
      "Erik",
    ].join("\n"),
  };
}

/** Abre el redactor de Gmail ya lleno; funciona sin depender de un cliente de correo instalado. */
export function enlaceGmail(destinatario: string, asunto: string, cuerpo: string): string {
  const params = new URLSearchParams({ view: "cm", fs: "1", to: destinatario, su: asunto, body: cuerpo });
  return `https://mail.google.com/mail/?${params.toString()}`;
}
