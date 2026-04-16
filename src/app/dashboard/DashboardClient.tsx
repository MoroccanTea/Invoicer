'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FiDollarSign,
  FiFolder,
  FiFileText,
  FiUsers,
  FiTrendingUp,
  FiAlertCircle,
  FiClock,
} from 'react-icons/fi'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { formatDistanceToNow } from 'date-fns'

interface DashboardStats {
  revenue: {
    allTime: number
    year: number
    quarter: number
    month: number
  }
  projects: {
    active: number
    completed: number
  }
  invoices: {
    pending: number
    paid: number
  }
  clients: number
  categoryDistribution: Array<{
    category: string
    count: number
    revenue: number
  }>
  recentActivity: Array<{
    id: string
    type: string
    description: string
    user: string
    createdAt: string
  }>
  monthlyRevenue: Array<{
    month: string
    total: number
  }>
  currency: string
  currencySymbol: string
  isConfigured: boolean
}

interface Props {
  stats: DashboardStats
}

const CATEGORY_COLORS: Record<string, string> = {
  teaching: '#3B82F6',
  software_development: '#10B981',
  consulting: '#F59E0B',
  pentesting: '#EF4444',
}

const CATEGORY_LABELS: Record<string, string> = {
  teaching: 'Teaching',
  software_development: 'Software Dev',
  consulting: 'Consulting',
  pentesting: 'Pentesting',
}

type RevenuePeriod = 'allTime' | 'year' | 'quarter' | 'month'

export default function DashboardClient({ stats }: Props) {
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>('month')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getRevenueValue = () => {
    return stats.revenue[revenuePeriod]
  }

  const getRevenueLabel = () => {
    switch (revenuePeriod) {
      case 'allTime':
        return 'All Time'
      case 'year':
        return 'This Year'
      case 'quarter':
        return 'This Quarter'
      case 'month':
        return 'This Month'
    }
  }

  const pieData = stats.categoryDistribution.map((item) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    value: item.count,
    revenue: item.revenue,
    color: CATEGORY_COLORS[item.category] || '#6B7280',
  }))

  return (
    <div className="space-y-6">
      {/* Setup Alert */}
      {!stats.isConfigured && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
              Configuration Required
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Please complete your business configuration to start creating invoices.
            </p>
            <Link
              href="/dashboard/configuration"
              className="inline-block mt-2 text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline"
            >
              Go to Configuration &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <select
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value as RevenuePeriod)}
              className="text-xs bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 border-0 focus:ring-2 focus:ring-primary-500"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="allTime">All Time</option>
            </select>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Revenue ({getRevenueLabel()})
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(getRevenueValue())} {stats.currencySymbol}
          </p>
        </div>

        {/* Active Projects */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FiFolder className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <FiTrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {stats.projects.active}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {stats.projects.completed} completed
          </p>
        </div>

        {/* Pending Invoices */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending Invoices</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {stats.invoices.pending}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {stats.invoices.paid} paid
          </p>
        </div>

        {/* Total Clients */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Clients</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {stats.clients}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Revenue
          </h3>
          <div className="h-64">
            {stats.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey="month"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => {
                      const [year, month] = value.split('-')
                      return new Date(year, month - 1).toLocaleDateString('en-US', {
                        month: 'short',
                      })
                    }}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value) => [
                      `${formatCurrency((value as number) || 0)} ${stats.currencySymbol}`,
                      'Revenue',
                    ]}
                  />
                  <Bar dataKey="total" fill="#230082" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No revenue data yet
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            By Category
          </h3>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value, name, props) => [
                      `${(value as number) || 0} invoices (${formatCurrency((props as any).payload?.revenue || 0)} ${stats.currencySymbol})`,
                      (name as string) || '',
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <FiClock className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.user} &bull;{' '}
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No recent activity
          </p>
        )}
      </div>
    </div>
  )
}
