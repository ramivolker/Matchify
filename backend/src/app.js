const express = require("express");
const cors = require("cors");
const ubicacionRoutes = require("./routes/ubicacion.routes");
const app = express();
const errorHandler = require("./middlewares/error.middleware");

app.use(cors());
app.use(express.json());
app.use("/api/ubicaciones", ubicacionRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Matchify API funcionando",
  });
});

app.use(errorHandler);

module.exports = app;