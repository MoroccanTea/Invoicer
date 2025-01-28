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
        description: `${project.title} - Professional Services`,
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
        items: updatedItems,
        status: formData.status,
        taxRate,
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Category: {selectedProject.category}</p>
            </div>
          )}

          {/* Invoice Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center gap-1 px-3 py-1.5 rounded-md border border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Item
              </button>
            </div>
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-2 items-center mb-4 px-2 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md group">
                  <div className="md:col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm dark:bg-dark-background dark:text-dark-text"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-400">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                      min="0"
                      step="0.25"
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm dark:bg-dark-background dark:text-dark-text"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-400">Rate</label>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm dark:bg-dark-background dark:text-dark-text"
                      required
                    />
                  </div>
                  <div className="md:col-span-3 flex items-center gap-4 justify-end">
                    <div className="min-w-[90px] text-right">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-400">Amount</label>
                      <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white truncate">
                        {config.currency.symbol}{item.amount.toFixed(2)}
                      </div>
                    </div>
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mr-2"></div>
                    <button
                      type="button"
                      onClick={() => {
                        toast.custom((t) => (
                          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
                            fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4`}>
                            <div className="bg-white dark:bg-dark-secondary p-6 rounded-lg shadow-xl max-w-md w-full" key={t.id}>
                              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Confirm Deletion</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                Are you sure you want to delete this item?
                              </p>
                              <div className="mt-4 flex justify-end gap-2">
                                <button
                                  onClick={() => toast.dismiss(t.id)}
                                  className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    toast.dismiss(t.id);
                                    removeItem(index);
                                  }}
                                  className="px-3 py-1.5 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ), { duration: Infinity });
                      }}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Remove item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4 dark:border-gray-700">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="dark:text-gray-300">Subtotal:</span>
                <span className="dark:text-white">{config.currency.symbol}{formData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="dark:text-gray-300">Tax Rate:</span>
                <div className="flex items-center">
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
                    className="w-24 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-dark-background dark:text-dark-text"
                  />
                  <span className="ml-2 dark:text-gray-300">%</span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="dark:text-gray-300">Tax Amount:</span>
                <span className="dark:text-white">{config.currency.symbol}{formData.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="dark:text-gray-300">Total:</span>
                <span className="dark:text-white">{config.currency.symbol}{formData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Date</label>
              <input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-dark-background dark:text-dark-text"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-dark-background dark:text-dark-text"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-dark-background dark:text-dark-text"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-dark-background dark:text-dark-text"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <div>
              {id && (
                <button
                  type="button"
                  onClick={() => {
                    toast.custom((t) => (
                      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
                        fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4`}>
                      <div className="bg-white dark:bg-dark-secondary p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-md">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Confirm Deletion</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Are you sure you want to delete this invoice? This action cannot be undone.
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              toast.dismiss(t.id);
                              const deleteToast = toast.loading('Deleting invoice...');
                              api.delete(`/invoices/${id}`)
                                .then(() => {
                                  toast.success('Invoice deleted successfully');
                                  navigate('/invoices');
                                })
                                .catch(error => {
                                  toast.error(error.message || 'Failed to delete invoice');
                                  console.error('Delete error:', error);
                                })
                                .finally(() => toast.dismiss(deleteToast));
                            }}
                            className="px-3 py-1.5 text-sm text-white bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 rounded-md border border-red-700 dark:border-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    ), { duration: Infinity });
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete Invoice
                </button>
              )}
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 border border-transparent rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                {loading ? 'Saving...' : 'Save Invoice'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
