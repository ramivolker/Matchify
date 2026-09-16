const hobbieService = require("../services/hobbie.service");
const asyncHandler = require("../middlewares/async-handler");

const crear = asyncHandler(async (req, res) => {
  const hobbie = await hobbieService.crear(req.body);

  res.status(201).json(hobbie);
});

const obtenerTodos = asyncHandler(async (req, res) => {
  const hobbies = await hobbieService.obtenerTodos();

  res.status(200).json(hobbies);
});

const obtenerPorId = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const hobbie = await hobbieService.obtenerPorId(id);

  res.status(200).json(hobbie);
});

const actualizar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const hobbie = await hobbieService.actualizar(id, req.body);

  res.status(200).json(hobbie);
});

const eliminar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  await hobbieService.eliminar(id);

  res.status(204).send();
});

module.exports = {
  crear,
  obtenerTodos,
  obtenerPorId,
  actualizar,
  eliminar,
};