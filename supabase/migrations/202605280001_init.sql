-- CRM  Barberia y Peluqueria
-- Fase 1: schema, RLS, funciones y triggers base

create extension if not exists pgcrypto;

create type public.rol_usuario as enum ('admin', 'empleado', 'cliente');
create type public.especialidad_empleado as enum ('barberia', 'peluqueria', 'spa_unas', 'tatuajes');
create type public.categoria_servicio as enum ('barberia', 'peluqueria', 'spa_unas', 'tatuajes');
create type public.estado_cita as enum ('reservada', 'confirmada', 'realizada', 'cancelada', 'no_asistio');
create type public.metodo_pago as enum ('efectivo', 'transferencia', 'tarjeta');
create type public.categoria_gasto as enum ('arriendo', 'servicios_publicos', 'nomina', 'insumos', 'marketing', 'otros');
create type public.tipo_mov_inventario as enum ('entrada', 'salida', 'ajuste');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.jwt_rol()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'rol', auth.jwt() -> 'user_metadata' ->> 'rol');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.jwt_rol() = 'admin';
$$;

create or replace function public.is_empleado()
returns boolean
language sql
stable
as $$
  select public.jwt_rol() = 'empleado';
$$;

create or replace function public.is_cliente()
returns boolean
language sql
stable
as $$
  select public.jwt_rol() = 'cliente';
$$;

