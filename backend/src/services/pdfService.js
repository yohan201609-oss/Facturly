const PDFDocument = require('pdfkit');

const generateInvoicePDF = (invoice, user, res) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc.pipe(res);

  // Header
  doc.fillColor('#444444')
     .fontSize(20)
     .text('FACTURA', 50, 50, { align: 'right' });

  doc.fontSize(10)
     .text(`Factura #: ${invoice.invoiceNumber}`, 50, 80, { align: 'right' })
     .text(`Fecha: ${new Date(invoice.issueDate).toLocaleDateString()}`, 50, 95, { align: 'right' })
     .text(`Vencimiento: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 110, { align: 'right' });

  // Freelancer Info
  doc.fillColor('#000000')
     .fontSize(12)
     .text(user.companyName || user.email, 50, 50)
     .fontSize(10)
     .text(user.address || '', 50, 65)
     .text(`${user.city || ''}, ${user.state || ''} ${user.zipCode || ''}`, 50, 80)
     .text(user.taxId ? `RFC/ID: ${user.taxId}` : '', 50, 95)
     .moveDown();

  // Client Info
  doc.text('FACTURAR A:', 50, 160, { underline: true })
     .fontSize(11)
     .text(invoice.client.name, 50, 175)
     .fontSize(10)
     .text(invoice.client.address || '', 50, 190)
     .text(`${invoice.client.city || ''}, ${invoice.client.state || ''}`, 50, 205)
     .text(invoice.client.email || '', 50, 220);

  // Table Header
  const tableTop = 270;
  doc.font('Helvetica-Bold');
  generateTableRow(doc, tableTop, 'Descripción', 'Cant.', 'Precio', 'Subtotal');
  generateHr(doc, tableTop + 20);
  doc.font('Helvetica');

  // Table Items
  let position = tableTop + 30;
  invoice.items.forEach((item) => {
    generateTableRow(doc, position, item.description, item.quantity.toString(), formatCurrency(item.unitPrice, invoice.currency), formatCurrency(item.subtotal, invoice.currency));
    position += 20;
  });

  generateHr(doc, position);

  // Totals
  const subtotalPosition = position + 30;
  generateTableRow(doc, subtotalPosition, '', '', 'Subtotal', formatCurrency(invoice.subtotal, invoice.currency));
  
  const taxPosition = subtotalPosition + 20;
  generateTableRow(doc, taxPosition, '', '', `Impuestos (${invoice.taxRate}%)`, formatCurrency(invoice.taxAmount, invoice.currency));

  const discountPosition = taxPosition + 20;
  generateTableRow(doc, discountPosition, '', '', 'Descuento', `-${formatCurrency(invoice.discountAmount, invoice.currency)}`);

  doc.font('Helvetica-Bold');
  const totalPosition = discountPosition + 25;
  generateTableRow(doc, totalPosition, '', '', 'TOTAL', formatCurrency(invoice.total, invoice.currency));
  doc.font('Helvetica');

  // Notes & Terms
  if (invoice.notes || invoice.terms) {
    const notesTop = totalPosition + 50;
    if (invoice.notes) {
      doc.fontSize(10).text('Notas:', 50, notesTop, { underline: true });
      doc.fontSize(9).text(invoice.notes, 50, notesTop + 15);
    }
    
    if (invoice.terms) {
      const termsTop = notesTop + (invoice.notes ? 40 : 0);
      doc.fontSize(10).text('Términos y Condiciones:', 50, termsTop, { underline: true });
      doc.fontSize(9).text(invoice.terms, 50, termsTop + 15);
    }
  }

  // Watermark for DRAFT
  if (invoice.status === 'DRAFT') {
    doc.save()
       .opacity(0.1)
       .fontSize(100)
       .fillColor('#FF0000')
       .text('BORRADOR', 50, 350, { align: 'center', rotation: 45 });
    doc.restore();
  }

  doc.end();
};

function generateTableRow(doc, y, item, quantity, price, total) {
  doc.fontSize(10)
     .text(item, 50, y, { width: 280 })
     .text(quantity, 330, y, { width: 40, align: 'right' })
     .text(price, 380, y, { width: 80, align: 'right' })
     .text(total, 470, y, { width: 70, align: 'right' });
}

function generateHr(doc, y) {
  doc.strokeColor('#aaaaaa')
     .lineWidth(1)
     .moveTo(50, y)
     .lineTo(550, y)
     .stroke();
}

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

module.exports = { generateInvoicePDF };
