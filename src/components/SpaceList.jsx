import React, { useState } from 'react';
import { Plus, Home, Sparkles, Building2, Flame, ArrowUpDown, ArrowUp, ArrowDown, X, Check } from 'lucide-react';
import SpaceCard from './SpaceCard';
import { SPACE_PRESETS } from '../types/budget';

export default function SpaceList({
  spaces = [],
  priceCatalog = [],
  onAddSpacePreset,
  onAddCustomSpace,
  onUpdateSpace,
  onDeleteSpace,
  onDuplicateSpace,
  onMoveSpace,
  onReorderSpaces
}) {
  const [showReorderModal, setShowReorderModal] = useState(false);

  return (
    <div>
      {/* Quick Add Presets Bar */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span>Agregar Recintos Rápido:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            {spaces.length > 1 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowReorderModal(true)}
                title="Ver lista y reordenar la secuencia de todos los recintos"
                style={{ fontWeight: 600 }}
              >
                <ArrowUpDown size={14} color="var(--primary)" />
                <span>Reordenar Lista ({spaces.length})</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onAddCustomSpace}
            >
              <Plus size={15} />
              <span>+ Nuevo Espacio Libre</span>
            </button>
          </div>
        </div>

        <div className="presets-bar">
          {SPACE_PRESETS.map((preset) => {
            const isCalefont = preset.id.includes('calefont');
            return (
              <button
                key={preset.id}
                type="button"
                className="preset-chip"
                style={isCalefont ? {
                  borderColor: '#f97316',
                  backgroundColor: 'rgba(249, 115, 22, 0.1)',
                  color: '#ea580c',
                  fontWeight: '700',
                  boxShadow: '0 1px 3px rgba(249, 115, 22, 0.2)'
                } : undefined}
                onClick={() => onAddSpacePreset(preset)}
                title={`Agregar ${preset.name} con partidas técnicas automáticas`}
              >
                {isCalefont ? <Flame size={14} color="#ea580c" /> : <Plus size={13} />}
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List of Spaces */}
      {spaces.length === 0 ? (
        <div className="empty-state">
          <Building2 className="empty-icon" />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No hay recintos agregados al presupuesto
          </h3>
          <p style={{ fontSize: '0.85rem', maxWidth: 450, margin: '0 auto 1.25rem auto' }}>
            Comienza haciendo clic en cualquiera de los botones de arriba (Dormitorio, Living, Baño, etc.) para empezar a ingresar medidas y calcular presupuestos.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAddCustomSpace}
          >
            <Plus size={16} />
            <span>Agregar Primer Espacio</span>
          </button>
        </div>
      ) : (
        spaces.map((space, index) => (
          <SpaceCard
            key={space.id}
            space={space}
            index={index}
            totalSpaces={spaces.length}
            isFirst={index === 0}
            isLast={index === spaces.length - 1}
            priceCatalog={priceCatalog}
            onUpdateSpace={onUpdateSpace}
            onDeleteSpace={onDeleteSpace}
            onDuplicateSpace={onDuplicateSpace}
            onMoveSpace={onMoveSpace}
          />
        ))
      )}

      {/* Modal to Reorder Spaces Overview */}
      {showReorderModal && (
        <div className="modal-overlay" onClick={() => setShowReorderModal(false)}>
          <div className="modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <ArrowUpDown size={18} color="var(--primary)" />
                <span>Reordenar Secuencia de Recintos</span>
              </div>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                onClick={() => setShowReorderModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                Usa las flechas para subir o bajar cada recinto. El orden aquí definido es el orden exacto en que aparecerán los recintos en la pantalla, en el PDF Minimalista, en el PDF Detallado y en WhatsApp.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {spaces.map((sp, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === spaces.length - 1;
                  return (
                    <div
                      key={sp.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary-subtle)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.85rem'
                        }}>
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                            {sp.name || `Recinto ${idx + 1}`}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {sp.items?.length || 0} partida(s) • {sp.length || 0}x{sp.width || 0}m
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={isFirst}
                          onClick={() => onMoveSpace && onMoveSpace(sp.id, -1)}
                          title={isFirst ? 'Ya está al inicio' : 'Subir recinto'}
                          style={{ padding: '0.35rem 0.55rem', opacity: isFirst ? 0.3 : 1 }}
                        >
                          <ArrowUp size={15} />
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={isLast}
                          onClick={() => onMoveSpace && onMoveSpace(sp.id, 1)}
                          title={isLast ? 'Ya está al final' : 'Bajar recinto'}
                          style={{ padding: '0.35rem 0.55rem', opacity: isLast ? 0.3 : 1 }}
                        >
                          <ArrowDown size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowReorderModal(false)}
                style={{ minWidth: 100 }}
              >
                <Check size={16} />
                <span>Listo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
