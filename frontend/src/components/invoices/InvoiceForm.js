import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

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
    items: [{
      description: 'Professional Services',
      quantity: 1,
      rate: 0,
      amount: 0
    }],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 0,
    status: 'draft',
    invoiceDate: new Date().toISOString().split('T')[0],
    // Set default due date to 30 days from now
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchConfig();
  }, []);

  useEffect(() => {
    if (id && projects.length > 0) {
      const loadData = async () => {
        await fetchInvoice();
      };
      loadData();
    }
  }, [id, projects]);

  const fetchProjects = async () => {
    try {
      const data = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      toast.error('Error loading projects');
    }
  };

  const fetchConfig = async () => {
    try {
      const data = await api.get('/configs');
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
      const data = await api.get(`/invoices/${id}`);
      // Fetch project directly to ensure we have it
      const projectData = await api.get(`/projects/${data.project._id}`);

      // Ensure project exists in projects list using functional update
      setProjects(prev => {
        if (!prev.some(p => p._id === projectData._id)) {
          return [...prev, projectData];
        }
        return prev;
      });

      // Set form data first to ensure project ID is available
      setFormData(prev => ({
        ...prev,
        ...data,
        project: projectData._id,
        invoiceDate: new Date(data.invoiceDate).toISOString().split('T')[0],
        dueDate: new Date(data.dueDate).toISOString().split('T')[0]
      }));

      setSelectedProject(projectData);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error(error.message || 'Error loading invoice');
    }
  };

  const handleProjectChange = (projectId) => {
    const project = projects.find(p => p._id === projectId);
    setSelectedProject(project);

    const rate = parseFloat(project.rate || 0);
    const quantity = 1;
    const amount = rate * quantity;

    setFormData(prev => {
      // Preserve existing items when editing
      const items = id ? prev.items : [{
        description: `${project.title} - ${project.description || 'Professional Services'}`,
        quantity,
        rate,
        amount
      }];

      const subtotal = amount;
      const taxRate = parseFloat(prev.taxRate || 0);
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      return {
        ...prev,
        project: projectId,
        items,
        subtotal,
        taxAmount,
        total
      };
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];

    // Update the field
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // Ensure numeric values
    if (field === 'quantity' || field === 'rate') {
      newItems[index].quantity = parseFloat(newItems[index].quantity || 0);
      newItems[index].rate = parseFloat(newItems[index].rate || 0);
      // Recalculate amount
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }

    // Recalculate totals
    const subtotal = newItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const taxRate = parseFloat(formData.taxRate || 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      items: newItems,
      subtotal,
      taxRate,
      taxAmount,
      total
    }));
  };

  const addItem = () => {
    const newItem = {
      description: 'Professional Services',
      quantity: 1,
      rate: 0,
      amount: 0
    };

    setFormData(prev => {
      const newItems = [...prev.items, newItem];
      const subtotal = newItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      const taxRate = parseFloat(prev.taxRate || 0);
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      return {
        ...prev,
        items: newItems,
        subtotal,
        taxAmount,
        total
      };
    });
  };

  const removeItem = (index) => {
    setFormData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const subtotal = newItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      const taxRate = parseFloat(prev.taxRate || 0);
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      return {
        ...prev,
        items: newItems,
        subtotal,
        taxAmount,
        total
      };
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

      // Only send allowed fields to the backend
      const dataToSend = {
        project: formData.project,
        items: updatedItems.map(item => ({
          ...item,
          description: item.description || 'Professional Services' // Ensure description exists
        })),
        subtotal,
        total,
        status: formData.status,
        taxRate: config.defaultTaxRate, // Use config tax rate instead of form input
        invoiceDate: new Date(formData.invoiceDate),
        dueDate: new Date(formData.dueDate),
        notes: formData.notes
      };

      if (id) {
        await api.patch(`/invoices/${id}`, dataToSend);
      } else {
        await api.post('/invoices', dataToSend);
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
      <h2 className="text-2xl font-bold mb-6 dark:text-white">{id ? 'Edit Invoice' : 'Create Invoice'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-dark-secondary shadow-md rounded-lg p-6 space-y-6">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project</label>
            <select
              value={formData.project}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-dark-background dark:text-dark-text"
              required
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title} - {project.client?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Display Project Info */}
          {selectedProject && (
            <div className="bg-gray-50 dark:bg-dark-background p-4 rounded-md">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Project Details</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Client: {selectedProject.client?.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
              Category: {config.categories?.find(c => c.code.toLowerCase() === selectedProject.category?.toLowerCase())?.name || selectedProject.category}
              </p>
            </div>
          )}

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
              >
                Add Item
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:bg-dark-background dark:text-dark-text"
                    required
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.25"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:bg-dark-background dark:text-dark-text"
                    min="1"
                    required
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Rate</label>
                  <input
                    type="number"
                    step="0.25"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:bg-dark-background dark:text-dark-text"
                    required
                  />
                </div>
                <div className="w-24 dark:text-gray-300">
                  ${item.amount.toFixed(2)}
                </div>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Dates, Tax and Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Date</label>
              <input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData(prev => ({...prev, invoiceDate: e.target.value}))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:bg-dark-background dark:text-dark-text"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:bg-dark-background dark:text-dark-text"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="received">Received</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({...prev, dueDate: e.target.value}))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:bg-dark-background dark:text-dark-text"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.taxRate}
                onChange={(e) => setFormData(prev => ({...prev, taxRate: e.target.value}))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:bg-dark-background dark:text-dark-text"
                disabled={!!id} // Disable tax rate editing for existing invoices
              />
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 dark:bg-dark-background p-4 rounded-md space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700 dark:text-gray-300">Subtotal:</span>
              <span className="dark:text-gray-300">${formData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700 dark:text-gray-300">Tax ({formData.taxRate}%):</span>
              <span className="dark:text-gray-300">${formData.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total:</span>
              <span className="font-bold dark:text-gray-300">${formData.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:bg-dark-background dark:text-dark-text"
              rows="3"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Invoice'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
