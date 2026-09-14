#!/bin/bash
# Self-healing script for the Guruvayur Dham VPS deployment.
#
# Run via crontab every 5 minutes:
#   */5 * * * * /root/guruvayur-dham/scripts/self-heal.sh >> /var/log/self-heal.log 2>&1
#
# What it does:
#   1. Checks if the Docker app container is running; restarts if down.
#   2. Checks disk usage on /; prunes Docker caches if >80% full.
#   3. Cleans up stale ErrorLog rows older than 30 days.
#   4. Cleans up read AdminNotifications older than 7 days.
#   5. Logs a one-line summary so grep'ing /var/log/self-heal.log shows
#      the latest health state.
#
# SelfReliant-Phase2-4.

set -u

# Project root — adjust if your VPS layout differs.
cd /root/guruvayur-dham || exit 1

LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

# 1. Check Docker app container
if docker compose ps 2>/dev/null | grep -q "guruvayur-app.*Up"; then
  : # healthy
else
  echo "$LOG_PREFIX App container down or missing — restarting..."
  docker compose up -d app
fi

# 2. Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ -n "${DISK_USAGE:-}" ] && [ "$DISK_USAGE" -gt 80 ]; then
  echo "$LOG_PREFIX Disk usage ${DISK_USAGE}% — pruning Docker caches..."
  docker system prune -f
  docker volume prune -f
fi

# 3. Clean up old ErrorLog rows (>30 days). Failures here are non-fatal —
# the app still runs, but the admin dashboard will surface the issue.
docker compose exec -T app npx prisma db execute --stdin <<'SQL' 2>/dev/null
DELETE FROM "ErrorLog"
WHERE "createdAt" < NOW() - INTERVAL '30 days';
SQL

# 4. Clean up old read AdminNotifications (>7 days, only if any staff
# member has dismissed them). array_length returns NULL for empty arrays,
# so the `> 0` check naturally skips unread alerts.
docker compose exec -T app npx prisma db execute --stdin <<'SQL' 2>/dev/null
DELETE FROM "AdminNotification"
WHERE array_length("readBy", 1) > 0
  AND "createdAt" < NOW() - INTERVAL '7 days';
SQL

echo "$LOG_PREFIX Self-heal check complete (disk: ${DISK_USAGE:-?}%)"
