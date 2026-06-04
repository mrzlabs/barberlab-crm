# Operux CRM
**Gestión inteligente para negocios de estilo y belleza**

![Maylo — Asistente de Operux](public/maylo.png)

Operux es un CRM SaaS multi-tenant para barberías, peluquerías, spas de uñas y tatuajes. Permite tomar decisiones basadas en datos reales para crecer. No es solo una agenda: es el sistema operativo del negocio.

## Qué gestiona Operux

- Agenda y citas por especialista
- Cierre de turnos y control de caja
- Inventario con alertas de stock mínimo
- Comisiones y producción por empleado
- Gastos operacionales por categoría
- Reportes de rentabilidad, margen, utilidad neta y ticket promedio
- Branding personalizado por negocio (colores, fuente, logo)
- WhatsApp automático (confirmación, recordatorio, seguimiento)
- 4 roles: `super_admin`, `admin`, `empleado`, `cliente`

## Modelos de acceso

1. **Suscripción mensual** — el cliente paga mensual, MRZLABS opera y mantiene
2. **Implementación única** — se parametriza el negocio, el cliente opera, soporte pactado
3. **Sin venta de código fuente** — MRZLABS conserva arquitectura, repositorio y know-how

## Tiempos de implementación

- Parametrización inicial (servicios, empleados, horarios, branding): 1-2 días hábiles
- Capacitación de roles (admin, empleado, cliente): 1 sesión de 2 horas
- Primer negocio en producción: 3-5 días hábiles desde firma

## Magic Link

- Acceso sin contraseña para empleados y clientes
- El usuario escribe su correo, recibe un enlace temporal
- Al abrirlo entra directamente con su rol asignado
- No reemplaza el control de rol ni los permisos
- Ideal para clientes que no quieren recordar clave

---

## Arquitectura SaaS hibrida

Modelo recomendado e implementado:

- Planes `starter` y `pro`: una base multi-tenant con aislamiento por `negocio_id`.
- Plan `enterprise`: preparado para aislamiento dedicado por cliente.
- MRZLABS opera como `super_admin`.
- Cada negocio tiene su propio registro en `negocios`.
- Cada tabla operativa queda asociada a `negocio_id`.
- RLS filtra por negocio autenticado.
- Los usuarios se crean asociados al negocio.
- El branding se toma desde `negocios`: logo, colores, fuente, plan y estado.

Panel MRZLABS:

```text
/super-admin/negocios
```

Desde ese panel se registra:

- Negocio.
- Slug.
- Telefono.
- Direccion.
- Logo.
- Colores.
- Fuente.
- Plan.
- Estado de suscripcion.
- Modo de aislamiento.
- Admin inicial del negocio.

## Google Auth

- El login tiene opcion `Ingresar con Google`.
- El boton llama a Supabase OAuth.
- Supabase redirige a Google.
- Google devuelve la sesion a `/auth/callback`.
- Si el usuario ya existe en `usuarios`, entra con su rol asignado.
- Si el usuario no existe, se crea como `cliente` dentro del negocio base `operux-demo`.
- Debe habilitarse Google Provider en Supabase Auth.
- Callback requerido:

```text
https://TU_DOMINIO/auth/callback
http://127.0.0.1:3011/auth/callback
```

Pantalla de espera:

- `app/loading.tsx` controla la espera global.
- Se usa en navegaciones lentas, carga de rutas protegidas y render server.
- Mantiene firma MRZLABS, fondo dinamico y estado visual de modulo.

## Flujo operativo

### Agenda

La agenda es la etapa de planificacion.

Una cita contiene:

- Cliente.
- Empleado.
- Servicio.
- Fecha y hora de inicio.
- Fecha y hora de fin.
- Estado.

Estados de cita:

- `reservada`: el cliente o admin separo un espacio.
- `confirmada`: el comercio o empleado valido la atencion.
- `realizada`: el servicio ya fue cerrado como turno.
- `cancelada`: la cita no se atendera.
- `no_asistio`: el cliente no asistio.

Para que la agenda funcione deben existir:

- Servicios activos.
- Empleados activos.
- Clientes.
- Horarios por empleado.
- Bloqueos si el empleado no estara disponible.

El admin gestiona la agenda en `/admin/agenda`.

Desde esa vista puede:

- Consultar agenda completa.
- Crear cita para un cliente.
- Buscar disponibilidad por servicio, empleado y fecha.
- Crear horarios de empleado.
- Crear bloqueos de agenda.
- Confirmar cita.
- Cancelar cita.
- Marcar no asistencia.
- Contactar por WhatsApp.

El empleado gestiona sus citas en `/empleado/mi-agenda`.

Desde esa vista puede:

- Ver sus citas.
- Confirmar cita.
- Cancelar cita.
- Marcar no asistencia.
- Contactar al cliente por WhatsApp.

El cliente gestiona sus citas en `/cliente/reservar` y `/cliente/mis-citas`.

Desde esas vistas puede:

- Consultar servicios.
- Consultar especialistas.
- Ver horarios disponibles.
- Reservar cita.
- Ver sus citas.
- Cancelar o reprogramar.

