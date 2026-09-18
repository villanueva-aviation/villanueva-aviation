-- Buzón de experiencia/sugerencias de cadetes, enviado desde
-- /comparte-tu-experiencia. Solo el fundador puede leerlo.
-- Ejecutar en Supabase Dashboard -> SQL Editor.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  calificacion smallint check (calificacion between 1 and 5),
  lo_que_te_gusto text,
  que_mejorarias text not null,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

-- Un cadete solo puede enviar feedback a su propio nombre.
create policy "feedback: insertar propio" on public.feedback
  for insert
  with check (auth.uid() = user_id);

-- El fundador puede leer todo el feedback enviado.
create policy "feedback: fundador lee todo" on public.feedback
  for select
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');
