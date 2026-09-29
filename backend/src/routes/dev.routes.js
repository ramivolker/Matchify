const router = require('express').Router();
const controller = require('../controllers/dev.controller');
const { verificarDesarrollo } = require('../services/dev.service');

// Evaluar en cada request y antes de validar IDs o acceder a la base.
router.use((req, res, next) => {
  verificarDesarrollo();
  next();
});
router.get('/interacciones', controller.estado);
router.delete('/interacciones', controller.resetear);
router.delete('/usuarios/:usuarioId/interacciones', controller.resetear);

module.exports = router;
