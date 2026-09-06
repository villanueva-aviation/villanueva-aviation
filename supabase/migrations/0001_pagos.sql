-- Tabla de pagos para desbloquear Contenido Exclusivo (pago único, sin vencimiento).
-- Ejecutar en Supabase Dashboard -> SQL Editor.
--
-- Solo la Edge Function de verificación (con la service_role key) puede insertar
-- o marcar un pago como completado. El cliente nunca puede escribir su propio
-- estado="completado" -- solo puede leer su propia fila.

create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  proveedor text not null default 'paypal',
  paypal_order_id text not null unique,
  monto numeric not null,
  moneda text not null default 'USD',
  estado text not null default 'pendiente' check (estado in ('pendiente', 'completado', 'fallido')),
  created_at timestamptz not null default now(),
  completado_at timestamptz
);

create index if not exists pagos_user_id_idx on public.pagos(user_id);

alter table public.pagos enable row level security;

-- Cada cadete puede ver solo sus propios pagos.
create policy "pagos: leer propio" on public.pagos
  for select
  using (auth.uid() = user_id);

-- Nadie puede insertar ni actualizar desde el cliente (anon/authenticated).
-- Solo la service_role key (usada exclusivamente por la Edge Function) puede
-- escribir, porque service_role no pasa por RLS.
-- No se crean policies de insert/update/delete a propósito: sin policy,
-- authenticated/anon quedan bloqueados por default-deny de RLS.

-- Helper opcional: vista para consultar rápido si un cadete tiene acceso pagado.
create or replace view public.cadete_acceso as
select user_id, true as tiene_acceso, max(completado_at) as pagado_desde
from public.pagos
where estado = 'completado'
group by user_id;
