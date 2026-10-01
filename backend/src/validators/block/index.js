const ValidationError = require('../../errors/validation-error');

const validarBloqueo = (datos) => {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new ValidationError('Los datos del bloqueo son obligatorios');
  }

  const camposPermitidos = ['usuarioId', 'bloqueadorId'];

  for (const campo of Object.keys(datos)) {
    if (!camposPermitidos.includes(campo)) {
      throw new ValidationError(`El campo ${campo} no está permitido`);
    }
  }

  const { usuarioId, bloqueadorId } = datos;

  if (!usuarioId || typeof usuarioId !== 'number' || usuarioId <= 0) {
    throw new ValidationError('El usuarioId es obligatorio y debe ser un número entero positivo');
  }

  if (!bloqueadorId || typeof bloqueadorId !== 'number' || bloqueadorId <= 0) {
    throw new ValidationError('El bloqueadorId es obligatorio y debe ser un número entero positivo');
  }

  if (usuarioId === bloqueadorId) {
    throw new ValidationError('Un usuario no puede bloquearse a sí mismo');
  }
};

const validarBloqueoId = (id) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('El ID debe ser un número entero positivo');
  }
};

module.exports = { validarBloqueo, validarBloqueoId };