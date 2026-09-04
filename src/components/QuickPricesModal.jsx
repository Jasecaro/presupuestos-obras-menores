import React, { useState } from 'react';
import { DollarSign, Save, X, RotateCcw } from 'lucide-react';
import { DEFAULT_PRICE_CATALOG } from '../types/budget';
import { formatCurrency } from '../utils/calculations';

export default function QuickPricesModal({ catalog, onSaveCatalog, onClose }) {
  const [items, setItems] = useState([...catalog]);

  const handlePriceChange = (id, newPrice) => {
    const val = parseFloat(newPrice) || 0;
    setItems(prev => prev.map(item => item.id === id ? { ...item, unitPrice: val } : item));
  };

  const handleResetDefaults = () => {
    if (window.confirm('¿Deseas restaurar todos los precios unitarios a los valores sugeridos por defecto?')) {
      setItems([...DEFAULT_PRICE_CATALOG]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveCatalog(items);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <DollarSign size={20} color="var(--primary)" />
            <span>Configurar Precios Base ($/m² y Unitarios)</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Define tus tarifas habituales por metro cuadrado y unidad. Cada vez que agregues un trabajo a un recinto, se usará este precio predeterminado (también podrás modificarlo individualmente en cada recinto).
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table className="items-table" style={{ marginTop: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: '55%' }}>Partida / Rubro</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>Unidad</th>
                    <th style={{ width: '30%', textAlign: 'right' }}>Tu Precio Base ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.category} • {item.description}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                        {item.unit}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="input-with-addon" style={{ maxWidth: 140, marginLeft: 'auto' }}>
                          <span className="input-addon" style={{ borderLeft: '1px solid var(--border-color)', borderRight: 'none', borderTopLeftRadius: 'var(--radius-md)', borderBottomLeftRadius: 'var(--radius-md)', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
                            $
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            className="form-input"
                            style={{ textAlign: 'right', fontWeight: '600', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                            value={item.unitPrice}
                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetDefaults}
              title="Restaurar precios sugeridos"
            >
              <RotateCcw size={15} />
              <span>Restaurar Valores Sugeridos</span>
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                <span>Guardar Tarifas</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
