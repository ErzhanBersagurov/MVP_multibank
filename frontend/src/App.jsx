import { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ExpensesPage from './components/ExpensesPage';
import HistoryPage from './components/HistoryPage'; // ← ДОБАВИТЬ
import BottomNavigation from './components/BottomNavigation';
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = (newToken) => {
    setToken(newToken);
    setShowRegister(false);
  };

  const handleRegister = (userData) => {
    alert(`Пользователь ${userData.username} создан! Теперь войдите в систему.`);
    setShowRegister(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    setToken(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (!token) {
    return showRegister ? (
      <Register
        onRegister={handleRegister}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div className="app">
      <div className="app-content">
        {activeTab === 'dashboard' && (
          <Dashboard onLogout={handleLogout} />
        )}
        {activeTab === 'history' && (
          <HistoryPage onBack={() => setActiveTab('dashboard')} />
        )}
        {activeTab === 'expenses' && (
          <ExpensesPage onBack={() => setActiveTab('dashboard')} />
        )}
      </div>
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}

export default App;