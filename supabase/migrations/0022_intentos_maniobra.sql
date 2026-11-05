-- Intentos de maniobra del instructor virtual (empieza con el viraje escarpado del C172).
-- Ejecutar en Supabase Dashboard -> SQL Editor.
--
-- La pagina califica en el navegador y guarda cada intento aqui. El cadete solo
-- puede crear los suyos sin mandar y, si es un checkride aprobado, mandarlo a
-- revision. El fundador revisa (aprobado / no_aprobado) y con eso sale la insignia.
-- La calificacion la calcula el navegador: el fundador la revisa en
-- /admin/maniobras antes de aprobar, por eso la insignia depende de el.

create table if not exists public.intentos_maniobra (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  maniobra text not null check (char_length(maniobra) between 1 and 60),
  avion text not null check (char_length(avion) between 1 and 20),
  modo text not null check (modo in ('practica', 'checkride')),
  calificacion smallint not null check (calificacion between 0 and 100),
  aprobado boolean not null,
  elementos jsonb not null,
  -- Resultado sin muestras crudas, con series reducidas: unos 60 KB como maximo.
  detalle jsonb not null check (octet_length(detalle::text) < 200000),
  revision text not null default 'sin_mandar'
    check (revision in ('sin_mandar', 'mandado', 'aprobado', 'no_aprobado')),
  revisado_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists intentos_maniobra_user_id_idx on public.intentos_maniobra(user_id);
create index if not exists intentos_maniobra_mandados_idx on public.intentos_maniobra(created_at)
  where revision = 'mandado';

alter table public.intentos_maniobra enable row level security;

drop policy if exists "intentos_maniobra: leer propio" on public.intentos_maniobra;
create policy "intentos_maniobra: leer propio" on public.intentos_maniobra
  for select
  using (auth.uid() = user_id);

drop policy if exists "intentos_maniobra: fundador lee todo" on public.intentos_maniobra;
create policy "intentos_maniobra: fundador lee todo" on public.intentos_maniobra
  for select
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

drop policy if exists "intentos_maniobra: guardar propio" on public.intentos_maniobra;
create policy "intentos_maniobra: guardar propio" on public.intentos_maniobra
  for insert
  with check (auth.uid() = user_id and revision = 'sin_mandar' and revisado_at is null);

-- El cadete solo pasa un checkride aprobado de sin_mandar a mandado; el trigger
-- de abajo revisa que no toque ninguna otra columna.
drop policy if exists "intentos_maniobra: mandar propio" on public.intentos_maniobra;
create policy "intentos_maniobra: mandar propio" on public.intentos_maniobra
  for update
  using (auth.uid() = user_id and revision = 'sin_mandar' and modo = 'checkride' and aprobado)
  with check (auth.uid() = user_id and revision = 'mandado');

drop policy if exists "intentos_maniobra: fundador actualiza" on public.intentos_maniobra;
create policy "intentos_maniobra: fundador actualiza" on public.intentos_maniobra
  for update
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com')
  with check (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

-- Sin policy de delete: nadie borra intentos desde el sitio.

-- ---------------------------------------------------------------------------
-- Trigger al actualizar (estilo del de cancelar en 0019)
-- ---------------------------------------------------------------------------
create or replace function public.intentos_maniobra_al_actualizar()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') = 'authenticated'
     and coalesce(auth.jwt() ->> 'email', '') <> 'villanuevaaviation@gmail.com' then
    if (to_jsonb(new) - 'revision') is distinct from (to_jsonb(old) - 'revision') then
      raise exception 'Solo puedes mandar el intento a revision.';
    end if;
    if old.revision <> 'sin_mandar' or new.revision <> 'mandado'
       or old.modo <> 'checkride' or not old.aprobado then
      raise exception 'Solo se manda un checkride aprobado que no hayas mandado.';
    end if;
    return new;
  end if;

  if new.revision in ('aprobado', 'no_aprobado') and new.revision is distinct from old.revision then
    new.revisado_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists intentos_maniobra_al_actualizar on public.intentos_maniobra;
create trigger intentos_maniobra_al_actualizar
  before update on public.intentos_maniobra
  for each row execute function public.intentos_maniobra_al_actualizar();
