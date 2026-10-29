// Imagenes de respaldo por grupo muscular (para ejercicios sin ilustracion propia).
const { frente } = require('./base');

const pose = (espalda) => frente({ espalda, brazos: { ambos: { destino: [246, 222], doblar: 'der' } } });

module.exports = [
  { id: 1, nombre: 'Pecho', espalda: false, musculos: ['pecho'] },
  { id: 2, nombre: 'Espalda', espalda: true, musculos: ['espalda'] },
  { id: 3, nombre: 'Trapecio', espalda: true, musculos: ['trapecio'] },
  { id: 4, nombre: 'Hombro', espalda: false, musculos: ['hombro'] },
  { id: 5, nombre: 'Biceps', espalda: false, musculos: ['biceps'] },
  { id: 6, nombre: 'Triceps', espalda: true, musculos: ['triceps'] },
  { id: 7, nombre: 'Antebrazo', espalda: false, musculos: ['antebrazo'] },
  { id: 8, nombre: 'Cuadriceps', espalda: false, musculos: ['cuadriceps'] },
  { id: 9, nombre: 'Isquiotibiales', espalda: true, musculos: ['isquios'] },
  { id: 10, nombre: 'Gluteos', espalda: true, musculos: ['gluteos'] },
  { id: 11, nombre: 'Aductores', espalda: false, musculos: ['aductores'] },
  { id: 12, nombre: 'Gemelos', espalda: true, musculos: ['gemelos'] },
  { id: 13, nombre: 'Abdomen', espalda: false, musculos: ['abdomen'] },
  { id: 14, nombre: 'Lumbares', espalda: true, musculos: ['lumbares'] },
].map(g => ({ ...g, pose: pose(g.espalda) }));
