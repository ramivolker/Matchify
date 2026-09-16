const express = require("express");
const usuarioHobbieController = require("../controllers/usuario-hobbie.controller");

const router = express.Router();

router.post("/:usuarioId/hobbies/:hobbieId", usuarioHobbieController.asociar);
router.get("/:usuarioId/hobbies", usuarioHobbieController.obtenerHobbies);
router.delete("/:usuarioId/hobbies/:hobbieId", usuarioHobbieController.eliminar);

module.exports = router;
