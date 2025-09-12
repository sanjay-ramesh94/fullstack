// src/services/auth.js
import { api } from './api';
import { jwtDecode } from 'jwt-decode';

class AuthService {
  // User Registration
  async registerUser(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  }

  // User Login
  async loginUser(credentials) {
    try {
      const response = await api.post('/auth/login/user', credentials);
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  }

  // Admin Login
  async loginAdmin(credentials) {
    try {
      const response = await api.post('/auth/login/admin', credentials);
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Admin login failed' };
    }
  }

  // Set token in localStorage
  setToken(token) {
    localStorage.setItem('token', token);
  }

  // Get token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Remove token from localStorage
  removeToken() {
    localStorage.removeItem('token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      this.removeToken();
      return false;
    }
  }

  // Get current user info from token
  getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 > Date.now()) {
        return {
          id: decoded.userId,
          type: decoded.type
        };
      }
    } catch (error) {
      this.removeToken();
    }
    return null;
  }

  // Check if current user is admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.type === 'admin';
  }

  // Check if current user is regular user
  isUser() {
    const user = this.getCurrentUser();
    return user?.type === 'user';
  }

  // Logout
  logout() {
    this.removeToken();
    // Redirect to appropriate page
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/admin')) {
      window.location.href = '/admin';
    } else {
      window.location.href = '/user';
    }
  }

  // Auto logout when token expires
  setupTokenExpiration() {
    const token = this.getToken();
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const timeUntilExpiry = (decoded.exp * 1000) - Date.now();
      
      if (timeUntilExpiry > 0) {
        setTimeout(() => {
          this.logout();
          alert('Your session has expired. Please login again.');
        }, timeUntilExpiry);
      } else {
        this.logout();
      }
    } catch (error) {
      this.logout();
    }
  }
}

export const authService = new AuthService();