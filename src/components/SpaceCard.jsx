import React, { useState } from 'react';
import { 
  Trash2, 
  Copy, 
  Plus, 
  Ruler, 
  Square, 
  Layers, 
  Paintbrush, 
  DoorClosed, 
  AppWindow, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import { 
  calculateSpaceMetrics, 
  getItemQuantity, 
  calculateItemSubtotal, 
  formatCurrency, 
  formatNumber 
} from '../utils/calculations';
import { WORK_CATEGORIES } from '../types/budget';

export default function SpaceCard({
  space,
  index,
  priceCatalog = [],
  onUpdateSpace,
  onDeleteSpace,
  onDuplicateSpace
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customItemForm, setCustomItemForm] = useState({
    name: '',
    description: '',
    unit: 'm²',
    unitType: 'area_muros_neta',
    unitPrice: 5000,
    quantity: 1
  });

  const metrics = calculateSpaceMetrics(space);

  const handleDimensionChange = (field, value) => {
    const val = value === '' ? '' : parseFloat(value);
    onUpdateSpace({
      ...space,
      [field]: val
    });
  };

  const handleNameChange = (name) => {
    onUpdateSpace({
      ...space,
      name
    });
  };

  // Add an item from catalog to this space
  const handleAddCatalogItem = (catalogItem) => {
    const newItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      catalogId: catalogItem.id,
      name: catalogItem.name,
      category: catalogItem.category,
      unit: catalogItem.unit,
      unitType: catalogItem.unitType,
      unitPrice: catalogItem.unitPrice,
      description: catalogItem.description || '',
      quantity: 1
    };

    const items = [...(space.items || []), newItem];
    onUpdateSpace({
      ...space,
      items
    });
  };

  // Update item inside space
  const handleUpdateItem = (itemId, updates) => {
    const items = (space.items || []).map(item => {
      if (item.id === itemId) {
        return { ...item, ...updates };
      }
      return item;
    });
    onUpdateSpace({ ...space, items });
  };

  // Remove item
  const handleDeleteItem = (itemId) => {
    const items = (space.items || []).filter(item => item.id !== itemId);
    onUpdateSpace({ ...space, items });
  };

  // Add custom item
  const handleSaveCustomItem = (e) => {
    e.preventDefault();
    if (!customItemForm.name.trim()) return;

    const newItem = {
      id: `custom_${Date.now()}`,
      name: customItemForm.name,
      description: customItemForm.description,
      unit: customItemForm.unit,
      unitType: customItemForm.unitType,
      unitPrice: parseFloat(customItemForm.unitPrice) || 0,
      quantity: parseFloat(customItemForm.quantity) || 1
    };

    const items = [...(space.items || []), newItem];
    onUpdateSpace({ ...space, items });
    setShowAddCustomModal(false);
    setCustomItemForm({
      name: '',
      description: '',
      unit: 'm²',
      unitType: 'area_muros_neta',
      unitPrice: 5000,
      quantity: 1
    });
  };

  // Compute space total
  const spaceTotal = (space.items || []).reduce((sum, item) => {
    return sum + calculateItemSubtotal(item, metrics);
  }, 0);

  return (
    <div className="space-card">
      {/* Header */}
      <div className="space-header">
        <div className="space-title-block">
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
            {index + 1}
          </div>
          <input
            type="text"
            className="space-name-input"
            value={space.name || ''}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Nombre del Recinto (ej. Dormitorio Principal)"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="space-subtotal-badge">
            <span className="space-subtotal-label">Subtotal Recinto</span>
            <span className="space-subtotal-amount">{formatCurrency(spaceTotal)}</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onDuplicateSpace(space)}
            title="Duplicar este recinto"
            style={{ padding: '6px 8px' }}
          >
            <Copy size={15} />
          </button>

          <button
            type="button"
            className="btn btn-danger-outline btn-sm"
            onClick={() => onDeleteSpace(space.id)}
            title="Eliminar este recinto"
            style={{ padding: '6px 8px' }}
          >
            <Trash2 size={15} />
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Contraer' : 'Expandir'}
            style={{ padding: '6px 8px' }}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-body">
          {/* Dimensions Controls */}
          <div className="form-grid-4" style={{ alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <Ruler size={13} />
                Largo (m):
              </label>
              <div className="input-with-addon">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  className="form-input"
                  value={space.length ?? ''}
                  onChange={(e) => handleDimensionChange('length', e.target.value)}
                  placeholder="3.50"
                />
                <span className="input-addon">m</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <Ruler size={13} />
                Ancho (m):
              </label>
              <div className="input-with-addon">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  className="form-input"
                  value={space.width ?? ''}
                  onChange={(e) => handleDimensionChange('width', e.target.value)}
                  placeholder="3.00"
                />
                <span className="input-addon">m</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <Maximize2 size={13} />
                Alto / Altura Muro (m):
              </label>
              <div className="input-with-addon">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  className="form-input"
                  value={space.height ?? ''}
                  onChange={(e) => handleDimensionChange('height', e.target.value)}
                  placeholder="2.40"
                />
                <span className="input-addon">m</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Aberturas (Vanos):</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                <div className="input-with-addon" title="Cantidad de Puertas estándar">
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={space.doors ?? 0}
                    onChange={(e) => handleDimensionChange('doors', e.target.value)}
                    placeholder="Ptas"
                  />
                  <span className="input-addon" style={{ padding: '0.55rem 0.4rem' }}>
                    <DoorClosed size={13} />
                  </span>
                </div>
                <div className="input-with-addon" title="Cantidad de Ventanas estándar">
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={space.windows ?? 0}
                    onChange={(e) => handleDimensionChange('windows', e.target.value)}
                    placeholder="Vent"
                  />
                  <span className="input-addon" style={{ padding: '0.55rem 0.4rem' }}>
                    <AppWindow size={13} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Calculated Metrics Badges */}
          <div className="metric-pills-row">
            <div className="metric-pill highlight" title="Área de piso calculada (Largo x Ancho)">
              <Square size={14} color="var(--primary)" />
              <span className="metric-pill-label">Piso:</span>
              <span className="metric-pill-value">{formatNumber(metrics.floorArea)} m²</span>
            </div>

            <div className="metric-pill highlight" title="Área neta de muros a pintar descontando vanos">
              <Paintbrush size={14} color="var(--primary)" />
              <span className="metric-pill-label">Muros Netos:</span>
              <span className="metric-pill-value">{formatNumber(metrics.netWallArea)} m²</span>
            </div>

            <div className="metric-pill" title="Área bruta de muros sin descontar vanos">
              <span className="metric-pill-label">Muros Brutos:</span>
              <span className="metric-pill-value" style={{ color: 'var(--text-secondary)' }}>
                {formatNumber(metrics.grossWallArea)} m²
              </span>
            </div>

            <div className="metric-pill" title="Área de vanos descontados (puertas + ventanas)">
              <span className="metric-pill-label">Desc. Vanos:</span>
              <span className="metric-pill-value" style={{ color: 'var(--danger)' }}>
                -{formatNumber(metrics.openingsArea)} m²
              </span>
            </div>

            <div className="metric-pill" title="Perímetro neto para instalación de guardapolvos / zócalos">
              <Layers size={14} color="var(--purple)" />
              <span className="metric-pill-label">Guardapolvos:</span>
              <span className="metric-pill-value" style={{ color: 'var(--purple)' }}>
                {formatNumber(metrics.skirtingPerimeter)} ml
              </span>
            </div>

            <div className="metric-pill" title="Área de cielo raso">
              <span className="metric-pill-label">Cielo:</span>
              <span className="metric-pill-value" style={{ color: 'var(--cyan)' }}>
                {formatNumber(metrics.ceilingArea)} m²
              </span>
            </div>
          </div>

          {/* Items Section */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Partidas y Trabajos en este Recinto:
              </div>

              {/* Quick Add Catalog Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <select
                  className="form-select"
                  style={{ width: 'auto', fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                  value=""
                  onChange={(e) => {
                    const found = priceCatalog.find(p => p.id === e.target.value);
                    if (found) {
                      handleAddCatalogItem(found);
                    }
                  }}
                >
                  <option value="" disabled>+ Agregar partida del catálogo...</option>
                  {Object.values(WORK_CATEGORIES).map(categoryName => {
                    const categoryItems = priceCatalog.filter(p => p.category === categoryName);
                    if (categoryItems.length === 0) return null;
                    return (
                      <optgroup key={categoryName} label={categoryName}>
                        {categoryItems.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} ({formatCurrency(cat.unitPrice)}/{cat.unit})
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddCustomModal(true)}
                  title="Crear compra de closet, mueble, arreglo o partida libre"
                >
                  <Plus size={14} />
                  <span>+ Partida Libre / Compra / Arreglo</span>
                </button>
              </div>
            </div>

            {/* Table of items */}
            {(!space.items || space.items.length === 0) ? (
              <div style={{
                textAlign: 'center',
                padding: '1.25rem',
                backgroundColor: 'var(--bg-card-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
              }}>
                Aún no has agregado partidas a este espacio. Selecciona arriba pintura, pisos, closets, arreglos o agrega una partida libre.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Descripción del Trabajo / Compra</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>Superficie / Cant.</th>
                      <th style={{ width: '130px', textAlign: 'right' }}>Precio Unitario</th>
                      <th style={{ width: '110px', textAlign: 'right' }}>Subtotal</th>
                      <th style={{ width: '36px', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {space.items.map((item) => {
                      const qty = getItemQuantity(item, metrics);
                      const subtotal = calculateItemSubtotal(item, metrics);
                      const isAutoMetric = item.unitType && item.unitType !== 'manual' && item.unitType !== 'fixed';

                      return (
                        <tr key={item.id}>
                          <td className="item-name-cell">
                            <input
                              type="text"
                              className="form-input"
                              style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', fontWeight: '600' }}
                              value={item.name}
                              onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                            />
                            {item.description && (
                              <div className="item-desc-sub">{item.description}</div>
                            )}
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            {isAutoMetric ? (
                              <span className="item-qty-badge" title="Calculado automáticamente desde las medidas del recinto">
                                {formatNumber(qty)} {item.unit}
                              </span>
                            ) : (
                              <div className="input-with-addon" style={{ maxWidth: 110, margin: '0 auto' }}>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  className="form-input"
                                  style={{ padding: '0.3rem 0.4rem', fontSize: '0.82rem', textAlign: 'center' }}
                                  value={item.quantity ?? 1}
                                  onChange={(e) => handleUpdateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                                />
                                <span className="input-addon" style={{ padding: '0.3rem 0.4rem' }}>{item.unit || 'un'}</span>
                              </div>
                            )}
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div className="input-with-addon" style={{ maxWidth: 130, marginLeft: 'auto' }}>
                              <span className="input-addon" style={{ borderLeft: '1px solid var(--border-color)', borderRight: 'none', borderTopLeftRadius: 'var(--radius-md)', borderBottomLeftRadius: 'var(--radius-md)', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
                                $
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="100"
                                className="form-input"
                                style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', textAlign: 'right', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                value={item.unitPrice ?? 0}
                                onChange={(e) => handleUpdateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                              />
                            </div>
                          </td>

                          <td className="item-subtotal-val">
                            {formatCurrency(subtotal)}
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '4px', color: 'var(--text-muted)' }}
                              onClick={() => handleDeleteItem(item.id)}
                              title="Eliminar partida"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal to add Custom Item / Closets / Repairs */}
      {showAddCustomModal && (
        <div className="modal-overlay" onClick={() => setShowAddCustomModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Sparkles size={18} color="var(--primary)" />
                <span>Agregar Partida, Compra o Arreglo</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowAddCustomModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomItem}>
              <div className="modal-body">
                {/* Fast Templates Chips */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                    Plantillas Rápidas:
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="preset-chip"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      onClick={() => setCustomItemForm({
                        name: 'Fabricación e Instalación de Closet a Medida',
                        description: 'Melamina 18mm, repisas, cajones y barra de colgar',
                        unit: 'un',
                        unitType: 'fixed',
                        unitPrice: 220000,
                        quantity: 1
                      })}
                    >
                      🗄️ Closet a Medida
                    </button>

                    <button
                      type="button"
                      className="preset-chip"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      onClick={() => setCustomItemForm({
                        name: 'Compra / Suministro de Materiales Especiales',
                        description: 'Compra según boleta/factura de respaldo',
                        unit: 'global',
                        unitType: 'fixed',
                        unitPrice: 50000,
                        quantity: 1
                      })}
                    >
                      📦 Compra Material
                    </button>

                    <button
                      type="button"
                      className="preset-chip"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      onClick={() => setCustomItemForm({
                        name: 'Arreglo / Reparación de...',
                        description: 'Mano de obra especializada y ajustes',
                        unit: 'global',
                        unitType: 'fixed',
                        unitPrice: 35000,
                        quantity: 1
                      })}
                    >
                      🔧 Arreglo de...
                    </button>

                    <button
                      type="button"
                      className="preset-chip"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      onClick={() => setCustomItemForm({
                        name: 'Arreglo / Cambio de Grifería o Gasfitería',
                        description: 'Instalación y prueba de hermeticidad',
                        unit: 'un',
                        unitType: 'fixed',
                        unitPrice: 25000,
                        quantity: 1
                      })}
                    >
                      💧 Gasfitería
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre del Trabajo / Compra / Arreglo:</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ej. Fabricación de Closet / Arreglo de ventana / Compra de grifería"
                    value={customItemForm.name}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detalle / Especificación (opcional):</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Melamina 18mm blanca, 2 cajoneras, tiradores metálicos..."
                    value={customItemForm.description}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, description: e.target.value })}
                  />
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">Tipo de Cálculo:</label>
                    <select
                      className="form-select"
                      value={customItemForm.unitType}
                      onChange={(e) => {
                        const val = e.target.value;
                        let unit = 'un';
                        if (val === 'area_muros_neta' || val === 'area_piso' || val === 'area_cielo') unit = 'm²';
                        if (val === 'perimetro_neto' || val === 'perimetro_bruto') unit = 'ml';
                        if (val === 'fixed' || val === 'manual') unit = 'un';
                        setCustomItemForm({ ...customItemForm, unitType: val, unit });
                      }}
                    >
                      <option value="fixed">Cantidad Fija (Unidad, Global, Punto)</option>
                      <option value="area_muros_neta">Por m² Muros Netos ({formatNumber(metrics.netWallArea)} m²)</option>
                      <option value="area_piso">Por m² Piso ({formatNumber(metrics.floorArea)} m²)</option>
                      <option value="area_cielo">Por m² Cielo ({formatNumber(metrics.ceilingArea)} m²)</option>
                      <option value="perimetro_neto">Por Metro Lineal ({formatNumber(metrics.skirtingPerimeter)} ml)</option>
                    </select>
                  </div>

                  {customItemForm.unitType === 'fixed' ? (
                    <div className="form-group">
                      <label className="form-label">Cantidad y Unidad:</label>
                      <div className="input-with-addon">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          className="form-input"
                          value={customItemForm.quantity}
                          onChange={(e) => setCustomItemForm({ ...customItemForm, quantity: e.target.value })}
                        />
                        <select
                          className="input-addon"
                          style={{ border: '1px solid var(--border-color)', borderLeft: 'none', background: 'var(--bg-card-subtle)', cursor: 'pointer' }}
                          value={customItemForm.unit}
                          onChange={(e) => setCustomItemForm({ ...customItemForm, unit: e.target.value })}
                        >
                          <option value="un">un</option>
                          <option value="global">global</option>
                          <option value="ml">ml</option>
                          <option value="m²">m²</option>
                          <option value="pto">pto</option>
                          <option value="jgo">jgo</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Unidad:</label>
                      <input
                        type="text"
                        disabled
                        className="form-input"
                        value={customItemForm.unit}
                        style={{ backgroundColor: 'var(--bg-card-subtle)' }}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Precio Unitario ($):</label>
                    <div className="input-with-addon">
                      <span className="input-addon" style={{ borderRight: 'none', borderTopRightRadius: 0, borderBottomRightRadius: 0, borderLeft: '1px solid var(--border-color)', borderTopLeftRadius: 'var(--radius-md)', borderBottomLeftRadius: 'var(--radius-md)' }}>$</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        required
                        className="form-input"
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                        value={customItemForm.unitPrice}
                        onChange={(e) => setCustomItemForm({ ...customItemForm, unitPrice: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddCustomModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Agregar a {space.name}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
