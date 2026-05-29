import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  MessageCircle,
  Kanban,
  Users,
  Zap,
  Settings,
  ChevronDown
} from 'lucide-react';

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/inbox', label: 'Inbox WhatsApp', icon: MessageCircle },
    { path: '/kanban', label: 'Kanban', icon: Kanban },
    { path: '/contacts', label: 'Contatos', icon: Users },
    { path: '/automations', label: 'Automações', icon: Zap },
    { path: '/settings', label: 'Configurações', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col shadow-lg`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold">
                C
              </div>
              <span className="font-bold text-lg">ChatCRM</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-slate-700 rounded-lg transition"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-green-500 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className={`flex items-center gap-3 ${isOpen ? 'px-4 py-3' : 'justify-center'}`}>
            <div className="w-8 h-8 bg-green-500 rounded-full"></div>
            {isOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-slate-400">Online</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
