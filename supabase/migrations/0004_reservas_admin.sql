-- Permite al fundador ver y actualizar el estado de TODAS las filas de
-- "reservas" (solicitudes de Agenda con el fundador y proyectos finales
-- enviados desde Academia), no solo las suyas. La tabla y sus policies de
-- "leer/insertar propio" ya existen (creadas antes desde el dashboard);
-- esto solo agrega las policies del panel de admin.
-- Ejecutar en Supabase Dashboard -> SQL Editor.

create policy "reservas: fundador lee todo" on public.reservas
  for select
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');

create policy "reservas: fundador actualiza estado" on public.reservas
  for update
  using (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com')
  with check (auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com');
