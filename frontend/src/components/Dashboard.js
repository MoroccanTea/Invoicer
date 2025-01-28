import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
         ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    revenueByMonth: [],
    projectsByCategory: [],
    invoiceStatus: [],
    recentActivity: [],
    totalRevenue: 0,
    activeProjects: 0,
    pendingInvoices: 0,
    completedProjects: 0,
    currency: {
      code: 'USD',
      symbol: '$'
    }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.get('/stats/dashboard');
        const configData = await api.get('/configs');
        setStats({
          revenueByMonth: data.revenueByMonth || [],
          projectsByCategory: data.projectsByCategory || [],
          invoiceStatus: data.invoiceStatus || [],
          recentActivity: data.recentActivity || [],
          totalRevenue: data.totalRevenue || 0,
          activeProjects: data.activeProjects || 0,
          pendingInvoices: data.pendingInvoices || 0,
          completedProjects: data.completedProjects || 0,
          currency: configData.currency || { code: 'USD', symbol: '$' }
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error.message);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-6 dark:bg-dark-background dark:text-dark-text">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Summary Cards */}
        <div className="bg-white dark:bg-dark-secondary p-4 rounded-lg shadow dark:shadow-lg">
          <h3 className="text-gray-500 dark:text-gray-400">Total Revenue</h3>
          <p className="text-2xl font-bold dark:text-white">{stats.currency.symbol}{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-dark-secondary p-4 rounded-lg shadow dark:shadow-lg">
          <h3 className="text-gray-500 dark:text-gray-400">Active Projects</h3>
          <p className="text-2xl font-bold dark:text-white">{stats.activeProjects}</p>
        </div>
        <div className="bg-white dark:bg-dark-secondary p-4 rounded-lg shadow dark:shadow-lg">
          <h3 className="text-gray-500 dark:text-gray-400">Pending Invoices</h3>
          <p className="text-2xl font-bold dark:text-white">{stats.pendingInvoices}</p>
        </div>
        <div className="bg-white dark:bg-dark-secondary p-4 rounded-lg shadow dark:shadow-lg">
          <h3 className="text-gray-500 dark:text-gray-400">Completed Projects</h3>
          <p className="text-2xl font-bold dark:text-white">{stats.completedProjects}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-dark-secondary p-4 rounded-lg shadow dark:shadow-lg">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="gray" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Projects by Category */}
        <div className="bg-white dark:bg-dark-secondary p-4 rounded-lg shadow dark:shadow-lg">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Projects by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.projectsByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {stats.projectsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-dark-secondary p-4 rounded-lg shadow dark:shadow-lg lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Recent Activity</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-secondary text-left text-xs leading-4 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-secondary text-left text-xs leading-4 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-secondary text-left text-xs leading-4 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity.map((activity, index) => (
                  <tr key={index} className="dark:border-gray-700">
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700 dark:text-gray-300">
                      {new Date(activity.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700 dark:text-gray-300">
                      {activity.description}
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${activity.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          activity.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
