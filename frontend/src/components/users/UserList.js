import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  if (loading) return <div className="text-center dark:bg-dark-background dark:text-dark-text">Loading...</div>;
  if (error) return <div className="text-red-500 dark:text-red-400 dark:bg-dark-background">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-dark-background dark:text-dark-text">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <button
          onClick={() => navigate('/users/new')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Add New User
        </button>
      </div>

      <div className="bg-white dark:bg-dark-secondary shadow-md rounded my-6 overflow-x-auto">
        <table className="min-w-full w-full table-auto">
          <thead className="bg-gray-200 dark:bg-gray-800">
            <tr className="text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
              <th className="py-3 px-4 text-left hidden md:table-cell">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left hidden sm:table-cell">Role</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 dark:text-gray-300 text-sm divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="py-3 px-4 hidden md:table-cell dark:text-gray-300">
                  {user.name}
                </td>
                <td className="py-3 px-4 dark:text-gray-300">
                  <div className="flex flex-col">
                    <span className="font-medium md:hidden">{user.name}</span>
                    <span>{user.email}</span>
                    <div className="md:hidden">
                      <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell dark:text-gray-300 capitalize">
                  {user.role}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => navigate(`/users/edit/${user._id}`)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
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
    </div>
  );
};

export default UserList;
