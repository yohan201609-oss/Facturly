const prisma = require('../config/db');
const { startOfMonth, endOfMonth, subMonths, format } = require('date-fns');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Total invoiced this month
    const monthlyInvoices = await prisma.invoice.aggregate({
      where: {
        userId,
        issueDate: { gte: monthStart, lte: monthEnd },
        status: { not: 'CANCELLED' }
      },
      _sum: { total: true },
      _count: { id: true }
    });

    // Total pending collection
    const pendingInvoices = await prisma.invoice.aggregate({
      where: {
        userId,
        status: { in: ['SENT', 'OVERDUE'] }
      },
      _sum: { total: true }
    });

    // Recent invoices
    const recentInvoices = await prisma.invoice.findMany({
      where: { userId },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Count of clients
    const clientCount = await prisma.client.count({ where: { userId } });

    res.json({
      totalMonth: monthlyInvoices._sum.total || 0,
      countMonth: monthlyInvoices._count.id || 0,
      totalPending: pendingInvoices._sum.total || 0,
      clientCount,
      recentInvoices
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chart data (income last 6 months)
// @route   GET /api/dashboard/chart
// @access  Private
const getChartData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const chartData = [];

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const monthIncome = await prisma.invoice.aggregate({
        where: {
          userId,
          issueDate: { gte: start, lte: end },
          status: 'PAID'
        },
        _sum: { total: true }
      });

      chartData.push({
        name: format(date, 'MMM'),
        total: monthIncome._sum.total || 0
      });
    }

    res.json(chartData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getChartData
};
