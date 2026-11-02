const { comprobarUsuarioActivo } = require('./usuario-activo.service');
const repository = require('../repositories/reporte.repository');
const { validarId, validarEstado, validarCampos, validarReporte } = require('../validators/reporte.validator');
const NotFoundError = require('../errors/not-found-error');
const ValidationError = require('../errors/validation-error');
const crear = async (datos) => {
  validarReporte(datos);
  const reportante = await repository.obtenerUsuario(datos.usuarioReportanteId);
  if (!reportante) throw new NotFoundError('Usuario reportante no encontrado');
  comprobarUsuarioActivo(reportante);
  if (!await repository.obtenerUsuario(datos.usuarioReportadoId)) throw new NotFoundError('Usuario reportado no encontrado');
  return repository.crear({ usuarioReportanteId: datos.usuarioReportanteId, usuarioReportadoId: datos.usuarioReportadoId,
    motivo: datos.motivo, descripcion: datos.descripcion?.trim() || null });
};
const listar = (estado) => {
  if (estado !== undefined) validarEstado(estado);
  return repository.listar(estado);
};
const obtener = async (id) => {
  validarId(id);
  const reporte = await repository.obtener(id);
  if (!reporte) throw new NotFoundError('Reporte no encontrado');
  return reporte;
};
const actualizarEstado = async (id, datos) => {
  validarCampos(datos, ['estado']);
  validarEstado(datos.estado);
  const reporte = await obtener(id);
  const transiciones = { PENDIENTE: ['RESUELTO', 'DESCARTADO'], RESUELTO: ['PENDIENTE'], DESCARTADO: ['PENDIENTE'] };
  if (!transiciones[reporte.estado]?.includes(datos.estado)) {
    throw new ValidationError(reporte.estado === 'PENDIENTE'
      ? 'Un reporte pendiente solo puede resolverse o descartarse.'
      : 'Para cambiar la resolución del reporte primero debe reabrirse.');
  }
  const result = await repository.actualizarEstado(id, reporte.estado, datos.estado);
  if (!result.count) throw new ValidationError('El reporte cambió de estado. Actualizá e intentá nuevamente.');
  return obtener(id);
};
const obtenerConversacion = async (id) => {
  const reporte = await obtener(id);
  const match = await require('../repositories/match.repository').obtenerEntreUsuarios(
    reporte.usuarioReportanteId, reporte.usuarioReportadoId);
  // Reutilizar solamente la lectura del repositorio, nunca el hook/caso de uso del chat.
  const mensajes = match ? await require('../repositories/mensaje.repository').obtenerHistorial(match.id,
    require('../config/prisma')) : [];
  const identidad = ({ id, nombre, apellido }) => ({ id, nombre, apellido });
  return { hayConversacion: mensajes.length > 0, match,
    reportante: identidad(reporte.usuarioReportante), reportado: identidad(reporte.usuarioReportado),
    cantidadMensajes: mensajes.length,
    mensajes: mensajes.map(({ id, emisorId, contenido, enviadoEn, leido }) => ({ id, emisorId, contenido, enviadoEn, leido })) };
};
module.exports = { crear, listar, obtener, actualizarEstado, obtenerConversacion };
