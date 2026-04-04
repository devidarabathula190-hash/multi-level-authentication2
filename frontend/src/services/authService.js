import api from './apiService';

const authService = {
  register: async (userData) => {
    // Robust check for FormData (as instanceof can fail in some envs)
    const isFormData = userData && typeof userData.append === 'function';
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    return await api.post('/auth/register/', userData, { headers });
  },
  registerJson: async (userData) => {
    return await api.post('/auth/register/', userData, {
      headers: { 'Content-Type': 'application/json' },
    });
  },
  login: async (credentials) => {
    return await api.post('/auth/login/', credentials);
  },
  refreshToken: async (refresh) => {
    return await api.post('/auth/token/refresh/', { refresh });
  },
};

export default authService;
