import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import ConfirmationModal from '../common/ConfirmationModal';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteClientId, setDeleteClientId] = useState(null);
  const { token } = useAuth();

  const fetchClients = async (page = 1) => {
    try {
      setLoading(true);
      const data = await api.get(`/clients?page=${page}`);
      setTotalPages(data.totalPages || 1);
      setClients(data);
      if (!data.length) {
        toast('No clients found.', { icon: '😢' });
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    await fetchClients(page);
  };

  useEffect(() => {
    fetchClients(currentPage);
  }, [token]);

  if (loading) {
    return <div className="flex justify-center items-center h-64 dark:bg-dark-background dark:text-dark-text">Loading...</div>;
  }

  const handleDeleteClient = (clientId) => {
    setDeleteClientId(clientId);
  };

  const confirmDeleteClient = async () => {
    if (!deleteClientId) return;

    try {
      await api.delete(`/clients/${deleteClientId}`);
      toast.success('Client deleted successfully');
      // Update the clients list
      setClients(clients.filter(client => client._id !== deleteClientId));
      setDeleteClientId(null);
    } catch (error) {
      toast.error('Error deleting client');
    }
  };

  const cancelDelete = () => {
    setDeleteClientId(null);
  };

  return (
    <div className="p-6 dark:bg-dark-background dark:text-dark-text">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Clients</h2>
        <Link
          to="/clients/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="flex justify-center items-center h-64 dark:bg-dark-background dark:text-dark-text">
          No clients found. start by adding a new client.
        </div>
      ) : (

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client._id} className="bg-white dark:bg-dark-secondary rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white">{client.name}</h3>
            {client.company && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">{client.company}</p>
            )}
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-300">{client.email}</p>
              {client.phone && (
                <p className="text-sm text-gray-500 dark:text-gray-300">{client.phone}</p>
              )}
            </div>
            <div className="mt-4 flex space-x-4">
              <Link
                to={`/clients/${client._id}/edit`}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded mr-2"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDeleteClient(client._id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
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

      <ConfirmationModal 
        isOpen={!!deleteClientId}
        onClose={cancelDelete}
        onConfirm={confirmDeleteClient}
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone."
      />
    </div>
  );
};

export default ClientList;
