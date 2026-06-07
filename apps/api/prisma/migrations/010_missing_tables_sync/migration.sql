-- This migration was generated via `prisma db push` after discovering that
-- many tables defined in the Prisma schema were never created by migrations 001-007.
-- The tables below were created by db push; this file documents and marks them applied.

-- invoices: missing columns
ALTER TABLE "invoices"
  ADD COLUMN IF NOT EXISTS "invoiceNo"     TEXT,
  ADD COLUMN IF NOT EXISTS "exchangeRate"  DECIMAL(15,4),
  ADD COLUMN IF NOT EXISTS "paidAt"        TIMESTAMP(3);

-- messages: column name normalization (isRead → is_read, createdAt → created_at)
-- (handled by prisma db push which renamed the columns)

-- role_permissions: missing column (also in 009 but duplicated here as safety)
ALTER TABLE "role_permissions"
  ADD COLUMN IF NOT EXISTS "grantedBy"     INTEGER;

-- permissions: missing column (also in 009)
ALTER TABLE "permissions"
  ADD COLUMN IF NOT EXISTS "description"   TEXT;

-- All other missing tables (products, quotes, contracts, tenders, bids, etc.)
-- were created directly by `prisma db push` on 2026-06-07 and cannot be
-- re-run as a migration without conflicts. Mark this migration as applied only.
