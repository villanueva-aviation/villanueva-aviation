-- Progreso de Academia (lecciones/quizzes completados) por cadete, para que
-- no se pierda al cambiar de dispositivo. Antes vivía solo en localStorage.
-- Una sola fila por cadete con dos blobs JSON, igual a la forma que ya usaba
-- ProgressContext -- así el resto de la lógica de derivación no cambia.
-- Ejecutar en Supabase Dashboard -> SQL Editor.

create table if not exists public.academia_progreso (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completadas jsonb not null default '{}'::jsonb,
  examenes jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.academia_progreso enable row level security;

create policy "academia_progreso: leer propio" on public.academia_progreso
  for select
  using (auth.uid() = user_id);

create policy "academia_progreso: insertar propio" on public.academia_progreso
  for insert
  with check (auth.uid() = user_id);

create policy "academia_progreso: actualizar propio" on public.academia_progreso
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
