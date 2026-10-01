export const GENEROS = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMENINO', label: 'Femenino' },
  { value: 'NO_BINARIO', label: 'No binario' },
  { value: 'OTRO', label: 'Otro' },
];

export const mismosGeneros = (a, b) => a.length === b.length && a.every((genero) => b.includes(genero));
