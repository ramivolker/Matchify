import React, { useState } from 'react';
import { AVATAR_PRESETS, saveUserAvatar } from '../../utils/userAvatarUtils';
import UserAvatar from '../common/UserAvatar';

export default function AvatarPickerModal({
  currentUser,
  currentAvatar,
  isOpen,
  onClose,
  onAvatarSaved,
  onShowToast,
}) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');
  const [customUrl, setCustomUrl] = useState('');
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'upload' | 'url'
  const [uploadError, setUploadError] = useState('');

  if (!isOpen) return null;

  // Manejar subida de archivo local y convertir a Base64 con redimensionado ligero
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar a max 500x500 para optimizar rendimiento y almacenamiento
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedAvatar(dataUrl);
        if (onShowToast) onShowToast('¡Imagen cargada! Guarda los cambios para aplicarla.', 'info');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setSelectedAvatar(customUrl.trim());
    if (onShowToast) onShowToast('Enlace aplicado a la previsualización.', 'info');
  };

  const handleSave = () => {
    saveUserAvatar(currentUser.id, selectedAvatar);
    if (onAvatarSaved) onAvatarSaved(selectedAvatar);
    if (onShowToast) onShowToast('¡Foto de perfil actualizada con éxito! ✨', 'success');
    onClose();
  };

  const handleResetToInitials = () => {
    setSelectedAvatar('');
    saveUserAvatar(currentUser.id, null);
    if (onAvatarSaved) onAvatarSaved(null);
    if (onShowToast) onShowToast('Se restableció tu avatar a las iniciales.', 'info');
    onClose();
  };

  return (
    <div className="modal avatar-picker-modal-backdrop" onClick={onClose}>
      <div className="modal-dialog avatar-picker-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <span className="modal-title-emoji">📸</span>
            <div>
              <h3>Foto de Perfil</h3>
              <p className="modal-subtitle-text">
                Elige cómo quieres que te vean los demás en Matchify
              </p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <div className="modal-body avatar-picker-body">
          {/* Previsualización en vivo */}
          <div className="avatar-preview-container">
            <div className="avatar-preview-frame">
              <UserAvatar
                user={currentUser}
                customAvatar={selectedAvatar}
                size="hero"
                className="avatar-preview-circle"
              />
              <span className="live-avatar-tag">Vista Previa</span>
            </div>
            <div className="avatar-preview-info">
              <strong>{currentUser?.nombre} {currentUser?.apellido}</strong>
              <span>Así se verá tu foto en tu perfil y en la baraja de swipe</span>
            </div>
          </div>

          {/* Pestañas de Selección */}
          <div className="avatar-picker-tabs">
            <button
              type="button"
              className={`avatar-tab-btn ${activeTab === 'presets' ? 'active' : ''}`}
              onClick={() => setActiveTab('presets')}
            >
              🌟 Galería de Avatares
            </button>
            <button
              type="button"
              className={`avatar-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              📁 Subir Foto
            </button>
            <button
              type="button"
              className={`avatar-tab-btn ${activeTab === 'url' ? 'active' : ''}`}
              onClick={() => setActiveTab('url')}
            >
              🔗 Enlace Web
            </button>
          </div>

          {/* Contenido según pestaña */}
          {activeTab === 'presets' && (
            <div className="avatar-presets-grid">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedAvatar === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`avatar-preset-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(preset.url)}
                    title={preset.name}
                  >
                    <img src={preset.url} alt={preset.name} loading="lazy" />
                    {isSelected && <span className="avatar-preset-check">✓</span>}
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="avatar-upload-zone">
              <input
                type="file"
                id="avatar-file-input"
                accept="image/*"
                className="hidden-file-input"
                onChange={handleFileChange}
              />
              <label htmlFor="avatar-file-input" className="avatar-drop-label">
                <span className="upload-icon-big">🖼️</span>
                <strong>Haz clic para elegir una foto</strong>
                <p>Formatos soportados: JPG, PNG, WebP (máx. 10MB)</p>
                <span className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
                  Examinar archivos
                </span>
              </label>
              {uploadError && <div className="avatar-upload-error">{uploadError}</div>}
            </div>
          )}

          {activeTab === 'url' && (
            <form onSubmit={handleApplyUrl} className="avatar-url-form">
              <label>Pega la URL directa de cualquier imagen de internet:</label>
              <div className="avatar-url-input-group">
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://ejemplo.com/mi-foto.jpg"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary">
                  Probar
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="modal-footer avatar-picker-footer">
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={handleResetToInitials}
            title="Quitar foto y mostrar iniciales"
          >
            Quitar foto (Iniciales)
          </button>
          <div className="modal-footer-right">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              ✨ Guardar Foto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
