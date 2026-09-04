import React from 'react';
import { FolderOpen, X, Trash2, Calendar, User, FileText, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

export default function SavedBudgetsModal({ budgets = [], onLoadBudget, onDeleteBudget, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <FolderOpen size={20} color="var(--primary)" />
            <span>Presupuestos Guardados en Historial</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {budgets.length === 0 ? (
            <div className="empty-state">
              <FileText className="empty-icon" />
              <h4 style={{ color: 'var(--text-main)', marginBottom: '0.4rem' }}>No hay presupuestos guardados</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Cuando prepares un presupuesto, haz clic en el botón "Guardar" en el resumen lateral para tenerlo guardado aquí.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {budgets.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1.15rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'white',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {item.client?.name || 'Cliente Particular'}
                      </strong>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'var(--primary)',
                        backgroundColor: 'var(--primary-subtle)',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {item.client?.quoteNumber || 'PTO-000'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                      <span>
                        <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                        {item.client?.date || 'Sin fecha'}
                      </span>
                      <span>
                        {item.spaces?.length || 0} espacio(s)
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--primary)', fontSize: '1.1rem' }}>
                        {formatCurrency(item.total || 0)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          onLoadBudget(item);
                          onClose();
                        }}
                      >
                        <span>Cargar</span>
                        <ArrowRight size={14} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger-outline btn-sm"
                        onClick={() => onDeleteBudget(item.id)}
                        title="Eliminar este presupuesto guardado"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
