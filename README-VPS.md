# Guruvayur Dham — VPS Deployment Guide

This guide walks you through deploying the app to any VPS (DigitalOcean, Hetzner, Hostinger, AWS Lightsail, etc.) using Docker Compose.

## What You Get

| Service | Purpose | Port |
|---------|---------|------|
| **Caddy** | Reverse proxy + auto HTTPS (Let's Encrypt) | 80, 443 |
| **App** | Next.js production server | 3000 (internal) |
| **Postgres** | Database | 5432 (internal) |
| **Cron** | Review funnel (runs every 15 min) | — |

All services run in Docker containers. No node/npm/postgres needed on the host.

---

## Prerequisites

1. **A VPS** with:
   - Ubuntu 22.04+ or Debian 12+ (recommended)
   - At least 1 GB RAM (2 GB recommended)
   - 20 GB SSD
   - Root or sudo access

2. **A domain name** pointing to your VPS IP address:
   - Add an **A record**: `@ → your-vps-ip`
   - Add an **A record**: `www → your-vps-ip`
   - Wait for DNS to propagate (5-30 min): `dig +short guruvayurdham.com`

3. **Docker + Docker Compose** installed on the VPS:
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   # Log out and back in for the group change to take effect
   ```

---

## Step-by-Step Setup

### 1. Clone the repo

```bash
git clone https://github.com/ayanalidar/guruvayur-dham.git
cd guruvayur-dham
```

### 2. Configure environment

```bash
cp .env.example .env
nano .env
```

Set at minimum:
- `DOMAIN=guruvayurdham.com` (your actual domain)
- `POSTGRES_PASSWORD=choose_a_strong_password`
- `NEXTAUTH_SECRET=$(openssl rand -base64 32)`
- `DATABASE_URL` is auto-set by docker-compose — don't change it

Optional (for production features):
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — for payments
- `WHATSAPP_*` — for WhatsApp chatbot + review funnel
- `GOOGLE_CLIENT_*` / `FACEBOOK_CLIENT_*` — for OAuth login

### 3. Deploy

```bash
./deploy.sh
```

This will:
1. Pull latest code from GitHub
2. Build the Docker image
3. Start all services (app, postgres, caddy, cron)
4. Apply database schema (`prisma db push`)
5. Seed the database (rooms, content blocks, CMS data)

The first build takes ~5 minutes. Subsequent builds are faster (cached layers).

### 4. Verify

- Visit `https://guruvayurdham.com` — site should load
- Visit `https://guruvayurdham.com/api/health` — should return `{"status":"ok"}`
- Visit `https://guruvayurdham.com/#/admin` — admin login (default PIN: ask the developer)

Caddy automatically obtained an SSL certificate from Let's Encrypt. ✅

---

## Common Operations

All operations use the `deploy.sh` script:

```bash
./deploy.sh              # Full deploy (git pull + build + restart + migrate + seed)
./deploy.sh quick        # Quick restart (no rebuild — use after small config changes)
./deploy.sh logs         # Tail app logs (Ctrl+C to exit)
./deploy.sh stop         # Stop all services
./deploy.sh db           # Apply database schema changes only
./deploy.sh seed         # Re-seed the database
./deploy.sh status       # Show service status + disk usage
./deploy.sh backup       # Backup database to backup-YYYYMMDD-HHMMSS.sql.gz
./deploy.sh restore backup-20260115-120000.sql.gz  # Restore from backup
./deploy.sh funnel       # Test the review funnel (dry run)
```

---

## Updating the Site

When you push new code to GitHub:

```bash
cd /path/to/guruvayur-dham
./deploy.sh
```

That's it. The script pulls the latest code, rebuilds, and restarts with zero downtime (Caddy handles connection draining).

---

## File Uploads

Image uploads are stored in a Docker volume (`uploads_data`) at `/app/public/uploads/` inside the container. This persists across restarts and rebuilds.

To back up uploaded images:
```bash
docker compose cp app:/app/public/uploads ./uploads-backup
```

---

## Database Backups

**Automated daily backup** (recommended): add this to your crontab (`crontab -e`):
```bash
0 3 * * * cd /path/to/guruvayur-dham && ./deploy.sh backup >> backups.log 2>&1
```

**Manual backup**:
```bash
./deploy.sh backup
```

**Restore**:
```bash
./deploy.sh restore backup-20260115-120000.sql.gz
```

---

## Review Funnel (Post-Stay Google Reviews)

The review funnel runs automatically in a separate container (`guruvayur-cron`). Every 15 minutes, it:
1. Finds bookings that checked out ~2 hours ago
2. Sends a WhatsApp message with a Google Reviews link
3. Logs the send in the `ReviewRequest` table

To test it manually:
```bash
./deploy.sh funnel
```

**Note:** WhatsApp messages only send if `WHATSAPP_ACCESS_TOKEN` is set. Without it, requests are queued (status: `PENDING`) and you can send them manually via the admin dashboard.

---

## Monitoring

### View logs
```bash
./deploy.sh logs              # App logs
docker compose logs postgres  # Database logs
docker compose logs caddy     # Reverse proxy logs
docker compose logs cron      # Review funnel logs
```

### Check service status
```bash
./deploy.sh status
```

### Disk usage
```bash
docker system df
```

---

## SSL Certificates

Caddy automatically:
- Obtains Let's Encrypt certificates on first start
- Renews them 30 days before expiry
- Redirects HTTP → HTTPS
- Redirects `www` → non-`www`

No manual SSL configuration needed. Just make sure your domain's DNS points to the VPS before running `./deploy.sh`.

---

## Troubleshooting

### Site won't load
1. Check if containers are running: `./deploy.sh status`
2. Check app logs: `./deploy.sh logs`
3. Check if port 80/443 is open on your VPS firewall:
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```
4. Verify DNS: `dig +short yourdomain.com` should return your VPS IP

### Database connection errors
1. Check postgres is healthy: `docker compose ps postgres`
2. Check the DATABASE_URL in `.env` matches the postgres credentials
3. Restart postgres: `docker compose restart postgres`

### Image uploads fail
1. Check the uploads volume exists: `docker volume ls | grep uploads`
2. Check permissions: `docker compose exec app ls -la /app/public/uploads`
3. If using Vercel Blob (cloud storage), set `BLOB_READ_WRITE_TOKEN` in `.env`

### OOM (out of memory) errors
If the VPS has less than 2 GB RAM, add swap:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Migrating from Vercel

If you're moving from Vercel to a VPS:

1. **Export your data** from Vercel's Postgres / Neon:
   ```bash
   # On your local machine (with Vercel env vars)
   npx prisma db pull  # sync schema
   pg_dump "$DATABASE_URL" > vercel-backup.sql
   ```

2. **Set up the VPS** (follow Steps 1-3 above)

3. **Import the data**:
   ```bash
   # On the VPS
   cat vercel-backup.sql | docker compose exec -T postgres psql -U guruvayur guruvayur_dham
   ```

4. **Update DNS** to point to the VPS

5. **Verify** the site works, then cancel Vercel deployment

---

## Security Hardening (Recommended)

1. **Disable root SSH login**:
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Set: PermitRootLogin no
   # Set: PasswordAuthentication no (use SSH keys only)
   sudo systemctl restart sshd
   ```

2. **Enable firewall**:
   ```bash
   sudo ufw allow 22/tcp     # SSH
   sudo ufw allow 80/tcp     # HTTP
   sudo ufw allow 443/tcp    # HTTPS
   sudo ufw enable
   ```

3. **Install fail2ban** (blocks brute-force attacks):
   ```bash
   sudo apt install fail2ban -y
   ```

4. **Set up automatic security updates**:
   ```bash
   sudo apt install unattended-upgrades -y
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

---

## Support

If something breaks:
1. Check the logs: `./deploy.sh logs`
2. Check the troubleshooting section above
3. Open an issue on GitHub: https://github.com/ayanalidar/guruvayur-dham/issues
