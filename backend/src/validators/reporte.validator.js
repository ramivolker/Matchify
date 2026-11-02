const ValidationError = require('../errors/validation-error');
const { validarId } = require('./mensaje.validator');
const { MOTIVOS_REPORTE, ESTADOS_REPORTE } = require('../constants/reporte');
const validarEstado = (estado) => {
  if (!ESTADOS_REPORTE.includes(estado)) throw new ValidationError('Estado de reporte inválido');
};
const validarCampos = (datos, campos) => {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos) || Object.keys(datos).some((key) => !campos.includes(key))) {
    throw new ValidationError('Datos de reporte inválidos');
  }
};
const validarReporte = (datos) => {
  validarCampos(datos, ['usuarioReportanteId', 'usuarioReportadoId', 'motivo', 'descripcion']);
  validarId(datos.usuarioReportanteId, 'usuarioReportanteId');
  validarId(datos.usuarioReportadoId, 'usuarioReportadoId');
  if (datos.usuarioReportanteId === datos.usuarioReportadoId) throw new ValidationError('No podés reportarte a vos mismo');
  if (!Object.hasOwn(MOTIVOS_REPORTE, datos.motivo)) throw new ValidationError('Motivo de reporte inválido');
  if (datos.descripcion != null && (typeof datos.descripcion !== 'string' || datos.descripcion.length > 300)) {
    throw new ValidationError('La descripción admite hasta 300 caracteres');
  }
};
module.exports = { validarId, validarEstado, validarCampos, validarReporte };
