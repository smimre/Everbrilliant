-- EVERBRILLIANT — Initial Migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TYPE "Plan" AS ENUM ('FREE','STARTER','PRO','ENTERPRISE');
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT','PENDING','QUOTED','APPROVED','REJECTED','COMPLETED','CANCELLED');
CREATE TYPE "Priority" AS ENUM ('LOW','NORMAL','HIGH','URGENT');
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT','UNDER_REVIEW','READY_TO_SIGN','ACTIVE','COMPLETED','EXPIRED','CANCELLED');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT','SENT','PARTIAL','PAID','OVERDUE','CANCELLED','DISPUTED');
CREATE TYPE "InvoiceType" AS ENUM ('TYPE1','TYPE2','TYPE3');
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER','CHEQUE','CASH','ONLINE','LETTER_OF_CREDIT');
CREATE TYPE "JournalStatus" AS ENUM ('DRAFT','POSTED','CANCELLED');
CREATE TYPE "AccountType" AS ENUM ('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE');
CREATE TYPE "LetterType" AS ENUM ('INCOMING','OUTGOING','INTERNAL');
CREATE TYPE "WorkflowStatus" AS ENUM ('PENDING','IN_REVIEW','APPROVED','REJECTED','CANCELLED');
CREATE TYPE "ApprovalAction" AS ENUM ('PENDING','APPROVED','REJECTED','DELEGATED');
CREATE TYPE "MeetingType" AS ENUM ('ONLINE','IN_PERSON','HYBRID');
CREATE TYPE "ShipmentStatus" AS ENUM ('BOOKED','PICKED_UP','IN_TRANSIT','CUSTOMS','DELIVERED','RETURNED');
CREATE TYPE "NotificationType" AS ENUM ('INFO','SUCCESS','WARNING','ERROR','REQUEST','APPROVAL','PAYMENT','CONTRACT','SYSTEM');
CREATE TYPE "AuditAction" AS ENUM ('CREATE','UPDATE','DELETE','LOGIN','LOGOUT','EXPORT','IMPORT','APPROVE','REJECT','SIGN','PRINT');

-- COMPANIES
CREATE TABLE "companies" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "legal_name" TEXT,
    "national_id" TEXT UNIQUE,
    "economic_code" TEXT UNIQUE,
    "reg_no" TEXT,
    "postal_code" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Iran',
    "vat_registered" BOOLEAN NOT NULL DEFAULT true,
    "vat_rate" INTEGER NOT NULL DEFAULT 10,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "max_users" INTEGER NOT NULL DEFAULT 5,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ROLES
CREATE TABLE "roles" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "label_fa" TEXT,
    "company_id" INTEGER REFERENCES "companies"("id"),
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE("name", "company_id")
);

-- USERS
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL UNIQUE,
    "email" TEXT UNIQUE,
    "password" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL REFERENCES "companies"("id"),
    "role_id" INTEGER NOT NULL REFERENCES "roles"("id"),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_company_admin" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_users_company" ON "users"("company_id");

-- SESSIONS
CREATE TABLE "sessions" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "token" TEXT NOT NULL UNIQUE,
    "refresh_token" TEXT UNIQUE,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "ip_address" TEXT,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_sessions_token" ON "sessions"("token");

-- PERMISSIONS
CREATE TABLE "permissions" (
    "id" SERIAL PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "label" TEXT NOT NULL,
    "label_fa" TEXT,
    "module" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ROLE PERMISSIONS
CREATE TABLE "role_permissions" (
    "role_id" INTEGER NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    "permission_id" INTEGER NOT NULL REFERENCES "permissions"("id"),
    "granted_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("role_id", "permission_id")
);

-- TRADE REQUESTS
CREATE TABLE "trade_requests" (
    "id" TEXT PRIMARY KEY,
    "buyer_company_id" INTEGER NOT NULL REFERENCES "companies"("id"),
    "seller_company_id" INTEGER REFERENCES "companies"("id"),
    "product" TEXT NOT NULL,
    "qty" DECIMAL(15,3) NOT NULL,
    "unit" TEXT NOT NULL,
    "amount_irr" BIGINT,
    "currency" TEXT NOT NULL DEFAULT 'IRR',
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "deadline" TIMESTAMPTZ,
    "note" TEXT,
    "hs_code" TEXT,
    "created_by_id" INTEGER NOT NULL REFERENCES "users"("id"),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_requests_buyer"  ON "trade_requests"("buyer_company_id");
CREATE INDEX "idx_requests_seller" ON "trade_requests"("seller_company_id");
CREATE INDEX "idx_requests_status" ON "trade_requests"("status");
CREATE INDEX "idx_requests_date"   ON "trade_requests"("created_at" DESC);

-- INVOICES
CREATE TABLE "invoices" (
    "id" TEXT PRIMARY KEY,
    "invoice_type" "InvoiceType" NOT NULL DEFAULT 'TYPE1',
    "seller_company_id" INTEGER NOT NULL REFERENCES "companies"("id"),
    "buyer_company_id" INTEGER NOT NULL REFERENCES "companies"("id"),
    "request_id" TEXT UNIQUE REFERENCES "trade_requests"("id"),
    "subtotal" BIGINT NOT NULL,
    "discount_total" BIGINT NOT NULL DEFAULT 0,
    "vat_amount" BIGINT NOT NULL,
    "tol_amount" BIGINT NOT NULL,
    "tax_amount" BIGINT NOT NULL,
    "total" BIGINT NOT NULL,
    "paid" BIGINT NOT NULL DEFAULT 0,
    "remaining" BIGINT NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'IRR',
    "issued_at" TEXT NOT NULL,
    "due_at" TEXT,
    "note" TEXT,
    "tax_serial" TEXT,
    "tax_system_ref" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_invoices_seller" ON "invoices"("seller_company_id");
CREATE INDEX "idx_invoices_buyer"  ON "invoices"("buyer_company_id");
CREATE INDEX "idx_invoices_status" ON "invoices"("status");

-- NOTIFICATIONS
CREATE TABLE "notifications" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "company_id" INTEGER NOT NULL REFERENCES "companies"("id"),
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_notif_user_read" ON "notifications"("user_id","is_read");
CREATE INDEX "idx_notif_date" ON "notifications"("created_at" DESC);

-- AUDIT LOGS
CREATE TABLE "audit_logs" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER REFERENCES "users"("id"),
    "company_id" INTEGER REFERENCES "companies"("id"),
    "action" "AuditAction" NOT NULL,
    "module" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_audit_company" ON "audit_logs"("company_id");
CREATE INDEX "idx_audit_date" ON "audit_logs"("created_at" DESC);

-- AUTO-UPDATE TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER "trig_companies_updated"  BEFORE UPDATE ON "companies"      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "trig_users_updated"      BEFORE UPDATE ON "users"          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "trig_requests_updated"   BEFORE UPDATE ON "trade_requests" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "trig_invoices_updated"   BEFORE UPDATE ON "invoices"       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
