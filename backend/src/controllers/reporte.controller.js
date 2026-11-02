const service = require('../services/reporte.service');
const asyncHandler = require('../middlewares/async-handler');
const { MOTIVOS_REPORTE } = require('../constants/reporte');
module.exports = {
  conversacion: asyncHandler(async (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json(await service.obtenerConversacion(Number(req.params.id)));
  }),
  motivos: (req, res) => res.json(MOTIVOS_REPORTE),
  crear: asyncHandler(async (req, res) => res.status(201).json(await service.crear(req.body))),
  listar: asyncHandler(async (req, res) => res.json(await service.listar(req.query.estado))),
  obtener: asyncHandler(async (req, res) => res.json(await service.obtener(Number(req.params.id)))),
  actualizarEstado: asyncHandler(async (req, res) => res.json(await service.actualizarEstado(Number(req.params.id), req.body))),
};
