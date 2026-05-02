# 🚀 Deploy lên VPS - Step by Step

## Cách Dùng Automated Script

### Chuẩn bị

1. **Có VPS Ubuntu 20.04+ hoặc CentOS 7+**
2. **Có SSH access root hoặc sudo**
3. **Có domain name** (hoặc dùng IP)
4. **Có API keys:**
   - Claude API key
   - Facebook/Meta credentials (optional)

### 3 Command Để Deploy

```bash
# Bước 1: Upload code lên VPS
git clone https://github.com/phungdanhtuong/doan_web1.git
cd doan_web1

# Bước 2: Chạy deployment script
sudo bash deploy.sh production

# Bước 3: Edit .env với API keys
nano .env
# Thêm:
# CLAUDE_API_KEY=sk-ant-...
# DB_PASSWORD=your_secure_password
# Ctrl+O → Enter → Ctrl+X để save
```

**Xong! Web sẽ chạy tại:**
- Frontend: `https://example.com`
- Backend: `https://api.example.com`

---

## Deploy Script Làm Gì?

```
✅ Install Node.js 18+
✅ Install PostgreSQL 14
✅ Install Nginx
✅ Install Redis (optional)
✅ Clone code từ Git
✅ Setup database
✅ Install dependencies
✅ Build frontend
✅ Setup PM2 (process manager)
✅ Setup Nginx reverse proxy
✅ Setup SSL certificates (Let's Encrypt)
✅ Setup firewall
✅ Setup log rotation
```

**Thời gian:** ~10-15 phút

---

## Chi Tiết Script

### 1. System Setup
```bash
# Cài Node.js 18
# Cài PostgreSQL 14
# Cài Nginx
# Cài Redis
```

### 2. App Setup
```bash
# Clone code
# Copy .env.example → .env
# Setup PostgreSQL database
# npm install dependencies
# npm run build
```

### 3. Process Manager (PM2)
```bash
# PM2 quản lý backend process
# Auto restart nếu crash
# Cluster mode (multiple instances)
```

### 4. Nginx Reverse Proxy
```bash
# Frontend: example.com → dist/
# Backend: api.example.com → localhost:5000
# SSL/HTTPS configured
```

### 5. Firewall
```bash
# Port 22 (SSH) - mở
# Port 80 (HTTP) - mở
# Port 443 (HTTPS) - mở
# Port khác - đóng
```

---

## Troubleshooting

### ❌ "Permission denied" khi chạy script
```bash
# Make sure you're root or using sudo
sudo bash deploy.sh production
```

### ❌ "Port 80 already in use"
```bash
# Check what's using port 80
sudo lsof -i :80

# Kill process
sudo kill -9 <PID>

# Or change Nginx port in config
sudo nano /etc/nginx/sites-available/doan_web1_frontend
# Change: listen 80; → listen 8080;
```

### ❌ "Database error"
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if database exists
sudo -u postgres psql -l | grep doan_web1

# Manually create if missing
sudo -u postgres createdb doan_web1
```

### ❌ "SSL certificate failed"
```bash
# Script requires DNS pointing to server IP first
# Check DNS: nslookup example.com

# If DNS not ready, certbot will skip
# Setup DNS, then run:
sudo certbot certonly --nginx -d example.com
```

### ❌ "npm install fails"
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### ❌ "Can't connect to backend"
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs doan-web1-backend

# Restart
pm2 restart all

# Check port 5000
sudo lsof -i :5000
```

---

## Commands Hữu Ích

```bash
# Process Management
pm2 status                  # Xem status
pm2 logs                    # Xem logs real-time
pm2 logs doan-web1-backend  # Logs of backend only
pm2 restart all             # Restart all
pm2 stop all                # Stop all
pm2 start all               # Start all
pm2 monit                   # Monitor CPU/Memory

# Nginx
sudo systemctl status nginx     # Check status
sudo systemctl restart nginx    # Restart
sudo systemctl reload nginx     # Reload config
sudo nginx -t                   # Test config

# PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -d doan_web1  # Connect to DB

# Logs
tail -f /var/log/nginx/error.log        # Nginx errors
tail -f $APP_DIR/logs/backend-error.log # Backend errors
```

---

## Sau Deploy - Kiểm Tra

### 1. Check Services
```bash
# Check all running
pm2 status
# Output should show: doan-web1-backend online

# Check Nginx
sudo systemctl status nginx
# Output should show: active (running)

# Check PostgreSQL
sudo systemctl status postgresql
# Output should show: active (running)
```

### 2. Test Frontend
```bash
# Visit https://example.com
# Should see login page
# Try register & login
```

### 3. Test Backend
```bash
# Test health endpoint
curl https://api.example.com/health

# Output should be:
# {
#   "status": "ok",
#   "database": "connected",
#   "timestamp": "2026-05-02..."
# }
```

### 4. Test Full Flow
- Register account
- Create content
- Create campaign
- View analytics

---

## Update & Maintenance

### Pull Latest Code
```bash
cd /var/www/doan_web1
git pull origin main
npm install --production
npm run build
pm2 restart all
```

### Backup Database
```bash
# Daily backup
sudo -u postgres pg_dump doan_web1 > backup_$(date +%Y%m%d).sql

# Restore from backup
sudo -u postgres psql doan_web1 < backup_20260502.sql
```

### Monitor Performance
```bash
pm2 monit          # Real-time monitoring
pm2 logs           # View logs
df -h              # Disk usage
free -h            # Memory usage
top                # CPU usage
```

---

## Security Checklist

- [ ] .env not in git repo
- [ ] SSL/HTTPS enabled
- [ ] Firewall configured (only 22, 80, 443)
- [ ] Database password is strong
- [ ] API keys in .env only
- [ ] Nginx headers configured
- [ ] Regular backups setup
- [ ] Monitor logs for errors
- [ ] Update dependencies monthly

---

## Deploy Pada Lain - Heroku

```bash
# Nếu prefer PaaS thay vì VPS

heroku create doan-web1
git push heroku main

heroku addons:create heroku-postgresql:standard-0
heroku config:set CLAUDE_API_KEY=sk-ant-...

# Done! Deploy otomatis setiap git push
```

---

## Contoh Real

**Jika VPS IP = 123.45.67.89**

```
1. Setup DNS:
   example.com → 123.45.67.89
   api.example.com → 123.45.67.89

2. SSH vào VPS:
   ssh root@123.45.67.89

3. Clone & deploy:
   git clone https://github.com/phungdanhtuong/doan_web1.git
   cd doan_web1
   sudo bash deploy.sh production

4. Edit .env:
   nano .env
   # Add API keys

5. Check status:
   pm2 status
   curl https://example.com/health

6. Done! ✅
   https://example.com = Frontend live
   https://api.example.com = Backend live
```

---

**Script này sẽ handle 90% setup!**

Chỉ cần:
1. Upload script
2. Chạy: `sudo bash deploy.sh production`
3. Edit .env
4. Done! 🚀

Tất cả configuration (Nginx, PM2, SSL, Firewall, Logs) tự động setup!
