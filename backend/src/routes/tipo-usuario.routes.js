const express = require("express");
const tipoUsuarioController = require("../controllers/tipo-usuario.controller");

const router = express.Router();


router.post("/", tipoUsuarioController.crear);
router.get("/", tipoUsuarioController.obtenerTodos);

router.get("/:id", tipoUsuarioController.obtenerPorId);
router.put("/:id", tipoUsuarioController.actualizar);
router.delete("/:id", tipoUsuarioController.eliminar);

module.exports = router;