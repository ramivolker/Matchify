const ValidationError = require("../errors/validation-error");

const validarId = (id) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError("El ID debe ser un número entero positivo");
  }
};

const validarUsuario = (datos) => {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    throw new ValidationError("Los datos del usuario son obligatorios");
  }

  const camposPermitidos = [
    "nombre", "apellido", "email", "fechaNacimiento", "biografia",
    "activo", "ubicacionId", "tipoUsuarioId",
  ];

  for (const campo of Object.keys(datos)) {
    if (!camposPermitidos.includes(campo)) {
      throw new ValidationError(`El campo ${campo} no está permitido`);
    }
  }

  const { nombre, apellido, email, fechaNacimiento, biografia, activo } = datos;

  if (typeof nombre !== "string" || !nombre.trim()) {
    throw new ValidationError("El nombre es obligatorio");
  }

  if (typeof apellido !== "string" || !apellido.trim()) {
    throw new ValidationError("El apellido es obligatorio");
  }

  if (typeof email !== "string" || !email.trim()) {
    throw new ValidationError("El email es obligatorio");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError("El email debe tener un formato válido");
  }

  if (
    (typeof fechaNacimiento !== "string" && !(fechaNacimiento instanceof Date)) ||
    (typeof fechaNacimiento === "string" && !fechaNacimiento.trim()) ||
    Number.isNaN(new Date(fechaNacimiento).getTime())
  ) {
    throw new ValidationError("La fecha de nacimiento es obligatoria y debe ser válida");
  }

  if (new Date(fechaNacimiento).getTime() > Date.now()) {
    throw new ValidationError("La fecha de nacimiento no puede estar en el futuro");
  }

  if (biografia !== undefined && (typeof biografia !== "string" || biografia.length > 500)) {
    throw new ValidationError("La biografía debe ser un texto de hasta 500 caracteres");
  }

  if (activo !== undefined && typeof activo !== "boolean") {
    throw new ValidationError("El campo activo debe ser booleano");
  }

  for (const campo of ["ubicacionId", "tipoUsuarioId"]) {
    if (datos[campo] !== undefined && datos[campo] !== null) {
      if (!Number.isInteger(datos[campo]) || datos[campo] <= 0) {
        throw new ValidationError(`El campo ${campo} debe ser un número entero positivo`);
      }
    }
  }
};

module.exports = { validarUsuario, validarId };
