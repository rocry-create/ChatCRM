# ChatCRM

Um CRM profissional integrado ao WhatsApp com funil Kanban, automações e gestão de contatos. Utilize a Evolution API para integração sem burocracia.

## Características

- ✅ **Dashboard Intuitivo**: Visualize todas as métricas importantes em um só lugar
- ✅ **Funil Kanban**: Organize seus leads em colunas visuais e acompanhe cada etapa da venda
- ✅ **Gestão de Contatos**: Organize seus contatos com tags, notas e histórico completo
- ✅ **Chat Integrado**: Envie texto, áudio, imagens e vídeos diretamente do sistema
- ✅ **Integração WhatsApp**: Conecte seu WhatsApp via QR Code em segundos
- ✅ **Respostas Rápidas**: Envie mensagens pré-configuradas com apenas um clique
- ✅ **Agendamento**: Programe mensagens para follow-up automático
- ✅ **Biblioteca de Mídia**: Organize e reutilize arquivos de mídia
- ✅ **Multi-Instância**: Gerencie múltiplas contas de WhatsApp
- ✅ **Autenticação Segura**: Login com email e senha, sessões JWT

## Stack Tecnológico

### Backend
- **Node.js** com TypeScript
- **Express** para servidor HTTP
- **tRPC** para API type-safe
- **Drizzle ORM** para acesso ao banco de dados
- **MySQL** como banco de dados
- **bcryptjs** para hash de senhas
- **jose** para JWT

### Frontend
- **React 19** com TypeScript
- **Vite** para build rápido
- **TailwindCSS** para styling
- **Radix UI** para componentes acessíveis
- **React Query** para gerenciamento de estado
- **Wouter** para roteamento
- **Recharts** para gráficos

### DevOps
- **Docker** para containerização
- **Docker Compose** para orquestração
- **Nginx** como proxy reverso
- **Certbot** para SSL/HTTPS

## Requisitos

- Node.js 22+
- Docker e Docker Compose
- MySQL 8.0+
- Evolution API (opcional, pode ser instalada via Docker)
- Nginx (para produção)

## Instalação Local

### 1. Clonar o repositório

```bash
git clone https://github.com/rocry-create/chatcrm.git
cd chatcrm
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=mysql://user:password@localhost:3306/chatcrm
JWT_SECRET=your-secret-key-here
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-api-key
ADMIN_EMAIL=admin@chatcrm.local
ADMIN_PASSWORD=admin123
```

### 4. Iniciar banco de dados

```bash
# Com Docker
docker run -d \
  --name chatcrm-mysql \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=chatcrm \
  -e MYSQL_USER=chatcrm \
  -e MYSQL_PASSWORD=chatcrm123 \
  -p 3306:3306 \
  mysql:8.0
```

### 5. Executar migrações

```bash
pnpm db:push
```

### 6. Iniciar em desenvolvimento

```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`

## Deploy em VPS

### Pré-requisitos

- VPS com Ubuntu 20.04 LTS ou superior
- Acesso SSH como root
- Domínio apontado para o IP da VPS

### Instalação Automática

```bash
# Download do script de deploy
wget https://raw.githubusercontent.com/rocry-create/chatcrm/main/deploy.sh

# Executar script (requer sudo)
sudo bash deploy.sh https://github.com/rocry-create/chatcrm.git seu-dominio.com.br
```

### Instalação Manual

Veja [INSTALL_VPS.md](./INSTALL_VPS.md) para instruções passo a passo.

## Configuração da Evolution API

### Opção 1: Usar Evolution API via Docker

A Evolution API já vem configurada no `docker-compose.yml`:

```bash
docker-compose up -d evolution-api
```

Acesse em `http://localhost:8080`

### Opção 2: Usar Evolution API Externa

Configure as variáveis de ambiente:

```env
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-api
```

## Uso

### Login

