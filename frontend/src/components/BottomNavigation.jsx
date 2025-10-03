const BottomNavigation = ({ activeTab, onTabChange }) => {
  return (
    <div className="bottom-navigation">
      <button 
        className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onTabChange('dashboard')}
      >
        <div className="nav-icon">🏠</div>
        <span>Счета</span>
      </button>
      
      <button 
        className={`nav-button ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => onTabChange('history')}
      >
        <div className="nav-icon">📋</div>
        <span>История</span>
      </button>
      
      <button 
        className={`nav-button ${activeTab === 'expenses' ? 'active' : ''}`}
        onClick={() => onTabChange('expenses')}
      >
        <div className="nav-icon">📈</div>
        <span>Аналитика</span>
      </button>
    </div>
  );
};

export default BottomNavigation;