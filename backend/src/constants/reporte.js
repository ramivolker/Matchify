// Catálogo compartido con el frontend mediante GET /api/reportes/motivos.
const MOTIVOS_REPORTE = {
  inappropriate: 'Contenido o fotos inapropiadas',
  spam: 'Spam, estafa o cuenta falsa',
  harassment: 'Acoso o comportamiento irrespetuoso',
  underage: 'Sospecha de menor de edad',
  other: 'Otro motivo',
};
const ESTADOS_REPORTE = ['PENDIENTE', 'RESUELTO', 'DESCARTADO'];
module.exports = { MOTIVOS_REPORTE, ESTADOS_REPORTE };
