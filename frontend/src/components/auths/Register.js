import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import FormInput from '../common/FormInput';
import FormButton from '../common/FormButton';

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkRegistration = async () => {
      try {
        const response = await api.get('/configs');
        console.log('Config response:', response);
        
        if (!isMounted) return;

        const data = response.data || response;
        
        // If user is logged in and registration is disabled, redirect to dashboard
        if (user && !data?.allowRegistration) {
          setError('User registration is currently disabled by the administrator');
          navigate('/dashboard');
          return;
        }
        
        // Set config for both allowed and disabled registration
        if (isMounted) {
          setConfig(data);
        }
      } catch (error) {
        console.error('Error checking registration config:', error);
        
        if (isMounted) {
          // Set a default config if fetch fails
          setConfig({ allowRegistration: true });
          
          // Only redirect to login if user is not logged in
          if (!user) {
            navigate('/login');
          }
        }
      }
    };

    checkRegistration();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Double check registration is still enabled
    if (!config?.allowRegistration) {
      setError('User registration is currently disabled by the administrator');
      navigate('/login');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking config
  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-background">
        <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-dark-secondary rounded-lg shadow dark:shadow-lg">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-300">Checking registration availability...</p>
        </div>
      </div>
    );
  }

  // Show error state if registration is disabled
  if (!config.allowRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-background">
        <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-dark-secondary rounded-lg shadow dark:shadow-lg">
          <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-400 px-4 py-3 rounded">
            {error || 'User registration is currently disabled by the administrator'}
          </div>
        </div>
      </div>
    );
  }

  // Show registration form if registration is enabled
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <FormInput 
            id="name"
            name="name"
            type="text"
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            icon={UserIcon}
          />

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

          <FormInput 
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            icon={LockClosedIcon}
            error={formData.password !== formData.confirmPassword ? 'Passwords do not match' : undefined}
          />

          <FormButton 
            type="submit" 
            loading={loading}
          >
            Register
          </FormButton>

          <div className="text-center">
            <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
