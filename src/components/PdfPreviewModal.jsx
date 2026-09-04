import React, { useEffect, useState } from 'react';
import { FileText, Download, X, Loader2 } from 'lucide-react';
import { generateBudgetPDF } from '../utils/pdfGenerator';

export default function PdfPreviewModal({ budgetData, contractorData, onClose }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = null;
    try {
      url = generateBudgetPDF(budgetData, contractorData, { returnBlobUrl: true, download: false });
      setPdfUrl(url);
      setLoading(false);
    } catch (e) {
      console.error('Error generating PDF preview', e);
      setLoading(false);
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [budgetData, contractorData]);

  const handleDownload = () => {
    generateBudgetPDF(budgetData, contractorData, { download: true });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-lg" style={{ maxWidth: 950, height: '92vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <FileText size={20} color="var(--primary)" />
            <span>Vista Previa del Presupuesto Oficial PDF</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleDownload}
            >
              <Download size={15} />
              <span>Descargar PDF</span>
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Loader2 className="spin" size={24} />
              <span>Generando documento PDF...</span>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="Vista previa PDF"
              className="pdf-preview-container"
              style={{ width: '100%', height: '100%', minHeight: '68vh' }}
            />
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
              Ocurrió un error al preparar la vista previa del PDF.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button type="button" className="btn btn-primary" onClick={handleDownload}>
            <Download size={16} />
            <span>Descargar Documento</span>
          </button>
        </div>
      </div>
    </div>
  );
}
