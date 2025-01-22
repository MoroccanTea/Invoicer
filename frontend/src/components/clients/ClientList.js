import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get(`/clients`);
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [token]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      const response = await api.delete(`/clients/${clientId}`);

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      toast.success('Client deleted successfully');
      // Update the clients list
      setClients(clients.filter(client => client._id !== clientId));
    } catch (error) {
      toast.error('Error deleting client');
    }
  };


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Clients</h2>
        <Link
          to="/clients/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New Client
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client._id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold">{client.name}</h3>
            {client.company && (
              <p className="text-gray-600 mt-1">{client.company}</p>
            )}
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-500">{client.email}</p>
              {client.phone && (
                <p className="text-sm text-gray-500">{client.phone}</p>
              )}
            </div>
            <div className="mt-4 flex space-x-4">
              <Link
                to={`/clients/${client._id}/edit`}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDeleteClient(client._id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientList;