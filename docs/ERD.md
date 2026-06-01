# 🗄️ Everbrilliant — Entity Relationship Diagram

## Database Statistics
| Metric | Value |
|--------|-------|
| Total Models | **44** |
| Total Enums | **24** |
| Total Relations | **68+** |
| Multi-tenant | ✅ Row-level isolation |
| Audit Trail | ✅ Full |

---

## 1. Core Entities

```
┌─────────────────────────────────────────────────────────────────┐
│                         MULTI-TENANT CORE                       │
├──────────────┬──────────────────┬──────────────┬────────────────┤
│   Company    │      User        │     Role     │   Permission   │
│ ─────────── │ ─────────────── │ ──────────── │ ────────────── │
│ id PK        │ id PK            │ id PK        │ id PK          │
│ name         │ name             │ name         │ key UNIQUE     │
│ nationalId ◄─┤ phone UNIQUE     │ label        │ label          │
│ economicCode │ password         │ labelFa      │ module         │
│ plan         │ companyId FK──►  │ companyId FK │                │
│ vatRate      │ roleId FK──────► │ isSystem     │                │
│ isActive     │ isCompanyAdmin   │ isDefault    │                │
└──────────────┘ lastLoginAt      └──────────────┘ └────────────────┘
                └──────────────────┘
                        │
                        │ 1:N
                        ▼
               ┌──────────────────┐     ┌─────────────────────┐
               │     Session      │     │   RolePermission    │
               │ ──────────────── │     │ ─────────────────── │
               │ id PK            │     │ roleId FK           │
               │ userId FK        │     │ permissionId FK     │
               │ token UNIQUE     │     │ [composite PK]      │
               │ expiresAt        │     └─────────────────────┘
               └──────────────────┘
```

---

## 2. Trading Module

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              TRADING FLOW                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

Company (Buyer) ──────────────────────────────────────────────► Company (Seller)
      │                                                                  │
      │ creates                                                          │ responds with
      ▼                                                                  ▼
┌─────────────┐   0:N   ┌──────────┐   1:1   ┌──────────┐   1:1   ┌──────────┐
│ TradeRequest│◄────────│  Quote   │         │ Contract │         │ Invoice  │
│ ─────────── │         │ ──────── │         │ ──────── │         │ ──────── │
│ id PK       │         │ id PK    │         │ id PK    │         │ id PK    │
│ buyerCompId │         │ requestId│         │ requestId│         │ requestId│
│ sellerCompId│         │ sellerId │         │ buyerId  │         │ sellerId │
│ product     │         │ unitPrice│         │ amountIRR│         │ total    │
│ qty / unit  │         │ total    │         │ status   │         │ status   │
│ status      │         │ validUtil│         │ signed   │         │ taxSerial│
│ priority    │         │ status   │         │ terms    │         │ items[]  │
└─────────────┘         └──────────┘         └──────────┘         └──────────┘
      │                                                                  │
      │ 0:N                                                              │ 0:N
      ▼                                                                  ▼
┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐       ┌──────────┐
│ Shipment │  │ QualityCheck │  │ Dispute  │  │ FollowUp │       │ Payment  │
└──────────┘  └──────────────┘  └──────────┘  └──────────┘       └──────────┘

┌─────────────────────────────────────┐
│           TENDER SYSTEM             │
│ Tender ──► TenderProduct            │
│    │                                │
│    └──► Bid (0:N per company)       │
│    └──► TenderBlacklist             │
└─────────────────────────────────────┘

