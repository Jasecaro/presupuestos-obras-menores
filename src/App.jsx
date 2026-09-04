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
  getCleanStarterBudget
} from './utils/storage';
import { calculateBudgetFinancials } from './utils/calculations';
import { generateBudgetPDF } from './utils/pdfGenerator';
import { DEFAULT_CLIENT, DEFAULT_EXCLUSIONS } from './types/budget';

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

  // Modal Visibilities
  const [showContractorModal, setShowContractorModal] = useState(false);
  const [showPricesModal, setShowPricesModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false);

  // Lock background body scroll when any modal is open
  const isAnyModalOpen = showContractorModal || showPricesModal || showSavedModal || showPdfPreviewModal;
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

  // Handlers for Spaces
  const handleAddSpacePreset = (preset) => {
    // Generate default basic work items based on room type
    const defaultItems = [
      {
        id: `item_${Date.now()}_1`,
        name: 'Pintura Látex/Esmalte al Agua en Muros (2 Manos)',
        unit: 'm²',
        unitType: 'area_muros_neta',
        unitPrice: priceCatalog.find(p => p.id === 'pintura_muros_latex')?.unitPrice || 4500,
        description: 'Preparación de superficie y 2 manos de pintura'
      }
    ];

    if (preset.id.includes('bano') || preset.id.includes('cocina')) {
      defaultItems.push({
        id: `item_${Date.now()}_2`,
        name: 'Instalación de Cerámica / Baldosín en Piso',
        unit: 'm²',
        unitType: 'area_piso',
        unitPrice: priceCatalog.find(p => p.id === 'piso_ceramica')?.unitPrice || 11000,
        description: 'Nivelación previa, adhesivo cerámico, fraguado y limpieza'
      });
    } else {
      defaultItems.push({
        id: `item_${Date.now()}_2`,
        name: 'Instalación de Piso Flotante / Laminado + Espuma',
        unit: 'm²',
        unitType: 'area_piso',
        unitPrice: priceCatalog.find(p => p.id === 'piso_flotante')?.unitPrice || 6500,
        description: 'Colocación de polietileno/espuma e instalación machihembrada'
      });
      defaultItems.push({
        id: `item_${Date.now()}_3`,
        name: 'Instalación de Guardapolvos / Zócalos',
        unit: 'ml',
        unitType: 'perimetro_neto',
        unitPrice: priceCatalog.find(p => p.id === 'guardapolvos')?.unitPrice || 2800,
        description: 'Corte inglete, fijación y sellado superior'
      });
    }

    const newSpace = {
      id: `space_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: preset.name,
      length: preset.defaultLength,
      width: preset.defaultWidth,
      height: preset.defaultHeight,
      doors: preset.defaultDoors,
      windows: preset.defaultWindows,
      customOpeningArea: 0,
      items: defaultItems
    };

    setSpaces([...spaces, newSpace]);
  };

  const handleAddCustomSpace = () => {
    const spaceNumber = spaces.length + 1;
    const newSpace = {
      id: `space_${Date.now()}`,
      name: `Espacio / Recinto ${spaceNumber}`,
      length: 3.0,
      width: 3.0,
      height: 2.4,
      doors: 1,
      windows: 1,
      customOpeningArea: 0,
      items: [
        {
          id: `item_${Date.now()}_1`,
          name: 'Pintura Látex/Esmalte al Agua en Muros (2 Manos)',
          unit: 'm²',
          unitType: 'area_muros_neta',
          unitPrice: priceCatalog.find(p => p.id === 'pintura_muros_latex')?.unitPrice || 4500,
          description: 'Preparación de muros y 2 manos'
        }
      ]
    };
    setSpaces([...spaces, newSpace]);
  };

  const handleUpdateSpace = (updatedSpace) => {
    setSpaces(spaces.map(s => s.id === updatedSpace.id ? updatedSpace : s));
  };

  const handleDeleteSpace = (spaceId) => {
    if (window.confirm('¿Estás seguro de eliminar este recinto y todas sus partidas?')) {
      setSpaces(spaces.filter(s => s.id !== spaceId));
    }
  };

  const handleDuplicateSpace = (spaceToCopy) => {
    const duplicated = {
      ...spaceToCopy,
      id: `space_${Date.now()}`,
      name: `${spaceToCopy.name} (Copia)`,
      items: (spaceToCopy.items || []).map(item => ({
        ...item,
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
      }))
    };
    setSpaces([...spaces, duplicated]);
  };

  // Actions
  const handleNewBudget = () => {
    const fresh = getCleanStarterBudget();
    setClient(fresh.client);
    setSpaces(fresh.spaces);
    setExclusions(fresh.exclusions || DEFAULT_EXCLUSIONS);
    setFinancialSettings(fresh.financialSettings);
    setNotes(fresh.notes);
  };

  const handleSaveBudget = () => {
    const saved = saveBudgetToHistory(currentBudgetData);
    setSavedBudgets(getSavedBudgetsList());
    alert(`¡Presupuesto ${client.quoteNumber} para ${client.name || 'el cliente'} guardado con éxito en el historial!`);
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
  };

  const handleDeleteBudget = (id) => {
    if (window.confirm('¿Eliminar este presupuesto del historial?')) {
      const updated = deleteBudgetFromHistory(id);
      setSavedBudgets(updated);
    }
  };

  const handleSaveContractor = (updatedProfile) => {
    saveContractorProfile(updatedProfile);
    setContractor(updatedProfile);
  };

  const handleSaveCatalog = (updatedCatalog) => {
    savePriceCatalog(updatedCatalog);
    setPriceCatalog(updatedCatalog);
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
          onLoadBudget={handleLoadBudget}
          onDeleteBudget={handleDeleteBudget}
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
    </div>
  );
}
