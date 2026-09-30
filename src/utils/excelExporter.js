import ExcelJS from 'exceljs';
import { groupItemsByMacroTasks, calculateSpaceMetrics, getItemQuantity, calculateItemSubtotal } from './calculations.js';
import { triggerFileDownload } from './downloader.js';

const COLOR_PRIMARY = '1E3A8A'; // Deep Navy Blue
const COLOR_HEADER_FILL = '2563EB'; // Royal Blue
const COLOR_ACCENT_BG = 'F1F5F9'; // Slate 100
const COLOR_EDITABLE_CELL = 'FEF9C3'; // Soft Yellow for editable maestro inputs

/**
 * Dynamically generates and downloads an Excel spreadsheet grouped by Macro-Tasks / Especialidades.
 * Features live Excel formulas, interactive KPI dashboard, and editable unit price cells for the maestro.
 * 
 * @param {Object} budgetData - The full budget object (client, spaces, financials, etc.)
 * @param {Object} contractorData - Optional contractor profile
 */
export async function exportMacroTasksExcel(budgetData, contractorData = {}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = contractorData.name || 'Sistema de Presupuestos Obras Menores';
  workbook.created = new Date();

  const spaces = budgetData.spaces || [];
  const { macroTasks, grandTotal } = groupItemsByMacroTasks(spaces);
  const targetBudget = budgetData.financials?.grandTotal || grandTotal || 9180000;

  // Sheet 1: Macro-Tareas y Especialidades
  const ws = workbook.addWorksheet('Macro-Tareas y Especialidades', {
    views: [{ showGridLines: true }]
  });

  ws.columns = [
    { key: 'colA', width: 6 },   // #
    { key: 'colB', width: 38 },  // Especialidad / Macro-Tarea
    { key: 'colC', width: 50 },  // Cobertura y Detalle
    { key: 'colD', width: 10 },  // Unidad
    { key: 'colE', width: 12 },  // Cantidad
    { key: 'colF', width: 22 },  // Valor Especialidad ($) (EDITABLE)
    { key: 'colG', width: 22 },  // Subtotal ($) (FORMULA)
    { key: 'colH', width: 14 }   // % Incidencia
  ];

  // Title Banner
  ws.mergeCells('A1:H1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'PRESUPUESTO POR ESPECIALIDADES / TAREAS COMPLETAS - CONTROL MAESTRO';
  titleCell.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(1).height = 28;

  // Project Info Card
  ws.mergeCells('A2:D2');
  ws.getCell('A2').value = `Cliente: ${budgetData.client?.name || 'Cliente Particular'}`;
  ws.getCell('A2').font = { bold: true, size: 10 };

  ws.mergeCells('A3:D3');
  ws.getCell('A3').value = `Dirección: ${budgetData.client?.address || 'Sin dirección'} - ${budgetData.client?.city || 'Santiago'}`;
  ws.getCell('A3').font = { size: 9, color: { argb: '475569' } };

  ws.mergeCells('A4:D4');
  ws.getCell('A4').value = `Cotización: ${budgetData.client?.quoteNumber || 'PTO-2026-001'}  |  Modalidad: Todo Incluido (M.O. + Materiales)`;
  ws.getCell('A4').font = { size: 9, color: { argb: '475569' } };

  // Control KPI Panel (E2:H5)
  ws.getCell('E2').value = 'Meta Presupuesto:';
  ws.getCell('E2').font = { bold: true, size: 9 };
  ws.getCell('E2').alignment = { horizontal: 'right' };
  ws.mergeCells('F2:H2');
  ws.getCell('F2').value = targetBudget;
  ws.getCell('F2').numFmt = '$#,##0';
  ws.getCell('F2').font = { bold: true, size: 11, color: { argb: COLOR_PRIMARY } };
  ws.getCell('F2').alignment = { horizontal: 'right' };

  ws.getCell('E3').value = 'Total Actual:';
  ws.getCell('E3').font = { bold: true, size: 9 };
  ws.getCell('E3').alignment = { horizontal: 'right' };
  ws.mergeCells('F3:H3');
  ws.getCell('F3').font = { bold: true, size: 11 };
  ws.getCell('F3').numFmt = '$#,##0';
  ws.getCell('F3').alignment = { horizontal: 'right' };

  ws.getCell('E4').value = 'Diferencia p/ Meta:';
  ws.getCell('E4').font = { bold: true, size: 9 };
  ws.getCell('E4').alignment = { horizontal: 'right' };
  ws.mergeCells('F4:H4');
  ws.getCell('F4').font = { bold: true, size: 11 };
  ws.getCell('F4').numFmt = '$#,##0;($#,##0);"-"';
  ws.getCell('F4').alignment = { horizontal: 'right' };

  ws.mergeCells('E5:H5');
  ws.getCell('E5').font = { bold: true, size: 9.5 };
  ws.getCell('E5').alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(5).height = 20;

  // Instructions Bar
  ws.mergeCells('A6:H6');
  const tipCell = ws.getCell('A6');
  tipCell.value = '💡 INSTRUCCIÓN PARA EL MAESTRO: Puedes editar los valores de cada especialidad en las celdas amarillas (Columna F). El panel superior te avisará de inmediato si estás cuadrado en la meta.';
  tipCell.font = { italic: true, size: 8.5, color: { argb: '1E293B' } };
  tipCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF08A' } };
  tipCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(6).height = 22;

  // Headers
  const headerRowIdx = 8;
  const headerRow = ws.getRow(headerRowIdx);
  headerRow.height = 24;
  const headers = ['#', 'Especialidad / Tarea Completa', 'Detalle de Cobertura y Alcance Integral', 'Unidad', 'Cantidad', 'Valor Especialidad ($)', 'Subtotal ($)', '% Incidencia'];
  headers.forEach((h, idx) => {
    const colLetter = String.fromCharCode(65 + idx);
    const cell = ws.getCell(`${colLetter}${headerRowIdx}`);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_FILL } };
    cell.alignment = { vertical: 'middle', horizontal: idx >= 4 ? 'right' : (idx === 0 || idx === 3 ? 'center' : 'left') };
    cell.border = { top: { style: 'thin' }, bottom: { style: 'medium' } };
  });

  let currentRow = 9;
  const startTasksRow = currentRow;

  macroTasks.forEach((macro, mIdx) => {
    const r = ws.getRow(currentRow);
    r.height = 24;

    ws.getCell(`A${currentRow}`).value = mIdx + 1;
    ws.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getCell(`A${currentRow}`).font = { bold: true };

    ws.getCell(`B${currentRow}`).value = macro.title;
    ws.getCell(`B${currentRow}`).font = { bold: true, size: 10, color: { argb: '0F172A' } };
    ws.getCell(`B${currentRow}`).alignment = { vertical: 'middle' };

    ws.getCell(`C${currentRow}`).value = macro.description;
    ws.getCell(`C${currentRow}`).font = { size: 8.5, color: { argb: '475569' } };
    ws.getCell(`C${currentRow}`).alignment = { vertical: 'middle' };

    ws.getCell(`D${currentRow}`).value = 'gl';
    ws.getCell(`D${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

    ws.getCell(`E${currentRow}`).value = 1;
    ws.getCell(`E${currentRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
    ws.getCell(`E${currentRow}`).numFmt = '#,##0';

    // Editable cell in soft yellow
    const valCell = ws.getCell(`F${currentRow}`);
    valCell.value = macro.subtotal;
    valCell.font = { bold: true, size: 10 };
    valCell.alignment = { horizontal: 'right', vertical: 'middle' };
    valCell.numFmt = '$#,##0';
    valCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_EDITABLE_CELL } };
    valCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

    // Subtotal formula = E * F
    const subCell = ws.getCell(`G${currentRow}`);
    subCell.value = { formula: `E${currentRow}*F${currentRow}`, result: macro.subtotal };
    subCell.font = { bold: true, size: 10, color: { argb: COLOR_PRIMARY } };
    subCell.alignment = { horizontal: 'right', vertical: 'middle' };
    subCell.numFmt = '$#,##0';

    // % Incidencia (formula linking to grand total row)
    const pctCell = ws.getCell(`H${currentRow}`);
    pctCell.alignment = { horizontal: 'right', vertical: 'middle' };
    pctCell.numFmt = '0.0%';

    currentRow++;
  });

  const endTasksRow = currentRow - 1;
  const grandTotalRow = currentRow;

  // Grand Total Row
  ws.mergeCells(`A${grandTotalRow}:F${grandTotalRow}`);
  const gtLabel = ws.getCell(`A${grandTotalRow}`);
  gtLabel.value = 'TOTAL GENERAL PRESUPUESTO OBRAS (TODO INCLUIDO):';
  gtLabel.font = { size: 11, bold: true, color: { argb: 'FFFFFF' } };
  gtLabel.alignment = { horizontal: 'right', vertical: 'middle' };
  gtLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };

  const gtVal = ws.getCell(`G${grandTotalRow}`);
  gtVal.value = { formula: `SUM(G${startTasksRow}:G${endTasksRow})`, result: grandTotal };
  gtVal.font = { size: 12, bold: true, color: { argb: 'FFFFFF' } };
  gtVal.alignment = { horizontal: 'right', vertical: 'middle' };
  gtVal.numFmt = '$#,##0';
  gtVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };

  const gtPct = ws.getCell(`H${grandTotalRow}`);
  gtPct.value = { formula: `SUM(H${startTasksRow}:H${endTasksRow})`, result: 1 };
  gtPct.font = { size: 10, bold: true, color: { argb: 'FFFFFF' } };
  gtPct.alignment = { horizontal: 'right', vertical: 'middle' };
  gtPct.numFmt = '0.0%';
  gtPct.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
  ws.getRow(grandTotalRow).height = 26;

  // Set % formulas for rows
  for (let r = startTasksRow; r <= endTasksRow; r++) {
    ws.getCell(`H${r}`).value = { formula: `G${r}/G${grandTotalRow}` };
  }

  // Set top KPI Panel formulas
  ws.getCell('F3').value = { formula: `G${grandTotalRow}`, result: grandTotal };
  ws.getCell('F4').value = { formula: `F3-F2`, result: grandTotal - targetBudget };
  ws.getCell('E5').value = {
    formula: `IF(F4=0,"✅ ¡PRESUPUESTO CUADRADO EXACTO EN " & TEXT(F2,"$#,##0") & "!",IF(F4>0,"⚠️ SOBRAN " & TEXT(F4,"$#,##0") & " (DEBES BAJAR VALORES)","⚠️ FALTAN " & TEXT(-F4,"$#,##0") & " (DEBES SUBIR VALORES)"))`,
    result: grandTotal === targetBudget ? `✅ ¡PRESUPUESTO CUADRADO EXACTO EN $${targetBudget.toLocaleString('es-CL')}!` : '⚠️ AJUSTAR VALORES'
  };

  // Detailed Sheet 2: "Detalle de Partidas por Especialidad"
  const wsDetail = workbook.addWorksheet('Detalle de Partidas', {
    views: [{ showGridLines: true }]
  });

  wsDetail.columns = [
    { key: 'dA', width: 8 },
    { key: 'dB', width: 28 },
    { key: 'dC', width: 22 },
    { key: 'dD', width: 44 },
    { key: 'dE', width: 10 },
    { key: 'dF', width: 18 }
  ];

  wsDetail.mergeCells('A1:F1');
  const dTitle = wsDetail.getCell('A1');
  dTitle.value = 'DETALLE COMPLETO DE PARTIDAS AGRUPADAS POR ESPECIALIDAD';
  dTitle.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFF' } };
  dTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
  dTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  wsDetail.getRow(1).height = 25;

  let dRow = 3;
  macroTasks.forEach((m, mIdx) => {
    wsDetail.mergeCells(`A${dRow}:F${dRow}`);
    const catHead = wsDetail.getCell(`A${dRow}`);
    catHead.value = `${mIdx + 1}. ESPECIALIDAD: ${m.title.toUpperCase()} (Subtotal: $${m.subtotal.toLocaleString('es-CL')})`;
    catHead.font = { bold: true, color: { argb: 'FFFFFF' }, size: 9.5 };
    catHead.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_FILL } };
    wsDetail.getRow(dRow).height = 22;
    dRow++;

    // Sub-headers
    ['#', 'Recinto', 'Categoría', 'Nombre de Partida', 'Unidad', 'Valor Parcial ($)'].forEach((h, i) => {
      const colLetter = String.fromCharCode(65 + i);
      const c = wsDetail.getCell(`${colLetter}${dRow}`);
      c.value = h;
      c.font = { bold: true, size: 8.5 };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_ACCENT_BG } };
      c.alignment = { horizontal: i === 0 || i === 4 ? 'center' : (i === 5 ? 'right' : 'left') };
    });
    dRow++;

    m.items.forEach((it, iIdx) => {
      wsDetail.getCell(`A${dRow}`).value = `${mIdx + 1}.${iIdx + 1}`;
      wsDetail.getCell(`A${dRow}`).alignment = { horizontal: 'center' };
      wsDetail.getCell(`B${dRow}`).value = it.spaceName;
      wsDetail.getCell(`C${dRow}`).value = it.category || 'General';
      wsDetail.getCell(`D${dRow}`).value = it.name;
      wsDetail.getCell(`E${dRow}`).value = it.unit || 'gl';
      wsDetail.getCell(`E${dRow}`).alignment = { horizontal: 'center' };
      wsDetail.getCell(`F${dRow}`).value = it.subtotal || (it.unitPrice * (it.quantity || 1));
      wsDetail.getCell(`F${dRow}`).numFmt = '$#,##0';
      wsDetail.getCell(`F${dRow}`).alignment = { horizontal: 'right' };
      dRow++;
    });

    dRow++; // Empty space
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const cleanClient = (budgetData.client?.name || 'Cliente')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  const fileName = `Presupuesto_Especialidades_${cleanClient}_${targetBudget}.xlsx`;

  triggerFileDownload(
    blob, 
    fileName, 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  return fileName;
}

