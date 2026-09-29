const bloqueoService = require("../services/bloqueo.service");

async function bloquear(req, res) {
  try {
    const usuarioBloqueadorId = Number(req.body.usuarioBloqueadorId);
    const usuarioBloqueadoId = Number(req.body.usuarioBloqueadoId);

    const bloqueo = await bloqueoService.bloquearUsuario(
      usuarioBloqueadorId,
      usuarioBloqueadoId
    );

    res.status(201).json(bloqueo);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

async function obtenerBloqueados(req, res) {
  try {
    const usuarioId = Number(req.params.usuarioId);

    const bloqueados = await bloqueoService.obtenerBloqueados(usuarioId);

    res.json(bloqueados);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

async function desbloquear(req, res) {
  try {
    const usuarioBloqueadorId = Number(req.params.usuarioBloqueadorId);
    const usuarioBloqueadoId = Number(req.params.usuarioBloqueadoId);

    const bloqueo = await bloqueoService.desbloquearUsuario(
      usuarioBloqueadorId,
      usuarioBloqueadoId
    );

    res.json({
      mensaje: "Usuario desbloqueado correctamente",
      bloqueo,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

module.exports = {
  bloquear,
  obtenerBloqueados,
  desbloquear,
};