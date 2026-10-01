const prisma = require("../config/prisma");

const obtenerSolicitante = async (usuarioId) => {
  return prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true, preferencia: { include: { generos: true } }, ubicacion: true },
  });
};

const obtenerCandidatos = async (usuarioId, generos) => {
  return prisma.usuario.findMany({
    where: {
      id: { not: usuarioId },
      activo: true,
      genero: { in: generos },

      interaccionesRecibidas: {
        none: { usuarioEmisorId: usuarioId },
      },

      // El usuario actual NO bloqueó al candidato
      bloqueosRecibidos: {
        none: { usuarioBloqueadorId: usuarioId },
      },

      // El candidato NO bloqueó al usuario actual
      bloqueosRealizados: {
        none: { usuarioBloqueadoId: usuarioId },
      },

      ubicacion: { isNot: null },
    },

    select: {
      id: true,
      nombre: true,
      apellido: true,
      fechaNacimiento: true,
      biografia: true,
      genero: true,
      ubicacion: true,
      tipoUsuario: true,
      hobbies: {
        select: {
          hobbie: true,
        },
      },
    },
  });
};

module.exports = { obtenerSolicitante, obtenerCandidatos };