### Turnos

El turno es la etapa comercial y contable.

Un turno no se crea desde cero. Un turno nace desde una cita.

Flujo:

1. Existe una cita en agenda.
2. La cita queda `reservada` o `confirmada`.
3. El cliente recibe el servicio.
4. Admin o empleado entra a cierre de turno.
5. Registra precio final, propina, metodo de pago, descuento y observaciones.
6. El sistema crea el turno.
7. La cita pasa a `realizada`.
8. El cierre alimenta caja, reportes, comisiones, margen e inventario.

Admin cierra turnos en `/admin/turnos`.

Empleado cierra sus turnos en `/empleado/cerrar-turno`.

## Cálculos comerciales

Cada comercio define su regla en `/admin/configuracion`:

- Base de comisión: precio final, precio menos descuento o precio menos costo de insumo.
- Propina comisionable: incluida o no incluida.

`/admin/reportes` calcula:

- Ingresos: `precio_final + propina`.
- Costo de insumo: `servicio_insumos.cantidad * inventario.costo_unitario`.
- Comisión: base configurada por comercio por `empleados.comision_pct`.
- Margen bruto: ingresos menos costo de insumo menos gastos.
- Utilidad neta: ingresos menos costo de insumo menos gastos menos comisiones.
- Utilidad por servicio: ingresos del servicio menos costo de insumo menos comisión.
- Utilidad por empleado: producción más propinas menos costo de insumo menos comisión.

## Plan de implementacion pendiente

### Fase A. Agenda operativa

Estado: implementado.

- Crear cita desde admin.
- Buscar disponibilidad desde admin.
- Crear horarios por empleado.
- Crear bloqueos por empleado.
- Confirmar, cancelar y marcar no asistencia desde admin.
- Confirmar, cancelar y marcar no asistencia desde empleado.

### Fase B. Productos e inventario comercial

Estado: implementado base.

- Productos visibles para cliente conectados con tabla `inventario`.
- Campos comerciales agregados: `precio_venta`, `visible_cliente`.
- Vista cliente muestra productos con stock y precio.
- Solicitud manual por WhatsApp desde vista cliente.
- Admin puede registrar salida de inventario como venta manual desde Kardex.
- Separacion operativa por categoria y visibilidad.

### Fase C. Aprobacion comercial de citas

Estado: implementado base.

- Cliente puede reservar.
- Admin y empleado pueden confirmar o cancelar.
- Cliente ve estado claro de la cita.
- Cliente ve historial de movimientos.
- Historial tecnico en tabla `cita_historial`.
- Admin, empleado y cliente registran historial al crear, confirmar, cancelar, reprogramar o cerrar turno.

### Fase D. Seguridad y despliegue

Estado: implementado en base y pendiente en infraestructura.

- Migracion incremental para historial de citas.
- RLS para `cita_historial`.
- RLS de inventario ajustado para productos visibles a cliente.
- Hardening de actualizaciones de cita por empleado y cliente.
- Pendiente externo: rotar claves expuestas durante configuracion.
- Pendiente externo: configurar variables en Vercel.
- Pendiente externo: configurar dominio.
- Pendiente externo: ejecutar pruebas mobile, tablet y desktop.
- Pendiente externo: ejecutar pruebas por rol con usuarios reales.
- Pendiente externo: validar datos reales del comercio piloto.

### Fase E. Comercializacion

Estado: pendiente.

- Definir plan demo.
- Definir plan mensual.
- Definir alcance de soporte.
- Definir politica de datos.
- Definir terminos de uso.
- Crear presentacion comercial sin entregar codigo.

## Despliegue produccion

Antes de desplegar:

1. Rotar claves Supabase expuestas durante configuracion.
2. Ejecutar migraciones pendientes en Supabase:

```bash
supabase db push
```

3. Configurar variables en Vercel:

```env
OPERUX_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
NEXT_PUBLIC_APP_URL=
```

4. Crear super admin:

```bash
npm run super-admin:create
```

5. Probar roles:

- Admin: dashboard, agenda, turnos, inventario, empleados, clientes, reportes.
- Empleado: mi agenda, confirmar cita, cancelar cita, no asistencia, cerrar turno.
- Cliente: reservar, mis citas, cancelar, reprogramar, ver historial, ver productos.

6. Validar flujo completo:

- Crear producto visible al cliente.
- Crear horario de empleado.
- Crear cita desde cliente.
- Confirmar cita desde admin o empleado.
- Cerrar turno.
- Revisar historial de cita.
- Revisar descuento de inventario.

## Seguridad pendiente antes de produccion

- [ ] Rotar `SUPABASE_SERVICE_ROLE_KEY` y `DATABASE_URL`
- [ ] Verificar que `.env.local` esta en `.gitignore` y nunca fue commiteado
- [ ] Activar RLS en todas las tablas (verificar cobertura completa)
- [ ] Migrar `getSession()` a `getUser()` en middleware (ya aplicado, confirmar)
- [ ] Configurar CORS en Supabase para el dominio de produccion
- [ ] Rate limiting en `/login`: implementación actual usa memoria in-process — no es efectiva
  en Vercel multi-instancia. Reemplazar con Vercel KV, Upstash Redis o tabla Supabase antes
  de exponer el login a internet público. Ver advertencia en `app/login/actions.ts`.
