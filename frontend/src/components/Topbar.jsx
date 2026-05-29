import { useState } from 'react';
import { Bell, LogOut, Settings, User } from 'lucide-react';

export default function Topbar({ onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState(3);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">ChatCRM</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {/* Status WhatsApp */}
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">WhatsApp Conectado</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <Bell size={20} />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-200">
                  <User size={18} />
                  <span>Meu Perfil</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-200">
                  <Settings size={18} />
                  <span>Configurações</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
