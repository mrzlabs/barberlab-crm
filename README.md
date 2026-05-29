# BarberLab CRM

CRM comercializable para barberias, peluquerias, spa de unas y tatuajes.

Cliente piloto potencial: Ego's Barberia y Peluqueria, Bogota.

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
npm run dev
```

## Demo local

Usar para revisar UX sin Supabase ni Postgres:

```bash
npm run dev:demo
```

URL:

```text
http://127.0.0.1:3012/login
```

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
