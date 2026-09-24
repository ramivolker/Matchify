const express = require("express");
const matchController = require("../controllers/match.controller");

const router = express.Router();

router.get("/:usuarioId", matchController.obtenerPorUsuario);

module.exports = router;