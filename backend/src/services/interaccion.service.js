const interaccionRepository = require("../repositories/interaccion.repository");
const matchRepository = require("../repositories/match.repository");

async function crearInteraccion(usuarioEmisorId, usuarioDestinatarioId, tipo) {
  if (usuarioEmisorId === usuarioDestinatarioId) {
    throw new Error("Un usuario no puede interactuar consigo mismo");
  }

  const existente = await interaccionRepository.buscarInteraccion(
    usuarioEmisorId,
    usuarioDestinatarioId
  );

  if (existente) {
    throw new Error("Ya existe una interacción entre estos usuarios");
  }

  const interaccion = await interaccionRepository.crearInteraccion(
    usuarioEmisorId,
    usuarioDestinatarioId,
    tipo
  );

  let match = null;

  if (tipo === "LIKE") {
    const interaccionInversa = await interaccionRepository.buscarInteraccion(
      usuarioDestinatarioId,
      usuarioEmisorId
    );

    if (interaccionInversa && interaccionInversa.tipo === "LIKE") {
      match = await matchRepository.crearMatch(
        usuarioEmisorId,
        usuarioDestinatarioId
      );
    }
  }

  return {
    interaccion,
    match,
  };
}

module.exports = {
  crearInteraccion,
};