const ubicacionRepository = require("../repositories/ubicacion.repository");

const crear = async (datos) => {
  return ubicacionRepository.crear(datos);
};

const obtenerTodas = async () => {
  return ubicacionRepository.obtenerTodas();
};

const obtenerPorId = async (id) => {
  const ubicacion = await ubicacionRepository.obtenerPorId(id);

  if (!ubicacion) {
    throw new Error("Ubicación no encontrada");
  }

  return ubicacion;
};

const actualizar = async (id, datos) => {
  await obtenerPorId(id);

  return ubicacionRepository.actualizar(id, datos);
};

const eliminar = async (id) => {
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