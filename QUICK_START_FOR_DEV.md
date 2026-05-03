# 🚀 Deploy Ngay - 1 Command Duy Nhất

## Cho Dev Team:

```bash
ssh admin1@100.87.118.45 && \
mkdir -p /home/admin1/cv && \
cd /home/admin1/cv && \
git clone https://github.com/phungdanhtuong/cv.git . && \
cp .env.example .env && \
echo "Nhập API keys vào .env (nano .env)" && \
cd backend && npm install --production && npm start &
```

**Frontend (terminal khác):**
```bash
cd /home/admin1/cv/frontend && npm install && npm run build && npm start
```

---

## Hoặc Tự Động Hóa 100%:

```bash
bash -c '
ssh admin1@100.87.118.45 << DEPLOY
set -e
mkdir -p /home/admin1/cv
cd /home/admin1/cv
git clone https://github.com/phungdanhtuong/cv.git .
cp .env.example .env

# Auto setup (thêm API keys vào đây)
sed -i "s/your_claude_api_key_here/sk-ant-YOUR_KEY/" .env
sed -i "s/your_password/postgres/" .env

# Install & Start
cd backend
npm install --production
npm start &

cd ../frontend
npm install
npm run build
npm start &

echo "✅ Deploy complete! Frontend: :3000, Backend: :5000"
DEPLOY
'
```

---

## Hoặc Dùng PM2 (Production):

```bash
ssh admin1@100.87.118.45 << 'DEPLOY'
mkdir -p /home/admin1/cv
cd /home/admin1/cv
git clone https://github.com/phungdanhtuong/cv.git .
cp .env.example .env
# Edit .env với API keys

npm install -g pm2

# Backend
cd backend && npm install --production
pm2 start "npm start" --name backend

# Frontend
cd ../frontend && npm install && npm run build
pm2 start "npm start" --name frontend

pm2 save
pm2 status

echo "✅ Services running! Check: pm2 status"
DEPLOY
```

---

**Chọn 1 cái, copy-paste, xong!** 🎉
