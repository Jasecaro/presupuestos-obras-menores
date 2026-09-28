import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Hash, 
  Package, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from 'lucide-react';

export default function ClientInfoForm({ client, onChange, notes, onUpdateNotes }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFieldChange = (field, value) => {
    onChange({
      ...client,
      [field]: value
    });
  };

  const includesMaterials = client.includesMaterials !== false;

  const quickObservations = [
    'Presupuesto integral a todo costo: Incluye mano de obra especializada y materiales básicos según especificaciones acordadas en terreno.',
    '50% de anticipo para ejecución del trabajo y compra de materiales iniciales; saldo contra avances convenidos y recepción conforme.',
    'Superficies y canalizaciones sujetas a revisión tras despeje e inspección inicial.',
    'Materiales e insumos acopiados en faena bajo resguardo del mandante.',
    'Incluye aseo básico y despeje final de áreas intervenidas.',
    'Trabajos a realizar en horario hábil coordinado de común acuerdo.'
  ];

  const handleAddObservation = (text) => {
    if (!onUpdateNotes) return;
    if (!notes || notes.trim() === '') {
      onUpdateNotes(text);
    } else if (!notes.includes(text)) {
      onUpdateNotes(`${notes.trim()}\n• ${text}`);
    }
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
            {client.name || 'Sin cliente'} • {client.quoteNumber || 'PTO-001'} • {includesMaterials ? 'Con Materiales' : 'Solo M.O.'}
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
          {/* Fila 1: Datos Cliente */}
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

          {/* Fila 2: Dirección y Folio */}
          <div className="form-grid-4" style={{ marginTop: '0.85rem' }}>
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

          {/* Fila 3: Fechas y Plazos */}
          <div className="form-grid-3" style={{ marginTop: '0.85rem' }}>
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
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  style={{ width: '75px', textAlign: 'center' }}
                  value={client.estimatedWorkDays ?? 5}
                  onChange={(e) => handleFieldChange('estimatedWorkDays', e.target.value)}
                />
                <select
                  className="form-select"
                  style={{ flex: 1, padding: '0.45rem 0.5rem', fontSize: '0.82rem' }}
                  value={client.workDaysType || 'hábiles'}
                  onChange={(e) => handleFieldChange('workDaysType', e.target.value)}
                >
                  <option value="hábiles">días hábiles</option>
                  <option value="corridos">días corridos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fila 4: Opción ¿Incluye Materiales? (Checkbox destacado) */}
          <div
            style={{
              marginTop: '1.2rem',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              border: `1.5px solid ${includesMaterials ? '#86efac' : '#fca5a5'}`,
              backgroundColor: includesMaterials ? '#f0fdf4' : '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <label
              htmlFor="toggle-includes-materials"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                userSelect: 'none',
                margin: 0
              }}
            >
              <input
                type="checkbox"
                id="toggle-includes-materials"
                checked={includesMaterials}
                onChange={(e) => handleFieldChange('includesMaterials', e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#16a34a',
                  cursor: 'pointer'
                }}
              />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#1e293b' }}>
                  ¿El presupuesto incluye materiales?
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {includesMaterials
                    ? 'Activado: Se incluirá la mención "Presupuesto Todo Incluido (M.O. + Materiales)" antes del detalle por recinto.'
                    : 'Desactivado: Se indicará "Solo Mano de Obra (No incluye materiales)" antes del detalle por recinto.'}
                </div>
              </div>
            </label>

            <div
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: includesMaterials ? '#dcfce7' : '#fee2e2',
                color: includesMaterials ? '#15803d' : '#b91c1c',
                border: `1px solid ${includesMaterials ? '#bbf7d0' : '#fecaca'}`
              }}
            >
              {includesMaterials ? (
                <>
                  <CheckCircle2 size={14} />
                  <span>TODO INCLUIDO (M.O. + Materiales)</span>
                </>
              ) : (
                <>
                  <AlertCircle size={14} />
                  <span>SOLO MANO DE OBRA (Sin materiales)</span>
                </>
              )}
            </div>
          </div>

          {/* Fila 5: Observaciones (aparecen debajo de Forma de Pago en informes) */}
          <div style={{ marginTop: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={15} color="var(--primary)" />
                <span>Observaciones y Condiciones del Presupuesto:</span>
              </label>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Se imprimen debajo de la Forma de Pago
              </span>
            </div>

            <textarea
              className="form-textarea"
              rows={3}
              style={{ fontSize: '0.82rem', resize: 'vertical' }}
              placeholder="Ej. Presupuesto integral a todo costo: Incluye mano de obra especializada y materiales básicos. 50% de anticipo para ejecución del trabajo y compra de materiales iniciales; saldo contra avances convenidos y recepción conforme."
              value={notes || ''}
              onChange={(e) => onUpdateNotes && onUpdateNotes(e.target.value)}
            />

            {/* Sugerencias rápidas para agregar cláusulas */}
            <div style={{ marginTop: '0.45rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                + Agregar observación rápida:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {quickObservations.map((obs, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-ghost btn-xs"
                    style={{
                      fontSize: '0.7rem',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      color: 'var(--text-main)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}
                    title={obs}
                    onClick={() => handleAddObservation(obs)}
                  >
                    <Plus size={11} />
                    <span>{obs.slice(0, 40)}...</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
