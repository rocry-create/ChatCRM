# Guia de Instalação e Deploy do ChatCRM na VPS

Este guia detalha os passos para instalar e configurar o ChatCRM em uma Virtual Private Server (VPS) usando Docker, Docker Compose e Nginx.

## Pré-requisitos

Certifique-se de que sua VPS possui os seguintes softwares instalados:

*   **Ubuntu 22.04+** (ou outra distribuição Linux compatível)
*   **Docker**
*   **Docker Compose**
*   **Nginx**
*   **Git**
*   **curl**

## 1. Acesso à VPS

Conecte-se à sua VPS via SSH:

```bash
ssh root@167.86.101.200
```

## 2. Clonar o Repositório

Clone o repositório do ChatCRM para o diretório `/opt`:

```bash
cd /opt
git clone https://github.com/rocry-create/ChatCRM.git
cd ChatCRM
```

## 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (`/opt/ChatCRM/.env`) com as seguintes variáveis. **É crucial alterar `JWT_SECRET`, `EVOLUTION_API_KEY`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` para valores seguros e únicos.**

```env
NODE_ENV=production
PORT=3000

# Database (MySQL)
DATABASE_URL=mysql://chatcrm:chatcrm123@mysql:3306/chatcrm
MYSQL_ROOT_PASSWORD=root123
MYSQL_DATABASE=chatcrm
MYSQL_USER=chatcrm
MYSQL_PASSWORD=chatcrm123

# JWT Secret (MUITO IMPORTANTE: Altere para uma chave forte e única!)
JWT_SECRET=fFeXU/PCIuFXjAyqf99hg7iXPahfCp8+jOAJdXfjf9g=

# Evolution API (Altere a chave para a sua, se tiver uma instância externa)
EVOLUTION_API_URL=http://evolution-api:8080
EVOLUTION_API_KEY=iTPWXF2afbdplSvyCDa+bQ==

# Credenciais do Administrador Inicial (Altere para suas credenciais seguras!)
ADMIN_EMAIL=admin@chatcrm.local
ADMIN_PASSWORD=admin123

# URL do Servidor OAuth (necessário para o funcionamento interno do SDK, mesmo sem o fluxo OAuth externo)
OAUTH_SERVER_URL=http://167.86.101.200
```

## 4. Iniciar os Containers Docker

Navegue até o diretório do projeto e inicie os serviços usando Docker Compose:

```bash
cd /opt/ChatCRM
docker-compose up -d --build
```

Isso irá construir as imagens Docker, criar os containers para o MySQL, Evolution API e o ChatCRM, e iniciá-los em segundo plano.

## 5. Configurar o Nginx

Crie um arquivo de configuração para o Nginx em `/etc/nginx/sites-available/chatcrm`:

```bash
cat <<EOF > /etc/nginx/sites-available/chatcrm
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
```

Crie um link simbólico para habilitar a configuração e remova a configuração padrão do Nginx:

```bash
ln -sf /etc/nginx/sites-available/chatcrm /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
```

Reinicie o Nginx para aplicar as alterações:

```bash
systemctl restart nginx
```

## 6. Configurar o Banco de Dados e Usuário Admin

As tabelas do banco de dados e o usuário administrador inicial precisam ser criados. Execute os seguintes comandos dentro do container MySQL:

```bash
docker exec chatcrm-mysql mysql -u root -proot123 -e \
"CREATE DATABASE IF NOT EXISTS chatcrm; USE chatcrm; \
CREATE TABLE IF NOT EXISTS users (\
  id INT AUTO_INCREMENT PRIMARY KEY,\
  name VARCHAR(255) NOT NULL,\
  email VARCHAR(255) NOT NULL UNIQUE,\
  password_hash VARCHAR(255) NOT NULL,\
  role ENUM(\\\"admin\\\", \\\"user\\\") DEFAULT \\\"user\\\",\
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
  last_signed_in TIMESTAMP NULL\
);\
CREATE TABLE IF NOT EXISTS connections (\
  id INT AUTO_INCREMENT PRIMARY KEY,\
  user_id INT NOT NULL,\
  name VARCHAR(255) NOT NULL,\
  instance_name VARCHAR(255) NOT NULL UNIQUE,\
  status VARCHAR(50) DEFAULT \\\"disconnected\\\",\
  qrcode TEXT,\
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE\
);"
```

Agora, insira o usuário administrador inicial. A senha `admin123` já está hashada no comando abaixo. Se você alterou `ADMIN_PASSWORD` no `.env`, você precisará gerar um novo hash bcrypt para a sua senha e substituir no comando.

```bash
docker exec chatcrm-mysql mysql -u root -proot123 -e \
"USE chatcrm; \
DELETE FROM users WHERE email=\\\"admin@chatcrm.local\\\";\
INSERT INTO users (name, email, password_hash, role) \
VALUES (\\\"Admin\\\", \\\"admin@chatcrm.local\\\", \\\"\$2a\$10\$J4n9YXk3XYMNcJae.6N1G.6bxPgonfs57j2rnW.SWWMEtFX0PsFFq\\\", \\\"admin\\\");"
```

## 7. Acessar o ChatCRM

Após a conclusão de todos os passos, o ChatCRM estará acessível através do IP da sua VPS:

[http://167.86.101.200](http://167.86.101.200)

**Credenciais de Login (Iniciais):**
*   **Email**: `admin@chatcrm.local`
*   **Senha**: `admin123`

**Lembre-se de alterar a senha do administrador após o primeiro login!**

## Resolução de Problemas Comuns

*   **`KeyError: 'ContainerConfig'` ao rodar `docker-compose up`**: Isso geralmente ocorre devido a uma versão antiga do `docker-compose`. Tente usar `docker compose up -d` (com um espaço) ou atualize seu Docker Compose.
*   **Erros de conexão com o MySQL**: Verifique os logs do container `chatcrm-mysql` (`docker logs chatcrm-mysql`) para garantir que ele iniciou corretamente e que as senhas no `.env` correspondem às configuradas no `docker-compose.yml`.
*   **`OAUTH_SERVER_URL is not configured`**: Certifique-se de que a variável `OAUTH_SERVER_URL` está definida no seu arquivo `.env` e que o container `chatcrm-app` foi recriado após a alteração.
*   **Página em branco ou 404**: Verifique os logs do Nginx (`sudo tail -f /var/log/nginx/error.log`) e do container `chatcrm-app` (`docker logs chatcrm-app`). Certifique-se de que o Nginx está configurado para fazer proxy para a porta 3000 do container `chatcrm-app`.

Se você encontrar problemas, revise os logs dos containers e do Nginx para identificar a causa.
