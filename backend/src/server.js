import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas de Saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas de Autenticação (placeholder)
app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Register endpoint' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

// Rotas de Contatos (placeholder)
app.get('/api/contacts', (req, res) => {
  res.json({ message: 'Get contacts endpoint' });
});

app.post('/api/contacts', (req, res) => {
  res.json({ message: 'Create contact endpoint' });
});

// Rotas de Conversas (placeholder)
app.get('/api/conversations', (req, res) => {
  res.json({ message: 'Get conversations endpoint' });
});

// Rotas de Automações (placeholder)
app.get('/api/automations', (req, res) => {
  res.json({ message: 'Get automations endpoint' });
});

// Rotas de Kanban (placeholder)
app.get('/api/kanban', (req, res) => {
  res.json({ message: 'Get kanban endpoint' });
});

// Webhooks Evolution API (placeholder)
app.post('/api/webhooks/whatsapp', (req, res) => {
  console.log('Webhook recebido:', req.body);
  res.json({ received: true });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⛔ Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});
