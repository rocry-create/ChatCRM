#!/bin/bash

# ChatCRM - Script de Instalação Automática
# Este script instala tudo que é necessário para rodar o ChatCRM na VPS

set -e

echo "=========================================="
echo "ChatCRM - Instalação Automática"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

# 1. Atualizar sistema
print_info "Atualizando sistema..."
apt-get update
apt-get upgrade -y
print_status "Sistema atualizado"

# 2. Instalar Node.js
print_info "Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
print_status "Node.js instalado: $(node -v)"

# 3. Instalar PostgreSQL
print_info "Instalando PostgreSQL..."
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
print_status "PostgreSQL instalado"

# 4. Criar banco de dados
print_info "Criando banco de dados..."
sudo -u postgres psql << EOF
CREATE DATABASE chatcrm;
CREATE USER chatcrm_user WITH PASSWORD 'chatcrm_password_123';
ALTER ROLE chatcrm_user SET client_encoding TO 'utf8';
ALTER ROLE chatcrm_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE chatcrm_user SET default_transaction_deferrable TO on;
ALTER ROLE chatcrm_user SET default_transaction_read_only TO off;
ALTER ROLE chatcrm_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE chatcrm TO chatcrm_user;
EOF
print_status "Banco de dados criado"

# 5. Instalar pnpm
print_info "Instalando pnpm..."
npm install -g pnpm
print_status "pnpm instalado: $(pnpm -v)"

# 6. Clonar repositório
print_info "Clonando repositório..."
cd /opt
git clone https://github.com/rocry-create/chatcrm.git
cd chatcrm
print_status "Repositório clonado"

# 7. Instalar dependências backend
print_info "Instalando dependências do backend..."
cd backend
pnpm install
print_status "Dependências do backend instaladas"

# 8. Configurar .env backend
print_info "Configurando variáveis de ambiente..."
cat > .env << EOF
DATABASE_URL="postgresql://chatcrm_user:chatcrm_password_123@localhost:5432/chatcrm"
JWT_SECRET="sua-chave-secreta-muito-segura-aqui-$(openssl rand -hex 32)"
JWT_EXPIRE="7d"
PORT=3001
NODE_ENV="production"
CORS_ORIGIN="http://localhost:3000"
WHATSAPP_WEBHOOK_URL="http://seu-dominio.com/api/webhooks/whatsapp"
EOF
print_status "Variáveis de ambiente configuradas"

# 9. Executar migrations
print_info "Executando migrations do banco de dados..."
npx prisma migrate deploy
print_status "Migrations executadas"

# 10. Build backend
print_info "Fazendo build do backend..."
npm run build
print_status "Backend buildado"

# 11. Instalar dependências frontend
print_info "Instalando dependências do frontend..."
cd ../frontend
pnpm install
print_status "Dependências do frontend instaladas"

# 12. Build frontend
print_info "Fazendo build do frontend..."
pnpm build
print_status "Frontend buildado"

# 13. Criar arquivo de serviço systemd
print_info "Configurando serviço systemd..."
cat > /etc/systemd/system/chatcrm.service << EOF
[Unit]
Description=ChatCRM Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/chatcrm/backend
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable chatcrm
print_status "Serviço systemd configurado"

# 14. Instalar Nginx
print_info "Instalando Nginx..."
apt-get install -y nginx
print_status "Nginx instalado"

# 15. Configurar Nginx
print_info "Configurando Nginx..."
cat > /etc/nginx/sites-available/chatcrm << 'EOF'
upstream chatcrm_backend {
    server localhost:3001;
}

server {
    listen 80;
    server_name _;

    client_max_body_size 50M;

    # Frontend
    location / {
        root /opt/chatcrm/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
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
EOF

ln -sf /etc/nginx/sites-available/chatcrm /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
print_status "Nginx configurado"

echo ""
echo "=========================================="
echo -e "${GREEN}Instalação Concluída!${NC}"
echo "=========================================="
echo ""
echo "ChatCRM está pronto para usar!"
echo ""
echo "Acesse em: http://$(hostname -I | awk '{print $1}')"
echo ""
echo "Credenciais padrão:"
echo "Email: admin@chatcrm.com"
echo "Senha: 123456"
echo ""
echo "Para iniciar o serviço:"
echo "  systemctl start chatcrm"
echo ""
echo "Para ver os logs:"
echo "  journalctl -u chatcrm -f"
echo ""
