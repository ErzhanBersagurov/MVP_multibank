import axios from 'axios';

// Разные базовые URL для разных сервисов
const AUTH_API_BASE = 'http://localhost:8080';
const ACCOUNTS_API_BASE = 'http://localhost:8081';
const TRANSFER_API_BASE = 'http://localhost:8082';

// Основной API instance для auth
export const api = axios.create({
  baseURL: AUTH_API_BASE,  // По умолчанию для auth
});

// Отдельный instance для accounts
export const accountsApi = axios.create({
  baseURL: ACCOUNTS_API_BASE,
});

// Отдельный instance для transfer
export const transferApi = axios.create({
  baseURL: TRANSFER_API_BASE,
});

// Текущий активный токен
let currentToken = localStorage.getItem('token');

// Функция обновления токена
const refreshToken = async () => {
  try {
    console.log('🔄 Attempting token refresh...');
    // ПРАВИЛЬНЫЙ endpoint для логина
    const response = await axios.post(`${AUTH_API_BASE}/login`, {
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
    
    // Добавляем логирование для отладки
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
          return axiosInstance(originalRequest); // Повторяем запрос
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