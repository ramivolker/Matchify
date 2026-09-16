const ubicacionRepository = require("../repositories/ubicacion.repository");
const { validarUbicacion, validarId } = require("../validators/ubicacion.validator");
const NotFoundError = require("../errors/not-found-error");

const crear = async (datos) => {
  validarUbicacion(datos);

  return ubicacionRepository.crear(datos);
};

const obtenerTodas = async () => {
  return ubicacionRepository.obtenerTodas();
};

const obtenerPorId = async (id) => {
  validarId(id);

  const ubicacion = await ubicacionRepository.obtenerPorId(id);

  if (!ubicacion) {
    throw new NotFoundError("Ubicación no encontrada");
  }

  return ubicacion;
};

const actualizar = async (id, datos) => {
  validarId(id);
  validarUbicacion(datos);

  await obtenerPorId(id);

  return ubicacionRepository.actualizar(id, datos);
};

const eliminar = async (id) => {
  validarId(id);

  await obtenerPorId(id);

  return ubicacionRepository.eliminar(id);
};

module.exports = {
  crear,
  obtenerTodas,
  obtenerPorId,
  actualizar,
  eliminar,
};