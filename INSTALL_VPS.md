# Guia de Instalação ChatCRM em VPS

Este guia fornece instruções passo a passo para instalar e configurar o ChatCRM em uma VPS limpa com Ubuntu 20.04 LTS ou superior.

## Pré-requisitos

- VPS com Ubuntu 20.04 LTS ou superior
- Mínimo 2GB de RAM
- Mínimo 20GB de espaço em disco
- Acesso SSH como root
- Domínio apontado para o IP da VPS
- Conexão com a internet

## Instalação Rápida (Recomendada)

Se você quer uma instalação automática, execute:

```bash
# Conectar à VPS via SSH
ssh root@seu-ip-vps

# Download do script de deploy
wget https://raw.githubusercontent.com/rocry-create/chatcrm/main/deploy.sh

# Executar script
bash deploy.sh https://github.com/rocry-create/chatcrm.git seu-dominio.com.br
```

O script fará toda a configuração automaticamente. Pule para a seção "Após a Instalação".

## Instalação Manual

Se preferir instalar manualmente, siga os passos abaixo.

### Passo 1: Conectar à VPS

```bash
ssh root@seu-ip-vps
```

### Passo 2: Atualizar Sistema

```bash
apt-get update
apt-get upgrade -y
```

### Passo 3: Instalar Dependências

```bash
apt-get install -y \
  curl \
  wget \
  git \
  build-essential \
  software-properties-common \
  apt-transport-https \
  ca-certificates \
  gnupg \
  lsb-release
```

### Passo 4: Instalar Docker

```bash
# Adicionar repositório Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Iniciar Docker
systemctl start docker
systemctl enable docker

# Verificar instalação
docker --version
docker-compose --version
```

### Passo 5: Instalar Node.js (Opcional)

Se você quer compilar localmente:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt-get install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Verificar instalação
node --version
pnpm --version
```

### Passo 6: Instalar Nginx

```bash
apt-get install -y nginx

# Iniciar Nginx
systemctl start nginx
systemctl enable nginx
```

### Passo 7: Instalar Certbot (SSL)

```bash
apt-get install -y certbot python3-certbot-nginx
```

### Passo 8: Configurar Firewall

```bash
# Instalar UFW
apt-get install -y ufw

# Permitir SSH
ufw allow 22/tcp

# Permitir HTTP e HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Ativar firewall
ufw --force enable

# Verificar status
ufw status
```

### Passo 9: Clonar Repositório

```bash
# Criar diretório
mkdir -p /opt/chatcrm
cd /opt/chatcrm

# Clonar repositório
git clone https://github.com/rocry-create/chatcrm.git .
```

### Passo 10: Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo
nano .env
```

Configure as seguintes variáveis:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://chatcrm:chatcrm123@mysql:3306/chatcrm
JWT_SECRET=seu-secret-aleatorio-aqui
EVOLUTION_API_URL=http://evolution-api:8080
EVOLUTION_API_KEY=sua-chave-api-aqui
ADMIN_EMAIL=admin@seu-dominio.com.br
ADMIN_PASSWORD=sua-senha-segura-aqui
```

Para gerar secrets seguros:

```bash
# Gerar JWT_SECRET
openssl rand -base64 32

# Gerar EVOLUTION_API_KEY
openssl rand -base64 16
```

### Passo 11: Iniciar Containers Docker

```bash
cd /opt/chatcrm

# Iniciar serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

Aguarde alguns minutos para os serviços iniciarem.

### Passo 12: Executar Migrações do Banco

```bash
docker-compose exec app pnpm db:push
```

### Passo 13: Configurar Nginx

```bash
# Copiar configuração
cp /opt/chatcrm/nginx.conf /etc/nginx/sites-available/chatcrm

# Editar arquivo para seu domínio
nano /etc/nginx/sites-available/chatcrm
```

Substitua `your-domain` pelo seu domínio real.

```bash
# Habilitar site
ln -sf /etc/nginx/sites-available/chatcrm /etc/nginx/sites-enabled/chatcrm

# Desabilitar site padrão
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx
```

### Passo 14: Configurar SSL com Certbot

```bash
# Gerar certificado SSL
certbot --nginx -d seu-dominio.com.br --non-interactive --agree-tos --email admin@seu-dominio.com.br

# Recarregar Nginx
systemctl reload nginx

# Verificar certificado
certbot certificates
```

### Passo 15: Verificar Instalação

```bash
# Verificar se todos os containers estão rodando
docker-compose ps

# Verificar logs da aplicação
docker-compose logs app

# Testar acesso HTTP
curl http://localhost:3000

# Testar acesso HTTPS
curl https://seu-dominio.com.br
```

## Após a Instalação

### 1. Acessar o Sistema

Abra seu navegador e acesse:

```
https://seu-dominio.com.br
```

### 2. Fazer Login

Use as credenciais padrão:

- **Email**: `admin@chatcrm.local` (ou conforme configurado)
- **Senha**: `admin123` (ou conforme configurado)

### 3. Alterar Senha do Admin

1. Clique em "Configurações" > "Perfil"
2. Altere a senha para algo seguro
3. Salve as alterações

### 4. Configurar Evolution API

