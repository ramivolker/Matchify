import React, { useState, useEffect } from 'react';

export default function UsuarioModal({
  isOpen,
  onClose,
  onSubmit,
  usuario, // si viene poblado es edición, si es null es creación
  ubicaciones,
}) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [ubicacionId, setUbicacionId] = useState('');
  const [biografia, setBiografia] = useState('');
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || '');
      setApellido(usuario.apellido || '');
      setEmail(usuario.email || '');
      setFechaNacimiento(
        usuario.fechaNacimiento ? usuario.fechaNacimiento.split('T')[0] : ''
      );
      setUbicacionId(usuario.ubicacionId ? String(usuario.ubicacionId) : '');
      setBiografia(usuario.biografia || '');
      setActivo(usuario.activo !== false);
    } else {
      setNombre('');
      setApellido('');
      setEmail('');
      setFechaNacimiento('');
      setUbicacionId('');
      setBiografia('');
      setActivo(true);
    }
  }, [usuario, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
      fechaNacimiento,
      biografia: biografia.trim() || undefined,
      activo,
      ubicacionId: ubicacionId ? parseInt(ubicacionId, 10) : null,
    };
    onSubmit(data);
  };

  return (
    <div className="modal">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3>{usuario ? `Editar Usuario: ${usuario.nombre}` : 'Crear Nuevo Usuario'}</h3>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>
                  Nombre <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="Ej: Lionel"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>
                  Apellido <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="Ej: Messi"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Email <span className="required-star">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                required
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Fecha de Nacimiento <span className="required-star">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  required
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Ubicación</label>
                <select
                  className="form-control"
                  value={ubicacionId}
                  onChange={(e) => setUbicacionId(e.target.value)}
                >
                  <option value="">-- Sin ubicación --</option>
                  {ubicaciones.map((ub) => (
                    <option key={ub.id} value={ub.id}>
                      {ub.ciudad}, {ub.provincia} ({ub.pais})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <div className="label-with-hint">
                <label>Biografía (opcional)</label>
                <span
                  className="char-counter"
                  style={{ color: biografia.length > 450 ? '#ef4444' : 'var(--text-muted)' }}
                >
                  {biografia.length} / 500
                </span>
              </div>
              <textarea
                className="form-control"
                rows="3"
                maxLength={500}
                placeholder="Breve presentación personal..."
                value={biografia}
                onChange={(e) => setBiografia(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="toggle-control">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                />
                <span className="toggle-switch"></span>
                <span className="toggle-label">Usuario Activo</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
