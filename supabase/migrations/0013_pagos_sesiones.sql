-- Pagos de las sesiones 1 a 1 adicionales con el fundador ($15.99 USD por hora).
-- Tabla APARTE de "pagos" a propósito: "pagos" desbloquea Contenido Exclusivo
-- (vista cadete_acceso), y una sesión pagada NO debe desbloquear el paquete.
-- Ejecutar en Supabase Dashboard -> SQL Editor.
--
-- Igual que en "pagos", solo la Edge Function (service_role) escribe aquí;
-- el navegador únicamente lee sus propias filas.

create table if not exists public.pagos_sesiones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  reserva_id uuid not null references public.reservas(id) on delete cascade,
  proveedor text not null default 'paypal',
  paypal_order_id text not null unique,
  monto numeric not null,
  moneda text not null default 'USD',
  estado text not null default 'completado' check (estado in ('completado', 'reembolsado')),
  created_at timestamptz not null default now(),
  completado_at timestamptz
);

create index if not exists pagos_sesiones_user_id_idx on public.pagos_sesiones(user_id);
create index if not exists pagos_sesiones_reserva_id_idx on public.pagos_sesiones(reserva_id);

-- Una sesión se paga una sola vez: evita el cobro duplicado si el cadete
-- vuelve a abrir la página con el botón todavía en pantalla.
create unique index if not exists pagos_sesiones_reserva_unica
  on public.pagos_sesiones(reserva_id)
  where estado = 'completado';

alter table public.pagos_sesiones enable row level security;

create policy "pagos_sesiones: leer propio" on public.pagos_sesiones
  for select
  using (auth.uid() = user_id);

create policy "pagos_sesiones: fundador lee todo" on public.pagos_sesiones
  for select
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

-- Sin policies de insert/update/delete: el cliente queda bloqueado por el
-- default-deny de RLS y solo la service_role de la Edge Function escribe.
