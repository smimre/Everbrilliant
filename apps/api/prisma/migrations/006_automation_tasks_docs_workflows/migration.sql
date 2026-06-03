-- Automation: extend Task, Document; add WorkflowTemplate, WorkflowTemplateStep, WorkflowInstance

ALTER TABLE "tasks"
  ADD COLUMN IF NOT EXISTS "assigneeName" TEXT,
  ADD COLUMN IF NOT EXISTS "progress"     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "tag"          TEXT,
  ADD COLUMN IF NOT EXISTS "dueStr"       TEXT,
  ALTER COLUMN "assigneeId" DROP NOT NULL,
  ALTER COLUMN "priority" TYPE TEXT USING "priority"::TEXT,
  ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "documents"
  ADD COLUMN IF NOT EXISTS "category"     TEXT NOT NULL DEFAULT 'سایر',
  ADD COLUMN IF NOT EXISTS "version"      TEXT NOT NULL DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS "confidential" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "fileSize"     TEXT,
  ADD COLUMN IF NOT EXISTS "uploaderName" TEXT;

CREATE TABLE IF NOT EXISTS "workflow_templates" (
  "id"        TEXT NOT NULL,
  "companyId" INTEGER NOT NULL,
  "title"     TEXT NOT NULL,
  "icon"      TEXT NOT NULL DEFAULT '⚙️',
  "mode"      TEXT NOT NULL DEFAULT 'sequential',
  "active"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "workflow_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "workflow_template_steps" (
  "id"           SERIAL NOT NULL,
  "templateId"   TEXT NOT NULL,
  "stepOrder"    INTEGER NOT NULL DEFAULT 0,
  "name"         TEXT NOT NULL,
  "assigneeName" TEXT,
  CONSTRAINT "workflow_template_steps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "workflow_instances" (
  "id"          TEXT NOT NULL,
  "templateId"  TEXT NOT NULL,
  "companyId"   INTEGER NOT NULL,
  "title"       TEXT NOT NULL,
  "status"      TEXT NOT NULL DEFAULT 'inprog',
  "currentStep" INTEGER NOT NULL DEFAULT 0,
  "startDate"   TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "workflow_templates_companyId_idx" ON "workflow_templates"("companyId");
CREATE INDEX IF NOT EXISTS "workflow_instances_templateId_idx" ON "workflow_instances"("templateId");
CREATE INDEX IF NOT EXISTS "workflow_instances_companyId_idx"  ON "workflow_instances"("companyId");

ALTER TABLE "workflow_templates"     ADD CONSTRAINT "workflow_templates_companyId_fkey"     FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "workflow_template_steps" ADD CONSTRAINT "workflow_template_steps_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "workflow_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workflow_instances"      ADD CONSTRAINT "workflow_instances_templateId_fkey"      FOREIGN KEY ("templateId") REFERENCES "workflow_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
