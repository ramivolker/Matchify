const ValidationError = require("../errors/validation-error");

const validarUsuarioId = (usuarioId) => {
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new ValidationError("El usuarioId debe ser un número entero positivo");
  }
};

const validarHobbieId = (hobbieId) => {
  if (!Number.isInteger(hobbieId) || hobbieId <= 0) {
    throw new ValidationError("El hobbieId debe ser un número entero positivo");
  }
};

module.exports = {
  validarUsuarioId,
  validarHobbieId,
};
