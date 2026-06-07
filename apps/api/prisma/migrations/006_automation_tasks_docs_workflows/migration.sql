-- Automation: extend Task, Document; add WorkflowTemplate, WorkflowTemplateStep, WorkflowInstance

-- Create base tables if they don't exist yet
CREATE TABLE IF NOT EXISTS "document_folders" (
  "id"        SERIAL NOT NULL,
  "name"      TEXT NOT NULL,
  "parentId"  INTEGER,
  "companyId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "document_folders_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "document_folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "document_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "document_folders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "tasks" (
  "id"          TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "assigneeId"  INTEGER,
  "companyId"   INTEGER NOT NULL,
  "priority"    TEXT NOT NULL DEFAULT 'normal',
  "status"      TEXT NOT NULL DEFAULT 'pending',
  "dueDate"     TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdById" INTEGER NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tasks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tasks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "documents" (
  "id"          TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "type"        TEXT NOT NULL,
  "content"     TEXT,
  "fileUrl"     TEXT,
  "companyId"   INTEGER NOT NULL,
  "folderId"    INTEGER,
  "createdById" INTEGER NOT NULL,
  "tags"        TEXT[] NOT NULL DEFAULT '{}',
  "isArchived"  BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "documents_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "documents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "documents_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "document_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "tasks_assigneeId_idx" ON "tasks"("assigneeId");
CREATE INDEX IF NOT EXISTS "tasks_companyId_idx" ON "tasks"("companyId");
CREATE INDEX IF NOT EXISTS "documents_companyId_idx" ON "documents"("companyId");

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
