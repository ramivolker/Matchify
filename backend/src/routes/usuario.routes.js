const express = require("express");
const usuarioController = require("../controllers/usuario.controller");

const router = express.Router();


router.post("/", usuarioController.crear);
router.get("/", usuarioController.obtenerTodos);

router.get("/:id", usuarioController.obtenerPorId);
router.put("/:id", usuarioController.actualizar);
router.delete("/:id", usuarioController.eliminar);

module.exports = router;