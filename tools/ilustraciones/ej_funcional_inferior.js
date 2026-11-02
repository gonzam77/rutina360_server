// Funcional · Tren inferior (categoria 104).
const F = require('./base_funcional');
const { E, PIE, PISO, SUELO, MANO_SUELO, parado, frente, deFuerza, sentadillaAbajo, brazosAlFrente, brazosAbajo, colch } = F;

// Copia un ejercicio de fuerza sin el peso en las manos.
const sinPeso = (pose, extra = {}) => ({ ...pose, equipo: (pose.equipo || []).filter(e => typeof e !== 'function'), ...extra });

const sentadillaCorporal = {
  id: 1036, nombre: 'Sentadilla con peso corporal', musculos: ['cuadriceps', 'gluteos'],
  inicio: parado({ brazos: brazosAbajo }),
  fin: sentadillaAbajo(),
  flecha: { punto: 'cadera', offset: [-50, 0], curva: -20 },
};

// Sentadilla isometrica con la espalda apoyada en la pared (a la izquierda).
const sentadillaPared = {
  id: 1037, nombre: 'Sentadilla isométrica en pared', musculos: ['cuadriceps', 'gluteos'],
  sostenido: true,
  pose: {
    cadera: [150, 270], torso: 90, frente: 'der',
    brazos: { ambos: { angulos: [272, 0], escala: [0.7, 0.75] } },
    piernas: { cerca: { destino: [218, PIE], doblar: 'der' }, lejos: { destino: [210, PIE], doblar: 'der' } },
    equipo: [E.pared({ x: 118, y: 60 })],
  },
};

// Sumo sin peso: manos juntas adelante del pecho.
const manosPecho = { ambos: { destino: [204, 176], doblar: 'der' } };
const sumo = deFuerza(72);
const sentadillaSumo = {
  id: 1038, nombre: 'Sentadilla sumo', musculos: ['aductores', 'gluteos', 'cuadriceps'],
  inicio: { ...sumo.inicio, brazos: manosPecho, equipo: [] },
  fin: { ...sumo.fin, brazos: { ambos: { destino: [204, 226], doblar: 'der' } }, equipo: [] },
  flecha: sumo.flecha,
};

const zancadas = deFuerza(55);
const manosCintura = { ambos: { angulos: [250, 340], escala: [0.7, 0.7] } };
const estocadasAlternadas = {
  id: 1039, nombre: 'Estocadas alternadas', musculos: ['cuadriceps', 'gluteos'],
  inicio: { ...zancadas.inicio, brazos: manosCintura, equipo: [] },
  fin: { ...zancadas.fin, brazos: manosCintura, equipo: [] },
  flecha: zancadas.flecha,
};

const estocadasAtras = {
  id: 1040, nombre: 'Estocadas hacia atrás', musculos: ['gluteos', 'cuadriceps'],
  inicio: { ...zancadas.inicio, brazos: manosCintura, equipo: [] },
  fin: {
    ...zancadas.fin, cadera: [214, 268], brazos: manosCintura, equipo: [],
    piernas: { cerca: { destino: [262, PIE], doblar: 'der' }, lejos: { destino: [128, 324], doblar: 'der', pie: 300 } },
  },
  flecha: { desde: [190, 330], hasta: [124, 330], curva: 26 },
};

const bulgara = deFuerza(58);
const bulgaraEj = {
  id: 1041, nombre: 'Sentadilla búlgara', musculos: ['cuadriceps', 'gluteos'],
  inicio: { ...sinPeso(bulgara.inicio), brazos: manosCintura },
  fin: { ...sinPeso(bulgara.fin), brazos: manosCintura },
  flecha: bulgara.flecha,
};

// Puente de gluteos: hombros en el piso (cabeza a la izquierda), pies apoyados.
const puentePose = (arriba, piernaLibre) => ({
  cadera: arriba ? [196, 276] : [196, PISO],
  torso: arriba ? 213 : 180, frente: 'arriba', cabeza: 180,
  brazos: { ambos: { angulos: [356, 0] } },
  piernas: {
    lejos: { destino: [252, PIE], doblar: 'arriba' },
    cerca: piernaLibre ? { angulos: arriba ? [24, 24] : [40, 40], pie: arriba ? 104 : 120 } : { destino: [258, PIE], doblar: 'arriba' },
  },
  equipo: [colch()],
});
const puente = {
  id: 1042, nombre: 'Puente de glúteos', musculos: ['gluteos', 'isquios'],
  inicio: puentePose(false, false),
  fin: puentePose(true, false),
  flecha: { punto: 'cadera', offset: [0, -40] },
};
const puenteUnaPierna = {
  id: 1043, nombre: 'Puente de glúteos a una pierna', musculos: ['gluteos', 'isquios'],
  inicio: puentePose(false, true),
  fin: puentePose(true, true),
  flecha: { punto: 'cadera', offset: [0, -40] },
};

const step = deFuerza(56);
const stepUps = {
  id: 1044, nombre: 'Step-ups al banco', musculos: ['cuadriceps', 'gluteos'],
  inicio: { ...sinPeso(step.inicio), brazos: manosCintura },
  fin: { ...sinPeso(step.fin), brazos: manosCintura },
  flecha: step.flecha,
};

const talones = deFuerza(73);
const elevTalones = {
  id: 1045, nombre: 'Elevación de talones', musculos: ['gemelos'],
  inicio: { ...talones.inicio, brazos: manosCintura, equipo: [] },
  fin: { ...talones.fin, brazos: manosCintura, equipo: [] },
  flecha: talones.flecha,
};

const patada = { ...deFuerza(67), id: 1046, nombre: 'Patada de glúteo en cuadrupedia' };

// Goblet con kettlebell: la pesa agarrada adelante del pecho.
const goblet = (pose) => {
  // Manos adelante del esternon: desde el hombro, hacia el pecho y un poco abajo.
  const hombro = F.hombroDe(pose.cadera, pose.torso);
  const pecho = F.dir(pose.torso - 90);
  const abajo = F.dir(pose.torso + 180);
  const manos = F.sum(F.sum(hombro, F.mul(pecho, 28)), F.mul(abajo, 18));
  return goblet2(pose, manos);
};
const goblet2 = (pose, manos) => ({
  ...pose,
  brazos: { ambos: { destino: manos, doblar: 'abajo' } },
  equipo: [sk => E.kettlebell({ c: sk.brazos.cerca.fin, hacia: 270 })],
});
const sentadillaGoblet = {
  id: 1047, nombre: 'Sentadilla goblet con kettlebell', musculos: ['cuadriceps', 'gluteos'],
  inicio: goblet(parado()),
  fin: goblet(sentadillaAbajo()),
  flecha: { punto: 'cadera', offset: [-50, 0], curva: -20 },
};

module.exports = [
  sentadillaCorporal, sentadillaPared, sentadillaSumo, estocadasAlternadas, estocadasAtras, bulgaraEj,
  puente, puenteUnaPierna, stepUps, elevTalones, patada, sentadillaGoblet,
];