┌──────────────────────────────────────────┐
│          COMPANY NETWORK                 │
│ Company ◄──── CompanyConnection ────► Company │
│               (bilateral M:N)            │
│ Company ──► InviteCode (1:N)             │
└──────────────────────────────────────────┘
```

---

## 3. Finance Module

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FINANCE MODULE                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                    INVOICING SYSTEM                           │
│                                                               │
│  Invoice ──► InvoiceItem[] (line items)                       │
│      │                                                        │
│      └──► Payment[] (partial/full payments)                   │
│                                                               │
│  Invoice Types:                                               │
│    TYPE1 = Standard tax invoice (فاکتور رسمی)                │
│    TYPE2 = Simplified invoice                                 │
│    TYPE3 = Export/Import invoice                              │
│                                                               │
│  VAT Calculation (Iran 1403):                                 │
│    Subtotal × 9%  = VAT (مالیات)                             │
│    Subtotal × 1%  = TOL (عوارض)                              │
│    Total Tax = 10%                                            │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                  ACCOUNTING SYSTEM                            │
│                                                               │
│  Account (Tree structure — parentId self-reference)           │
│    1000 Assets                                                │
│      1100 Cash & Bank                                         │
│      1200 Receivables                                         │
│      1300 Inventory                                           │
│    2000 Liabilities                                           │
│      2100 Payables                                            │
│    3000 Equity                                                │
│    4000 Revenue                                               │
│    5000 Expenses                                              │
│                                                               │
│  JournalEntry ──► JournalLine[] (double-entry)               │
│    Each line: debitAccountId + creditAccountId                │
│    totalDebit MUST EQUAL totalCredit                          │
└───────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    HR / PAYROLL                               │
│  Employee ──► Payroll[] (monthly)                            │
│  Net = baseSalary + overtime + bonus + allowances            │
│        - deductions - tax - insurance                        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   INVENTORY                                   │
│  InventoryItem ──► InventoryMovement[] (in/out history)      │
│  Product ◄── InventoryItem (optional link)                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    TREASURY                                   │
│  BankAccount ──► Check[]                                     │
│  BankAccount ──► BankTransaction[]                           │
│  Budget ──► BudgetLine[] (by category/month)                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Automation Module

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AUTOMATION MODULE                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────┐
│         CORRESPONDENCE                │
│  Letter                               │
│    type: INCOMING | OUTGOING | INTERNAL│
│    priority: NORMAL | URGENT | ...    │
│    status: DRAFT → SENT → ARCHIVED   │
│    cc: String[] (multiple recipients) │
└───────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                    WORKFLOW / APPROVAL                        │
│                                                               │
│  WorkflowRequest                                              │
│    type: LEAVE | ADVANCE | PURCHASE | TRAVEL | ...           │
│    status: PENDING → IN_REVIEW → APPROVED/REJECTED           │
│    currentStep / totalSteps                                   │
│         │                                                     │
│         └──► Approval[] (one per approver per step)          │
│               action: PENDING | APPROVED | REJECTED          │
│               delegatedToId (optional delegation)            │
│                                                               │
│  Approval Chain Example:                                      │
│    Step 1: Direct Manager  → APPROVED                        │
│    Step 2: Dept Head       → APPROVED                        │
│    Step 3: CEO             → PENDING                         │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────┐
│           MEETINGS                    │
│  Meeting                              │
│    type: ONLINE | IN_PERSON | HYBRID  │
│    status: SCHEDULED → COMPLETED      │
│    attendees: String[] (names)        │
│    agenda → minutes (after meeting)   │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│         DOCUMENT MANAGEMENT          │
│  Document ──► DocumentFolder (tree)   │
│    tags: String[]                     │
│    content: String | fileUrl: String  │
└───────────────────────────────────────┘
```

---

## 5. Cross-cutting Concerns

```
┌─────────────────────────────────────────────────────────────────┐
│                    CROSS-CUTTING CONCERNS                       │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                      NOTIFICATIONS                            │
│  Notification                                                 │
│    type: INFO | SUCCESS | WARNING | ERROR | REQUEST | ...     │
│    entityType + entityId (polymorphic link)                   │
│    isRead → readAt                                            │
│    Filtered by: userId + companyId                            │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                       AUDIT LOG                               │
│  AuditLog (append-only, never delete)                         │
│    action: CREATE|UPDATE|DELETE|LOGIN|APPROVE|SIGN|PRINT...   │
│    oldValues JSON + newValues JSON (full diff)                │
│    entityType + entityId (what was changed)                   │
│    ipAddress + userAgent (security trail)                     │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                      ATTACHMENTS                              │
│  Attachment (polymorphic)                                     │
│    requestAttachId → TradeRequest                             │
│    contractAttachId → Contract                                │
│    invoiceAttachId → Invoice                                  │
│    letterAttachId → Letter                                    │
│    workflowAttachId → WorkflowRequest                         │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                    PRODUCT CATALOG                            │
│  Product (company-specific catalog)                           │
│    ├── PriceList (date-ranged)                                │
│    │     └── PriceListItem (per product per list)            │
│    └── InventoryItem (stock tracking)                         │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────┐
│            MISC TABLES                │
│  ApiKey    (company API access)       │
│  InviteCode (company onboarding)      │
│  ExchangeRate (currency rates)        │
└───────────────────────────────────────┘
```

