import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    const abortController = new AbortController();
    
    if (id) {
      fetchUser(abortController.signal);
    } else {
      // Reset form for new user creation
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user'
      });
    }

    return () => abortController.abort();
  }, [id]); // Only react to ID changes


  const fetchUser = async (signal) => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${id}`, { signal });
      
      if (!response) {
        throw new Error('User data not found in response');
      }

      const { name, email, role, updatedAt } = response;
      
      setFormData({ 
        name: name || '', 
        email: email || '', 
        password: '', 
        role: role || 'user' 
      });

      // Store latest update timestamp
      localStorage.setItem(`user-${id}-updatedAt`, updatedAt);

    } catch (err) {
      console.error('Error fetching user:', err);
      toast.error(err.message || 'Failed to fetch user');
      navigate('/users', { state: { error: 'User not found' } });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Basic validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    if (!id && !formData.password.trim()) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      if (id) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await api.put(`/users/${id}`, updateData);
      } else {
        await api.post('/users', formData);
      }
      navigate('/users');
    } catch (err) {
      console.error('Error saving user:', err);
      const errorMsg = err.message || 'Failed to save user';
      toast.error(errorMsg);
      setErrors({ server: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Add error boundary for API failures
  if (!api) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          API connection not configured properly
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center dark:text-white">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-dark-background min-h-screen">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
          {id ? 'Edit User' : 'Create New User'}
        </h1>

        {errors.server && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {errors.server}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-dark-text dark:bg-dark-background dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline dark:focus:border-indigo-400"
              required
            />
            {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-dark-text dark:bg-dark-background dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline dark:focus:border-indigo-400"
              required
            />
            {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Password {id && '(Leave blank to keep current password)'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-dark-text dark:bg-dark-background dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline dark:focus:border-indigo-400"
              {...(!id && { required: true })}
            />
            {errors.password && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-dark-text dark:bg-dark-background dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline dark:focus:border-indigo-400"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

UserForm.propTypes = {};

export default UserForm;
