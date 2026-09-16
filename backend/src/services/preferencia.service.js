const preferenciaRepository = require("../repositories/preferencia.repository");
const usuarioRepository = require("../repositories/usuario.repository");
const { validarUsuarioId, validarPreferencia } = require("../validators/preferencia.validator");
const ValidationError = require("../errors/validation-error");
const NotFoundError = require("../errors/not-found-error");

const comprobarUsuario = async (usuarioId) => {
  const usuario = await usuarioRepository.obtenerPorId(usuarioId);

  if (!usuario) {
    throw new NotFoundError("Usuario no encontrado");
  }
};

const crear = async (usuarioId, datos) => {
  validarUsuarioId(usuarioId);
  validarPreferencia(datos);
  await comprobarUsuario(usuarioId);

  const preferencia = await preferenciaRepository.obtenerPorUsuarioId(usuarioId);

  if (preferencia) {
    throw new ValidationError("El usuario ya tiene una preferencia");
  }

  return preferenciaRepository.crear({ ...datos, usuarioId });
};

const obtenerPorUsuarioId = async (usuarioId) => {
  validarUsuarioId(usuarioId);
  await comprobarUsuario(usuarioId);

  const preferencia = await preferenciaRepository.obtenerPorUsuarioId(usuarioId);

  if (!preferencia) {
    throw new NotFoundError("Preferencia no encontrada");
  }

  return preferencia;
};

const actualizar = async (usuarioId, datos) => {
  validarUsuarioId(usuarioId);
  validarPreferencia(datos);
  await obtenerPorUsuarioId(usuarioId);

  return preferenciaRepository.actualizar(usuarioId, datos);
};

const eliminar = async (usuarioId) => {
  validarUsuarioId(usuarioId);
  await obtenerPorUsuarioId(usuarioId);

  return preferenciaRepository.eliminar(usuarioId);
};

module.exports = {
  crear,
  obtenerPorUsuarioId,
  actualizar,
  eliminar,
};
