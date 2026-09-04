/**
 * Utility functions for room measurements, areas, perimeters, and budget cost calculations.
 */

export const STANDARD_DOOR_AREA = 1.6; // ~ 0.80m x 2.00m
export const STANDARD_WINDOW_AREA = 1.5; // ~ 1.20m x 1.25m
export const STANDARD_DOOR_WIDTH = 0.85; // For skirting/guardapolvo deductions

/**
 * Calculates geometric properties of a space
 */
export function calculateSpaceMetrics(space) {
  const length = parseFloat(space.length) || 0;
  const width = parseFloat(space.width) || 0;
  const height = parseFloat(space.height) || 0;
  const doors = parseInt(space.doors, 10) || 0;
  const windows = parseInt(space.windows, 10) || 0;
  const customOpeningArea = parseFloat(space.customOpeningArea) || 0;

  // Floor Area (m²)
  const floorArea = Math.round(length * width * 100) / 100;

  // Perimeter (m)
  const perimeter = Math.round(2 * (length + width) * 100) / 100;

  // Perimeter net for skirtings (deducting door openings)
  const skirtingPerimeter = Math.max(0, Math.round((perimeter - (doors * STANDARD_DOOR_WIDTH)) * 100) / 100);

  // Gross Wall Area (m²)
  const grossWallArea = Math.round(perimeter * height * 100) / 100;

  // Openings Area (Doors + Windows + Custom)
  const calculatedOpenings = (doors * STANDARD_DOOR_AREA) + (windows * STANDARD_WINDOW_AREA) + customOpeningArea;
  const openingsArea = Math.round(calculatedOpenings * 100) / 100;

  // Net Wall Area (m²)
  const netWallArea = Math.max(0, Math.round((grossWallArea - openingsArea) * 100) / 100);

  // Ceiling Area (m²)
  const ceilingArea = floorArea;

  return {
    floorArea,
    perimeter,
    skirtingPerimeter,
    grossWallArea,
    openingsArea,
    netWallArea,
    ceilingArea
  };
}

/**
 * Computes quantity for a work item depending on its unit type and space metrics
 */
export function getItemQuantity(item, spaceMetrics) {
  if (item.unitType === 'manual' || item.unitType === 'fixed') {
    return parseFloat(item.quantity) || 1;
  }
  if (item.unitType === 'area_muros_neta') {
    return spaceMetrics.netWallArea;
  }
  if (item.unitType === 'area_muros_bruta') {
    return spaceMetrics.grossWallArea;
  }
  if (item.unitType === 'area_piso') {
    return spaceMetrics.floorArea;
  }
  if (item.unitType === 'area_cielo') {
    return spaceMetrics.ceilingArea;
  }
  if (item.unitType === 'perimetro_neto') {
    return spaceMetrics.skirtingPerimeter;
  }
  if (item.unitType === 'perimetro_bruto') {
    return spaceMetrics.perimeter;
  }
  return parseFloat(item.quantity) || 1;
}

/**
 * Calculates item subtotal
 */
export function calculateItemSubtotal(item, spaceMetrics) {
  const quantity = getItemQuantity(item, spaceMetrics);
  const unitPrice = parseFloat(item.unitPrice) || 0;
  return Math.round(quantity * unitPrice);
}

/**
 * Calculates space total cost
 */
export function calculateSpaceTotal(space) {
  const metrics = calculateSpaceMetrics(space);
  const items = space.items || [];
  
  const total = items.reduce((sum, item) => {
    return sum + calculateItemSubtotal(item, metrics);
  }, 0);

  return {
    metrics,
    total
  };
}

/**
 * Calculates comprehensive budget financials
 */
