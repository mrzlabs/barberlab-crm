# BarberLab CRM

CRM comercializable para barberias, peluquerias, spa de unas y tatuajes.

Cliente piloto potencial: Ego's Barberia y Peluqueria, Bogota.

## Modelo comercial

BarberLab CRM se vende como producto SaaS, implementacion o servicio administrado.

No se vende el codigo fuente.

El cliente compra:

- Uso del CRM.
- Parametrizacion del negocio.
- Configuracion de usuarios, servicios, empleados, horarios e inventario.
- Soporte de despliegue.
- Ajustes funcionales pactados.
- Hosting y mantenimiento si aplica dentro de la oferta.

MRZLABS conserva:

- Codigo fuente.
- Arquitectura.
- Repositorio.
- Migraciones.
- Componentes visuales.
- Automatizaciones internas.
- Know-how tecnico.

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

Estado: pendiente.

- Conectar productos visibles para cliente con tabla `inventario`.
- Crear vista de productos disponibles.
- Permitir solicitud manual de producto por WhatsApp.
- Descontar stock por venta manual.
- Separar inventario interno de insumos y productos para venta.

### Fase C. Aprobacion comercial de citas

Estado: parcial.

- Cliente puede reservar.
- Admin y empleado pueden confirmar o cancelar.
- Falta vista de estado mas clara para cliente.
- Falta historial de cambios por cita.

### Fase D. Seguridad y despliegue

Estado: pendiente antes de produccion real.

- Revisar politicas RLS con usuarios reales.
- Rotar claves expuestas durante configuracion.
- Configurar variables en Vercel.
- Configurar dominio.
- Ejecutar pruebas mobile, tablet y desktop.
- Ejecutar pruebas por rol.
- Validar datos reales del comercio piloto.

### Fase E. Comercializacion

Estado: pendiente.

- Definir plan demo.
- Definir plan mensual.
- Definir alcance de soporte.
- Definir politica de datos.
- Definir terminos de uso.
- Crear presentacion comercial sin entregar codigo.

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
BARBERLAB_ADMIN_EMAIL=admin@egosbarberia.com \
BARBERLAB_ADMIN_PASSWORD='cambia-esta-clave' \
BARBERLAB_ADMIN_NOMBRE="Admin Ego's" \
BARBERLAB_ADMIN_TELEFONO=3503803010 \
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
Email: admin@barberlab.local
Password: BarberLab2026!
```

El modo demo se activa con:

```env
BARBERLAB_DEMO_MODE=true
```

En demo:

- Login usa cookie local.
- Dashboard, agenda, turnos, gastos, inventario, servicios, empleados, clientes y reportes usan datos simulados.
- Las acciones de servicios, empleados y clientes no escriben en base de datos.
- Credenciales visibles en login.

## Produccion

Usar con:

```env
BARBERLAB_DEMO_MODE=false
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
BARBERLAB_SUPER_ADMIN_EMAIL=admin@mrzlabs.dev
BARBERLAB_SUPER_ADMIN_PASSWORD=
BARBERLAB_SUPER_ADMIN_NOMBRE=Super Admin BarberLab
BARBERLAB_SUPER_ADMIN_TELEFONO=3503803010
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
