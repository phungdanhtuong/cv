#!/bin/bash

# 🚀 Deploy to /home/admin1/cv folder

echo "🚀 Deploying to /home/admin1/cv..."
echo "===================================="

APP_DIR="/home/admin1/cv"
REPO_URL="https://github.com/phungdanhtuong/doan_web1.git"

# 1. Create cv folder if not exists
mkdir -p $APP_DIR
cd $APP_DIR

echo "✓ Working in: $APP_DIR"
ls -la

# 2. Clone code directly into cv folder
echo ""
echo "📥 Cloning code..."
git clone $REPO_URL .

# 3. Setup environment
echo ""
echo "⚙️  Setting up environment..."
cp .env.example .env

echo ""
echo "⚠️  IMPORTANT: Edit .env with your API keys"
echo "nano /home/admin1/cv/.env"
echo ""
echo "Add these values:"
echo "  CLAUDE_API_KEY=sk-ant-..."
echo "  DB_PASSWORD=your_password"
echo "  JWT_SECRET=your_secret"
echo ""

# 4. Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo "Backend..."
cd $APP_DIR/backend
npm install --production

echo "Frontend..."
cd $APP_DIR/frontend
npm install
npm run build

# 5. Setup database
echo ""
echo "🗄️  Setting up database..."
cd $APP_DIR/backend
npm run db:setup || echo "⚠️  Database setup skipped (PostgreSQL may not be installed)"

# 6. Done
echo ""
echo "===================================="
echo "✅ DEPLOYMENT TO CV FOLDER COMPLETE!"
echo "===================================="
echo ""
echo "📁 Code location: /home/admin1/cv"
echo ""
echo "▶️  To start:"
echo "   1. Edit .env: nano /home/admin1/cv/.env"
echo "   2. Backend:   cd /home/admin1/cv/backend && npm start"
echo "   3. Frontend:  cd /home/admin1/cv/frontend && npm start"
echo ""
echo "🌐 Access:"
echo "   Frontend: http://100.87.118.45:3000"
echo "   Backend:  http://100.87.118.45:5000"
