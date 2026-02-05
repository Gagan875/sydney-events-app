import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios base URL for backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/user');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      // Redirect to backend Google OAuth
      window.location.href = `${API_BASE_URL}/auth/google`;
    } catch (error) {
      console.error('Google OAuth error:', error);
    }
  };

  const demoLogin = async () => {
    try {
      const response = await api.post('/auth/demo-login', {});
      if (response.data.success) {
        setUser(response.data.user);
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Demo login error:', error);
      alert('Demo login failed. Please try again.');
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    login,
    demoLogin,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};