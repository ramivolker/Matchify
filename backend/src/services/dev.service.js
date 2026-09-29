const repository = require('../repositories/dev.repository');
const AppError = require('../errors/app-error');
const { validarId } = require('../validators/usuario.validator');

const verificarDesarrollo = () => {
  if (process.env.NODE_ENV === 'production') {
    throw new AppError('El reset de interacciones está deshabilitado en producción', 403);
  }
};

const resetearInteracciones = (usuarioId) => {
  verificarDesarrollo();
  if (usuarioId !== undefined) validarId(usuarioId);
  return repository.resetearInteracciones(usuarioId);
};

module.exports = { verificarDesarrollo, resetearInteracciones };
