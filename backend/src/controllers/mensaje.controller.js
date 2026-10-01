const service = require('../services/mensaje.service');
const asyncHandler = require('../middlewares/async-handler');

const obtenerHistorial = asyncHandler(async (req, res) => {
  res.json(await service.obtenerHistorial(Number(req.params.matchId), Number(req.query.usuarioId)));
});
const crear = asyncHandler(async (req, res) => {
  res.status(201).json(await service.crear(Number(req.params.matchId), req.body));
});
const marcarLeidos = asyncHandler(async (req, res) => {
  res.json(await service.marcarLeidos(Number(req.params.matchId), req.body));
});

module.exports = { obtenerHistorial, crear, marcarLeidos };
