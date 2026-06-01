<div align="center">

# 🏢 Everbrilliant ERP
### Enterprise B2B Trading & ERP Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)

</div>

---

## 🚀 Quick Start

```bash
# Clone and install
git clone <repo> && cd everbrilliant
cp .env.example .env

# Start development
npm install
docker-compose up -d postgres redis
npm run db:migrate
npm run db:seed
npm run dev
```

**URLs after start:**
| Service | URL |
|---------|-----|
| Web | http://localhost:3001 |
| API | http://localhost:3000 |
| Health | http://localhost:3000/api/health |

**Login:** `09121111111` / `Admin@1234`

---

## 🏗️ Architecture

```
everbrilliant/
├── apps/
│   ├── web/          ← Next.js 14 + TypeScript + Tailwind
│   └── api/          ← NestJS + Prisma + PostgreSQL
├── packages/
│   ├── types/        ← Shared TypeScript types
│   └── ui/           ← Shared components
├── infrastructure/
│   ├── nginx/        ← Production reverse proxy
│   ├── scripts/      ← Deploy, backup, SSL scripts
│   ├── docker/       ← DB init
│   └── monitoring/   ← Monitor script
├── tests/e2e/        ← Playwright E2E tests
├── docs/             ← ERD, deployment, perf docs
├── docker-compose.yml
└── docker-compose.prod.yml
```

---

## 📦 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS |
| State | Zustand + immer + TanStack Query |
| Backend | NestJS 10, TypeScript |
| Database | PostgreSQL 16 + Prisma ORM |
| Cache | Redis 7 |
| Realtime | Socket.IO WebSocket |
| Auth | JWT + RBAC |
| Container | Docker + Docker Compose |
| Proxy | Nginx 1.25 |
| CI/CD | GitHub Actions |
| Testing | Jest + Playwright |

---

## 🧩 Modules

### Frontend Modules
| Module | Features |
|--------|---------|
| **Dashboard** | KPI cards, recent requests, invoice summary, quick actions, activity feed |
| **Trading** | Requests, quotes, contracts, tenders, bidding, connections |
| **Finance** | Invoices (VAT), HR/payroll, inventory, treasury, accounting |
| **Automation** | Letters, workflow/approval, meetings, tasks |
| **CRM** | Company list, detail, activity timeline |
| **SaaS** | Pricing, usage, white-label, onboarding |

### Backend Modules (API)
| Module | Endpoints |
|--------|----------|
| `auth` | login, register, logout, me |
| `trading` | requests, quotes, contracts, tenders, bids |
| `finance` | invoices, employees, inventory, payments |
| `automation` | letters, workflow, approvals, meetings |
| `crm` | connections, search |
| `notifications` | list, read, delete |
| `saas` | plans, subscription, usage, white-label |
| `health` | system health check |

---

## 🔑 Authentication & RBAC

| Role | Permissions |
|------|------------|
| `sys_admin` | All |
| `company_admin` | All within company |
| `owner` | All |
| `finance` | Finance module |
| `purchase` | Trading (buy side) |
| `sales` | Trading (sell side) |
| `logistics_mgr` | View only |
| `viewer` | Read-only |

---

## 🗄️ Database

**44 Prisma models** across 5 domains:
- **Core**: Company, User, Session, Role, Permission
- **Trading**: TradeRequest, Quote, Contract, Tender, Bid, Shipment
- **Finance**: Invoice, Payment, Account, JournalEntry, Employee, Payroll, Inventory
- **Automation**: Letter, WorkflowRequest, Approval, Meeting, Task
- **SaaS**: SubscriptionPlan, Subscription, UsageRecord, WhiteLabelConfig

---

## ⚡ Performance

| Feature | Detail |
|---------|--------|
| Redis cache | TTL 30s/60s/5m/1h/1d |
| Virtual table | Auto for 200+ rows |
| Lazy modules | Dynamic import per module |
| Infinite scroll | IntersectionObserver sentinel |
| Bundle splitting | vendors / realtime / charts |
| SQL indexes | Composite + partial + GIN |
| Materialized view | Dashboard KPIs |

---

## 🔴 Realtime (Socket.IO)

| Event | Direction | Description |
|-------|-----------|-------------|
| `notification` | Server→Client | Push notifications |
| `approval:update` | Server→Client | Workflow updates |
| `tender:bid_placed` | Server→Client | Live bidding |
| `tender:countdown` | Server→Client | Timer (1s) |
| `presence:join/leave` | Bidirectional | Online users |
| `typing` | Client→Room | Typing indicator |

---

## 🌍 Multilingual

| Language | Code | Direction |
|----------|------|-----------|
| English | `en` | LTR |
| فارسی | `fa` | RTL |
| العربية | `ar` | RTL |
| हिन्दी | `hi` | LTR |

---

## 💰 SaaS Plans

| Plan | Price/mo | Users | Features |
|------|----------|-------|---------|
| Free | 0 | 2 | Basic |
| Starter | 4.99M IRR | 5 | + Realtime |
| Pro | 14.99M IRR | 25 | + API + Reports |
| Enterprise | 49.99M IRR | Unlimited | + White-label + SSO |

---

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests (8 devices)
npm run test:e2e
```

**Test coverage:** 159 tests (60 API unit, 19 integration, 56 frontend, 24 E2E)

---

## 🚀 Production Deployment

```bash
# First time VPS setup
sudo bash infrastructure/scripts/server-setup.sh

# SSL certificate
sudo bash infrastructure/scripts/ssl-setup.sh yourdomain.com

# Deploy
bash infrastructure/scripts/deploy.sh full
```

**Server:** 187.127.88.138 | Ubuntu 22.04 | Hostinger VPS

---

## 📁 Project Stats

| Metric | Value |
|--------|-------|
| Total files | 230+ |
| TypeScript files | 180+ |
| React components | 40+ |
| API endpoints | 60+ |
| Database models | 44 |
| Database enums | 24 |
| Test cases | 159 |
| E2E devices | 8 |
| Phases completed | 12/12 |

---

## 📄 License

Private — Everbrilliant © 2026
