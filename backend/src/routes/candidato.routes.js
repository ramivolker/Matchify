const express = require("express");
const candidatoController = require("../controllers/candidato.controller");

const router = express.Router();

router.get("/:usuarioId/candidatos", candidatoController.obtenerCandidatos);

module.exports = router;
