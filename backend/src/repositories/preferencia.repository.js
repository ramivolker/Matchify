const prisma = require("../config/prisma");

const crear = async (datos) => {
  return prisma.preferencia.create({ data: datos });
};

const obtenerPorUsuarioId = async (usuarioId) => {
  return prisma.preferencia.findUnique({ where: { usuarioId } });
};

const actualizar = async (usuarioId, datos) => {
  return prisma.preferencia.update({
    where: { usuarioId },
    data: datos,
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
