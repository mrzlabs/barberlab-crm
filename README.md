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

## Siguiente fase

Fase 3: Modulo admin, dashboard, turnos, gastos e inventario.
