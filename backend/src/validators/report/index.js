const ValidationError = require('../../errors/validation-error');

const validarReporte = (datos) => {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new ValidationError('Los datos del reporte son obligatorios');
  }

  const camposPermitidos = ['usuarioId', 'reportadoId', 'razon', 'detalles', 'adminId'];

  for (const campo of Object.keys(datos)) {
    if (!camposPermitidos.includes(campo)) {
      throw new ValidationError(`El campo ${campo} no está permitido`);
    }
  }

  const { usuarioId, reportadoId, razon, detalles, adminId } = datos;

  if (!usuarioId || typeof usuarioId !== 'number' || usuarioId <= 0) {
    throw new ValidationError('El usuarioId es obligatorio y debe ser un número entero positivo');
  }

  if (!reportadoId || typeof reportadoId !== 'number' || reportadoId <= 0) {
    throw new ValidationError('El reportadoId es obligatorio y debe ser un número entero positivo');
  }

  if (!razon || typeof razon !== 'string' || !razon.trim()) {
    throw new ValidationError('La razón es obligatoria y debe tener contenido');
  }

  if (razon.length > 200) {
    throw new ValidationError('La razón no puede tener más de 200 caracteres');
  }

  if (detalles !== undefined && typeof detalles !== 'string') {
    throw new ValidationError('Los detalles deben ser un texto');
  }

  if (adminId !== undefined && (typeof adminId !== 'number' || adminId <= 0)) {
    throw new ValidationError('El adminId debe ser un número entero positivo si se proporciona');
  }
};

const validarReporteId = (id) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('El ID debe ser un número entero positivo');
  }
};

module.exports = { validarReporte, validarReporteId };