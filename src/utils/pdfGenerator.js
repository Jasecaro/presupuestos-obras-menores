import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatNumber, calculateSpaceMetrics, getItemQuantity, calculateItemSubtotal } from './calculations';

/**
 * Generates and downloads or returns a Blob URL of the professional budget PDF
 */
export function generateBudgetPDF(budgetData, contractorData, options = { returnBlobUrl: false, download: true }) {
  const { client, spaces = [], financialSettings = {}, financials, notes } = budgetData;
  const contractor = contractorData || {};

  // Create A4 PDF in portrait mode
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = margin;

  // Colors Palette
  const PRIMARY_COLOR = [37, 99, 235]; // #2563eb Royal Blue
  const DARK_COLOR = [15, 23, 42]; // #0f172a Slate 900
  const TEXT_MUTED = [100, 116, 139]; // #64748b Slate 500
  const LIGHT_BG = [248, 250, 252]; // #f8fafc
  const BORDER_COLOR = [226, 232, 240]; // #e2e8f0
  const ACCENT_ROW = [241, 245, 249]; // #f1f5f9

  // Helper for text formatting
  const addHeader = () => {
    // Top banner bar
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(0, 0, pageWidth, 6, 'F');

    // Contractor / Company Info (Left)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...DARK_COLOR);
    doc.text(contractor.name || 'PRESUPUESTO DE OBRAS', margin, currentY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_MUTED);
    let subY = currentY + 13;
    if (contractor.contractorName) {
      doc.text(`Responsable: ${contractor.contractorName}  |  RUT: ${contractor.rut || 'N/A'}`, margin, subY);
      subY += 4;
    }
    doc.text(`Contacto: ${contractor.phone || ''}  |  ${contractor.email || ''}`, margin, subY);
    if (contractor.address) {
      subY += 4;
      doc.text(`${contractor.address}`, margin, subY);
    }

    // Budget Folio Card (Right)
    const boxWidth = 65;
    const boxHeight = 26;
    const boxX = pageWidth - margin - boxWidth;
    const boxY = currentY + 3;

    doc.setFillColor(...LIGHT_BG);
    doc.setDrawColor(...BORDER_COLOR);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('PRESUPUESTO DE OBRAS', boxX + boxWidth / 2, boxY + 6, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...DARK_COLOR);
    doc.text(client.quoteNumber || 'PTO-001', boxX + boxWidth / 2, boxY + 12, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`Fecha: ${client.date || new Date().toLocaleDateString('es-CL')}`, boxX + 6, boxY + 18);
    doc.text(`Validez: ${client.validityDays || 15} días`, boxX + 6, boxY + 22);

    currentY = Math.max(subY + 8, boxY + boxHeight + 6);

    // Separator line
    doc.setDrawColor(...BORDER_COLOR);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;

    // Client and Project Details Card
    const clientBoxHeight = 22;
    doc.setFillColor(...LIGHT_BG);
    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), clientBoxHeight, 2, 2, 'F');
    doc.setDrawColor(...BORDER_COLOR);
    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), clientBoxHeight, 2, 2, 'D');

    // Column 1: Client Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('DATOS DEL CLIENTE', margin + 4, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...DARK_COLOR);
    doc.text(client.name || 'Cliente Particular', margin + 4, currentY + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`Tel: ${client.phone || '-'}  |  Email: ${client.email || '-'}`, margin + 4, currentY + 16);

    // Column 2: Location & Timing
    const col2X = margin + ((pageWidth - margin * 2) / 2) + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('UBICACIÓN Y PLAZOS', col2X, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...DARK_COLOR);
    doc.text(`Dirección Obra: ${client.address || 'Según coordinación'} ${client.city ? `(${client.city})` : ''}`, col2X, currentY + 11);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`Plazo estimado ejecución: ${client.estimatedWorkDays || 'A convenir'} días hábiles`, col2X, currentY + 16);

    currentY += clientBoxHeight + 7;
  };

  addHeader();

  // Summary Metrics Bar
  const metricsBarHeight = 11;
  doc.setFillColor(238, 242, 255); // soft indigo tint
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), metricsBarHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY_COLOR);

  const totalFloor = financials?.totalFloorArea || 0;
  const totalWall = financials?.totalNetWallArea || 0;
  const totalSpaces = spaces.length;

  doc.text(`Resumen General del Proyecto:`, margin + 4, currentY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK_COLOR);
  doc.text(`${totalSpaces} Espacio(s) presupuestado(s)   |   Área Piso Total: ${formatNumber(totalFloor)} m²   |   Área Muros Neta: ${formatNumber(totalWall)} m²`, margin + 48, currentY + 7);

  currentY += metricsBarHeight + 6;

  // Render Table for each room / space
  spaces.forEach((space, index) => {
    const metrics = calculateSpaceMetrics(space);
    const items = space.items || [];

    // Header info for the space
    const spaceHeader = [
      [
        {
          content: `${index + 1}. ${space.name.toUpperCase()}`,
          styles: { fontStyle: 'bold', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9 }
        },
        {
          content: `Medidas: ${formatNumber(space.length)}m × ${formatNumber(space.width)}m × ${formatNumber(space.height)}m alt  |  Piso: ${formatNumber(metrics.floorArea)} m²  |  Muros Netos: ${formatNumber(metrics.netWallArea)} m²`,
          styles: { halign: 'right', fillColor: PRIMARY_COLOR, textColor: [240, 249, 255], fontSize: 7.5 }
        }
      ]
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      body: spaceHeader,
      theme: 'plain',
      tableWidth: 'auto',
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 'auto' }
      },
      styles: {
        cellPadding: 2.5
      }
    });

    currentY = doc.lastAutoTable.finalY;

    // Items table for this space
    const tableBody = items.map((item, itemIdx) => {
      const qty = getItemQuantity(item, metrics);
      const subtotal = calculateItemSubtotal(item, metrics);
      const desc = item.description ? `\n${item.description}` : '';

      return [
        `${itemIdx + 1}`,
        { content: `${item.name}${desc}`, styles: { fontStyle: 'normal' } },
        `${formatNumber(qty)} ${item.unit || 'm²'}`,
        formatCurrency(item.unitPrice),
        { content: formatCurrency(subtotal), styles: { halign: 'right', fontStyle: 'bold' } }
      ];
    });

    if (tableBody.length === 0) {
      tableBody.push([
        '-',
        'Sin partidas específicas agregadas para este recinto',
        '-',
        '-',
        { content: '$ 0', styles: { halign: 'right' } }
      ]);
    }

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['#', 'Descripción de Partida / Trabajo', 'Cant. / Sup.', 'Precio Unit.', 'Subtotal']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [51, 65, 85], // Slate 700
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        cellPadding: 2
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: DARK_COLOR,
        cellPadding: 2.2,
        lineColor: BORDER_COLOR
      },
      alternateRowStyles: {
        fillColor: ACCENT_ROW
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 26, halign: 'center' },
        3: { cellWidth: 26, halign: 'right' },
        4: { cellWidth: 28, halign: 'right' }
      },
      pageBreak: 'auto'
    });

    currentY = doc.lastAutoTable.finalY + 5;
  });

  // Check if we have enough space for totals, terms, and signature, else add page
  if (currentY > pageHeight - 75) {
    doc.addPage();
    currentY = margin + 5;
  }

  // Financials & Totals Box (Right) + Terms (Left)
  const totalsBoxWidth = 80;
  const totalsBoxX = pageWidth - margin - totalsBoxWidth;
  const notesWidth = pageWidth - margin * 2 - totalsBoxWidth - 8;

  // Notes & Terms on the left
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('CONDICIONES COMERCIALES Y FORMA DE PAGO', margin, currentY + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK_COLOR);

  let noteY = currentY + 8;
  const paymentText = contractor.paymentTerms || '50% anticipo al inicio, 30% avance y 20% contra recepción conforme.';
  const splitPayment = doc.splitTextToSize(`• Forma de Pago: ${paymentText}`, notesWidth);
  doc.text(splitPayment, margin, noteY);
  noteY += splitPayment.length * 3.5 + 1.5;

  const warrantyText = contractor.warranty || 'Garantía legal sobre mano de obra ejecutada.';
  const splitWarranty = doc.splitTextToSize(`• Garantía: ${warrantyText}`, notesWidth);
  doc.text(splitWarranty, margin, noteY);
  noteY += splitWarranty.length * 3.5 + 1.5;

  if (notes) {
    const customNotes = doc.splitTextToSize(`• Observaciones: ${notes}`, notesWidth);
    doc.text(customNotes, margin, noteY);
    noteY += customNotes.length * 3.5;
  }

  // Totals Table on the right
  const totalsRows = [
    ['Costo Directo Obras:', formatCurrency(financials?.directCost || 0)]
  ];

  if (financials?.overheadAmount > 0) {
    totalsRows.push([`Gastos Generales / Utilidad (${financials.overheadPercent}%):`, formatCurrency(financials.overheadAmount)]);
  }

  if (financials?.discountAmount > 0) {
    totalsRows.push([`Descuento Especial (${financials.discountPercent}%):`, `-${formatCurrency(financials.discountAmount)}`]);
  }

  totalsRows.push(['Subtotal Neto:', formatCurrency(financials?.netSubtotal || 0)]);

  if (financials?.applyTax) {
    totalsRows.push([`IVA (${financials.taxRate}%):`, formatCurrency(financials.taxAmount)]);
  }

  totalsRows.push([
    { content: 'TOTAL PRESUPUESTO:', styles: { fontStyle: 'bold', fontSize: 9, textColor: PRIMARY_COLOR } },
    { content: formatCurrency(financials?.grandTotal || 0), styles: { fontStyle: 'bold', fontSize: 10, textColor: PRIMARY_COLOR, halign: 'right' } }
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: totalsBoxX, right: margin },
    body: totalsRows,
    theme: 'plain',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      textColor: DARK_COLOR
    },
    columnStyles: {
      0: { cellWidth: 46, halign: 'left' },
      1: { cellWidth: 34, halign: 'right', fontStyle: 'bold' }
    }
  });

  currentY = Math.max(noteY + 8, doc.lastAutoTable.finalY + 12);

  // Signatures Section
  if (currentY > pageHeight - 32) {
    doc.addPage();
    currentY = margin + 15;
  }

  const sigWidth = 70;
  const sig1X = margin + 15;
  const sig2X = pageWidth - margin - sigWidth - 15;

  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.4);
  doc.line(sig1X, currentY + 12, sig1X + sigWidth, currentY + 12);
  doc.line(sig2X, currentY + 12, sig2X + sigWidth, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK_COLOR);
  doc.text(contractor.contractorName || contractor.name || 'Emisor / Contratista', sig1X + sigWidth / 2, currentY + 16, { align: 'center' });
  doc.text(client.name || 'Firma / Aceptación Cliente', sig2X + sigWidth / 2, currentY + 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Firma Responsable', sig1X + sigWidth / 2, currentY + 20, { align: 'center' });
  doc.text('Conforme con especificaciones', sig2X + sigWidth / 2, currentY + 20, { align: 'center' });

  // Add Page Numbers Footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(
      `Presupuesto generado con Sistema de Obras Menores  •  Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  if (options.download) {
    const fileName = `Presupuesto_${client.quoteNumber || 'Obra'}_${(client.name || 'Cliente').replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  }

  if (options.returnBlobUrl) {
    return doc.output('bloburl');
  }

  return doc;
}
