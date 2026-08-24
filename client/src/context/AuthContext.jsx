import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('society_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success) {
            setUser(res.data);
          } else {
            localStorage.removeItem('society_token');
          }
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('society_token');
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, []);

  const login = async (credentials) => {
    const res = await api.login(credentials);
    if (res.success) {
      localStorage.setItem('society_token', res.data.token);
      setUser(res.data);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      localStorage.setItem('society_token', res.data.token);
      setUser(res.data);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('society_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
