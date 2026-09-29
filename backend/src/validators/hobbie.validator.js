const ValidationError = require("../errors/validation-error");

const validarHobbie = (datos) => {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    throw new ValidationError("Los datos del hobbie son obligatorios");
  }

  const { nombre, descripcion, emoji } = datos;

  if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
    throw new ValidationError("El nombre es obligatorio");
  }

  if (descripcion !== undefined && descripcion !== null && typeof descripcion !== "string") {
    throw new ValidationError("La descripción debe ser un texto");
  }

  if (emoji !== undefined && emoji !== null && typeof emoji !== "string") {
    throw new ValidationError("El emoji debe ser un texto");
  }
};

const validarId = (id) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError("El ID debe ser un número entero positivo");
  }
};

module.exports = {
  validarHobbie,
  validarId,
};
