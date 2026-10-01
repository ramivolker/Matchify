const ValidationError = require('../../errors/validation-error');

const validarChat = (datos) => {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new ValidationError('Los datos del chat son obligatorios');
  }

  const camposPermitidos = ['mensaje', 'matchId', 'usuarioId', 'destinatarioId'];

  for (const campo of Object.keys(datos)) {
    if (!camposPermitidos.includes(campo)) {
      throw new ValidationError(`El campo ${campo} no está permitido`);
    }
  }

  const { mensaje, matchId, usuarioId, destinatarioId } = datos;

  if (!mensaje || typeof mensaje !== 'string' || mensaje.trim().length === 0) {
    throw new ValidationError('El mensaje es obligatorio y debe tener contenido');
  }

  if (mensaje.length > 1000) {
    throw new ValidationError('El mensaje no puede tener más de 1000 caracteres');
  }

  if (!matchId || typeof matchId !== 'number' || matchId <= 0) {
    throw new ValidationError('El matchId es obligatorio y debe ser un número entero positivo');
  }

  if (!usuarioId || typeof usuarioId !== 'number' || usuarioId <= 0) {
    throw new ValidationError('El usuarioId es obligatorio y debe ser un número entero positivo');
  }

  if (!destinatarioId || typeof destinatarioId !== 'number' || destinatarioId <= 0) {
    throw new ValidationError('El destinatarioId es obligatorio y debe ser un número entero positivo');
  }
};

const validarChatId = (id) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('El ID debe ser un número entero positivo');
  }
};

module.exports = { validarChat, validarChatId };