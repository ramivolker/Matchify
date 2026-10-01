const ValidationError = require('../errors/validation-error');

const validarId = (id, campo = 'ID') => {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ValidationError(`${campo} debe ser un entero positivo`);
  }
};

const validarMensaje = (datos) => {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new ValidationError('Los datos del mensaje son obligatorios');
  }
  if (Object.keys(datos).some((key) => !['emisorId', 'contenido'].includes(key))) {
    throw new ValidationError('El mensaje contiene campos no permitidos');
  }
  validarId(datos.emisorId, 'emisorId');
  if (typeof datos.contenido !== 'string' || !datos.contenido.trim()) {
    throw new ValidationError('El mensaje no puede estar vacío');
  }
  if (datos.contenido.length > 1000) {
    throw new ValidationError('El mensaje admite hasta 1000 caracteres');
  }
};

module.exports = { validarId, validarMensaje };
