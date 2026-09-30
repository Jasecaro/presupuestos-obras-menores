import ExcelJS from 'exceljs';
import { calculateBudgetFinancials, MACRO_TASKS_DEFINITIONS } from './calculations.js';

/**
 * Extracts a clean numeric value from an Excel cell (handles number, formula result, formatted strings like "$ 150.000")
 */
function extractNumericValue(cellValue) {
  if (cellValue === null || cellValue === undefined) return 0;
  if (typeof cellValue === 'number') return cellValue;
  if (typeof cellValue === 'object') {
    // Formula cell: { formula: '...', result: 123 }
    if ('result' in cellValue) {
      return extractNumericValue(cellValue.result);
    }
  }
  if (typeof cellValue === 'string') {
    const cleaned = cellValue.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

/**
 * Extracts a clean string value from an Excel cell
 */
function extractStringValue(cellValue) {
  if (cellValue === null || cellValue === undefined) return '';
  if (typeof cellValue === 'string') return cellValue.trim();
  if (typeof cellValue === 'object') {
    if ('result' in cellValue) {
      return extractStringValue(cellValue.result);
    }
    if ('richText' in cellValue && Array.isArray(cellValue.richText)) {
      return cellValue.richText.map(t => t.text || '').join('').trim();
    }
  }
  return String(cellValue).trim();
}

/**
 * Proportionally scales item prices in each macro group so their sum equals the new target subtotal edited by the maestro.
 */
function scaleMacroItems(spaces, macroNewValues) {
  const clonedSpaces = JSON.parse(JSON.stringify(spaces || []));

  // Map items to macro groups using definitions
  const matchedItemIds = new Set();
  const macroGroups = MACRO_TASKS_DEFINITIONS.map(def => ({
    id: def.id,
    def,
    items: [],
    oldSubtotal: 0
  }));

  clonedSpaces.forEach(s => {
    (s.items || []).forEach(it => {
      const q = it.quantity || 1;
      const sub = it.unitPrice * q;
      for (const group of macroGroups) {
        if (!matchedItemIds.has(it.id) && group.def.filter(it)) {
          matchedItemIds.add(it.id);
          group.items.push({ itemRef: it, subtotal: sub, quantity: q });
          group.oldSubtotal += sub;
          break;
        }
      }
    });
  });

  // Catch any unclassified items into the last group
  clonedSpaces.forEach(s => {
    (s.items || []).forEach(it => {
      if (!matchedItemIds.has(it.id)) {
        const last = macroGroups[macroGroups.length - 1];
        const q = it.quantity || 1;
        const sub = it.unitPrice * q;
        last.items.push({ itemRef: it, subtotal: sub, quantity: q });
        last.oldSubtotal += sub;
      }
    });
  });

  // Scale each group
  macroGroups.forEach((group, idx) => {
    const targetSubtotal = macroNewValues[idx] !== undefined ? macroNewValues[idx] : group.oldSubtotal;
    if (group.oldSubtotal === 0 || group.items.length === 0) return;

    const ratio = targetSubtotal / group.oldSubtotal;

    let currentSum = 0;
    group.items.forEach(wrapper => {
      const newUnitPrice = Math.round(wrapper.itemRef.unitPrice * ratio);
      wrapper.itemRef.unitPrice = newUnitPrice;
      currentSum += newUnitPrice * wrapper.quantity;
    });

    // Remainder correction to guarantee exact peso equality (diff = 0)
    const diff = targetSubtotal - currentSum;
    if (diff !== 0 && group.items.length > 0) {
      let candidate = group.items.find(w => w.quantity === 1) || group.items[0];
      const unitAdjustment = Math.round(diff / candidate.quantity);
      candidate.itemRef.unitPrice += unitAdjustment;

      const rem = diff - (unitAdjustment * candidate.quantity);
      if (rem !== 0) {
        const unit1 = group.items.find(w => w.quantity === 1 && w !== candidate);
        if (unit1) {
          unit1.itemRef.unitPrice += rem;
        }
      }
    }
  });

  return clonedSpaces;
}

/**
 * Parses a Macro-Tasks / Especialidades Excel sheet edited by the maestro.
 */
function parseMacroBudgetExcel(macroSheet, fallbackBudget) {
  const macroRows = [];

  macroSheet.eachRow((row, rowNumber) => {
    if (rowNumber < 8) return; // Skip headers / KPI cards

    const colA = row.getCell(1).value;
    const colB = extractStringValue(row.getCell(2).value);
    const colE = row.getCell(5).value;
    const colF = row.getCell(6).value;
    const colG = row.getCell(7).value;

    // Check if this row is a Macro Task row (A is number 1-10, B has title)
    const num = typeof colA === 'number' ? colA : parseInt(String(colA).replace(/\D/g, ''), 10);
    if (!isNaN(num) && num >= 1 && num <= 10 && colB.length > 3) {
      // Editable value is in Col F, subtotal in Col G
      let val = extractNumericValue(colF);
      if (!val) {
        val = extractNumericValue(colG);
      }
      macroRows.push({
        num,
        title: colB,
        val: Math.round(val)
      });
    }
  });

  if (macroRows.length === 0) {
    throw new Error('No se encontraron tareas o especialidades válidas en la hoja de Macro-Tareas.');
  }

  // Extract new macro values in order (0 to 5)
  const macroNewValues = macroRows.map(r => r.val);

  const updatedSpaces = scaleMacroItems(fallbackBudget.spaces || [], macroNewValues);

  const financialSettings = fallbackBudget.financialSettings || {
    overheadPercent: 0,
    discountPercent: 0,
    applyTax: false,
    taxRate: 19
  };

  const financials = calculateBudgetFinancials(updatedSpaces, financialSettings);

  return {
    ...fallbackBudget,
    client: {
      ...(fallbackBudget.client || {}),
      includesMaterials: fallbackBudget.client?.includesMaterials !== false
    },
    spaces: updatedSpaces,
    financialSettings,
    financials,
    notes: fallbackBudget.notes || ''
  };
}

/**
 * Parses a Room-by-room Excel sheet.
 */
function parseRoomBudgetExcel(worksheet, fallbackBudget) {
  const existingSpaces = fallbackBudget.spaces || [];
  const parsedSpaces = [];

  let currentSpace = null;
  let spaceIndex = 0;

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    // Skip initial header / KPI dashboard rows (rows 1 to 7)
    if (rowNumber < 8) return;

    const cellA = extractStringValue(row.getCell(1).value);
    const cellB = extractStringValue(row.getCell(2).value);
    const cellC = extractStringValue(row.getCell(3).value);
    const cellD = extractStringValue(row.getCell(4).value);
    const cellE = row.getCell(5).value;
    const cellF = row.getCell(6).value;
    const cellG = row.getCell(7).value;

    // Check if this row is a Space Header: e.g. "1. RECINTO: GENERAL (Medidas: 3m × 3m × 2.4m)"
    if (cellA.includes('RECINTO:') || cellB.includes('RECINTO:') || /^(\d+[\.\)])\s*RECINTO/i.test(cellA)) {
      const headerText = cellA.includes('RECINTO:') ? cellA : cellB;
      
      let roomName = headerText;
      const recintoMatch = headerText.match(/RECINTO:\s*([^(\n\r]+)/i);
      if (recintoMatch && recintoMatch[1]) {
        roomName = recintoMatch[1].trim();
      }

      let length = 3;
      let width = 3;
      let height = 2.4;
      const dimsMatch = headerText.match(/Medidas:\s*([0-9.,]+)m?\s*[×x*]\s*([0-9.,]+)m?\s*[×x*]\s*([0-9.,]+)m?/i);
      if (dimsMatch) {
        length = parseFloat(dimsMatch[1].replace(',', '.')) || length;
        width = parseFloat(dimsMatch[2].replace(',', '.')) || width;
        height = parseFloat(dimsMatch[3].replace(',', '.')) || height;
      } else if (existingSpaces[spaceIndex]) {
        length = existingSpaces[spaceIndex].length || length;
        width = existingSpaces[spaceIndex].width || width;
        height = existingSpaces[spaceIndex].height || height;
      }

      const matchedExisting = existingSpaces.find(s => 
        s.name?.trim().toLowerCase() === roomName.toLowerCase() ||
        roomName.toLowerCase().includes(s.name?.trim().toLowerCase())
      ) || existingSpaces[spaceIndex];

      currentSpace = {
        id: matchedExisting?.id || `space_${Date.now()}_${spaceIndex}`,
        name: matchedExisting?.name || roomName,
        length,
        width,
        height,
        doors: matchedExisting?.doors ?? 1,
        windows: matchedExisting?.windows ?? 1,
        customOpeningArea: matchedExisting?.customOpeningArea ?? 0,
        items: []
      };

      parsedSpaces.push(currentSpace);
      spaceIndex++;
      return;
    }

    // Skip Subtotal rows
    if (
      cellA.toUpperCase().startsWith('SUBTOTAL') || 
      cellB.toUpperCase().startsWith('SUBTOTAL') ||
      cellA.toUpperCase().includes('TOTAL COSTO DIRECTO') ||
      cellB.toUpperCase().includes('TOTAL COSTO DIRECTO')
    ) {
      return;
    }

    // Skip table column headers row
    if (cellA === '#' || cellB === 'Partida / Trabajo' || cellB.toLowerCase().includes('partida')) {
      return;
    }

    // Check if this row is an item
    if (currentSpace && cellB.length > 0) {
      const quantity = Math.max(0, extractNumericValue(cellE));
      const unitPrice = Math.max(0, extractNumericValue(cellF));

      const existingItem = currentSpace.items && currentSpace.id
        ? (existingSpaces.find(s => s.id === currentSpace.id)?.items || []).find(it => 
            it.name?.trim().toLowerCase() === cellB.toLowerCase()
          )
        : null;

      const item = {
        id: existingItem?.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: cellB,
        description: cellC || existingItem?.description || '',
        unit: cellD || existingItem?.unit || 'gl',
        unitType: existingItem?.unitType || 'fixed',
        quantity: quantity > 0 ? quantity : (existingItem?.quantity || 1),
        unitPrice: Math.round(unitPrice),
        category: existingItem?.category || 'Pintura y Terminaciones'
      };

      currentSpace.items.push(item);
    }
  });

  if (parsedSpaces.length === 0) {
    throw new Error('No se pudieron reconocer recintos válidos en el archivo Excel.');
  }

  const financialSettings = fallbackBudget.financialSettings || {
    overheadPercent: 0,
    discountPercent: 0,
    applyTax: false,
    taxRate: 19
  };

  const financials = calculateBudgetFinancials(parsedSpaces, financialSettings);

  return {
    ...fallbackBudget,
    client: {
      ...(fallbackBudget.client || {}),
      includesMaterials: fallbackBudget.client?.includesMaterials !== false
    },
    spaces: parsedSpaces,
    financialSettings,
    financials,
    notes: fallbackBudget.notes || ''
  };
}

