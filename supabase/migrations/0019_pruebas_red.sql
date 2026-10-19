-- Prueba en red pagada ("¿Listo para la red?"): cada compra es un BLOQUE de hasta
-- 3 intentos en vivo con el fundador, con vencimiento. Tablas APARTE de "pagos" y
-- "pagos_sesiones": una prueba pagada NO desbloquea Contenido Exclusivo.
-- Ejecutar en Supabase Dashboard -> SQL Editor.
--
-- pruebas_red: la escribe la Edge Function de PayPal (service_role) y el fundador
-- (bloque sin pago para quien compró el paquete de 4 asesorías, y "reembolsada").
-- intentos_prueba_red: el cadete agenda y cancela los suyos; el fundador hace todo
-- lo demás (confirmar, calificar). Los triggers impiden que el navegador se salte
-- las reglas del bloque aunque mande datos a mano.

-- ---------------------------------------------------------------------------
-- Bloques pagados
-- ---------------------------------------------------------------------------
create table if not exists public.pruebas_red (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  etapa smallint not null check (etapa in (1, 2)),
  bloque smallint not null check (bloque >= 1),
  proveedor text not null default 'paypal',
  paypal_order_id text not null unique,
  monto numeric not null,
  moneda text not null default 'USD',
  estado text not null default 'activa' check (estado in ('activa', 'reembolsada')),
  pagado_at timestamptz not null default now(),
  vence_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists pruebas_red_user_id_idx on public.pruebas_red(user_id);

alter table public.pruebas_red enable row level security;

drop policy if exists "pruebas_red: leer propio" on public.pruebas_red;
create policy "pruebas_red: leer propio" on public.pruebas_red
  for select
  using (auth.uid() = user_id);

drop policy if exists "pruebas_red: fundador lee todo" on public.pruebas_red;
create policy "pruebas_red: fundador lee todo" on public.pruebas_red
  for select
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

-- El fundador regala un bloque (paquete de 4 asesorías) con un paypal_order_id
-- propio, p. ej. 'paquete-4-<fecha>', porque la columna es única y obligatoria.
drop policy if exists "pruebas_red: fundador inserta" on public.pruebas_red;
create policy "pruebas_red: fundador inserta" on public.pruebas_red
  for insert
  with check (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

drop policy if exists "pruebas_red: fundador actualiza" on public.pruebas_red;
create policy "pruebas_red: fundador actualiza" on public.pruebas_red
  for update
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com')
  with check (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

-- Sin más policies: el cadete no inserta, edita ni borra bloques; solo la
-- service_role de la Edge Function (que se salta RLS) crea los pagados.

-- ---------------------------------------------------------------------------
-- Intentos de cada bloque
-- ---------------------------------------------------------------------------
create table if not exists public.intentos_prueba_red (
  id uuid primary key default gen_random_uuid(),
  prueba_id uuid not null references public.pruebas_red(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  numero smallint not null check (numero >= 1),
  fecha date not null,
  -- Hora de México (UTC-6 fijo), en punto: '08:00', '19:00'...
  horario text not null check (horario ~ '^([01][0-9]|2[0-3]):00$'),
  partes text[] not null check (
    cardinality(partes) between 1 and 4
    and partes <@ array['autorizacion', 'salida', 'ruta_llegada', 'aproximacion']::text[]
  ),
  enlace_seguimiento text not null,
  estado text not null default 'pendiente' check (estado in (
    'pendiente', 'confirmado', 'realizado', 'no_se_presento', 'cancelado', 'cancelado_tarde'
  )),
  aprobadas text[] not null default '{}',
  criterio_fallado text,
  notas text,
  created_at timestamptz not null default now(),
  unique (prueba_id, numero),
  check (aprobadas <@ partes)
);

create index if not exists intentos_prueba_red_user_id_idx on public.intentos_prueba_red(user_id);
create index if not exists intentos_prueba_red_prueba_id_idx on public.intentos_prueba_red(prueba_id);

-- Un solo intento abierto por bloque (respaldo del trigger ante dos pestañas a la vez).
create unique index if not exists intentos_prueba_red_uno_abierto
  on public.intentos_prueba_red(prueba_id)
  where estado in ('pendiente', 'confirmado');

alter table public.intentos_prueba_red enable row level security;

drop policy if exists "intentos_prueba_red: leer propio" on public.intentos_prueba_red;
create policy "intentos_prueba_red: leer propio" on public.intentos_prueba_red
  for select
  using (auth.uid() = user_id);

drop policy if exists "intentos_prueba_red: fundador lee todo" on public.intentos_prueba_red;
create policy "intentos_prueba_red: fundador lee todo" on public.intentos_prueba_red
  for select
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

drop policy if exists "intentos_prueba_red: agendar propio" on public.intentos_prueba_red;
create policy "intentos_prueba_red: agendar propio" on public.intentos_prueba_red
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.pruebas_red p
      where p.id = prueba_id
        and p.user_id = auth.uid()
        and p.estado = 'activa'
        and p.vence_at > now()
    )
  );

-- El cadete solo cancela un intento abierto; el trigger de abajo revisa que no
-- toque ninguna otra columna y que no esquive la cancelación tardía.
drop policy if exists "intentos_prueba_red: cancelar propio" on public.intentos_prueba_red;
create policy "intentos_prueba_red: cancelar propio" on public.intentos_prueba_red
  for update
  using (auth.uid() = user_id and estado in ('pendiente', 'confirmado'))
  with check (auth.uid() = user_id and estado in ('cancelado', 'cancelado_tarde'));

drop policy if exists "intentos_prueba_red: fundador actualiza" on public.intentos_prueba_red;
create policy "intentos_prueba_red: fundador actualiza" on public.intentos_prueba_red
  for update
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com')
  with check (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

-- Sin policy de delete: nadie borra intentos desde el sitio.

-- ---------------------------------------------------------------------------
-- Trigger al agendar (patrón de 0017)
-- ---------------------------------------------------------------------------
-- Las reglas aplican a cadetes con sesión (rol 'authenticated' que no es el
-- fundador). El fundador, la service_role y el SQL Editor pasan sin revisión.
-- security definer: necesita bloquear la fila de pruebas_red (FOR UPDATE), y el
-- cadete no tiene policy de update ahí.
create or replace function public.intentos_prueba_red_al_agendar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.pruebas_red%rowtype;
  total integer;
  usados integer;
begin
  -- Bloquea el bloque para que dos solicitudes simultáneas se cuenten en orden.
  select * into p from public.pruebas_red where id = new.prueba_id for update;
  if not found then
    raise exception 'La prueba no existe.';
  end if;

  select count(*),
         count(*) filter (where estado in ('realizado', 'no_se_presento', 'cancelado_tarde'))
    into total, usados
    from public.intentos_prueba_red
   where prueba_id = new.prueba_id;

  if coalesce(auth.jwt() ->> 'role', '') = 'authenticated'
     and coalesce(auth.jwt() ->> 'email', '') <> 'villanuevaaviation@gmail.com' then
    if new.user_id is distinct from auth.uid() or p.user_id is distinct from auth.uid() then
      raise exception 'Este bloque no es tuyo.';
    end if;
    if p.estado <> 'activa' then
      raise exception 'Este bloque ya no está activo.';
    end if;
    if p.vence_at <= now() then
      raise exception 'Este bloque ya venció.';
    end if;
    if usados >= 3 then
      raise exception 'Ya usaste los 3 intentos de este bloque.';
    end if;
    if exists (
      select 1 from public.intentos_prueba_red
       where prueba_id = new.prueba_id and estado in ('pendiente', 'confirmado')
    ) then
      raise exception 'Ya tienes un intento agendado en este bloque.';
    end if;

    new.numero := total + 1;
    new.estado := 'pendiente';
    new.aprobadas := '{}';
    new.criterio_fallado := null;
    new.notas := null;
  else
    new.numero := coalesce(new.numero, total + 1);
  end if;
  return new;
end;
$$;

drop trigger if exists intentos_prueba_red_al_agendar on public.intentos_prueba_red;
create trigger intentos_prueba_red_al_agendar
  before insert on public.intentos_prueba_red
  for each row execute function public.intentos_prueba_red_al_agendar();

-- ---------------------------------------------------------------------------
-- Trigger al cancelar
-- ---------------------------------------------------------------------------
-- El cadete solo cambia "estado" de pendiente/confirmado a cancelado o
-- cancelado_tarde. Si faltan menos de 24 h para la cita, "cancelado" se rechaza:
-- tiene que ser "cancelado_tarde" (y el intento cuenta).
create or replace function public.intentos_prueba_red_al_cancelar()
returns trigger
language plpgsql
as $$
declare
  cita timestamptz;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'authenticated'
     or coalesce(auth.jwt() ->> 'email', '') = 'villanuevaaviation@gmail.com' then
    return new;
  end if;

  if (to_jsonb(new) - 'estado') is distinct from (to_jsonb(old) - 'estado') then
    raise exception 'Solo puedes cambiar el estado del intento.';
  end if;
  if old.estado not in ('pendiente', 'confirmado')
     or new.estado not in ('cancelado', 'cancelado_tarde') then
    raise exception 'Solo puedes cancelar un intento pendiente o confirmado.';
  end if;

  -- fecha + horario es hora de México (UTC-6 fijo): se lee como UTC y se suman 6 h.
  cita := ((old.fecha + old.horario::time) at time zone 'UTC') + interval '6 hours';
  if new.estado = 'cancelado' and cita - now() < interval '24 hours' then
    raise exception 'Faltan menos de 24 horas: la cancelación cuenta como intento.';
  end if;
  return new;
end;
$$;

drop trigger if exists intentos_prueba_red_al_cancelar on public.intentos_prueba_red;
create trigger intentos_prueba_red_al_cancelar
  before update on public.intentos_prueba_red
  for each row execute function public.intentos_prueba_red_al_cancelar();
