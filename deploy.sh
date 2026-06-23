#!/bin/bash

set -e

echo "=========================================="
echo "ChatCRM Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}This script must be run as root${NC}"
  exit 1
fi

# Configuration
REPO_URL="${1:-https://github.com/rocry-create/chatcrm.git}"
DEPLOY_DIR="/opt/chatcrm"
DOMAIN="${2:-chatcrm.local}"

echo -e "${YELLOW}Repository: $REPO_URL${NC}"
echo -e "${YELLOW}Deploy Directory: $DEPLOY_DIR${NC}"
echo -e "${YELLOW}Domain: $DOMAIN${NC}"

# Step 1: Install dependencies
echo -e "\n${YELLOW}[1/8] Installing system dependencies...${NC}"
apt-get update
apt-get install -y \
  curl \
  wget \
  git \
  docker.io \
  docker-compose \
  nginx \
  certbot \
  python3-certbot-nginx \
  ufw

# Step 2: Start Docker
echo -e "\n${YELLOW}[2/8] Starting Docker service...${NC}"
systemctl start docker
systemctl enable docker
usermod -aG docker root

# Step 3: Clone repository
echo -e "\n${YELLOW}[3/8] Cloning repository...${NC}"
if [ -d "$DEPLOY_DIR" ]; then
  echo "Directory already exists, pulling latest changes..."
  cd "$DEPLOY_DIR"
  git pull origin main
else
  git clone "$REPO_URL" "$DEPLOY_DIR"
  cd "$DEPLOY_DIR"
fi

# Step 4: Create .env file
echo -e "\n${YELLOW}[4/8] Creating .env file...${NC}"
if [ ! -f "$DEPLOY_DIR/.env" ]; then
  cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
  
  # Generate secure JWT secret
  JWT_SECRET=$(openssl rand -base64 32)
  MYSQL_PASSWORD=$(openssl rand -base64 16)
  EVOLUTION_API_KEY=$(openssl rand -base64 16)
  
  # Update .env file
  sed -i "s|your-super-secret-jwt-key-change-in-production|$JWT_SECRET|g" "$DEPLOY_DIR/.env"
  sed -i "s|chatcrm123|$MYSQL_PASSWORD|g" "$DEPLOY_DIR/.env"
  sed -i "s|your-evolution-api-key|$EVOLUTION_API_KEY|g" "$DEPLOY_DIR/.env"
  sed -i "s|admin@chatcrm.local|admin@$DOMAIN|g" "$DEPLOY_DIR/.env"
  
  echo -e "${GREEN}.env file created with secure credentials${NC}"
else
  echo ".env file already exists, skipping..."
fi

# Step 5: Build and start Docker containers
echo -e "\n${YELLOW}[5/8] Building and starting Docker containers...${NC}"
cd "$DEPLOY_DIR"
docker-compose down || true
docker-compose up -d --build

# Wait for services to be ready
echo -e "\n${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Step 6: Run database migrations
echo -e "\n${YELLOW}[6/8] Running database migrations...${NC}"
docker-compose exec -T app pnpm db:push || true

# Step 7: Configure Nginx
echo -e "\n${YELLOW}[7/8] Configuring Nginx...${NC}"
cp "$DEPLOY_DIR/nginx.conf" /etc/nginx/sites-available/chatcrm
sed -i "s|your-domain|$DOMAIN|g" /etc/nginx/sites-available/chatcrm

# Enable site
ln -sf /etc/nginx/sites-available/chatcrm /etc/nginx/sites-enabled/chatcrm
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Step 8: Setup SSL with Certbot (optional)
echo -e "\n${YELLOW}[8/8] Setting up SSL certificate...${NC}"
if [ "$DOMAIN" != "chatcrm.local" ]; then
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN || true
  systemctl reload nginx
else
  echo "Skipping SSL setup for local domain"
fi

# Configure firewall
echo -e "\n${YELLOW}Configuring firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Display summary
echo -e "\n${GREEN}=========================================="
echo "ChatCRM Deployment Complete!"
echo "==========================================${NC}"
echo -e "\nAccess your ChatCRM at: ${GREEN}https://$DOMAIN${NC}"
echo -e "API URL: ${GREEN}https://$DOMAIN/api${NC}"
echo -e "\nDocker containers:"
docker-compose ps

echo -e "\n${YELLOW}Important: Update your .env file with correct credentials${NC}"
echo -e "Location: ${GREEN}$DEPLOY_DIR/.env${NC}"

echo -e "\n${YELLOW}To view logs:${NC}"
echo "docker-compose logs -f"

echo -e "\n${YELLOW}To restart services:${NC}"
echo "docker-compose restart"
