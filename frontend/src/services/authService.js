import api from './api';

export const authService = {
  async login(username, password) {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    
    const response = await api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },
  
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout() {
    localStorage.removeItem('token');
  },
  
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
