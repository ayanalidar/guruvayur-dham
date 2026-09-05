#!/usr/bin/env bash
# ============================================================================
# Guruvayur Dham — VPS Deploy Script
# ============================================================================
# Usage:
#   ./deploy.sh           — full deploy (build + restart + migrate + seed)
#   ./deploy.sh quick     — quick restart (no rebuild, no migrate)
#   ./deploy.sh build     — rebuild only (no migrate, no restart)
#   ./deploy.sh logs      — tail logs
#   ./deploy.sh stop      — stop all services
#   ./deploy.sh db        — run prisma db push (apply schema changes)
#   ./deploy.sh seed      — run seed scripts
# ============================================================================

set -e  # exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()  { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date +%H:%M:%S)]${NC} $1"; }
err()  { echo -e "${RED}[$(date +%H:%M:%S)]${NC} $1"; }

# Check .env exists
if [ ! -f .env ]; then
  err ".env file not found! Copy .env.example to .env and fill in values first."
  exit 1
fi

# Load env
set -a; source .env; set +a

case "${1:-deploy}" in

  # ---- Full deploy ----
  deploy|"")
    log "🚀 Starting full deploy..."

    log "📦 Pulling latest code from git..."
    git pull origin main

    log "🏗️  Building and starting containers..."
    docker compose up -d --build

    log "⏳ Waiting for app to be healthy..."
    sleep 10

    log "🗄️  Applying database schema changes..."
    docker compose exec -T app npx prisma db push --accept-data-loss

    log "🌱 Running seed scripts..."
    docker compose exec -T app bun run scripts/seed.ts || warn "Seed failed (may be OK if already seeded)"
    docker compose exec -T app bun run scripts/seed-cms.ts || warn "CMS seed failed (may be OK if already seeded)"

    log "✅ Deploy complete!"
    log "🌐 Site: https://${DOMAIN:-guruvayurdham.com}"
    log "📊 Logs: ./deploy.sh logs"
    ;;

  # ---- Quick restart (no rebuild) ----
  quick)
    log "⚡ Quick restart..."
    docker compose restart app
    log "✅ Done"
    ;;

  # ---- Build only ----
  build)
    log "🏗️  Building containers..."
    docker compose build app
    log "✅ Build complete. Run ./deploy.sh to start."
    ;;

  # ---- View logs ----
  logs)
    log "📜 Tailing logs (Ctrl+C to exit)..."
    docker compose logs -f app
    ;;

  # ---- Stop all services ----
  stop)
    log "🛑 Stopping all services..."
    docker compose down
    log "✅ Stopped"
    ;;

  # ---- Database operations ----
  db)
    log "🗄️  Applying schema changes (prisma db push)..."
    docker compose exec -T app npx prisma db push --accept-data-loss
    log "✅ Database schema updated"
    ;;

  # ---- Seed database ----
  seed)
    log "🌱 Running seed scripts..."
    docker compose exec -T app bun run scripts/seed.ts
    docker compose exec -T app bun run scripts/seed-cms.ts
    log "✅ Seed complete"
    ;;

  # ---- Run the review funnel manually (test) ----
  funnel)
    log "⭐ Running review funnel (dry run)..."
    docker compose exec -T app wget --post-data='' -qO- "http://localhost:3000/api/reviews/checkout-funnel?dryRun=1"
    echo ""
    ;;

  # ---- Show status ----
  status)
    log "📊 Service status:"
    docker compose ps
    echo ""
    log "💾 Disk usage:"
    docker system df
    ;;

  # ---- Backup database ----
  backup)
    BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql.gz"
    log "💾 Backing up database to ${BACKUP_FILE}..."
    docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-guruvayur}" "${POSTGRES_DB:-guruvayur_dham}" | gzip > "${BACKUP_FILE}"
    log "✅ Backup saved: ${BACKUP_FILE}"
    ;;

  # ---- Restore database ----
  restore)
    if [ -z "$2" ]; then
      err "Usage: ./deploy.sh restore <backup-file.sql.gz>"
      exit 1
    fi
    log "♻️  Restoring database from $2..."
    gunzip -c "$2" | docker compose exec -T postgres psql -U "${POSTGRES_USER:-guruvayur}" "${POSTGRES_DB:-guruvayur_dham}"
    log "✅ Restore complete"
    ;;

  *)
    echo "Usage: ./deploy.sh [deploy|quick|build|logs|stop|db|seed|funnel|status|backup|restore <file>]"
    echo ""
    echo "Commands:"
    echo "  deploy    Full deploy (default) — git pull, build, restart, migrate, seed"
    echo "  quick     Quick restart (no rebuild)"
    echo "  build     Build only (no start)"
    echo "  logs      Tail app logs"
    echo "  stop      Stop all services"
    echo "  db        Apply database schema changes (prisma db push)"
    echo "  seed      Run seed scripts"
    echo "  funnel    Test the review funnel (dry run)"
    echo "  status    Show service status + disk usage"
    echo "  backup    Backup database to backup-YYYYMMDD-HHMMSS.sql.gz"
    echo "  restore   Restore database from a backup file"
    exit 1
    ;;
esac
