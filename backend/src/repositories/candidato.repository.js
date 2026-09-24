const prisma = require("../config/prisma");

const obtenerSolicitante = async (usuarioId) => {
  return prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true, preferencia: true, ubicacion: true },
  });
};

const obtenerCandidatos = async (usuarioId) => {
  return prisma.usuario.findMany({
    where: {
      id: { not: usuarioId },
      activo: true,
      ubicacion: { isNot: null },
    },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      fechaNacimiento: true,
      biografia: true,
      ubicacion: true,
      tipoUsuario: true,
      hobbies: { select: { hobbie: true } },
    },
  });
};

module.exports = { obtenerSolicitante, obtenerCandidatos };
