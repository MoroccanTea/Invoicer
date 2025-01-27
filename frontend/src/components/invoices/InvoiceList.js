import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/invoices?page=${currentPage}`);
        
        // Extensive logging for debugging
        console.log('Full API Response:', response);
        console.log('Response Keys:', Object.keys(response));

        // Multiple strategies to extract invoices
        let fetchedInvoices = [];
        if (Array.isArray(response)) {
          fetchedInvoices = response;
        } else if (response.data && Array.isArray(response.data)) {
          fetchedInvoices = response.data;
        } else if (response.data && response.data.invoices) {
          fetchedInvoices = response.data.invoices;
        } else if (response.invoices) {
          fetchedInvoices = response.invoices;
        }

        console.log('Extracted Invoices:', fetchedInvoices);

        // Validate and enrich invoices
        const validInvoices = fetchedInvoices
          .filter(invoice => invoice && typeof invoice === 'object' && invoice._id)
          .map(invoice => ({
            ...invoice,
            client: {
              name: 
                invoice.client?.name || 
                invoice.clientName || 
                invoice.client_name || 
                (invoice.client && (invoice.client.fullName || invoice.client.displayName)) || 
                'Unknown Client'
            }
          }));

        console.log('Processed Invoices:', validInvoices);

        setInvoices(validInvoices);

        // Determine total pages
        const pages = response.data?.totalPages || 
                      response.totalPages || 
                      (validInvoices.length > 0 ? 1 : 0);
        
        setTotalPages(pages);

      } catch (error) {
        console.error('Error fetching invoices:', error);
        setError(error.message || 'Failed to load invoices');
        toast.error('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [currentPage]);

  const handleDeleteInvoice = async (id) => {
    try {
      await api.delete(`/invoices/${id}`);
      setInvoices(invoices.filter(invoice => invoice._id !== id));
      toast.success('Invoice deleted successfully');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen dark:bg-dark-background dark:text-dark-text">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 dark:bg-dark-background dark:text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 dark:bg-dark-background dark:text-dark-text">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <Link 
          to="/invoices/new" 
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
        >
          Create Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No invoices found
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-secondary shadow rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-secondary text-left text-xs leading-4 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-secondary text-left text-xs leading-4 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-secondary text-left text-xs leading-4 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-secondary text-left text-xs leading-4 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-secondary text-left text-xs leading-4 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="dark:border-gray-700">
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700 dark:text-gray-300">
                    {invoice.invoiceNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700 dark:text-gray-300">
                    {invoice.client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700 dark:text-gray-300">
                    ${(invoice.totalAmount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {(invoice.status || 'unknown').charAt(0).toUpperCase() + (invoice.status || 'unknown').slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700 text-sm leading-5 font-medium">
                    <div className="flex space-x-2">
                      <Link 
                        to={`/invoices/${invoice._id}/edit`} 
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDeleteInvoice(invoice._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <nav>
            <ul className="flex">
              {[...Array(totalPages)].map((_, index) => (
                <li key={index}>
                  <button 
                    onClick={() => handlePageChange(index + 1)}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentPage === index + 1 
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500' 
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
