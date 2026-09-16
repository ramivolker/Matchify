const prisma = require("../config/prisma");

const crear = async (datos) => {
  return prisma.usuario.create({ data: datos });
};

const obtenerTodos = async () => {
  return prisma.usuario.findMany({ include: { ubicacion: true } });
};

const obtenerPorId = async (id) => {
  return prisma.usuario.findUnique({
    where: { id },
    include: { ubicacion: true },
  });
};

const obtenerPorEmail = async (email) => {
  return prisma.usuario.findUnique({ where: { email } });
};

const obtenerTipoUsuarioPorId = async (id) => {
  return prisma.tipoUsuario.findUnique({ where: { id } });
};

const actualizar = async (id, datos) => {
  return prisma.usuario.update({ where: { id }, data: datos });
};

const eliminar = async (id) => {
  return prisma.usuario.delete({ where: { id } });
};

module.exports = {
  crear,
  obtenerTodos,
  obtenerPorId,
  obtenerPorEmail,
  obtenerTipoUsuarioPorId,
  actualizar,
  eliminar,
};
