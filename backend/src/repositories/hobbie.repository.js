const prisma = require("../config/prisma");

const crear = async (datos) => {
  return prisma.hobbie.create({
    data: {
      nombre: datos.nombre,
      emoji: datos.emoji ?? null,
    },
  });
};

const obtenerTodos = async () => {
  return prisma.hobbie.findMany();
};

const obtenerPorId = async (id) => {
  return prisma.hobbie.findUnique({
    where: { id },
  });
};

const actualizar = async (id, datos) => {
  return prisma.hobbie.update({
    where: { id },
    data: {
      nombre: datos.nombre,
      emoji: datos.emoji ?? null,
    },
  });
};

const eliminar = async (id) => {
  return prisma.hobbie.delete({
    where: { id },
  });
};

module.exports = {
  crear,
  obtenerTodos,
  obtenerPorId,
  actualizar,
  eliminar,
};