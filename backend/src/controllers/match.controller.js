const matchService = require("../services/match.service");
const asyncHandler = require('../middlewares/async-handler');

const obtenerPorUsuario = asyncHandler(async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);

  const matches = await matchService.obtenerMatchesPorUsuario(usuarioId);

  res.status(200).json(matches);
});

const terminarMatch = asyncHandler(async (req, res) => {
  const matchId = Number(req.params.matchId);
  const usuarioId = req.query.usuarioId !== undefined ? Number(req.query.usuarioId) : (req.body?.usuarioId !== undefined ? Number(req.body.usuarioId) : undefined);

  const match = await matchService.terminarMatch(matchId, usuarioId);

  res.status(200).json({ ok: true, mensaje: 'Match terminado con éxito', match });
});

module.exports = {
  obtenerPorUsuario,
  terminarMatch,
};
