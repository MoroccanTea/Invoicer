import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import ConfirmationModal from '../common/ConfirmationModal';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/users?page=${page}`);
      setTotalPages(response.totalPages || 1);
      setUsers(response);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
      setLoading(false);
    }
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    await fetchUsers(page);
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, []);

  const handleDeleteUser = (userId) => {
    setDeleteUserId(userId);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await api.delete(`/users/${deleteUserId}`);
      setUsers(users.filter(user => user._id !== deleteUserId));
      setDeleteUserId(null);
      toast.success('User deleted successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete user';
      toast.error(errorMsg);
      setError(errorMsg);
    }
  };

  const cancelDelete = () => {
    setDeleteUserId(null);
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
                      onClick={() => handleDeleteUser(user._id)}
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
        isOpen={!!deleteUserId}
        onClose={cancelDelete}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
};

export default UserList;
