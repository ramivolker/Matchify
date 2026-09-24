const candidatoRepository = require("../repositories/candidato.repository");
const { validarId } = require("../validators/usuario.validator");
const NotFoundError = require("../errors/not-found-error");
const ValidationError = require("../errors/validation-error");

const tieneCoordenadasValidas = (ubicacion) => {
  return ubicacion &&
    Number.isFinite(ubicacion.latitud) && Math.abs(ubicacion.latitud) <= 90 &&
    Number.isFinite(ubicacion.longitud) && Math.abs(ubicacion.longitud) <= 180;
};

const calcularEdad = (fechaNacimiento, hoy) => {
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getUTCFullYear() - nacimiento.getUTCFullYear();
  const diferenciaMes = hoy.getUTCMonth() - nacimiento.getUTCMonth();

  if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getUTCDate() < nacimiento.getUTCDate())) {
    edad--;
  }

  return edad;
};

const calcularDistanciaKm = (origen, destino) => {
  const radianes = (grados) => grados * Math.PI / 180;
  const diferenciaLatitud = radianes(destino.latitud - origen.latitud);
  const diferenciaLongitud = radianes(destino.longitud - origen.longitud);
  const a = Math.sin(diferenciaLatitud / 2) ** 2 +
    Math.cos(radianes(origen.latitud)) * Math.cos(radianes(destino.latitud)) *
    Math.sin(diferenciaLongitud / 2) ** 2;
  // Evita errores de dominio por imprecision de punto flotante en puntos antipodas.
  const valor = Math.min(1, Math.max(0, a));

  return 6371 * 2 * Math.atan2(Math.sqrt(valor), Math.sqrt(1 - valor));
};

const obtenerCandidatos = async (usuarioId) => {
  validarId(usuarioId);
  const solicitante = await candidatoRepository.obtenerSolicitante(usuarioId);

  if (!solicitante) {
    throw new NotFoundError("Usuario no encontrado");
  }

  if (!solicitante.preferencia) {
    throw new ValidationError("El usuario debe configurar una preferencia para buscar candidatos");
  }

  if (!tieneCoordenadasValidas(solicitante.ubicacion)) {
    throw new ValidationError("El usuario debe tener una ubicación con coordenadas válidas");
  }

  const usuarios = await candidatoRepository.obtenerCandidatos(usuarioId);
  const { edadMinima, edadMaxima, distanciaMaxKm } = solicitante.preferencia;
  const hoy = new Date();
  const candidatos = [];

  for (const usuario of usuarios) {
    if (!tieneCoordenadasValidas(usuario.ubicacion)) continue;

    const edad = calcularEdad(usuario.fechaNacimiento, hoy);
    if (!Number.isFinite(edad) || edad < edadMinima || edad > edadMaxima) continue;

    const distanciaKm = calcularDistanciaKm(solicitante.ubicacion, usuario.ubicacion);
    if (distanciaKm > distanciaMaxKm) continue;

    candidatos.push({
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      fechaNacimiento: usuario.fechaNacimiento,
      biografia: usuario.biografia,
      ubicacion: usuario.ubicacion,
      tipoUsuario: usuario.tipoUsuario,
      hobbies: usuario.hobbies.map((asociacion) => asociacion.hobbie),
      distanciaKm: Number(distanciaKm.toFixed(2)),
    });
  }

  return candidatos;
};

module.exports = { obtenerCandidatos };
