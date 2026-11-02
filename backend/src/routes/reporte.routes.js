const router = require('express').Router();
const controller = require('../controllers/reporte.controller');
router.get('/motivos', controller.motivos);
router.post('/', controller.crear);
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.get('/:id/conversacion', controller.conversacion);
router.patch('/:id/estado', controller.actualizarEstado);
module.exports = router;
