const express = require("express");
const matchController = require("../controllers/match.controller");

const router = express.Router();

router.get("/:usuarioId", matchController.obtenerPorUsuario);
router.delete("/:matchId", matchController.terminarMatch);
router.patch("/:matchId/terminar", matchController.terminarMatch);
router.post("/:matchId/terminar", matchController.terminarMatch);

module.exports = router;