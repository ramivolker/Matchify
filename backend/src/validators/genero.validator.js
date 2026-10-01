const { Genero } = require('@prisma/client');
const ValidationError = require('../errors/validation-error');
const GENEROS = Object.values(Genero);

const validarGenero = (genero) => {
  if (!GENEROS.includes(genero)) throw new ValidationError('El género indicado no es válido');
};

const validarGeneros = (generos) => {
  if (!Array.isArray(generos)) throw new ValidationError('generos debe ser un array');
  if (generos.length === 0) throw new ValidationError('Seleccioná al menos un género');
  generos.forEach(validarGenero);
  if (new Set(generos).size !== generos.length) {
    throw new ValidationError('No se permiten géneros duplicados');
  }
};

module.exports = { validarGenero, validarGeneros };
