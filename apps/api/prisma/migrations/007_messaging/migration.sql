-- Messaging: B2B inbox between connected companies

CREATE TABLE IF NOT EXISTS "messages" (
  "id"            TEXT        NOT NULL,
  "fromCompanyId" INTEGER     NOT NULL,
  "toCompanyId"   INTEGER     NOT NULL,
  "fromUserId"    INTEGER     NOT NULL,
  "subject"       TEXT        NOT NULL,
  "body"          TEXT        NOT NULL,
  "type"          TEXT        NOT NULL DEFAULT 'message',
  "refId"         TEXT,
  "refType"       TEXT,
  "isRead"        BOOLEAN     NOT NULL DEFAULT false,
  "isStarred"     BOOLEAN     NOT NULL DEFAULT false,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "messages_toCompanyId_idx"   ON "messages"("toCompanyId");
CREATE INDEX IF NOT EXISTS "messages_fromCompanyId_idx" ON "messages"("fromCompanyId");

ALTER TABLE "messages"
  ADD CONSTRAINT "messages_fromCompanyId_fkey"
    FOREIGN KEY ("fromCompanyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "messages_toCompanyId_fkey"
    FOREIGN KEY ("toCompanyId")   REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "messages_fromUserId_fkey"
    FOREIGN KEY ("fromUserId")    REFERENCES "users"("id")     ON DELETE RESTRICT ON UPDATE CASCADE;
