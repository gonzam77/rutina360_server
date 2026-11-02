// Funcional · Cuerpo completo (categoria 106).
const F = require('./base_funcional');
const { E, C, PIE, PISO, SUELO, MANO_SUELO, parado, mancuernas, planchaAlta, sentadillaAbajo, piernasSent, colch, sum } = F;

// Bisagra de cadera (swing y clean abajo): la pesa entre las piernas.
const bisagra = (o = {}) => ({
  cadera: [168, 240], torso: 40, frente: 'der', cabeza: 30,
  brazos: { ambos: { destino: [196, 290], doblar: 'abajo' } },
  piernas: piernasSent(206, 12),
  ...o,
});

const swing = {
  id: 1056, nombre: 'Kettlebell swing', musculos: ['gluteos', 'isquios', 'hombro'],
  inicio: { ...bisagra(), equipo: [sk => E.kettlebell({ c: sk.brazos.cerca.fin, hacia: 250 })] },
  fin: parado({
    brazos: { ambos: { angulos: [4, 6] } },
    equipo: [sk => E.kettlebell({ c: sk.brazos.cerca.fin, hacia: 4 })],
  }),
  flecha: { punto: 'mano', curva: 40 },
};

// Thrusters: sentadilla con mancuernas en los hombros y press arriba.
const rack = { ambos: { angulos: [345, 110], escala: [0.75, 0.8] } };
const thrusters = {
  id: 1057, nombre: 'Thrusters', musculos: ['cuadriceps', 'gluteos', 'hombro'],
  inicio: sentadillaAbajo({ brazos: rack, equipo: mancuernas() }),
  fin: parado({ brazos: { ambos: { angulos: [88, 90] } }, equipo: mancuernas({ angulo: 0 }) }),
  flecha: { punto: 'mano', offset: [30, 0] },
};

// Wall balls: sentadilla con el balon en el pecho y tiro al blanco de la pared.
const PARED_X = 352;
const pared = E.pared({ x: PARED_X, y: 40, blanco: 72 });
const wallBalls = {
  id: 1058, nombre: 'Wall balls', musculos: ['cuadriceps', 'gluteos', 'hombro'],
  inicio: {
    ...sentadillaAbajo({ brazos: { ambos: { angulos: [330, 80], escala: [0.7, 0.75] } } }),
    equipo: [pared, sk => E.balon({ c: sum(sk.brazos.cerca.fin, [12, -6]) })],
  },
  fin: {
    ...parado({ cadera: [198, 210], brazos: { ambos: { angulos: [70, 70] } } }),
    piernas: { cerca: { destino: [206, PIE - 8], doblar: 'der', pie: 310 }, lejos: { destino: [194, PIE - 8], doblar: 'der', pie: 310 } },
    equipo: [pared, E.balon({ c: [320, 78] })],
  },
  flecha: { desde: [250, 90], hasta: [306, 78], curva: -20 },
};

// Battle ropes: semisentadilla y ondas alternadas hasta el anclaje.
const ANCLA = [372, 330];
const cuerdas = (y, fase) => ({
  cadera: [150, 246], torso: 74, frente: 'der',
  brazos: { ambos: { destino: [262, y], doblar: 'abajo' } },
  piernas: piernasSent(196, 16),
  equipo: [sk => E.sogasBattle({ desde: sk.brazos.cerca.fin, ancla: ANCLA, fase })],
});
const battleRopes = {
  id: 1059, nombre: 'Battle ropes', musculos: ['hombro', 'abdomen'],
  inicio: cuerdas(196, 1),
  fin: cuerdas(250, -1),
  flecha: { punto: 'mano', offset: [-10, 0] },
};

