const { PrismaClient } = require('../../config/prisma');

const prisma = new PrismaClient();

async function crearReporte(datos) {
  return prisma.reporte.create({
    data: datos,
    include: {
      usuario: true,
      reportado: true,
    },
  });
}

async function obtenerReportes() {
  return prisma.reporte.findMany({
    include: {
      usuario: true,
      reportado: true,
    },
    orderBy: {
      fechaReporte: 'desc',
    },
  });
}

async function eliminarReporte(id, adminId) {
  return prisma.reporte.deleteMany({
    where: {
      id,
      usuarioId: adminId,
    },
  });
}

module.exports = {
  crearReporte,
  obtenerReportes,
  eliminarReporte,
};