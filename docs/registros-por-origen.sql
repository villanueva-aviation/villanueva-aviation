-- Registros por origen (?ref= del enlace del Reel o la publicación), desde que se empezó a medir (26-nov-2026).
-- Correr en Supabase -> SQL Editor. Solo lee; no cambia nada.
-- Las cuentas de Erik son anteriores al 26-nov, así que el filtro de fecha ya las deja fuera.
select
  coalesce(u.raw_user_meta_data ->> 'ref', '(sin ref)') as origen,
  count(*) as registros,
  count(a.user_id) filter (where a.completadas <> '{}'::jsonb) as empezaron_academia
from auth.users u
left join academia_progreso a on a.user_id = u.id
where u.created_at >= '2026-11-26 00:00-06'
group by 1
order by registros desc;