// Bear crawl: cuadrupedia con las rodillas despegadas.
const oso = (mano, pie) => ({
  cadera: [168, 262], torso: 4, frente: 'abajo', cabeza: 10,
  brazos: { cerca: { destino: [258 + mano, SUELO - 8], doblar: 'izq' }, lejos: { destino: [258 - mano, SUELO - 8], doblar: 'izq' } },
  piernas: { cerca: { destino: [124 - pie, PIE - 18], doblar: 'abajo', pie: 276 }, lejos: { destino: [124 + pie, PIE - 18], doblar: 'abajo', pie: 276 } },
});
const bearCrawl = {
  id: 1060, nombre: 'Bear crawl (oso)', musculos: ['abdomen', 'hombro', 'cuadriceps'],
  inicio: oso(0, 0),
  fin: { ...oso(24, 20), cadera: [186, 262] },
  flecha: { punto: 'cadera', offset: [0, -30] },
};

// Sprawl: parado y caida con la cadera al piso.
const sprawl = {
  id: 1061, nombre: 'Sprawl', musculos: ['abdomen', 'cuadriceps', 'pecho'],
  inicio: parado({ cadera: [180, 226], torso: 80, brazos: { ambos: { angulos: [300, 340] } }, piernas: piernasSent(196, 14) }),
  fin: {
    cadera: [176, PISO + 2], torso: 24, frente: 'abajo', cabeza: 30,
    brazos: { ambos: { destino: [290, MANO_SUELO], doblar: 'izq' } },
    piernas: { ambas: { angulos: [182, 182], pie: 270 } },
    equipo: [colch()],
  },
  flecha: { punto: 'cadera', curva: 30, offset: [0, -20] },
};

// Slam: balon arriba de la cabeza y golpe contra el piso.
const slam = {
  id: 1062, nombre: 'Golpe de balón medicinal (slam)', musculos: ['abdomen', 'hombro', 'espalda'],
  inicio: parado({ brazos: { ambos: { angulos: [74, 80] } }, equipo: [sk => E.balon({ c: sum(sk.brazos.cerca.fin, [4, -12]) })] }),
  fin: {
    ...bisagra({ cadera: [160, 252], torso: 34, brazos: { ambos: { destino: [254, 308], doblar: 'abajo' } } }),
    equipo: [E.balon({ c: [262, SUELO - 17] })],
  },
  flecha: { desde: [216, 60], hasta: [262, 300], curva: -30 },
};

// Clean: de la bisagra a la pesa apoyada en el antebrazo, a la altura del hombro.
const clean = {
  id: 1063, nombre: 'Clean con kettlebell', musculos: ['gluteos', 'isquios', 'hombro'],
  inicio: { ...bisagra(), brazos: { cerca: { destino: [196, 290], doblar: 'abajo' }, lejos: { angulos: [272, 272] } }, equipo: [sk => E.kettlebell({ c: sk.brazos.cerca.fin, hacia: 250 })] },
  fin: parado({
    brazos: { cerca: { angulos: [292, 96], escala: [0.8, 0.85] }, lejos: { angulos: [272, 272] } },
    equipo: [sk => E.kettlebell({ c: sk.brazos.cerca.fin, hacia: 190, r: 13 })],
  }),
  flecha: { punto: 'mano', curva: 30, offset: [20, 0] },
};

// Turkish get-up: acostado con la pesa arriba -> sentado con apoyo de una mano.
const getUp = {
  id: 1064, nombre: 'Turkish get-up', musculos: ['abdomen', 'hombro', 'gluteos'],
  inicio: {
    cadera: [176, PISO], torso: 0, frente: 'arriba', cabeza: 0,
    brazos: { cerca: { angulos: [90, 90] }, lejos: { angulos: [184, 184] } },
    piernas: { cerca: { destino: [118, PIE], doblar: 'arriba', pie: 180 }, lejos: { angulos: [180, 180], pie: 90 } },
    equipo: [colch(), sk => E.kettlebell({ c: sk.brazos.cerca.fin, hacia: 120, r: 13 })],
  },
  fin: {
    cadera: [176, PISO], torso: 52, frente: [-0.79, -0.62], cabeza: 60,
    brazos: { cerca: { angulos: [92, 90] }, lejos: { destino: [272, SUELO - 8], doblar: 'der' } },
    piernas: { cerca: { destino: [110, PIE], doblar: 'arriba', pie: 180 }, lejos: { angulos: [180, 180], pie: 90 } },
    equipo: [colch(), sk => E.kettlebell({ c: sk.brazos.cerca.fin, hacia: 120, r: 13 })],
  },
  flecha: { punto: 'hombro', curva: -30, offset: [-20, 0] },
};