export function calculateBudgetFinancials(spaces = [], globalSettings = {}) {
  let directCost = 0;
  let totalFloorArea = 0;
  let totalNetWallArea = 0;
  let totalCeilingArea = 0;
  let totalItemsCount = 0;

  const spacesBreakdown = spaces.map(space => {
    const { metrics, total } = calculateSpaceTotal(space);
    directCost += total;

    const items = space.items || [];

    // Identify which surfaces have active work items budgeted in this space
    const hasFloorWork = items.some(it => 
      it.unitType === 'area_piso' || 
      (it.unitType === 'manual' && it.unit === 'm²' && it.name?.toLowerCase().includes('piso'))
    );

    const hasWallWork = items.some(it => 
      it.unitType === 'area_muros_neta' || 
      it.unitType === 'area_muros_bruta' ||
      (it.unitType === 'manual' && it.unit === 'm²' && it.name?.toLowerCase().includes('muro'))
    );

    const hasCeilingWork = items.some(it => 
      it.unitType === 'area_cielo' ||
      (it.unitType === 'manual' && it.unit === 'm²' && it.name?.toLowerCase().includes('cielo'))
    );

    // Only add to global totals if the space actually has items for that surface
    if (hasFloorWork) {
      totalFloorArea += metrics.floorArea;
    }
    if (hasWallWork) {
      totalNetWallArea += metrics.netWallArea;
    }
    if (hasCeilingWork) {
      totalCeilingArea += metrics.ceilingArea;
    }

    totalItemsCount += items.length;

    return {
      ...space,
      metrics,
      hasFloorWork,
      hasWallWork,
      hasCeilingWork,
      spaceTotal: total
    };
  });

  const overheadPercent = parseFloat(globalSettings.overheadPercent) || 0; // Gastos Generales / Utilidad %
  const overheadAmount = Math.round(directCost * (overheadPercent / 100));

  const discountPercent = parseFloat(globalSettings.discountPercent) || 0;
  const discountAmount = Math.round((directCost + overheadAmount) * (discountPercent / 100));

  const netSubtotal = Math.max(0, directCost + overheadAmount - discountAmount);

  const applyTax = Boolean(globalSettings.applyTax);
  const taxRate = parseFloat(globalSettings.taxRate) || 19; // Default IVA Chile 19%
  const taxAmount = applyTax ? Math.round(netSubtotal * (taxRate / 100)) : 0;

  const grandTotal = netSubtotal + taxAmount;

  return {
    directCost,
    overheadPercent,
    overheadAmount,
    discountPercent,
    discountAmount,
    netSubtotal,
    applyTax,
    taxRate,
    taxAmount,
    grandTotal,
    totalFloorArea: Math.round(totalFloorArea * 100) / 100,
    totalNetWallArea: Math.round(totalNetWallArea * 100) / 100,
    totalCeilingArea: Math.round(totalCeilingArea * 100) / 100,
    totalItemsCount,
    spacesBreakdown
  };
}

/**
 * Format currency with dots/commas
 */
export function formatCurrency(amount, currency = 'CLP') {
  const val = Math.round(amount || 0);
  return '$ ' + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Format standard number
 */
export function formatNumber(num, decimals = 2) {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return Number(num).toLocaleString('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
}

/**
 * Generates an executive WhatsApp text summary of the budget
 */
export function generateWhatsAppSummary(budgetData, contractorData) {
  const { client, spaces = [], financials, notes } = budgetData;
  const contractor = contractorData || {};

  let text = `📋 *RESUMEN DE PRESUPUESTO*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  if (contractor.name) text += `🏢 *${contractor.name}*\n`;
  if (contractor.phone) text += `📞 *Contacto:* ${contractor.phone}\n`;
  text += `📄 *Folio:* ${client.quoteNumber || 'PTO-001'}\n`;
  text += `📅 *Fecha:* ${client.date || new Date().toLocaleDateString('es-CL')}\n`;
  if (client.name) text += `👤 *Cliente:* ${client.name}\n`;
  if (client.address) text += `📍 *Ubicación:* ${client.address} ${client.city ? `(${client.city})` : ''}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  text += `🛠️ *ALCANCE DE TRABAJOS A REALIZAR:*\n`;
  spaces.forEach((space, idx) => {
    text += `\n🔹 *${idx + 1}. ${space.name.toUpperCase()}*\n`;
    const items = space.items || [];
    if (items.length === 0) {
      text += `  • Trabajos y reparaciones según coordinación en terreno.\n`;
    } else {
      items.forEach(item => {
        text += `  • ${item.name}\n`;
      });
    }
  });

  text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  const workDaysLabel = client.workDaysType === 'corridos' ? 'días corridos' : 'días hábiles';
  text += `⏱️ *Plazo Estimado:* ${client.estimatedWorkDays ? `${client.estimatedWorkDays} ${workDaysLabel}` : 'A convenir'}\n`;
  if (contractor.paymentTerms) {
    text += `💳 *Forma de Pago:* ${contractor.paymentTerms}\n`;
  }
  if (contractor.warranty) {
    text += `🛡️ *Garantía:* ${contractor.warranty}\n`;
  }
  if (notes) {
    text += `📝 *Observaciones:* ${notes}\n`;
  }

  const exclusions = budgetData.exclusions || [];
  if (exclusions.length > 0) {
    text += `\n🚫 *NO INCLUYE (EXCLUSIONES):*\n`;
    exclusions.forEach(ex => {
      text += `  • ${ex}\n`;
    });
  }

  text += `\n💰 *TOTAL PRESUPUESTO:* *${formatCurrency(financials?.grandTotal || 0)}*`;
  if (financials?.applyTax) {
    text += ` _(IVA Incluido)_\n`;
  } else {
    text += ` _(Valor Neto)_\n`;
  }
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Presupuesto válido por ${client.validityDays || 15} días._`;

  return text;
}

