-- =============================================================
-- BarberLab CRM — Migración Semana 1
-- Generado: 2026-06-01
-- Ejecutar en: Supabase SQL Editor
-- NOTA: Todas las sentencias son idempotentes (IF NOT EXISTS / IF EXISTS)
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. COLUMNAS FALTANTES
-- ─────────────────────────────────────────────────────────────

ALTER TABLE inventario ADD COLUMN IF NOT EXISTS descripcion  text;
ALTER TABLE inventario ADD COLUMN IF NOT EXISTS foto_url     text;

ALTER TABLE servicios  ADD COLUMN IF NOT EXISTS descripcion  text;
ALTER TABLE servicios  ADD COLUMN IF NOT EXISTS foto_url     text;

ALTER TABLE gastos     ADD COLUMN IF NOT EXISTS descripcion  text;

ALTER TABLE empleados  ADD COLUMN IF NOT EXISTS foto_url     text;

-- ─────────────────────────────────────────────────────────────
-- 2. ÍNDICES — Agenda y disponibilidad de slots
-- ─────────────────────────────────────────────────────────────

-- Las queries más frecuentes del sistema: agenda por rango de fechas
CREATE INDEX IF NOT EXISTS idx_citas_negocio_inicio
  ON citas(negocio_id, inicio);

-- Disponibilidad de empleado en slotDisponible()
CREATE INDEX IF NOT EXISTS idx_citas_empleado_inicio
  ON citas(empleado_id, inicio);

-- Filtro por estado (pendientes, confirmadas, etc.)
CREATE INDEX IF NOT EXISTS idx_citas_negocio_estado
  ON citas(negocio_id, estado);

-- ─────────────────────────────────────────────────────────────
-- 3. ÍNDICES — Dashboard (4 queries de rango temporal por carga)
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_turnos_negocio_created
  ON turnos(negocio_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 4. ÍNDICES — Super-admin logs
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_activity_negocio
  ON activity_logs(negocio_id);

CREATE INDEX IF NOT EXISTS idx_activity_created
  ON activity_logs(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 5. ÍNDICES — Horarios y bloqueos (usados en slotDisponible)
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_horarios_empleado_dia
  ON horarios_empleado(empleado_id, dia_semana);

CREATE INDEX IF NOT EXISTS idx_bloqueos_empleado_rango
  ON bloqueos_empleado(empleado_id, fecha_inicio, fecha_fin);

-- ─────────────────────────────────────────────────────────────
-- 6. ÍNDICES — Impersonation tokens
-- ─────────────────────────────────────────────────────────────

-- El UPDATE atómico en sa-enter filtra por (expires_at, used_at)
CREATE INDEX IF NOT EXISTS idx_imp_tokens_validation
  ON impersonation_tokens(token, expires_at, used_at);

-- ─────────────────────────────────────────────────────────────
-- VERIFICACIÓN FINAL
-- ─────────────────────────────────────────────────────────────
-- Ejecutar para confirmar que los índices se crearon:
--
-- SELECT indexname, tablename
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND indexname LIKE 'idx_%'
-- ORDER BY tablename, indexname;
--
-- Ejecutar para confirmar columnas:
--
-- SELECT table_name, column_name
-- FROM information_schema.columns
-- WHERE table_name IN ('inventario','servicios','gastos','empleados')
--   AND column_name IN ('descripcion','foto_url')
-- ORDER BY table_name, column_name;
