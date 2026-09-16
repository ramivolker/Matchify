const tipoUsuarioRepository = require("../repositories/tipo-usuario.repository");
const { validarTipoUsuario, validarId } = require("../validators/tipo-usuario.validator");
const ValidationError = require("../errors/validation-error");
const NotFoundError = require("../errors/not-found-error");

const comprobarNombre = async (nombre, id) => {
  const tipoUsuario = await tipoUsuarioRepository.obtenerPorNombre(nombre);

  if (tipoUsuario && tipoUsuario.id !== id) {
    throw new ValidationError("Ya existe un tipo de usuario con ese nombre");
  }
};

const crear = async (datos) => {
  validarTipoUsuario(datos);
  await comprobarNombre(datos.nombre);

  return tipoUsuarioRepository.crear(datos);
};

const obtenerTodos = async () => {
  return tipoUsuarioRepository.obtenerTodos();
};

const obtenerPorId = async (id) => {
  validarId(id);
  const tipoUsuario = await tipoUsuarioRepository.obtenerPorId(id);

  if (!tipoUsuario) {
    throw new NotFoundError("Tipo de usuario no encontrado");
  }

  return tipoUsuario;
};

const actualizar = async (id, datos) => {
  validarId(id);
  validarTipoUsuario(datos);
  await obtenerPorId(id);
  await comprobarNombre(datos.nombre, id);

  return tipoUsuarioRepository.actualizar(id, datos);
};

const eliminar = async (id) => {
  validarId(id);
  await obtenerPorId(id);

  const cantidadUsuarios = await tipoUsuarioRepository.contarUsuarios(id);

  if (cantidadUsuarios > 0) {
    throw new ValidationError("No se puede eliminar el tipo de usuario porque está siendo utilizado por usuarios");
  }

  return tipoUsuarioRepository.eliminar(id);
};

module.exports = {
  crear,
  obtenerTodos,
  obtenerPorId,
  actualizar,
  eliminar,
};
