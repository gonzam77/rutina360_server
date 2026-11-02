// Funcional · Elongacion (categoria 108). Todas son posturas sostenidas; lo
// verde es el musculo que se estira.
const F = require('./base_funcional');
const { E, PIE, PISO, SUELO, MANO_SUELO, frente, parado, colch } = F;

const isquios = {
  id: 1076, nombre: 'Isquiotibiales', musculos: ['isquios'], sostenido: true,
  pose: {
    cadera: [132, PISO - 4], torso: 28, frente: 'der', cabeza: 18,
    brazos: { ambos: { angulos: [344, 340] } },
    piernas: { ambas: { angulos: [358, 0], pie: 80 } },
    equipo: [colch()],
  },
};

const cuadriceps = {
  id: 1077, nombre: 'Cuádriceps', musculos: ['cuadriceps'], sostenido: true,
  pose: parado({
    brazos: { cerca: { destino: [182, 226], doblar: 'izq' }, lejos: { angulos: [8, 8] } },
    piernas: { cerca: { angulos: [268, 104], pie: 190 }, lejos: { destino: [200, PIE], doblar: 'der' } },
  }),
};

// Pectorales: brazo extendido hacia atras apoyado en la pared.
const pectorales = {
  id: 1078, nombre: 'Pectorales', musculos: ['pecho'], sostenido: true,
  pose: parado({
    cadera: [212, 218], torso: 88,
    brazos: { cerca: { angulos: [178, 178] }, lejos: { angulos: [272, 272] } },
    piernas: { cerca: { destino: [226, PIE], doblar: 'der' }, lejos: { destino: [200, PIE], doblar: 'der' } },
    equipo: [E.pared({ x: 100, y: 60 })],
  }),
};

// Hombros, de frente: un brazo cruzado sobre el pecho, sostenido por el otro.
const hombros = {
  id: 1079, nombre: 'Hombros', musculos: ['hombro'], sostenido: true,
  pose: frente({
    brazos: { der: { angulos: [182, 180], escala: [0.9, 0.9] }, izq: { destino: [190, 138], doblar: 'abajo' } },
  }),
};

// Triceps, de espaldas: codo detras de la cabeza, la otra mano lo empuja.
const triceps = {
  id: 1080, nombre: 'Tríceps', musculos: ['triceps'], sostenido: true,
  pose: frente({
    espalda: true,
    brazos: { der: { angulos: [104, 220] }, izq: { destino: [212, 54], doblar: 'izq' } },
  }),
};

// Gemelos: manos en la pared (a la derecha), pierna de atras estirada.
const gemelos = {
  id: 1081, nombre: 'Gemelos', musculos: ['gemelos'], sostenido: true,
  pose: {
    cadera: [214, 220], torso: 66, frente: 'der',
    brazos: { ambos: { destino: [298, 138], doblar: 'abajo' } },
    piernas: { cerca: { destino: [140, PIE], doblar: 'der', pie: 0 }, lejos: { destino: [250, PIE], doblar: 'der' } },
    equipo: [E.pared({ x: 304, y: 40 })],
  },
};

// Postura del nino: sentado sobre los talones, torso adelante y brazos estirados.
const nino = {
  id: 1082, nombre: 'Postura del niño', musculos: ['espalda', 'lumbares'], sostenido: true,
  pose: {
    cadera: [150, 300], torso: 344, frente: 'abajo', cabeza: 336, curvaTorso: 5,
    brazos: { ambos: { angulos: [356, 0] } },
    piernas: { ambas: { angulos: [332, 186], pie: 180 } },
    equipo: [colch()],
  },
};

// Cobra: cadera en el piso, brazos estirados empujando el pecho arriba.
const cobra = {
  id: 1083, nombre: 'Cobra', musculos: ['abdomen'], sostenido: true,
  pose: {
    cadera: [170, PISO + 2], torso: 48, frente: [0.74, 0.67], cabeza: 66, curvaTorso: -10,
    brazos: { ambos: { destino: [244, MANO_SUELO], doblar: 'izq' } },
    piernas: { ambas: { angulos: [182, 180], pie: 180 } },
    equipo: [colch()],
  },
};

// Mariposa, de frente: sentado con las plantas juntas.
const mariposa = {
  id: 1084, nombre: 'Mariposa (aductores)', musculos: ['aductores'], sostenido: true,
  pose: frente({
    cadera: [200, 318],
    brazos: { ambos: { destino: [208, 326], doblar: 'der' } },
    piernas: { ambas: { angulos: [8, 192], pie: 270 } },
    equipo: [colch(60, 340)],
  }),
};

// Figura 4: boca arriba (cabeza a la izquierda), tobillo sobre la rodilla.
const figura4 = {
  id: 1085, nombre: 'Figura 4 (glúteo)', musculos: ['gluteos'], sostenido: true,
  pose: {
    cadera: [190, PISO], torso: 180, frente: 'arriba', cabeza: 180,
    brazos: { ambos: { destino: [222, 276], doblar: 'arriba' } },
    piernas: { lejos: { destino: [258, PIE], doblar: 'arriba' }, cerca: { angulos: [76, 342], pie: 70 } },
    equipo: [colch()],
  },
};

module.exports = [isquios, cuadriceps, pectorales, hombros, triceps, gemelos, nino, cobra, mariposa, figura4];
