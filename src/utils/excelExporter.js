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

  // ==========================================
  // SHEET 1: Detalle de Partidas (FIRST SHEET)
  // ==========================================
  const wsDetail = workbook.addWorksheet('Detalle de Partidas', {
    views: [{ state: 'normal', activeCell: 'G10', showGridLines: true }]
  });

  wsDetail.columns = [
    { key: 'colA', width: 7 },   // #
    { key: 'colB', width: 25 },  // Recinto
    { key: 'colC', width: 44 },  // Partida / Trabajo
    { key: 'colD', width: 46 },  // Descripción Técnica
    { key: 'colE', width: 10 },  // Unidad
    { key: 'colF', width: 12 },  // Cantidad (EDITABLE)
    { key: 'colG', width: 18 },  // P. Unitario ($) (EDITABLE)
    { key: 'colH', width: 20 }   // Subtotal ($) (FORMULA)
  ];

  // Title Banner
  wsDetail.mergeCells('A1:H1');
  const dTitle = wsDetail.getCell('A1');
  dTitle.value = 'PRESUPUESTO DE OBRAS - DETALLE OPERATIVO DE PARTIDAS POR ESPECIALIDAD';
  dTitle.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFF' } };
  dTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
  dTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  wsDetail.getRow(1).height = 28;

  // Project Info Card
  wsDetail.mergeCells('A2:E2');
  wsDetail.getCell('A2').value = `Cliente: ${budgetData.client?.name || 'Cliente Particular'}`;
  wsDetail.getCell('A2').font = { bold: true, size: 10 };

  wsDetail.mergeCells('A3:E3');
  wsDetail.getCell('A3').value = `Dirección: ${budgetData.client?.address || 'Sin dirección'} - ${budgetData.client?.city || 'Santiago'}`;
  wsDetail.getCell('A3').font = { size: 9, color: { argb: '475569' } };

  wsDetail.mergeCells('A4:E4');
  wsDetail.getCell('A4').value = `Cotización: ${budgetData.client?.quoteNumber || 'PTO-2026-001'}  |  Modalidad: Todo Incluido`;
  wsDetail.getCell('A4').font = { size: 9, color: { argb: '475569' } };

  // Control KPI Panel (F2:H5)
  wsDetail.getCell('F2').value = 'Meta Presupuesto:';
  wsDetail.getCell('F2').font = { bold: true, size: 9 };
  wsDetail.getCell('F2').alignment = { horizontal: 'right' };
  wsDetail.mergeCells('G2:H2');
  wsDetail.getCell('G2').value = targetBudget;
  wsDetail.getCell('G2').numFmt = '$#,##0';
  wsDetail.getCell('G2').font = { bold: true, size: 11, color: { argb: COLOR_PRIMARY } };
  wsDetail.getCell('G2').alignment = { horizontal: 'right' };

  wsDetail.getCell('F3').value = 'Total Actual:';
  wsDetail.getCell('F3').font = { bold: true, size: 9 };
  wsDetail.getCell('F3').alignment = { horizontal: 'right' };
  wsDetail.mergeCells('G3:H3');
  wsDetail.getCell('G3').font = { bold: true, size: 11 };
  wsDetail.getCell('G3').numFmt = '$#,##0';
  wsDetail.getCell('G3').alignment = { horizontal: 'right' };

  wsDetail.getCell('F4').value = 'Diferencia p/ Meta:';
  wsDetail.getCell('F4').font = { bold: true, size: 9 };
  wsDetail.getCell('F4').alignment = { horizontal: 'right' };
  wsDetail.mergeCells('G4:H4');
  wsDetail.getCell('G4').font = { bold: true, size: 11 };
  wsDetail.getCell('G4').numFmt = '$#,##0;($#,##0);"-"';
  wsDetail.getCell('G4').alignment = { horizontal: 'right' };

  wsDetail.mergeCells('F5:H5');
  wsDetail.getCell('F5').font = { bold: true, size: 9 };
  wsDetail.getCell('F5').alignment = { horizontal: 'center', vertical: 'middle' };
  wsDetail.getRow(5).height = 20;

  // Instructions Bar
  wsDetail.mergeCells('A6:H6');
  const dTip = wsDetail.getCell('A6');
  dTip.value = '💡 INSTRUCCIÓN PARA EL MAESTRO: En esta hoja puedes editar la Cantidad (Col. F) o el Precio Unitario (Col. G en amarillo) de cada partida. Las sumas por especialidad, el total y la Hoja 2 ("Resumen Macro-Tareas") se actualizan automáticamente.';
  dTip.font = { italic: true, size: 8.5, color: { argb: '1E293B' } };
  dTip.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF08A' } };
  dTip.alignment = { vertical: 'middle', horizontal: 'center' };
  wsDetail.getRow(6).height = 22;

  // Table Column Headers (Row 8)
  const dHeaders = ['#', 'Recinto / Ubicación', 'Partida / Trabajo', 'Descripción Técnica y Alcance', 'Unidad', 'Cantidad', 'P. Unitario ($)', 'Subtotal ($)'];
  const dHeadRow = wsDetail.getRow(8);
  dHeadRow.height = 24;
  dHeaders.forEach((h, idx) => {
    const colLetter = String.fromCharCode(65 + idx);
    const cell = wsDetail.getCell(`${colLetter}8`);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_FILL } };
    cell.alignment = { vertical: 'middle', horizontal: idx >= 5 ? 'right' : (idx === 0 || idx === 4 ? 'center' : 'left') };
    cell.border = { top: { style: 'thin' }, bottom: { style: 'medium' } };
  });

  let curRow = 9;
  const macroSubtotalCells = [];

  macroTasks.forEach((macro, mIdx) => {
    // Macro Specialty Section Header
    wsDetail.mergeCells(`A${curRow}:H${curRow}`);
    const secCell = wsDetail.getCell(`A${curRow}`);
    secCell.value = `${mIdx + 1}. ESPECIALIDAD: ${macro.title.toUpperCase()}`;
    secCell.font = { bold: true, size: 10, color: { argb: 'FFFFFF' } };
    secCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
    secCell.alignment = { vertical: 'middle' };
    wsDetail.getRow(curRow).height = 24;
    curRow++;

    const startItemRow = curRow;

    macro.items.forEach((it, iIdx) => {
      wsDetail.getCell(`A${curRow}`).value = `${mIdx + 1}.${iIdx + 1}`;
      wsDetail.getCell(`A${curRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

      wsDetail.getCell(`B${curRow}`).value = it.spaceName;
      wsDetail.getCell(`B${curRow}`).font = { size: 9 };
      wsDetail.getCell(`B${curRow}`).alignment = { vertical: 'middle' };

      wsDetail.getCell(`C${curRow}`).value = it.name;
      wsDetail.getCell(`C${curRow}`).font = { bold: true, size: 9.5 };
      wsDetail.getCell(`C${curRow}`).alignment = { vertical: 'middle' };

      wsDetail.getCell(`D${curRow}`).value = it.description || '';
      wsDetail.getCell(`D${curRow}`).font = { size: 8.5, color: { argb: '475569' } };
      wsDetail.getCell(`D${curRow}`).alignment = { vertical: 'middle' };

      wsDetail.getCell(`E${curRow}`).value = it.unit || 'gl';
      wsDetail.getCell(`E${curRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

      // Cantidad (Col F) - Editable
      const qCell = wsDetail.getCell(`F${curRow}`);
      qCell.value = it.quantity || 1;
      qCell.alignment = { horizontal: 'right', vertical: 'middle' };
      qCell.numFmt = '#,##0.00';

      // Precio Unitario (Col G) - Editable in soft yellow
      const pCell = wsDetail.getCell(`G${curRow}`);
      pCell.value = it.unitPrice;
      pCell.font = { bold: true, size: 9.5 };
      pCell.alignment = { horizontal: 'right', vertical: 'middle' };
      pCell.numFmt = '$#,##0';
      pCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_EDITABLE_CELL } };
      pCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

      // Subtotal formula: = F * G
      const sCell = wsDetail.getCell(`H${curRow}`);
      sCell.value = { formula: `F${curRow}*G${curRow}`, result: (it.quantity || 1) * it.unitPrice };
      sCell.font = { bold: true, size: 9.5, color: { argb: COLOR_PRIMARY } };
      sCell.alignment = { horizontal: 'right', vertical: 'middle' };
      sCell.numFmt = '$#,##0';

      curRow++;
    });

    const endItemRow = curRow - 1;

    // Subtotal Row for this Specialty
    wsDetail.mergeCells(`A${curRow}:G${curRow}`);
    const stLabel = wsDetail.getCell(`A${curRow}`);
    stLabel.value = `SUBTOTAL ESPECIALIDAD ${mIdx + 1} (${macro.shortTitle || macro.title}):`;
    stLabel.font = { size: 9.5, bold: true, color: { argb: '1E293B' } };
    stLabel.alignment = { horizontal: 'right', vertical: 'middle' };
    stLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };

    const stVal = wsDetail.getCell(`H${curRow}`);
    stVal.value = { formula: `SUM(H${startItemRow}:H${endItemRow})`, result: macro.subtotal };
    stVal.font = { size: 10, bold: true, color: { argb: COLOR_PRIMARY } };
    stVal.alignment = { horizontal: 'right', vertical: 'middle' };
    stVal.numFmt = '$#,##0';
    stVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };
    wsDetail.getRow(curRow).height = 22;

    macroSubtotalCells.push({
      sheet1SubtotalCell: `H${curRow}`,
      subtotalRow: curRow,
      macro
    });

    curRow += 2; // Blank spacing row
  });

  // Grand Total Row on Sheet 1
  const grandTotalRow1 = curRow;
  wsDetail.mergeCells(`A${grandTotalRow1}:G${grandTotalRow1}`);
  const gtLabel1 = wsDetail.getCell(`A${grandTotalRow1}`);
  gtLabel1.value = 'TOTAL GENERAL PRESUPUESTO OBRAS (TODO INCLUIDO):';
  gtLabel1.font = { size: 11, bold: true, color: { argb: 'FFFFFF' } };
  gtLabel1.alignment = { horizontal: 'right', vertical: 'middle' };
  gtLabel1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };

  const gtVal1 = wsDetail.getCell(`H${grandTotalRow1}`);
  const subSumFormula = macroSubtotalCells.map(c => c.sheet1SubtotalCell).join('+');
  gtVal1.value = { formula: subSumFormula, result: grandTotal };
  gtVal1.font = { size: 12, bold: true, color: { argb: 'FFFFFF' } };
  gtVal1.alignment = { horizontal: 'right', vertical: 'middle' };
  gtVal1.numFmt = '$#,##0';
  gtVal1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
  wsDetail.getRow(grandTotalRow1).height = 26;

  // Link KPI values on Sheet 1
  wsDetail.getCell('G3').value = { formula: `H${grandTotalRow1}`, result: grandTotal };
  wsDetail.getCell('G4').value = { formula: `G3-G2`, result: grandTotal - targetBudget };
  wsDetail.getCell('F5').value = {
    formula: `IF(G4=0,"✅ ¡PRESUPUESTO CUADRADO EXACTO EN " & TEXT(G2,"$#,##0") & "!",IF(G4>0,"⚠️ SOBRAN " & TEXT(G4,"$#,##0") & " (DEBES BAJAR VALORES)","⚠️ FALTAN " & TEXT(-G4,"$#,##0") & " (DEBES SUBIR VALORES)"))`,
    result: grandTotal === targetBudget ? `✅ ¡PRESUPUESTO CUADRADO EXACTO EN $${targetBudget.toLocaleString('es-CL')}!` : '⚠️ AJUSTAR VALORES'
  };

  // ==========================================
  // SHEET 2: Resumen Macro-Tareas (LINKED)
  // ==========================================
  const wsSummary = workbook.addWorksheet('Resumen Macro-Tareas', {
    views: [{ showGridLines: true }]
  });

  wsSummary.columns = [
    { key: 'sA', width: 6 },   // #
    { key: 'sB', width: 38 },  // Especialidad / Macro-Tarea
    { key: 'sC', width: 50 },  // Cobertura y Detalle
    { key: 'sD', width: 10 },  // Unidad
    { key: 'sE', width: 12 },  // Cantidad
    { key: 'sF', width: 22 },  // Subtotal ($) (FORMULA LINKING TO SHEET 1)
    { key: 'sG', width: 14 }   // % Incidencia
  ];

  // Title Banner
  wsSummary.mergeCells('A1:G1');
  const sTitle = wsSummary.getCell('A1');
  sTitle.value = 'RESUMEN EJECUTIVO POR ESPECIALIDADES / TAREAS COMPLETAS';
  sTitle.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFF' } };
  sTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
  sTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  wsSummary.getRow(1).height = 28;

  // Project Info Card
  wsSummary.mergeCells('A2:D2');
  wsSummary.getCell('A2').value = `Cliente: ${budgetData.client?.name || 'Cliente Particular'}`;
  wsSummary.getCell('A2').font = { bold: true, size: 10 };

  wsSummary.mergeCells('A3:D3');
  wsSummary.getCell('A3').value = `Dirección: ${budgetData.client?.address || 'Sin dirección'} - ${budgetData.client?.city || 'Santiago'}`;
  wsSummary.getCell('A3').font = { size: 9, color: { argb: '475569' } };

  wsSummary.mergeCells('A4:D4');
  wsSummary.getCell('A4').value = `Cotización: ${budgetData.client?.quoteNumber || 'PTO-2026-001'}  |  Modalidad: Todo Incluido`;
  wsSummary.getCell('A4').font = { size: 9, color: { argb: '475569' } };

  // Control KPI Panel linking to Sheet 1
  wsSummary.getCell('E2').value = 'Meta Presupuesto:';
  wsSummary.getCell('E2').font = { bold: true, size: 9 };
  wsSummary.getCell('E2').alignment = { horizontal: 'right' };
  wsSummary.mergeCells('F2:G2');
  wsSummary.getCell('F2').value = { formula: `'Detalle de Partidas'!G2`, result: targetBudget };
  wsSummary.getCell('F2').numFmt = '$#,##0';
  wsSummary.getCell('F2').font = { bold: true, size: 11, color: { argb: COLOR_PRIMARY } };
  wsSummary.getCell('F2').alignment = { horizontal: 'right' };

  wsSummary.getCell('E3').value = 'Total Actual:';
  wsSummary.getCell('E3').font = { bold: true, size: 9 };
  wsSummary.getCell('E3').alignment = { horizontal: 'right' };
  wsSummary.mergeCells('F3:G3');
  wsSummary.getCell('F3').value = { formula: `'Detalle de Partidas'!G3`, result: grandTotal };
  wsSummary.getCell('F3').font = { bold: true, size: 11 };
  wsSummary.getCell('F3').numFmt = '$#,##0';
  wsSummary.getCell('F3').alignment = { horizontal: 'right' };

  wsSummary.getCell('E4').value = 'Diferencia p/ Meta:';
  wsSummary.getCell('E4').font = { bold: true, size: 9 };
  wsSummary.getCell('E4').alignment = { horizontal: 'right' };
  wsSummary.mergeCells('F4:G4');
  wsSummary.getCell('F4').value = { formula: `F3-F2`, result: 0 };
  wsSummary.getCell('F4').font = { bold: true, size: 11 };
  wsSummary.getCell('F4').numFmt = '$#,##0;($#,##0);"-"';
  wsSummary.getCell('F4').alignment = { horizontal: 'right' };

  wsSummary.mergeCells('E5:G5');
  wsSummary.getCell('E5').value = { formula: `'Detalle de Partidas'!F5`, result: '✅ ¡PRESUPUESTO CUADRADO EXACTO EN $9.180.000!' };
  wsSummary.getCell('E5').font = { bold: true, size: 9.5 };
  wsSummary.getCell('E5').alignment = { horizontal: 'center', vertical: 'middle' };
  wsSummary.getRow(5).height = 20;

  // Instructions Bar
  wsSummary.mergeCells('A6:G6');
  const sTip = wsSummary.getCell('A6');
  sTip.value = '💡 NOTA: Los valores de esta hoja resumen se calculan y actualizan automáticamente según los detalles que edites en la Hoja 1 ("Detalle de Partidas").';
  sTip.font = { italic: true, size: 8.5, color: { argb: '1E293B' } };
  sTip.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0F2FE' } };
  sTip.alignment = { vertical: 'middle', horizontal: 'center' };
  wsSummary.getRow(6).height = 22;

  // Headers (Row 8)
  const sHeaders = ['#', 'Especialidad / Tarea Completa', 'Detalle de Cobertura y Alcance Integral', 'Unidad', 'Cantidad', 'Subtotal Especialidad ($)', '% Incidencia'];
  const sHeadRow = wsSummary.getRow(8);
  sHeadRow.height = 24;
  sHeaders.forEach((h, idx) => {
    const colLetter = String.fromCharCode(65 + idx);
    const cell = wsSummary.getCell(`${colLetter}8`);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_FILL } };
    cell.alignment = { vertical: 'middle', horizontal: idx >= 4 ? 'right' : (idx === 0 || idx === 3 ? 'center' : 'left') };
    cell.border = { top: { style: 'thin' }, bottom: { style: 'medium' } };
  });

  let sRow = 9;
  const startSRow = sRow;

  macroTasks.forEach((macro, mIdx) => {
    const subCellRef = macroSubtotalCells[mIdx].sheet1SubtotalCell;

    wsSummary.getCell(`A${sRow}`).value = mIdx + 1;
    wsSummary.getCell(`A${sRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
    wsSummary.getCell(`A${sRow}`).font = { bold: true };

    wsSummary.getCell(`B${sRow}`).value = macro.title;
    wsSummary.getCell(`B${sRow}`).font = { bold: true, size: 10, color: { argb: '0F172A' } };
    wsSummary.getCell(`B${sRow}`).alignment = { vertical: 'middle' };

    wsSummary.getCell(`C${sRow}`).value = macro.description;
    wsSummary.getCell(`C${sRow}`).font = { size: 8.5, color: { argb: '475569' } };
    wsSummary.getCell(`C${sRow}`).alignment = { vertical: 'middle' };

    wsSummary.getCell(`D${sRow}`).value = 'gl';
    wsSummary.getCell(`D${sRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

    wsSummary.getCell(`E${sRow}`).value = 1;
    wsSummary.getCell(`E${sRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
    wsSummary.getCell(`E${sRow}`).numFmt = '#,##0';

    // Subtotal: FORMULA LINKING DIRECTLY TO SHEET 1
    const sSub = wsSummary.getCell(`F${sRow}`);
    sSub.value = { formula: `'Detalle de Partidas'!${subCellRef}`, result: macro.subtotal };
    sSub.font = { bold: true, size: 10, color: { argb: COLOR_PRIMARY } };
    sSub.alignment = { horizontal: 'right', vertical: 'middle' };
    sSub.numFmt = '$#,##0';
    sSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };

    // % Incidencia
    const sPct = wsSummary.getCell(`G${sRow}`);
    sPct.alignment = { horizontal: 'right', vertical: 'middle' };
    sPct.numFmt = '0.0%';

    sRow++;
  });

  const endSRow = sRow - 1;
  const grandTotalRow2 = sRow;

  // Grand Total Row on Sheet 2
  wsSummary.mergeCells(`A${grandTotalRow2}:E${grandTotalRow2}`);
  const gtLabel2 = wsSummary.getCell(`A${grandTotalRow2}`);
  gtLabel2.value = 'TOTAL GENERAL PRESUPUESTO OBRAS (TODO INCLUIDO):';
  gtLabel2.font = { size: 11, bold: true, color: { argb: 'FFFFFF' } };
  gtLabel2.alignment = { horizontal: 'right', vertical: 'middle' };
  gtLabel2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };

  const gtVal2 = wsSummary.getCell(`F${grandTotalRow2}`);
  gtVal2.value = { formula: `SUM(F${startSRow}:F${endSRow})`, result: grandTotal };
  gtVal2.font = { size: 12, bold: true, color: { argb: 'FFFFFF' } };
  gtVal2.alignment = { horizontal: 'right', vertical: 'middle' };
  gtVal2.numFmt = '$#,##0';
  gtVal2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };

  const gtPct2 = wsSummary.getCell(`G${grandTotalRow2}`);
  gtPct2.value = { formula: `SUM(G${startSRow}:G${endSRow})`, result: 1 };
  gtPct2.font = { size: 10, bold: true, color: { argb: 'FFFFFF' } };
  gtPct2.alignment = { horizontal: 'right', vertical: 'middle' };
  gtPct2.numFmt = '0.0%';
  gtPct2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
  wsSummary.getRow(grandTotalRow2).height = 26;

  // Set % incidence formulas
  for (let r = startSRow; r <= endSRow; r++) {
    wsSummary.getCell(`G${r}`).value = { formula: `F${r}/F${grandTotalRow2}` };
  }

  // Active sheet is Sheet 1 (Detalle de Partidas)
  workbook.views = [
    {
      x: 0, y: 0, width: 10000, height: 20000,
      firstSheet: 0,
      activeTab: 0,
      visibility: 'visible'
    }
  ];

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
