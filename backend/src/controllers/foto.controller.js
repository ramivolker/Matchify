const fotoService = require("../services/foto.service");
const asyncHandler = require("../middlewares/async-handler");

const obtenerFotos = asyncHandler(async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  const fotos = await fotoService.obtenerPorUsuario(usuarioId);
  res.status(200).json(fotos);
});

const agregarFoto = asyncHandler(async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);

  if (Array.isArray(req.body.fotos)) {
    const fotos = await fotoService.agregarFotosMultiples(usuarioId, req.body.fotos);
    return res.status(201).json(fotos);
  }

  const foto = await fotoService.agregarFoto(usuarioId, req.body);
  res.status(201).json(foto);
});

const eliminarFoto = asyncHandler(async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  const fotoId = Number(req.params.fotoId);
  await fotoService.eliminarFoto(usuarioId, fotoId);
  res.status(204).send();
});

const marcarPrincipal = asyncHandler(async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  const fotoId = Number(req.params.fotoId);
  const fotos = await fotoService.marcarPrincipal(usuarioId, fotoId);
  res.status(200).json(fotos);
});

const reordenarFotos = asyncHandler(async (req, res) => {
  const usuarioId = Number(req.params.usuarioId);
  const fotosIds = Array.isArray(req.body) ? req.body : (req.body.fotosIds || req.body.ordenIds || []);
  const fotos = await fotoService.reordenarFotos(usuarioId, fotosIds);
  res.status(200).json(fotos);
});

module.exports = {
  obtenerFotos,
  agregarFoto,
  eliminarFoto,
  marcarPrincipal,
  reordenarFotos,
};
