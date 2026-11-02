// Imagenes genericas de las categorias funcionales (respaldo para los
// ejercicios funcionales sin ilustracion propia). Misma estetica que las de
// grupos.js: una sola figura centrada, con una pose tipica de la categoria.
const core = require('./ej_funcional_core');
const cardio = require('./ej_funcional_cardio');
const plio = require('./ej_funcional_pliometria');
const inferior = require('./ej_funcional_inferior');
const superior = require('./ej_funcional_superior');
const completo = require('./ej_funcional_completo');
const movilidad = require('./ej_funcional_movilidad');
const elongacion = require('./ej_funcional_elongacion');

const de = (lista, id, cual = 'fin') => {
  const ej = lista.find(e => e.id === id);
  return ej.sostenido ? ej.pose : ej[cual];
};

module.exports = [
  { id: 101, nombre: 'Core', pose: de(core, 1001), musculos: ['abdomen'] },
  { id: 102, nombre: 'Cardio', pose: de(cardio, 1018, 'inicio'), musculos: ['cuadriceps', 'gemelos'] },
  { id: 103, nombre: 'Pliometría', pose: de(plio, 1034), musculos: ['cuadriceps', 'gluteos'] },
  { id: 104, nombre: 'Tren inferior', pose: de(inferior, 1036), musculos: ['cuadriceps', 'gluteos'] },
  { id: 105, nombre: 'Tren superior', pose: de(superior, 1048, 'inicio'), musculos: ['pecho', 'triceps'] },
  { id: 106, nombre: 'Cuerpo completo', pose: de(completo, 1056), musculos: ['gluteos', 'isquios', 'hombro'] },
  { id: 107, nombre: 'Movilidad', pose: de(movilidad, 1073), musculos: ['gluteos', 'espalda'] },
  { id: 108, nombre: 'Elongación', pose: de(elongacion, 1076), musculos: ['isquios'] },
];
