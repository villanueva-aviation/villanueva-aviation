-- De qué publicación llega la gente a la ruta "Listo para volar en red" (?ref=fb-ruta, ig-ruta…).
-- 1) visitas_ruta_red: una fila anónima por visita (una por sesión del navegador), sin nombre,
--    correo, IP ni cuenta; igual que resultados_test_nivel.
-- 2) pruebas_red.fuente: con qué enlace llegó quien pagó la prueba.
-- Ejecutar en Supabase Dashboard -> SQL Editor (después de 0019).

create table if not exists public.visitas_ruta_red (
  id uuid primary key default gen_random_uuid(),
  fuente text check (fuente is null or fuente ~ '^[a-z0-9_-]{1,40}$'),
  pagina text not null check (pagina ~ '^[a-z0-9-]{1,40}$'),
  created_at timestamptz not null default now()
);

create index if not exists visitas_ruta_red_fecha_idx on public.visitas_ruta_red(created_at);

alter table public.visitas_ruta_red enable row level security;

drop policy if exists "visitas_ruta_red: cualquiera inserta" on public.visitas_ruta_red;
create policy "visitas_ruta_red: cualquiera inserta" on public.visitas_ruta_red
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "visitas_ruta_red: fundador lee" on public.visitas_ruta_red;
create policy "visitas_ruta_red: fundador lee" on public.visitas_ruta_red
  for select
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

alter table public.pruebas_red
  add column if not exists fuente text check (fuente is null or fuente ~ '^[a-z0-9_-]{1,40}$');