create table public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  rol public.rol_usuario not null,
  nombre text not null,
  telefono text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.empleados (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references public.usuarios(id) on delete cascade,
  especialidad public.especialidad_empleado not null,
  comision_pct numeric(5,2) not null default 0 check (comision_pct >= 0 and comision_pct <= 100),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid unique references public.usuarios(id) on delete set null,
  nombre text not null,
  telefono text not null,
  email text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.servicios (
  id uuid primary key default gen_random_uuid(),
  categoria public.categoria_servicio not null,
  nombre text not null,
  duracion_min integer not null check (duracion_min > 0),
  precio numeric(12,2) not null check (precio >= 0),
  costo_insumo numeric(12,2) not null default 0 check (costo_insumo >= 0),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.horarios_empleado (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid not null references public.empleados(id) on delete cascade,
  dia_semana integer not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fin time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (hora_fin > hora_inicio)
);

create table public.bloqueos_empleado (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid not null references public.empleados(id) on delete cascade,
  fecha_inicio timestamptz not null,
  fecha_fin timestamptz not null,
  motivo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (fecha_fin > fecha_inicio)
);

create table public.citas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  empleado_id uuid not null references public.empleados(id) on delete restrict,
  servicio_id uuid not null references public.servicios(id) on delete restrict,
  inicio timestamptz not null,
  fin timestamptz not null,
  estado public.estado_cita not null default 'reservada',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (fin > inicio)
);

create table public.turnos (
  id uuid primary key default gen_random_uuid(),
  cita_id uuid not null unique references public.citas(id) on delete restrict,
  precio_final numeric(12,2) not null check (precio_final >= 0),
  propina numeric(12,2) not null default 0 check (propina >= 0),
  metodo_pago public.metodo_pago not null,
  descuento numeric(12,2) not null default 0 check (descuento >= 0),
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gastos (
  id uuid primary key default gen_random_uuid(),
  categoria public.categoria_gasto not null,
  monto numeric(12,2) not null check (monto >= 0),
  fecha date not null,
  descripcion text,
  comprobante_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventario (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  nombre text not null,
  categoria text not null,
  unidad text not null,
  stock numeric(12,2) not null default 0,
  costo_unitario numeric(12,2) not null default 0 check (costo_unitario >= 0),
  stock_minimo numeric(12,2) not null default 0 check (stock_minimo >= 0),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mov_inventario (
  id uuid primary key default gen_random_uuid(),
  inventario_id uuid not null references public.inventario(id) on delete restrict,
  tipo public.tipo_mov_inventario not null,
  cantidad numeric(12,2) not null check (cantidad > 0),
  motivo text not null,
  cita_id uuid references public.citas(id) on delete set null,
  fecha timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.servicio_insumos (
  id uuid primary key default gen_random_uuid(),
  servicio_id uuid not null references public.servicios(id) on delete cascade,
  inventario_id uuid not null references public.inventario(id) on delete restrict,
  cantidad numeric(12,2) not null check (cantidad > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (servicio_id, inventario_id)
);

create index idx_empleados_usuario_id on public.empleados(usuario_id);
create index idx_clientes_usuario_id on public.clientes(usuario_id);
create index idx_servicios_categoria on public.servicios(categoria);
create index idx_horarios_empleado_dia on public.horarios_empleado(empleado_id, dia_semana);
create index idx_bloqueos_empleado_rango on public.bloqueos_empleado(empleado_id, fecha_inicio, fecha_fin);
create index idx_citas_empleado_inicio on public.citas(empleado_id, inicio);
create index idx_citas_cliente_inicio on public.citas(cliente_id, inicio);
create index idx_citas_estado on public.citas(estado);
create index idx_turnos_created_at on public.turnos(created_at);
create index idx_gastos_fecha on public.gastos(fecha);
create index idx_mov_inventario_cita on public.mov_inventario(cita_id);

create trigger trg_usuarios_updated_at before update on public.usuarios for each row execute function public.set_updated_at();
create trigger trg_empleados_updated_at before update on public.empleados for each row execute function public.set_updated_at();
create trigger trg_clientes_updated_at before update on public.clientes for each row execute function public.set_updated_at();
create trigger trg_servicios_updated_at before update on public.servicios for each row execute function public.set_updated_at();
create trigger trg_horarios_updated_at before update on public.horarios_empleado for each row execute function public.set_updated_at();
create trigger trg_bloqueos_updated_at before update on public.bloqueos_empleado for each row execute function public.set_updated_at();
create trigger trg_citas_updated_at before update on public.citas for each row execute function public.set_updated_at();
create trigger trg_turnos_updated_at before update on public.turnos for each row execute function public.set_updated_at();
create trigger trg_gastos_updated_at before update on public.gastos for each row execute function public.set_updated_at();
create trigger trg_inventario_updated_at before update on public.inventario for each row execute function public.set_updated_at();
create trigger trg_mov_inventario_updated_at before update on public.mov_inventario for each row execute function public.set_updated_at();
create trigger trg_servicio_insumos_updated_at before update on public.servicio_insumos for each row execute function public.set_updated_at();

create or replace function public.own_empleado_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.empleados where usuario_id = auth.uid() and activo = true limit 1;
$$;

create or replace function public.own_cliente_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.clientes where usuario_id = auth.uid() limit 1;
$$;

create or replace function public.disponibilidad_empleado(
  p_empleado_id uuid,
  p_fecha date,
  p_servicio_id uuid
)
returns table(inicio timestamptz, fin timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  with servicio as (
    select duracion_min from public.servicios where id = p_servicio_id and activo = true
  ),
  horarios as (
    select
      ((p_fecha + h.hora_inicio) at time zone 'America/Bogota') as inicio_horario,
      ((p_fecha + h.hora_fin) at time zone 'America/Bogota') as fin_horario,
      make_interval(mins => (select duracion_min from servicio)) as duracion
    from public.horarios_empleado h
    where h.empleado_id = p_empleado_id
      and h.dia_semana = extract(dow from p_fecha)::int
  ),
  slots as (
    select
      gs as inicio,
      gs + h.duracion as fin
    from horarios h
    cross join lateral generate_series(
      h.inicio_horario,
      h.fin_horario - h.duracion,
      interval '15 minutes'
    ) as gs
  )
  select s.inicio, s.fin
  from slots s
  where not exists (
    select 1
    from public.bloqueos_empleado b
    where b.empleado_id = p_empleado_id
      and tstzrange(b.fecha_inicio, b.fecha_fin, '[)') && tstzrange(s.inicio, s.fin, '[)')
  )
  and not exists (
    select 1
    from public.citas c
    where c.empleado_id = p_empleado_id
      and c.estado in ('reservada', 'confirmada', 'realizada')
      and tstzrange(c.inicio, c.fin, '[)') && tstzrange(s.inicio, s.fin, '[)')
  )
  order by s.inicio;
$$;

create or replace function public.prevent_cita_overlap()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.citas c
    where c.id <> coalesce(new.id, gen_random_uuid())
      and c.empleado_id = new.empleado_id
      and c.estado in ('reservada', 'confirmada', 'realizada')
      and new.estado in ('reservada', 'confirmada', 'realizada')
      and tstzrange(c.inicio, c.fin, '[)') && tstzrange(new.inicio, new.fin, '[)')
  ) then
    raise exception 'El empleado no tiene disponibilidad en ese horario';
  end if;
  return new;
end;
$$;

create trigger trg_prevent_cita_overlap
before insert or update on public.citas
for each row execute function public.prevent_cita_overlap();

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
      or new.estado not in ('realizada', 'no_asistio')
    then
      raise exception 'Empleado solo puede marcar su cita como realizada o no asistio';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_enforce_empleado_cita_update
before update on public.citas
for each row execute function public.enforce_empleado_cita_update();

create or replace function public.descontar_insumos_turno()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_servicio_id uuid;
  r record;
begin
  select servicio_id into v_servicio_id
  from public.citas
  where id = new.cita_id;

  for r in
    select inventario_id, cantidad
    from public.servicio_insumos
    where servicio_id = v_servicio_id
  loop
    update public.inventario
    set stock = stock - r.cantidad,
        updated_at = now()
    where id = r.inventario_id;

    insert into public.mov_inventario (inventario_id, tipo, cantidad, motivo, cita_id, fecha)
    values (r.inventario_id, 'salida', r.cantidad, 'Consumo automatico por cierre de turno', new.cita_id, now());
  end loop;

  update public.citas
  set estado = 'realizada',
      updated_at = now()
  where id = new.cita_id
    and estado <> 'realizada';

  return new;
end;
$$;

create trigger trg_descontar_insumos_turno
after insert on public.turnos
for each row execute function public.descontar_insumos_turno();

alter table public.usuarios enable row level security;
alter table public.empleados enable row level security;
alter table public.clientes enable row level security;
alter table public.servicios enable row level security;
alter table public.horarios_empleado enable row level security;
alter table public.bloqueos_empleado enable row level security;
alter table public.citas enable row level security;
alter table public.turnos enable row level security;
alter table public.gastos enable row level security;
alter table public.inventario enable row level security;
alter table public.mov_inventario enable row level security;
alter table public.servicio_insumos enable row level security;

create policy usuarios_select_own_or_admin on public.usuarios
for select to authenticated
using (id = auth.uid() or public.is_admin());

create policy usuarios_admin_write on public.usuarios
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy empleados_select_admin_self on public.empleados
for select to authenticated
using (public.is_admin() or usuario_id = auth.uid());

create policy empleados_admin_write on public.empleados
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy clientes_select_scope on public.clientes
for select to authenticated
using (
  public.is_admin()
  or usuario_id = auth.uid()
  or exists (select 1 from public.citas c where c.cliente_id = clientes.id and c.empleado_id = public.own_empleado_id())
);

create policy clientes_admin_write on public.clientes
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy clientes_insert_self_or_admin on public.clientes
for insert to authenticated
with check (public.is_admin() or usuario_id = auth.uid() or usuario_id is null);

create policy servicios_select_auth on public.servicios
for select to authenticated
using (true);

create policy servicios_admin_write on public.servicios
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy horarios_select_auth on public.horarios_empleado
for select to authenticated
using (true);

create policy horarios_admin_write on public.horarios_empleado
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy bloqueos_select_auth on public.bloqueos_empleado
for select to authenticated
using (true);

create policy bloqueos_admin_write on public.bloqueos_empleado
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy citas_select_scope on public.citas
for select to authenticated
using (
  public.is_admin()
  or empleado_id = public.own_empleado_id()
  or cliente_id = public.own_cliente_id()
);

create policy citas_insert_cliente_or_admin on public.citas
for insert to authenticated
with check (
  public.is_admin()
  or cliente_id = public.own_cliente_id()
);

create policy citas_update_scope on public.citas
for update to authenticated
using (
  public.is_admin()
  or empleado_id = public.own_empleado_id()
  or cliente_id = public.own_cliente_id()
)
with check (
  public.is_admin()
  or empleado_id = public.own_empleado_id()
  or cliente_id = public.own_cliente_id()
);

create policy turnos_admin_select on public.turnos
for select to authenticated
using (public.is_admin());

create policy turnos_admin_write on public.turnos
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy turnos_empleado_insert on public.turnos
for insert to authenticated
with check (
  public.is_empleado()
  and exists (
    select 1
    from public.citas c
    where c.id = turnos.cita_id
      and c.empleado_id = public.own_empleado_id()
  )
);

create policy gastos_admin_all on public.gastos
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy inventario_admin_all on public.inventario
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy mov_inventario_admin_all on public.mov_inventario
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy servicio_insumos_select_admin on public.servicio_insumos
for select to authenticated
using (public.is_admin());

create policy servicio_insumos_admin_write on public.servicio_insumos
for all to authenticated
using (public.is_admin())
with check (public.is_admin());
