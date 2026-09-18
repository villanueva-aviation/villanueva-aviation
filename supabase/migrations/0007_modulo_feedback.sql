-- Calificación rápida (estrellas + comentario opcional) que un cadete deja
-- al completar un módulo de Academia. Un cadete solo puede calificar cada
-- módulo una vez (puede actualizar su calificación, no duplicarla).
-- Ejecutar en Supabase Dashboard -> SQL Editor.

create table if not exists public.modulo_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  modulo_slug text not null,
  calificacion smallint not null check (calificacion between 1 and 5),
  comentario text,
  created_at timestamptz not null default now(),
  unique (user_id, modulo_slug)
);

alter table public.modulo_feedback enable row level security;

-- Un cadete solo puede insertar/actualizar su propia calificación por módulo.
create policy "modulo_feedback: insertar propio" on public.modulo_feedback
  for insert
  with check (auth.uid() = user_id);

create policy "modulo_feedback: actualizar propio" on public.modulo_feedback
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Un cadete puede ver su propia calificación (para no volver a pedírsela).
create policy "modulo_feedback: leer propio" on public.modulo_feedback
  for select
  using (auth.uid() = user_id);

-- El fundador puede leer todas las calificaciones de todos los módulos.
create policy "modulo_feedback: fundador lee todo" on public.modulo_feedback
  for select
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');
