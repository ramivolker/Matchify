const usuarioService = require("../services/usuario.service");
const asyncHandler = require("../middlewares/async-handler");

const crear = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.crear(req.body);

  res.status(201).json(usuario);
});

const obtenerTodos = asyncHandler(async (req, res) => {
  const usuarios = await usuarioService.obtenerTodos();

  res.status(200).json(usuarios);
});

const obtenerPorId = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const usuario = await usuarioService.obtenerPorId(id);

  res.status(200).json(usuario);
});

const actualizar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const usuario = await usuarioService.actualizar(id, req.body);

  res.status(200).json(usuario);
});

const eliminar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  await usuarioService.eliminar(id);

  res.status(204).send();
});

module.exports = {
  crear,
  obtenerTodos,
  obtenerPorId,
  actualizar,
  eliminar,
};