import React, { useState, useEffect } from 'react';

export default function UbicacionModal({ isOpen, onClose, onSubmit, ubicacion }) {
  const [ciudad, setCiudad] = useState('');
  const [provincia, setProvincia] = useState('');
  const [pais, setPais] = useState('Argentina');
  const [latitud, setLatitud] = useState('-32.9468');
  const [longitud, setLongitud] = useState('-60.6393');

  useEffect(() => {
    if (ubicacion) {
      setCiudad(ubicacion.ciudad || '');
      setProvincia(ubicacion.provincia || '');
      setPais(ubicacion.pais || 'Argentina');
      setLatitud(ubicacion.latitud !== undefined ? String(ubicacion.latitud) : '-32.9468');
      setLongitud(ubicacion.longitud !== undefined ? String(ubicacion.longitud) : '-60.6393');
    } else {
      setCiudad('');
      setProvincia('');
      setPais('Argentina');
      setLatitud('-32.9468');
      setLongitud('-60.6393');
    }
  }, [ubicacion, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ciudad: ciudad.trim(),
      provincia: provincia.trim(),
      pais: pais.trim(),
      latitud: parseFloat(latitud) || -32.9468,
      longitud: parseFloat(longitud) || -60.6393,
    });
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
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

            <div className="form-row">
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

            <div className="form-row">
              <div className="form-group">
                <label>Latitud (decimal)</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="-32.9468"
                  value={latitud}
                  onChange={(e) => setLatitud(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Longitud (decimal)</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="-60.6393"
                  value={longitud}
                  onChange={(e) => setLongitud(e.target.value)}
                />
              </div>
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
