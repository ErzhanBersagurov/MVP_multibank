import { useState, useEffect } from 'react';
import { accountsService } from '../services/accounts';
import './HistoryPage.css';

const HistoryPage = ({ onBack }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransactionHistory();
  }, []);

  const loadTransactionHistory = async () => {
    try {
      setLoading(true);
      const historyData = await accountsService.getTransactionHistory();
      setTransactions(historyData || []);
    } catch (err) {
      setError('Ошибка загрузки истории переводов: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return amount.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) + ' ₽';
  };

  if (loading) {
    return (
      <div className="history-page">
        <header className="history-header">
          <button onClick={onBack} className="back-button">← Назад</button>
          <h2>История переводов</h2>
        </header>
        <div className="loading">Загрузка истории...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-page">
        <header className="history-header">
          <button onClick={onBack} className="back-button">← Назад</button>
          <h2>История переводов</h2>
        </header>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <header className="history-header">
        <button onClick={onBack} className="back-button">← Назад</button>
        <h2>История переводов</h2>
      </header>

      <div className="history-content">
        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>История переводов пуста</h3>
            <p>Здесь будут отображаться все ваши переводы между счетами</p>
          </div>
        ) : (
          <div className="transactions-list">
            {transactions.map((transaction, index) => (
              <div key={transaction.id || index} className="transaction-card">
                <div className="transaction-header">
                  <div className="transaction-id">#{transaction.id}</div>
                  <div className={`transaction-status ${transaction.status}`}>
                    {transaction.status === 'completed' ? '✅ Выполнен' : transaction.status}
                  </div>
                </div>
                
                <div className="transaction-details">
                  <div className="account-transfer">
                    <div className="from-account">
                      <span className="label">С:</span>
                      <span className="account-number">{transaction.from_account}</span>
                    </div>
                    <div className="transfer-arrow">→</div>
                    <div className="to-account">
                      <span className="label">На:</span>
                      <span className="account-number">{transaction.to_account}</span>
                    </div>
                  </div>
                  
                  <div className="transaction-amount">
                    {formatAmount(transaction.amount)}
                  </div>
                </div>
                
                <div className="transaction-footer">
                  <div className="transaction-date">
                    {formatDate(transaction.createdAt)}
                  </div>
                  <div className="transaction-currency">
                    {transaction.currency || 'RUB'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;