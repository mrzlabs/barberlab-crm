alter type public.rol_usuario add value if not exists 'super_admin';

create table if not exists public.negocios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  telefono text,
  direccion text,
  logo_url text,
  color_primario text not null default '#111827',
  color_secundario text not null default '#22d3ee',
  color_acento text not null default '#7c3aed',
  fuente text not null default 'Inter',
  plan text not null default 'starter',
  estado text not null default 'activo',
  modo_aislamiento text not null default 'multi_tenant',
  fecha_inicio date not null default current_date,
  fecha_fin date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (estado in ('activo', 'suspendido', 'cancelado')),
  check (plan in ('starter', 'pro', 'enterprise')),
  check (modo_aislamiento in ('multi_tenant', 'dedicado'))
);

insert into public.negocios (nombre, slug, telefono, direccion, plan, estado)
values ('BarberLab Demo', 'barberlab-demo', '3503803010', 'Bogota', 'pro', 'activo')
on conflict (slug) do nothing;

alter table public.usuarios add column if not exists negocio_id uuid references public.negocios(id) on delete restrict;
alter table public.usuarios add column if not exists super_admin boolean not null default false;
alter table public.empleados add column if not exists negocio_id uuid references public.negocios(id) on delete restrict;
alter table public.clientes add column if not exists negocio_id uuid references public.negocios(id) on delete restrict;
alter table public.servicios add column if not exists negocio_id uuid references public.negocios(id) on delete restrict;
alter table public.horarios_empleado add column if not exists negocio_id uuid references public.negocios(id) on delete restrict;
alter table public.bloqueos_empleado add column if not exists negocio_id uuid references public.negocios(id) on delete restrict;
alter table public.citas add column if not exists negocio_id uuid references public.negocios(id) on delete restrict;
alter table public.turnos add column if not exists negocio_id uuid references public.negocios(id) on delete restrict;
alter table public.gastos add column if not exists negocio_id uuid references public.negocios(id) on delete restrict;
alter table public.inventario add column if not exists negocio_id uuid references public.negocios(id) on delete restrict;
alter table public.mov_inventario add column if not exists negocio_id uuid references public.negocios(id) on delete restrict;
alter table public.servicio_insumos add column if not exists negocio_id uuid references public.negocios(id) on delete restrict;
alter table public.cita_historial add column if not exists negocio_id uuid references public.negocios(id) on delete restrict;

update public.usuarios set negocio_id = (select id from public.negocios where slug = 'barberlab-demo') where negocio_id is null;
update public.usuarios set super_admin = true where email = 'admin@mrzlabs.dev';
update public.empleados e set negocio_id = u.negocio_id from public.usuarios u where e.usuario_id = u.id and e.negocio_id is null;
update public.clientes c set negocio_id = coalesce(u.negocio_id, (select id from public.negocios where slug = 'barberlab-demo')) from public.usuarios u where c.usuario_id = u.id and c.negocio_id is null;
update public.clientes set negocio_id = (select id from public.negocios where slug = 'barberlab-demo') where negocio_id is null;
update public.servicios set negocio_id = (select id from public.negocios where slug = 'barberlab-demo') where negocio_id is null;
update public.horarios_empleado h set negocio_id = e.negocio_id from public.empleados e where h.empleado_id = e.id and h.negocio_id is null;
update public.bloqueos_empleado b set negocio_id = e.negocio_id from public.empleados e where b.empleado_id = e.id and b.negocio_id is null;
update public.citas c set negocio_id = e.negocio_id from public.empleados e where c.empleado_id = e.id and c.negocio_id is null;
update public.turnos t set negocio_id = c.negocio_id from public.citas c where t.cita_id = c.id and t.negocio_id is null;
update public.gastos set negocio_id = (select id from public.negocios where slug = 'barberlab-demo') where negocio_id is null;
update public.inventario set negocio_id = (select id from public.negocios where slug = 'barberlab-demo') where negocio_id is null;
update public.mov_inventario m set negocio_id = i.negocio_id from public.inventario i where m.inventario_id = i.id and m.negocio_id is null;
update public.servicio_insumos si set negocio_id = s.negocio_id from public.servicios s where si.servicio_id = s.id and si.negocio_id is null;
update public.cita_historial h set negocio_id = c.negocio_id from public.citas c where h.cita_id = c.id and h.negocio_id is null;

