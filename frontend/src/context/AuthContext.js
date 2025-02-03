import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const navigate = useNavigate();

  const login = (userData, userToken, userRefreshToken) => {
    setUser(userData);
    setToken(userToken);
    setRefreshToken(userRefreshToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('refreshToken', userRefreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Verify token on mount and token change
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;
      
      try {
        const data = await api.get('/auth/verify');
        setUser(data.user);
      } catch (error) {
        console.error('Token verification failed:', error);
        logout();
      }
    };

    verifyToken();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    token,
    refreshToken,
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

let initialized = false;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
