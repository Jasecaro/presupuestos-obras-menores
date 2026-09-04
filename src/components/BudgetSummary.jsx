import React from 'react';
import { 
  DollarSign, 
  FileText, 
  Download, 
  Save, 
  Percent, 
  Layers, 
  ShieldCheck, 
  Info,
  Square,
  Paintbrush,
  Sparkles
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/calculations';

export default function BudgetSummary({
  financials,
  financialSettings,
  notes,
  onUpdateFinancialSettings,
  onUpdateNotes,
  onSaveBudget,
  onOpenPdfPreview,
  onDownloadPdf
}) {
  const handleSettingChange = (field, value) => {
    onUpdateFinancialSettings({
      ...financialSettings,
      [field]: value
    });
  };

  return (
    <aside className="summary-sticky-card">
      <div className="summary-header">
        <div className="summary-title">Resumen Financiero</div>
        <div className="summary-subtitle">Totales calculados en tiempo real</div>
      </div>

      <div className="summary-body">
        {/* Surface Area Metrics Summary */}
        {(financials.totalFloorArea > 0 || financials.totalNetWallArea > 0) && (
          <div style={{
            backgroundColor: 'var(--bg-card-subtle)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.8rem'
          }}>
            {financials.totalFloorArea > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: financials.totalNetWallArea > 0 ? '0.35rem' : 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }} title="Suma de áreas de pisos donde hay partidas de piso presupuestadas">
                  <Square size={13} color="var(--primary)" /> Pisos a Ejecutar:
                </span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(financials.totalFloorArea)} m²</strong>
              </div>
            )}
            {financials.totalNetWallArea > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }} title="Suma de muros netos donde hay partidas de pintura/muros presupuestadas">
                  <Paintbrush size={13} color="var(--primary)" /> Muros Netos:
                </span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(financials.totalNetWallArea)} m²</strong>
              </div>
            )}
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="summary-row">
          <span>Costo Directo Obras:</span>
          <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(financials.directCost)}</strong>
        </div>

        {/* Overhead / Profit Margin */}
        <div className="summary-row" style={{ alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Gastos Gen. / Utilidad:</span>
            <div className="input-with-addon" style={{ width: 65 }}>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                style={{ padding: '0.2rem 0.3rem', fontSize: '0.78rem', textAlign: 'center' }}
                value={financialSettings.overheadPercent ?? 10}
                onChange={(e) => handleSettingChange('overheadPercent', parseFloat(e.target.value) || 0)}
              />
              <span className="input-addon" style={{ padding: '0.2rem 0.3rem', fontSize: '0.75rem' }}>%</span>
            </div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            +{formatCurrency(financials.overheadAmount)}
          </span>
        </div>

        {/* Discount */}
        <div className="summary-row" style={{ alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Descuento Comercial:</span>
            <div className="input-with-addon" style={{ width: 65 }}>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                style={{ padding: '0.2rem 0.3rem', fontSize: '0.78rem', textAlign: 'center' }}
                value={financialSettings.discountPercent ?? 0}
                onChange={(e) => handleSettingChange('discountPercent', parseFloat(e.target.value) || 0)}
              />
              <span className="input-addon" style={{ padding: '0.2rem 0.3rem', fontSize: '0.75rem' }}>%</span>
            </div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', color: financials.discountAmount > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
            {financials.discountAmount > 0 ? `-${formatCurrency(financials.discountAmount)}` : '$ 0'}
          </span>
        </div>

        <div className="summary-row">
          <span style={{ fontWeight: '600' }}>Subtotal Neto:</span>
          <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(financials.netSubtotal)}</strong>
        </div>

        {/* Tax Toggle */}
        <div className="summary-row" style={{ alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              checked={Boolean(financialSettings.applyTax)}
              onChange={(e) => handleSettingChange('applyTax', e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
            />
            <span>Aplicar IVA (19%)</span>
          </label>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            {financials.applyTax ? `+${formatCurrency(financials.taxAmount)}` : 'Exento'}
          </span>
        </div>

        {/* Grand Total */}
        <div className="summary-row total-row">
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Total Final
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {financials.applyTax ? 'IVA Incluido' : 'Neto / Sin IVA'}
            </div>
          </div>
          <div className="grand-total-amount">
            {formatCurrency(financials.grandTotal)}
          </div>
        </div>

        {/* Custom Notes / Observations */}
        <div style={{ marginTop: '1.25rem' }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>
            <Info size={13} />
            Observaciones y Condiciones Especiales:
          </label>
          <textarea
            className="form-textarea"
            rows={3}
            style={{ fontSize: '0.8rem', resize: 'vertical' }}
            placeholder="Ej. No incluye retiro de muebles ni materiales pesados. Obra sujeta a despeje inicial."
            value={notes || ''}
            onChange={(e) => onUpdateNotes(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1.25rem' }}>
          {/* Minimalist Summary PDF Download Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onDownloadPdf('minimal')}
            style={{ width: '100%', justifyContent: 'center', fontWeight: '700' }}
            title="Descargar versión resumen (solo alcance de trabajos y total)"
          >
            <Sparkles size={16} />
            <span>Descargar Versión Minimalista</span>
          </button>

          {/* Detailed Full PDF Download Button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onDownloadPdf('detailed')}
            style={{ width: '100%', justifyContent: 'center' }}
            title="Descargar versión completa con desglose de m² y precios unitarios"
          >
            <Download size={15} />
            <span>Descargar Versión Detallada</span>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenPdfPreview}
              style={{ justifyContent: 'center' }}
              title="Previsualizar formatos y copiar texto para WhatsApp"
            >
              <FileText size={15} />
              <span>Ver Formatos</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onSaveBudget}
              style={{ justifyContent: 'center' }}
              title="Guardar presupuesto en el historial"
            >
              <Save size={15} />
              <span>Guardar</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