create index if not exists idx_usuarios_negocio on public.usuarios(negocio_id);
create index if not exists idx_empleados_negocio on public.empleados(negocio_id);
create index if not exists idx_clientes_negocio on public.clientes(negocio_id);
create index if not exists idx_servicios_negocio on public.servicios(negocio_id);
create index if not exists idx_citas_negocio_inicio on public.citas(negocio_id, inicio);
create index if not exists idx_turnos_negocio_created on public.turnos(negocio_id, created_at);
create index if not exists idx_inventario_negocio on public.inventario(negocio_id);

create or replace function public.is_super_admin()
returns boolean
language sql
stable
as $$
  select public.jwt_rol() = 'super_admin'
    or exists (
      select 1
      from public.usuarios u
      where u.id = auth.uid()
        and u.super_admin = true
    );
$$;

create or replace function public.own_negocio_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select negocio_id from public.usuarios where id = auth.uid() and activo = true limit 1;
$$;

create or replace function public.own_negocio_activo()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.usuarios u
    join public.negocios n on n.id = u.negocio_id
    where u.id = auth.uid()
      and u.activo = true
      and n.estado = 'activo'
  ) or public.is_super_admin();
$$;

create or replace function public.set_negocio_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.negocio_id is null then
    new.negocio_id = public.own_negocio_id();
  end if;
  return new;
end;
$$;

create or replace function public.set_negocio_from_cita()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.negocio_id is null then
    select negocio_id into new.negocio_id from public.citas where id = new.cita_id;
  end if;
  return new;
end;
$$;

create or replace function public.set_negocio_from_empleado()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.negocio_id is null then
    select negocio_id into new.negocio_id from public.empleados where id = new.empleado_id;
  end if;
  return new;
end;
$$;

create or replace function public.set_negocio_from_inventario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.negocio_id is null then
    select negocio_id into new.negocio_id from public.inventario where id = new.inventario_id;
  end if;
  return new;
end;
$$;

create or replace function public.set_negocio_from_servicio()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.negocio_id is null then
    select negocio_id into new.negocio_id from public.servicios where id = new.servicio_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_clientes_set_negocio on public.clientes;
create trigger trg_clientes_set_negocio before insert on public.clientes for each row execute function public.set_negocio_from_auth();
drop trigger if exists trg_servicios_set_negocio on public.servicios;
create trigger trg_servicios_set_negocio before insert on public.servicios for each row execute function public.set_negocio_from_auth();
drop trigger if exists trg_gastos_set_negocio on public.gastos;
create trigger trg_gastos_set_negocio before insert on public.gastos for each row execute function public.set_negocio_from_auth();
drop trigger if exists trg_inventario_set_negocio on public.inventario;
create trigger trg_inventario_set_negocio before insert on public.inventario for each row execute function public.set_negocio_from_auth();
drop trigger if exists trg_horarios_set_negocio on public.horarios_empleado;
create trigger trg_horarios_set_negocio before insert on public.horarios_empleado for each row execute function public.set_negocio_from_empleado();
drop trigger if exists trg_bloqueos_set_negocio on public.bloqueos_empleado;
create trigger trg_bloqueos_set_negocio before insert on public.bloqueos_empleado for each row execute function public.set_negocio_from_empleado();
drop trigger if exists trg_citas_set_negocio on public.citas;
create trigger trg_citas_set_negocio before insert on public.citas for each row execute function public.set_negocio_from_empleado();
drop trigger if exists trg_turnos_set_negocio on public.turnos;
create trigger trg_turnos_set_negocio before insert on public.turnos for each row execute function public.set_negocio_from_cita();
drop trigger if exists trg_mov_set_negocio on public.mov_inventario;
create trigger trg_mov_set_negocio before insert on public.mov_inventario for each row execute function public.set_negocio_from_inventario();
drop trigger if exists trg_servicio_insumos_set_negocio on public.servicio_insumos;
create trigger trg_servicio_insumos_set_negocio before insert on public.servicio_insumos for each row execute function public.set_negocio_from_servicio();
drop trigger if exists trg_cita_historial_set_negocio on public.cita_historial;
create trigger trg_cita_historial_set_negocio before insert on public.cita_historial for each row execute function public.set_negocio_from_cita();

create trigger trg_negocios_updated_at before update on public.negocios for each row execute function public.set_updated_at();

alter table public.negocios enable row level security;

create policy negocios_select_scope on public.negocios
for select to authenticated
using (public.is_super_admin() or id = public.own_negocio_id());

create policy negocios_super_admin_write on public.negocios
for all to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());
