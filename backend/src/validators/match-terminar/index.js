const ValidationError = require('../../errors/validation-error');

const validarTerminarMatch = (datos) => {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new ValidationError('Los datos para terminar match son obligatorios');
  }

  const camposPermitidos = ['matchId', 'usuarioId'];

  for (const campo of Object.keys(datos)) {
    if (!camposPermitidos.includes(campo)) {
      throw new ValidationError(`El campo ${campo} no está permitido`);
    }
  }

  const { matchId, usuarioId } = datos;

  if (!matchId || typeof matchId !== 'number' || matchId <= 0) {
    throw new ValidationError('El matchId es obligatorio y debe ser un número entero positivo');
  }

  if (!usuarioId || typeof usuarioId !== 'number' || usuarioId <= 0) {
    throw new ValidationError('El usuarioId es obligatorio y debe ser un número entero positivo');
  }
};

module.exports = { validarTerminarMatch };