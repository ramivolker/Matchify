const usuarioRepository = require("../repositories/usuario.repository");
const ubicacionRepository = require("../repositories/ubicacion.repository");
const { validarUsuario, validarId } = require("../validators/usuario.validator");
const NotFoundError = require("../errors/not-found-error");
const ValidationError = require("../errors/validation-error");

const validarReferencias = async (datos, id) => {
  const usuarioConEmail = await usuarioRepository.obtenerPorEmail(datos.email);

  if (usuarioConEmail && usuarioConEmail.id !== id) {
    throw new ValidationError("Ya existe un usuario con ese email");
  }

  if (datos.ubicacionId != null) {
    const ubicacion = await ubicacionRepository.obtenerPorId(datos.ubicacionId);
    if (!ubicacion) {
      throw new ValidationError("La ubicación indicada no existe");
    }
  }

  if (datos.tipoUsuarioId != null) {
    const tipoUsuario = await usuarioRepository.obtenerTipoUsuarioPorId(datos.tipoUsuarioId);
    if (!tipoUsuario) {
      throw new ValidationError("El tipo de usuario indicado no existe");
    }
  }
};

const crear = async (datos) => {
  validarUsuario(datos);
  await validarReferencias(datos);

  return usuarioRepository.crear({
    ...datos,
    fechaNacimiento: new Date(datos.fechaNacimiento),
  });
};

const obtenerTodos = async () => {
  return usuarioRepository.obtenerTodos();
};

const obtenerPorId = async (id) => {
  validarId(id);
  const usuario = await usuarioRepository.obtenerPorId(id);

  if (!usuario) {
    throw new NotFoundError("Usuario no encontrado");
  }

  return usuario;
};

const actualizar = async (id, datos) => {
  validarId(id);
  validarUsuario(datos);
  await obtenerPorId(id);
  await validarReferencias(datos, id);

  return usuarioRepository.actualizar(id, {
    ...datos,
    fechaNacimiento: new Date(datos.fechaNacimiento),
  });
};

const eliminar = async (id) => {
  validarId(id);
  await obtenerPorId(id);

  return usuarioRepository.eliminar(id);
};

module.exports = {
  crear,
  obtenerTodos,
  obtenerPorId,
  actualizar,
  eliminar,
};
