-- LOGISTICS MODULE

CREATE TABLE IF NOT EXISTS "logistics_shipments" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "shipType" TEXT NOT NULL DEFAULT 'domestic',
    "status" TEXT NOT NULL DEFAULT 'booked',
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "weight" DECIMAL(12,3),
    "weightUnit" TEXT NOT NULL DEFAULT 'تن',
    "volume" DECIMAL(12,3),
    "cost" BIGINT NOT NULL DEFAULT 0,
    "costPaid" BOOLEAN NOT NULL DEFAULT false,
    "sellerName" TEXT,
    "buyerName" TEXT,
    "waybillNo" TEXT,
    "hsCode" TEXT,
    "customsStatus" TEXT,
    "customsNotes" TEXT,
    "insurer" TEXT,
    "insuranceAmt" BIGINT,
    "policyNo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "logistics_shipments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "logistics_stages" (
    "id" SERIAL NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "labelFa" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "date" TEXT,
    "stageOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "logistics_stages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "logistics_rate_quotes" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "fromLoc" TEXT NOT NULL,
    "toLoc" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'Truck',
    "rate" BIGINT NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'per load',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "logistics_rate_quotes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "logistics_shipments_trackingCode_key" ON "logistics_shipments"("trackingCode");
CREATE INDEX IF NOT EXISTS "logistics_shipments_companyId_idx" ON "logistics_shipments"("companyId");
CREATE INDEX IF NOT EXISTS "logistics_rate_quotes_companyId_idx" ON "logistics_rate_quotes"("companyId");

ALTER TABLE "logistics_shipments" ADD CONSTRAINT "logistics_shipments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "logistics_stages" ADD CONSTRAINT "logistics_stages_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "logistics_shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "logistics_rate_quotes" ADD CONSTRAINT "logistics_rate_quotes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
