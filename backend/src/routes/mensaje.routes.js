const router = require('express').Router();
const controller = require('../controllers/mensaje.controller');

router.get('/:matchId/mensajes', controller.obtenerHistorial);
router.post('/:matchId/mensajes', controller.crear);
router.patch('/:matchId/mensajes/leidos', controller.marcarLeidos);

module.exports = router;
