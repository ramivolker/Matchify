const repository = require('../repositories/usuario.repository');
const { validarId } = require('../validators/usuario.validator');
const NotFoundError = require('../errors/not-found-error');
const AppError = require('../errors/app-error');

const comprobarUsuarioActivo = (usuario) => {
  if (!usuario) throw new NotFoundError('Usuario no encontrado');
  if (usuario.activo !== true) throw new AppError('La cuenta está desactivada. No podés utilizar Matchify.', 403);
  return usuario;
};
// En produccion, el ID debe provenir de la sesion/token autenticado.
const validarUsuarioActivo = async (id, tx) => {
  validarId(id);
  return comprobarUsuarioActivo(await repository.obtenerEstado(id, tx));
};
module.exports = { comprobarUsuarioActivo, validarUsuarioActivo };
