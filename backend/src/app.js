const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const ubicacionRoutes = require("./routes/ubicacion.routes");
const hobbieRoutes = require("./routes/hobbie.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const usuarioHobbieRoutes = require("./routes/usuario-hobbie.routes");
const preferenciaRoutes = require("./routes/preferencia.routes");
const tipoUsuarioRoutes = require("./routes/tipo-usuario.routes");
const interaccionRoutes = require("./routes/interaccion.routes");
const app = express();
const errorHandler = require("./middlewares/error.middleware");

app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, "../../frontend/dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}
app.use("/api/ubicaciones", ubicacionRoutes);
app.use("/api/hobbies", hobbieRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/usuarios", usuarioHobbieRoutes);
app.use("/api/usuarios", preferenciaRoutes);
app.use("/api/tipos-usuario", tipoUsuarioRoutes);
app.use("/api/interacciones", interaccionRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Matchify API funcionando",
  });
});

app.use(errorHandler);

module.exports = app;
