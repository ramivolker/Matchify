const ValidationError = require("../errors/validation-error");

const validarUsuarioId = (usuarioId) => {
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new ValidationError("El usuarioId debe ser un número entero positivo");
  }
};

const validarPreferencia = (datos) => {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    throw new ValidationError("Los datos de la preferencia son obligatorios");
  }

  const camposPermitidos = ["edadMinima", "edadMaxima", "distanciaMaxKm"];

  for (const campo of Object.keys(datos)) {
    if (!camposPermitidos.includes(campo)) {
      throw new ValidationError(`El campo ${campo} no está permitido`);
    }
  }

  const { edadMinima, edadMaxima, distanciaMaxKm } = datos;

  if (!Number.isInteger(edadMinima) || edadMinima < 18) {
    throw new ValidationError("La edad mínima es obligatoria y debe ser un número entero mayor o igual a 18");
  }

  if (!Number.isInteger(edadMaxima) || edadMaxima < 18) {
    throw new ValidationError("La edad máxima es obligatoria y debe ser un número entero mayor o igual a 18");
  }

  if (edadMaxima < edadMinima) {
    throw new ValidationError("La edad máxima debe ser mayor o igual a la edad mínima");
  }

  if (distanciaMaxKm !== undefined && (!Number.isInteger(distanciaMaxKm) || distanciaMaxKm <= 0)) {
    throw new ValidationError("La distancia máxima debe ser un número entero positivo");
  }
};

module.exports = {
  validarUsuarioId,
  validarPreferencia,
};
