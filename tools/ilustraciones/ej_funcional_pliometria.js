// Funcional · Pliometria (categoria 103).
const F = require('./base_funcional');
const { E, C, PIE, SUELO, MANO_SUELO, frente, parado, planchaAlta, flexion, elevar, sentadillaAbajo, brazosArriba, piernasSent } = F;

// Figura en el aire, estirada, con los brazos arriba.
const enElAire = (dy, extra = {}) => elevar(parado({
  brazos: { ambos: { angulos: [68, 74] } },
  piernas: { cerca: { destino: [204, PIE], doblar: 'der', pie: 300 }, lejos: { destino: [194, PIE], doblar: 'der', pie: 300 } },
  ...extra,
}), dy);

const burpees = {
  id: 1027, nombre: 'Burpees', musculos: ['pecho', 'cuadriceps', 'abdomen'],
  inicio: planchaAlta(),
  fin: enElAire(18),
  flecha: { desde: [170, 300], hasta: [200, 170], curva: -40 },
};

const sentadillaSalto = {
  id: 1028, nombre: 'Sentadilla con salto', musculos: ['cuadriceps', 'gluteos', 'gemelos'],
  inicio: sentadillaAbajo({ brazos: { ambos: { angulos: [220, 230] } } }),
  fin: enElAire(22),
  flecha: { punto: 'cadera', offset: [-60, 0], curva: -10 },
};

const estocada = (adelante, atras, dy = 0, cadera = [190, 268]) => elevar({
  cadera, torso: 88, frente: 'der',
  brazos: { cerca: { angulos: [250, 300] }, lejos: { angulos: [300, 30] } },
  piernas: {
    cerca: { destino: [adelante, PIE], doblar: 'der' },
    lejos: { destino: atras, doblar: 'der', pie: 300 },
  },
}, dy);
const estocadaSalto = {
  id: 1029, nombre: 'Estocada con salto alternada', musculos: ['cuadriceps', 'gluteos'],
  inicio: estocada(262, [104, 324]),
  fin: {
    cadera: [196, 176], torso: 88, frente: 'der',
    brazos: { cerca: { angulos: [300, 30] }, lejos: { angulos: [250, 300] } },
    piernas: {
      lejos: { destino: [244, 286], doblar: 'der', pie: 330 },
      cerca: { destino: [150, 290], doblar: 'der', pie: 300 },
    },
  },
  flecha: { punto: 'cadera', offset: [-60, 0], curva: -10 },
};

// Saltos al cajon: el cajon a la derecha.
const CAJA_Y = 262;
const cajon = E.caja({ x: 250, y: CAJA_Y, w: 110, h: SUELO - CAJA_Y });
const saltosCajon = {
  id: 1030, nombre: 'Saltos al cajón', musculos: ['cuadriceps', 'gluteos', 'gemelos'],
  inicio: {
    cadera: [150, 248], torso: 66, frente: 'der',
    brazos: { ambos: { angulos: [216, 240] } },
    piernas: piernasSent(184),
    equipo: [cajon],
  },
  fin: {
    cadera: [270, 198], torso: 62, frente: 'der',
    brazos: { ambos: { angulos: [290, 320] } },
    piernas: { cerca: { destino: [312, CAJA_Y - 6], doblar: 'der' }, lejos: { destino: [304, CAJA_Y - 6], doblar: 'der' } },
    equipo: [cajon],
  },
  flecha: { desde: [170, 200], hasta: [264, 150], curva: -40 },
};

// Saltos laterales, de frente, sobre una linea en el piso.
const linea = E.libre({ svg: `<rect x="196" y="${SUELO - 10}" width="8" height="10" rx="2" fill="${C.equipoClaro}"/>` });
const lateralPose = (x, dy) => elevar(frente({
  cadera: [x, 236], torso: 90,
  brazos: { ambos: { destino: [x + 42, 236], doblar: 'der' } },
  piernas: { der: F.piernaRecta([x, 236], 'der', [x + 16, PIE]), izq: F.piernaRecta([x, 236], 'izq', [x - 16, PIE]) },
  equipo: [linea],
}), dy);
const saltosLaterales = {
  id: 1031, nombre: 'Saltos laterales', musculos: ['cuadriceps', 'gemelos', 'aductores'],
  inicio: lateralPose(140, 0),
  fin: lateralPose(262, 0),
  flecha: { desde: [150, 120], hasta: [262, 120], curva: -40 },
};

const tuckJumps = {
  id: 1032, nombre: 'Rodillas al pecho (tuck jumps)', musculos: ['cuadriceps', 'abdomen', 'gemelos'],
  inicio: parado({ cadera: [196, 226], torso: 80, brazos: { ambos: { angulos: [230, 260] } }, piernas: piernasSent(206, 10) }),
  fin: {
    cadera: [196, 170], torso: 84, frente: 'der',
    brazos: { ambos: { angulos: [320, 30] } },
    piernas: { ambas: { angulos: [24, 262], pie: 300 } },
  },
  flecha: { punto: 'rodilla', offset: [26, 0], curva: -20 },
};

const saltoRana = {
  id: 1033, nombre: 'Salto de rana (salto largo)', musculos: ['cuadriceps', 'gluteos', 'isquios'],
  inicio: sentadillaAbajo({ cadera: [120, 276], torso: 40, brazos: { ambos: { angulos: [200, 210] } }, piernas: piernasSent(170) }),
  fin: {
    cadera: [214, 196], torso: 40, frente: 'der',
    brazos: { ambos: { angulos: [30, 30] } },
    piernas: { ambas: { angulos: [222, 218], pie: 240 } },
  },
  flecha: { desde: [120, 240], hasta: [214, 160], curva: -50 },
};

const estrella = {
  id: 1034, nombre: 'Saltos en estrella', musculos: ['cuadriceps', 'gluteos', 'hombro'],
  inicio: frente({
    cadera: [200, 252],
    brazos: { ambos: { destino: [226, 274], doblar: 'der' } },
    piernas: { der: F.piernaRecta([200, 252], 'der', [236, PIE]), izq: F.piernaRecta([200, 252], 'izq', [164, PIE]) },
  }),
  fin: elevar(frente({
    brazos: { ambos: { angulos: [50, 50] } },
    piernas: { ambas: { angulos: [300, 300], pie: 300 } },
  }), 36),
  flecha: { punto: 'mano', curva: -40 },
};

// Flexion pliometrica: abajo y despues las manos despegan del piso.
const flexPlio = {
  id: 1035, nombre: 'Flexiones pliométricas', musculos: ['pecho', 'triceps'],
  inicio: flexion([276, 298], [72, 324], [262, MANO_SUELO]),
  fin: {
    ...flexion([266, 222], [72, 324], [272, 312], 'izq'),
    equipo: [F.colch(), E.libre({ svg: `<path d="M258 ${SUELO - 4} l6 -10 M276 ${SUELO - 4} l0 -12 M294 ${SUELO - 4} l-6 -10" stroke="${C.musculo}" stroke-opacity="0.7" stroke-width="3" stroke-linecap="round"/>` })],
  },
  flecha: { punto: 'hombro', offset: [40, -20] },
};

module.exports = [burpees, sentadillaSalto, estocadaSalto, saltosCajon, saltosLaterales, tuckJumps, saltoRana, estrella, flexPlio];
