import { useState } from 'react';
import { Search, Send, Phone, Info, MoreVertical, Paperclip, Smile } from 'lucide-react';

export default function Inbox() {
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');

  const contacts = [
    { id: 1, name: 'João Silva', phone: '11 99999-1111', lastMessage: 'Ótimo, vamos conversar!', time: '14:30', unread: 2, avatar: 'JS' },
    { id: 2, name: 'Maria Santos', phone: '11 99999-2222', lastMessage: 'Qual é o valor do plano?', time: '13:45', unread: 0, avatar: 'MS' },
    { id: 3, name: 'Pedro Costa', phone: '11 99999-3333', lastMessage: 'Preciso de mais informações', time: '12:20', unread: 1, avatar: 'PC' },
    { id: 4, name: 'Ana Oliveira', phone: '11 99999-4444', lastMessage: 'Muito obrigada!', time: '11:15', unread: 0, avatar: 'AO' },
  ];

  const messages = [
    { id: 1, sender: 'contact', text: 'Olá, tudo bem?', time: '14:20' },
    { id: 2, sender: 'me', text: 'Oi! Tudo certo por aqui. Como posso ajudar?', time: '14:22' },
    { id: 3, sender: 'contact', text: 'Gostaria de saber mais sobre os planos', time: '14:25' },
    { id: 4, sender: 'me', text: 'Claro! Temos 3 planos disponíveis...', time: '14:27' },
    { id: 5, sender: 'contact', text: 'Ótimo, vamos conversar!', time: '14:30' },
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log('Mensagem enviada:', messageText);
      setMessageText('');
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Contacts List */}
      <div className="w-80 bg-white rounded-lg shadow flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Conversas</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar conversa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition text-left ${
                selectedContact?.id === contact.id ? 'bg-green-50 border-l-4 border-green-500' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {contact.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                    <span className="text-xs text-gray-500">{contact.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                </div>
                {contact.unread > 0 && (
                  <div className="w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                    {contact.unread}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedContact ? (
        <div className="flex-1 bg-white rounded-lg shadow flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {selectedContact.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedContact.name}</h3>
                <p className="text-xs text-gray-500">{selectedContact.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Phone size={18} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Info size={18} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <MoreVertical size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === 'me'
                      ? 'bg-green-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-green-100' : 'text-gray-600'}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Paperclip size={18} className="text-gray-600" />
              </button>
              <input
                type="text"
                placeholder="Digite sua mensagem..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Smile size={18} className="text-gray-600" />
              </button>
              <button
                onClick={handleSendMessage}
                className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition text-white"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-lg shadow flex items-center justify-center">
          <div className="text-center">
            <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Selecione uma conversa para começar</p>
          </div>
        </div>
      )}
    </div>
  );
}
