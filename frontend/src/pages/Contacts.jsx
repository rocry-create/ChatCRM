import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Phone, Mail, Tag, Filter } from 'lucide-react';

export default function Contacts() {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'João Silva', phone: '11 99999-1111', email: 'joao@email.com', status: 'lead', tags: ['Vendas', 'Premium'], company: 'Tech Solutions' },
    { id: 2, name: 'Maria Santos', phone: '11 99999-2222', email: 'maria@email.com', status: 'cliente', tags: ['VIP'], company: 'Marketing Plus' },
    { id: 3, name: 'Pedro Costa', phone: '11 99999-3333', email: 'pedro@email.com', status: 'lead', tags: ['Suporte'], company: 'Consultoria XYZ' },
    { id: 4, name: 'Ana Oliveira', phone: '11 99999-4444', email: 'ana@email.com', status: 'cliente', tags: ['Follow-up'], company: 'Design Studio' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', status: 'lead', company: '' });

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || contact.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddContact = () => {
    if (editingId) {
      setContacts(contacts.map(c => c.id === editingId ? { ...c, ...formData } : c));
      setEditingId(null);
    } else {
      setContacts([...contacts, { id: Date.now(), ...formData, tags: [] }]);
    }
    setFormData({ name: '', phone: '', email: '', status: 'lead', company: '' });
    setShowModal(false);
  };

  const handleEdit = (contact) => {
    setFormData(contact);
    setEditingId(contact.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'lead':
        return 'bg-blue-100 text-blue-800';
      case 'cliente':
        return 'bg-green-100 text-green-800';
      case 'perdido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contatos</h1>
          <p className="text-gray-600 mt-1">Gerencie seus leads e clientes</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', phone: '', email: '', status: 'lead', company: '' });
            setEditingId(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          <Plus size={18} />
          Novo Contato
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-600" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos</option>
            <option value="lead">Leads</option>
            <option value="cliente">Clientes</option>
            <option value="perdido">Perdidos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Contato</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Empresa</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tags</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{contact.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {contact.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {contact.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{contact.company}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(contact.status)}`}>
                    {contact.status === 'lead' ? 'Lead' : contact.status === 'cliente' ? 'Cliente' : 'Perdido'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map((tag, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="p-2 hover:bg-blue-100 rounded transition"
                    >
                      <Edit2 size={16} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 hover:bg-red-100 rounded transition"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingId ? 'Editar Contato' : 'Novo Contato'}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                placeholder="Empresa"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="lead">Lead</option>
                <option value="cliente">Cliente</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddContact}
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
