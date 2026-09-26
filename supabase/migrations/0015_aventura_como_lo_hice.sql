-- "Cómo lo hice": cada vuelo de la aventura puede llevar notas técnicas, la imagen
-- del plan de vuelo (pública) y el archivo del plan (solo con cuenta). Además, un
-- único "próximo destino" que se dibuja punteado en el mapa.
-- Ejecutar en Supabase Dashboard -> SQL Editor (después de 0014).

alter table public.aventura_vuelos
  add column if not exists como_lo_hice text,
  add column if not exists plan_imagen_path text,
  add column if not exists plan_archivo_path text,
  add column if not exists plan_archivo_nombre text;

-- Próximo destino: una sola fila (id siempre true).
create table if not exists public.aventura_proximo (
  id boolean primary key default true check (id),
  icao text not null check (icao ~ '^[A-Z]{4}$'),
  nombre text not null,
  lat numeric not null check (lat between -90 and 90),
  lon numeric not null check (lon between -180 and 180),
  updated_at timestamptz not null default now()
);

alter table public.aventura_proximo enable row level security;

create policy "aventura_proximo: cualquiera lee" on public.aventura_proximo
  for select to anon, authenticated using (true);

create policy "aventura_proximo: fundador inserta" on public.aventura_proximo
  for insert with check (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

create policy "aventura_proximo: fundador edita" on public.aventura_proximo
  for update using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com')
  with check (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

create policy "aventura_proximo: fundador borra" on public.aventura_proximo
  for delete using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

-- Archivos. Imágenes: bucket público (5 MB). Planes: bucket privado (1 MB), solo
-- lo lee quien tenga cuenta. Solo el fundador sube y borra.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('aventura-imagenes', 'aventura-imagenes', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit)
values ('aventura-planes', 'aventura-planes', false, 1048576)
on conflict (id) do nothing;

create policy "aventura archivos: fundador sube" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('aventura-imagenes', 'aventura-planes') and auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

create policy "aventura archivos: fundador borra" on storage.objects
  for delete to authenticated
  using (bucket_id in ('aventura-imagenes', 'aventura-planes') and auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

create policy "aventura planes: cuenta descarga" on storage.objects
  for select to authenticated
  using (bucket_id = 'aventura-planes');
