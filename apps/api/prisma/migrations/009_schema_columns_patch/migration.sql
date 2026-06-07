-- Additional columns present in Prisma schema but missing from earlier migrations

ALTER TABLE "role_permissions"
  ADD COLUMN IF NOT EXISTS "grantedBy"           INTEGER;

ALTER TABLE "permissions"
  ADD COLUMN IF NOT EXISTS "description"         TEXT;

ALTER TABLE "roles"
  ADD COLUMN IF NOT EXISTS "labelAr"             TEXT;

ALTER TABLE "sessions"
  ADD COLUMN IF NOT EXISTS "userAgent"           TEXT;

ALTER TABLE "audit_logs"
  ADD COLUMN IF NOT EXISTS "userAgent"           TEXT;

ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS "titleFa"             TEXT,
  ADD COLUMN IF NOT EXISTS "messageFa"           TEXT,
  ADD COLUMN IF NOT EXISTS "entity_type"         TEXT,
  ADD COLUMN IF NOT EXISTS "entity_id"           TEXT;
