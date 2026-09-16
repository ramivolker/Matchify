const express = require("express");
const cors = require("cors");
const ubicacionRoutes = require("./routes/ubicacion.routes");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Matchify API funcionando",
  });
});

module.exports = app;