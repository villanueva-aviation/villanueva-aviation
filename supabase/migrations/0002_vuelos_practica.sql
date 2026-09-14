-- Bitácora de práctica de vuelo: cada maniobra que un cadete marca como
-- dominada en /premium/practica-de-vuelo genera una fila aquí con
-- estado="pendiente". Solo el fundador (por correo) puede confirmarla;
-- una vez confirmada, sus horas cuentan en el perfil del cadete.
-- Ejecutar en Supabase Dashboard -> SQL Editor.

create table if not exists public.vuelos_practica (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  maniobra_id text not null,
  maniobra_titulo text not null,
  fecha date not null,
  matricula text,
  tiempo numeric not null check (tiempo > 0),
  notas text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'confirmado')),
  created_at timestamptz not null default now(),
  confirmado_at timestamptz
);

create index if not exists vuelos_practica_user_id_idx on public.vuelos_practica(user_id);
create index if not exists vuelos_practica_estado_idx on public.vuelos_practica(estado);

alter table public.vuelos_practica enable row level security;

-- Un cadete solo puede registrar vuelos a su propio nombre.
create policy "vuelos_practica: insertar propio" on public.vuelos_practica
  for insert
  with check (auth.uid() = user_id);

-- Un cadete puede ver sus propias filas.
create policy "vuelos_practica: leer propio" on public.vuelos_practica
  for select
  using (auth.uid() = user_id);

-- El fundador puede ver todas las filas de todos los cadetes, para revisarlas.
create policy "vuelos_practica: fundador lee todo" on public.vuelos_practica
  for select
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

-- Solo el fundador puede confirmar (nadie más tiene policy de update, así
-- que un cadete nunca puede marcar su propio vuelo como confirmado).
create policy "vuelos_practica: fundador confirma" on public.vuelos_practica
  for update
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com')
  with check (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');
