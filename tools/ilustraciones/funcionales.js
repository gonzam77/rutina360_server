// Ilustraciones de los ejercicios funcionales (ids 1001+), con su categoria.
// La categoria es el id del grupo en src/seeders/gruposFuncionales.js.
const categorias = [
  [101, 'Core', require('./ej_funcional_core')],
  [102, 'Cardio', require('./ej_funcional_cardio')],
  [103, 'Pliometría', require('./ej_funcional_pliometria')],
  [104, 'Tren inferior', require('./ej_funcional_inferior')],
  [105, 'Tren superior', require('./ej_funcional_superior')],
  [106, 'Cuerpo completo', require('./ej_funcional_completo')],
  [107, 'Movilidad', require('./ej_funcional_movilidad')],
  [108, 'Elongación', require('./ej_funcional_elongacion')],
];

module.exports = categorias
  .flatMap(([idCategoria, categoria, lista]) => lista.map(ej => ({ ...ej, idCategoria, categoria })))
  .sort((a, b) => a.id - b.id);