1. Acesse `http://localhost:3000`
2. Clique em "Entrar"
3. Use as credenciais padrão:
   - Email: `admin@chatcrm.local`
   - Senha: `admin123`

**Importante**: Altere a senha do admin após o primeiro login!

### Conectar WhatsApp

1. Vá para "Configurações" > "Instâncias"
2. Clique em "Nova Instância"
3. Preencha os dados da Evolution API
4. Clique em "Gerar QR Code"
5. Escaneie com seu WhatsApp

### Gerenciar Contatos

1. Vá para "Contatos"
2. Clique em "Novo Contato"
3. Preencha os dados (nome, telefone, tags, etc.)
4. Salve

### Usar Kanban

1. Vá para "Kanban"
2. Arraste contatos entre as colunas (New Lead → Contacted → Negotiation → Closed Won/Lost)
3. As mudanças são salvas automaticamente

## Estrutura do Projeto

```
chatcrm/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas principais
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilitários
│   └── index.html
├── server/                # Backend Node.js
│   ├── _core/            # Core utilities
│   ├── routers.ts        # Definição de rotas tRPC
│   ├── db.ts             # Acesso ao banco de dados
│   └── storage.ts        # Gerenciamento de arquivos
├── drizzle/              # Migrações e schema do banco
├── shared/               # Código compartilhado
├── docker-compose.yml    # Configuração Docker
├── Dockerfile            # Build da aplicação
├── nginx.conf            # Configuração Nginx
├── deploy.sh             # Script de deploy
└── README.md
```

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NODE_ENV` | Ambiente (development/production) | production |
| `PORT` | Porta do servidor | 3000 |
| `DATABASE_URL` | URL de conexão MySQL | - |
| `JWT_SECRET` | Chave secreta para JWT | - |
| `EVOLUTION_API_URL` | URL da Evolution API | - |
| `EVOLUTION_API_KEY` | Chave de API da Evolution | - |
| `ADMIN_EMAIL` | Email do admin | admin@chatcrm.local |
| `ADMIN_PASSWORD` | Senha do admin | admin123 |

## Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor em modo watch

# Build
pnpm build            # Build para produção
pnpm start            # Inicia servidor de produção

# Database
pnpm db:push          # Executa migrações

# Qualidade
pnpm check            # Verifica tipos TypeScript
pnpm format           # Formata código com Prettier
pnpm test             # Executa testes
```

## Troubleshooting

### Erro de conexão com banco de dados

Verifique se o MySQL está rodando:

```bash
docker ps | grep mysql
```

Se não estiver, inicie:

```bash
docker-compose up -d mysql
```

### Evolution API não conecta

1. Verifique se a Evolution API está rodando:
   ```bash
   docker-compose logs evolution-api
   ```

2. Verifique as credenciais no `.env`

3. Teste a conexão:
   ```bash
   curl -H "apikey: YOUR_KEY" http://localhost:8080/instance/list
   ```

### Erro ao fazer build

Limpe o cache e tente novamente:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

## Segurança

- ✅ Senhas são hasheadas com bcryptjs (10 rounds)
- ✅ Sessões JWT com expiração de 1 ano
- ✅ CORS configurado
- ✅ Proteção contra SQL injection via Drizzle ORM
- ✅ Headers de segurança no Nginx
- ✅ SSL/HTTPS obrigatório em produção
- ✅ Variáveis sensíveis em `.env` (não commitadas)

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

MIT License - veja [LICENSE](./LICENSE) para detalhes

## Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do email.

## Changelog

### v1.0.0 (2026-06-23)
- ✅ Versão inicial
- ✅ Autenticação com email/senha
- ✅ Integração Evolution API
- ✅ Dashboard e Kanban
- ✅ Gestão de contatos e mensagens
- ✅ Respostas rápidas e agendamento
- ✅ Deploy com Docker e Nginx

---

Desenvolvido com ❤️ para profissionais que querem escalar seu negócio no WhatsApp.
