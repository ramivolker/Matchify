const express = require("express");
const fotoController = require("../controllers/foto.controller");

const router = express.Router();

router.get("/:usuarioId/fotos", fotoController.obtenerFotos);
router.post("/:usuarioId/fotos", fotoController.agregarFoto);
router.delete("/:usuarioId/fotos/:fotoId", fotoController.eliminarFoto);
router.put("/:usuarioId/fotos/reordenar", fotoController.reordenarFotos);
router.put("/:usuarioId/fotos/:fotoId/principal", fotoController.marcarPrincipal);

module.exports = router;
