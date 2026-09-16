const prisma = require("../config/prisma");

const crear = async (datos) => {
  return prisma.tipoUsuario.create({
    data: datos,
  });
};

const obtenerTodos = async () => {
  return prisma.tipoUsuario.findMany();
};

const obtenerPorId = async (id) => {
  return prisma.tipoUsuario.findUnique({
    where: { id },
  });
};

const obtenerPorNombre = async (nombre) => {
  return prisma.tipoUsuario.findUnique({ where: { nombre } });
};

const contarUsuarios = async (tipoUsuarioId) => {
  return prisma.usuario.count({ where: { tipoUsuarioId } });
};

const actualizar = async (id, datos) => {
  return prisma.tipoUsuario.update({
    where: { id },
    data: datos,
  });
};

const eliminar = async (id) => {
  return prisma.tipoUsuario.delete({
    where: { id },
  });
};

module.exports = {
  crear,
  obtenerTodos,
  obtenerPorId,
  obtenerPorNombre,
  contarUsuarios,
  actualizar,
  eliminar,
};
