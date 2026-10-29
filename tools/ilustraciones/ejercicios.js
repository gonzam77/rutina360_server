// Definicion de las ilustraciones de los 90 ejercicios del catalogo base.
const lista = [
  ...require('./ej_pecho'),
  ...require('./ej_espalda'),
  ...require('./ej_hombro'),
  ...require('./ej_brazos'),
  ...require('./ej_piernas'),
  ...require('./ej_core'),
].sort((a, b) => a.id - b.id);

module.exports = lista;