/**
 * Parses an Excel (.xlsx) file generated by the system and reconstructs the budget structure.
 * Automatically detects whether the file is in Macro-Tasks or Room-by-room format.
 * 
 * @param {File|Blob|ArrayBuffer} fileOrBuffer - The uploaded .xlsx file
 * @param {Object} fallbackBudget - Existing budget to preserve client info, settings & space IDs
 * @returns {Promise<Object>} Reconstructed budget object
 */
export async function parseBudgetExcel(fileOrBuffer, fallbackBudget = {}) {
  let arrayBuffer;
  if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else if (fileOrBuffer && typeof fileOrBuffer.arrayBuffer === 'function') {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else if (fileOrBuffer && fileOrBuffer.buffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer.buffer.slice(
      fileOrBuffer.byteOffset,
      fileOrBuffer.byteOffset + fileOrBuffer.byteLength
    );
  } else {
    arrayBuffer = fileOrBuffer;
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  // Check if Macro-Tasks format
  const macroSheet = workbook.getWorksheet('Macro-Tareas y Especialidades') ||
    workbook.worksheets.find(ws => {
      const name = (ws.name || '').toLowerCase();
      return name.includes('macro') || name.includes('especialidad');
    });

  if (macroSheet) {
    return parseMacroBudgetExcel(macroSheet, fallbackBudget);
  }

  // Check first sheet header if it mentions "ESPECIALIDADES"
  const firstSheet = workbook.worksheets[0];
  if (firstSheet) {
    const bannerVal = extractStringValue(firstSheet.getCell('A1').value).toUpperCase();
    if (bannerVal.includes('ESPECIALIDADES') || bannerVal.includes('TAREAS COMPLETAS')) {
      return parseMacroBudgetExcel(firstSheet, fallbackBudget);
    }
  }

  // Default to Room-by-room parser
  let roomSheet = workbook.getWorksheet('Presupuesto de Obras') || firstSheet;
  if (!roomSheet) {
    throw new Error('El archivo Excel no contiene hojas de cálculo legibles.');
  }

  return parseRoomBudgetExcel(roomSheet, fallbackBudget);
}
