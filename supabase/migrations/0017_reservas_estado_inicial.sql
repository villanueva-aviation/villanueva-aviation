-- Toda solicitud nueva en "reservas" nace como "pendiente", sin importar lo que
-- mande el navegador. Así nadie puede crear su vuelo práctico de insignia (o
-- una cita, o un proyecto final) ya marcado como "completada" o "confirmada":
-- solo el fundador cambia el estado desde su panel.
-- Ejecutar en Supabase Dashboard -> SQL Editor.

create or replace function public.reservas_estado_inicial()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.jwt() ->> 'email', '') <> 'villanuevaaviation@gmail.com' then
    new.estado := 'pendiente';
    new.motivo_revision := null;
  end if;
  return new;
end;
$$;

drop trigger if exists reservas_estado_inicial on public.reservas;
create trigger reservas_estado_inicial
  before insert on public.reservas
  for each row execute function public.reservas_estado_inicial();
