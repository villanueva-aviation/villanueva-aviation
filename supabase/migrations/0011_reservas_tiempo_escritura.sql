-- Tiempo (segundos) entre la primera tecla escrita en la respuesta del
-- Proyecto Final y el envío — señal de sospecha (no prueba) de que el
-- texto fue copiado/retipeado en vez de redactado con calma.
-- Ejecutar en Supabase Dashboard -> SQL Editor.

alter table public.reservas add column if not exists tiempo_escritura_segundos integer;
