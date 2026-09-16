const prisma = require("../config/prisma");

const obtenerAsociacion = async (usuarioId, hobbieId) => {
  return prisma.usuarioHobbie.findUnique({
    where: { usuarioId_hobbieId: { usuarioId, hobbieId } },
  });
};

const asociar = async (usuarioId, hobbieId) => {
  return prisma.usuarioHobbie.create({
    data: { usuarioId, hobbieId },
    include: { hobbie: true },
  });
};

const obtenerHobbies = async (usuarioId) => {
  return prisma.usuarioHobbie.findMany({
    where: { usuarioId },
    include: { hobbie: true },
  });
};

const eliminar = async (usuarioId, hobbieId) => {
  return prisma.usuarioHobbie.delete({
    where: { usuarioId_hobbieId: { usuarioId, hobbieId } },
  });
};

module.exports = {
  obtenerAsociacion,
  asociar,
  obtenerHobbies,
  eliminar,
};
