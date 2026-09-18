import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('civictrust_token'));
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('civictrust_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (error) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('civictrust_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: loggedUser } = res.data;
      localStorage.setItem('civictrust_token', newToken);
      setToken(newToken);
      setUser(loggedUser);
      addToast(`Welcome back, ${loggedUser.name}! (${loggedUser.role.toUpperCase()})`, 'success');
      return { success: true, user: loggedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Check credentials.';
      addToast(message, 'error');
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token: newToken, user: registeredUser } = res.data;
      localStorage.setItem('civictrust_token', newToken);
      setToken(newToken);
      setUser(registeredUser);
      addToast('Registration successful! You can now report civic issues.', 'success');
      return { success: true, user: registeredUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      addToast(message, 'error');
      return { success: false, message };
    }
  };

  // Quick 1-click Demo Login for Hackathon Evaluation
  const quickLogin = async (role) => {
    if (role === 'admin') {
      return await login('admin@civictrust.org', 'Admin@123');
    } else {
      return await login('citizen@civictrust.org', 'Citizen@123');
    }
  };

  const logout = () => {
    localStorage.removeItem('civictrust_token');
    setToken(null);
    setUser(null);
    addToast('Logged out successfully', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isCitizen: user?.role === 'citizen',
        isLoading,
        login,
        register,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
