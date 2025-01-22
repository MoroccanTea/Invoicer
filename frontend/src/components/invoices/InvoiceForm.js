import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [config, setConfig] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    project: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 0,
    status: 'draft',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchConfig();
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/v1/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      toast.error('Error loading projects');
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/v1/configs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setConfig(data);
      if (!id) {
        // Set default tax rate for new invoices
        setFormData(prev => ({
          ...prev,
          taxRate: data.defaultTaxRate
        }));
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error(error.message || 'Error loading configuration');
    }
  };

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/v1/invoices/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error(error.message || 'Error loading invoice');
    }
  };

  const handleProjectChange = (projectId) => {
    const project = projects.find(p => p._id === projectId);
    setSelectedProject(project);
    setFormData(prev => ({
      ...prev,
      project: projectId,
      items: [{
        description: `${project.title} - Professional Services`,
        quantity: 1,
        rate: project.rate || 0,
        amount: project.rate || 0
      }]
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
  
    // Recalculate amount for the item
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = (
        parseFloat(newItems[index].quantity || 0) * 
        parseFloat(newItems[index].rate || 0)
      );
    }
  
    // Recalculate totals
    const subtotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = subtotal * (parseFloat(formData.taxRate || 0) / 100);
    const total = subtotal + taxAmount;
  
    setFormData({
      ...formData,
      items: newItems,
      subtotal,
      taxAmount,
      total
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (formData.taxRate / 100);
    const total = subtotal + taxAmount;

    setFormData({
      ...formData,
      items: newItems,
      subtotal,
      taxAmount,
      total
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Calculate totals
      const updatedItems = formData.items.map(item => ({
        ...item,
        amount: parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)
      }));
  
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const taxRate = parseFloat(formData.taxRate || 0);
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;
  
      const dataToSend = {
        ...formData,
        items: updatedItems,
        subtotal,
        taxRate,
        taxAmount,
        total,
        invoiceDate: formData.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: formData.dueDate
      };
  
      const url = id ? `/api/v1/invoices/${id}` : '/api/v1/invoices';
      const method = id ? 'PATCH' : 'POST';
  
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save invoice');
      }
  
      toast.success(`Invoice ${id ? 'updated' : 'created'} successfully`);
      navigate('/invoices');
    } catch (error) {
      toast.error(error.message || 'Failed to save invoice');
      console.error('Invoice save error:', error);
    } finally {
      setLoading(false);
    }
  };
  

  if (!config) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">{id ? 'Edit Invoice' : 'Create Invoice'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Project</label>
            <select
              value={formData.project}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title} - {project.client}
                </option>
              ))}
            </select>
          </div>

          {/* Display Project Info */}
          {selectedProject && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-700">Project Details</h3>
              <p className="text-sm text-gray-600">Client: {selectedProject.client}</p>
              <p className="text-sm text-gray-600">Category: {selectedProject.category}</p>
            </div>
          )}

          {/* Invoice Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-indigo-600 hover:text-indigo-900"
              >
                Add Item
              </button>
            </div>
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-6">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                      min="0"
                      step="0.25"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700">Rate</label>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700">Amount</label>
                    <div className="mt-1 text-gray-900">{config.currency.symbol}{item.amount.toFixed(2)}</div>
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="mt-6 text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{config.currency.symbol}{formData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax Rate:</span>
                <input
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => {
                    const newTaxRate = parseFloat(e.target.value);
                    const newTaxAmount = formData.subtotal * (newTaxRate / 100);
                    setFormData({
                      ...formData,
                      taxRate: newTaxRate,
                      taxAmount: newTaxAmount,
                      total: formData.subtotal + newTaxAmount
                    });
                  }}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span>%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax Amount:</span>
                <span>{config.currency.symbol}{formData.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{config.currency.symbol}{formData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
              <input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/invoices')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Saving...' : 'Save Invoice'}
            </button>
          </div>
      </form>
    </div>
  );
};

export default InvoiceForm;