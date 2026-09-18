-- Directorio de cadetes: una fila por cuenta creada, poblada automáticamente
-- al registrarse (trigger sobre auth.users), para que el fundador vea un
-- conteo y listado de todos los cadetes aunque aún no hayan hecho nada.
-- También agrega la política que le permite al fundador leer el progreso
-- de Academia de todos los cadetes (antes solo cada cadete veía el suyo).
-- Ejecutar en Supabase Dashboard -> SQL Editor.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nombre text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: leer propio" on public.profiles
  for select
  using (auth.uid() = user_id);

create policy "profiles: fundador lee todo" on public.profiles
  for select
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

-- Backfill: registra a los cadetes que ya existían antes de esta migración.
insert into public.profiles (user_id, email, nombre)
select id, email, coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name')
from auth.users
on conflict (user_id) do nothing;

-- A partir de ahora, cada cuenta nueva se registra sola aquí.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, nombre)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- El fundador también puede ver el progreso de Academia de cualquier cadete.
create policy "academia_progreso: fundador lee todo" on public.academia_progreso
  for select
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');
