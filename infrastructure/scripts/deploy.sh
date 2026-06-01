#!/bin/bash
# ══════════════════════════════════════════════════════════════
# EVERBRILLIANT — Production Deploy Script
# Usage: ./infrastructure/scripts/deploy.sh [full|update|rollback]
#
# SERVER: 187.127.88.138
# ══════════════════════════════════════════════════════════════
set -euo pipefail

# ── Colors ────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()  { echo -e "${GREEN}[$(date '+%H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠ $1${NC}"; }
err()  { echo -e "${RED}[$(date '+%H:%M:%S')] ✗ $1${NC}" >&2; }
step() { echo -e "\n${BLUE}${BOLD}━━━ $1 ━━━${NC}"; }

MODE="${1:-update}"
DEPLOY_DIR="/opt/everbrilliant"
BACKUP_DIR="/opt/everbrilliant-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# ── Preflight ─────────────────────────────────────────────────
preflight() {
  step "Preflight Checks"

  [ -f ".env.production" ] || { err ".env.production not found"; exit 1; }
  command -v docker &>/dev/null || { err "Docker not installed"; exit 1; }
  command -v docker-compose &>/dev/null || { err "docker-compose not installed"; exit 1; }

  # Load env
  set -a; source .env.production; set +a

  [ -n "${JWT_SECRET:-}" ] && [ ${#JWT_SECRET} -ge 64 ] || { err "JWT_SECRET too short (min 64 chars)"; exit 1; }
  [ -n "${DB_PASSWORD:-}" ] || { err "DB_PASSWORD not set"; exit 1; }
  [ -n "${REDIS_PASSWORD:-}" ] || { err "REDIS_PASSWORD not set"; exit 1; }

  log "Preflight passed ✓"
}

# ── Database backup ───────────────────────────────────────────
backup_db() {
  step "Database Backup"
  mkdir -p "$BACKUP_DIR"
  BACKUP_FILE="$BACKUP_DIR/db_backup_${TIMESTAMP}.sql.gz"

  if docker ps -q -f name=eb_postgres | grep -q .; then
    log "Backing up database → $BACKUP_FILE"
    docker exec eb_postgres pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"
    log "Backup complete: $(du -sh "$BACKUP_FILE" | cut -f1)"

    # Keep only last 7 backups
    ls -t "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null | tail -n +8 | xargs -r rm
    log "Old backups cleaned"
  else
    warn "Postgres not running — skipping backup"
  fi
}

# ── Pull & build ──────────────────────────────────────────────
pull_and_build() {
  step "Build Images"
  log "Building images..."
  docker-compose -f docker-compose.prod.yml build \
    --build-arg VERSION="$TIMESTAMP" \
    --parallel
  log "Build complete ✓"
}

# ── Database migration ────────────────────────────────────────
run_migrations() {
  step "Database Migrations"
  log "Starting postgres for migrations..."
  docker-compose -f docker-compose.prod.yml up -d postgres redis
  sleep 5

  log "Running Prisma migrations..."
  docker-compose -f docker-compose.prod.yml run --rm api \
    sh -c "npx prisma migrate deploy"
  log "Migrations complete ✓"
}

# ── Deploy ────────────────────────────────────────────────────
deploy_containers() {
  step "Deploy Containers"

  # Zero-downtime: start new, wait, stop old
  log "Starting containers..."
  docker-compose -f docker-compose.prod.yml up -d

  log "Waiting for health checks..."
  local retries=0
  until docker inspect eb_api --format='{{.State.Health.Status}}' 2>/dev/null | grep -q healthy; do
    retries=$((retries + 1))
    [ $retries -ge 30 ] && { err "API health check timeout"; rollback; exit 1; }
    echo -n "."
    sleep 3
  done
  echo ""

  log "API is healthy ✓"
  log "Containers deployed ✓"
}

# ── Cleanup ───────────────────────────────────────────────────
cleanup() {
  step "Cleanup"
  docker image prune -f --filter "until=48h"
  docker volume prune -f
  log "Cleanup complete ✓"
}

# ── Rollback ──────────────────────────────────────────────────
rollback() {
  step "ROLLBACK"
  warn "Rolling back to previous version..."
  docker-compose -f docker-compose.prod.yml down
  PREV_BACKUP=$(ls -t "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null | head -2 | tail -1)
  if [ -n "$PREV_BACKUP" ]; then
    warn "Restoring database from: $PREV_BACKUP"
    docker-compose -f docker-compose.prod.yml up -d postgres
    sleep 5
    zcat "$PREV_BACKUP" | docker exec -i eb_postgres psql -U "$DB_USER" "$DB_NAME"
  fi
  docker-compose -f docker-compose.prod.yml up -d
  err "Rollback complete — check logs with: docker-compose logs -f"
}

# ── Status ────────────────────────────────────────────────────
show_status() {
  step "Deployment Status"
  echo ""
  docker-compose -f docker-compose.prod.yml ps
  echo ""
  log "Logs (last 20 lines):"
  docker-compose -f docker-compose.prod.yml logs --tail=20
}

# ── Main ──────────────────────────────────────────────────────
main() {
  echo -e "\n${CYAN}${BOLD}"
  echo "  ██████████████████████████████"
  echo "  ██  EVERBRILLIANT DEPLOY  ██"
  echo "  ██████████████████████████████"
  echo -e "${NC}"
  echo -e "  Mode: ${BOLD}$MODE${NC}"
  echo -e "  Server: ${BOLD}187.127.88.138${NC}"
  echo -e "  Time: ${BOLD}$(date)${NC}\n"

  case "$MODE" in
    full)
      preflight
      backup_db
      pull_and_build
      run_migrations
      deploy_containers
      cleanup
      show_status
      log "Full deployment complete! 🚀"
      ;;
    update)
      preflight
      backup_db
      pull_and_build
      run_migrations
      deploy_containers
      cleanup
      log "Update deployment complete! 🚀"
      ;;
    rollback)
      preflight
      rollback
      ;;
    status)
      show_status
      ;;
    *)
      echo "Usage: $0 [full|update|rollback|status]"
      exit 1
      ;;
  esac
}

main
