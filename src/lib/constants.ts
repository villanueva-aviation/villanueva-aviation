export const SITE = {
  name: "Villanueva Aviation",
  tagline: "Aprende. Practica. Comunica. Vuela.",
  description:
    "Academia aeronáutica digital enfocada en educación teórica y simulación de vuelo para futuros pilotos: fundamentos, meteorología, aerodinámica, navegación, VFR e IFR.",
} as const;

export const DISCORD_URL = "https://discord.gg/A952wXcqDW";

// Cuenta del fundador — decide qué correo ve el panel de confirmación de vuelos.
// Debe coincidir con la policy "fundador" en supabase/migrations/0002_vuelos_practica.sql.
export const FOUNDER_EMAIL = "villanuevaaviation@gmail.com";

// Cuentas con todos los módulos de Academia abiertos (sin esperar el proyecto final del módulo anterior).
// Solo abre el acceso: no marca módulos completados ni registra graduación.
export const ACADEMIA_DESBLOQUEADA = [FOUNDER_EMAIL, "bcp200578@gmail.com"];

// Pago único para desbloquear Contenido Exclusivo. Debe coincidir con
// PRECIO_CONTENIDO_EXCLUSIVO en la Edge Function verify-paypal-payment.
export const PRECIO_CONTENIDO_EXCLUSIVO = "29.00";

export const CONTACT_EMAIL = "villanuevaaviation@gmail.com";
