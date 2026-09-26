-- The Adventure: un registro público de los vuelos del fundador, aeropuerto por
-- aeropuerto. Cualquiera puede leerlo (es la página /aventura); solo el fundador
-- puede escribir, corregir o borrar.
-- Ejecutar en Supabase Dashboard -> SQL Editor.

create table if not exists public.aventura_vuelos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  origen_icao text not null check (origen_icao ~ '^[A-Z]{4}$'),
  origen_nombre text not null,
  origen_lat numeric not null check (origen_lat between -90 and 90),
  origen_lon numeric not null check (origen_lon between -180 and 180),
  destino_icao text not null check (destino_icao ~ '^[A-Z]{4}$'),
  destino_nombre text not null,
  destino_lat numeric not null check (destino_lat between -90 and 90),
  destino_lon numeric not null check (destino_lon between -180 and 180),
  avion text not null,
  minutos integer not null check (minutos > 0),
  distancia_nm integer not null check (distancia_nm >= 0),
  aterrizaje_fpm integer,
  red text not null default 'ivao' check (red in ('ivao', 'vatsim', 'ninguna')),
  video_url text check (video_url is null or video_url ~ '^https://'),
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists aventura_vuelos_fecha_idx on public.aventura_vuelos(fecha, created_at);

alter table public.aventura_vuelos enable row level security;

create policy "aventura_vuelos: cualquiera lee" on public.aventura_vuelos
  for select
  to anon, authenticated
  using (true);

create policy "aventura_vuelos: fundador inserta" on public.aventura_vuelos
  for insert
  with check (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

create policy "aventura_vuelos: fundador edita" on public.aventura_vuelos
  for update
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com')
  with check (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

create policy "aventura_vuelos: fundador borra" on public.aventura_vuelos
  for delete
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');
