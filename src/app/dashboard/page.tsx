import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
import { Invoice, Project, Client, ActivityLog, Config } from '@/lib/models'
import DashboardClient from './DashboardClient'

async function getDashboardStats(userId: string) {
  await connectDB()

  const config = await Config.findOne()
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const startOfQuarter = new Date(
    now.getFullYear(),
    Math.floor(now.getMonth() / 3) * 3,
    1
  )
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get revenue stats
  const [
    totalRevenueAllTime,
    totalRevenueYear,
    totalRevenueQuarter,
    totalRevenueMonth,
  ] = await Promise.all([
    Invoice.aggregate([
      { $match: { status: { $in: ['paid_pending_taxes', 'all_paid'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Invoice.aggregate([
      {
        $match: {
          status: { $in: ['paid_pending_taxes', 'all_paid'] },
          paidDate: { $gte: startOfYear },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Invoice.aggregate([
      {
        $match: {
          status: { $in: ['paid_pending_taxes', 'all_paid'] },
          paidDate: { $gte: startOfQuarter },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Invoice.aggregate([
      {
        $match: {
          status: { $in: ['paid_pending_taxes', 'all_paid'] },
          paidDate: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ])

  // Get project counts
  const [activeProjects, completedProjects] = await Promise.all([
    Project.countDocuments({ status: 'active' }),
    Project.countDocuments({ status: 'completed' }),
  ])

  // Get invoice counts
  const [pendingInvoices, paidInvoices] = await Promise.all([
    Invoice.countDocuments({ status: 'pending' }),
    Invoice.countDocuments({ status: { $in: ['paid_pending_taxes', 'all_paid'] } }),
  ])

  // Get category distribution
  const categoryDistribution = await Invoice.aggregate([
    { $match: { status: { $in: ['paid_pending_taxes', 'all_paid'] } } },
    { $group: { _id: '$category', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
  ])

  // Get recent activity
  const recentActivity = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('user', 'firstName lastName')
    .lean()

  // Get monthly revenue for chart (last 12 months)
  const monthlyRevenue = await Invoice.aggregate([
    {
      $match: {
        status: { $in: ['paid_pending_taxes', 'all_paid'] },
        paidDate: {
          $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1),
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$paidDate' },
          month: { $month: '$paidDate' },
        },
        total: { $sum: '$total' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ])

  const totalClients = await Client.countDocuments({ isActive: true })

  return {
    revenue: {
      allTime: totalRevenueAllTime[0]?.total || 0,
      year: totalRevenueYear[0]?.total || 0,
      quarter: totalRevenueQuarter[0]?.total || 0,
      month: totalRevenueMonth[0]?.total || 0,
    },
    projects: {
      active: activeProjects,
      completed: completedProjects,
    },
    invoices: {
      pending: pendingInvoices,
      paid: paidInvoices,
    },
    clients: totalClients,
    categoryDistribution: categoryDistribution.map((cat) => ({
      category: cat._id,
      count: cat.count,
      revenue: cat.revenue,
    })),
    recentActivity: recentActivity.map((activity) => ({
      id: activity._id.toString(),
      type: activity.type,
      description: activity.description,
      user: activity.user
        ? `${(activity.user as any).firstName} ${(activity.user as any).lastName}`
        : 'System',
      createdAt: activity.createdAt.toISOString(),
    })),
    monthlyRevenue: monthlyRevenue.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      total: item.total,
    })),
    currency: config?.currency || 'MAD',
    currencySymbol: config?.currencySymbol || 'DH',
    isConfigured: config?.isConfigured || false,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const stats = await getDashboardStats(session!.user.id)

  return <DashboardClient stats={stats} />
}
