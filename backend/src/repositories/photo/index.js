const { PrismaClient } = require('../../config/prisma');

const prisma = new PrismaClient();

async function crearFoto(datos) {
  return prisma.foto.create({
    data: datos,
    include: {
      usuario: true,
    },
  });
}

async function obtenerFotos(usuarioId) {
  return prisma.foto.findMany({
    where: { usuarioId },
    orderBy: {
      esPrincipal: 'desc',
      fechaCreacion: 'asc',
    },
  });
}

async function eliminarFoto(id, usuarioId) {
  return prisma.foto.deleteMany({
    where: {
      id,
      usuarioId,
    },
  });
}

module.exports = {
  crearFoto,
  obtenerFotos,
  eliminarFoto,
};