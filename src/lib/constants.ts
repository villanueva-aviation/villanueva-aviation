export const SITE = {
  name: "Villanueva Aviation",
  tagline: "Aprende. Practica. Comunica. Vuela.",
  description:
    "Academia aeronáutica digital enfocada en educación teórica y simulación de vuelo para futuros pilotos: fundamentos, meteorología, aerodinámica, navegación, VFR e IFR.",
} as const;

export const DISCORD_URL = "https://discord.gg/Q7fmGsFbg";

// PLACEHOLDER: actualizar con la fecha real de la próxima clase en vivo / webinar.
export const NEXT_LIVE_EVENT = {
  title: "Clase en vivo: Fundamentos de Aviación",
  date: (() => {
    const d = new Date();
    d.setDate(d.getDate() + ((2 - d.getDay() + 7) % 7 || 7));
    d.setHours(20, 0, 0, 0);
    return d;
  })(),
};

// PLACEHOLDER: reemplazar con la dirección de contacto oficial cuando esté disponible.
export const CONTACT_EMAIL = "contacto@villanuevaaviation.placeholder";
