-- Lista de correos para avisos (clases, eventos, guías nuevas). Cualquiera puede
-- suscribirse desde el sitio; solo el fundador puede leer la lista.
-- Ejecutar en Supabase Dashboard -> SQL Editor.

create table if not exists public.suscriptores (
  email text primary key check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  origen text,
  created_at timestamptz not null default now()
);

alter table public.suscriptores enable row level security;

-- Insertar sin cuenta (anon) o con cuenta. Sin update/delete: nadie edita la lista desde el sitio.
create policy "suscriptores: cualquiera se suscribe" on public.suscriptores
  for insert
  to anon, authenticated
  with check (true);

-- El fundador puede leer (y exportar) la lista.
create policy "suscriptores: fundador lee todo" on public.suscriptores
  for select
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');
