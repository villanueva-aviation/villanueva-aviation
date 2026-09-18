-- Registra cuándo un cadete completa el 100% de la teoría de Academia
-- (todos los módulos), para que el fundador lo reconozca en redes y le
-- ofrezca las prácticas de Contenido Exclusivo. Una fila por cadete.
-- Ejecutar en Supabase Dashboard -> SQL Editor.

create table if not exists public.graduados_teoria (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  completado_en timestamptz not null default now(),
  reconocido boolean not null default false
);

alter table public.graduados_teoria enable row level security;

-- Un cadete solo puede registrar su propia graduación (una vez, por la PK).
create policy "graduados_teoria: insertar propio" on public.graduados_teoria
  for insert
  with check (auth.uid() = user_id);

-- El fundador puede ver a todos los graduados.
create policy "graduados_teoria: fundador lee todo" on public.graduados_teoria
  for select
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

-- Solo el fundador puede marcarlos como reconocidos.
create policy "graduados_teoria: fundador actualiza" on public.graduados_teoria
  for update
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com')
  with check (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');