---

## 6. Index Strategy

```sql
-- High-frequency queries
CREATE INDEX idx_users_company    ON users(company_id);
CREATE INDEX idx_users_phone      ON users(phone);
CREATE INDEX idx_requests_buyer   ON trade_requests(buyer_company_id);
CREATE INDEX idx_requests_seller  ON trade_requests(seller_company_id);
CREATE INDEX idx_requests_status  ON trade_requests(status);
CREATE INDEX idx_requests_date    ON trade_requests(created_at);
CREATE INDEX idx_invoices_seller  ON invoices(seller_company_id);
CREATE INDEX idx_invoices_buyer   ON invoices(buyer_company_id);
CREATE INDEX idx_invoices_status  ON invoices(status);
CREATE INDEX idx_notif_user_read  ON notifications(user_id, is_read);
CREATE INDEX idx_audit_company    ON audit_logs(company_id);
CREATE INDEX idx_audit_date       ON audit_logs(created_at);
CREATE INDEX idx_sessions_token   ON sessions(token);
```

---

## 7. Multi-tenancy Design

```
Row-Level Isolation:
  Every business table has companyId
  API layer filters by req.user.companyId
  No cross-tenant data leakage possible

Company Isolation Rules:
  ✅ Users can only see their company's data
  ✅ Requests: buyer OR seller must be req.user.companyId
  ✅ Invoices: seller OR buyer must be req.user.companyId
  ✅ Admin can see ALL companies (sys_admin role only)

Cross-company Operations:
  ✅ TradeRequest: links two companies
  ✅ Contract: links buyer + seller
  ✅ CompanyConnection: bilateral M:N relationship
```

---

## 8. Table Summary

| # | Table | Rows/Month (est.) | Notes |
|---|-------|-------------------|-------|
| 1 | companies | ~10 | Slow growth |
| 2 | users | ~50 | Per company |
| 3 | sessions | ~500 | Auto-expire |
| 4 | roles | ~8 system | Fixed |
| 5 | permissions | ~44 | Fixed |
| 6 | role_permissions | ~200 | Fixed |
| 7 | products | ~100 | Per company |
| 8 | price_lists | ~10 | Per company |
| 9 | price_list_items | ~500 | Per list |
| 10 | trade_requests | ~200 | Core |
| 11 | quotes | ~400 | Per request |
| 12 | contracts | ~100 | Per request |
| 13 | tenders | ~20 | Per company |
| 14 | tender_products | ~60 | Per tender |
| 15 | bids | ~100 | Per tender |
| 16 | shipments | ~100 | Per request |
| 17 | shipment_stages | ~600 | Per shipment |
| 18 | invoices | ~200 | Core |
| 19 | invoice_items | ~600 | Per invoice |
| 20 | payments | ~200 | Per invoice |
| 21 | accounts | ~50 | COA |
| 22 | journal_entries | ~500 | Monthly |
| 23 | journal_lines | ~1500 | Per entry |
| 24 | employees | ~50 | Per company |
| 25 | payrolls | ~50×12 | Monthly |
| 26 | inventory_items | ~200 | Per company |
| 27 | inventory_movements | ~1000 | High volume |
| 28 | bank_accounts | ~5 | Per company |
| 29 | checks | ~100 | Monthly |
| 30 | letters | ~100 | Monthly |
| 31 | workflow_requests | ~50 | Monthly |
| 32 | approvals | ~150 | Per request |
| 33 | meetings | ~20 | Monthly |
| 34 | tasks | ~200 | Monthly |
| 35 | notifications | ~1000 | High volume |
| 36 | audit_logs | ~5000 | All actions |
| 37 | attachments | ~500 | Files |
| 38 | disputes | ~5 | Rare |
| 39 | quality_checks | ~50 | Per request |
| 40 | follow_ups | ~100 | Per request |
| 41 | company_connections | ~20 | Per company |
| 42 | invite_codes | ~10 | Per company |
| 43 | api_keys | ~5 | Per company |
| 44 | exchange_rates | ~30/day | Auto-update |
