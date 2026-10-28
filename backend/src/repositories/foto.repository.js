const prisma = require("../config/prisma");

const crear = async (datos) => {
  return prisma.foto.create({ data: datos });
};

const crearMuchas = async (datosArray) => {
  return prisma.foto.createMany({ data: datosArray });
};

const obtenerPorUsuarioId = async (usuarioId) => {
  return prisma.foto.findMany({
    where: { usuarioId },
    orderBy: { orden: "asc" },
  });
};

const obtenerPorId = async (id) => {
  return prisma.foto.findUnique({
    where: { id },
  });
};

const obtenerMaxOrden = async (usuarioId) => {
  const ultima = await prisma.foto.findFirst({
    where: { usuarioId },
    orderBy: { orden: "desc" },
    select: { orden: true },
  });
  return ultima ? ultima.orden : -1;
};

const actualizar = async (id, datos) => {
  return prisma.foto.update({
    where: { id },
    data: datos,
  });
};

const eliminar = async (id) => {
  return prisma.foto.delete({
    where: { id },
  });
};

module.exports = {
  crear,
  crearMuchas,
  obtenerPorUsuarioId,
  obtenerPorId,
  obtenerMaxOrden,
  actualizar,
  eliminar,
};
