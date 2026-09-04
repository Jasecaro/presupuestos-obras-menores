import React, { useState } from 'react';
import { Ban, Plus, Trash2, ShieldAlert, Sparkles, X } from 'lucide-react';
import { SUGGESTED_EXCLUSIONS } from '../types/budget';

export default function ExclusionsEditor({ exclusions = [], onChange }) {
  const [newExclusionText, setNewExclusionText] = useState('');

  const handleAddCustom = (e) => {
    e?.preventDefault();
    if (!newExclusionText.trim()) return;
    onChange([...exclusions, newExclusionText.trim()]);
    setNewExclusionText('');
  };

  const handleRemove = (indexToRemove) => {
    onChange(exclusions.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdateItem = (indexToUpdate, newText) => {
    onChange(exclusions.map((item, idx) => (idx === indexToUpdate ? newText : item)));
  };

  const handleAddSuggested = (suggested) => {
    if (!exclusions.includes(suggested)) {
      onChange([...exclusions, suggested]);
    }
  };

  return (
    <div className="card" style={{ marginTop: '1.25rem' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--danger-subtle)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Ban size={16} />
          </div>
          <div>
            <h2 className="card-title" style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
              Lo que NO Incluye este Presupuesto (Exclusiones)
            </h2>
            <p className="card-subtitle" style={{ fontSize: '0.75rem' }}>
              Aparecerá como lista de aclaraciones tanto en el PDF Detallado como en el Minimalista y WhatsApp.
            </p>
          </div>
        </div>
        <span className="badge" style={{ backgroundColor: 'var(--danger-subtle)', color: 'var(--danger)', fontSize: '0.72rem', fontWeight: 600 }}>
          {exclusions.length} exclusión(es)
        </span>
      </div>

      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {/* List of active exclusions */}
        {exclusions.length === 0 ? (
          <div style={{
            padding: '1rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)',
            color: 'var(--text-muted)',
            fontSize: '0.82rem'
          }}>
            No has agregado exclusiones. Haz clic en las sugerencias abajo o escribe una para proteger tu presupuesto.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {exclusions.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--bg-main)',
                  padding: '0.4rem 0.6rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <span style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: '0.8rem', paddingLeft: '0.2rem' }}>•</span>
                <input
                  type="text"
                  className="form-input"
                  value={item}
                  onChange={(e) => handleUpdateItem(index, e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.25rem 0.4rem',
                    fontSize: '0.82rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    boxShadow: 'none'
                  }}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleRemove(index)}
                  title="Eliminar exclusión"
                  style={{ color: 'var(--text-muted)', padding: '0.2rem' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input to add custom exclusion */}
        <form onSubmit={handleAddCustom} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Escribe otra exclusión personalizada (ej. No incluye pintura en rejas exteriores)..."
            value={newExclusionText}
            onChange={(e) => setNewExclusionText(e.target.value)}
            style={{ fontSize: '0.82rem' }}
          />
          <button
            type="submit"
            className="btn btn-secondary btn-sm"
            disabled={!newExclusionText.trim()}
            style={{ flexShrink: 0 }}
          >
            <Plus size={15} />
            <span>Agregar</span>
          </button>
        </form>

        {/* Suggested Quick Exclusions Chips */}
        <div style={{ marginTop: '0.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={12} color="var(--primary)" />
            <span>Sugerencias rápidas para agregar con 1 clic:</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {SUGGESTED_EXCLUSIONS.map((suggested, sIdx) => {
              const alreadyAdded = exclusions.includes(suggested);
              return (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => handleAddSuggested(suggested)}
                  disabled={alreadyAdded}
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.25rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: alreadyAdded ? '1px solid var(--border-color)' : '1px solid var(--primary-border)',
                    backgroundColor: alreadyAdded ? 'var(--bg-main)' : 'var(--primary-subtle)',
                    color: alreadyAdded ? 'var(--text-muted)' : 'var(--primary)',
                    cursor: alreadyAdded ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <span>{alreadyAdded ? '✓' : '+'}</span>
                  <span>{suggested}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
