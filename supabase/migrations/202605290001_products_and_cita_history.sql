alter table public.inventario
  add column if not exists precio_venta numeric(12,2) not null default 0 check (precio_venta >= 0),
  add column if not exists visible_cliente boolean not null default false;

create table if not exists public.cita_historial (
  id uuid primary key default gen_random_uuid(),
  cita_id uuid not null references public.citas(id) on delete cascade,
  actor_id uuid references public.usuarios(id) on delete set null,
  actor_rol public.rol_usuario,
  estado_anterior public.estado_cita,
  estado_nuevo public.estado_cita,
  accion text not null,
  detalle text,
  created_at timestamptz not null default now()
);

create index if not exists idx_inventario_visible_cliente on public.inventario(visible_cliente, activo);
create index if not exists idx_cita_historial_cita on public.cita_historial(cita_id, created_at desc);

alter table public.cita_historial enable row level security;

create policy cita_historial_select_scope on public.cita_historial
for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.citas c
    where c.id = cita_historial.cita_id
      and (
        c.empleado_id = public.own_empleado_id()
        or c.cliente_id = public.own_cliente_id()
      )
  )
);

create policy cita_historial_admin_insert on public.cita_historial
for insert to authenticated
with check (public.is_admin());

create policy cita_historial_empleado_insert on public.cita_historial
for insert to authenticated
with check (
  public.is_empleado()
  and exists (
    select 1
    from public.citas c
    where c.id = cita_historial.cita_id
      and c.empleado_id = public.own_empleado_id()
  )
);

create policy cita_historial_cliente_insert on public.cita_historial
for insert to authenticated
with check (
  public.is_cliente()
  and exists (
    select 1
    from public.citas c
    where c.id = cita_historial.cita_id
      and c.cliente_id = public.own_cliente_id()
  )
);

drop policy if exists inventario_admin_all on public.inventario;

create policy inventario_select_scope on public.inventario
for select to authenticated
using (
  public.is_admin()
  or (
    visible_cliente = true
    and activo = true
    and stock > 0
  )
);

create policy inventario_admin_write on public.inventario
for all to authenticated
using (public.is_admin())
with check (public.is_admin());
