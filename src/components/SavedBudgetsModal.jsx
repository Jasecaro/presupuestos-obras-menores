import React, { useRef } from 'react';
import { FolderOpen, X, Trash2, Calendar, User, FileText, ArrowRight, Download, Upload, FileJson } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import { exportBudgetToJson, exportFullBackup, saveBudgetToHistory } from '../utils/storage';

export default function SavedBudgetsModal({ 
  budgets = [], 
  currentBudget,
  onLoadBudget, 
  onDeleteBudget, 
  onRestoreFullBackup,
  onClose 
}) {
  const fileInputRef = useRef(null);

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.type === 'pom_full_backup') {
          if (onRestoreFullBackup) {
            onRestoreFullBackup(parsed);
          }
          onClose();
        } else if (parsed.client && (parsed.spaces || parsed.financials)) {
          // Single budget file
          saveBudgetToHistory(parsed);
          onLoadBudget(parsed);
          alert(`¡Presupuesto "${parsed.client?.quoteNumber || ''} - ${parsed.client?.name || 'Cliente'}" importado y cargado con éxito!`);
          onClose();
        } else {
          alert('El archivo seleccionado no tiene el formato válido de presupuesto.');
        }
      } catch (err) {
        console.error('Error parsing imported JSON', err);
        alert('Error al leer el archivo JSON. Verifica que sea un archivo válido.');
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <FolderOpen size={20} color="var(--primary)" />
            <span>Presupuestos y Respaldos</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Hidden file input for import */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              title="Importar un archivo de presupuesto o respaldo (.json) desde tu computador o pendrive"
            >
              <Upload size={14} />
              <span>Importar (.json)</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={exportFullBackup}
              title="Descargar un archivo de respaldo con todos tus presupuestos, perfil y precios para llevar a tu casa"
            >
              <Download size={14} />
              <span>Exportar Todo (.json)</span>
            </button>

            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Informative Banner */}
        <div style={{
          backgroundColor: 'var(--primary-subtle)',
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid var(--primary-border)',
          fontSize: '0.8rem',
          color: 'var(--primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>💡 <strong>¿Vas a trabajar en otro computador o en tu casa?</strong> Haz clic en <strong>"Exportar Todo (.json)"</strong> para descargar tu respaldo y luego cárgalo en tu casa con <strong>"Importar (.json)"</strong>.</span>
        </div>

        <div className="modal-body">
          {budgets.length === 0 ? (
            <div className="empty-state">
              <FileText className="empty-icon" />
              <h4 style={{ color: 'var(--text-main)', marginBottom: '0.4rem' }}>No hay presupuestos guardados en este navegador</h4>
              <p style={{ fontSize: '0.85rem', maxWidth: 450, margin: '0 auto 1rem auto' }}>
                Puedes hacer clic en <strong>"Importar (.json)"</strong> para cargar un respaldo previo, o guardar presupuestos con el botón "Guardar" en el resumen.
              </p>
              {currentBudget && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => exportBudgetToJson(currentBudget)}
                >
                  <FileJson size={15} />
                  <span>Descargar presupuesto actual como .json</span>
                </button>
              )}
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
                        title="Cargar y abrir este presupuesto"
                      >
                        <span>Cargar</span>
                        <ArrowRight size={14} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => exportBudgetToJson(item)}
                        title="Descargar este presupuesto como archivo .json"
                      >
                        <Download size={14} />
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

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          {currentBudget && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => exportBudgetToJson(currentBudget)}
              title="Descargar archivo .json del presupuesto que estás editando actualmente"
            >
              <FileJson size={14} />
              <span>Exportar presupuesto actual (.json)</span>
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

