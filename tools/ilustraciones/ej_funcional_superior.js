// Funcional · Tren superior (categoria 105).
const F = require('./base_funcional');
const { E, L, PIE, SUELO, MANO_SUELO, deFuerza, flexion, planchaAlta, manosDesdeArriba, recto, colch, dir, sum, mul } = F;

const flexiones = { ...deFuerza(5), id: 1048, nombre: 'Flexiones de brazos' };

// Con las rodillas apoyadas: el cuerpo recto de hombro a rodilla.
function flexionRodillas(hombro) {
  const rodilla = [136, 330];
  const r = recto(hombro, rodilla);
  return {
    cadera: r.cadera, torso: r.torso, frente: 'abajo', cabeza: r.torso,
    brazos: { ambos: { destino: [262, MANO_SUELO], doblar: 'arriba' } },
    piernas: {
      cerca: { angulos: [r.torso + 180, 150], pie: 180 },
      lejos: { angulos: [r.torso + 180, 154], pie: 180 },
    },
    equipo: [colch()],
  };
}
const flexionesRodillas = {
  id: 1049, nombre: 'Flexiones con rodillas apoyadas', musculos: ['pecho', 'triceps'],
  inicio: flexionRodillas([262, 248]),
  fin: flexionRodillas([280, 298]),
  flecha: { punto: 'hombro', offset: [40, -30] },
};

// Diamante y abiertas: de costado se ven igual que la flexion comun, asi que
// llevan un recuadro con las manos vistas desde arriba.
const conManos = (pose, sep, rombo) => ({ ...pose, equipo: [...pose.equipo, manosDesdeArriba(sep, rombo)] });
const flexionesDiamante = {
  id: 1050, nombre: 'Flexiones diamante', musculos: ['triceps', 'pecho'],
  inicio: conManos(flexion([262, 242], [72, 324], [262, MANO_SUELO]), 9, true),
  fin: conManos(flexion([276, 298], [72, 324], [262, MANO_SUELO]), 9, true),
  flecha: { punto: 'hombro', offset: [40, -30] },
};
const flexionesAbiertas = {
  id: 1051, nombre: 'Flexiones abiertas', musculos: ['pecho', 'hombro'],
  inicio: conManos(flexion([262, 242], [72, 324], [262, MANO_SUELO]), 30, false),
  fin: conManos(flexion([276, 298], [72, 324], [262, MANO_SUELO]), 30, false),
  flecha: { punto: 'hombro', offset: [40, -30] },
};

// Pike push-ups: V invertida con las piernas rectas; los brazos siguen la linea
// del torso y al bajar se doblan los codos y la cabeza va hacia el piso.
const PIES_PIKE = [82, PIE];
const pikePose = (cadera, torso, cabeza) => ({
  cadera, torso, frente: 'abajo', cabeza,
  brazos: { ambos: { destino: [268, MANO_SUELO], doblar: 'izq' } },
  piernas: { cerca: { destino: [PIES_PIKE[0] + 4, PIE], doblar: 'der', pie: 330 }, lejos: { destino: PIES_PIKE, doblar: 'der', pie: 330 } },
  equipo: [colch()],
});
const pikePushUps = {
  id: 1052, nombre: 'Pike push-ups', musculos: ['hombro', 'triceps'],
  inicio: pikePose([132, 220], 320, 318),
  fin: pikePose([150, 228], 322, 330),
  flecha: { punto: 'cabeza', offset: [18, -10] },
};

// Fondos en banco: manos en el borde del banco, detras de la cadera, brazos
// rectos; el cuerpo baja delante del banco con las piernas estiradas.
const banco = E.banco({ x1: 50, x2: 160, y: 262 });
const fondosPose = (abajo) => ({
  cadera: abajo ? [172, 304] : [168, 256], torso: abajo ? 94 : 96, frente: 'der',
  brazos: { ambos: { destino: [150, 262], doblar: 'izq' } },
  piernas: abajo
    ? { cerca: { destino: [262, PIE], doblar: 'arriba', pie: 40 }, lejos: { destino: [256, PIE], doblar: 'arriba', pie: 40 } }
    : { cerca: { destino: [262, PIE], doblar: 'arriba', pie: 40 }, lejos: { destino: [256, PIE], doblar: 'arriba', pie: 40 } },
  equipo: [banco],
});
const fondosBanco = {
  id: 1053, nombre: 'Fondos en banco', musculos: ['triceps'],
  inicio: fondosPose(false),
  fin: fondosPose(true),
  flecha: { punto: 'cadera', offset: [-40, 0] },
};

// Plancha a flexion: de antebrazos a manos.
const upDown = {
  id: 1054, nombre: 'Plancha a flexión (up-down)', musculos: ['triceps', 'abdomen', 'hombro'],
  inicio: { ...deFuerza(81).fin },
  fin: planchaAlta(),
  flecha: { punto: 'hombro', offset: [30, -20], curva: -20 },
};

// Inchworm: flexionado con las piernas rectas y las manos al piso cerca de los
// pies; las manos caminan hasta la plancha alta (los pies no se mueven).
const inchworm = {
  id: 1055, nombre: 'Inchworm (gusano)', musculos: ['isquios', 'abdomen', 'hombro'],
  inicio: {
    cadera: [86, 216], torso: 312, frente: [-0.74, 0.67], cabeza: 296,
    brazos: { ambos: { destino: [216, MANO_SUELO], doblar: 'izq' } },
    piernas: { cerca: { destino: [80, PIE], doblar: 'der', pie: 0 }, lejos: { destino: [74, PIE], doblar: 'der', pie: 0 } },
    equipo: [colch()],
  },
  fin: planchaAlta(),
  flecha: { desde: [216, 318], hasta: [262, 318], curva: 16 },
};

module.exports = [
  flexiones, flexionesRodillas, flexionesDiamante, flexionesAbiertas, pikePushUps, fondosBanco, upDown, inchworm,
];
