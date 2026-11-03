const prisma = require('../config/prisma');
const usuario = { id: true, nombre: true, apellido: true, email: true, fotos: { orderBy: { orden: 'asc' }, select: { url: true } } };
const include = { usuarioReportante: { select: usuario }, usuarioReportado: { select: { ...usuario, activo: true } } };
const obtenerUsuario = (id) => prisma.usuario.findUnique({ where: { id }, select: { id: true, activo: true } });
const crear = (data) => prisma.reporte.create({ data, include });
const listar = (estado) => prisma.reporte.findMany({ where: estado ? { estado } : {}, include, orderBy: [{ creadoEn: 'desc' }, { id: 'desc' }] });
const obtener = (id) => prisma.reporte.findUnique({ where: { id }, include });
// Comparar el estado anterior evita sobrescribir una decisión concurrente.
const actualizarEstado = (id, estadoAnterior, estado) => prisma.reporte.updateMany({ where: { id, estado: estadoAnterior }, data: { estado, resueltoEn: estado === 'PENDIENTE' ? null : new Date() } });
module.exports = { obtenerUsuario, crear, listar, obtener, actualizarEstado };
