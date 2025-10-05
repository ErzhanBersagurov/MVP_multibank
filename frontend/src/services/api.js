import axios from 'axios';

// Автоматическое определение URLs
const getBaseURL = (service) => {
  // Если в продакшене (Render)
  if (window.location.hostname.includes('onrender.com')) {
    const urls = {
      auth: 'https://multibank-auth.onrender.com',
      accounts: 'https://multibank-accounts.onrender.com', 
      transfer: 'https://multibank-transfer.onrender.com'
    };
    return urls[service];
  }
  
  // Если через localtunnel
  if (window.location.hostname.includes('loca.lt')) {
    return window.location.origin;
  }
  
  // Локальная разработка
  const ports = {
    auth: '8080',
    accounts: '8081', 
    transfer: '8082'
  };
  return `http://localhost:${ports[service]}`;
};

// Основной API instance для auth
export const api = axios.create({
  baseURL: getBaseURL('auth'),
});

// Отдельный instance для accounts
export const accountsApi = axios.create({
  baseURL: getBaseURL('accounts'),
});

// Отдельный instance для transfer  
export const transferApi = axios.create({
  baseURL: getBaseURL('transfer'),
});

// Текущий активный токен
let currentToken = localStorage.getItem('token');

// Функция обновления токена
const refreshToken = async () => {
  try {
    console.log('🔄 Attempting token refresh...');
    const response = await axios.post(`${getBaseURL('auth')}/login`, {
      username: 'testuser',
      password: 'password123'
    });
    const newToken = response.data.token;
    
    localStorage.setItem('token', newToken);
    currentToken = newToken;
    console.log('✅ Token refreshed successfully');
    return newToken;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    localStorage.removeItem('token');
    window.location.href = '/';
    throw error;
  }
};

// Общая функция для настройки интерцепторов
const setupInterceptors = (axiosInstance) => {
  // Request interceptor
  axiosInstance.interceptors.request.use((config) => {
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    
    console.log(`🔄 Making request to: ${config.baseURL}${config.url}`);
    return config;
  });

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      // Если ошибка 401 и это не запрос логина
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const newToken = await refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error('❌ Cannot refresh token, redirecting to login');
          localStorage.removeItem('token');
          window.location.href = '/';
          return Promise.reject(refreshError);
        }
      }
      
      console.error('❌ API Error:', error.message);
      return Promise.reject(error);
    }
  );
};

// Настраиваем интерцепторы для всех instances
setupInterceptors(api);
setupInterceptors(accountsApi);
setupInterceptors(transferApi);

// Функция для ручного обновления токена
export const refreshTokenManually = async () => {
  return await refreshToken();
};