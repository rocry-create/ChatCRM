import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, MessageSquare, Send, Clock } from 'lucide-react';

export default function Dashboard() {
  // Dados simulados
  const metrics = [
    { label: 'Total de Leads', value: '1,234', change: '+12%', icon: Users, color: 'bg-blue-500' },
    { label: 'Total de Clientes', value: '456', change: '+8%', icon: Users, color: 'bg-green-500' },
    { label: 'Atendimentos', value: '892', change: '+24%', icon: MessageSquare, color: 'bg-purple-500' },
    { label: 'Mensagens Recebidas', value: '5,432', change: '+18%', icon: MessageSquare, color: 'bg-orange-500' },
  ];

  const funnelData = [
    { name: 'Novo Lead', value: 400 },
    { name: 'Em Atendimento', value: 300 },
    { name: 'Interessado', value: 250 },
    { name: 'Em Negociação', value: 180 },
    { name: 'Aguardando Retorno', value: 120 },
    { name: 'Cliente', value: 80 },
    { name: 'Perdido', value: 50 },
  ];

  const performanceData = [
    { month: 'Jan', leads: 400, clientes: 240 },
    { month: 'Fev', leads: 500, clientes: 320 },
    { month: 'Mar', leads: 600, clientes: 400 },
    { month: 'Abr', leads: 700, clientes: 480 },
    { month: 'Mai', leads: 800, clientes: 550 },
    { month: 'Jun', leads: 900, clientes: 620 },
  ];

  const activities = [
    { id: 1, type: 'message', user: 'João Silva', action: 'enviou mensagem', time: '5 min atrás' },
    { id: 2, type: 'contact', user: 'Maria Santos', action: 'novo lead criado', time: '15 min atrás' },
    { id: 3, type: 'status', user: 'Pedro Costa', action: 'moveu para Cliente', time: '1 hora atrás' },
    { id: 4, type: 'automation', user: 'Sistema', action: 'automação disparada', time: '2 horas atrás' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bem-vindo ao seu CRM WhatsApp profissional</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{metric.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metric.value}</p>
                  <p className="text-green-600 text-sm font-medium mt-2">{metric.change} este mês</p>
                </div>
                <div className={`${metric.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funil de Vendas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Funil de Vendas</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição de Estágios */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Distribuição por Etapa</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={funnelData} cx="50%" cy="50%" labelLine={false} label outerRadius={80} fill="#8884d8" dataKey="value">
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Desempenho Mensal</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="clientes" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Activities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Atividades Recentes</h2>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-b-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Clock size={18} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{activity.user}</p>
                <p className="text-gray-600 text-sm">{activity.action}</p>
              </div>
              <span className="text-gray-500 text-sm">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
