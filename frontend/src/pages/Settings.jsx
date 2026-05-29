import { useState } from 'react';
import { Save, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    company: 'Minha Empresa',
    email: 'admin@chatcrm.com',
    phone: '11 99999-9999',
    website: 'www.meusite.com',
    whatsappNumber: '5511999999999',
  });

  const [users, setUsers] = useState([
    { id: 1, name: 'Admin', email: 'admin@chatcrm.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Vendedor', email: 'vendedor@chatcrm.com', role: 'user', status: 'active' },
  ]);

  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });

  const handleSaveSettings = () => {
    console.log('Configurações salvas:', settings);
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      setUsers([...users, { id: Date.now(), ...newUser, status: 'active' }]);
      setNewUser({ name: '', email: '', role: 'user' });
      setShowUserModal(false);
    }
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie as configurações do seu sistema</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'general'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Geral
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'whatsapp'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          WhatsApp
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'users'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Usuários
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'integrations'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Integrações
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa</label>
              <input
                type="text"
                value={settings.company}
                onChange={(e) => setSettings({ ...settings, company: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="text"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              <Save size={18} />
              Salvar Configurações
            </button>
          </div>
        )}

        {/* WhatsApp Settings */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-blue-900 font-medium">Conexão WhatsApp</p>
                <p className="text-blue-700 text-sm mt-1">Escaneie o QR Code abaixo para conectar seu WhatsApp</p>
              </div>
            </div>
            <div className="flex justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <p className="text-gray-600">QR Code aqui</p>
                </div>
                <p className="text-gray-600 text-sm">Abra o WhatsApp e escaneie o código</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número WhatsApp</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="55119999999999"
              />
            </div>
          </div>
        )}

        {/* Users Management */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              <Plus size={18} />
              Novo Usuário
            </button>

            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </span>
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-blue-100 rounded transition">
                      <Edit2 size={16} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 hover:bg-red-100 rounded transition"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Integrations */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-900 font-medium">Evolution API</p>
              <p className="text-yellow-700 text-sm mt-1">Configure a integração com Evolution API para conectar WhatsApp</p>
              <button className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-sm">
                Configurar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Novo Usuário</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
