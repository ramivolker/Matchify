const express = require("express");
const interaccionController = require("../controllers/interaccion.controller");

const router = express.Router();

router.post("/", interaccionController.crear);

module.exports = router;