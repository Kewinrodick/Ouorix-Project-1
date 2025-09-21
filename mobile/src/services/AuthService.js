import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class AuthService {
  constructor() {
    this.token = null;
    this.user = null;
  }

  async initialize() {
    try {
      const token = await this.getToken();
      if (token) {
        this.token = token;
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Auth service initialization error:', error);
    }
  }

  async register(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register/tourist`, userData);
      
      if (response.data.token) {
        await this.setToken(response.data.token);
        this.token = response.data.token;
        this.user = response.data.tourist;
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(identifier) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        identifier,
        userType: 'tourist'
      });
      
      if (response.data.token) {
        await this.setToken(response.data.token);
        this.token = response.data.token;
        this.user = response.data.user;
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await this.removeToken();
      this.token = null;
      this.user = null;
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async verifyToken(token = null) {
    try {
      const tokenToVerify = token || this.token;
      if (!tokenToVerify) return false;

      const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${tokenToVerify}` }
      });
      
      return response.data.valid;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  async getToken() {
    try {
      return await EncryptedStorage.getItem('auth_token');
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  async setToken(token) {
    try {
      await EncryptedStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Set token error:', error);
      throw error;
    }
  }

  async removeToken() {
    try {
      await EncryptedStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Remove token error:', error);
    }
  }

  async getUser() {
    if (this.user) return this.user;
    
    try {
      const userData = await EncryptedStorage.getItem('user_data');
      if (userData) {
        this.user = JSON.parse(userData);
        return this.user;
      }
    } catch (error) {
      console.error('Get user error:', error);
    }
    
    return null;
  }

  async setUser(user) {
    try {
      this.user = user;
      await EncryptedStorage.setItem('user_data', JSON.stringify(user));
    } catch (error) {
      console.error('Set user error:', error);
    }
  }

  isAuthenticated() {
    return !!this.token;
  }

  getAuthHeaders() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'Server error';
      return new Error(message);
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.');
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default new AuthService();