- [ ] Revisar que `SUPABASE_SERVICE_ROLE_KEY` no se use en client components
- [ ] Configurar branch protection en `ux-corporativa`: requerir PR para merge
- [ ] Agregar `.env*` a `.gitignore` si no esta

## Ramas

- `ux-corporativa`: rama principal de produccion. Base para despliegue real.
- `ux-staging`: rama de pruebas y desarrollo. Se mergea a `ux-corporativa` tras validacion.
- `main`: rama legada. No usar.

## Fase 1

Incluye:

- Schema Supabase Postgres.
- Enums.
- Indices.
- Triggers `updated_at`.
- RLS por rol.
- Funcion `disponibilidad_empleado`.
- Descuento automatico de inventario al cerrar turno.
- Seed base de servicios e inventario.
- `.env.example`.

## Fase 2

Incluye:

- Next.js 14 App Router.
- TypeScript.
- Tailwind.
- Base compatible con shadcn/ui.
- Supabase Auth con password y magic link.
- Callback `/auth/callback`.
- Middleware por rol.
- Layouts protegidos `admin`, `empleado`, `cliente`.
- Rutas base de todos los modulos.
- Drizzle schema.
- Validaciones Zod base.

## Supabase

1. Crear proyecto en Supabase.
2. Copiar variables del proyecto a `.env.local`.
3. Ejecutar migracion:

```bash
supabase db push
```

4. Crear usuario Auth admin:

```bash
OPERUX_ADMIN_EMAIL=admin@egosbarberia.com \
OPERUX_ADMIN_PASSWORD='cambia-esta-clave' \
OPERUX_ADMIN_NOMBRE="Admin Ego's" \
OPERUX_ADMIN_TELEFONO=3503803010 \
npm run admin:create
```

5. Ejecutar seed:

```bash
supabase db seed
```

## Claim requerido

El JWT debe incluir:

```json
{
  "rol": "admin"
}
```

Roles validos:

- `admin`
- `empleado`
- `cliente`

## RLS

La seguridad queda aplicada en SQL:

- `usuarios`: usuario ve su fila, admin ve todo.
- `citas`: cliente ve sus citas, empleado sus citas, admin todo.
- `turnos`, `gastos`, `inventario`, `mov_inventario`: admin.
- `servicios`, `horarios_empleado`, `bloqueos_empleado`: lectura autenticada, escritura admin.
- Empleado puede insertar turno solo sobre cita propia.

## Desarrollo local

```bash
npm install
npm run dev:prod
```

Produccion local usa `http://127.0.0.1:3011` y cache `.next-prod`.

## Demo local

Usar para revisar UX sin Supabase ni Postgres:

```bash
npm run dev:demo
```

URL:

```text
http://127.0.0.1:3012/login
```

Demo local usa cache `.next-demo`. Puede estar abierto al tiempo con produccion local sin corromper `.next`.

Credenciales:

```text
Email: admin@operux.local
Password: Operux2026!
```

El modo demo se activa con:

```env
OPERUX_DEMO_MODE=true
```

En demo:

- Login usa cookie local.
- Dashboard, agenda, turnos, gastos, inventario, servicios, empleados, clientes y reportes usan datos simulados.
- Las acciones de servicios, empleados y clientes no escriben en base de datos.
- Credenciales visibles en login.

## Produccion

Usar con:

```env
OPERUX_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
NEXT_PUBLIC_APP_URL=
```

En produccion:

- Auth depende de Supabase Auth.
- RLS aplica en Postgres.
- Server Actions escriben en Supabase.
- Vercel debe tener todas las variables reales configuradas.
- El admin crea empleados con usuario Auth, claim `rol=empleado` y perfil interno.
- El admin puede crear clientes manuales o clientes con acceso Auth, claim `rol=cliente`.
- Los servicios, gastos, inventario, turnos, agenda y reportes usan datos reales.

## Usuarios produccion

Admin inicial:

```bash
npm run admin:create
```

Super admin produccion:

```bash
npm run super-admin:create
```

Variables:

```env
OPERUX_SUPER_ADMIN_EMAIL=admin@mrzlabs.dev
OPERUX_SUPER_ADMIN_PASSWORD=
OPERUX_SUPER_ADMIN_NOMBRE=Super Admin Operux
OPERUX_SUPER_ADMIN_TELEFONO=3503803010
```

El `super admin` usa `rol=admin` en SQL para conservar compatibilidad con RLS y agrega `super_admin=true` en metadata de Supabase Auth.

Empleado:

- Crear desde `/admin/empleados`.
- El formulario pide password inicial.
- Se crea usuario Supabase Auth.
- Se crea fila en `usuarios`.
- Se crea fila en `empleados`.

Cliente:

- Crear desde `/admin/clientes`.
- Si se marca `Crear acceso cliente`, se crea usuario Supabase Auth y fila `usuarios`.
- Si no se marca, queda como cliente manual para agenda y turnos.