Se estiver usando Evolution API via Docker:

1. Acesse `https://seu-dominio.com.br/settings`
2. Vá para "Instâncias"
3. Clique em "Nova Instância"
4. Preencha os dados:
   - **Nome da Instância**: ex: "WhatsApp Principal"
   - **URL da API**: `http://evolution-api:8080`
   - **Chave da API**: (conforme configurado no `.env`)
5. Clique em "Salvar"

### 5. Conectar WhatsApp

1. Clique em "Gerar QR Code"
2. Escaneie com seu WhatsApp
3. Aguarde a conexão ser estabelecida
4. Pronto! Seu WhatsApp está conectado

## Comandos Úteis

### Gerenciar Containers

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f app

# Reiniciar todos os serviços
docker-compose restart

# Reiniciar um serviço específico
docker-compose restart app

# Parar todos os serviços
docker-compose down

# Iniciar todos os serviços
docker-compose up -d

# Reconstruir imagens
docker-compose build
docker-compose up -d
```

### Banco de Dados

```bash
# Acessar MySQL
docker-compose exec mysql mysql -u chatcrm -p chatcrm

# Fazer backup do banco
docker-compose exec mysql mysqldump -u chatcrm -p chatcrm > backup.sql

# Restaurar backup
docker-compose exec -T mysql mysql -u chatcrm -p chatcrm < backup.sql
```

### Aplicação

```bash
# Ver logs da aplicação
docker-compose logs -f app

# Executar comando na aplicação
docker-compose exec app pnpm db:push

# Acessar shell do container
docker-compose exec app sh
```

### Nginx

```bash
# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx

# Reiniciar Nginx
systemctl restart nginx

# Ver logs do Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### SSL

```bash
# Ver certificados
certbot certificates

# Renovar certificado
certbot renew

# Renovar certificado forçadamente
certbot renew --force-renewal
```

## Troubleshooting

### Erro: "Connection refused"

**Problema**: Não consegue conectar à aplicação

**Solução**:
```bash
# Verificar se containers estão rodando
docker-compose ps

# Ver logs
docker-compose logs app

# Reiniciar containers
docker-compose restart
```

### Erro: "Database connection error"

**Problema**: Erro ao conectar ao banco de dados

**Solução**:
```bash
# Verificar se MySQL está rodando
docker-compose ps mysql

# Ver logs do MySQL
docker-compose logs mysql

# Verificar variável DATABASE_URL no .env
cat .env | grep DATABASE_URL

# Reiniciar MySQL
docker-compose restart mysql
```

### Erro: "Evolution API not responding"

**Problema**: Não consegue conectar à Evolution API

**Solução**:
```bash
# Verificar se Evolution API está rodando
docker-compose ps evolution-api

# Ver logs
docker-compose logs evolution-api

# Testar conexão
curl -H "apikey: YOUR_KEY" http://localhost:8080/instance/list

# Reiniciar
docker-compose restart evolution-api
```

### Erro: "SSL certificate not found"

**Problema**: Certificado SSL não foi gerado

**Solução**:
```bash
# Gerar certificado
certbot --nginx -d seu-dominio.com.br --non-interactive --agree-tos --email admin@seu-dominio.com.br

# Recarregar Nginx
systemctl reload nginx
```

### Erro: "Port already in use"

**Problema**: Porta 3000, 80 ou 443 já está em uso

**Solução**:
```bash
# Ver processos usando a porta
lsof -i :3000
lsof -i :80
lsof -i :443

# Matar processo
kill -9 PID

# Ou alterar porta no docker-compose.yml
```

## Monitoramento

### Verificar Saúde da Aplicação

```bash
# Health check
curl https://seu-dominio.com.br/api/trpc/system.health

# Ver uso de recursos
docker stats

# Ver espaço em disco
df -h

# Ver uso de memória
free -h
```

### Logs

```bash
# Logs da aplicação
docker-compose logs -f app

# Logs do Nginx
tail -f /var/log/nginx/access.log

# Logs do sistema
journalctl -u docker -f
```

## Backup e Restauração

### Fazer Backup

```bash
# Backup do banco de dados
docker-compose exec mysql mysqldump -u chatcrm -p chatcrm > /backup/chatcrm-$(date +%Y%m%d).sql

# Backup de arquivos
tar -czf /backup/chatcrm-files-$(date +%Y%m%d).tar.gz /opt/chatcrm
```

### Restaurar Backup

```bash
# Restaurar banco de dados
docker-compose exec -T mysql mysql -u chatcrm -p chatcrm < /backup/chatcrm-20260623.sql

# Restaurar arquivos
tar -xzf /backup/chatcrm-files-20260623.tar.gz -C /
```

## Atualizações

### Atualizar ChatCRM

```bash
cd /opt/chatcrm

# Atualizar código
git pull origin main

# Reconstruir imagens
docker-compose build

# Reiniciar serviços
docker-compose up -d

# Executar migrações (se houver)
docker-compose exec app pnpm db:push
```

## Suporte

Para problemas ou dúvidas, abra uma issue no GitHub:
https://github.com/rocry-create/chatcrm/issues

---

**Última atualização**: 2026-06-23
