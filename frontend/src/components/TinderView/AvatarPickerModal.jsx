import React, { useState, useEffect } from 'react';
import { saveUserAvatar, getUserPhotos } from '../../utils/userAvatarUtils';
import { api } from '../../services/api';

const MAX_PHOTOS = 6;

/**
 * Redimensiona y comprime una imagen a max 800x800 JPEG (0.85) en base64
 */
const compressImageFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('El archivo seleccionado no es una imagen compatible.'));
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Error al decodificar la imagen.'));
      img.onload = () => {
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default function AvatarPickerModal({
  currentUser,
  isOpen,
  onClose,
  onAvatarSaved,
  onFotosUpdated,
  onShowToast,
}) {
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  // Cargar fotos al abrir el modal
  useEffect(() => {
    if (!isOpen || !currentUser?.id) return;

    let isMounted = true;
    setLoading(true);

    api.getFotos(currentUser.id)
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setFotos(data);
        } else {
          const fallbackUrls = getUserPhotos(currentUser);
          setFotos(fallbackUrls.map((url, i) => ({ id: `demo-${i}`, url, orden: i })));
        }
      })
      .catch(() => {
        if (!isMounted) return;
        const fallbackUrls = getUserPhotos(currentUser);
        setFotos(fallbackUrls.map((url, i) => ({ id: `demo-${i}`, url, orden: i })));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentUser?.id]);

  if (!isOpen) return null;

  const notifyChanges = (updatedFotos) => {
    setFotos(updatedFotos);
    const mainPhotoUrl = updatedFotos[0]?.url || null;
    saveUserAvatar(currentUser.id, mainPhotoUrl);
    if (onAvatarSaved) onAvatarSaved(mainPhotoUrl);
    if (onFotosUpdated) onFotosUpdated(updatedFotos);
  };

  const handleProcessFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;

    const disponibles = MAX_PHOTOS - fotos.length;
    if (disponibles <= 0) {
      if (onShowToast) onShowToast(`Has alcanzado el límite máximo de ${MAX_PHOTOS} fotos.`, 'warning');
      return;
    }

    const archivosAProcesar = Array.from(filesList).slice(0, disponibles);
    setLoading(true);

    try {
      const base64List = [];
      for (const file of archivosAProcesar) {
        try {
          const b64 = await compressImageFile(file);
          base64List.push(b64);
        } catch (err) {
          console.warn('Error comprimiendo archivo:', err);
        }
      }

      if (base64List.length === 0) {
        if (onShowToast) onShowToast('No se pudieron procesar las imágenes.', 'error');
        return;
      }

      let nuevasFotosServidor = [];
      try {
        if (base64List.length === 1) {
          const res = await api.agregarFoto(currentUser.id, { url: base64List[0] });
          nuevasFotosServidor = [res];
        } else {
          const res = await api.agregarFoto(currentUser.id, { fotos: base64List.map((url) => ({ url })) });
          nuevasFotosServidor = Array.isArray(res) ? res : [res];
        }
      } catch (apiErr) {
        console.warn('Error guardando en API, aplicando localmente:', apiErr);
        nuevasFotosServidor = base64List.map((url, i) => ({
          id: `local-${Date.now()}-${i}`,
          url,
          orden: fotos.length + i,
        }));
      }

      let todas = [];
      try {
        todas = await api.getFotos(currentUser.id);
      } catch {
        todas = [...fotos, ...nuevasFotosServidor];
      }

      notifyChanges(todas);
      if (onShowToast) {
        onShowToast(
          base64List.length === 1
            ? 'Foto agregada al perfil'
            : `${base64List.length} fotos agregadas al perfil`,
          'success'
        );
      }
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error al procesar archivos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileInputChange = (e) => {
    handleProcessFiles(e.target.files);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files?.length) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  const handleMoveLeft = async (index) => {
    if (index <= 0 || loading) return;
    const nuevas = [...fotos];
    const temp = nuevas[index - 1];
    nuevas[index - 1] = nuevas[index];
    nuevas[index] = temp;
    await persistOrder(nuevas);
  };

  const handleMoveRight = async (index) => {
    if (index >= fotos.length - 1 || loading) return;
    const nuevas = [...fotos];
    const temp = nuevas[index + 1];
    nuevas[index + 1] = nuevas[index];
    nuevas[index] = temp;
    await persistOrder(nuevas);
  };

  const handleMakeMain = async (foto) => {
    if (loading) return;
    setLoading(true);
    try {
      if (typeof foto.id === 'number') {
        const actualizadas = await api.marcarFotoPrincipal(currentUser.id, foto.id);
        notifyChanges(actualizadas);
      } else {
        const nuevas = [foto, ...fotos.filter((f) => f.id !== foto.id)];
        notifyChanges(nuevas);
      }
      if (onShowToast) onShowToast('Foto principal actualizada', 'success');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error al actualizar foto principal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const persistOrder = async (nuevasFotos) => {
    setLoading(true);
    try {
      const ids = nuevasFotos.map((f) => f.id).filter((id) => typeof id === 'number');
      if (ids.length === nuevasFotos.length) {
        const res = await api.reordenarFotos(currentUser.id, ids);
        notifyChanges(res);
      } else {
        notifyChanges(nuevasFotos);
      }
    } catch (err) {
      console.warn('Error al persistir orden:', err);
      notifyChanges(nuevasFotos);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFoto = async (foto) => {
    if (loading) return;
    setLoading(true);
    try {
      if (typeof foto.id === 'number') {
        await api.eliminarFoto(currentUser.id, foto.id);
        const actualizadas = await api.getFotos(currentUser.id);
        notifyChanges(actualizadas);
      } else {
        const restantes = fotos.filter((f) => f.id !== foto.id);
        notifyChanges(restantes);
      }
      if (onShowToast) onShowToast('Foto eliminada', 'info');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error al eliminar foto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!customUrl.trim() || loading) return;

    if (fotos.length >= MAX_PHOTOS) {
      if (onShowToast) onShowToast(`Has alcanzado el límite de ${MAX_PHOTOS} fotos.`, 'warning');
      return;
    }

    setLoading(true);
    try {
      await api.agregarFoto(currentUser.id, { url: customUrl.trim() });
      const actualizadas = await api.getFotos(currentUser.id);
      notifyChanges(actualizadas);
      setCustomUrl('');
      setShowUrlInput(false);
      if (onShowToast) onShowToast('Foto agregada', 'success');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Error al agregar foto por URL', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSystemFileManager = () => {
    const input = document.getElementById('apple-photo-modal-input');
    if (input) input.click();
  };

  return (
    <div className="apple-modal-backdrop" onClick={onClose}>
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
            {loading ? 'Guardando cambios…' : 'Cambios guardados'}
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
