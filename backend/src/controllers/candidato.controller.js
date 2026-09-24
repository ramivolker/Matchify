const candidatoService = require("../services/candidato.service");
const asyncHandler = require("../middlewares/async-handler");

const obtenerCandidatos = asyncHandler(async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  const candidatos = await candidatoService.obtenerCandidatos(usuarioId);

  res.status(200).json(candidatos);
});

module.exports = { obtenerCandidatos };
