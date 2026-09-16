const express = require("express");
const ubicacionController = require("../controllers/ubicacion.controller");

const router = express.Router();

router.post("/", ubicacionController.crear);
router.get("/", ubicacionController.obtenerTodas);
router.get("/:id", ubicacionController.obtenerPorId);
router.put("/:id", ubicacionController.actualizar);
router.delete("/:id", ubicacionController.eliminar);

module.exports = router;