// Man makers: plancha sobre mancuernas con remo -> parado con press.
const manMakers = {
  id: 1065, nombre: 'Man makers', musculos: ['pecho', 'espalda', 'hombro', 'cuadriceps'],
  inicio: planchaAlta({
    brazos: { lejos: { destino: [262, MANO_SUELO - 6], doblar: 'arriba' }, cerca: { destino: [234, 284], doblar: 'arriba' } },
    equipo: [colch(), sk => E.mancuernaPunta({ c: sk.brazos.cerca.fin }), sk => ({ ...E.mancuernaPunta({ c: sk.brazos.lejos.fin }), capa: 'fondo' })],
  }),
  fin: parado({ brazos: { ambos: { angulos: [88, 90] } }, equipo: mancuernas({ angulo: 0 }) }),
  flecha: { punto: 'mano', curva: 40 },
};

// Remo ergometro: del agarre (adelante, piernas flexionadas) al final.
const remo = (fin) => {
  const asiento = fin ? [122, 290] : [176, 290];
  const cadera = [asiento[0], asiento[1] - 8];
  const torso = fin ? 106 : 66;
  return {
    cadera, torso, frente: 'der', cabeza: torso - 6,
    brazos: { ambos: fin ? { destino: [cadera[0] + 30, 236], doblar: 'izq' } : { destino: [310, 262], doblar: 'abajo' } },
    piernas: { ambas: { destino: [292, 296], doblar: 'arriba', pie: 80 } },
    equipo: [
      E.remoErgometro({ asiento }),
      sk => E.cableA({ desde: [338, 266], hacia: sk.brazos.cerca.fin, capa: 'fondo' }),
    ],
  };
};
const remoErgometro = {
  id: 1066, nombre: 'Remo ergómetro', musculos: ['espalda', 'cuadriceps', 'biceps'],
  inicio: remo(false),
  fin: remo(true),
  flecha: { punto: 'cadera', offset: [0, -60] },
};

// Air bike: pedaleo y empuje de las palancas.
const SILLIN = [176, 222];
const bike = (fase) => {
  const pedal = [220, SUELO - 40];
  const pieA = sum(pedal, fase ? [22, -14] : [-20, 14]);
  const pieB = sum(pedal, fase ? [-20, 14] : [22, -14]);
  const mano = fase ? [270, 150] : [240, 166];
  return {
    cadera: [SILLIN[0], SILLIN[1] - 8], torso: 66, frente: 'der', cabeza: 60,
    brazos: { cerca: { destino: mano, doblar: 'abajo' }, lejos: { destino: fase ? [240, 166] : [270, 150], doblar: 'abajo' } },
    piernas: { cerca: { destino: pieA, doblar: 'der' }, lejos: { destino: pieB, doblar: 'der' } },
    equipo: [
      E.airBike({ sillin: SILLIN }),
      sk => E.palancaBike({ pivote: [262, 288], mano: sk.brazos.lejos.fin, capa: 'fondo' }),
      sk => E.palancaBike({ pivote: [262, 288], mano: sk.brazos.cerca.fin, capa: 'frente' }),
    ],
  };
};
const airBike = {
  id: 1067, nombre: 'Air bike', musculos: ['cuadriceps', 'hombro'],
  inicio: bike(false),
  fin: bike(true),
  flecha: { punto: 'mano', offset: [10, -20] },
};

module.exports = [swing, thrusters, wallBalls, battleRopes, bearCrawl, sprawl, slam, clean, getUp, manMakers, remoErgometro, airBike];
