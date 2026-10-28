const fotoRepository = require("../repositories/foto.repository");
const usuarioRepository = require("../repositories/usuario.repository");
const { validarFoto, validarFotoId, validarUsuarioId } = require("../validators/foto.validator");
const NotFoundError = require("../errors/not-found-error");
const ValidationError = require("../errors/validation-error");
const prisma = require("../config/prisma");

const obtenerPorUsuario = async (usuarioId) => {
  validarUsuarioId(usuarioId);
  const usuario = await usuarioRepository.obtenerPorId(usuarioId);
  if (!usuario) {
    throw new NotFoundError("Usuario no encontrado");
  }
  return fotoRepository.obtenerPorUsuarioId(usuarioId);
};

const agregarFoto = async (usuarioId, datos) => {
  validarUsuarioId(usuarioId);
  const usuario = await usuarioRepository.obtenerPorId(usuarioId);
  if (!usuario) {
    throw new NotFoundError("Usuario no encontrado");
  }

  validarFoto(datos);

  let orden = datos.orden;
  if (orden === undefined || orden === null) {
    const maxOrden = await fotoRepository.obtenerMaxOrden(usuarioId);
    orden = maxOrden + 1;
  }

  return fotoRepository.crear({
    usuarioId,
    url: datos.url.trim(),
    orden,
  });
};

const agregarFotosMultiples = async (usuarioId, fotos) => {
  validarUsuarioId(usuarioId);
  const usuario = await usuarioRepository.obtenerPorId(usuarioId);
  if (!usuario) {
    throw new NotFoundError("Usuario no encontrado");
  }

  if (!Array.isArray(fotos) || fotos.length === 0) {
    throw new ValidationError("Se esperaba una lista de fotos");
  }

  const maxOrden = await fotoRepository.obtenerMaxOrden(usuarioId);
  let nextOrden = maxOrden + 1;

  const creadas = [];
  for (const item of fotos) {
    const url = typeof item === "string" ? item : item?.url;
    if (!url || typeof url !== "string" || !url.trim()) {
      continue;
    }
    const orden = typeof item === "object" && Number.isInteger(item.orden) ? item.orden : nextOrden++;
    const foto = await fotoRepository.crear({
      usuarioId,
      url: url.trim(),
      orden,
    });
    creadas.push(foto);
  }

  return creadas;
};

const eliminarFoto = async (usuarioId, fotoId) => {
  validarUsuarioId(usuarioId);
  validarFotoId(fotoId);

  const foto = await fotoRepository.obtenerPorId(fotoId);
  if (!foto) {
    throw new NotFoundError("Foto no encontrada");
  }

  if (foto.usuarioId !== usuarioId) {
    throw new ValidationError("La foto no pertenece a este usuario");
  }

  await fotoRepository.eliminar(fotoId);

  // Normalizar el orden de las fotos restantes
  const restantes = await fotoRepository.obtenerPorUsuarioId(usuarioId);
  for (let i = 0; i < restantes.length; i++) {
    if (restantes[i].orden !== i) {
      await fotoRepository.actualizar(restantes[i].id, { orden: i });
    }
  }

  return true;
};

const marcarPrincipal = async (usuarioId, fotoId) => {
  validarUsuarioId(usuarioId);
  validarFotoId(fotoId);

  const foto = await fotoRepository.obtenerPorId(fotoId);
  if (!foto) {
    throw new NotFoundError("Foto no encontrada");
  }

  if (foto.usuarioId !== usuarioId) {
    throw new ValidationError("La foto no pertenece a este usuario");
  }

  const fotos = await fotoRepository.obtenerPorUsuarioId(usuarioId);
  const otras = fotos.filter((f) => f.id !== fotoId);

  await prisma.$transaction(async (tx) => {
    await tx.foto.update({
      where: { id: fotoId },
      data: { orden: 0 },
    });
    for (let i = 0; i < otras.length; i++) {
      await tx.foto.update({
        where: { id: otras[i].id },
        data: { orden: i + 1 },
      });
    }
  });

  return fotoRepository.obtenerPorUsuarioId(usuarioId);
};

const reordenarFotos = async (usuarioId, fotosIds) => {
  validarUsuarioId(usuarioId);
  if (!Array.isArray(fotosIds) || fotosIds.length === 0) {
    throw new ValidationError("Se requiere una lista de IDs de fotos para reordenar");
  }

  const fotos = await fotoRepository.obtenerPorUsuarioId(usuarioId);
  const mapaExistentes = new Map(fotos.map((f) => [f.id, f]));

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < fotosIds.length; i++) {
      const id = Number(fotosIds[i]);
      if (mapaExistentes.has(id)) {
        await tx.foto.update({
          where: { id },
          data: { orden: i },
        });
      }
    }
  });

  return fotoRepository.obtenerPorUsuarioId(usuarioId);
};

module.exports = {
  obtenerPorUsuario,
  agregarFoto,
  agregarFotosMultiples,
  eliminarFoto,
  marcarPrincipal,
  reordenarFotos,
};