/**
 * Dynamically generates and downloads a standard Room-by-room Excel spreadsheet.
 * 
 * @param {Object} budgetData 
 * @param {Object} contractorData 
 */
export async function exportRoomBudgetExcel(budgetData, contractorData = {}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = contractorData.name || 'Sistema de Presupuestos Obras Menores';
  workbook.created = new Date();

  const spaces = budgetData.spaces || [];
  const targetBudget = budgetData.financials?.grandTotal || 9180000;

  const ws = workbook.addWorksheet('Presupuesto de Obras', {
    views: [{ showGridLines: true }]
  });

  ws.columns = [
    { key: 'colA', width: 6 },   // #
    { key: 'colB', width: 38 },  // Partida / Trabajo
    { key: 'colC', width: 44 },  // Descripción Técnica
    { key: 'colD', width: 10 },  // Unidad
    { key: 'colE', width: 12 },  // Cantidad
    { key: 'colF', width: 18 },  // P. Unitario ($) (EDITABLE)
    { key: 'colG', width: 20 }   // Subtotal ($) (FORMULA)
  ];

  // Header Banner
  ws.mergeCells('A1:G1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'PRESUPUESTO DE OBRAS MENORES Y REMODELACIÓN - PLANILLA DE CONTROL';
  titleCell.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(1).height = 28;

  // Project Info Card
  ws.mergeCells('A2:D2');
  ws.getCell('A2').value = `Cliente: ${budgetData.client?.name || 'Cliente Particular'}`;
  ws.getCell('A2').font = { bold: true, size: 10 };

  ws.mergeCells('A3:D3');
  ws.getCell('A3').value = `Dirección: ${budgetData.client?.address || 'Sin dirección'} - ${budgetData.client?.city || 'Santiago'}`;
  ws.getCell('A3').font = { size: 9, color: { argb: '475569' } };

  ws.mergeCells('A4:D4');
  ws.getCell('A4').value = `Cotización: ${budgetData.client?.quoteNumber || 'PTO-2026-001'}  |  Modalidad: Todo Incluido`;
  ws.getCell('A4').font = { size: 9, color: { argb: '475569' } };

  // KPI Panel
  ws.getCell('E2').value = 'Meta Presupuesto:';
  ws.getCell('E2').font = { bold: true, size: 9 };
  ws.getCell('E2').alignment = { horizontal: 'right' };
  ws.mergeCells('F2:G2');
  ws.getCell('F2').value = targetBudget;
  ws.getCell('F2').numFmt = '$#,##0';
  ws.getCell('F2').font = { bold: true, size: 11, color: { argb: COLOR_PRIMARY } };
  ws.getCell('F2').alignment = { horizontal: 'right' };

  ws.getCell('E3').value = 'Total Actual:';
  ws.getCell('E3').font = { bold: true, size: 9 };
  ws.getCell('E3').alignment = { horizontal: 'right' };
  ws.mergeCells('F3:G3');
  ws.getCell('F3').font = { bold: true, size: 11 };
  ws.getCell('F3').numFmt = '$#,##0';
  ws.getCell('F3').alignment = { horizontal: 'right' };

  ws.getCell('E4').value = 'Diferencia p/ Meta:';
  ws.getCell('E4').font = { bold: true, size: 9 };
  ws.getCell('E4').alignment = { horizontal: 'right' };
  ws.mergeCells('F4:G4');
  ws.getCell('F4').font = { bold: true, size: 11 };
  ws.getCell('F4').numFmt = '$#,##0;($#,##0);"-"';
  ws.getCell('F4').alignment = { horizontal: 'right' };

  ws.mergeCells('E5:G5');
  ws.getCell('E5').font = { bold: true, size: 9.5 };
  ws.getCell('E5').alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(5).height = 20;

  // Instructions Bar
  ws.mergeCells('A6:G6');
  const tipCell = ws.getCell('A6');
  tipCell.value = '💡 INSTRUCCIÓN: Puedes editar los Precios Unitarios en las celdas amarillas (Columna F). El panel superior se actualiza automáticamente.';
  tipCell.font = { italic: true, size: 8.5, color: { argb: '1E293B' } };
  tipCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF08A' } };
  tipCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(6).height = 22;

  // Table Headers
  const headerRowIdx = 8;
  const headerRow = ws.getRow(headerRowIdx);
  headerRow.height = 24;
  ['#', 'Partida / Trabajo', 'Descripción Técnica', 'Unidad', 'Cantidad', 'P. Unitario ($)', 'Subtotal ($)'].forEach((h, idx) => {
    const colLetter = String.fromCharCode(65 + idx);
    const cell = ws.getCell(`${colLetter}${headerRowIdx}`);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_FILL } };
    cell.alignment = { vertical: 'middle', horizontal: idx >= 4 ? 'right' : (idx === 0 || idx === 3 ? 'center' : 'left') };
    cell.border = { top: { style: 'thin' }, bottom: { style: 'medium' } };
  });

  let currentRow = 9;
  const spaceSubtotalRows = [];

  spaces.forEach((space, sIdx) => {
    const metrics = calculateSpaceMetrics(space);

    // Space Header
    ws.mergeCells(`A${currentRow}:G${currentRow}`);
    const spCell = ws.getCell(`A${currentRow}`);
    spCell.value = `${sIdx + 1}. RECINTO: ${space.name.toUpperCase()} (Medidas: ${space.length || 3}m × ${space.width || 3}m × ${space.height || 2.4}m)`;
    spCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: '0F172A' } };
    spCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };
    spCell.alignment = { vertical: 'middle' };
    ws.getRow(currentRow).height = 22;
    currentRow++;

    const startItemRow = currentRow;
    (space.items || []).forEach((item, iIdx) => {
      const q = getItemQuantity(item, metrics);
      const sub = calculateItemSubtotal(item, metrics);

      ws.getCell(`A${currentRow}`).value = `${sIdx + 1}.${iIdx + 1}`;
      ws.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

      ws.getCell(`B${currentRow}`).value = item.name;
      ws.getCell(`B${currentRow}`).font = { bold: true, size: 9.5 };
      ws.getCell(`B${currentRow}`).alignment = { vertical: 'middle' };

      ws.getCell(`C${currentRow}`).value = item.description || '';
      ws.getCell(`C${currentRow}`).font = { size: 8.5, color: { argb: '475569' } };
      ws.getCell(`C${currentRow}`).alignment = { vertical: 'middle' };

      ws.getCell(`D${currentRow}`).value = item.unit || 'gl';
      ws.getCell(`D${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

      ws.getCell(`E${currentRow}`).value = q;
      ws.getCell(`E${currentRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
      ws.getCell(`E${currentRow}`).numFmt = '#,##0.00';

      const priceCell = ws.getCell(`F${currentRow}`);
      priceCell.value = item.unitPrice;
      priceCell.font = { bold: true, size: 9.5 };
      priceCell.alignment = { horizontal: 'right', vertical: 'middle' };
      priceCell.numFmt = '$#,##0';
      priceCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_EDITABLE_CELL } };
      priceCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

      const subCell = ws.getCell(`G${currentRow}`);
      subCell.value = { formula: `E${currentRow}*F${currentRow}`, result: sub };
      subCell.font = { bold: true, size: 9.5, color: { argb: COLOR_PRIMARY } };
      subCell.alignment = { horizontal: 'right', vertical: 'middle' };
      subCell.numFmt = '$#,##0';

      currentRow++;
    });

    const endItemRow = currentRow - 1;

    // Space Subtotal Row
    ws.mergeCells(`A${currentRow}:F${currentRow}`);
    const stLabel = ws.getCell(`A${currentRow}`);
    stLabel.value = `SUBTOTAL ${space.name.toUpperCase()}:`;
    stLabel.font = { size: 9.5, bold: true, color: { argb: '1E293B' } };
    stLabel.alignment = { horizontal: 'right', vertical: 'middle' };
    stLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };

    const stVal = ws.getCell(`G${currentRow}`);
    if (startItemRow <= endItemRow) {
      stVal.value = { formula: `SUM(G${startItemRow}:G${endItemRow})` };
    } else {
      stVal.value = 0;
    }
    stVal.font = { size: 10, bold: true, color: { argb: COLOR_PRIMARY } };
    stVal.alignment = { horizontal: 'right', vertical: 'middle' };
    stVal.numFmt = '$#,##0';
    stVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
    ws.getRow(currentRow).height = 20;

    spaceSubtotalRows.push(`G${currentRow}`);
    currentRow++;
  });

  // Grand Total Row
  const grandTotalRow = currentRow;
  ws.mergeCells(`A${grandTotalRow}:F${grandTotalRow}`);
  const gtLabel = ws.getCell(`A${grandTotalRow}`);
  gtLabel.value = 'TOTAL GENERAL PRESUPUESTO OBRAS (TODO INCLUIDO):';
  gtLabel.font = { size: 11, bold: true, color: { argb: 'FFFFFF' } };
  gtLabel.alignment = { horizontal: 'right', vertical: 'middle' };
  gtLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };

  const gtVal = ws.getCell(`G${grandTotalRow}`);
  if (spaceSubtotalRows.length > 0) {
    gtVal.value = { formula: spaceSubtotalRows.join('+'), result: targetBudget };
  } else {
    gtVal.value = targetBudget;
  }
  gtVal.font = { size: 12, bold: true, color: { argb: 'FFFFFF' } };
  gtVal.alignment = { horizontal: 'right', vertical: 'middle' };
  gtVal.numFmt = '$#,##0';
  gtVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
  ws.getRow(grandTotalRow).height = 26;

  // KPI formulas
  ws.getCell('F3').value = { formula: `G${grandTotalRow}`, result: targetBudget };
  ws.getCell('F4').value = { formula: `F3-F2`, result: 0 };
  ws.getCell('E5').value = {
    formula: `IF(F4=0,"✅ ¡PRESUPUESTO CUADRADO EXACTO EN " & TEXT(F2,"$#,##0") & "!",IF(F4>0,"⚠️ SOBRAN " & TEXT(F4,"$#,##0") & " (DEBES BAJAR VALORES)","⚠️ FALTAN " & TEXT(-F4,"$#,##0") & " (DEBES SUBIR VALORES)"))`,
    result: `✅ ¡PRESUPUESTO CUADRADO EXACTO EN $${targetBudget.toLocaleString('es-CL')}!`
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const cleanClient = (budgetData.client?.name || 'Cliente')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  const fileName = `Presupuesto_Recintos_${cleanClient}_${targetBudget}.xlsx`;

  triggerFileDownload(
    blob, 
    fileName, 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  return fileName;
}
