#!/bin/bash
# ══════════════════════════════════════════════════════════════
# EVERBRILLIANT — VPS Initial Setup
# Run once on fresh Ubuntu 22.04 (187.127.88.138)
# Usage: sudo bash server-setup.sh
# ══════════════════════════════════════════════════════════════
set -euo pipefail

log() { echo -e "\033[0;32m[SETUP] $1\033[0m"; }
err() { echo -e "\033[0;31m[ERROR] $1\033[0m" >&2; exit 1; }

[ "$EUID" -eq 0 ] || err "Run as root: sudo bash server-setup.sh"

log "Starting Everbrilliant VPS setup..."
log "Server: $(hostname -I | awk '{print $1}')"
log "OS: $(lsb_release -d | cut -f2)"

# ── 1. System update ──────────────────────────────────────────
log "1/8 Updating system..."
apt-get update -qq && apt-get upgrade -y -qq
apt-get install -y -qq \
  curl wget git unzip htop iotop ncdu fail2ban ufw \
  ca-certificates gnupg lsb-release software-properties-common

# ── 2. Docker ─────────────────────────────────────────────────
log "2/8 Installing Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker && systemctl start docker
fi

# Docker Compose v2
if ! command -v docker-compose &>/dev/null; then
  curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
    -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
fi
log "Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"

# ── 3. Deploy user ────────────────────────────────────────────
log "3/8 Creating deploy user..."
if ! id "deployer" &>/dev/null; then
  useradd -m -s /bin/bash -G docker,sudo deployer
  mkdir -p /home/deployer/.ssh
  chmod 700 /home/deployer/.ssh
  touch /home/deployer/.ssh/authorized_keys
  chmod 600 /home/deployer/.ssh/authorized_keys
  chown -R deployer:deployer /home/deployer/.ssh
  log "User 'deployer' created — add your SSH public key to /home/deployer/.ssh/authorized_keys"
fi

# ── 4. App directory ──────────────────────────────────────────
log "4/8 Creating app directories..."
mkdir -p /opt/everbrilliant
mkdir -p /opt/everbrilliant-backups
chown -R deployer:deployer /opt/everbrilliant /opt/everbrilliant-backups

# ── 5. Firewall (UFW) ─────────────────────────────────────────
log "5/8 Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment "SSH"
ufw allow 80/tcp comment "HTTP"
ufw allow 443/tcp comment "HTTPS"
ufw --force enable
log "Firewall: $(ufw status | head -1)"

# ── 6. fail2ban ───────────────────────────────────────────────
log "6/8 Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << 'FAIL2BAN'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
maxretry = 3

[nginx-req-limit]
enabled = true
filter = nginx-req-limit
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
maxretry = 10
FAIL2BAN
systemctl enable fail2ban && systemctl restart fail2ban

# ── 7. Sysctl tuning ──────────────────────────────────────────
log "7/8 Tuning kernel parameters..."
cat >> /etc/sysctl.conf << 'SYSCTL'
# Network performance
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15
net.core.netdev_max_backlog = 65535
# Memory
vm.swappiness = 10
vm.dirty_ratio = 60
vm.dirty_background_ratio = 5
SYSCTL
sysctl -p >/dev/null 2>&1

# ── 8. Swap ───────────────────────────────────────────────────
log "8/8 Creating 2GB swap..."
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# ── Setup cron jobs ───────────────────────────────────────────
log "Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "# Everbrilliant maintenance") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * * docker exec eb_postgres psql -U ebuser everbrilliant -c 'SELECT cleanup_expired_sessions();' >> /var/log/eb-cleanup.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 4 * * 0 docker exec eb_postgres psql -U ebuser everbrilliant -c 'SELECT cleanup_old_notifications();' >> /var/log/eb-cleanup.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * docker exec eb_postgres psql -U ebuser everbrilliant -c 'SELECT refresh_dashboard_stats();' >> /var/log/eb-refresh.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/everbrilliant/infrastructure/scripts/backup.sh >> /var/log/eb-backup.log 2>&1") | crontab -

log ""
log "════════════════════════════════════════════"
log " Server setup complete! ✅"
log "════════════════════════════════════════════"
log ""
log " Next steps:"
log " 1. Add SSH key: echo 'YOUR_PUBLIC_KEY' >> /home/deployer/.ssh/authorized_keys"
log " 2. Upload app: scp -r . deployer@187.127.88.138:/opt/everbrilliant"
log " 3. Setup env: cp .env.production /opt/everbrilliant/.env.production && nano /opt/everbrilliant/.env.production"
log " 4. Get SSL: ./infrastructure/scripts/ssl-setup.sh yourdomain.com"
log " 5. Deploy: ./infrastructure/scripts/deploy.sh full"
log ""
