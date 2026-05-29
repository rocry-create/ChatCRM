import { useState } from 'react';
import { Plus, GripVertical, Trash2, Edit2 } from 'lucide-react';

export default function Kanban() {
  const stages = [
    'Novo Lead',
    'Em Atendimento',
    'Interessado',
    'Em Negociação',
    'Aguardando Retorno',
    'Cliente',
    'Perdido'
  ];

  const [cards, setCards] = useState({
    'Novo Lead': [
      { id: 1, title: 'João Silva', priority: 'high', tags: ['Vendas', 'Premium'], owner: 'Admin' },
      { id: 2, title: 'Maria Santos', priority: 'medium', tags: ['Suporte'], owner: 'Admin' },
    ],
    'Em Atendimento': [
      { id: 3, title: 'Pedro Costa', priority: 'high', tags: ['Urgente'], owner: 'Admin' },
    ],
    'Interessado': [
      { id: 4, title: 'Ana Oliveira', priority: 'low', tags: ['Follow-up'], owner: 'Admin' },
    ],
    'Em Negociação': [],
    'Aguardando Retorno': [],
    'Cliente': [
      { id: 5, title: 'Carlos Mendes', priority: 'medium', tags: ['VIP'], owner: 'Admin' },
    ],
    'Perdido': [],
  });

  const [draggedCard, setDraggedCard] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);

  const handleDragStart = (e, card, stage) => {
    setDraggedCard(card);
    setDraggedFrom(stage);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, stage) => {
    e.preventDefault();
    if (draggedCard && draggedFrom && draggedFrom !== stage) {
      const newCards = { ...cards };
      newCards[draggedFrom] = newCards[draggedFrom].filter(c => c.id !== draggedCard.id);
      newCards[stage] = [...newCards[stage], draggedCard];
      setCards(newCards);
    }
    setDraggedCard(null);
    setDraggedFrom(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kanban de Vendas</h1>
          <p className="text-gray-600 mt-1">Gerencie seus leads através das etapas de vendas</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
          <Plus size={18} />
          Novo Lead
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 overflow-x-auto pb-6">
        {stages.map((stage) => (
          <div
            key={stage}
            className="flex-shrink-0 w-full lg:w-80 bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            {/* Stage Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900">{stage}</h2>
                <p className="text-xs text-gray-600 mt-1">{cards[stage]?.length || 0} cards</p>
              </div>
              <button className="p-1 hover:bg-gray-200 rounded transition">
                <Plus size={16} className="text-gray-600" />
              </button>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className="space-y-3 min-h-96 bg-white rounded-lg p-3 border-2 border-dashed border-gray-300 hover:border-green-400 transition"
            >
              {cards[stage]?.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card, stage)}
                  className="bg-white border border-gray-200 rounded-lg p-3 cursor-move hover:shadow-md transition hover:border-green-400 group"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <GripVertical size={14} className="text-gray-400 group-hover:text-gray-600" />
                      <h3 className="font-semibold text-gray-900 text-sm">{card.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit2 size={14} className="text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-red-100 rounded">
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Priority Badge */}
                  <div className="mb-2">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${getPriorityColor(card.priority)}`}>
                      {card.priority === 'high' ? '🔴 Urgente' : card.priority === 'medium' ? '🟡 Normal' : '🟢 Baixa'}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {card.tags.map((tag, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-600">{card.owner}</span>
                    <span className="text-xs text-gray-500">ID: {card.id}</span>
                  </div>
                </div>
              ))}

              {(!cards[stage] || cards[stage].length === 0) && (
                <div className="flex items-center justify-center h-96 text-gray-400">
                  <p className="text-sm">Arraste cards aqui</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
