import { useState } from 'react';
import { Plus, Edit2, Trash2, Toggle2, Search } from 'lucide-react';

export default function Automations() {
  const [automations, setAutomations] = useState([
    { id: 1, name: 'Boas-vindas Lead', type: 'keyword', keywords: ['oi', 'olá'], template: 'Olá! Bem-vindo ao nosso CRM', active: true },
    { id: 2, name: 'Confirmação de Atendimento', type: 'event', event: 'new_message', template: 'Obrigado por entrar em contato!', active: true },
    { id: 3, name: 'Lembrete de Follow-up', type: 'scheduled', schedule: 'daily_9am', template: 'Não esqueça de fazer follow-up', active: false },
    { id: 4, name: 'Resposta Automática Grupo', type: 'group', group: 'Vendas', template: 'Bem-vindo ao grupo de vendas!', active: true },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'keyword',
    keywords: '',
    template: '',
    active: true
  });

  const filteredAutomations = automations.filter(auto =>
    auto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAutomation = () => {
    if (editingId) {
      setAutomations(automations.map(a => a.id === editingId ? { ...a, ...formData } : a));
      setEditingId(null);
    } else {
      setAutomations([...automations, { id: Date.now(), ...formData, keywords: formData.keywords.split(',') }]);
    }
    setFormData({ name: '', type: 'keyword', keywords: '', template: '', active: true });
    setShowModal(false);
  };

  const handleEdit = (automation) => {
    setFormData({
      ...automation,
      keywords: Array.isArray(automation.keywords) ? automation.keywords.join(', ') : automation.keywords
    });
    setEditingId(automation.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setAutomations(automations.filter(a => a.id !== id));
  };

  const handleToggle = (id) => {
    setAutomations(automations.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'keyword':
        return 'bg-blue-100 text-blue-800';
      case 'event':
        return 'bg-purple-100 text-purple-800';
      case 'scheduled':
        return 'bg-orange-100 text-orange-800';
      case 'group':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automações</h1>
          <p className="text-gray-600 mt-1">Configure respostas automáticas e fluxos</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', type: 'keyword', keywords: '', template: '', active: true });
            setEditingId(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          <Plus size={18} />
          Nova Automação
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar automações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {filteredAutomations.map((automation) => (
          <div key={automation.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{automation.name}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(automation.type)}`}>
                    {automation.type === 'keyword' && 'Palavra-chave'}
                    {automation.type === 'event' && 'Evento'}
                    {automation.type === 'scheduled' && 'Agendada'}
                    {automation.type === 'group' && 'Grupo'}
                  </span>
                  {automation.active ? (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      ✓ Ativa
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                      ✗ Inativa
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-3">{automation.template}</p>
                {automation.keywords && (
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(automation.keywords) ? automation.keywords : [automation.keywords]).map((keyword, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(automation.id)}
                  className={`p-2 rounded transition ${automation.active ? 'bg-green-100' : 'bg-gray-100'}`}
                >
                  <Toggle2 size={18} className={automation.active ? 'text-green-600' : 'text-gray-600'} />
                </button>
                <button
                  onClick={() => handleEdit(automation)}
                  className="p-2 hover:bg-blue-100 rounded transition"
                >
                  <Edit2 size={18} className="text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(automation.id)}
                  className="p-2 hover:bg-red-100 rounded transition"
                >
                  <Trash2 size={18} className="text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingId ? 'Editar Automação' : 'Nova Automação'}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome da automação"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="keyword">Palavra-chave</option>
                <option value="event">Evento</option>
                <option value="scheduled">Agendada</option>
                <option value="group">Grupo</option>
              </select>
              {formData.type === 'keyword' && (
                <input
                  type="text"
                  placeholder="Palavras-chave (separadas por vírgula)"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              )}
              <textarea
                placeholder="Mensagem de resposta"
                value={formData.template}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Ativa</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddAutomation}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
