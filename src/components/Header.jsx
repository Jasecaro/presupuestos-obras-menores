import React from 'react';
import { Hammer, FileText, Settings, FolderOpen, PlusCircle, DollarSign, Download } from 'lucide-react';

export default function Header({
  onNewBudget,
  onOpenContractorModal,
  onOpenPricesModal,
  onOpenSavedModal,
  onOpenPdfPreview,
  onDirectDownloadPdf,
  spacesCount = 0
}) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-area">
          <div className="brand-icon">
            <Hammer size={24} />
          </div>
          <div>
            <h1 className="brand-title">Presupuestos Obras Menores</h1>
            <p className="brand-subtitle">Cálculo de superficies por m², recintos y generador de PDF</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onNewBudget}
            title="Iniciar un nuevo presupuesto en blanco"
          >
            <PlusCircle size={16} />
            <span>Nuevo</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenSavedModal}
            title="Ver presupuestos guardados"
          >
            <FolderOpen size={16} />
            <span>Guardados</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenPricesModal}
            title="Ajustar precios unitarios base $/m²"
          >
            <DollarSign size={16} />
            <span>Precios $/m²</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenContractorModal}
            title="Datos de tu empresa y condiciones"
          >
            <Settings size={16} />
            <span>Mi Empresa</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenPdfPreview}
            title="Ver vista previa del PDF"
          >
            <FileText size={16} />
            <span>Vista Previa</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onDirectDownloadPdf}
            title="Descargar presupuesto oficial en PDF"
          >
            <Download size={16} />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
}
