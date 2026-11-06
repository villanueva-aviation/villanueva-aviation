-- Sesiones de una hora del programa del instructor.
-- Ejecutar en Supabase Dashboard -> SQL Editor ANTES de subir el código que lo usa:
-- el sitio lee sesion_id en los intentos y sin la columna falla la lectura.
--
-- Cada intento de una sesión del programa lleva el mismo sesion_id; los de la
-- página se quedan en null. Las políticas y el disparador de 0022 no cambian:
-- el cadete sigue sin poder editar nada más que revision.

alter table public.intentos_maniobra add column if not exists sesion_id uuid;

create index if not exists intentos_maniobra_sesion_idx on public.intentos_maniobra(sesion_id, created_at)
  where sesion_id is not null;
