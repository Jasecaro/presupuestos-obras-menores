import React, { useState } from 'react';
import { Building2, Save, X, Phone, Mail, MapPin, User, FileText, Shield } from 'lucide-react';

export default function ContractorModal({ contractor, onSave, onClose }) {
  const [formData, setFormData] = useState({ ...contractor });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Building2 size={20} color="var(--primary)" />
            <span>Perfil de la Empresa / Contratista</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Estos datos aparecerán en el encabezado oficial, pie de página y condiciones comerciales de cada presupuesto PDF que generes.
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
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Guardar Perfil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
