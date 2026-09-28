-- Algunos aeródromos pequeños (p. ej. Ocotlán, MM43) usan identificadores locales con
-- números, no solo letras. Permite 4 caracteres alfanuméricos en vez de solo 4 letras.
-- Ejecutar en Supabase Dashboard -> SQL Editor (después de 0015).

alter table public.aventura_vuelos
  drop constraint aventura_vuelos_origen_icao_check,
  add constraint aventura_vuelos_origen_icao_check check (origen_icao ~ '^[A-Z0-9]{4}$'),
  drop constraint aventura_vuelos_destino_icao_check,
  add constraint aventura_vuelos_destino_icao_check check (destino_icao ~ '^[A-Z0-9]{4}$');

alter table public.aventura_proximo
  drop constraint aventura_proximo_icao_check,
  add constraint aventura_proximo_icao_check check (icao ~ '^[A-Z0-9]{4}$');
