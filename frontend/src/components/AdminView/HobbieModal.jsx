import React, { useState, useEffect } from 'react';

export default function HobbieModal({ isOpen, onClose, onSubmit, hobbie }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (hobbie) {
      setNombre(hobbie.nombre || '');
      setDescripcion(hobbie.descripcion || '');
    } else {
      setNombre('');
      setDescripcion('');
    }
  }, [hobbie, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
    });
  };

  return (
    <div className="modal">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3>{hobbie ? `Editar Hobbie: ${hobbie.nombre}` : 'Crear Nuevo Hobbie'}</h3>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>
                Nombre del Hobbie <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="Ej: Trekking, Fotografía, Gaming..."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Descripción (opcional)</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Breve descripción del interés..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Hobbie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
