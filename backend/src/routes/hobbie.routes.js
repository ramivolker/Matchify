const express = require("express");
const hobbieController = require("../controllers/hobbie.controller");

const router = express.Router();


router.post("/", hobbieController.crear);
router.get("/", hobbieController.obtenerTodos);

router.get("/:id", hobbieController.obtenerPorId);
router.put("/:id", hobbieController.actualizar);
router.delete("/:id", hobbieController.eliminar);

module.exports = router;