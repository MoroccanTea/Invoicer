const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const auth = require('../middlewares/auth');

router.get('/dashboard', auth, async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);

    // Combine project stats into one aggregation
    const projectStats = await Project.aggregate([
      {
        $match: { owner: req.user._id }
      },
      {
        $facet: {
          categoryStats: [
            {
              $group: {
                _id: '$category',
                value: { $sum: 1 }
              }
            },
            {
              $project: {
                _id: 0,
                name: '$_id',
                value: 1
              }
            }
          ],
          statusCounts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          recentProjects: [
            { $sort: { updatedAt: -1 } },
            { $limit: 5 },
            { 
              $project: {
                date: '$updatedAt',
                description: '$title',
                status: 1
              }
            }
          ]
        }
      }
    ]);

    // Combine invoice stats into one aggregation
    const invoiceStats = await Invoice.aggregate([
      {
        $match: { owner: req.user._id }
      },
      {
        $facet: {
          totalRevenue: [
            {
              $match: { status: 'paid' }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$total' }
              }
            }
          ],
          statusCounts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          revenueByMonth: [
            {
              $match: {
                status: 'paid',
                createdAt: { $gte: twelveMonthsAgo }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                revenue: { $sum: '$total' }
              }
            },
            {
              $sort: { '_id.year': 1, '_id.month': 1 }
            },
            {
              $project: {
                _id: 0,
                month: {
                  $concat: [
                    { $toString: '$_id.year' },
                    '-',
                    { $toString: '$_id.month' }
                  ]
                },
                revenue: 1
              }
            }
          ],
          recentInvoices: [
            { $sort: { updatedAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                date: '$updatedAt',
                description: { $concat: ['Invoice ', '$invoiceNumber'] },
                status: 1
              }
            }
          ]
        }
      }
    ]);

    const statusCountMap = projectStats[0].statusCounts.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    // Combine recent activities and sort
    const recentActivity = [...projectStats[0].recentProjects, ...invoiceStats[0].recentInvoices]
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);

    res.json({
      totalRevenue: invoiceStats[0].totalRevenue[0]?.total || 0,
      activeProjects: statusCountMap['in-progress'] || 0,
      pendingInvoices: invoiceStats[0].statusCounts
        .filter(s => ['draft', 'sent', 'overdue'].includes(s._id))
        .reduce((sum, s) => sum + s.count, 0),
      completedProjects: statusCountMap['completed'] || 0,
      revenueByMonth: invoiceStats[0].revenueByMonth,
      projectsByCategory: projectStats[0].categoryStats,
      recentActivity
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    
    res.status(500).json({ error: 'Error fetching dashboard statistics' });
  }
});

module.exports = router;