const B = require('./base');
const { E, C, L, SUELO, PIE, parado, dir, sum, sub, mul, unit, hombroDe, asiento } = B;

const PISO = SUELO - 15; // centro del cuerpo acostado en el piso
const colch = E.colchoneta({ x1: 40, x2: 360 });

// Posicion de la cabeza de una pose de costado.
const cabezaDe = (cadera, torso, cabeza = torso) => sum(hombroDe(cadera, torso), mul(dir(cabeza), L.cuello + L.cabeza));
// Manos detras de la nuca.
const manosNuca = (cadera, torso, cabeza = torso) => {
  const c = cabezaDe(cadera, torso, cabeza);
  return { ambos: { destino: sum(c, mul(dir(cabeza + 160), 12)), doblar: dir(cabeza + 90), escala: [0.62, 0.7] } };
};

// ---------- Abdomen ----------
const crunchPose = (torso) => {
  const cadera = [160, PISO];
  return {
    cadera, torso, frente: 'arriba', cabeza: torso + (torso > 5 ? 12 : 0),
    brazos: manosNuca(cadera, torso, torso + (torso > 5 ? 12 : 0)),
    piernas: { cerca: { destino: [96, PIE], doblar: 'arriba', pie: 180 }, lejos: { destino: [104, PIE], doblar: 'arriba', pie: 180 } },
    equipo: [colch],
  };
};
const crunch = {
  id: 76, nombre: 'Crunch abdominal', musculos: ['abdomen'],
  inicio: crunchPose(0),
  fin: crunchPose(32),
  flecha: { punto: 'cabeza', curva: 20, offset: [10, -24] },
};

// Crunch en maquina: pad sobre el pecho que baja con el torso.
const crunchMaqPose = (torso) => {
  const cadera = [168, 268];
  const h = hombroDe(cadera, torso);
  const fr = dir(torso - 90);
  const pad = sum(h, mul(fr, 26));
  return {
    cadera, torso, frente: 'der', cabeza: torso - 6,
    brazos: { ambos: { destino: sum(pad, mul(dir(torso), 10)), doblar: 'abajo' } },
    piernas: { cerca: { destino: [232, PIE], doblar: 'arriba' }, lejos: { destino: [224, PIE], doblar: 'arriba' } },
    equipo: [
      asiento(126, 200, 282),
      E.pad({ a: [130, 274], b: [124, 176], w: 15 }),
      E.palanca({ a: [128, 120], b: pad, capa: 'fondo' }),
      E.libre({ svg: `<rect x="122" y="112" width="12" height="${SUELO - 112}" fill="${C.equipoOscuro}"/>` }),
      E.pad({ a: sum(pad, mul(dir(torso), -12)), b: sum(pad, mul(dir(torso), 12)), w: 14, capa: 'frente' }),
    ],
  };
};
const crunchMaquina = {
  id: 77, nombre: 'Crunch en máquina', musculos: ['abdomen'],
  inicio: crunchMaqPose(94),
  fin: crunchMaqPose(52),
  flecha: { punto: 'cabeza', curva: -30, offset: [20, 0] },
};

// Crunch en polea alta, arrodillado.
const POLEA = [340, 52];
const crunchPoleaPose = (torso) => {
  const cadera = [190, 270];
  const c = cabezaDe(cadera, torso, torso - 10);
  return {
    cadera, torso, frente: 'der', cabeza: torso - 10,
    brazos: { ambos: { destino: sum(c, mul(dir(torso - 60), 16)), doblar: 'abajo' } },
    piernas: { cerca: { destino: [128, PIE], doblar: 'abajo', pie: 180 }, lejos: { destino: [134, PIE], doblar: 'abajo', pie: 180 } },
    equipo: [E.polea({ x: POLEA[0], y: POLEA[1] }), sk => E.cableA({ desde: POLEA, hacia: sk.brazos.cerca.fin, capa: 'fondo' })],
  };
};
const crunchPolea = {
  id: 78, nombre: 'Crunch en polea alta', musculos: ['abdomen'],
  inicio: crunchPoleaPose(84),
  fin: crunchPoleaPose(28),
  flecha: { punto: 'cabeza', curva: -40, offset: [20, 0] },
};

