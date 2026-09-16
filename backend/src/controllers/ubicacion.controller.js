const ubicacionService = require("../services/ubicacion.service");
const asyncHandler = require("../middlewares/async-handler");

const crear = asyncHandler(async (req, res) => {
  const ubicacion = await ubicacionService.crear(req.body);

  res.status(201).json(ubicacion);
});

const obtenerTodas = asyncHandler(async (req, res) => {
  const ubicaciones = await ubicacionService.obtenerTodas();

  res.status(200).json(ubicaciones);
});

const obtenerPorId = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const ubicacion = await ubicacionService.obtenerPorId(id);

  res.status(200).json(ubicacion);
});

const actualizar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const ubicacion = await ubicacionService.actualizar(id, req.body);

  res.status(200).json(ubicacion);
});

const eliminar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  await ubicacionService.eliminar(id);

  res.status(204).send();
});

module.exports = {
  crear,
  obtenerTodas,
  obtenerPorId,
  actualizar,
  eliminar,
};