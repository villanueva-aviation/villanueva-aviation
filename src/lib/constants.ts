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

// Sesiones 1 a 1 adicionales (la primera va incluida en Contenido Exclusivo).
// Se cobran por PayPal al confirmar la cita, no desde el sitio.
export const PRECIO_SESION_1A1 = "15.99";

// Página de Asesorías: solo informativos (el cobro real sigue siendo por PayPal al confirmar la cita).
// El precio de la sesión de 2 h es el doble de PRECIO_SESION_1A1, redondeado hacia abajo.
export const PRECIO_SESION_2H = "32";
export const PRECIO_PAQUETE_4_SESIONES = "120";
// Cupos que se muestran en la página; deben ser ciertos, ajústalos a tus horas reales.
export const DIAGNOSTICOS_POR_SEMANA = 3;
export const ALUMNOS_NUEVOS_POR_MES = 5;

export const CONTACT_EMAIL = "villanuevaaviation@gmail.com";

// Horas registradas por el fundador en IVAO (6884 h 7 min al 25 sep 2026). Se ponen a mano: actualizar de vez en cuando.
export const HORAS_IVAO = 6884;

// Prueba en red (ruta Listo para la red): bloque de 3 intentos, vigencia en días, repetición a mitad de precio.
// Los precios son texto por consistencia con el resto de constantes de precio (PayPal los pide así).
export const PRECIO_PRUEBA_RED = "32";
export const PRECIO_PRUEBA_RED_REPETICION = "16";
export const INTENTOS_POR_BLOQUE = 3;
export const DIAS_VIGENCIA_PRUEBA = 30;
// Horas de la semana que se abren para agendar pruebas en red.
export const HORAS_SEMANA_PRUEBAS = 2;
// Cancelar con menos de estas horas de anticipación cuenta como intento usado.
export const HORAS_CANCELACION = 24;
