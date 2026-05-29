import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Kanban from './pages/Kanban';
import Contacts from './pages/Contacts';
import Automations from './pages/Automations';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está autenticado
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        
        {isAuthenticated ? (
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/automations" element={<Automations />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
