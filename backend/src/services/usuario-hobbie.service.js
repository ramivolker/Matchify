const usuarioHobbieRepository = require("../repositories/usuario-hobbie.repository");
const usuarioRepository = require("../repositories/usuario.repository");
const hobbieRepository = require("../repositories/hobbie.repository");
const { validarUsuarioId, validarHobbieId } = require("../validators/usuario-hobbie.validator");
const ValidationError = require("../errors/validation-error");
const NotFoundError = require("../errors/not-found-error");

const comprobarUsuario = async (usuarioId) => {
  const usuario = await usuarioRepository.obtenerPorId(usuarioId);

  if (!usuario) {
    throw new NotFoundError("Usuario no encontrado");
  }
};

const comprobarHobbie = async (hobbieId) => {
  const hobbie = await hobbieRepository.obtenerPorId(hobbieId);

  if (!hobbie) {
    throw new NotFoundError("Hobbie no encontrado");
  }
};

const asociar = async (usuarioId, hobbieId) => {
  validarUsuarioId(usuarioId);
  validarHobbieId(hobbieId);
  await comprobarUsuario(usuarioId);
  await comprobarHobbie(hobbieId);

  const asociacion = await usuarioHobbieRepository.obtenerAsociacion(usuarioId, hobbieId);

  if (asociacion) {
    throw new ValidationError("El hobbie ya está asociado al usuario");
  }

  return usuarioHobbieRepository.asociar(usuarioId, hobbieId);
};

const obtenerHobbies = async (usuarioId) => {
  validarUsuarioId(usuarioId);
  await comprobarUsuario(usuarioId);

  const asociaciones = await usuarioHobbieRepository.obtenerHobbies(usuarioId);

  return asociaciones.map((asociacion) => asociacion.hobbie);
};

const eliminar = async (usuarioId, hobbieId) => {
  validarUsuarioId(usuarioId);
  validarHobbieId(hobbieId);
  await comprobarUsuario(usuarioId);
  await comprobarHobbie(hobbieId);

  const asociacion = await usuarioHobbieRepository.obtenerAsociacion(usuarioId, hobbieId);

  if (!asociacion) {
    throw new NotFoundError("El hobbie no está asociado al usuario");
  }

  return usuarioHobbieRepository.eliminar(usuarioId, hobbieId);
};

module.exports = {
  asociar,
  obtenerHobbies,
  eliminar,
};
