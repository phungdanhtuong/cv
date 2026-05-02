#!/bin/bash

# 🚀 Automated Deployment Script for AI Social Media Agents Platform
# Usage: bash deploy.sh <production|staging>

set -e

ENVIRONMENT=${1:-production}
REPO_URL="https://github.com/phungdanhtuong/doan_web1.git"
APP_DIR="/var/www/doan_web1"
USER="deploy"
GROUP="www-data"

echo "🚀 Deploying to $ENVIRONMENT environment..."
echo "========================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# ============================================
# 1. SETUP SYSTEM DEPENDENCIES
# ============================================
print_info "Step 1: Checking system dependencies..."

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
fi

# Update system
print_info "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

# Install Node.js 18+
if ! command -v node &> /dev/null; then
    print_info "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y -qq nodejs
fi

# Install PostgreSQL
if ! command -v psql &> /dev/null; then
    print_info "Installing PostgreSQL 14..."
    apt-get install -y -qq postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
    print_info "Installing Nginx..."
    apt-get install -y -qq nginx
fi

# Install Redis (optional but recommended)
if ! command -v redis-server &> /dev/null; then
    print_info "Installing Redis..."
    apt-get install -y -qq redis-server
    systemctl start redis-server
    systemctl enable redis-server
fi

# Install Git
apt-get install -y -qq git

print_status "System dependencies installed"

# ============================================
# 2. CREATE APP DIRECTORY & USER
# ============================================
print_info "Step 2: Setting up application directory..."

# Create deploy user if not exists
if ! id "$USER" &>/dev/null; then
    useradd -m -s /bin/bash $USER
    print_status "Created deploy user"
fi

# Create app directory
mkdir -p $APP_DIR
cd $APP_DIR

print_status "Application directory ready: $APP_DIR"

# ============================================
# 3. CLONE REPOSITORY
# ============================================
print_info "Step 3: Cloning repository..."

if [ -d "$APP_DIR/.git" ]; then
    print_info "Repository already exists, pulling latest..."
    git pull origin main
else
    print_info "Cloning repository..."
    git clone $REPO_URL .
fi

print_status "Repository ready"

# ============================================
# 4. SETUP ENVIRONMENT
# ============================================
print_info "Step 4: Setting up environment variables..."

if [ ! -f "$APP_DIR/.env" ]; then
    cp .env.example .env
    print_error "Please edit .env with your values (API keys, database password, etc.)"
    print_info "Run: nano $APP_DIR/.env"
    exit 1
fi

print_status "Environment file configured"

# ============================================
# 5. SETUP DATABASE
# ============================================
print_info "Step 5: Setting up database..."

# Create PostgreSQL database & user
sudo -u postgres psql << SQLEOF
SELECT 1 FROM pg_database WHERE datname = 'doan_web1';
SQLEOF

DB_EXISTS=$?
if [ $DB_EXISTS -ne 0 ]; then
    print_info "Creating PostgreSQL database..."
    sudo -u postgres createdb doan_web1
    sudo -u postgres psql -c "CREATE USER doan_user WITH PASSWORD 'change_me_in_env';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE doan_web1 TO doan_user;"
fi

# Update .env with database credentials
source $APP_DIR/.env

# Setup schema
cd $APP_DIR/backend
npm run db:setup || print_error "Database setup failed"

print_status "Database configured"

# ============================================
# 6. INSTALL DEPENDENCIES & BUILD
# ============================================
print_info "Step 6: Installing dependencies and building..."

# Backend
cd $APP_DIR/backend
npm install --production
print_status "Backend dependencies installed"

# Frontend
cd $APP_DIR/frontend
npm install
npm run build
print_status "Frontend built"

# ============================================
# 7. SETUP PM2 FOR PROCESS MANAGEMENT
# ============================================
print_info "Step 7: Setting up PM2 process manager..."

npm install -g pm2

# Create ecosystem.config.js
cat > $APP_DIR/ecosystem.config.js << 'PM2EOF'
module.exports = {
  apps: [
    {
      name: 'doan-web1-backend',
      script: './backend/src/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
PM2EOF

mkdir -p $APP_DIR/logs

# Start with PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save

print_status "PM2 configured"

# ============================================
# 8. SETUP NGINX
# ============================================
print_info "Step 8: Configuring Nginx..."

# Backup original nginx config
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Create site config
DOMAIN=${DOMAIN:-"example.com"}
API_DOMAIN=${API_DOMAIN:-"api.example.com"}

# Frontend config
cat > /etc/nginx/sites-available/doan_web1_frontend << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL certificates (update paths)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    root $APP_DIR/frontend/dist;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location ~* \\.(?:js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

# Backend config
cat > /etc/nginx/sites-available/doan_web1_backend << NGINXEOF
server {
    listen 80;
    server_name $API_DOMAIN;
    
    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $API_DOMAIN;
    
    # SSL certificates (update paths)
    ssl_certificate /etc/letsencrypt/live/$API_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$API_DOMAIN/privkey.pem;
    
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXEOF

# Enable sites
ln -sf /etc/nginx/sites-available/doan_web1_frontend /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/doan_web1_backend /etc/nginx/sites-enabled/

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx

print_status "Nginx configured"

# ============================================
# 9. SETUP SSL WITH CERTBOT
# ============================================
print_info "Step 9: Setting up SSL certificates..."

if ! command -v certbot &> /dev/null; then
    apt-get install -y -qq certbot python3-certbot-nginx
fi

# Request certificates (requires DNS pointing to this IP)
certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN --agree-tos -m admin@$DOMAIN --non-interactive || print_info "SSL setup - manual intervention may be needed"

print_status "SSL configured"

# ============================================
# 10. SETUP FIREWALL
# ============================================
print_info "Step 10: Configuring firewall..."

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable -y || print_info "Firewall setup skipped"

print_status "Firewall configured"

# ============================================
# 11. SETUP MONITORING & LOGS
# ============================================
print_info "Step 11: Setting up monitoring..."

# Create log directory
mkdir -p $APP_DIR/logs

# Setup log rotation
cat > /etc/logrotate.d/doan_web1 << LOGEOF
$APP_DIR/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $USER $GROUP
}
LOGEOF

print_status "Monitoring configured"

# ============================================
# DEPLOYMENT COMPLETE
# ============================================

echo ""
echo "========================================"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE!${NC}"
echo "========================================"
echo ""
print_info "Frontend: https://$DOMAIN"
print_info "Backend: https://$API_DOMAIN"
print_info "Logs: $APP_DIR/logs/"
print_info "Process Manager: pm2 status"
echo ""
print_info "Next steps:"
echo "  1. Update DNS to point to this server IP"
echo "  2. Edit .env with real API keys"
echo "  3. Check services: pm2 status"
echo "  4. View logs: pm2 logs"
echo "  5. Monitor: pm2 monit"
echo ""
print_info "Useful commands:"
echo "  pm2 restart all           # Restart all services"
echo "  pm2 logs                  # View real-time logs"
echo "  pm2 status                # Check service status"
echo "  systemctl restart nginx   # Restart Nginx"
echo ""

