const matchService = require("../services/match.service");
const asyncHandler = require('../middlewares/async-handler');

const obtenerPorUsuario = asyncHandler(async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);

  const matches = await matchService.obtenerMatchesPorUsuario(usuarioId);

  res.status(200).json(matches);
});

module.exports = {
  obtenerPorUsuario,
};
