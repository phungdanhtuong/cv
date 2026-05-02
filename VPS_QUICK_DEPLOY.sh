#!/bin/bash

# 🚀 Quick Deploy Script
# Run this directly on VPS: bash VPS_QUICK_DEPLOY.sh

REPO_URL="https://github.com/phungdanhtuong/doan_web1.git"
APP_DIR="/home/admin1/doan_web1"

echo "🚀 Deploying AI Social Media Agents Platform..."
echo "================================================"

# 1. Create directory
mkdir -p /home/admin1/cv
cd /home/admin1/cv

echo "✓ Created cv folder at /home/admin1/cv"
ls -la /home/admin1/

# 2. Clone code
if [ ! -d "$APP_DIR/.git" ]; then
    echo "Cloning repository..."
    git clone $REPO_URL $APP_DIR
else
    echo "Repository exists, pulling latest..."
    cd $APP_DIR && git pull origin main
fi

cd $APP_DIR

# 3. Check environment
echo ""
echo "System Check:"
echo "============"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Git: $(git --version)"
echo "PostgreSQL: $(psql --version 2>/dev/null || echo 'Not installed')"

# 4. Install dependencies
echo ""
echo "Installing dependencies..."
cd $APP_DIR/frontend && npm install
cd $APP_DIR/backend && npm install

# 5. Build frontend
echo ""
echo "Building frontend..."
cd $APP_DIR/frontend && npm run build

# 6. Setup environment
if [ ! -f "$APP_DIR/.env" ]; then
    echo ""
    echo "⚠️  Please create .env file at: $APP_DIR/.env"
    echo "   Copy from .env.example and add your API keys"
    cp $APP_DIR/.env.example $APP_DIR/.env
fi

echo ""
echo "================================================"
echo "✓ DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Edit .env with your API keys:"
echo "   nano $APP_DIR/.env"
echo ""
echo "2. Setup database (if PostgreSQL is installed):"
echo "   cd $APP_DIR/backend && npm run db:setup"
echo ""
echo "3. Start backend:"
echo "   cd $APP_DIR/backend && npm run dev"
echo ""
echo "4. Start frontend (in another terminal):"
echo "   cd $APP_DIR/frontend && npm start"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
