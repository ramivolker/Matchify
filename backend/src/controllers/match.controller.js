const matchService = require("../services/match.service");

async function obtenerPorUsuario(req, res) {
  try {
    const usuarioId = Number(req.params.usuarioId);

    const matches = await matchService.obtenerMatchesPorUsuario(usuarioId);

    res.status(200).json(matches);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

module.exports = {
  obtenerPorUsuario,
};