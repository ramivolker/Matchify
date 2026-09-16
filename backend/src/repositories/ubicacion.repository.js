const prisma = require("../config/prisma");

const crear = async (datos) => {
  return prisma.ubicacion.create({
    data: datos,
  });
};

const obtenerTodas = async () => {
  return prisma.ubicacion.findMany();
};

const obtenerPorId = async (id) => {
  return prisma.ubicacion.findUnique({
    where: { id },
  });
};

const actualizar = async (id, datos) => {
  return prisma.ubicacion.update({
    where: { id },
    data: datos,
  });
};

const eliminar = async (id) => {
  return prisma.ubicacion.delete({
    where: { id },
  });
};

module.exports = {
  crear,
  obtenerTodas,
  obtenerPorId,
  actualizar,
  eliminar,
};