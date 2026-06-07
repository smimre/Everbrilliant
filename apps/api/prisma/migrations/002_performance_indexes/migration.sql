-- EVERBRILLIANT — Performance Indexes Migration

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_req_buyer_status
  ON trade_requests(buyer_company_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_req_seller_status
  ON trade_requests(seller_company_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inv_seller_status
  ON invoices(seller_company_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inv_buyer_status
  ON invoices(buyer_company_id, status, created_at DESC);

-- Partial index: unread notifications only
CREATE INDEX IF NOT EXISTS idx_notif_user_unread
  ON notifications(user_id, created_at DESC)
  WHERE is_read = false;

-- Partial index: active sessions only
CREATE INDEX IF NOT EXISTS idx_sessions_active
  ON sessions(user_id, expires_at)
  WHERE is_revoked = false;

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_users_active
  ON users(company_id) WHERE is_active = true;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') THEN
    CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(company_id) WHERE is_active = true;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenders') THEN
    CREATE INDEX IF NOT EXISTS idx_tenders_open ON tenders(end_date) WHERE status = 'OPEN';
  END IF;
END $$;

-- Full text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_req_product_trgm
  ON trade_requests USING GIN(product gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_company_name_trgm
  ON companies USING GIN(name gin_trgm_ops);

-- Statistics
ANALYZE trade_requests;
ANALYZE invoices;
ANALYZE notifications;
ANALYZE users;

-- Materialized view for dashboard KPIs
CREATE MATERIALIZED VIEW IF NOT EXISTS company_dashboard_stats AS
SELECT
  c.id AS company_id,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'PENDING') AS pending_requests,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'COMPLETED') AS completed_requests,
  COUNT(DISTINCT i.id) FILTER (WHERE i.seller_company_id = c.id AND i.status NOT IN ('CANCELLED','DRAFT')) AS issued_invoices,
  COALESCE(SUM(i.total) FILTER (WHERE i.seller_company_id = c.id AND i.status = 'PAID'), 0) AS total_revenue,
  COALESCE(SUM(i.remaining) FILTER (WHERE i.buyer_company_id = c.id AND i.status NOT IN ('PAID','CANCELLED')), 0) AS outstanding_payable
FROM companies c
LEFT JOIN trade_requests r ON r.buyer_company_id = c.id
LEFT JOIN invoices i ON i.seller_company_id = c.id OR i.buyer_company_id = c.id
GROUP BY c.id;

CREATE UNIQUE INDEX ON company_dashboard_stats(company_id);

-- Auto-cleanup functions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE deleted INTEGER;
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE deleted INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '90 days' AND is_read = true;
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY company_dashboard_stats;
END;
$$ LANGUAGE plpgsql;
