const ValidationError = require("../errors/validation-error");

const validarUbicacion = (datos) => {
  const { ciudad, provincia, pais, latitud, longitud } = datos;

  if (!ciudad || typeof ciudad !== "string" || !ciudad.trim()) {
    throw new ValidationError("La ciudad es obligatoria");
  }

  if (!provincia || typeof provincia !== "string" || !provincia.trim()) {
    throw new ValidationError("La provincia es obligatoria");
  }

  if (!pais || typeof pais !== "string" || !pais.trim()) {
    throw new ValidationError("El país es obligatorio");
  }

  if (!Number.isFinite(latitud) || latitud < -90 || latitud > 90) {
    throw new ValidationError("La latitud es obligatoria y debe ser un número finito entre -90 y 90");
  }

  if (!Number.isFinite(longitud) || longitud < -180 || longitud > 180) {
    throw new ValidationError("La longitud es obligatoria y debe ser un número finito entre -180 y 180");
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
