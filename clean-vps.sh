#!/bin/bash

# Script para limpar completamente a VPS antes de instalar o ChatCRM

echo "=========================================="
echo "LIMPEZA COMPLETA DA VPS"
echo "=========================================="
echo ""
echo "⚠️  AVISO: Este script irá apagar TUDO da VPS!"
echo "Pressione Ctrl+C para cancelar ou Enter para continuar..."
read

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

# 1. Parar serviços
print_info "Parando serviços..."
systemctl stop nginx || true
systemctl stop chatcrm || true
systemctl stop postgresql || true
print_status "Serviços parados"

# 2. Remover diretórios
print_info "Removendo diretórios..."
rm -rf /opt/chatcrm || true
rm -rf /var/www/html/* || true
print_status "Diretórios removidos"

# 3. Remover PostgreSQL
print_info "Removendo PostgreSQL..."
apt-get remove -y postgresql postgresql-contrib || true
rm -rf /var/lib/postgresql || true
print_status "PostgreSQL removido"

# 4. Remover Node.js (opcional)
print_info "Removendo Node.js..."
apt-get remove -y nodejs || true
npm uninstall -g pnpm || true
print_status "Node.js removido"

# 5. Remover Nginx
print_info "Removendo Nginx..."
apt-get remove -y nginx || true
rm -rf /etc/nginx || true
print_status "Nginx removido"

# 6. Limpar cache apt
print_info "Limpando cache..."
apt-get autoremove -y
apt-get clean
print_status "Cache limpo"

# 7. Remover arquivos temporários
print_info "Removendo arquivos temporários..."
rm -rf /tmp/*
rm -rf /var/tmp/*
print_status "Arquivos temporários removidos"

echo ""
echo "=========================================="
echo -e "${GREEN}VPS Limpa Completamente!${NC}"
echo "=========================================="
echo ""
echo "Pronta para instalar o novo ChatCRM"
echo ""
