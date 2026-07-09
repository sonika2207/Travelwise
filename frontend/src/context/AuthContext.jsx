import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/authApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists on load
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authApi.login(credentials);
      const { token, name, email } = data;
      
      localStorage.setItem('token', token);
      const userData = { name, email };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Welcome back!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await authApi.register(userData);
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('You have been logged out.');
    navigate('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sky">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
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
