#!/bin/bash
# ══════════════════════════════════════════════════════════════
# EVERBRILLIANT — Automated Backup Script
# Runs daily via cron at 02:00
# ══════════════════════════════════════════════════════════════
set -euo pipefail

BACKUP_DIR="/opt/everbrilliant-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=7

mkdir -p "$BACKUP_DIR"

# Load env
source /opt/everbrilliant/.env.production

# 1. PostgreSQL backup
echo "[$(date)] Backing up database..."
docker exec eb_postgres pg_dump \
  -U "${DB_USER:-ebuser}" \
  --no-owner --no-acl \
  "${DB_NAME:-everbrilliant}" \
  | gzip -9 > "$BACKUP_DIR/db_${TIMESTAMP}.sql.gz"

# 2. Redis backup
echo "[$(date)] Backing up Redis..."
docker exec eb_redis redis-cli -a "${REDIS_PASSWORD}" BGSAVE
sleep 2
docker cp eb_redis:/data/dump.rdb "$BACKUP_DIR/redis_${TIMESTAMP}.rdb"

# 3. Cleanup old backups
find "$BACKUP_DIR" -name "db_*.sql.gz"  -mtime +$KEEP_DAYS -delete
find "$BACKUP_DIR" -name "redis_*.rdb"  -mtime +$KEEP_DAYS -delete

# 4. Report
DB_SIZE=$(du -sh "$BACKUP_DIR/db_${TIMESTAMP}.sql.gz" | cut -f1)
echo "[$(date)] Backup complete: DB=$DB_SIZE | Location=$BACKUP_DIR"
ls -lh "$BACKUP_DIR" | tail -5
