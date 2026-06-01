# 🚀 Phase 11 — Deployment Guide

## Server Information
| Item | Value |
|------|-------|
| IP | 187.127.88.138 |
| OS | Ubuntu 22.04 LTS |
| Provider | Hostinger VPS |
| Stack | Docker + Nginx + PostgreSQL + Redis |

---

## Step 1 — First Time VPS Setup

```bash
# SSH into server
ssh root@187.127.88.138

# Run setup script (installs Docker, UFW, fail2ban, swap)
sudo bash infrastructure/scripts/server-setup.sh

# Add your SSH public key
echo 'YOUR_SSH_PUBLIC_KEY' >> /home/deployer/.ssh/authorized_keys
```

## Step 2 — Upload Application

```bash
# From your local machine
scp -r . deployer@187.127.88.138:/opt/everbrilliant
```

## Step 3 — Configure Environment

```bash
# On server
cd /opt/everbrilliant
cp .env.production .env.production.local
nano .env.production.local

# Required values:
# DOMAIN=yourdomain.com
# DB_PASSWORD=<strong-32char-password>
# REDIS_PASSWORD=<strong-password>
# JWT_SECRET=<openssl rand -hex 64>
```

## Step 4 — SSL Certificate

```bash
# Get Let's Encrypt certificate
sudo bash infrastructure/scripts/ssl-setup.sh yourdomain.com admin@yourdomain.com
```

## Step 5 — First Deployment

```bash
cd /opt/everbrilliant
bash infrastructure/scripts/deploy.sh full
```

This will:
1. ✅ Preflight checks
2. ✅ Build Docker images
3. ✅ Run Prisma migrations
4. ✅ Start all containers
5. ✅ Wait for health checks
6. ✅ Cleanup old images

---

## Daily Operations

### Update deployment
```bash
bash infrastructure/scripts/deploy.sh update
```

### Check status
```bash
bash infrastructure/scripts/deploy.sh status
# or
watch -n 5 bash infrastructure/monitoring/monitor.sh
```

### View logs
```bash
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Manual backup
```bash
bash infrastructure/scripts/backup.sh
ls -lh /opt/everbrilliant-backups/
```

### Rollback
```bash
bash infrastructure/scripts/deploy.sh rollback
```

---

## CI/CD (GitHub Actions)

### Required GitHub Secrets
| Secret | Value |
|--------|-------|
| `SERVER_IP` | 187.127.88.138 |
| `SERVER_USER` | deployer |
| `SSH_PRIVATE_KEY` | Your private key |
| `DOMAIN` | yourdomain.com |
| `API_URL` | https://yourdomain.com |

### Workflow
```
Push to main
    ↓
Run Tests (CI)
    ↓
Build Docker Images → GHCR
    ↓
Deploy via SSH
    ↓
Health Check (/api/health)
    ↓
✅ Live!
```

---

## Container Architecture

```
Internet (80/443)
    ↓
Nginx (reverse proxy + SSL + rate limit + gzip)
    ├── /api/*      → API:3000 (NestJS)
    ├── /socket.io/ → API:3000 (WebSocket)
    └── /*          → Web:3001 (Next.js)

Internal Network (eb_internal):
    API ──→ PostgreSQL:5432
    API ──→ Redis:6379
    
No containers expose ports directly to internet.
Only Nginx is on eb_external network.
```

---

## Health Endpoints

| URL | Description |
|-----|-------------|
| `GET /api/health` | Full health check (DB + Redis + Memory) |
| `GET /health` | Nginx health |

---

## Monitoring

### Resource usage
```bash
docker stats eb_api eb_web eb_postgres eb_redis eb_nginx
```

### PostgreSQL connections
```bash
docker exec eb_postgres psql -U ebuser everbrilliant \
  -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"
```

### Redis memory
```bash
docker exec eb_redis redis-cli -a ${REDIS_PASSWORD} INFO memory | grep used_memory_human
```

---

## Scheduled Tasks (Cron)

| Schedule | Task |
|----------|------|
| Daily 02:00 | Database + Redis backup |
| Daily 03:00 | Cleanup expired sessions |
| Weekly 04:00 | Cleanup old notifications |
| Every 5min | Refresh materialized view |
| Daily 12:00 | SSL certificate renewal |
