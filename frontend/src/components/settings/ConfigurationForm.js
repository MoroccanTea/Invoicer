import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const ConfigurationForm = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    defaultTaxRate: 0,
    currency: {
      code: 'USD',
      symbol: '$'
    },
    allowRegistration: true,
    businessInfo: {
      CNIE: '',
      IF: '',
      taxeProfessionnelle: '',
      ICE: '',
      telephone: '',
      website: '',
      email: ''
    },
    categories: []
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }
    fetchConfig();
  }, [user, navigate]);

  const fetchConfig = async () => {
    try {
      const data = await api.get('/configs');
      setFormData(prevState => ({
        ...prevState,
        ...data,
        categories: data.categories?.length ? data.categories : prevState.categories,
        businessInfo: {
          ...data.businessInfo || {}
        }
      }));
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error(error.message || 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessInfoChange = (field, value) => {
    setFormData({
      ...formData,
      businessInfo: {
        ...formData.businessInfo,
        [field]: value
      }
    });
  };

  const handleCategoryChange = (index, field, value) => {
    const newCategories = [...formData.categories];
    newCategories[index] = {
      ...newCategories[index],
      [field]: field === 'code' ? value.toUpperCase() : value
    };
    setFormData({
      ...formData,
      categories: newCategories
    });
  };

  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [...formData.categories, { name: '', code: '' }]
    });
  };

  const removeCategory = (index) => {
    const newCategories = formData.categories.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      categories: newCategories
    });
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate categories
      if (formData.categories.some(cat => !cat.name || !cat.code)) {
        throw new Error('All categories must have a name and code');
      }
  
      const dataToSend = {
        defaultTaxRate: parseFloat(formData.defaultTaxRate),
        currency: formData.currency,
        categories: formData.categories,
        allowRegistration: formData.allowRegistration,
        businessInfo: {
          CNIE: formData.businessInfo.CNIE || '',
          IF: formData.businessInfo.IF || '',
          taxeProfessionnelle: formData.businessInfo.taxeProfessionnelle || '',
          ICE: formData.businessInfo.ICE || '',
          telephone: formData.businessInfo.telephone || '',
          website: formData.businessInfo.website || '',
          email: formData.businessInfo.email || ''
        }
      };

      const response = await api.patch('/configs', dataToSend);
      console.log('Configuration saved:', response);
  
      toast.success('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving config:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || error.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-dark-secondary shadow-lg rounded-xl dark:text-dark-text">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white border-b pb-4">System Configuration</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Registration Settings */}
        <div className="bg-gray-50 dark:bg-dark-background p-4 rounded-lg shadow-sm">
          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md transition">
            <input
              type="checkbox"
              checked={formData.allowRegistration}
              onChange={(e) => setFormData({ ...formData, allowRegistration: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Allow User Registration</span>
          </label>
        </div>

        {/* Business Information */}
        <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 border-b dark:border-gray-700 pb-3">Business Details</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CNIE</label>
              <input
                type="text"
                value={formData.businessInfo.CNIE}
                onChange={(e) => handleBusinessInfoChange('CNIE', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 hover:border-indigo-400 dark:bg-dark-background dark:text-dark-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">IF (Identifiant Fiscal)</label>
              <input
                type="text"
                value={formData.businessInfo.IF}
                onChange={(e) => handleBusinessInfoChange('IF', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-dark-background dark:text-dark-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Taxe Professionnelle</label>
              <input
                type="text"
                value={formData.businessInfo.taxeProfessionnelle}
                onChange={(e) => handleBusinessInfoChange('taxeProfessionnelle', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-dark-background dark:text-dark-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ICE</label>
              <input
                type="text"
                value={formData.businessInfo.ICE}
                onChange={(e) => handleBusinessInfoChange('ICE', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-dark-background dark:text-dark-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
              <input
                type="tel"
                value={formData.businessInfo.telephone}
                onChange={(e) => handleBusinessInfoChange('telephone', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-dark-background dark:text-dark-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Web</label>
              <input
                type="url"
                value={formData.businessInfo.website}
                onChange={(e) => handleBusinessInfoChange('website', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-dark-background dark:text-dark-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={formData.businessInfo.email}
                onChange={(e) => handleBusinessInfoChange('email', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-dark-background dark:text-dark-text"
              />
            </div>
          </div>
        </div>

        {/* Tax Rate Configuration */}
        <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 border-b dark:border-gray-700 pb-3">Financial Settings</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.defaultTaxRate}
                onChange={(e) => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 hover:border-indigo-400 dark:bg-dark-background dark:text-dark-text transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency Configuration</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Code</label>
                  <input
                    type="text"
                    value={formData.currency.code}
                    onChange={(e) => setFormData({
                      ...formData,
                      currency: { ...formData.currency, code: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 hover:border-indigo-400 dark:bg-dark-background dark:text-dark-text transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Symbol</label>
                  <input
                    type="text"
                    value={formData.currency.symbol}
                    onChange={(e) => setFormData({
                      ...formData,
                      currency: { ...formData.currency, symbol: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 hover:border-indigo-400 dark:bg-dark-background dark:text-dark-text transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Configuration */}
        <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-3">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Activity Categories</h3>
            <button
              type="button"
              onClick={addCategory}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Add Category</span>
            </button>
          </div>
          <div className="space-y-4">
            {formData.categories.map((category, index) => (
              <div key={index} className="flex gap-4 items-center bg-gray-50 dark:bg-dark-background p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                    placeholder="Category Name"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 hover:border-indigo-400 dark:bg-dark-background dark:text-dark-text transition"
                    required
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Code</label>
                  <input
                    type="text"
                    value={category.code}
                    onChange={(e) => handleCategoryChange(index, 'code', e.target.value)}
                    placeholder="Code"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 hover:border-indigo-400 dark:bg-dark-background dark:text-dark-text transition"
                    maxLength="3"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCategory(index)}
                  className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium py-2 px-3 rounded-md transition mt-6"
                  disabled={formData.categories.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 border border-transparent rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigurationForm;
