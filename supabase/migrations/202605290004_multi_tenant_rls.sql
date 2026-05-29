drop policy if exists usuarios_select_own_or_admin on public.usuarios;
drop policy if exists usuarios_admin_write on public.usuarios;
drop policy if exists empleados_select_admin_self on public.empleados;
drop policy if exists empleados_admin_write on public.empleados;
drop policy if exists clientes_select_scope on public.clientes;
drop policy if exists clientes_admin_write on public.clientes;
drop policy if exists clientes_insert_self_or_admin on public.clientes;
drop policy if exists servicios_select_auth on public.servicios;
drop policy if exists servicios_admin_write on public.servicios;
drop policy if exists horarios_select_auth on public.horarios_empleado;
drop policy if exists horarios_admin_write on public.horarios_empleado;
drop policy if exists bloqueos_select_auth on public.bloqueos_empleado;
drop policy if exists bloqueos_admin_write on public.bloqueos_empleado;
drop policy if exists citas_select_scope on public.citas;
drop policy if exists citas_insert_cliente_or_admin on public.citas;
drop policy if exists citas_update_scope on public.citas;
drop policy if exists turnos_admin_select on public.turnos;
drop policy if exists turnos_admin_write on public.turnos;
drop policy if exists turnos_empleado_insert on public.turnos;
drop policy if exists gastos_admin_all on public.gastos;
drop policy if exists inventario_select_scope on public.inventario;
drop policy if exists inventario_admin_write on public.inventario;
drop policy if exists mov_inventario_admin_all on public.mov_inventario;
drop policy if exists servicio_insumos_select_admin on public.servicio_insumos;
drop policy if exists servicio_insumos_admin_write on public.servicio_insumos;
drop policy if exists cita_historial_select_scope on public.cita_historial;
drop policy if exists cita_historial_admin_insert on public.cita_historial;
drop policy if exists cita_historial_empleado_insert on public.cita_historial;
drop policy if exists cita_historial_cliente_insert on public.cita_historial;

create policy usuarios_select_scope on public.usuarios
for select to authenticated
using (
  public.is_super_admin()
  or id = auth.uid()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy usuarios_admin_write_scope on public.usuarios
for all to authenticated
using (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
)
with check (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy empleados_select_scope on public.empleados
for select to authenticated
using (
  public.is_super_admin()
  or (negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy empleados_admin_write_scope on public.empleados
for all to authenticated
using (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
)
with check (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy clientes_select_scope_tenant on public.clientes
for select to authenticated
using (
  public.is_super_admin()
  or (
    negocio_id = public.own_negocio_id()
    and public.own_negocio_activo()
    and (
      public.is_admin()
      or usuario_id = auth.uid()
      or exists (select 1 from public.citas c where c.cliente_id = clientes.id and c.empleado_id = public.own_empleado_id())
    )
  )
);

create policy clientes_admin_write_scope on public.clientes
for all to authenticated
using (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
)
with check (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy clientes_insert_self_or_admin_scope on public.clientes
for insert to authenticated
with check (
  public.is_super_admin()
  or (
    negocio_id = public.own_negocio_id()
    and public.own_negocio_activo()
    and (public.is_admin() or usuario_id = auth.uid() or usuario_id is null)
  )
);

create policy servicios_select_scope on public.servicios
for select to authenticated
using (
  public.is_super_admin()
  or (negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy servicios_admin_write_scope on public.servicios
for all to authenticated
using (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
)
with check (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy horarios_select_scope on public.horarios_empleado
for select to authenticated
using (
  public.is_super_admin()
  or (negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy horarios_admin_write_scope on public.horarios_empleado
for all to authenticated
using (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
)
with check (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy bloqueos_select_scope on public.bloqueos_empleado
for select to authenticated
using (
  public.is_super_admin()
  or (negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy bloqueos_admin_write_scope on public.bloqueos_empleado
for all to authenticated
using (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
)
with check (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy citas_select_scope_tenant on public.citas
for select to authenticated
using (
  public.is_super_admin()
  or (
    negocio_id = public.own_negocio_id()
    and public.own_negocio_activo()
    and (
      public.is_admin()
      or empleado_id = public.own_empleado_id()
      or cliente_id = public.own_cliente_id()
    )
  )
);

create policy citas_insert_scope on public.citas
for insert to authenticated
with check (
  public.is_super_admin()
  or (
    negocio_id = public.own_negocio_id()
    and public.own_negocio_activo()
    and (public.is_admin() or cliente_id = public.own_cliente_id())
  )
);

create policy citas_update_scope_tenant on public.citas
for update to authenticated
using (
  public.is_super_admin()
  or (
    negocio_id = public.own_negocio_id()
    and public.own_negocio_activo()
    and (
      public.is_admin()
      or empleado_id = public.own_empleado_id()
      or cliente_id = public.own_cliente_id()
    )
  )
)
with check (
  public.is_super_admin()
  or (
    negocio_id = public.own_negocio_id()
    and public.own_negocio_activo()
    and (
      public.is_admin()
      or empleado_id = public.own_empleado_id()
      or cliente_id = public.own_cliente_id()
    )
  )
);

create policy turnos_select_scope on public.turnos
for select to authenticated
using (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy turnos_admin_write_scope on public.turnos
for all to authenticated
using (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
)
with check (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy turnos_empleado_insert_scope on public.turnos
for insert to authenticated
with check (
  public.is_empleado()
  and negocio_id = public.own_negocio_id()
  and public.own_negocio_activo()
  and exists (
    select 1
    from public.citas c
    where c.id = turnos.cita_id
      and c.empleado_id = public.own_empleado_id()
      and c.negocio_id = public.own_negocio_id()
  )
);

create policy gastos_admin_all_scope on public.gastos
for all to authenticated
using (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
)
with check (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy inventario_select_scope_tenant on public.inventario
for select to authenticated
using (
  public.is_super_admin()
  or (
    negocio_id = public.own_negocio_id()
    and public.own_negocio_activo()
    and (
      public.is_admin()
      or (
        visible_cliente = true
        and activo = true
        and stock > 0
      )
    )
  )
);

create policy inventario_admin_write_scope on public.inventario
for all to authenticated
using (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
)
with check (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy mov_inventario_admin_all_scope on public.mov_inventario
for all to authenticated
using (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
)
with check (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy servicio_insumos_select_scope on public.servicio_insumos
for select to authenticated
using (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy servicio_insumos_admin_write_scope on public.servicio_insumos
for all to authenticated
using (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
)
with check (
  public.is_super_admin()
  or (public.is_admin() and negocio_id = public.own_negocio_id() and public.own_negocio_activo())
);

create policy cita_historial_select_scope_tenant on public.cita_historial
for select to authenticated
using (
  public.is_super_admin()
  or (
    negocio_id = public.own_negocio_id()
    and public.own_negocio_activo()
    and (
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
    )
  )
);

create policy cita_historial_insert_scope on public.cita_historial
for insert to authenticated
with check (
  public.is_super_admin()
  or (
    negocio_id = public.own_negocio_id()
    and public.own_negocio_activo()
  )
);
