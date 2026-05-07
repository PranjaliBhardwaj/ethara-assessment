import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create a Context for authentication state
const AuthContext = createContext();

// Helper to get base URL for the API (matches server's .env CLIENT_URL if needed)
// Helper to get base URL for the API
const isProd = import.meta.env.PROD;
const API_BASE = isProd ? '/api' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api');

// Axios instance with base URL
const api = axios.create({ baseURL: API_BASE });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, name, email, role }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token/user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('taskflow_token');
    const storedUser = localStorage.getItem('taskflow_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: jwt, user: loggedUser } = response.data.data;
    // Store for persistence
    localStorage.setItem('taskflow_token', jwt);
    localStorage.setItem('taskflow_user', JSON.stringify(loggedUser));
    // Set axios header for subsequent calls
    api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
    setToken(jwt);
    setUser(loggedUser);
    return loggedUser;
  };

  const signup = async (name, email, password) => {
    const response = await api.post('/auth/signup', { name, email, password });
    // After signup the server returns the same payload as login
    const { token: jwt, user: newUser } = response.data.data;
    localStorage.setItem('taskflow_token', jwt);
    localStorage.setItem('taskflow_user', JSON.stringify(newUser));
    api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
    setToken(jwt);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    api, // expose the axios instance for components that need custom calls
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for consuming the context easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
