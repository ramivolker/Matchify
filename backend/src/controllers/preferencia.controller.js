const preferenciaService = require("../services/preferencia.service");
const asyncHandler = require("../middlewares/async-handler");

const crear = asyncHandler(async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  const preferencia = await preferenciaService.crear(usuarioId, req.body);

  res.status(201).json(preferencia);
});

const obtenerPorUsuarioId = asyncHandler(async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  const preferencia = await preferenciaService.obtenerPorUsuarioId(usuarioId);

  res.status(200).json(preferencia);
});

const actualizar = asyncHandler(async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  const preferencia = await preferenciaService.actualizar(usuarioId, req.body);

  res.status(200).json(preferencia);
});

const eliminar = asyncHandler(async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);

  await preferenciaService.eliminar(usuarioId);

  res.status(204).send();
});

module.exports = {
  crear,
  obtenerPorUsuarioId,
  actualizar,
  eliminar,
};
