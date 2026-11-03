-- Dashes de SimHub de Contenido Exclusivo (V35B, A36TC, C208, Arrow, Seneca).
-- Ejecutar en Supabase Dashboard -> SQL Editor.
--
-- Bucket privado: los .zip no tienen URL pública. La página /premium/simhub pide un
-- enlace firmado de 60 s, y Storage solo lo da a quien tiene un pago completado
-- (o al fundador, para probar). El fundador sube los archivos desde
-- Dashboard -> Storage -> simhub-exclusivo, que no pasa por estas políticas.

insert into storage.buckets (id, name, public, file_size_limit)
values ('simhub-exclusivo', 'simhub-exclusivo', false, 20971520)
on conflict (id) do nothing;

-- pagos ya deja a cada cadete leer solo sus filas, así que esta consulta solo ve las suyas.
create policy "simhub exclusivo: quien pagó descarga" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'simhub-exclusivo'
    and (
      exists (select 1 from public.pagos where user_id = auth.uid() and estado = 'completado')
      or auth.jwt() ->> 'email' = 'villanuevaaviation@gmail.com'
    )
  );
