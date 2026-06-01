#!/bin/bash
# ══════════════════════════════════════════════════════════════
# EVERBRILLIANT — Container Monitoring
# Usage: watch -n 5 ./infrastructure/monitoring/monitor.sh
# ══════════════════════════════════════════════════════════════

echo "════════════════════════════════════════════"
echo "  EVERBRILLIANT — Live Monitor"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "════════════════════════════════════════════"

echo ""
echo "CONTAINERS:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" \
  eb_api eb_web eb_postgres eb_redis eb_nginx 2>/dev/null

echo ""
echo "HEALTH:"
for svc in eb_api eb_web eb_postgres eb_redis eb_nginx; do
  STATUS=$(docker inspect "$svc" --format='{{.State.Health.Status}}' 2>/dev/null || echo "N/A")
  echo "  $svc: $STATUS"
done

echo ""
echo "DISK:"
df -h / | tail -1 | awk '{print "  Root: "$3" used of "$2" ("$5")"}'
du -sh /opt/everbrilliant-backups 2>/dev/null | awk '{print "  Backups: "$1}'

echo ""
echo "API:"
API_HEALTH=$(curl -sf http://localhost/api/health 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'status={d[\"status\"]} latency={d[\"latency\"]}ms uptime={d[\"uptime\"]}s')" 2>/dev/null || echo "unreachable")
echo "  $API_HEALTH"

echo ""
echo "CONNECTIONS:"
echo "  WebSocket: $(docker logs eb_api --since 1m 2>/dev/null | grep -c "Connected:" || echo 0) new"
