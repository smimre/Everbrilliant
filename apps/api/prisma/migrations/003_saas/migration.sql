-- ══════════════════════════════════════════════════════════════
-- EVERBRILLIANT — SaaS Migration (Phase 12)
-- Adds subscription, billing, usage, white-label tables
-- ══════════════════════════════════════════════════════════════

CREATE TYPE "PlanTier" AS ENUM ('FREE','STARTER','PRO','ENTERPRISE','WHITE_LABEL');
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY','QUARTERLY','ANNUAL');
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING','ACTIVE','PAST_DUE','PAUSED','CANCELLED','EXPIRED');
CREATE TYPE "UsageMetric" AS ENUM ('USERS','REQUESTS','INVOICES','STORAGE_MB','API_CALLS','TENDERS','CONNECTIONS');

CREATE TABLE "subscription_plans" (
    "id"            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name"          TEXT NOT NULL UNIQUE,
    "name_fa"       TEXT,
    "tier"          "PlanTier" NOT NULL DEFAULT 'FREE',
    "price_monthly" BIGINT NOT NULL DEFAULT 0,
    "price_annual"  BIGINT NOT NULL DEFAULT 0,
    "currency"      TEXT NOT NULL DEFAULT 'IRR',
    "is_public"     BOOLEAN NOT NULL DEFAULT true,
    "is_default"    BOOLEAN NOT NULL DEFAULT false,
    "trial_days"    INTEGER NOT NULL DEFAULT 14,
    "features"      JSONB NOT NULL DEFAULT '{}',
    "limits"        JSONB NOT NULL DEFAULT '{}',
    "sort_order"    INTEGER NOT NULL DEFAULT 0,
    "is_active"     BOOLEAN NOT NULL DEFAULT true,
    "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "subscriptions" (
    "id"                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "company_id"            INTEGER NOT NULL UNIQUE REFERENCES "companies"("id"),
    "plan_id"               TEXT NOT NULL REFERENCES "subscription_plans"("id"),
    "status"                "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "billing_cycle"         "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "current_period_start"  TIMESTAMPTZ NOT NULL,
    "current_period_end"    TIMESTAMPTZ NOT NULL,
    "trial_ends_at"         TIMESTAMPTZ,
    "cancelled_at"          TIMESTAMPTZ,
    "cancel_reason"         TEXT,
    "auto_renew"            BOOLEAN NOT NULL DEFAULT true,
    "custom_limits"         JSONB,
    "metadata"              JSONB,
    "created_at"            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_subscriptions_company"    ON "subscriptions"("company_id");
CREATE INDEX "idx_subscriptions_status"     ON "subscriptions"("status");
CREATE INDEX "idx_subscriptions_period_end" ON "subscriptions"("current_period_end")
  WHERE "status" IN ('ACTIVE','TRIALING');

CREATE TABLE "subscription_payments" (
    "id"              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "subscription_id" TEXT NOT NULL REFERENCES "subscriptions"("id"),
    "amount"          BIGINT NOT NULL,
    "currency"        TEXT NOT NULL DEFAULT 'IRR',
    "period"          TEXT NOT NULL,
    "status"          TEXT NOT NULL DEFAULT 'pending',
    "paid_at"         TIMESTAMPTZ,
    "method"          TEXT,
    "reference_no"    TEXT,
    "invoice_url"     TEXT,
    "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_sub_payments_sub" ON "subscription_payments"("subscription_id");

CREATE TABLE "usage_records" (
    "id"              SERIAL PRIMARY KEY,
    "subscription_id" TEXT NOT NULL REFERENCES "subscriptions"("id"),
    "company_id"      INTEGER NOT NULL,
    "metric"          "UsageMetric" NOT NULL,
    "value"           INTEGER NOT NULL,
    "period"          TEXT NOT NULL,
    "recorded_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_usage_sub_metric_period"  ON "usage_records"("subscription_id","metric","period");
CREATE INDEX "idx_usage_company_metric"     ON "usage_records"("company_id","metric");

CREATE TABLE "white_label_configs" (
    "id"               SERIAL PRIMARY KEY,
    "company_id"       INTEGER NOT NULL UNIQUE REFERENCES "companies"("id"),
    "app_name"         TEXT NOT NULL DEFAULT 'Everbrilliant',
    "app_name_fa"      TEXT,
    "logo_url"         TEXT,
    "favicon_url"      TEXT,
    "primary_color"    TEXT NOT NULL DEFAULT '#3b82f6',
    "secondary_color"  TEXT NOT NULL DEFAULT '#8b5cf6',
    "domain"           TEXT UNIQUE,
    "support_email"    TEXT,
    "support_phone"    TEXT,
    "footer_text"      TEXT,
    "custom_css"       TEXT,
    "is_active"        BOOLEAN NOT NULL DEFAULT true,
    "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-expire subscriptions
CREATE OR REPLACE FUNCTION check_subscription_expiry()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET status = 'EXPIRED'
  WHERE current_period_end < NOW()
    AND status IN ('ACTIVE', 'TRIALING')
    AND auto_renew = false;

  UPDATE subscriptions
  SET status = 'PAST_DUE'
  WHERE current_period_end < NOW()
    AND status = 'ACTIVE'
    AND auto_renew = true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE subscription_plans IS 'SaaS subscription plan definitions';
COMMENT ON TABLE subscriptions IS 'Company subscription records';
COMMENT ON TABLE usage_records IS 'Monthly usage tracking per metric';
COMMENT ON TABLE white_label_configs IS 'White-label branding per company';
