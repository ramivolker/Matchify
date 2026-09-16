const express = require("express");
const preferenciaController = require("../controllers/preferencia.controller");

const router = express.Router();

router.post("/:usuarioId/preferencia", preferenciaController.crear);
router.get("/:usuarioId/preferencia", preferenciaController.obtenerPorUsuarioId);
router.put("/:usuarioId/preferencia", preferenciaController.actualizar);
router.delete("/:usuarioId/preferencia", preferenciaController.eliminar);

module.exports = router;
