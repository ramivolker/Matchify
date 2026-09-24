const matchRepository = require("../repositories/match.repository");

async function obtenerMatchesPorUsuario(usuarioId) {
  return matchRepository.obtenerMatchesPorUsuario(usuarioId);
}

module.exports = {
  obtenerMatchesPorUsuario,
};