const express = require("express");
const bloqueoController = require("../controllers/bloqueo.controller");

const router = express.Router();

router.post("/", bloqueoController.bloquear);

router.get(
  "/usuario/:usuarioId",
  bloqueoController.obtenerBloqueados
);

router.delete(
  "/:usuarioBloqueadorId/:usuarioBloqueadoId",
  bloqueoController.desbloquear
);

module.exports = router;