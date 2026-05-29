# ChatCRM - Guia de Instalação

## Instalação Automática na VPS Contabo

### Pré-requisitos
- VPS com Ubuntu 20.04 ou superior
- Acesso SSH com permissões de root
- Conexão com internet

### Passos de Instalação

#### 1. Conectar na VPS via SSH

```bash
ssh root@167.56.101.200
```

Senha: `170398@!Anjos`

#### 2. Clonar o repositório

```bash
cd /opt
git clone https://github.com/rocry-create/chatcrm.git
cd chatcrm
```

#### 3. Executar o script de instalação

```bash
chmod +x install.sh
./install.sh
```

Este script irá:
- ✅ Atualizar o sistema
- ✅ Instalar Node.js
- ✅ Instalar PostgreSQL
- ✅ Criar banco de dados
- ✅ Instalar dependências
- ✅ Fazer build do projeto
- ✅ Configurar Nginx
- ✅ Configurar serviço systemd

#### 4. Iniciar o serviço

```bash
systemctl start chatcrm
```

#### 5. Verificar status

```bash
systemctl status chatcrm
```

### Acessar o Sistema

Abra seu navegador e acesse:

```
http://167.56.101.200
```

### Credenciais Padrão

- **Email:** admin@chatcrm.com
- **Senha:** 123456

## Configurações Importantes

### Banco de Dados

- **Host:** localhost
- **Porta:** 5432
- **Banco:** chatcrm
- **Usuário:** chatcrm_user
- **Senha:** chatcrm_password_123

### Variáveis de Ambiente

Arquivo: `/opt/chatcrm/backend/.env`

```
DATABASE_URL="postgresql://chatcrm_user:chatcrm_password_123@localhost:5432/chatcrm"
JWT_SECRET="sua-chave-secreta-aqui"
PORT=3001
NODE_ENV="production"
CORS_ORIGIN="http://seu-dominio.com"
```

## Troubleshooting

### Serviço não inicia

```bash
journalctl -u chatcrm -f
```

### Nginx não funciona

```bash
nginx -t
systemctl restart nginx
```

### Banco de dados não conecta

```bash
sudo -u postgres psql -c "SELECT version();"
```

## Próximos Passos

1. Alterar credenciais padrão
2. Configurar domínio personalizado
3. Configurar SSL/HTTPS
4. Integrar Evolution API
5. Configurar backups automáticos
