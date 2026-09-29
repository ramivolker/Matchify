const service = require('../services/dev.service');
const asyncHandler = require('../middlewares/async-handler');

const estado = (req, res) => res.json({ habilitado: true });
const resetear = asyncHandler(async (req, res) => {
  const usuarioId = req.params.usuarioId === undefined ? undefined : Number(req.params.usuarioId);
  res.json(await service.resetearInteracciones(usuarioId));
});

module.exports = { estado, resetear };
