const ValidationError = require("../errors/validation-error");

const validarFoto = (datos) => {
  if (!datos || typeof datos !== "object") {
    throw new ValidationError("Los datos de la foto son requeridos");
  }

  if (!datos.url || typeof datos.url !== "string" || datos.url.trim().length === 0) {
    throw new ValidationError("La URL o imagen de la foto es obligatoria");
  }

  if (datos.orden !== undefined && (!Number.isInteger(datos.orden) || datos.orden < 0)) {
    throw new ValidationError("El orden debe ser un número entero mayor o igual a 0");
  }
};

const validarFotoId = (id) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError("El ID de la foto debe ser un número entero positivo");
  }
};

const validarUsuarioId = (id) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError("El ID de usuario debe ser un número entero positivo");
  }
};

module.exports = {
  validarFoto,
  validarFotoId,
  validarUsuarioId,
};
