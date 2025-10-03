import { useState, useEffect } from 'react';
import { accountsService } from '../services/accounts';
import './Dashboard.css';
import alfaIcon from '../assets/icon_alfa.png';
import sberIcon from '../assets/icon_sber.png';
import tbankIcon from '../assets/icon_tbank.png';
import avatarImage from '../assets/avatar.jpg';

const Dashboard = ({ onLogout }) => {
  const [accounts, setAccounts] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferCode, setTransferCode] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleTransfer = () => {
    setShowTransferModal(true);
  };

  const executeTransfer = async () => {
    if (!fromAccount || !toAccount || !transferAmount || !transferCode) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    if (transferCode !== '1234') {
      alert('Неверный код подтверждения');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8082/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          from_account: fromAccount,
          to_account: toAccount,
          amount: parseFloat(transferAmount)
        })
      });

      if (response.ok) {
        alert('Перевод выполнен успешно!');
        setShowTransferModal(false);
        setFromAccount('');
        setToAccount('');
        setTransferAmount('');
        setTransferCode('');
        loadData();
      } else {
        alert('Ошибка при выполнении перевода');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Ошибка при выполнении перевода');
    }
  };

  const closeTransferModal = () => {
    setShowTransferModal(false);
    setFromAccount('');
    setToAccount('');
    setTransferAmount('');
    setTransferCode('');
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsData, balanceData] = await Promise.all([
        accountsService.getAccounts(),
        accountsService.getTotalBalance()
      ]);
      setAccounts(accountsData);
      setTotalBalance(balanceData);
    } catch (err) {
      setError('Ошибка загрузки данных: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  const bankAccounts = accounts.reduce((acc, account) => {
    const bankName = account.bank_name;
    if (!acc[bankName]) {
      acc[bankName] = [];
    }
    acc[bankName].push(account);
    return acc;
  }, {});

  const getBankIcon = (bankName) => {
    switch (bankName.toLowerCase()) {
      case 'альфа-банк':
        return { icon: alfaIcon, color: '#EF3124', bgColor: '#EF3124', isImage: true };
      case 'тинькофф':
        return { icon: tbankIcon, color: '#FFDD2D', bgColor: '#FFDD2D', isImage: true };
      case 'сбербанк':
        return { icon: sberIcon, color: '#21A038', bgColor: '#21A038', isImage: true };
      default:
        return { icon: bankName.charAt(0), color: '#666', bgColor: '#666', isImage: false };
    }
  };

  const bankOrder = ['Альфа-Банк', 'Тинькофф', 'Сбербанк'];
  const orderedBanks = bankOrder.filter(bank => bankAccounts[bank]);
  const otherBanks = Object.keys(bankAccounts).filter(bank => !bankOrder.includes(bank));
  const allBanks = [...orderedBanks, ...otherBanks];

  const getCardColor = (index) => {
    const colors = [
      { border: '#EF3124', bg: '#EF3124' },
      { border: '#FFDD2D', bg: '#FFDD2D' },
      { border: '#21A038', bg: '#21A038' }
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="dashboard">
      {/* Header with user profile */}
      <div className="header">
        <div className="user-profile">
          <div className="avatar">
            <img src={avatarImage} alt="Антон" />
          </div>
          <span className="username">АНТОН</span>
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          {/* КНОПКА ВЫХОДА */}
          <button 
            className="logout-button"
            onClick={onLogout}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginLeft: '10px'
            }}
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Bank icons */}
      <div className="bank-icons">
        {allBanks.map((bankName) => {
          const { icon, bgColor, isImage } = getBankIcon(bankName);
          return (
            <div key={bankName} className="bank-icon" style={{ backgroundColor: bgColor }}>
              {isImage ? (
                <img src={icon} alt={bankName} className="bank-logo" />
              ) : (
                <span style={{ color: bgColor === '#FFDD2D' ? '#000' : '#fff' }}>{icon}</span>
              )}
            </div>
          );
        })}
        <div className="bank-icon add-bank">
          <span>+</span>
        </div>
      </div>

      {/* My accounts section */}
      <div className="accounts-section">
        <h2>Мои счета</h2>
        
        <div className="accounts-list">
          {accounts.map((account, index) => {
            const cardColor = getCardColor(index);
            return (
              <div key={account.id} className="account-card">
                <div 
                  className="card-visual" 
                  style={{ 
                    borderColor: cardColor.border,
                    backgroundColor: '#fff'
                  }}
                >
                  <div 
                    className="card-chip" 
                    style={{ backgroundColor: cardColor.bg }}
                  ></div>
                </div>
                <div className="account-info">
                  <div className="account-name">{account.account_type}</div>
                  <div className="balance">{account.balance.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</div>
                  <div className="card-number">xxxx xx{account.account_number.slice(-2)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transfer section */}
      <div className="transfer-section">
        <button className="transfer-button" onClick={handleTransfer}>
          <span>Перевод себе</span>
          <div className="transfer-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="white"/>
              <path d="M19 15L20.09 18.26L24 19L20.09 19.74L19 23L17.91 19.74L14 19L17.91 18.26L19 15Z" fill="white"/>
              <path d="M5 15L6.09 18.26L10 19L6.09 19.74L5 23L3.91 19.74L0 19L3.91 18.26L5 15Z" fill="white"/>
            </svg>
          </div>
        </button>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={closeTransferModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Перевод между счетами</h3>
            
            <div className="form-group">
              <label>Откуда перевести:</label>
              <select value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
                <option value="">Выберите счет</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.account_type} - {account.balance.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Куда перевести:</label>
              <select value={toAccount} onChange={(e) => setToAccount(e.target.value)}>
                <option value="">Выберите счет</option>
                {accounts.filter(account => account.id !== fromAccount).map(account => (
                  <option key={account.id} value={account.id}>
                    {account.account_type} - {account.balance.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Сумма перевода:</label>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Введите сумму"
              />
            </div>

            <div className="form-group">
              <label>Код подтверждения:</label>
              <input
                type="text"
                value={transferCode}
                onChange={(e) => setTransferCode(e.target.value)}
                placeholder="Введите код (1234)"
              />
            </div>

            <div className="modal-buttons">
              <button className="cancel-button" onClick={closeTransferModal}>Отмена</button>
              <button className="confirm-button" onClick={executeTransfer}>Перевести</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;