const ValidationError = require("../errors/validation-error");

const validarUbicacion = (datos) => {
  const { ciudad, provincia, pais } = datos;

  if (!ciudad || typeof ciudad !== "string" || !ciudad.trim()) {
    throw new ValidationError("La ciudad es obligatoria");
  }

  if (!provincia || typeof provincia !== "string" || !provincia.trim()) {
    throw new ValidationError("La provincia es obligatoria");
  }

  if (!pais || typeof pais !== "string" || !pais.trim()) {
    throw new ValidationError("El país es obligatorio");
  }
};

const validarId = (id) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError("El ID debe ser un número entero positivo");
  }
};

module.exports = {
  validarUbicacion,
  validarId,
};