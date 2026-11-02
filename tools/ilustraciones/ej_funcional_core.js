// Funcional · Core (categoria 101).
const F = require('./base_funcional');
const { E, PIE, PISO, MANO_SUELO, SUELO, frente, colch, deFuerza, planchaAlta, cuadrupedia, bocaArriba, manosNuca, HOMBRO_ALTA, sum } = F;

const plancha = deFuerza(81);
const lateral = deFuerza(82);

const planchaFrontal = {
  id: 1001, nombre: 'Plancha frontal', musculos: ['abdomen'],
  sostenido: true, pose: plancha.fin,
};

const planchaAltaEj = {
  id: 1002, nombre: 'Plancha alta (brazos extendidos)', musculos: ['abdomen', 'hombro'],
  sostenido: true, pose: planchaAlta(),
};

// La plancha lateral del catalogo apoya el brazo izquierdo (de frente, el
// apoyo queda a la derecha de la pantalla). La derecha es su espejo.
const lateralIzq = {
  id: 1003, nombre: 'Plancha lateral izquierda', musculos: ['abdomen'],
  sostenido: true, pose: lateral.fin,
};
const lateralDer = {
  id: 1004, nombre: 'Plancha lateral derecha', musculos: ['abdomen'],
  sostenido: true, espejo: true, pose: lateral.fin,
};

const toqueHombros = {
  id: 1005, nombre: 'Plancha con toque de hombros', musculos: ['abdomen', 'hombro'],
  inicio: planchaAlta(),
  fin: planchaAlta({
    brazos: {
      lejos: { destino: [262, MANO_SUELO], doblar: 'arriba' },
      cerca: { destino: sum(HOMBRO_ALTA, [-4, 10]), doblar: 'abajo' },
    },
  }),
  flecha: { punto: 'mano', curva: -30, offset: [16, 0] },
};

const crunch = { ...deFuerza(76), id: 1006 };

const crunchInverso = {
  id: 1007, nombre: 'Crunch inverso', musculos: ['abdomen'],
  inicio: bocaArriba({ cadera: [190, PISO], piernas: { ambas: { angulos: [92, 182], pie: 90 } } }),
  fin: bocaArriba({ cadera: [190, PISO - 12], torso: -4, piernas: { ambas: { angulos: [58, 104], pie: 30 } } }),
  flecha: { punto: 'rodilla', curva: -30, offset: [0, -14] },
};

const bicicletaPose = (cercaAng, lejosAng) => {
  const cadera = [168, PISO];
  return {
    cadera, torso: 32, frente: 'arriba', cabeza: 44,
    brazos: manosNuca(cadera, 32, 44),
    piernas: { cerca: { angulos: cercaAng, pie: cercaAng[1] }, lejos: { angulos: lejosAng, pie: lejosAng[1] } },
    equipo: [colch()],
  };
};
const crunchBicicleta = {
  id: 1008, nombre: 'Crunch bicicleta', musculos: ['abdomen'],
  inicio: bicicletaPose([62, 160], [166, 170]),
  fin: bicicletaPose([166, 170], [62, 160]),
  flecha: { punto: 'rodilla', curva: 30, offset: [0, -16] },
};

const hollow = {
  id: 1009, nombre: 'Hollow hold', musculos: ['abdomen'],
  sostenido: true,
  pose: {
    cadera: [190, PISO + 2], torso: 18, frente: 'arriba', cabeza: 26,
    brazos: { ambos: { angulos: [14, 12] } },
    piernas: { ambas: { angulos: [166, 168], pie: 150 } },
    equipo: [colch()],
  },
};

const deadBugPose = (lejosBrazo, cercaPierna) => bocaArriba({
  cadera: [168, PISO],
  brazos: { cerca: { angulos: [90, 90] }, lejos: { angulos: lejosBrazo } },
  piernas: { lejos: { angulos: [92, 182], pie: 90 }, cerca: { angulos: cercaPierna, pie: cercaPierna[1] - 90 } },
});
const deadBug = {
  id: 1010, nombre: 'Bicho muerto (dead bug)', musculos: ['abdomen'],
  inicio: deadBugPose([90, 90], [92, 182]),
  fin: deadBugPose([8, 6], [174, 176]),
  flecha: [{ punto: 'pie', curva: -30 }],
};

const elevPiernas = {
  id: 1011, nombre: 'Elevación de piernas acostado', musculos: ['abdomen'],
  inicio: bocaArriba({ cadera: [190, PISO], piernas: { ambas: { angulos: [176, 178], pie: 90 } } }),
  fin: bocaArriba({ cadera: [190, PISO], piernas: { ambas: { angulos: [96, 94], pie: 4 } } }),
  flecha: { punto: 'pie', curva: -50 },
};

const tijerasPose = (cerca, lejos) => bocaArriba({
  cadera: [190, PISO], torso: 8, cabeza: 18,
  piernas: { cerca: { angulos: [cerca, cerca], pie: cerca }, lejos: { angulos: [lejos, lejos], pie: lejos } },
});
const tijeras = {
  id: 1012, nombre: 'Tijeras (flutter kicks)', musculos: ['abdomen'],
  inicio: tijerasPose(156, 172),
  fin: tijerasPose(172, 156),
  flecha: { punto: 'pie', curva: 20, offset: [-10, -10] },
};

// Russian twist de costado: sentado en V con el torso inclinado hacia atras y
// los pies despegados. Las manos van del centro al costado de la cadera; el
// giro lo marca la flecha en arco.
const twistPose = (alCostado) => ({
  cadera: [186, 324], torso: 116, frente: [0.9, -0.44], cabeza: 104,
  brazos: alCostado
    ? { ambos: { destino: [214, 330], doblar: 'abajo' } }
    : { ambos: { destino: [212, 262], doblar: 'abajo' } },
  piernas: { cerca: { angulos: [40, 346], pie: 346 }, lejos: { angulos: [44, 350], pie: 350 } },
  equipo: [colch(60, 340)],
});
const russianTwist = {
  id: 1013, nombre: 'Russian twist', musculos: ['abdomen'],
  inicio: twistPose(false),
  fin: twistPose(true),
  flecha: { arco: { centro: [190, 292], rx: 54, ry: 12, a0: 20, a1: 330 } },
};

const vUps = { ...deFuerza(84), id: 1014 };

const superman = {
  id: 1015, nombre: 'Superman', musculos: ['lumbares', 'gluteos'],
  sostenido: true, pose: deFuerza(86).fin,
};

const birdDog = {
  id: 1016, nombre: 'Bird dog', musculos: ['abdomen', 'lumbares', 'gluteos'],
  inicio: cuadrupedia(),
  fin: cuadrupedia({
    brazos: { cerca: { destino: F.MANO_CUADRUPEDIA, doblar: 'izq' }, lejos: { angulos: [12, 12] } },
    piernas: { lejos: { destino: [112, PIE], doblar: 'abajo', pie: 180 }, cerca: { angulos: [178, 180], pie: 180 } },
  }),
  flecha: [{ punto: 'pie', curva: -30 }],
};

module.exports = [
  planchaFrontal, planchaAltaEj, lateralIzq, lateralDer, toqueHombros, crunch, crunchInverso,
  crunchBicicleta, hollow, deadBug, elevPiernas, tijeras, russianTwist, vUps, superman, birdDog,
];
