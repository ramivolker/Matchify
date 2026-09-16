const ValidationError = require("../errors/validation-error");

const validarTipoUsuario = (datos) => {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    throw new ValidationError("Los datos del tipo de usuario son obligatorios");
  }

  const camposPermitidos = ["nombre", "descripcion"];

  for (const campo of Object.keys(datos)) {
    if (!camposPermitidos.includes(campo)) {
      throw new ValidationError(`El campo ${campo} no está permitido`);
    }
  }

  const { nombre, descripcion } = datos;

  if (typeof nombre !== "string" || !nombre.trim()) {
    throw new ValidationError("El nombre es obligatorio");
  }

  if (descripcion !== undefined && typeof descripcion !== "string") {
    throw new ValidationError("La descripción debe ser un texto");
  }
};

const validarId = (id) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError("El ID debe ser un número entero positivo");
  }
};

module.exports = {
  validarTipoUsuario,
  validarId,
};
