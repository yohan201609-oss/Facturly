const prisma = require('../config/db');

const checkInvoiceLimit = async (req, res, next) => {
  if (req.user.isPremium) return next();

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const invoiceCount = await prisma.invoice.count({
    where: {
      userId: req.user.id,
      createdAt: { gte: start, lte: end }
    }
  });

  if (invoiceCount >= 5) {
    return res.status(403).json({
      message: 'Has alcanzado el límite de 5 facturas por mes del plan gratuito.',
      limitReached: true
    });
  }

  next();
};

const checkClientLimit = async (req, res, next) => {
  if (req.user.isPremium) return next();

  const clientCount = await prisma.client.count({
    where: { userId: req.user.id }
  });

  if (clientCount >= 10) {
    return res.status(403).json({
      message: 'Has alcanzado el límite de 10 clientes del plan gratuito.',
      limitReached: true
    });
  }

  next();
};

module.exports = { checkInvoiceLimit, checkClientLimit };
