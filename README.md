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

```text
email: admin@egosbarberia.com
rol claim: admin
```

5. Reemplazar en `supabase/seed.sql` el UUID `00000000-0000-0000-0000-000000000001` por el `auth.users.id` real del admin.
6. Ejecutar seed:

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
