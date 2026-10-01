const prisma = require("../config/prisma");

const crear = async (datos) => {
  const { generos, ...campos } = datos;
  return prisma.preferencia.create({
    data: { ...campos, generos: { create: generos.map((genero) => ({ genero })) } },
    include: { generos: true },
  });
};

const obtenerPorUsuarioId = async (usuarioId) => {
  return prisma.preferencia.findUnique({ where: { usuarioId }, include: { generos: true } });
};

const actualizar = async (usuarioId, datos) => {
  const { generos, ...campos } = datos;
  return prisma.preferencia.update({
    where: { usuarioId },
    // La escritura anidada reemplaza la selección en una única transacción.
    data: { ...campos, generos: { deleteMany: {}, create: generos.map((genero) => ({ genero })) } },
    include: { generos: true },
  });
};

const eliminar = async (usuarioId) => {
  return prisma.preferencia.delete({ where: { usuarioId } });
};

module.exports = {
  crear,
  obtenerPorUsuarioId,
  actualizar,
  eliminar,
};
