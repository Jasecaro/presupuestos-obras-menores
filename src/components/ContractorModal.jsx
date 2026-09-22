import React, { useState, useEffect } from 'react';
import { Building2, Save, X, Phone, Mail, MapPin, User, FileText, Shield, AlertCircle, Check } from 'lucide-react';
import { loadContractorDraft, saveContractorDraft, clearContractorDraft } from '../utils/storage';

export default function ContractorModal({ contractor, onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    const draft = loadContractorDraft();
    return draft ? { ...contractor, ...draft } : { ...contractor };
  });

  const [hasDraft, setHasDraft] = useState(() => Boolean(loadContractorDraft()));
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      saveContractorDraft(updated);
      return updated;
    });
    setIsDirty(true);
    setHasDraft(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearContractorDraft();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleRequestClose = () => {
    if (isDirty) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleDiscardChanges = () => {
    clearContractorDraft();
    onClose();
  };

  const handleSaveAndClose = (e) => {
    e.preventDefault();
    clearContractorDraft();
    onSave(formData);
    onClose();
  };

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        // Prevent accidental closing when clicking outside the modal
        if (e.target === e.currentTarget) {
          if (isDirty) {
            setShowConfirmClose(true);
          }
        }
      }}
    >
      <div 
        className="modal-card modal-card-lg" 
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Building2 size={20} color="var(--primary)" />
            <span>Perfil de la Empresa / Contratista</span>
            {hasDraft && (
              <span className="badge" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', fontSize: '0.7rem' }}>
                Autoguardado activo
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSubmit}
              disabled={saveSuccess}
              title="Guardar perfil y cerrar"
            >
              {saveSuccess ? <Check size={15} /> : <Save size={15} />}
              <span>{saveSuccess ? '¡Guardado!' : 'Guardar'}</span>
            </button>

            <button 
              type="button" 
              className="btn btn-ghost btn-sm" 
              onClick={handleRequestClose}
              title="Cerrar ventana"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Confirmation overlay if user has unsaved changes and tried to close */}
        {showConfirmClose && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1.5rem',
            animation: 'fadeIn 0.15s ease'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              maxWidth: 440,
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              textAlign: 'center'
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: 'var(--warning-subtle)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <AlertCircle size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                ¿Deseas cerrar el formulario?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                Has ingresado datos nuevos. Tus cambios están protegidos en el borrador automático de tu navegador.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveAndClose}
                >
                  <Save size={16} />
                  <span>Guardar cambios y salir</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmClose(false)}
                >
                  Seguir editando
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--danger)', marginTop: '0.25rem' }}
                  onClick={handleDiscardChanges}
                >
                  Descartar cambios no guardados
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Estos datos aparecerán en el encabezado oficial, pie de página y condiciones comerciales de cada presupuesto PDF que generes. 
              <strong> Los cambios que escribas se guardan en borrador automáticamente.</strong>
            </p>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  <Building2 size={14} />
                  Nombre Comercial / Empresa:
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Ej. Constructora & Remodelaciones Pro SpA"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User size={14} />
                  Nombre del Maestro / Profesional Responsable:
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Ej. Juan Pérez Rodríguez"
                  value={formData.contractorName || ''}
                  onChange={(e) => handleChange('contractorName', e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">RUT / Identificación:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="15.482.930-K"
                  value={formData.rut || ''}
                  onChange={(e) => handleChange('rut', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={14} />
                  Teléfono / WhatsApp:
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+56 9 8765 4321"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={14} />
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="contacto@obraspro.cl"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin size={14} />
                Dirección Comercial / Taller:
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Av. Providencia 1234, Of. 502, Santiago"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">
                <FileText size={14} />
                Forma y Condiciones de Pago por Defecto:
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="50% anticipo al inicio, 30% avance y 20% contra entrega conforme."
                value={formData.paymentTerms || ''}
                onChange={(e) => handleChange('paymentTerms', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Shield size={14} />
                Términos de Garantía:
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Garantía de 6 meses sobre mano de obra ejecutada."
                value={formData.warranty || ''}
                onChange={(e) => handleChange('warranty', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleRequestClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saveSuccess}
            >
              {saveSuccess ? <Check size={16} /> : <Save size={16} />}
              <span>{saveSuccess ? '¡Perfil Guardado!' : 'Guardar Perfil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
