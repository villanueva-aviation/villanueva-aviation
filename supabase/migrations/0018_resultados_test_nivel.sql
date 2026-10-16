-- Resultados anónimos del test de nivel (/nivel): cuánta gente lo termina, qué nivel tiene
-- y en qué área falla más. No guarda nombre, correo, IP ni cuenta: solo los aciertos.
-- `fuente` sale del enlace (?ref=reel1) para saber qué publicación trajo a la persona.
-- Ejecutar en Supabase Dashboard -> SQL Editor.

create table if not exists public.resultados_test_nivel (
  id uuid primary key default gen_random_uuid(),
  aciertos integer not null check (aciertos between 0 and 12),
  nivel text not null check (nivel in ('Principiante', 'Base', 'Intermedio', 'Avanzado')),
  areas jsonb not null check (jsonb_typeof(areas) = 'object'),
  fuente text check (fuente is null or fuente ~ '^[a-z0-9_-]{1,40}$'),
  created_at timestamptz not null default now()
);

create index if not exists resultados_test_nivel_fecha_idx on public.resultados_test_nivel(created_at);

alter table public.resultados_test_nivel enable row level security;

-- Cualquiera (sin cuenta) puede guardar su resultado; nadie puede editarlo ni borrarlo desde el sitio.
create policy "resultados_test_nivel: cualquiera inserta" on public.resultados_test_nivel
  for insert
  to anon, authenticated
  with check (true);

-- Solo el fundador lee los resultados.
create policy "resultados_test_nivel: fundador lee" on public.resultados_test_nivel
  for select
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');
