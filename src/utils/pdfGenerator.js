import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatNumber, calculateSpaceMetrics, getItemQuantity, calculateItemSubtotal, groupItemsByMacroTasks } from './calculations';
import { triggerFileDownload } from './downloader';

// Common Colors Palette
const PRIMARY_COLOR = [37, 99, 235]; // #2563eb Royal Blue
const DARK_COLOR = [15, 23, 42]; // #0f172a Slate 900
const TEXT_MUTED = [100, 116, 139]; // #64748b Slate 500
const LIGHT_BG = [248, 250, 252]; // #f8fafc
const BORDER_COLOR = [226, 232, 240]; // #e2e8f0
const ACCENT_ROW = [241, 245, 249]; // #f1f5f9
const SUCCESS_COLOR = [16, 185, 129]; // #10b981

/**
 * Common Header Renderer for both Detailed and Minimal PDFs
 */
function renderHeader(doc, { client, contractor, title = 'PRESUPUESTO DE OBRAS', subtitle = 'PRESUPUESTO', margin, pageWidth }) {
  let currentY = margin;

  // Top banner bar
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Contractor / Company Info (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...DARK_COLOR);
  doc.text(contractor.name || 'PRESUPUESTO DE OBRAS', margin, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  let subY = currentY + 12;
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
  const boxWidth = 68;
  const boxHeight = 26;
  const boxX = pageWidth - margin - boxWidth;
  const boxY = currentY + 2;

  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(title, boxX + boxWidth / 2, boxY + 5.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...DARK_COLOR);
  doc.text(client.quoteNumber || 'PTO-001', boxX + boxWidth / 2, boxY + 11.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Fecha: ${client.date || new Date().toLocaleDateString('es-CL')}`, boxX + 6, boxY + 17.5);
  doc.text(`Validez: ${client.validityDays || 15} días`, boxX + 6, boxY + 21.5);

  currentY = Math.max(subY + 8, boxY + boxHeight + 6);

  // Separator line
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4.5;

  // Client and Project Details Card
  const clientBoxHeight = 21;
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
  doc.text(client.name || 'Cliente Particular', margin + 4, currentY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Tel: ${client.phone || '-'}  |  Email: ${client.email || '-'}`, margin + 4, currentY + 15.5);

  // Column 2: Location & Timing
  const col2X = margin + ((pageWidth - margin * 2) / 2) + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('UBICACIÓN Y PLAZO DE EJECUCIÓN', col2X, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...DARK_COLOR);
  doc.text(`Dirección: ${client.address || 'Según coordinación'} ${client.city ? `(${client.city})` : ''}`, col2X, currentY + 10.5);
  doc.setTextColor(...TEXT_MUTED);
  const workDaysLabel = client.workDaysType === 'corridos' ? 'días corridos' : 'días hábiles';
  doc.text(`Plazo estimado de obra: ${client.estimatedWorkDays ? `${client.estimatedWorkDays} ${workDaysLabel}` : 'A convenir'}`, col2X, currentY + 15.5);

  currentY += clientBoxHeight + 6;

  return currentY;
}

/**
 * Common Signatures Renderer
 */
function renderSignatures(doc, { contractor, client, currentY, margin, pageWidth, pageHeight }) {
  if (currentY > pageHeight - 32) {
    doc.addPage();
    currentY = margin + 15;
  }

  const sigWidth = 70;
  const sig1X = margin + 15;
  const sig2X = pageWidth - margin - sigWidth - 15;

  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.4);
  doc.line(sig1X, currentY + 10, sig1X + sigWidth, currentY + 10);
  doc.line(sig2X, currentY + 10, sig2X + sigWidth, currentY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK_COLOR);
  doc.text(contractor.contractorName || contractor.name || 'Emisor / Contratista', sig1X + sigWidth / 2, currentY + 14, { align: 'center' });
  doc.text(client.name || 'Firma / Aceptación Cliente', sig2X + sigWidth / 2, currentY + 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Firma Responsable', sig1X + sigWidth / 2, currentY + 18, { align: 'center' });
  doc.text('Conforme con presupuesto', sig2X + sigWidth / 2, currentY + 18, { align: 'center' });
}

/**
 * Common Footer Renderer for all pages
 */
function renderFooters(doc, pageWidth, pageHeight, label) {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(
      `${label}  •  Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }
}

/**
 * Renders the Material Modality Banner before the room breakdown
 */
function renderModalityBanner(doc, includesMaterials, margin, currentY, contentWidth) {
  const modalityHeight = 8;
  const isIncluded = includesMaterials !== false;

  if (isIncluded) {
    // Soft emerald/green container
    doc.setFillColor(240, 253, 244); // #f0fdf4
    doc.setDrawColor(74, 222, 128); // #4ade80
    doc.setLineWidth(0.35);
    doc.roundedRect(margin, currentY, contentWidth, modalityHeight, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(22, 101, 52); // #166534
    doc.text('MODALIDAD DEL PRESUPUESTO: TODO INCLUIDO (MANO DE OBRA Y MATERIALES INCLUIDOS)', margin + 4, currentY + 5.2);
  } else {
    // Soft amber/red container
    doc.setFillColor(254, 242, 242); // #fef2f2
    doc.setDrawColor(248, 113, 113); // #f87171
    doc.setLineWidth(0.35);
    doc.roundedRect(margin, currentY, contentWidth, modalityHeight, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(153, 27, 27); // #991b1b
    doc.text('MODALIDAD DEL PRESUPUESTO: SOLO MANO DE OBRA (NO INCLUYE MATERIALES - POR CUENTA DEL CLIENTE)', margin + 4, currentY + 5.2);
  }

  return currentY + modalityHeight + 3.5;
}

/**
 * Renders Observations directly below payment terms
 */
function renderObservationsBelowPayment(doc, notes, margin, startY, maxWidth) {
  if (!notes || !notes.trim()) return startY;

  let noteY = startY;
  const cleanNotes = notes.trim();
  const noteLines = cleanNotes.split('\n').map(l => l.trim()).filter(Boolean);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK_COLOR);

  if (noteLines.length <= 1) {
    const customNotes = doc.splitTextToSize(`• Observaciones: ${cleanNotes}`, maxWidth);
    doc.text(customNotes, margin, noteY);
    noteY += customNotes.length * 3.5 + 1;
  } else {
    const obsHeader = doc.splitTextToSize('• Observaciones:', maxWidth);
    doc.text(obsHeader, margin, noteY);
    noteY += 3.5;
    noteLines.forEach(nl => {
      const bulletPrefix = nl.startsWith('•') || nl.startsWith('-') ? '' : '- ';
      const splitLine = doc.splitTextToSize(`  ${bulletPrefix}${nl}`, maxWidth);
      doc.text(splitLine, margin, noteY);
      noteY += splitLine.length * 3.2 + 0.4;
    });
    noteY += 0.8;
  }

  return noteY;
}

/**
 * Generates the Detailed Budget PDF (Full breakdown with m² and unit prices)
 */
function generateDetailedPDF(doc, budgetData, contractorData, pageWidth, pageHeight, margin) {
  const { client, spaces = [], financials, notes } = budgetData;
  const contractor = contractorData || {};

  let currentY = renderHeader(doc, {
    client,
    contractor,
    title: 'PRESUPUESTO DETALLADO',
    margin,
    pageWidth
  });

  // Summary Metrics Bar
  const metricsBarHeight = 10;
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), metricsBarHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY_COLOR);

  const totalFloor = financials?.totalFloorArea || 0;
  const totalWall = financials?.totalNetWallArea || 0;
  const totalSpaces = spaces.length;

  doc.text('Resumen General del Proyecto:', margin + 4, currentY + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK_COLOR);

  let generalSummary = `${totalSpaces} Recinto(s) presupuestado(s)`;
  if (totalFloor > 0) generalSummary += `   |   Pisos a Ejecutar: ${formatNumber(totalFloor)} m²`;
  if (totalWall > 0) generalSummary += `   |   Muros Netos: ${formatNumber(totalWall)} m²`;

  doc.text(generalSummary, margin + 48, currentY + 6.5);

  currentY += metricsBarHeight + 3.5;

  // Render Modality Banner before room breakdown
  currentY = renderModalityBanner(doc, client.includesMaterials, margin, currentY, pageWidth - margin * 2);

  // Render Table for each room / space
  spaces.forEach((space, index) => {
    const metrics = calculateSpaceMetrics(space);
    const items = space.items || [];

    const hasFloorWork = items.some(it => 
      it.unitType === 'area_piso' || 
      (it.unitType === 'manual' && it.unit === 'm²' && it.name?.toLowerCase().includes('piso'))
    );
    const hasWallWork = items.some(it => 
      it.unitType === 'area_muros_neta' || 
      it.unitType === 'area_muros_bruta' ||
      (it.unitType === 'manual' && it.unit === 'm²' && it.name?.toLowerCase().includes('muro'))
    );

    let dimensionsDetail = `Medidas: ${formatNumber(space.length)}m × ${formatNumber(space.width)}m × ${formatNumber(space.height)}m alt`;
    if (hasFloorWork) dimensionsDetail += `  |  Piso: ${formatNumber(metrics.floorArea)} m²`;
    if (hasWallWork) dimensionsDetail += `  |  Muros: ${formatNumber(metrics.netWallArea)} m²`;

    // Header info for the space
    const spaceHeader = [
      [
        {
          content: `${index + 1}. ${space.name.toUpperCase()}`,
          styles: { fontStyle: 'bold', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 8.5 }
        },
        {
          content: dimensionsDetail,
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
        cellPadding: 2.2
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
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        cellPadding: 2
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: DARK_COLOR,
        cellPadding: 2,
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

    currentY = doc.lastAutoTable.finalY + 4;
  });

  const exclusions = budgetData.exclusions || [];
  const requiredBottomHeight = Math.max(75, 45 + (exclusions.length * 4) + (notes ? 12 : 0));

  // Check if we have enough space for totals, terms, exclusions and signature, else add page
  if (currentY > pageHeight - requiredBottomHeight) {
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

  let noteY = currentY + 7.5;
  const paymentText = contractor.paymentTerms || '50% anticipo al inicio, 30% avance y 20% contra recepción conforme.';
  const splitPayment = doc.splitTextToSize(`• Forma de Pago: ${paymentText}`, notesWidth);
  doc.text(splitPayment, margin, noteY);
  noteY += splitPayment.length * 3.5 + 1;

  // Observaciones directamente debajo de Forma de Pago
  noteY = renderObservationsBelowPayment(doc, notes, margin, noteY, notesWidth);

  const warrantyText = contractor.warranty || 'Garantía legal sobre mano de obra ejecutada.';
  const splitWarranty = doc.splitTextToSize(`• Garantía: ${warrantyText}`, notesWidth);
  doc.text(splitWarranty, margin, noteY);
  noteY += splitWarranty.length * 3.5 + 1;

  // Exclusions (Lo que NO incluye)
  if (exclusions.length > 0) {
    noteY += 1;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(220, 38, 38); // Soft red for exclusions
    doc.text('NO INCLUYE (EXCLUSIONES DE OBRA):', margin, noteY);
    noteY += 3.8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...DARK_COLOR);
    exclusions.forEach(ex => {
      const splitEx = doc.splitTextToSize(`• ${ex}`, notesWidth);
      doc.text(splitEx, margin, noteY);
      noteY += splitEx.length * 3.2 + 0.4;
    });
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
      cellPadding: 1.6,
      textColor: DARK_COLOR
    },
    columnStyles: {
      0: { cellWidth: 46, halign: 'left' },
      1: { cellWidth: 34, halign: 'right', fontStyle: 'bold' }
    }
  });

  currentY = Math.max(noteY + 6, doc.lastAutoTable.finalY + 8);

  renderSignatures(doc, { contractor, client, currentY, margin, pageWidth, pageHeight });
  renderFooters(doc, pageWidth, pageHeight, 'Presupuesto Detallado  •  Sistema de Obras Menores');
}

/**
 * Generates the Intermediate / Medium Budget PDF (Focuses on Item Titles and Subtotals only, without m² or unit prices)
 */
function generateMediumPDF(doc, budgetData, contractorData, pageWidth, pageHeight, margin) {
  const { client, spaces = [], financials, notes } = budgetData;
  const contractor = contractorData || {};

  let currentY = renderHeader(doc, {
    client,
    contractor,
    title: 'PRESUPUESTO DE OBRAS',
    margin,
    pageWidth
  });

  // Summary Metrics Bar
  const metricsBarHeight = 10;
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), metricsBarHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY_COLOR);

  const totalSpaces = spaces.length;

  doc.text('Resumen General del Proyecto:', margin + 4, currentY + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK_COLOR);

  const generalSummary = `${totalSpaces} Recinto(s) / Áreas presupuestadas con detalle de partidas y valores acordados`;
  doc.text(generalSummary, margin + 48, currentY + 6.5);

  currentY += metricsBarHeight + 3.5;

  // Render Modality Banner before room breakdown
  currentY = renderModalityBanner(doc, client.includesMaterials, margin, currentY, pageWidth - margin * 2);

  // Render Table for each room / space
  spaces.forEach((space, index) => {
    const metrics = calculateSpaceMetrics(space);
    const items = space.items || [];

    const spaceSubtotal = items.reduce((sum, item) => sum + calculateItemSubtotal(item, metrics), 0);

    // Header info for the space: Space name + Subtotal Recinto (NO measurements / surfaces)
    const spaceHeader = [
      [
        {
          content: `${index + 1}. ${space.name.toUpperCase()}`,
          styles: { fontStyle: 'bold', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 8.5 }
        },
        {
          content: `Subtotal Recinto: ${formatCurrency(spaceSubtotal)}`,
          styles: { halign: 'right', fontStyle: 'bold', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 8 }
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
        0: { cellWidth: 110 },
        1: { cellWidth: 'auto' }
      },
      styles: {
        cellPadding: 2.2
      }
    });

    currentY = doc.lastAutoTable.finalY;

    // Items table for this space: ONLY Item title and Subtotal (NO secondary description, NO qty, NO m², NO unitPrice)
    const tableBody = items.map((item, itemIdx) => {
      const subtotal = calculateItemSubtotal(item, metrics);

      return [
        `${itemIdx + 1}`,
        { content: item.name, styles: { fontStyle: 'normal' } },
        { content: formatCurrency(subtotal), styles: { halign: 'right', fontStyle: 'bold' } }
      ];
    });

    if (tableBody.length === 0) {
      tableBody.push([
        '-',
        'Sin partidas específicas agregadas para este recinto',
        { content: '$ 0', styles: { halign: 'right' } }
      ]);
    }

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['#', 'Descripción de Partida / Trabajo', 'Subtotal']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 2.2
      },
      bodyStyles: {
        fontSize: 8,
        textColor: DARK_COLOR,
        cellPadding: 2.5,
        lineColor: BORDER_COLOR
      },
      alternateRowStyles: {
        fillColor: ACCENT_ROW
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 38, halign: 'right' }
      },
      pageBreak: 'auto'
    });

    currentY = doc.lastAutoTable.finalY + 4;
  });

  const exclusions = budgetData.exclusions || [];
  const requiredBottomHeight = Math.max(75, 45 + (exclusions.length * 4) + (notes ? 12 : 0));

  // Check if we have enough space for totals, terms, exclusions and signature, else add page
  if (currentY > pageHeight - requiredBottomHeight) {
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

  let noteY = currentY + 7.5;
  const paymentText = contractor.paymentTerms || '50% anticipo al inicio, 30% avance y 20% contra recepción conforme.';
  const splitPayment = doc.splitTextToSize(`• Forma de Pago: ${paymentText}`, notesWidth);
  doc.text(splitPayment, margin, noteY);
  noteY += splitPayment.length * 3.5 + 1;

  // Observaciones directamente debajo de Forma de Pago
  noteY = renderObservationsBelowPayment(doc, notes, margin, noteY, notesWidth);

  const workDaysLabel = client.workDaysType === 'corridos' ? 'días corridos' : 'días hábiles';
  const workDaysText = client.estimatedWorkDays ? `${client.estimatedWorkDays} ${workDaysLabel}` : 'A convenir';
  const splitTime = doc.splitTextToSize(`• Plazo de Ejecución: ${workDaysText}`, notesWidth);
  doc.text(splitTime, margin, noteY);
  noteY += splitTime.length * 3.5 + 1;

  const warrantyText = contractor.warranty || 'Garantía legal sobre mano de obra ejecutada.';
  const splitWarranty = doc.splitTextToSize(`• Garantía: ${warrantyText}`, notesWidth);
  doc.text(splitWarranty, margin, noteY);
  noteY += splitWarranty.length * 3.5 + 1;

  // Exclusions (Lo que NO incluye)
  if (exclusions.length > 0) {
    noteY += 1;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(220, 38, 38);
    doc.text('NO INCLUYE (EXCLUSIONES DE OBRA):', margin, noteY);
    noteY += 3.8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...DARK_COLOR);
    exclusions.forEach(ex => {
      const splitEx = doc.splitTextToSize(`• ${ex}`, notesWidth);
      doc.text(splitEx, margin, noteY);
      noteY += splitEx.length * 3.2 + 0.4;
    });
  }

  // Totals Table on the right
  const totalsRows = [];
  if (financials?.overheadAmount > 0) {
    totalsRows.push(['Costo Directo Obras:', formatCurrency(financials?.directCost || 0)]);
    totalsRows.push([`Gastos Generales / Utilidad (${financials.overheadPercent}%):`, formatCurrency(financials.overheadAmount)]);
  }
  if (financials?.discountAmount > 0) {
    totalsRows.push([`Descuento Especial (${financials.discountPercent}%):`, `-${formatCurrency(financials.discountAmount)}`]);
  }
  totalsRows.push(['Subtotal Neto:', formatCurrency(financials?.netSubtotal || financials?.grandTotal || 0)]);

  if (financials?.applyTax) {
    totalsRows.push([`IVA (${financials.taxRate}%):`, formatCurrency(financials.taxAmount)]);
    totalsRows.push(['TOTAL PRESUPUESTO:', formatCurrency(financials?.grandTotal || 0)]);
  } else {
    totalsRows.push(['TOTAL PRESUPUESTO:', formatCurrency(financials?.grandTotal || 0)]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: totalsBoxX },
    body: totalsRows,
    theme: 'plain',
    tableWidth: totalsBoxWidth,
    styles: {
      cellPadding: 2,
      fontSize: 8,
      lineColor: BORDER_COLOR,
      lineWidth: { bottom: 0.3 },
      textColor: DARK_COLOR
    },
    columnStyles: {
      0: { cellWidth: 46, halign: 'left' },
      1: { cellWidth: 34, halign: 'right', fontStyle: 'bold' }
    }
  });

  currentY = Math.max(noteY + 6, doc.lastAutoTable.finalY + 8);

  renderSignatures(doc, { contractor, client, currentY, margin, pageWidth, pageHeight });
  renderFooters(doc, pageWidth, pageHeight, 'Presupuesto de Obras  •  Sistema de Obras Menores');
}

/**
 * Generates the Macro-Tasks / Trade-Based PDF (Focuses on high-level specialties across the entire property)
 */
function generateMacroTasksPDF(doc, budgetData, contractorData, pageWidth, pageHeight, margin) {
  const { client, spaces = [], financials, notes } = budgetData;
  const contractor = contractorData || {};

  let currentY = renderHeader(doc, {
    client,
    contractor,
    title: 'PRESUPUESTO POR ESPECIALIDADES',
    margin,
    pageWidth
  });

  // Summary Metrics Bar
  const metricsBarHeight = 10;
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), metricsBarHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY_COLOR);

  const { macroTasks, grandTotal } = groupItemsByMacroTasks(spaces, budgetData.macroDescriptions);

  doc.text('Resumen General del Proyecto:', margin + 4, currentY + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK_COLOR);

  const generalSummary = `${macroTasks.length} Macro-Especialidades Integradas para toda la propiedad`;
  doc.text(generalSummary, margin + 48, currentY + 6.5);

  currentY += metricsBarHeight + 3.5;

  // Render Modality Banner before task breakdown
  currentY = renderModalityBanner(doc, client.includesMaterials, margin, currentY, pageWidth - margin * 2);

  // Render each macro task
  macroTasks.forEach((macro, index) => {
    // Header info: Macro title + Subtotal
    const taskHeader = [
      [
        {
          content: `${index + 1}. ${macro.title.toUpperCase()}`,
          styles: { fontStyle: 'bold', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 8.5 }
        },
        {
          content: `Subtotal Especialidad: ${formatCurrency(macro.subtotal)}`,
          styles: { halign: 'right', fontStyle: 'bold', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 8 }
        }
      ]
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      body: taskHeader,
      theme: 'plain',
      tableWidth: 'auto',
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 'auto' }
      },
      styles: {
        cellPadding: 2.2
      }
    });

    currentY = doc.lastAutoTable.finalY;

    // Body table: Description and detailed bullet items included in this specialty
    const tableBody = [
      [
        '•',
        { 
          content: `Alcance General: ${macro.description}`, 
          styles: { fontStyle: 'italic', textColor: [71, 85, 105], fontSize: 7.5 } 
        },
        { content: '', styles: { halign: 'right' } }
      ]
    ];

    macro.items.forEach(it => {
      tableBody.push([
        ' ',
        { 
          content: `• ${it.spaceName}: ${it.name}`, 
          styles: { fontStyle: 'normal', textColor: DARK_COLOR, fontSize: 7.8 } 
        },
        { 
          content: formatCurrency(it.subtotal), 
          styles: { halign: 'right', fontStyle: 'bold', textColor: [51, 65, 85], fontSize: 7.8 } 
        }
      ]);
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['', 'Detalle de Partidas y Cobertura Incluida', 'Valor']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontSize: 7.8,
        fontStyle: 'bold',
        cellPadding: 2.0
      },
      bodyStyles: {
        fontSize: 7.8,
        textColor: DARK_COLOR,
        cellPadding: 2.0,
        lineColor: BORDER_COLOR
      },
      alternateRowStyles: {
        fillColor: ACCENT_ROW
      },
      columnStyles: {
        0: { cellWidth: 6, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 34, halign: 'right' }
      },
      pageBreak: 'auto'
    });

    currentY = doc.lastAutoTable.finalY + 4;
  });

  const exclusions = budgetData.exclusions || [];
  const requiredBottomHeight = Math.max(75, 45 + (exclusions.length * 4) + (notes ? 12 : 0));

  if (currentY > pageHeight - requiredBottomHeight) {
    doc.addPage();
    currentY = margin + 5;
  }

  // Financials & Totals Box (Right) + Terms (Left)
  const totalsBoxWidth = 80;
  const totalsBoxX = pageWidth - margin - totalsBoxWidth;
  const notesWidth = pageWidth - margin * 2 - totalsBoxWidth - 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('CONDICIONES COMERCIALES Y FORMA DE PAGO', margin, currentY + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK_COLOR);

  let noteY = currentY + 7.5;
  if (contractor.paymentTerms) {
    const splitPayment = doc.splitTextToSize(`• Forma de pago: ${contractor.paymentTerms}`, notesWidth);
    doc.text(splitPayment, margin, noteY);
    noteY += splitPayment.length * 3.8 + 1;
  }

  const workDaysLabel = client.workDaysType === 'corridos' ? 'días corridos' : 'días hábiles';
  const workDaysText = client.estimatedWorkDays ? `${client.estimatedWorkDays} ${workDaysLabel}` : 'A convenir según coordinación en terreno';
  doc.text(`• Plazo estimado: ${workDaysText}`, margin, noteY);
  noteY += 4.5;

  if (contractor.warranty) {
    doc.text(`• Garantía de obra: ${contractor.warranty}`, margin, noteY);
    noteY += 4.5;
  }

  if (exclusions.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('• No incluye (Exclusiones):', margin, noteY);
    noteY += 3.8;
    doc.setFont('helvetica', 'normal');
    exclusions.forEach(ex => {
      const splitEx = doc.splitTextToSize(`  - ${ex}`, notesWidth);
      doc.text(splitEx, margin, noteY);
      noteY += splitEx.length * 3.4 + 0.5;
    });
    noteY += 1;
  }

  noteY = renderObservationsBelowPayment(doc, notes, margin, noteY, notesWidth);

  // Totals Table on the right
  const totalsRows = [
    ['Costo Directo Obras:', formatCurrency(financials?.directCost || grandTotal || 0)]
  ];

  if (financials?.overheadAmount > 0) {
    totalsRows.push([`Gastos Generales / Utilidad (${financials.overheadPercent}%):`, formatCurrency(financials.overheadAmount)]);
  }

  if (financials?.discountAmount > 0) {
    totalsRows.push([`Descuento Especial (${financials.discountPercent}%):`, `-${formatCurrency(financials.discountAmount)}`]);
  }

  totalsRows.push(['Subtotal Neto:', formatCurrency(financials?.netSubtotal || grandTotal || 0)]);

  if (financials?.applyTax) {
    totalsRows.push([`IVA (${financials.taxRate}%):`, formatCurrency(financials.taxAmount)]);
  }

  totalsRows.push([
    { content: 'TOTAL PRESUPUESTO:', styles: { fontStyle: 'bold', fontSize: 9, textColor: PRIMARY_COLOR } },
    { content: formatCurrency(financials?.grandTotal || grandTotal || 0), styles: { fontStyle: 'bold', fontSize: 10, textColor: PRIMARY_COLOR, halign: 'right' } }
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: totalsBoxX, right: margin },
    body: totalsRows,
    theme: 'plain',
    tableWidth: totalsBoxWidth,
    styles: {
      cellPadding: 2,
      fontSize: 8,
      lineColor: BORDER_COLOR,
      lineWidth: { bottom: 0.3 },
      textColor: DARK_COLOR
    },
    columnStyles: {
      0: { cellWidth: 46, halign: 'left' },
      1: { cellWidth: 34, halign: 'right', fontStyle: 'bold' }
    }
  });

  currentY = Math.max(noteY + 6, doc.lastAutoTable.finalY + 8);

  renderSignatures(doc, { contractor, client, currentY, margin, pageWidth, pageHeight });
  renderFooters(doc, pageWidth, pageHeight, 'Presupuesto por Macro-Especialidades  •  Sistema de Obras Menores');
}

/**
 * Generates the Minimalist / Summary Budget PDF (Focuses only on Scope of Work and Total)
 */
function generateMinimalPDF(doc, budgetData, contractorData, pageWidth, pageHeight, margin) {
  const { client, spaces = [], financials, notes } = budgetData;
  const contractor = contractorData || {};

  let currentY = renderHeader(doc, {
    client,
    contractor,
    title: 'RESUMEN DE PRESUPUESTO',
    margin,
    pageWidth
  });

  // Section Header: Scope of Works
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('ALCANCE DE LOS TRABAJOS A REALIZAR', margin, currentY + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Resumen ejecutivo de actividades y partidas acordadas:', margin, currentY + 7.5);

  currentY += 10.5;

  // Render Modality Banner before room breakdown
  currentY = renderModalityBanner(doc, client.includesMaterials, margin, currentY, pageWidth - margin * 2);

  // Build the minimalist summary table
  // Each space is a prominent row, with clean bullet points of item titles only
  const tableBody = spaces.map((space, idx) => {
    const items = space.items || [];
    let itemsDescription = '';

    if (items.length === 0) {
      itemsDescription = '• Trabajos generales según coordinación en terreno.';
    } else {
      itemsDescription = items.map((item) => `• ${item.name}`).join('\n');
    }

    return [
      {
        content: `${idx + 1}. ${space.name.toUpperCase()}`,
        styles: { fontStyle: 'bold', fontSize: 8.5, textColor: PRIMARY_COLOR, valign: 'middle' }
      },
      {
        content: itemsDescription,
        styles: { fontStyle: 'normal', fontSize: 8.5, textColor: DARK_COLOR, cellPadding: 3.5, lineHeight: 1.3 }
      }
    ];
  });

  if (tableBody.length === 0) {
    tableBody.push([
      '1. TRABAJOS GENERALES',
      '• Obras y reparaciones menores según indicaciones del cliente.'
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Recinto / Área', 'Descripción de Trabajos y Especificaciones']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      cellPadding: 3
    },
    bodyStyles: {
      lineColor: BORDER_COLOR,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 48 },
      1: { cellWidth: 'auto' }
    },
    pageBreak: 'auto'
  });

  currentY = doc.lastAutoTable.finalY + 6;

  const exclusions = budgetData.exclusions || [];
  const requiredMinBottomHeight = Math.max(75, 45 + (exclusions.length * 4.2) + (notes ? 12 : 0));

  // Check if we have enough space for the summary total box, terms & exclusions
  if (currentY > pageHeight - requiredMinBottomHeight) {
    doc.addPage();
    currentY = margin + 8;
  }

  // Financials & Grand Total Card (Right) + Terms & Deadlines (Left)
  const totalsBoxWidth = 84;
  const totalsBoxX = pageWidth - margin - totalsBoxWidth;
  const termsWidth = pageWidth - margin * 2 - totalsBoxWidth - 8;

  // Left Column: Terms & Timing
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('PLAZOS Y CONDICIONES DE PAGO', margin, currentY + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...DARK_COLOR);

  let termY = currentY + 8;
  const paymentText = contractor.paymentTerms || '50% anticipo al inicio, 30% avance y 20% contra recepción conforme.';
  const splitPayment = doc.splitTextToSize(`• Forma de Pago: ${paymentText}`, termsWidth);
  doc.text(splitPayment, margin, termY);
  termY += splitPayment.length * 3.8 + 1.5;

  // Observaciones directamente debajo de Forma de Pago
  termY = renderObservationsBelowPayment(doc, notes, margin, termY, termsWidth);

  const workDaysLabel = client.workDaysType === 'corridos' ? 'días corridos' : 'días hábiles';
  const workDaysText = client.estimatedWorkDays ? `${client.estimatedWorkDays} ${workDaysLabel}` : 'A coordinar';
  const splitTime = doc.splitTextToSize(`• Plazo de Ejecución: ${workDaysText}`, termsWidth);
  doc.text(splitTime, margin, termY);
  termY += splitTime.length * 3.8 + 1.5;

  const warrantyText = contractor.warranty || 'Garantía legal sobre mano de obra ejecutada.';
  const splitWarranty = doc.splitTextToSize(`• Garantía: ${warrantyText}`, termsWidth);
  doc.text(splitWarranty, margin, termY);
  termY += splitWarranty.length * 3.8 + 1.5;

  // Exclusions in Minimalist PDF
  if (exclusions.length > 0) {
    termY += 1;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(220, 38, 38);
    doc.text('NO INCLUYE (EXCLUSIONES):', margin, termY);
    termY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...DARK_COLOR);
    exclusions.forEach(ex => {
      const splitEx = doc.splitTextToSize(`• ${ex}`, termsWidth);
      doc.text(splitEx, margin, termY);
      termY += splitEx.length * 3.4 + 0.5;
    });
  }

  // Right Column: Minimalist Highlighted Total Card
  const totalBoxHeight = financials?.applyTax ? 34 : 26;
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(0.6);
  doc.roundedRect(totalsBoxX, currentY, totalsBoxWidth, totalBoxHeight, 2.5, 2.5, 'FD');

  let totalInnerY = currentY + 5;

  if (financials?.applyTax) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Subtotal Neto:', totalsBoxX + 6, totalInnerY);
    doc.text(formatCurrency(financials?.netSubtotal || 0), totalsBoxX + totalsBoxWidth - 6, totalInnerY, { align: 'right' });
    totalInnerY += 4.5;

    doc.text(`IVA (${financials.taxRate || 19}%):`, totalsBoxX + 6, totalInnerY);
    doc.text(formatCurrency(financials?.taxAmount || 0), totalsBoxX + totalsBoxWidth - 6, totalInnerY, { align: 'right' });
    totalInnerY += 4.5;

    doc.setDrawColor(...BORDER_COLOR);
    doc.setLineWidth(0.3);
    doc.line(totalsBoxX + 6, totalInnerY, totalsBoxX + totalsBoxWidth - 6, totalInnerY);
    totalInnerY += 4.5;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('TOTAL PRESUPUESTO:', totalsBoxX + 6, totalInnerY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...DARK_COLOR);
  doc.text(formatCurrency(financials?.grandTotal || 0), totalsBoxX + totalsBoxWidth - 6, totalInnerY + 0.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(financials?.applyTax ? '(IVA Incluido)' : '(Valor Neto)', totalsBoxX + 6, totalInnerY + 4.5);

  currentY = Math.max(termY + 8, currentY + totalBoxHeight + 10);

  renderSignatures(doc, { contractor, client, currentY, margin, pageWidth, pageHeight });
  renderFooters(doc, pageWidth, pageHeight, 'Resumen Ejecutivo de Presupuesto  •  Sistema de Obras Menores');
}

/**
 * Generates and downloads or returns a Blob URL of the budget PDF (supports detailed and minimal modes)
 */
export function generateBudgetPDF(budgetData, contractorData, options = { mode: 'detailed', returnBlobUrl: false, download: true }) {
  const { client } = budgetData;
  const mode = options.mode || 'detailed';

  // Create A4 PDF in portrait mode
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  if (mode === 'minimal') {
    generateMinimalPDF(doc, budgetData, contractorData, pageWidth, pageHeight, margin);
  } else if (mode === 'detailed') {
    generateDetailedPDF(doc, budgetData, contractorData, pageWidth, pageHeight, margin);
  } else if (mode === 'macro') {
    generateMacroTasksPDF(doc, budgetData, contractorData, pageWidth, pageHeight, margin);
  } else {
    // Default or 'medium'
    generateMediumPDF(doc, budgetData, contractorData, pageWidth, pageHeight, margin);
  }

  if (options.download) {
    const prefix = mode === 'minimal' 
      ? 'Resumen_Presupuesto' 
      : mode === 'detailed' 
      ? 'Presupuesto_Detallado' 
      : mode === 'macro'
      ? 'Presupuesto_Especialidades_Globales'
      : 'Presupuesto_Subtotales';
    const cleanClient = (client.name || 'Cliente')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanQuote = (client.quoteNumber || 'Obra').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${prefix}_${cleanQuote}_${cleanClient}.pdf`;
    
    // Obtain raw Blob and trigger reliable download with clean filename
    const pdfBlob = doc.output('blob');
    triggerFileDownload(pdfBlob, fileName, 'application/pdf');
  }

  if (options.returnBlobUrl) {
    return doc.output('bloburl');
  }

  return doc;
}
