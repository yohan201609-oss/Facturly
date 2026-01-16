const PDFDocument = require('pdfkit');

const generateInvoicePDF = (invoice, user, res) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc.pipe(res);

  // Watermark for DRAFT (Background layer)
  if (invoice.status === 'DRAFT') {
    doc.save()
       .opacity(0.05)
       .fontSize(120)
       .fillColor('#FF0000')
       .text('BORRADOR', 50, 400, { align: 'center', rotation: 45 });
    doc.restore();
  }

  // Header Background bar
  doc.rect(0, 0, 612, 120).fillColor('#f8fafc').fill();

  // Branding / Sender Logo or Name
  doc.fillColor('#3b82f6')
     .fontSize(22)
     .font('Helvetica-Bold')
     .text(user.companyName || 'MI NEGOCIO', 50, 40);

  // Invoice Title
  doc.fillColor('#1e293b')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text('FACTURA', 50, 40, { align: 'right' });

  // Invoice Meta info
  doc.fillColor('#64748b')
     .fontSize(9)
     .font('Helvetica')
     .text(`Factura #: ${invoice.invoiceNumber || 'N/A'}`, 50, 70, { align: 'right' })
     .text(`Fecha: ${new Date(invoice.issueDate).toLocaleDateString('es-ES')}`, 50, 83, { align: 'right' })
     .text(`Vencimiento: ${new Date(invoice.dueDate).toLocaleDateString('es-ES')}`, 50, 96, { align: 'right' });

  // Freelancer Info (Sender)
  doc.fillColor('#1e293b')
     .fontSize(9)
     .font('Helvetica-Bold')
     .text('DE:', 50, 80)
     .font('Helvetica')
     .fillColor('#475569')
     .text(user.email, 50, 92)
     .text(user.address || '', 50, 103)
     .text(`${user.city || ''} ${user.state || ''}`, 50, 114);

  // Client Info
  doc.fillColor('#1e293b')
     .font('Helvetica-Bold')
     .fontSize(10)
     .text('FACTURAR A:', 50, 160)
     .font('Helvetica')
     .fontSize(11)
     .text(invoice.client.name, 50, 175)
     .fontSize(9)
     .fillColor('#475569')
     .text(invoice.client.address || '', 50, 188)
     .text(`${invoice.client.city || ''}, ${invoice.client.state || ''}`, 50, 200)
     .text(invoice.client.email || '', 50, 212);

  // Table Styling
  const tableTop = 260;
  doc.rect(50, tableTop, 500, 25).fillColor('#3b82f6').fill();
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
  generateTableRow(doc, tableTop + 8, 'Descripción', 'Cant.', 'Precio', 'Subtotal');
  
  // Table Items
  doc.fillColor('#334155').font('Helvetica');
  let position = tableTop + 35;
  
  invoice.items.forEach((item, i) => {
    // Zebra striping for readability
    if (i % 2 === 1) {
      doc.rect(50, position - 5, 500, 20).fillColor('#f1f5f9').fill();
    }
    doc.fillColor('#334155');
    generateTableRow(doc, position, item.description, item.quantity.toString(), formatCurrency(item.unitPrice, invoice.currency), formatCurrency(item.subtotal, invoice.currency));
    position += 20;
  });

  generateHr(doc, position + 5);

  // Totals Area
  const totalsTop = position + 30;
  doc.fillColor('#1e293b');
  
  doc.fontSize(10).font('Helvetica').text('Subtotal:', 350, totalsTop);
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), 450, totalsTop, { align: 'right', width: 100 });

  doc.text(`Impuestos (${invoice.taxRate}%):`, 350, totalsTop + 20);
  doc.text(formatCurrency(invoice.taxAmount, invoice.currency), 450, totalsTop + 20, { align: 'right', width: 100 });

  if (invoice.discountAmount > 0) {
    doc.text('Descuento:', 350, totalsTop + 40);
    doc.text(`-${formatCurrency(invoice.discountAmount, invoice.currency)}`, 450, totalsTop + 40, { align: 'right', width: 100 });
  }

  // Final Total Box
  const totalBoxY = totalsTop + (invoice.discountAmount > 0 ? 65 : 45);
  doc.rect(340, totalBoxY - 10, 220, 35).fillColor('#f8fafc').fill();
  doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(14);
  doc.text('TOTAL:', 350, totalBoxY);
  doc.fillColor('#3b82f6').text(formatCurrency(invoice.total, invoice.currency), 450, totalBoxY, { align: 'right', width: 100 });

  // Notes & Terms Footer
  if (invoice.notes || invoice.terms) {
    const footerTop = 680;
    if (invoice.notes) {
      doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(9).text('Notas:', 50, footerTop);
      doc.fillColor('#64748b').font('Helvetica').fontSize(8).text(invoice.notes, 50, footerTop + 12, { width: 220 });
    }
    
    if (invoice.terms) {
      doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(9).text('Términos:', 320, footerTop);
      doc.fillColor('#64748b').font('Helvetica').fontSize(8).text(invoice.terms, 320, footerTop + 12, { width: 230 });
    }
  }

  // Bottom Page Note
  doc.fillColor('#94a3b8')
     .fontSize(7)
     .text('Factura generada profesionalmente por Facturly.', 50, 780, { align: 'center' });

  doc.end();
};

function generateTableRow(doc, y, item, quantity, price, total) {
  doc.text(item, 60, y, { width: 270 })
     .text(quantity, 330, y, { width: 40, align: 'right' })
     .text(price, 380, y, { width: 80, align: 'right' })
     .text(total, 470, y, { width: 70, align: 'right' });
}

function generateHr(doc, y) {
  doc.strokeColor('#e2e8f0')
     .lineWidth(1)
     .moveTo(50, y)
     .lineTo(550, y)
     .stroke();
}

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount);
}

module.exports = { generateInvoicePDF };
