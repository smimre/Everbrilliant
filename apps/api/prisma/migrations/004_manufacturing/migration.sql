-- EVERBRILLIANT — Manufacturing Module
-- Applied via: prisma db push (2026-06-02)
-- Tables created: work_orders, bom_templates, bom_items, raw_materials, wip_entries, qc_inspections

CREATE TYPE "WorkOrderStatus" AS ENUM ('PLANNED','IN_PROGRESS','PAUSED','QC','COMPLETED','CANCELLED');
CREATE TYPE "WorkOrderPriority" AS ENUM ('LOW','NORMAL','HIGH','URGENT');
CREATE TYPE "QCResult" AS ENUM ('PENDING','PASS','FAIL','CONDITIONAL');

CREATE TABLE "bom_templates" (
    "id"            TEXT NOT NULL,
    "companyId"     INTEGER NOT NULL,
    "code"          TEXT NOT NULL,
    "product"       TEXT NOT NULL,
    "productFa"     TEXT,
    "unit"          TEXT NOT NULL DEFAULT 'Pcs',
    "description"   TEXT,
    "laborMinutes"  INTEGER,
    "overheadRate"  DECIMAL(10,4),
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "createdById"   INTEGER NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "bom_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bom_items" (
    "id"            SERIAL NOT NULL,
    "bomId"         TEXT NOT NULL,
    "materialCode"  TEXT NOT NULL,
    "material"      TEXT NOT NULL,
    "materialFa"    TEXT,
    "qty"           DECIMAL(15,3) NOT NULL,
    "unit"          TEXT NOT NULL,
    "scrapFactor"   DECIMAL(5,4) NOT NULL DEFAULT 0,
    "unitCostIRR"   BIGINT,
    "notes"         TEXT,
    CONSTRAINT "bom_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "work_orders" (
    "id"                 TEXT NOT NULL,
    "companyId"          INTEGER NOT NULL,
    "orderNo"            TEXT NOT NULL,
    "bomId"              TEXT,
    "productName"        TEXT NOT NULL,
    "productNameFa"      TEXT,
    "qty"                DECIMAL(15,3) NOT NULL,
    "unit"               TEXT NOT NULL DEFAULT 'Pcs',
    "startDate"          TIMESTAMP(3),
    "dueDate"            TIMESTAMP(3) NOT NULL,
    "status"             "WorkOrderStatus" NOT NULL DEFAULT 'PLANNED',
    "priority"           "WorkOrderPriority" NOT NULL DEFAULT 'NORMAL',
    "progress"           INTEGER NOT NULL DEFAULT 0,
    "workcenter"         TEXT,
    "estimatedCostIRR"   BIGINT,
    "actualCostIRR"      BIGINT,
    "notes"              TEXT,
    "completedAt"        TIMESTAMP(3),
    "createdById"        INTEGER NOT NULL,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,
    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "raw_materials" (
    "id"            TEXT NOT NULL,
    "companyId"     INTEGER NOT NULL,
    "code"          TEXT NOT NULL,
    "material"      TEXT NOT NULL,
    "materialFa"    TEXT,
    "unit"          TEXT NOT NULL,
    "available"     DECIMAL(15,3) NOT NULL DEFAULT 0,
    "required"      DECIMAL(15,3) NOT NULL DEFAULT 0,
    "reorderPoint"  DECIMAL(15,3) NOT NULL DEFAULT 0,
    "unitCostIRR"   BIGINT,
    "supplier"      TEXT,
    "dueDate"       TIMESTAMP(3),
    "notes"         TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "raw_materials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "wip_entries" (
    "id"              SERIAL NOT NULL,
    "workOrderId"     TEXT NOT NULL,
    "stage"           TEXT NOT NULL,
    "completedQty"    DECIMAL(15,3) NOT NULL DEFAULT 0,
    "actualCostIRR"   BIGINT,
    "note"            TEXT,
    "recordedById"    INTEGER NOT NULL,
    "recordedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wip_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "qc_inspections" (
    "id"              SERIAL NOT NULL,
    "workOrderId"     TEXT NOT NULL,
    "companyId"       INTEGER NOT NULL,
    "inspectedQty"    DECIMAL(15,3) NOT NULL,
    "passedQty"       DECIMAL(15,3) NOT NULL,
    "failedQty"       DECIMAL(15,3) NOT NULL DEFAULT 0,
    "result"          "QCResult" NOT NULL DEFAULT 'PENDING',
    "notes"           TEXT,
    "defectCodes"     TEXT,
    "inspectedById"   INTEGER NOT NULL,
    "inspectedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qc_inspections_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "bom_templates"  ADD CONSTRAINT "bom_templates_companyId_fkey"   FOREIGN KEY ("companyId")   REFERENCES "companies"("id");
ALTER TABLE "bom_templates"  ADD CONSTRAINT "bom_templates_createdById_fkey"  FOREIGN KEY ("createdById") REFERENCES "users"("id");
ALTER TABLE "bom_items"      ADD CONSTRAINT "bom_items_bomId_fkey"            FOREIGN KEY ("bomId")       REFERENCES "bom_templates"("id") ON DELETE CASCADE;
ALTER TABLE "work_orders"    ADD CONSTRAINT "work_orders_companyId_fkey"      FOREIGN KEY ("companyId")   REFERENCES "companies"("id");
ALTER TABLE "work_orders"    ADD CONSTRAINT "work_orders_bomId_fkey"          FOREIGN KEY ("bomId")       REFERENCES "bom_templates"("id");
ALTER TABLE "work_orders"    ADD CONSTRAINT "work_orders_createdById_fkey"    FOREIGN KEY ("createdById") REFERENCES "users"("id");
ALTER TABLE "raw_materials"  ADD CONSTRAINT "raw_materials_companyId_fkey"    FOREIGN KEY ("companyId")   REFERENCES "companies"("id");
ALTER TABLE "wip_entries"    ADD CONSTRAINT "wip_entries_workOrderId_fkey"    FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE;
ALTER TABLE "wip_entries"    ADD CONSTRAINT "wip_entries_recordedById_fkey"   FOREIGN KEY ("recordedById") REFERENCES "users"("id");
ALTER TABLE "qc_inspections" ADD CONSTRAINT "qc_inspections_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE;

-- Unique & indexes
CREATE UNIQUE INDEX "bom_templates_companyId_code_key"   ON "bom_templates"("companyId", "code");
CREATE UNIQUE INDEX "work_orders_companyId_orderNo_key"  ON "work_orders"("companyId", "orderNo");
CREATE UNIQUE INDEX "raw_materials_companyId_code_key"   ON "raw_materials"("companyId", "code");
CREATE INDEX "bom_templates_companyId_idx"  ON "bom_templates"("companyId");
CREATE INDEX "bom_items_bomId_idx"          ON "bom_items"("bomId");
CREATE INDEX "work_orders_companyId_idx"    ON "work_orders"("companyId");
CREATE INDEX "work_orders_status_idx"       ON "work_orders"("status");
CREATE INDEX "work_orders_dueDate_idx"      ON "work_orders"("dueDate");
CREATE INDEX "raw_materials_companyId_idx"  ON "raw_materials"("companyId");
CREATE INDEX "wip_entries_workOrderId_idx"  ON "wip_entries"("workOrderId");
CREATE INDEX "qc_inspections_workOrderId_idx" ON "qc_inspections"("workOrderId");
CREATE INDEX "qc_inspections_companyId_idx"   ON "qc_inspections"("companyId");
