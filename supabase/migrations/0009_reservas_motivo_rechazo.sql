-- Motivo de rechazo cuando el fundador marca una reserva/proyecto final
-- como "rechazada" — el cadete lo ve para saber qué corregir antes de
-- volver a enviar. Ejecutar en Supabase Dashboard -> SQL Editor.

alter table public.reservas add column if not exists motivo_revision text;
