const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  duplicateInvoice,
  getInvoicePDF,
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');
const { checkInvoiceLimit } = require('../middleware/checkLimits');

router.use(protect);

router.route('/')
  .get(getInvoices)
  .post(checkInvoiceLimit, createInvoice);

router.get('/:id/pdf', getInvoicePDF);

router.route('/:id')
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

router.post('/:id/duplicate', duplicateInvoice);

module.exports = router;
