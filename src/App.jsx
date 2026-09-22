import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import ClientInfoForm from './components/ClientInfoForm';
import SpaceList from './components/SpaceList';
import ExclusionsEditor from './components/ExclusionsEditor';
import BudgetSummary from './components/BudgetSummary';
import ContractorModal from './components/ContractorModal';
import QuickPricesModal from './components/QuickPricesModal';
import SavedBudgetsModal from './components/SavedBudgetsModal';
import PdfPreviewModal from './components/PdfPreviewModal';

import {
  loadContractorProfile,
  saveContractorProfile,
  loadPriceCatalog,
  savePriceCatalog,
  loadCurrentBudget,
  saveCurrentBudget,
  getSavedBudgetsList,
  saveBudgetToHistory,
  deleteBudgetFromHistory,
  getInitialSpaces,
  getCleanStarterBudget,
  saveBudgetAutoBackup
} from './utils/storage';
import { calculateBudgetFinancials } from './utils/calculations';
import { generateBudgetPDF } from './utils/pdfGenerator';
import { DEFAULT_CLIENT, DEFAULT_EXCLUSIONS } from './types/budget';
import { RECOVERED_PROJECT } from './utils/recoveredProject';
import { PlusCircle } from 'lucide-react';

export default function App() {
  // Load initial states from LocalStorage
  const initialBudget = useMemo(() => loadCurrentBudget(), []);
  
  const [client, setClient] = useState(initialBudget.client || DEFAULT_CLIENT);
  const [spaces, setSpaces] = useState(initialBudget.spaces || getInitialSpaces());
  const [exclusions, setExclusions] = useState(initialBudget.exclusions || DEFAULT_EXCLUSIONS);
  const [financialSettings, setFinancialSettings] = useState(
    initialBudget.financialSettings || {
      overheadPercent: 10,
      discountPercent: 0,
      applyTax: false,
      taxRate: 19
    }
  );
  const [notes, setNotes] = useState(initialBudget.notes || '');

  // Persistent Global Settings
  const [contractor, setContractor] = useState(() => loadContractorProfile());
  const [priceCatalog, setPriceCatalog] = useState(() => loadPriceCatalog());
  const [savedBudgets, setSavedBudgets] = useState(() => getSavedBudgetsList());

  // Toast feedback state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3200);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Modal Visibilities
  const [showContractorModal, setShowContractorModal] = useState(false);
  const [showPricesModal, setShowPricesModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false);
  const [showNewBudgetModal, setShowNewBudgetModal] = useState(false);

  // Lock background body scroll when any modal is open
  const isAnyModalOpen = showContractorModal || showPricesModal || showSavedModal || showPdfPreviewModal || showNewBudgetModal;
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  // Financial calculations
  const financials = useMemo(() => {
    return calculateBudgetFinancials(spaces, financialSettings);
  }, [spaces, financialSettings]);

  // Combined full budget object
  const currentBudgetData = useMemo(() => {
    return {
      client,
      spaces,
      exclusions,
      financialSettings,
      financials,
      notes
    };
  }, [client, spaces, exclusions, financialSettings, financials, notes]);

  // Auto-save draft on changes
  useEffect(() => {
    saveCurrentBudget(currentBudgetData);
  }, [currentBudgetData]);

  // Sync latest catalog additions
  useEffect(() => {
    setPriceCatalog(loadPriceCatalog());
  }, []);

  // Handlers for Spaces
  const handleAddSpacePreset = (preset) => {
    let defaultItems = [];

    if (preset.id.includes('calefont')) {
      const getItem = (catId, fallbackName, unit, unitType, fallbackPrice, fallbackDesc) => {
        const found = priceCatalog.find(p => p.id === catId);
        return {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
          catalogId: catId,
          name: found ? found.name : fallbackName,
          category: found ? found.category : 'Calefont, Gas y Gasfitería',
          unit: found ? found.unit : unit,
          unitType: found ? found.unitType : unitType,
          unitPrice: found ? found.unitPrice : fallbackPrice,
          description: found ? found.description : fallbackDesc,
          quantity: 1
        };
      };

      defaultItems = [
        getItem('desmontaje_calefont', 'Desmontaje Seguro de Calefont Existente', 'un', 'fixed', 25000, 'Desconexión de redes de agua y gas con corte preventivo, retiro de anclajes y sellado.'),
        getItem('extension_gas_cobre', 'Extensión de Red de Gas en Cobre Tipo L', 'global', 'fixed', 65000, 'Trazado en tubería cobre, uniones en soldadura fuerte (plata), llave de paso de corte certificada y abrazaderas normadas.'),
        getItem('extension_agua_fria_caliente', 'Extensión de Redes de Agua Fría y Caliente (PPR / Cobre)', 'global', 'fixed', 55000, 'Canalización en tubería PPR termofusión o cobre, llaves de paso de corte angulares y terminales con hilo.'),
        getItem('montaje_calefont_conexion', 'Montaje, Fijación y Conexión de Calefont en Nueva Ubicación', 'un', 'fixed', 42000, 'Fijación sólida a plomo en muro, instalación de flexibles certificados de agua y gas, y sellado antivibración.'),
        getItem('ducto_evacuacion_calefont', 'Instalación de Ducto de Evacuación de Gases y Sombrerete', 'un', 'fixed', 35000, 'Instalación de tubo de evacuación de gases al exterior (tiro natural o forzado), sombrerete y sellado perimetral contra intemperie.'),
        getItem('punto_enchufe_calefont', 'Circuito y Enchufe Dedicado para Calefont (Tiro Forzado/Ionizado)', 'pto', 'fixed', 28000, 'Canalización conduit/legrand, cableado EVA 2.5mm² libre de halógeno con tierra de protección y caja de enchufe certificada.'),
        getItem('renovacion_puntos_electricos', 'Renovación / Reemplazo de Puntos Eléctricos (Enchufes / Interruptores)', 'pto', 'fixed', 18000, 'Retiro de módulos antiguos, revisión de continuidad/fase/neutro y montaje de nuevas placas y módulos normalizados.'),
        getItem('adecuacion_tablero_tda', 'Instalación de Disyuntor Automático y Diferencial en Tablero (TDA)', 'global', 'fixed', 38000, 'Montaje en riel DIN de interruptor termomagnético (10A/16A) y protector diferencial 25A 30mA certificado SEC.'),
        getItem('picado_regatas_muro', 'Picado y Regatas en Muro para Embutir Tuberías', 'global', 'fixed', 32000, 'Ranurado en albañilería o tabiquería para embutir redes de agua, gas y canalizaciones eléctricas.'),
        getItem('tapado_regatas_enlucido', 'Tapado de Regatas con Mortero, Yeso y Enlucido de Parches', 'global', 'fixed', 28000, 'Relleno de mortero de pega, puente de adherencia y empaste liso listo para recibir acabado de pintura.'),
        getItem('prueba_hermeticidad_gas', 'Prueba de Hermeticidad, Detección de Fugas y Puesta en Marcha', 'global', 'fixed', 25000, 'Verificación manométrica/agua jabonosa de estanqueidad en circuito de gas, purga de cañerías y regulación de llama.')
      ];
    } else {
      defaultItems = [
        {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
          name: 'Pintura Látex/Esmalte al Agua en Muros (2 Manos)',
          unit: 'm²',
          unitType: 'area_muros_neta',
          unitPrice: priceCatalog.find(p => p.id === 'pintura_muros_latex')?.unitPrice || 4500,
          description: 'Preparación de superficie y 2 manos de pintura'
        }
      ];

      if (preset.id.includes('bano') || preset.id.includes('cocina')) {
        defaultItems.push({
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
          name: 'Instalación de Cerámica / Baldosín en Piso',
          unit: 'm²',
          unitType: 'area_piso',
          unitPrice: priceCatalog.find(p => p.id === 'piso_ceramica')?.unitPrice || 11000,
          description: 'Nivelación previa, adhesivo cerámico, fraguado y limpieza'
        });
      } else {
        defaultItems.push({
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
          name: 'Instalación de Piso Flotante / Laminado + Espuma',
          unit: 'm²',
          unitType: 'area_piso',
          unitPrice: priceCatalog.find(p => p.id === 'piso_flotante')?.unitPrice || 6500,
          description: 'Colocación de polietileno/espuma e instalación machihembrada'
        });
        defaultItems.push({
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
          name: 'Instalación de Guardapolvos / Zócalos',
          unit: 'ml',
          unitType: 'perimetro_neto',
          unitPrice: priceCatalog.find(p => p.id === 'guardapolvos')?.unitPrice || 2800,
          description: 'Corte inglete, fijación y sellado superior'
        });
      }
    }

    const newSpace = {
      id: `space_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      name: preset.name,
      length: preset.defaultLength,
      width: preset.defaultWidth,
      height: preset.defaultHeight,
      doors: preset.defaultDoors,
      windows: preset.defaultWindows,
      customOpeningArea: 0,
      items: defaultItems
    };

    setSpaces(prev => [...prev, newSpace]);
    showToast(`Recinto "${preset.name}" agregado con éxito`, 'success');
  };

  const handleAddCustomSpace = () => {
    setSpaces(prev => {
      const spaceNumber = prev.length + 1;
      const newSpace = {
        id: `space_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
        name: `Espacio / Recinto ${spaceNumber}`,
        length: 3.0,
        width: 3.0,
        height: 2.4,
        doors: 1,
        windows: 1,
        customOpeningArea: 0,
        items: [
          {
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
            name: 'Pintura Látex/Esmalte al Agua en Muros (2 Manos)',
            unit: 'm²',
            unitType: 'area_muros_neta',
            unitPrice: priceCatalog.find(p => p.id === 'pintura_muros_latex')?.unitPrice || 4500,
            description: 'Preparación de muros y 2 manos'
          }
        ]
      };
      return [...prev, newSpace];
    });
    showToast('Espacio libre agregado', 'success');
  };

  const handleUpdateSpace = (updatedSpace) => {
    setSpaces(prev => prev.map(s => s.id === updatedSpace.id ? updatedSpace : s));
  };

  const handleDeleteSpace = (spaceId) => {
    setSpaces(prev => prev.filter(s => String(s.id) !== String(spaceId)));
    showToast('Recinto eliminado', 'info');
  };

  const handleDuplicateSpace = (spaceToCopy) => {
    const duplicated = {
      ...spaceToCopy,
      id: `space_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      name: `${spaceToCopy.name} (Copia)`,
      items: (spaceToCopy.items || []).map(item => ({
        ...item,
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`
      }))
    };
    setSpaces(prev => [...prev, duplicated]);
    showToast(`Recinto "${spaceToCopy.name}" duplicado con éxito`, 'success');
  };

  const handleMoveSpace = (spaceId, direction) => {
    setSpaces(prev => {
      const index = prev.findIndex(s => s.id === spaceId);
      if (index === -1) return prev;
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const newSpaces = [...prev];
      const temp = newSpaces[index];
      newSpaces[index] = newSpaces[targetIndex];
      newSpaces[targetIndex] = temp;
      return newSpaces;
    });
    showToast('Orden de recintos actualizado', 'info');
  };

  const handleReorderSpaces = (reorderedSpaces) => {
    setSpaces(reorderedSpaces);
    showToast('Lista de recintos reordenada', 'info');
  };

  // Actions
  const handleNewBudget = () => {
    const hasData = spaces.length > 0 || client.name?.trim() || client.address?.trim();
    if (hasData) {
      setShowNewBudgetModal(true);
    } else {
      handleConfirmNewBudget();
    }
  };

  const handleConfirmNewBudget = () => {
    saveBudgetAutoBackup(currentBudgetData);
    const fresh = getCleanStarterBudget();
    setClient(fresh.client);
    setSpaces(fresh.spaces);
    setExclusions(fresh.exclusions || DEFAULT_EXCLUSIONS);
    setFinancialSettings(fresh.financialSettings);
    setNotes(fresh.notes);
    setShowNewBudgetModal(false);
    showToast('Nuevo presupuesto en blanco iniciado', 'info');
  };

  const handleSaveBudget = () => {
    const saved = saveBudgetToHistory(currentBudgetData);
    setSavedBudgets(getSavedBudgetsList());
    showToast(`¡Presupuesto ${client.quoteNumber} guardado con éxito!`, 'success');
  };

  const handleLoadBudget = (savedBudget) => {
    setClient(savedBudget.client || DEFAULT_CLIENT);
    setSpaces(savedBudget.spaces || []);
    setExclusions(savedBudget.exclusions || DEFAULT_EXCLUSIONS);
    setFinancialSettings(savedBudget.financialSettings || {
      overheadPercent: 10,
      discountPercent: 0,
      applyTax: false,
      taxRate: 19
    });
    setNotes(savedBudget.notes || '');
    showToast(`Presupuesto "${savedBudget.client?.quoteNumber || ''}" cargado`, 'success');
  };

  const handleDeleteBudget = (id) => {
    if (window.confirm('¿Eliminar este presupuesto del historial?')) {
      const updated = deleteBudgetFromHistory(id);
      setSavedBudgets(updated);
      showToast('Presupuesto eliminado del historial', 'info');
    }
  };

  const handleRestoreFullBackup = (backup) => {
    if (backup.savedBudgets) {
      localStorage.setItem('pom_saved_budgets_list', JSON.stringify(backup.savedBudgets));
      setSavedBudgets(backup.savedBudgets);
    }
    if (backup.contractorProfile) {
      saveContractorProfile(backup.contractorProfile);
      setContractor(backup.contractorProfile);
    }
    if (backup.priceCatalog) {
      savePriceCatalog(backup.priceCatalog);
      setPriceCatalog(backup.priceCatalog);
    }
    if (backup.currentBudget) {
      handleLoadBudget(backup.currentBudget);
    }
    showToast('¡Respaldo completo restaurado con éxito!', 'success');
  };

  const handleSaveContractor = (updatedProfile) => {
    saveContractorProfile(updatedProfile);
    setContractor(updatedProfile);
    showToast('Datos de la empresa guardados con éxito', 'success');
  };

  const handleSaveCatalog = (updatedCatalog) => {
    savePriceCatalog(updatedCatalog);
    setPriceCatalog(updatedCatalog);
    showToast('Tarifas base actualizadas con éxito', 'success');
  };

  const [pdfPreviewMode, setPdfPreviewMode] = useState('minimal'); // 'minimal' or 'detailed'

  const handleDirectDownloadPdf = (mode = 'minimal') => {
    if (spaces.length === 0) {
      alert('Agrega al menos un recinto antes de exportar el PDF.');
      return;
    }
    generateBudgetPDF(currentBudgetData, contractor, { mode, download: true });
  };

  const handleOpenPdfPreview = (mode = 'minimal') => {
    setPdfPreviewMode(mode);
    setShowPdfPreviewModal(true);
  };

  return (
    <div className="app-container">
      <Header
        onNewBudget={handleNewBudget}
        onOpenContractorModal={() => setShowContractorModal(true)}
        onOpenPricesModal={() => setShowPricesModal(true)}
        onOpenSavedModal={() => setShowSavedModal(true)}
        onOpenPdfPreview={() => handleOpenPdfPreview('minimal')}
        onDirectDownloadPdf={handleDirectDownloadPdf}
        spacesCount={spaces.length}
      />

      {client.name !== 'María Luz Camus Romo' && (
        <div style={{
          maxWidth: '1480px',
          margin: '0.75rem auto 0 auto',
          padding: '0.65rem 1.25rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📋</span>
            <div>
              <strong style={{ color: '#1e40af', fontSize: '0.88rem' }}>
                Presupuesto recuperado disponible: María Luz Camus Romo (11 recintos, Providencia)
              </strong>
              <div style={{ fontSize: '0.76rem', color: '#3b82f6' }}>
                GENERAL, Living / Comedor, Pasillo, Cocina, Baños, Dormitorios, Logia
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleLoadBudget(RECOVERED_PROJECT)}
            style={{ fontWeight: '600' }}
          >
            Cargar presupuesto de María Luz en pantalla
          </button>
        </div>
      )}

      <main className="main-content">
        <div className="budget-grid-layout">
          {/* Main Column */}
          <div>
            <ClientInfoForm
              client={client}
              onChange={setClient}
            />

            <SpaceList
              spaces={spaces}
              priceCatalog={priceCatalog}
              onAddSpacePreset={handleAddSpacePreset}
              onAddCustomSpace={handleAddCustomSpace}
              onUpdateSpace={handleUpdateSpace}
              onDeleteSpace={handleDeleteSpace}
              onDuplicateSpace={handleDuplicateSpace}
              onMoveSpace={handleMoveSpace}
              onReorderSpaces={handleReorderSpaces}
            />

            <ExclusionsEditor
              exclusions={exclusions}
              onChange={setExclusions}
            />
          </div>

          {/* Sidebar Column */}
          <div>
            <BudgetSummary
              financials={financials}
              financialSettings={financialSettings}
              notes={notes}
              onUpdateFinancialSettings={setFinancialSettings}
              onUpdateNotes={setNotes}
              onSaveBudget={handleSaveBudget}
              onOpenPdfPreview={() => handleOpenPdfPreview('minimal')}
              onDownloadPdf={handleDirectDownloadPdf}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      {showContractorModal && (
        <ContractorModal
          contractor={contractor}
          onSave={handleSaveContractor}
          onClose={() => setShowContractorModal(false)}
        />
      )}

      {showPricesModal && (
        <QuickPricesModal
          catalog={priceCatalog}
          onSaveCatalog={handleSaveCatalog}
          onClose={() => setShowPricesModal(false)}
        />
      )}

      {showSavedModal && (
        <SavedBudgetsModal
          budgets={savedBudgets}
          currentBudget={currentBudgetData}
          onLoadBudget={handleLoadBudget}
          onDeleteBudget={handleDeleteBudget}
          onRestoreFullBackup={handleRestoreFullBackup}
          onClose={() => setShowSavedModal(false)}
        />
      )}

      {showPdfPreviewModal && (
        <PdfPreviewModal
          budgetData={currentBudgetData}
          contractorData={contractor}
          initialMode={pdfPreviewMode}
          onClose={() => setShowPdfPreviewModal(false)}
        />
      )}

      {/* Confirmation Modal for New Budget */}
      {showNewBudgetModal && (
        <div className="modal-overlay" onClick={() => setShowNewBudgetModal(false)}>
          <div className="modal-card" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <PlusCircle size={20} color="var(--primary)" />
                <span>Nuevo Presupuesto</span>
              </div>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                onClick={() => setShowNewBudgetModal(false)}
                title="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '1.75rem 1.5rem' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <PlusCircle size={28} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.6rem' }}>
                ¿Iniciar presupuesto en blanco?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Se limpiará el formulario para comenzar un nuevo proyecto. Tu presupuesto actual (<strong>{client.quoteNumber || 'actual'}</strong>) quedará respaldado automáticamente.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleConfirmNewBudget}
                >
                  <PlusCircle size={16} />
                  <span>Sí, iniciar en blanco</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setShowNewBudgetModal(false)}
                >
                  Cancelar y seguir aquí
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button 
            type="button" 
            onClick={() => setToast(null)}
            className="toast-close-btn"
            title="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
