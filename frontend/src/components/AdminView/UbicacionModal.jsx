import React, { useState, useEffect } from 'react';

export default function UbicacionModal({ isOpen, onClose, onSubmit, ubicacion }) {
  const [ciudad, setCiudad] = useState('');
  const [provincia, setProvincia] = useState('');
  const [pais, setPais] = useState('');

  useEffect(() => {
    if (ubicacion) {
      setCiudad(ubicacion.ciudad || '');
      setProvincia(ubicacion.provincia || '');
      setPais(ubicacion.pais || '');
    } else {
      setCiudad('');
      setProvincia('');
      setPais('');
    }
  }, [ubicacion, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ciudad: ciudad.trim(),
      provincia: provincia.trim(),
      pais: pais.trim(),
    });
  };

  return (
    <div className="modal">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3>{ubicacion ? `Editar Ubicación: ${ubicacion.ciudad}` : 'Crear Nueva Ubicación'}</h3>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>
                Ciudad <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="Ej: Rosario"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                Provincia / Región <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="Ej: Santa Fe"
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                País <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="Ej: Argentina"
                value={pais}
                onChange={(e) => setPais(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Ubicación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
