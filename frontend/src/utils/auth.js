// Utility functions for authentication
const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_info';

export const authUtils = {
  // Save token to localStorage
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Get token from localStorage
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Remove token from localStorage
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Save user info to localStorage
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Get user info from localStorage
  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Remove user info from localStorage
  removeUser() {
    localStorage.removeItem(USER_KEY);
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Check if user is admin
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  },

  // Clear all auth data
  logout() {
    this.removeToken();
    this.removeUser();
  }
};

