const tipoUsuarioService = require("../services/tipo-usuario.service");
const asyncHandler = require("../middlewares/async-handler");

const crear = asyncHandler(async (req, res) => {
  const tipoUsuario = await tipoUsuarioService.crear(req.body);

  res.status(201).json(tipoUsuario);
});

const obtenerTodos = asyncHandler(async (req, res) => {
  const tiposUsuario = await tipoUsuarioService.obtenerTodos();

  res.status(200).json(tiposUsuario);
});

const obtenerPorId = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const tipoUsuario = await tipoUsuarioService.obtenerPorId(id);

  res.status(200).json(tipoUsuario);
});

const actualizar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const tipoUsuario = await tipoUsuarioService.actualizar(id, req.body);

  res.status(200).json(tipoUsuario);
});

const eliminar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  await tipoUsuarioService.eliminar(id);

  res.status(204).send();
});

module.exports = {
  crear,
  obtenerTodos,
  obtenerPorId,
  actualizar,
  eliminar,
};