const ValidationError = require('../../errors/validation-error');

const validarFoto = (datos) => {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new ValidationError('Los datos de la foto son obligatorios');
  }

  const camposPermitidos = ['url', 'usuarioId', 'esPrincipal'];

  for (const campo of Object.keys(datos)) {
    if (!camposPermitidos.includes(campo)) {
      throw new ValidationError(`El campo ${campo} no está permitido`);
    }
  }

  const { url, usuarioId, esPrincipal } = datos;

  if (!url || typeof url !== 'string' || !url.trim()) {
    throw new ValidationError('La URL de la foto es obligatoria y debe tener contenido');
  }

  if (!usuarioId || typeof usuarioId !== 'number' || usuarioId <= 0) {
    throw new ValidationError('El usuarioId es obligatorio y debe ser un número entero positivo');
  }

  if (esPrincipal !== undefined && typeof esPrincipal !== 'boolean') {
    throw new ValidationError('El campo esPrincipal debe ser booleano');
  }
};

const validarFotoId = (id) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('El ID debe ser un número entero positivo');
  }
};

module.exports = { validarFoto, validarFotoId };