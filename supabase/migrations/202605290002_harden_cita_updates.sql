create or replace function public.enforce_empleado_cita_update()
returns trigger
language plpgsql
as $$
begin
  if public.jwt_rol() = 'empleado' then
    if old.empleado_id <> public.own_empleado_id() then
      raise exception 'Cita no pertenece al empleado autenticado';
    end if;
    if new.id <> old.id
      or new.cliente_id <> old.cliente_id
      or new.empleado_id <> old.empleado_id
      or new.servicio_id <> old.servicio_id
      or new.inicio <> old.inicio
      or new.fin <> old.fin
      or new.estado not in ('confirmada', 'cancelada', 'no_asistio')
    then
      raise exception 'Empleado solo puede confirmar, cancelar o marcar no asistencia';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.enforce_cliente_cita_update()
returns trigger
language plpgsql
as $$
begin
  if public.jwt_rol() = 'cliente' then
    if old.cliente_id <> public.own_cliente_id() then
      raise exception 'Cita no pertenece al cliente autenticado';
    end if;
    if new.id <> old.id
      or new.cliente_id <> old.cliente_id
      or new.estado not in ('reservada', 'cancelada')
      or old.estado in ('realizada', 'cancelada', 'no_asistio')
    then
      raise exception 'Cliente solo puede reprogramar o cancelar citas activas';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_cliente_cita_update on public.citas;
create trigger trg_enforce_cliente_cita_update
before update on public.citas
for each row execute function public.enforce_cliente_cita_update();
