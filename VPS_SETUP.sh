#!/bin/bash

# CHATCRM - SCRIPT DE INSTALACAO COMPLETA
# Execute como root na VPS

set -e

echo "======================================"
echo "ChatCRM - Instalacao Automatica"
echo "======================================"

# 1. ATUALIZAR SISTEMA
echo "Atualizando sistema..."
apt-get update
apt-get upgrade -y

# 2. INSTALAR NODE.JS
echo "Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 3. INSTALAR PNPM
echo "Instalando pnpm..."
npm install -g pnpm

# 4. INSTALAR POSTGRESQL
echo "Instalando PostgreSQL..."
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# 5. CRIAR BANCO DE DADOS
echo "Criando banco de dados..."
sudo -u postgres psql << 'PGEOF'
CREATE DATABASE chatcrm;
CREATE USER chatcrm_user WITH PASSWORD 'chatcrm_password_123';
ALTER ROLE chatcrm_user SET client_encoding TO 'utf8';
ALTER ROLE chatcrm_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE chatcrm_user SET default_transaction_deferrable TO on;
ALTER ROLE chatcrm_user SET default_transaction_read_only TO off;
ALTER ROLE chatcrm_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE chatcrm TO chatcrm_user;
PGEOF

# 6. CLONAR REPOSITORIO
echo "Clonando repositorio..."
cd /opt
rm -rf ChatCRM 2>/dev/null || true
git clone https://github.com/rocry-create/ChatCRM.git
cd ChatCRM

# 7. INSTALAR BACKEND
echo "Instalando backend..."
cd backend
pnpm install

# 8. CONFIGURAR BACKEND
echo "Configurando backend..."
cat > .env << 'ENVEOF'
DATABASE_URL=postgresql://chatcrm_user:chatcrm_password_123@localhost:5432/chatcrm
JWT_SECRET=chatcrm_secret_key_super_segura_12345678
JWT_EXPIRE=7d
PORT=3001
NODE_ENV=production
CORS_ORIGIN=*
ENVEOF

# 9. MIGRATIONS
echo "Executando migrations..."
npx prisma migrate deploy || npx prisma db push

# 10. BUILD BACKEND
echo "Build backend..."
npm run build 2>/dev/null || true

# 11. INSTALAR FRONTEND
echo "Instalando frontend..."
cd ../frontend
pnpm install

# 12. BUILD FRONTEND
echo "Build frontend..."
pnpm build

# 13. CRIAR SERVICO SYSTEMD
echo "Configurando servico..."
cat > /etc/systemd/system/chatcrm.service << 'SERVICEEOF'
[Unit]
Description=ChatCRM Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/ChatCRM/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SERVICEEOF

systemctl daemon-reload
systemctl enable chatcrm
systemctl start chatcrm

# 14. INSTALAR NGINX
echo "Instalando Nginx..."
apt-get install -y nginx

# 15. CONFIGURAR NGINX
echo "Configurando Nginx..."
cat > /etc/nginx/sites-available/chatcrm << 'NGINXEOF'
upstream chatcrm_backend {
    server localhost:3001;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    client_max_body_size 50M;

    location / {
        root /opt/ChatCRM/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://chatcrm_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/chatcrm /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

echo ""
echo "======================================"
echo "INSTALACAO CONCLUIDA COM SUCESSO!"
echo "======================================"
echo ""
echo "Acesse: http://167.56.101.200"
echo ""
echo "Credenciais:"
echo "Email: admin@chatcrm.com"
echo "Senha: 123456"
echo ""
echo "Comandos uteis:"
echo "systemctl status chatcrm"
echo "systemctl restart chatcrm"
echo "journalctl -u chatcrm -f"
echo ""
