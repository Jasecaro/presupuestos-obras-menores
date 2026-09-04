import React, { useState } from 'react';
import { User, MapPin, Calendar, Clock, ChevronDown, ChevronUp, Hash } from 'lucide-react';

export default function ClientInfoForm({ client, onChange }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFieldChange = (field, value) => {
    onChange({
      ...client,
      [field]: value
    });
  };

  return (
    <div className="card">
      <div
        className="card-header-clean"
        style={{ cursor: 'pointer', marginBottom: isExpanded ? '1rem' : 0 }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="card-title">
          <User size={20} color="var(--primary)" />
          <span>Información del Cliente y Obra</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {client.name || 'Sin cliente'} • {client.quoteNumber || 'PTO-001'}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px' }}
            aria-label={isExpanded ? 'Contraer' : 'Expandir'}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">
                <User size={14} />
                Nombre del Cliente:
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Juan González / Constructora Alfa"
                value={client.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono / WhatsApp:</label>
              <input
                type="text"
                className="form-input"
                placeholder="+56 9 1234 5678"
                value={client.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico:</label>
              <input
                type="email"
                className="form-input"
                placeholder="cliente@ejemplo.com"
                value={client.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid-4">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">
                <MapPin size={14} />
                Dirección de la Obra:
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Calle Los Robles #123, Depto 402"
                value={client.address || ''}
                onChange={(e) => handleFieldChange('address', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Comuna / Ciudad:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Santiago / Providencia"
                value={client.city || ''}
                onChange={(e) => handleFieldChange('city', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Hash size={14} />
                N° Presupuesto:
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="PTO-2026-001"
                value={client.quoteNumber || ''}
                onChange={(e) => handleFieldChange('quoteNumber', e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} />
                Fecha de Emisión:
              </label>
              <input
                type="date"
                className="form-input"
                value={client.date || ''}
                onChange={(e) => handleFieldChange('date', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Validez de la Oferta (días):</label>
              <div className="input-with-addon">
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={client.validityDays || 15}
                  onChange={(e) => handleFieldChange('validityDays', e.target.value)}
                />
                <span className="input-addon">días</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock size={14} />
                Plazo Estimado de Ejecución:
              </label>
              <div className="input-with-addon">
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={client.estimatedWorkDays || 7}
                  onChange={(e) => handleFieldChange('estimatedWorkDays', e.target.value)}
                />
                <span className="input-addon">días hábiles</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
