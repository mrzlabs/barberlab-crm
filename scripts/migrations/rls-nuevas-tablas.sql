-- ============================================================
-- RLS Policies para nuevas tablas: activity_logs, impersonation_tokens, categorias_inventario
-- Aplicar después de crear las tablas con Drizzle Kit
-- ============================================================

-- ── activity_logs ─────────────────────────────────────────────────────────────

ALTER TABLE IF EXISTS activity_logs ENABLE ROW LEVEL SECURITY;

-- Super admins ven todos los logs
CREATE POLICY "activity_logs_super_admin_all"
  ON activity_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid()
        AND (u.super_admin = true OR u.rol = 'super_admin')
    )
  );

-- Admins ven solo logs de su propio negocio
CREATE POLICY "activity_logs_admin_own_negocio"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    negocio_id = (
      SELECT u.negocio_id FROM usuarios u
      WHERE u.id = auth.uid() AND u.rol = 'admin'
      LIMIT 1
    )
  );

-- Empleados no pueden leer activity_logs
-- (sin policy = sin acceso cuando RLS está habilitado)

-- ── impersonation_tokens ──────────────────────────────────────────────────────

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS impersonation_tokens (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  token       text        NOT NULL UNIQUE,
  negocio_id  uuid        NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  created_by  uuid        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  expires_at  timestamptz NOT NULL,
  used        boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS impersonation_tokens ENABLE ROW LEVEL SECURITY;

-- Solo super admins pueden crear/leer tokens de impersonación
CREATE POLICY "impersonation_tokens_super_admin_only"
  ON impersonation_tokens
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid()
        AND (u.super_admin = true OR u.rol = 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid()
        AND (u.super_admin = true OR u.rol = 'super_admin')
    )
  );

-- ── categorias_inventario ─────────────────────────────────────────────────────

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS categorias_inventario (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id  uuid        NOT NULL REFERENCES negocios(id) ON DELETE RESTRICT,
  nombre      text        NOT NULL,
  descripcion text,
  activo      boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT NOW(),
  updated_at  timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (negocio_id, nombre)
);

ALTER TABLE IF EXISTS categorias_inventario ENABLE ROW LEVEL SECURITY;

-- Admins ven y editan sus propias categorías
CREATE POLICY "categorias_inventario_admin_own"
  ON categorias_inventario
  FOR ALL
  TO authenticated
  USING (
    negocio_id = (
      SELECT u.negocio_id FROM usuarios u
      WHERE u.id = auth.uid() AND u.rol = 'admin'
      LIMIT 1
    )
  )
  WITH CHECK (
    negocio_id = (
      SELECT u.negocio_id FROM usuarios u
      WHERE u.id = auth.uid() AND u.rol = 'admin'
      LIMIT 1
    )
  );

-- Empleados pueden leer categorías de su negocio
CREATE POLICY "categorias_inventario_empleado_read"
  ON categorias_inventario
  FOR SELECT
  TO authenticated
  USING (
    negocio_id = (
      SELECT u.negocio_id FROM usuarios u
      WHERE u.id = auth.uid() AND u.rol = 'empleado'
      LIMIT 1
    )
  );

-- Super admins tienen acceso total
CREATE POLICY "categorias_inventario_super_admin"
  ON categorias_inventario
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid()
        AND (u.super_admin = true OR u.rol = 'super_admin')
    )
  );

-- ── must_change_password migration ───────────────────────────────────────────
-- Aplicar si la columna no existe aún:
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;
