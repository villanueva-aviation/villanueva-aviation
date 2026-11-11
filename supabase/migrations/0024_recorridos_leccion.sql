-- El recorrido de cada lección de rampa a rampa para el debriefing con mapa: puntos (uno por segundo),
-- fases, frases del instructor y errores ya ubicados. Va aparte de intentos_maniobra para que el panel
-- del fundador no cargue cientos de KB por renglón. Una fila por renglón de lección.

create table if not exists public.recorridos_leccion (
  id uuid primary key default gen_random_uuid(),
  intento_id uuid not null unique references public.intentos_maniobra(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  grabacion jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists recorridos_leccion_user_id_idx on public.recorridos_leccion(user_id);

alter table public.recorridos_leccion enable row level security;

drop policy if exists "recorridos_leccion: leer propio" on public.recorridos_leccion;
create policy "recorridos_leccion: leer propio" on public.recorridos_leccion
  for select
  using (auth.uid() = user_id);

drop policy if exists "recorridos_leccion: fundador lee todo" on public.recorridos_leccion;
create policy "recorridos_leccion: fundador lee todo" on public.recorridos_leccion
  for select
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

-- Solo para un renglón de lección propio.
drop policy if exists "recorridos_leccion: guardar propio" on public.recorridos_leccion;
create policy "recorridos_leccion: guardar propio" on public.recorridos_leccion
  for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.intentos_maniobra i where i.id = intento_id and i.user_id = auth.uid())
  );
