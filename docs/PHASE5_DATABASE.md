# 🗄️ Phase 5 — Database Migration

## Quick Setup

```bash
# 1. Start PostgreSQL
docker-compose up postgres -d

# 2. Generate Prisma client
cd apps/api && npx prisma generate

# 3. Run migrations
npx prisma migrate dev --name initial

# 4. Seed demo data
npx prisma db seed
```

## Database Stats
| Metric | Value |
|--------|-------|
| Models | **44** |
| Enums | **24** |
| Relations | **68+** |
| Schema lines | **1,404** |
| Seed file | **399 lines** |
| Migration SQL | **200+ lines** |

## Default Credentials (after seed)
| User | Phone | Password | Role |
|------|-------|----------|------|
| احمد رضایی | 09121111111 | Admin@1234 | company_admin |
| علی کریمی | 09121111112 | User@5678 | purchase |
| فاطمه رضایی | 09121111113 | User@5678 | finance |
| حسین موسوی | 09121111114 | User@5678 | sales |
| مریم احمدی (Co2) | 09122222221 | Admin@1234 | company_admin |
| System Admin | 09000000000 | Admin@1234 | sys_admin |

## Iranian VAT Calculation
```
Subtotal × 9% = VAT (مالیات ارزش افزوده)
Subtotal × 1% = TOL (عوارض)
Total Tax = 10% (1403 rate)
```

## Multi-tenancy
Every business table has `companyId`.
API layer filters: `WHERE company_id = req.user.companyId`
