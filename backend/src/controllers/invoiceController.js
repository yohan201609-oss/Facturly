const prisma = require('../config/db');
const { z } = require('zod');

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(0.01),
  unitPrice: z.number().min(0),
  discount: z.number().default(0),
  subtotal: z.number(),
});

const invoiceSchema = z.object({
  clientId: z.string().uuid(),
  invoiceNumber: z.string().min(1),
  issueDate: z.string(),
  dueDate: z.string(),
  currency: z.string().default('USD'),
  taxRate: z.number().default(0),
  discountAmount: z.number().default(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).default('DRAFT'),
  items: z.array(invoiceItemSchema).min(1),
});

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res, next) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.user.id },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { 
        client: true,
        items: { orderBy: { order: 'asc' } }
      },
    });

    if (!invoice) {
      res.status(404);
      throw new Error('Factura no encontrada');
    }

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res, next) => {
  try {
    const { items, ...invoiceData } = invoiceSchema.parse(req.body);

    // Calculate totals
    const itemsSubtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const taxAmount = itemsSubtotal * (invoiceData.taxRate / 100);
    const total = itemsSubtotal + taxAmount - invoiceData.discountAmount;

    // Transaction to create invoice and items
    const invoice = await prisma.$transaction(async (tx) => {
      const newInvoice = await tx.invoice.create({
        data: {
          ...invoiceData,
          userId: req.user.id,
          subtotal: itemsSubtotal,
          taxAmount,
          total,
          issueDate: new Date(invoiceData.issueDate),
          dueDate: new Date(invoiceData.dueDate),
          items: {
            create: items.map((item, index) => ({
              ...item,
              order: index,
            })),
          },
        },
        include: { items: true },
      });

      // Update user's invoice counter
      await tx.user.update({
        where: { id: req.user.id },
        data: { invoiceCounter: { increment: 1 } },
      });

      return newInvoice;
    });

    res.status(201).json(invoice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      next(error);
    }
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = async (req, res, next) => {
  try {
    const { items, ...invoiceData } = invoiceSchema.parse(req.body);

    const existingInvoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existingInvoice) {
      res.status(404);
      throw new Error('Factura no encontrada');
    }

    if (existingInvoice.status !== 'DRAFT') {
      res.status(400);
      throw new Error('Solo se pueden editar facturas en estado borrador');
    }

    const itemsSubtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const taxAmount = itemsSubtotal * (invoiceData.taxRate / 100);
    const total = itemsSubtotal + taxAmount - invoiceData.discountAmount;

    const updatedInvoice = await prisma.$transaction(async (tx) => {
      // Delete old items
      await tx.invoiceItem.deleteMany({ where: { invoiceId: req.params.id } });

      // Update invoice and create new items
      return await tx.invoice.update({
        where: { id: req.params.id },
        data: {
          ...invoiceData,
          subtotal: itemsSubtotal,
          taxAmount,
          total,
          issueDate: new Date(invoiceData.issueDate),
          dueDate: new Date(invoiceData.dueDate),
          items: {
            create: items.map((item, index) => ({
              ...item,
              order: index,
            })),
          },
        },
        include: { items: true },
      });
    });

    res.json(updatedInvoice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      next(error);
    }
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!invoice) {
      res.status(404);
      throw new Error('Factura no encontrada');
    }

    await prisma.invoice.delete({ where: { id: req.params.id } });

    res.json({ message: 'Factura eliminada' });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate invoice
// @route   POST /api/invoices/:id/duplicate
// @access  Private
const duplicateInvoice = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { items: true, user: true },
    });

    if (!invoice) {
      res.status(404);
      throw new Error('Factura no encontrada');
    }

    const nextNumber = `${invoice.user.invoicePrefix}-${String(invoice.user.invoiceCounter).padStart(3, '0')}`;

    const newInvoice = await prisma.$transaction(async (tx) => {
      const duplicated = await tx.invoice.create({
        data: {
          userId: req.user.id,
          clientId: invoice.clientId,
          invoiceNumber: nextNumber,
          status: 'DRAFT',
          issueDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
          currency: invoice.currency,
          subtotal: invoice.subtotal,
          taxRate: invoice.taxRate,
          taxAmount: invoice.taxAmount,
          discountAmount: invoice.discountAmount,
          total: invoice.total,
          notes: invoice.notes,
          terms: invoice.terms,
          items: {
            create: invoice.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              subtotal: item.subtotal,
              order: item.order,
            })),
          },
        },
      });

      await tx.user.update({
        where: { id: req.user.id },
        data: { invoiceCounter: { increment: 1 } },
      });

      return duplicated;
    });

    res.status(201).json(newInvoice);
  } catch (error) {
    next(error);
  }
};

const { generateInvoicePDF } = require('../services/pdfService');

// @desc    Generate PDF for invoice
// @route   GET /api/invoices/:id/pdf
// @access  Private
const getInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { 
        client: true,
        items: { orderBy: { order: 'asc' } }
      },
    });

    if (!invoice) {
      res.status(404);
      throw new Error('Factura no encontrada');
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=factura-${invoice.invoiceNumber}.pdf`);

    generateInvoicePDF(invoice, user, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  duplicateInvoice,
  getInvoicePDF,
};
