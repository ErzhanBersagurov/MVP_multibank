import { api } from './api';

export const authService = {
  login: async (username, password) => {
    console.log('🔐 Attempting login for user:', username);
    
    const response = await api.post('/login', { 
      username, 
      password 
    });
    
    console.log('✅ Login successful');
    return response.data;
  },
  
  register: async (username, email, password) => {
    const response = await api.post('/register', { 
      username, 
      email, 
      password 
    });
    return response.data;
  },
  
  validateToken: async (token) => {
    try {
      const response = await api.post('/validate', { token });
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }
};