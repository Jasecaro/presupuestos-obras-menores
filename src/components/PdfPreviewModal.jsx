import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  X, 
  Loader2, 
  Sparkles, 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { generateBudgetPDF } from '../utils/pdfGenerator';
import { generateWhatsAppSummary } from '../utils/calculations';

export default function PdfPreviewModal({ budgetData, contractorData, initialMode = 'minimal', onClose }) {
  const [activeTab, setActiveTab] = useState(initialMode); // 'minimal', 'detailed', 'whatsapp'
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Generate PDF preview when tab is minimal or detailed
  useEffect(() => {
    if (activeTab === 'whatsapp') {
      return;
    }

    setLoading(true);
    let url = null;
    try {
      url = generateBudgetPDF(budgetData, contractorData, { 
        mode: activeTab, 
        returnBlobUrl: true, 
        download: false 
      });
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
  }, [budgetData, contractorData, activeTab]);

  const handleDownload = (modeToDownload) => {
    const targetMode = modeToDownload || (activeTab === 'whatsapp' ? 'minimal' : activeTab);
    generateBudgetPDF(budgetData, contractorData, { mode: targetMode, download: true });
  };

  const whatsappText = React.useMemo(() => {
    return generateWhatsAppSummary(budgetData, contractorData);
  }, [budgetData, contractorData]);

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsAppWeb = () => {
    const phone = (budgetData?.client?.phone || '').replace(/\D/g, '');
    const encoded = encodeURIComponent(whatsappText);
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-lg" style={{ maxWidth: 980, height: '94vh' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header" style={{ paddingBottom: '0.6rem' }}>
          <div className="modal-title">
            <FileText size={20} color="var(--primary)" />
            <span>Formatos de Presupuesto</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleDownload(activeTab === 'whatsapp' ? 'minimal' : activeTab)}
              title="Descargar versión en PDF"
            >
              <Download size={15} />
              <span>{activeTab === 'minimal' ? 'Descargar Resumido (PDF)' : activeTab === 'detailed' ? 'Descargar Detallado (PDF)' : 'Descargar PDF'}</span>
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ padding: '0 1rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="tabs-nav" style={{ margin: 0, borderBottom: 'none' }}>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'minimal' ? 'active' : ''}`}
              onClick={() => setActiveTab('minimal')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Sparkles size={16} color={activeTab === 'minimal' ? 'var(--primary)' : 'inherit'} />
              <span>Versión Minimalista / Resumida</span>
              <span className="badge" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                Solo Trabajos + Total
              </span>
            </button>

            <button
              type="button"
              className={`tab-btn ${activeTab === 'detailed' ? 'active' : ''}`}
              onClick={() => setActiveTab('detailed')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Layers size={16} color={activeTab === 'detailed' ? 'var(--primary)' : 'inherit'} />
              <span>Versión Detallada (Completa)</span>
              <span className="badge" style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-secondary)', fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                Desglose m² y P.U.
              </span>
            </button>

            <button
              type="button"
              className={`tab-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
              onClick={() => setActiveTab('whatsapp')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <MessageSquare size={16} color={activeTab === 'whatsapp' ? 'var(--success)' : 'inherit'} />
              <span>Texto para WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="modal-body" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'whatsapp' ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%', 
              background: 'var(--bg-main)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.25rem',
              border: '1px solid var(--border-color)',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MessageSquare size={18} color="var(--success)" />
                    Resumen Rápido para Enviar por WhatsApp / Chat
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Ideal para enviar una respuesta rápida y formal al cliente sin necesidad de adjuntar archivos.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    className={`btn ${copied ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={handleCopyWhatsApp}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar Texto'}</span>
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm"
                    onClick={handleOpenWhatsAppWeb}
                    style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                  >
                    <ExternalLink size={16} />
                    <span>Abrir en WhatsApp</span>
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, minHeight: '300px', position: 'relative' }}>
                <textarea
                  readOnly
                  className="form-textarea"
                  style={{
                    width: '100%',
                    height: '100%',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    lineHeight: '1.6',
                    padding: '1rem',
                    backgroundColor: '#ffffff',
                    color: 'var(--text-main)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    resize: 'none',
                    whiteSpace: 'pre-wrap'
                  }}
                  value={whatsappText}
                />
              </div>
            </div>
          ) : loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Loader2 className="spin" size={24} />
              <span>Generando vista previa del documento...</span>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="Vista previa PDF"
              className="pdf-preview-container"
              style={{ width: '100%', height: '100%', minHeight: '65vh' }}
            />
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
              Ocurrió un error al preparar la vista previa del PDF.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {activeTab === 'minimal' && (
              <span>✨ <strong>Versión Minimalista:</strong> Oculta precios por m² y fórmulas, mostrando solo recintos, alcance y total final.</span>
            )}
            {activeTab === 'detailed' && (
              <span>📑 <strong>Versión Detallada:</strong> Incluye desglose completo de metros cuadrados, precios unitarios y subtotales.</span>
            )}
            {activeTab === 'whatsapp' && (
              <span>📱 <strong>Resumen de Texto:</strong> Formateado con emojis y negritas para WhatsApp y correo.</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleDownload(activeTab === 'whatsapp' ? 'minimal' : activeTab)}
            >
              <Download size={16} />
              <span>Descargar {activeTab === 'minimal' ? 'PDF Minimalista' : activeTab === 'detailed' ? 'PDF Detallado' : 'PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

