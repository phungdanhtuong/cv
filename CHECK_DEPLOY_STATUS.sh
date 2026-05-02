#!/bin/bash

# 🔍 Kiểm tra deployment status

echo "🔍 Checking Deployment Status..."
echo "=================================="
echo ""

# 1. Kiểm tra folder
echo "1️⃣  Checking folders..."
echo "---"
if [ -d "/home/admin1/doan_web1" ]; then
    echo "✅ /home/admin1/doan_web1 exists"
    ls -lah /home/admin1/doan_web1 | head -10
else
    echo "❌ /home/admin1/doan_web1 NOT found"
fi

echo ""
if [ -d "/home/admin1/cv" ]; then
    echo "✅ /home/admin1/cv exists"
    ls -lah /home/admin1/cv
else
    echo "❌ /home/admin1/cv NOT found"
fi

# 2. Kiểm tra processes
echo ""
echo "2️⃣  Checking running processes..."
echo "---"
echo "Node.js processes:"
ps aux | grep -E "node|npm" | grep -v grep || echo "❌ No Node processes found"

echo ""
echo "PM2 status:"
pm2 status 2>/dev/null || echo "❌ PM2 not running"

# 3. Kiểm tra ports
echo ""
echo "3️⃣  Checking ports..."
echo "---"
echo "Port 3000 (Frontend):"
lsof -i :3000 2>/dev/null | grep -v COMMAND || echo "❌ Not running"

echo ""
echo "Port 5000 (Backend):"
lsof -i :5000 2>/dev/null | grep -v COMMAND || echo "❌ Not running"

echo ""
echo "Port 80 (HTTP):"
lsof -i :80 2>/dev/null | grep -v COMMAND || echo "❌ Not running"

echo ""
echo "Port 443 (HTTPS):"
lsof -i :443 2>/dev/null | grep -v COMMAND || echo "❌ Not running"

# 4. Kiểm tra services
echo ""
echo "4️⃣  Checking services..."
echo "---"
echo "PostgreSQL:"
systemctl status postgresql 2>/dev/null | grep Active || sudo systemctl status postgresql 2>/dev/null || echo "⚠️  Check manually: systemctl status postgresql"

echo ""
echo "Nginx:"
systemctl status nginx 2>/dev/null | grep Active || sudo systemctl status nginx 2>/dev/null || echo "⚠️  Check manually: systemctl status nginx"

# 5. Kiểm tra .env
echo ""
echo "5️⃣  Checking .env file..."
echo "---"
if [ -f "/home/admin1/doan_web1/.env" ]; then
    echo "✅ .env exists"
    echo "Content preview:"
    head -5 /home/admin1/doan_web1/.env
else
    echo "❌ .env NOT found"
fi

# 6. Kiểm tra logs
echo ""
echo "6️⃣  Recent logs..."
echo "---"
if [ -d "/home/admin1/doan_web1/logs" ]; then
    echo "Backend logs:"
    tail -5 /home/admin1/doan_web1/logs/backend-error.log 2>/dev/null || echo "No backend logs yet"
fi

echo ""
echo "=================================="
echo "✓ Status check complete!"
