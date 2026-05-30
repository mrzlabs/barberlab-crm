# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # dev server on :3000 (default, demo mode off)
npm run dev:prod       # dev on :3011 with BARBERLAB_DEMO_MODE=false (production DB)
npm run dev:demo       # dev with BARBERLAB_DEMO_MODE=true (mock data, no DB needed)
npm run build          # Next.js build
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit (no test suite exists)
npm run db:generate    # Drizzle Kit: generate SQL migration files
npm run db:migrate     # Drizzle Kit: apply pending migrations
npm run admin:create       # Create an admin user via script
npm run super-admin:create # Create a super-admin user via script
```

Required environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`.

## Architecture

This is a **multi-tenant SaaS CRM** for barbershops and beauty salons (Next.js 14 App Router + Supabase Auth + Drizzle ORM on PostgreSQL).

### Role-based routing

Four roles map directly to URL prefixes:

| Role | Home route | URL prefix |
|---|---|---|
| `super_admin` | `/super-admin/negocios` | `/super-admin/*` |
| `admin` | `/admin/dashboard` | `/admin/*` |
| `empleado` | `/empleado/mi-agenda` | `/empleado/*` |
| `cliente` | `/cliente/reservar` | `/cliente/*` |

`middleware.ts` enforces access at the edge by reading the Supabase session and role from `user.app_metadata` / `user.user_metadata` JWT claims. Each layout additionally calls `getCurrentProfile()` as a defense layer. Role definitions and `roleHome` map live in `lib/auth/roles.ts`.

### Auth session (`lib/auth/session.ts`)

`getCurrentProfile()` — the central auth primitive. Called in every layout and Server Action. It:
1. In demo mode, returns a hardcoded admin profile from a cookie (`barberlab_demo_role`).
2. Otherwise calls `supabase.auth.getUser()`, then joins `usuarios` + `negocios` via Drizzle to build `CurrentProfile`.

`requireRole(allowed: UserRole[])` — wraps `getCurrentProfile()`, redirects to `/login` or `/unauthorized`, and returns the profile. **Every mutating Server Action starts with this call.**

### Multi-tenancy

Every table has a `negocio_id` column. All queries filter by `profile.negocioId` obtained from `getCurrentProfile()`. Never query across tenants. The `negocios` table stores plan, branding (colors, logo, font), and `estado` (activo/inactivo).

### Data layer

- **Schema**: `lib/db/schema.ts` — single file, all Drizzle table definitions. Main entities: `negocios`, `usuarios`, `empleados`, `clientes`, `servicios`, `citas`, `turnos`, `gastos`, `inventario`, `movInventario`, `horariosEmpleado`, `bloqueosEmpleado`, `citaHistorial`.
- **DB client**: `lib/db/index.ts` — lazy singleton via `getDb()`, uses `postgres` (postgres.js) with `prepare: false` (required for Supabase connection pooling).
- **Read queries**: `lib/admin/queries.ts`, `lib/cliente/queries.ts`, `lib/empleado/queries.ts`, `lib/super-admin/queries.ts` — called from RSC pages.
- **Mutations**: `app/{route}/actions.ts` — Next.js Server Actions (`"use server"`).

### Server Action pattern

Every Server Action in this codebase follows this exact order:
1. `const profile = await requireRole(["admin"])` — auth + role guard.
2. `if (isDemoMode()) { revalidatePath(...); return; }` — short-circuit for demo.
3. Zod `.parse()` of `formData` using a schema from `lib/validations/`.
4. DB write via `getDb()`.
5. `revalidatePath(...)` on all affected routes.
6. Optionally `addCitaHistory(...)` for appointment state changes.

### Demo mode

`BARBERLAB_DEMO_MODE=true` enables a read-only demo environment:
- Login with `admin@barberlab.local` / `BarberLab2026!`.
- All queries short-circuit to return mock data from `lib/mock.ts`.
- All mutations short-circuit after `requireRole` and `revalidatePath` (no DB write).
- Supabase is not called; session is a cookie (`barberlab_demo_role=admin`).

### Key business logic

- **Citas → Turnos**: A `cita` (appointment) is a reservation. A `turno` (shift/transaction) is created when the appointment is completed and payment is collected. Dashboard metrics are derived from `turnos`, not `citas`.
- **Comisiones**: `negocios.comisionBase` controls if employee commission is based on `precio_final` or another field. `empleados.comisionPct` stores the percentage.
- **Slot availability**: `lib/cliente/queries.ts:slotDisponible()` is the canonical check used by both client-side booking and admin agenda actions.
- **Appointment history**: `lib/citas/history.ts:addCitaHistory()` — called after every state change to `citas`.
