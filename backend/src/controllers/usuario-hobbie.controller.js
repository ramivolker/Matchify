const usuarioHobbieService = require("../services/usuario-hobbie.service");
const asyncHandler = require("../middlewares/async-handler");

const asociar = asyncHandler(async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  const hobbieId = Number(req.params.hobbieId);
  const asociacion = await usuarioHobbieService.asociar(usuarioId, hobbieId);

  res.status(201).json(asociacion);
});

const obtenerHobbies = asyncHandler(async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  const hobbies = await usuarioHobbieService.obtenerHobbies(usuarioId);

  res.status(200).json(hobbies);
});

const eliminar = asyncHandler(async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  const hobbieId = Number(req.params.hobbieId);

  await usuarioHobbieService.eliminar(usuarioId, hobbieId);

  res.status(204).send();
});

module.exports = {
  asociar,
  obtenerHobbies,
  eliminar,
};
