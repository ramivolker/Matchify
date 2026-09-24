const interaccionService = require("../services/interaccion.service");

async function crear(req, res) {
  try {
    const usuarioEmisorId = Number(req.body.usuarioEmisorId);
    const usuarioDestinatarioId = Number(req.body.usuarioDestinatarioId);
    const tipo = req.body.tipo;

    const resultado = await interaccionService.crearInteraccion(
      usuarioEmisorId,
      usuarioDestinatarioId,
      tipo
    );

    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

module.exports = {
  crear,
};