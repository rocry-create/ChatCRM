# ChatCRM - CRM WhatsApp Profissional

Um sistema CRM completo, moderno e profissional integrado com WhatsApp via Evolution API, desenvolvido com tecnologias open source e gratuitas.

## 🎯 Características Principais

- **Dashboard Profissional**: Métricas, gráficos e KPIs em tempo real
- **Inbox WhatsApp**: Chat em tempo real com suporte a multimídia
- **Kanban de Vendas**: 7 etapas comerciais com drag-and-drop
- **CRM Completo**: Gerenciamento de leads, clientes e histórico
- **Automações**: Mensagens automáticas, gatilhos e fluxos
- **Automação de Grupo**: Boas-vindas automática e captura de leads
- **Configurações Avançadas**: Usuários, permissões e integrações

## 🛠️ Stack Tecnológico

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL

### WhatsApp
- Evolution API (self-hosted)

### Hospedagem
- VPS Contabo (Linux/Ubuntu)

## 📁 Estrutura do Projeto

```
chatcrm/
├── frontend/          # Aplicação React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/           # API Node.js
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── server.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── docs/              # Documentação
│   ├── INSTALACAO.md
│   ├── CONFIGURACAO.md
│   ├── DEPLOY.md
│   └── EVOLUTION_API.md
└── TODO.md            # Lista de tarefas
```

## 🚀 Quick Start

### Pré-requisitos
- Node.js 16+
- PostgreSQL 12+
- npm ou pnpm

### Instalação Local

```bash
# Clone o repositório
git clone <seu-repo>
cd chatcrm

# Frontend
cd frontend
npm install
npm run dev

# Backend (em outro terminal)
cd backend
npm install
npm run dev
```

## 📚 Documentação

- [Guia de Instalação](./docs/INSTALACAO.md)
- [Configuração](./docs/CONFIGURACAO.md)
- [Deploy em VPS Contabo](./docs/DEPLOY.md)
- [Evolution API](./docs/EVOLUTION_API.md)

## 🔐 Segurança

- JWT para autenticação
- Bcrypt para hash de senhas
- CORS configurado
- Validação de entrada
- Permissões por papel (admin/user)

## 📄 Licença

MIT

## 👨‍💻 Desenvolvido por

Engenheiro de Software - 2024

---

**ChatCRM** - Seu CRM WhatsApp profissional, gratuito e open source.
