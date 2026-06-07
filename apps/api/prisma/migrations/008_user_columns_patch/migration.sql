-- Add missing columns to users table that were in schema but not in migration 001
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "avatar"              TEXT,
  ADD COLUMN IF NOT EXISTS "staffCode"           TEXT,
  ADD COLUMN IF NOT EXISTS "jobTitle"            TEXT,
  ADD COLUMN IF NOT EXISTS "department"          TEXT,
  ADD COLUMN IF NOT EXISTS "twoFactorEnabled"    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "twoFactorSecret"     TEXT,
  ADD COLUMN IF NOT EXISTS "lastLoginIp"         TEXT,
  ADD COLUMN IF NOT EXISTS "passwordChangedAt"   TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "resetToken"          TEXT,
  ADD COLUMN IF NOT EXISTS "resetTokenExpiry"    TIMESTAMP(3);

-- roles table: extra label field
ALTER TABLE "roles"
  ADD COLUMN IF NOT EXISTS "labelAr"             TEXT;

-- sessions table: userAgent field
ALTER TABLE "sessions"
  ADD COLUMN IF NOT EXISTS "userAgent"           TEXT;

-- audit_logs: userAgent field
ALTER TABLE "audit_logs"
  ADD COLUMN IF NOT EXISTS "userAgent"           TEXT;

-- notifications: extra translated fields
ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS "titleFa"             TEXT,
  ADD COLUMN IF NOT EXISTS "messageFa"           TEXT,
  ADD COLUMN IF NOT EXISTS "entity_type"         TEXT,
  ADD COLUMN IF NOT EXISTS "entity_id"           TEXT;

-- companies table: extra profile fields
ALTER TABLE "companies"
  ADD COLUMN IF NOT EXISTS "province"            TEXT,
  ADD COLUMN IF NOT EXISTS "phone"               TEXT,
  ADD COLUMN IF NOT EXISTS "fax"                 TEXT,
  ADD COLUMN IF NOT EXISTS "email"               TEXT,
  ADD COLUMN IF NOT EXISTS "website"             TEXT,
  ADD COLUMN IF NOT EXISTS "logo"                TEXT,
  ADD COLUMN IF NOT EXISTS "plan_expires_at"     TIMESTAMPTZ;
