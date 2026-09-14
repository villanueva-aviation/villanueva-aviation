-- Agrega la red de vuelo online (VATSIM/IVAO) usada para el vuelo, para que el
-- fundador pueda cruzar el registro del cadete contra el historial público de
-- esa red antes de confirmarlo.
-- Ejecutar en Supabase Dashboard -> SQL Editor.

alter table public.vuelos_practica
  add column if not exists red text not null default 'ninguna' check (red in ('ninguna', 'vatsim', 'ivao')),
  add column if not exists identificador text;
