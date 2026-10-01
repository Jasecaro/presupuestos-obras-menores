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
  Layers,
  Briefcase,
  FileSpreadsheet,
  Edit3,
  RotateCcw
} from 'lucide-react';
import { generateBudgetPDF } from '../utils/pdfGenerator';
import { generateWhatsAppSummary, MACRO_TASKS_DEFINITIONS } from '../utils/calculations';
import { exportMacroTasksExcel, exportRoomBudgetExcel } from '../utils/excelExporter';

export default function PdfPreviewModal({ budgetData, contractorData, initialMode = 'medium', onUpdateMacroDescriptions, onClose }) {
  const [activeTab, setActiveTab] = useState(initialMode); // 'medium', 'macro', 'minimal', 'detailed', 'whatsapp'
  const [whatsappFormat, setWhatsappFormat] = useState('macro'); // 'macro' or 'rooms'
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Editable Macro Descriptions state
  const [showMacroEditor, setShowMacroEditor] = useState(false);
  const [tempDescriptions, setTempDescriptions] = useState(() => budgetData?.macroDescriptions || {});
  const [savedDescriptionsFeedback, setSavedDescriptionsFeedback] = useState(false);

  useEffect(() => {
    setTempDescriptions(budgetData?.macroDescriptions || {});
  }, [budgetData?.macroDescriptions]);

  const handleDescriptionChange = (id, val) => {
    setTempDescriptions(prev => ({
      ...prev,
      [id]: val
    }));
  };

  const handleSaveDescriptions = () => {
    if (onUpdateMacroDescriptions) {
      onUpdateMacroDescriptions(tempDescriptions);
    }
    setSavedDescriptionsFeedback(true);
    setTimeout(() => setSavedDescriptionsFeedback(false), 2200);
  };

  const handleResetDescriptions = () => {
    const defaults = {};
    MACRO_TASKS_DEFINITIONS.forEach(def => {
      defaults[def.id] = def.description;
    });
    setTempDescriptions(defaults);
    if (onUpdateMacroDescriptions) {
      onUpdateMacroDescriptions(defaults);
    }
    setSavedDescriptionsFeedback(true);
    setTimeout(() => setSavedDescriptionsFeedback(false), 2200);
  };

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
    return generateWhatsAppSummary(budgetData, contractorData, whatsappFormat);
  }, [budgetData, contractorData, whatsappFormat]);

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
              onClick={() => handleDownload(activeTab === 'whatsapp' ? 'medium' : activeTab)}
              title="Descargar versión en PDF"
            >
              <Download size={15} />
              <span>
                {activeTab === 'minimal' 
                  ? 'Descargar Minimalista (PDF)' 
                  : activeTab === 'detailed' 
                  ? 'Descargar Detallado (PDF)' 
                  : activeTab === 'macro'
                  ? 'Descargar Especialidades (PDF)'
                  : 'Descargar Versión Media (PDF)'}
              </span>
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
              className={`tab-btn ${activeTab === 'medium' ? 'active' : ''}`}
              onClick={() => setActiveTab('medium')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileText size={16} color={activeTab === 'medium' ? 'var(--primary)' : 'inherit'} />
              <span>Versión Media (Subtotales)</span>
              <span className="badge" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', fontSize: '0.68rem', padding: '0.15rem 0.45rem', fontWeight: '700' }}>
                Por Recintos
              </span>
            </button>

            <button
              type="button"
              className={`tab-btn ${activeTab === 'macro' ? 'active' : ''}`}
              onClick={() => setActiveTab('macro')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Briefcase size={16} color={activeTab === 'macro' ? 'var(--primary)' : 'inherit'} />
              <span>Por Tareas Globales</span>
              <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#065f46', fontSize: '0.68rem', padding: '0.15rem 0.45rem', fontWeight: '700' }}>
                Macro-Partidas
              </span>
            </button>

            <button
              type="button"
              className={`tab-btn ${activeTab === 'minimal' ? 'active' : ''}`}
              onClick={() => setActiveTab('minimal')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Sparkles size={16} color={activeTab === 'minimal' ? 'var(--primary)' : 'inherit'} />
              <span>Versión Minimalista</span>
              <span className="badge" style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-secondary)', fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
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
              <span>Versión Detallada</span>
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

              {/* Format Selector: Macro-Tasks vs Rooms */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.6rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Estructura del texto:</span>
                <button
                  type="button"
                  className={`btn btn-sm ${whatsappFormat === 'macro' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => setWhatsappFormat('macro')}
                >
                  <Briefcase size={13} />
                  <span>Por Tareas Globales (Macro-Partidas)</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${whatsappFormat === 'rooms' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => setWhatsappFormat('rooms')}
                >
                  <FileText size={13} />
                  <span>Por Recintos / Habitaciones</span>
                </button>
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
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.5rem' }}>
              {activeTab === 'macro' && (
                <div style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <div
                    onClick={() => setShowMacroEditor(!showMacroEditor)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.85rem',
                      background: showMacroEditor ? '#eff6ff' : '#f8fafc',
                      cursor: 'pointer',
                      borderBottom: showMacroEditor ? '1px solid #bfdbfe' : 'none',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Edit3 size={15} color="var(--primary)" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Editar "Alcance General" (letra chica) de las especialidades
                      </span>
                      {savedDescriptionsFeedback && (
                        <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Check size={13} /> ¡Actualizado!
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                      {showMacroEditor ? '▲ Ocultar editor' : '▼ Modificar textos aquí'}
                    </span>
                  </div>

                  {showMacroEditor && (
                    <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '38vh', overflowY: 'auto', background: '#ffffff' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: '#f1f5f9', padding: '0.45rem 0.75rem', borderRadius: '4px' }}>
                        💡 <strong>Nota:</strong> Los cambios que guardes aquí se aplican al PDF, al texto de WhatsApp y al Excel. También puedes editarlos en la <strong>Columna C</strong> del archivo Excel e importarlo.
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                        {MACRO_TASKS_DEFINITIONS.map((def, idx) => {
                          const currentDesc = tempDescriptions[def.id] !== undefined ? tempDescriptions[def.id] : (budgetData?.macroDescriptions?.[def.id] ?? def.description);
                          return (
                            <div key={def.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b' }}>
                                {idx + 1}. {def.shortTitle || def.title}
                              </label>
                              <textarea
                                className="form-textarea"
                                rows={2}
                                style={{ fontSize: '0.75rem', lineHeight: '1.35', padding: '0.4rem', border: '1px solid #cbd5e1' }}
                                value={currentDesc}
                                onChange={(e) => handleDescriptionChange(def.id, e.target.value)}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.25rem', borderTop: '1px solid #e2e8f0' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleResetDescriptions}
                          style={{ fontSize: '0.75rem' }}
                          title="Restaurar textos predeterminados"
                        >
                          <RotateCcw size={13} />
                          <span>Restaurar originales</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={handleSaveDescriptions}
                          style={{ fontSize: '0.75rem' }}
                        >
                          <Check size={14} />
                          <span>Guardar y actualizar informe</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ flex: 1, minHeight: '55vh', position: 'relative' }}>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <Loader2 className="spin" size={24} />
                    <span>Generando vista previa del documento...</span>
                  </div>
                ) : pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    title="Vista previa PDF"
                    className="pdf-preview-container"
                    style={{ width: '100%', height: '100%', minHeight: showMacroEditor ? '42vh' : '65vh' }}
                  />
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
                    Ocurrió un error al preparar la vista previa del PDF.
                  </div>
                )}
              </div>
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
              className="btn btn-secondary"
              onClick={() => {
                if (activeTab === 'macro') {
                  exportMacroTasksExcel(budgetData, contractorData);
                } else {
                  exportRoomBudgetExcel(budgetData, contractorData);
                }
              }}
              title="Descargar planilla Excel editable con fórmulas automáticas"
              style={{ borderColor: '#10b981', color: '#065f46', backgroundColor: '#ecfdf5', fontWeight: '600' }}
            >
              <FileSpreadsheet size={16} color="#059669" />
              <span>{activeTab === 'macro' ? 'Excel Macro-Tareas' : 'Excel Recintos'}</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleDownload(activeTab === 'whatsapp' ? 'minimal' : activeTab)}
            >
              <Download size={16} />
              <span>
                {activeTab === 'minimal' 
                  ? 'Descargar PDF Minimalista' 
                  : activeTab === 'detailed' 
                  ? 'Descargar PDF Detallado' 
                  : activeTab === 'macro'
                  ? 'Descargar PDF Especialidades'
                  : 'Descargar PDF'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

