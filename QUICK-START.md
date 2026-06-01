# ⚡ Everbrilliant — Quick Start Guide

## Prerequisites
- Node.js 20+
- Docker Desktop
- Git

## 1. Install Dependencies
```bash
npm install
```

## 2. Setup Environment
```bash
cp .env.example .env
# Edit .env if needed (defaults work for local dev)
```

## 3. Start Infrastructure
```bash
docker-compose up -d postgres redis
```

## 4. Setup Database
```bash
npm run db:migrate    # Run migrations
npm run db:seed       # Seed demo data
```

## 5. Start Development
```bash
npm run dev           # Starts both API (3000) and Web (3001)
```

## 6. Open Browser
- **Web App:** http://localhost:3001
- **API:** http://localhost:3000/api
- **Health:** http://localhost:3000/api/health

## 🔑 Demo Credentials
| User | Phone | Password | Role |
|------|-------|----------|------|
| احمد رضایی | 09121111111 | Admin@1234 | Admin |
| علی کریمی | 09121111112 | User@5678 | Buyer |
| فاطمه رضایی | 09121111113 | User@5678 | Finance |
| حسین موسوی | 09121111114 | User@5678 | Sales |

## 🏗️ Build for Production
```bash
npm run build
```

## 🧪 Run Tests
```bash
npm test                  # All unit tests
cd tests/e2e && npx playwright test  # E2E tests
```

## 🚀 Deploy to VPS (187.127.88.138)
```bash
bash infrastructure/scripts/deploy.sh full
```

## 📋 Useful Commands
```bash
npm run db:studio     # Open Prisma Studio (DB browser)
npm run db:reset      # Reset + reseed database
docker-compose logs -f api   # API logs
docker-compose logs -f web   # Web logs
```
