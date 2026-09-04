import React from 'react';
import { Plus, Home, Sparkles, Building2 } from 'lucide-react';
import SpaceCard from './SpaceCard';
import { SPACE_PRESETS } from '../types/budget';

export default function SpaceList({
  spaces = [],
  priceCatalog = [],
  onAddSpacePreset,
  onAddCustomSpace,
  onUpdateSpace,
  onDeleteSpace,
  onDuplicateSpace
}) {
  return (
    <div>
      {/* Quick Add Presets Bar */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span>Agregar Recintos Rápido:</span>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onAddCustomSpace}
          >
            <Plus size={15} />
            <span>+ Nuevo Espacio Libre</span>
          </button>
        </div>

        <div className="presets-bar">
          {SPACE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="preset-chip"
              onClick={() => onAddSpacePreset(preset)}
              title={`Agregar ${preset.name} (${preset.defaultLength}x${preset.defaultWidth}m)`}
            >
              <Plus size={13} />
              <span>{preset.name}</span>
            </button>
          ))}
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
            priceCatalog={priceCatalog}
            onUpdateSpace={onUpdateSpace}
            onDeleteSpace={onDeleteSpace}
            onDuplicateSpace={onDuplicateSpace}
          />
        ))
      )}
    </div>
  );
}
