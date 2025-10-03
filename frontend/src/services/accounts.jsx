import { accountsApi, transferApi } from './api';

export const accountsService = {
  // Получить все счета
  getAccounts: async () => {
    const response = await accountsApi.get('/accounts');
    return response.data.accounts;
  },
  
  // Получить общий баланс
  getTotalBalance: async () => {
    const response = await accountsApi.get('/balance');
    return response.data.total_balance;
  },
  
  // Перевод между счетами
  transfer: async (fromAccount, toAccount, amount, currency = 'RUB') => {
    const response = await transferApi.post('/transfer/internal', {
      from_account: fromAccount,
      to_account: toAccount,
      amount: amount,
      currency: currency
    });
    return response.data;
  }, 
  
  // Получить историю транзакций
  getTransactionHistory: async () => {
    const response = await transferApi.get('/transfer/history');
    return response.data.transactions;
  }
};