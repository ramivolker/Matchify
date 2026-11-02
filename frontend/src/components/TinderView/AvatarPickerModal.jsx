import React, { useState } from 'react';

const MAX_PHOTOS = 6;

export default function AvatarPickerModal({ isOpen, onClose, photos }) {
  const { fotos, loading, addFiles, addUrl, remove, makeMain, move } = photos;
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen) return null;

  const handleFileInputChange = (event) => {
    addFiles(Array.from(event.target.files || []));
    event.target.value = '';
  };
  const handleDragOver = (event) => { event.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (event) => { event.preventDefault(); setIsDragging(false); };
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer?.files || []));
  };
  const handleMoveLeft = (index) => move(index, -1);
  const handleMoveRight = (index) => move(index, 1);
  const handleMakeMain = (foto) => makeMain(foto);
  const handleDeleteFoto = (foto) => remove(foto);
  const handleAddUrl = async (event) => {
    event.preventDefault();
    if (await addUrl(customUrl.trim())) {
      setCustomUrl('');
      setShowUrlInput(false);
    }
  };

  const handleOpenSystemFileManager = () => {
    const input = document.getElementById('apple-photo-modal-input');
    if (input) input.click();
  };

  return (
    <div className="apple-modal-backdrop" role="dialog" aria-modal="true" aria-label="Fotos del perfil" onClick={() => { if (!loading) onClose(); }}>
      <div className="apple-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera minimalista estilo macOS Sheet */}
        <header className="apple-sheet-header">
          <div className="apple-sheet-title-group">
            <h3 className="apple-sheet-title">Fotos del perfil</h3>
            <p className="apple-sheet-subtitle">
              La primera imagen se utiliza como portada de tu cuenta
            </p>
          </div>
          <button
            type="button"
            className="apple-sheet-close-btn"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
            title="Cerrar"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Contenido principal */}
        <div className="apple-sheet-body">
          {/* Zona de carga discreta estilo AirDrop / iCloud */}
          <section
            className={`apple-dropzone ${isDragging ? 'is-dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              id="apple-photo-modal-input"
              type="file"
              accept="image/*"
              multiple
              className="apple-hidden-input"
              onChange={handleFileInputChange}
              disabled={loading || fotos.length >= MAX_PHOTOS}
            />

            <div className="apple-dropzone-inner">
              <div className="apple-upload-icon-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>

              <div className="apple-dropzone-text">
                <span className="apple-dropzone-primary-text">
                  Arrastra tus imágenes aquí
                </span>
                <span className="apple-dropzone-secondary-text">
                  o seleccionalas desde el explorador de archivos (JPG, PNG, WebP)
                </span>
              </div>

              <div className="apple-dropzone-actions">
                <button
                  type="button"
                  className="apple-btn-secondary"
                  onClick={handleOpenSystemFileManager}
                  disabled={loading || fotos.length >= MAX_PHOTOS}
                >
                  {loading ? 'Cargando…' : 'Elegir archivos…'}
                </button>

                <button
                  type="button"
                  className="apple-link-btn"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                >
                  {showUrlInput ? 'Ocultar enlace web' : 'Enlace web'}
                </button>
              </div>

              {showUrlInput && (
                <form onSubmit={handleAddUrl} className="apple-url-row">
                  <input
                    type="url"
                    className="apple-text-input"
                    placeholder="https://ejemplo.com/foto.jpg"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="apple-btn-primary apple-btn-sm"
                    disabled={loading || !customUrl.trim()}
                  >
                    Agregar
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Galería de fotos con estilo Apple Photos / Inspector */}
          <section className="apple-gallery-section">
            <div className="apple-gallery-header">
              <span className="apple-section-label">Fototeca</span>
              <span className="apple-counter-pill">
                {fotos.length} de {MAX_PHOTOS}
              </span>
            </div>

            {fotos.length === 0 ? (
              <div className="apple-empty-gallery">
                <span className="apple-empty-label">Sin fotos cargadas</span>
                <span className="apple-empty-sub">
                  Agrega al menos una foto para que otros usuarios puedan encontrarte
                </span>
              </div>
            ) : (
              <div className="apple-photos-grid">
                {fotos.map((foto, index) => {
                  const isMain = index === 0;
                  return (
                    <div
                      key={foto.id || index}
                      className={`apple-photo-card ${isMain ? 'is-main' : ''}`}
                    >
                      <div className="apple-photo-media">
                        <img
                          src={foto.url}
                          alt={`Foto ${index + 1}`}
                          className="apple-photo-img"
                        />

                        {isMain && (
                          <div className="apple-main-indicator">
                            Principal
                          </div>
                        )}

                        <div className="apple-order-indicator">
                          {index + 1}
                        </div>

                        {/* Barra de micro-acciones flotante */}
                        <div className="apple-photo-overlay">
                          <div className="apple-reorder-group">
                            <button
                              type="button"
                              className="apple-icon-btn"
                              onClick={() => handleMoveLeft(index)}
                              disabled={index === 0 || loading}
                              title="Mover anterior"
                              aria-label="Mover anterior"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="apple-icon-btn"
                              onClick={() => handleMoveRight(index)}
                              disabled={index === fotos.length - 1 || loading}
                              title="Mover siguiente"
                              aria-label="Mover siguiente"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </button>
                          </div>

                          <div className="apple-actions-group">
                            {!isMain && (
                              <button
                                type="button"
                                className="apple-pill-action-btn"
                                onClick={() => handleMakeMain(foto)}
                                disabled={loading}
                                title="Fijar como portada principal"
                              >
                                Portada
                              </button>
                            )}

                            <button
                              type="button"
                              className="apple-icon-btn danger"
                              onClick={() => handleDeleteFoto(foto)}
                              disabled={loading}
                              title="Eliminar foto"
                              aria-label="Eliminar foto"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Pie estilo macOS */}
        <footer className="apple-sheet-footer">
          <span className="apple-footer-status">
            {loading ? 'Sincronizando fotos…' : photos.error ? 'No se pudieron sincronizar las fotos' : 'Fotos sincronizadas'}
          </span>
          <button
            type="button"
            className="apple-btn-primary"
            onClick={onClose}
            disabled={loading}
          >
            Listo
          </button>
        </footer>
      </div>
    </div>
  );
}
