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
    categories: [
      { name: 'Teaching', code: 'TCH' },
      { name: 'Development', code: 'DEV' },
      { name: 'Consulting', code: 'CNS' },
      { name: 'Pentesting', code: 'PEN' }
    ]
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
      businessInfo: {
        CNIE: prevState.businessInfo.CNIE || '', // Default value if not provided by API
        IF: prevState.businessInfo.IF || '', // Default value if not provided by API
        taxeProfessionnelle: prevState.businessInfo.taxeProfessionnelle || '', // Default value if not provided by API
        ICE: prevState.businessInfo.ICE || '', // Default value if not provided by API
        telephone: prevState.businessInfo.telephone || '', // Default value if not provided by API
        website: prevState.businessInfo.website || '', // Default value if not provided by API
        email: prevState.businessInfo.email || '', // Default value if not provided by API
        ...data.businessInfo // Merge with the businessInfo from the API
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

      await api.patch('/configs', dataToSend);
  
      toast.success('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Configuration</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Registration Settings */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.allowRegistration}
              onChange={(e) => setFormData({ ...formData, allowRegistration: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Allow User Registration</span>
          </label>
        </div>

        {/* Business Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">CNIE</label>
              <input
                type="text"
                value={formData.businessInfo.CNIE}
                onChange={(e) => handleBusinessInfoChange('CNIE', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">IF (Identifiant Fiscal)</label>
              <input
                type="text"
                value={formData.businessInfo.IF}
                onChange={(e) => handleBusinessInfoChange('IF', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Taxe Professionnelle</label>
              <input
                type="text"
                value={formData.businessInfo.taxeProfessionnelle}
                onChange={(e) => handleBusinessInfoChange('taxeProfessionnelle', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ICE</label>
              <input
                type="text"
                value={formData.businessInfo.ICE}
                onChange={(e) => handleBusinessInfoChange('ICE', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                type="tel"
                value={formData.businessInfo.telephone}
                onChange={(e) => handleBusinessInfoChange('telephone', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Web</label>
              <input
                type="url"
                value={formData.businessInfo.website}
                onChange={(e) => handleBusinessInfoChange('website', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.businessInfo.email}
                onChange={(e) => handleBusinessInfoChange('email', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
        {/* Tax Rate Configuration */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Default Tax Rate (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.defaultTaxRate}
            onChange={(e) => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Currency Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency Code</label>
            <input
              type="text"
              value={formData.currency.code}
              onChange={(e) => setFormData({
                ...formData,
                currency: { ...formData.currency, code: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency Symbol</label>
            <input
              type="text"
              value={formData.currency.symbol}
              onChange={(e) => setFormData({
                ...formData,
                currency: { ...formData.currency, symbol: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Categories Configuration */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Activity Categories</h3>
            <button
              type="button"
              onClick={addCategory}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
            >
              Add Category
            </button>
          </div>
          <div className="space-y-4">
            {formData.categories.map((category, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                    placeholder="Category Name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="w-24">
                  <input
                    type="text"
                    value={category.code}
                    onChange={(e) => handleCategoryChange(index, 'code', e.target.value)}
                    placeholder="Code"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    maxLength="3"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCategory(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
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
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigurationForm;
