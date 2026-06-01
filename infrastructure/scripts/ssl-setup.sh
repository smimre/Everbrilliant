#!/bin/bash
# ══════════════════════════════════════════════════════════════
# EVERBRILLIANT — SSL Certificate Setup (Let's Encrypt)
# Usage: sudo bash ssl-setup.sh yourdomain.com admin@yourdomain.com
# ══════════════════════════════════════════════════════════════
set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-admin@$DOMAIN}"

[ -n "$DOMAIN" ] || { echo "Usage: $0 <domain> [email]"; exit 1; }
[ "$EUID" -eq 0 ] || { echo "Run as root"; exit 1; }

echo "🔐 Setting up SSL for: $DOMAIN"

# Install certbot
apt-get install -y -qq certbot

# Get certificate (standalone, port 80 must be free)
certbot certonly \
  --standalone \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

# Copy to nginx ssl dir
mkdir -p /opt/everbrilliant/infrastructure/ssl
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/everbrilliant/infrastructure/ssl/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem   /opt/everbrilliant/infrastructure/ssl/
chmod 644 /opt/everbrilliant/infrastructure/ssl/*.pem

# Auto-renew cron
(crontab -l 2>/dev/null; echo "0 12 * * * certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/*.pem /opt/everbrilliant/infrastructure/ssl/ && docker exec eb_nginx nginx -s reload") | crontab -

echo "✅ SSL setup complete for $DOMAIN"
echo "   Certificate: /opt/everbrilliant/infrastructure/ssl/fullchain.pem"
echo "   Auto-renew: daily at 12:00"