// Elevaciones de piernas colgado.
const colgadoPose = piernas => ({
  cadera: [194, 206], torso: 92, frente: 'der',
  brazos: { ambos: { destino: [202, 28], doblar: 'der' } },
  piernas: { ambas: piernas },
  equipo: [E.barraFija({ x: 202, y: 24 })],
});
const elevColgado = {
  id: 79, nombre: 'Elevaciones de piernas colgado', musculos: ['abdomen'],
  inicio: colgadoPose({ angulos: [264, 228], pie: 262 }),
  fin: colgadoPose({ angulos: [2, 0], pie: 80 }),
  flecha: { punto: 'pie', curva: 50 },
};

// Elevaciones de piernas en banco: acostado, manos tomadas del banco atras de la cabeza.
const bancoPiernasPose = piernas => ({
  cadera: [168, 256], torso: 0, frente: 'arriba',
  brazos: { ambos: { destino: [300, 272], doblar: 'arriba' } },
  piernas: { ambas: piernas },
  equipo: [E.banco({ x1: 130, x2: 306, y: 268 })],
});
const elevBanco = {
  id: 80, nombre: 'Elevaciones de piernas en banco', musculos: ['abdomen'],
  inicio: bancoPiernasPose({ angulos: [182, 180], pie: 180 }),
  fin: bancoPiernasPose({ angulos: [94, 92], pie: 0 }),
  flecha: { punto: 'pie', curva: -50 },
};

// Plancha (de la muestra).
const plancha = {
  id: 81, nombre: 'Plancha', musculos: ['abdomen'],
  inicio: {
    cadera: [176, 292], torso: 22, frente: 'abajo',
    brazos: { ambos: { angulos: [270, 0] } },
    piernas: { cerca: { destino: [80, PIE - 4], doblar: 'abajo', pie: 300 }, lejos: { destino: [86, PIE - 4], doblar: 'abajo', pie: 300 } },
    equipo: [colch],
  },
  fin: {
    cadera: [180, 300], torso: 10, frente: 'abajo',
    brazos: { ambos: { angulos: [270, 0] } },
    piernas: { cerca: { destino: [62, 326], doblar: 'abajo', pie: 300 }, lejos: { destino: [68, 326], doblar: 'abajo', pie: 300 } },
    equipo: [colch],
  },
};

// Plancha lateral, vista de frente: el cuerpo de costado en diagonal.
function lateralPose(torso, piernasAng = torso) {
  const u = dir(torso);
  const der = [-u[1], u[0]];
  const hombroAbajo = [262, SUELO - 8 - 50];
  const N = sub(hombroAbajo, mul(der, 22));
  const P = sub(N, mul(u, L.torso));
  return {
    vista: 'frente', cadera: P, torso,
    brazos: { der: { angulos: [270, 330], escala: [1, 0.45] }, izq: { angulos: [torso + 80, torso + 80] } },
    piernas: {
      izq: { angulos: [180 + piernasAng, 180 + piernasAng], pie: 180 + piernasAng },
      der: { angulos: [180 + piernasAng, 180 + piernasAng], pie: 180 + piernasAng },
    },
    equipo: [colch],
  };
}
const planchaLateral = {
  id: 82, nombre: 'Plancha lateral', musculos: ['abdomen'],
  inicio: lateralPose(34, 4),
  fin: lateralPose(14),
  flecha: { punto: 'cadera', offset: [0, -30] },
};

// Rueda abdominal.
const ruedaPose = (cadera, torso, rueda) => ({
  cadera, torso, frente: 'abajo', cabeza: torso + 6,
  brazos: { ambos: { destino: rueda, doblar: 'arriba' } },
  piernas: { cerca: { destino: [112, PIE], doblar: 'abajo', pie: 180 }, lejos: { destino: [118, PIE], doblar: 'abajo', pie: 180 } },
  equipo: [colch, E.rueda({ c: [rueda[0], SUELO - 16] })],
});
const ruedaAbdominal = {
  id: 83, nombre: 'Rueda abdominal (ab wheel)', musculos: ['abdomen'],
  inicio: ruedaPose([172, 270], 38, [252, SUELO - 16]),
  fin: ruedaPose([196, 296], 12, [358, SUELO - 16]),
  flecha: { desde: [252, SUELO - 40], hasta: [352, SUELO - 40] },
};

