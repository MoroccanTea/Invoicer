 import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../context/DarkModeContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import FormInput from '../common/FormInput';
import FormButton from '../common/FormButton';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login, token } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('Login attempt with:', formData);
      
      const data = await api.post('/auth/login', formData);
      console.log('Login response:', data);
      
      if (!data.token || !data.refreshToken) {
        throw new Error('Missing tokens in login response');
      }

      login(data.user, data.token, data.refreshToken);
      
      console.log('Tokens in localStorage after login:', {
        token: localStorage.getItem('token'),
        refreshToken: localStorage.getItem('refreshToken')
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <button 
          type="button" 
          onClick={toggleDarkMode} 
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
        </button>
      </div>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <FormInput 
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            icon={EnvelopeIcon}
            error={error}
          />

          <FormInput 
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            icon={LockClosedIcon}
          />

          <FormButton 
            type="submit" 
            loading={loading}
          >
            Sign In
          </FormButton>

          <div className="flex items-center justify-center">
            <div className="text-sm">
              <Link to="/register" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                Don't have an account? Sign up
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
