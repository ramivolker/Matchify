const hobbieRepository = require("../repositories/hobbie.repository");
const { validarHobbie, validarId } = require("../validators/hobbie.validator");
const NotFoundError = require("../errors/not-found-error");

const crear = async (datos) => {
  validarHobbie(datos);

  return hobbieRepository.crear(datos);
};

const obtenerTodos = async () => {
  return hobbieRepository.obtenerTodos();
};

const obtenerPorId = async (id) => {
  validarId(id);

  const hobbie = await hobbieRepository.obtenerPorId(id);

  if (!hobbie) {
    throw new NotFoundError("Hobbie no encontrado");
  }

  return hobbie;
};

const actualizar = async (id, datos) => {
  validarId(id);
  validarHobbie(datos);

  await obtenerPorId(id);

  return hobbieRepository.actualizar(id, datos);
};

const eliminar = async (id) => {
  validarId(id);

  await obtenerPorId(id);

  return hobbieRepository.eliminar(id);
};

module.exports = {
  crear,
  obtenerTodos,
  obtenerPorId,
  actualizar,
  eliminar,
};