// V-ups.
const vUps = {
  id: 84, nombre: 'V-ups', musculos: ['abdomen'],
  inicio: {
    cadera: [176, PISO], torso: 0, frente: 'arriba',
    brazos: { ambos: { angulos: [2, 0] } },
    piernas: { ambas: { angulos: [180, 180], pie: 90 } },
    equipo: [colch],
  },
  fin: {
    cadera: [190, PISO - 4], torso: 52, frente: [-0.79, -0.6],
    brazos: { ambos: { angulos: [118, 116] } },
    piernas: { ambas: { angulos: [126, 126], pie: 126 } },
    equipo: [colch],
  },
  flecha: [{ punto: 'cabeza', curva: 30 }, { punto: 'pie', curva: -30 }],
};

// ---------- Lumbares ----------
// Banco romano a 45: pad en la cadera, pies trabados abajo.
const TOBILLO_R = [100, 300];
const caderaRomano = sum(TOBILLO_R, mul(dir(42), 122));
const romanoPose = (torso) => ({
  cadera: caderaRomano, torso, frente: dir(torso - 90), cabeza: torso,
  brazos: { ambos: manosNuca(caderaRomano, torso).ambos },
  piernas: { ambas: { destino: TOBILLO_R, doblar: 'abajo', pie: 300 } },
  equipo: [
    E.libre({ svg: `<line x1="70" y1="${SUELO}" x2="250" y2="${SUELO}" stroke="${C.equipoOscuro}" stroke-width="8"/><line x1="${TOBILLO_R[0] - 10}" y1="${SUELO}" x2="${TOBILLO_R[0] - 4}" y2="${TOBILLO_R[1] + 6}" stroke="${C.equipoOscuro}" stroke-width="8"/>` }),
    E.libre({ svg: `<line x1="214" y1="${SUELO}" x2="${caderaRomano[0] + 22}" y2="${caderaRomano[1] + 24}" stroke="${C.equipoOscuro}" stroke-width="9"/>` }),
    E.pad({ a: sum(sum(caderaRomano, mul(dir(-48), 20)), mul(dir(42), -34)), b: sum(sum(caderaRomano, mul(dir(-48), 20)), mul(dir(42), 8)), w: 16, capa: 'medio' }),
    E.rodillo({ c: sum(TOBILLO_R, [12, -10]), r: 9 }),
    E.libre({ svg: `<rect x="${TOBILLO_R[0] - 18}" y="${TOBILLO_R[1] + 6}" width="34" height="8" rx="3" fill="${C.equipo}"/>` }),
  ],
});
const extLumbares = {
  id: 85, nombre: 'Extensiones lumbares en banco romano', musculos: ['lumbares', 'gluteos', 'isquios'],
  inicio: romanoPose(298),
  fin: romanoPose(42),
  flecha: { punto: 'cabeza', curva: 50 },
};

const supermanPose = (torso, brazo, pierna) => ({
  cadera: [170, PISO], torso, frente: 'abajo', cabeza: torso + 4,
  brazos: { ambos: { angulos: [brazo, brazo] } },
  piernas: { ambas: { angulos: [180 + pierna, 180 + pierna], pie: 180 + pierna } },
  equipo: [colch],
});
const supermans = {
  id: 86, nombre: 'Supermans', musculos: ['lumbares', 'gluteos'],
  inicio: supermanPose(0, 0, 0),
  fin: supermanPose(14, 24, -12),
  flecha: [{ punto: 'mano', curva: 16, offset: [0, -14] }, { punto: 'pie', curva: -16, offset: [0, -14] }],
};

const buenosDias = {
  id: 87, nombre: 'Buenos días (Good mornings)', musculos: ['lumbares', 'isquios'],
  inicio: parado({ brazos: manosNuca([198, 218], 90) }),
  fin: {
    cadera: [164, 214], torso: 12, frente: 'abajo', cabeza: 16,
    brazos: manosNuca([164, 214], 12, 16),
    piernas: { cerca: { destino: [200, PIE], doblar: 'der' }, lejos: { destino: [192, PIE], doblar: 'der' } },
  },
  flecha: { punto: 'hombro', offset: [30, -20], curva: -40 },
};

module.exports = [crunch, crunchMaquina, crunchPolea, elevColgado, elevBanco, plancha, planchaLateral, ruedaAbdominal, vUps, extLumbares, supermans, buenosDias];
