const B = require('./base');
const { E, C, SUELO, PIE, parado, frente, asiento, bancoPlano, mancuernas } = B;

// ---------- Biceps ----------
const colgado = { angulos: [272, 274] };
const colgadoLejos = { angulos: [270, 272] };
const curlado = { angulos: [268, 62] };

const curlBarra = (id, nombre, musculos) => ({
  id, nombre, musculos,
  inicio: parado({ brazos: { ambos: colgado }, equipo: [B.barraEnManos()] }),
  fin: parado({ brazos: { ambos: curlado }, equipo: [B.barraEnManos()] }),
  flecha: { punto: 'mano', offset: [34, 0], curva: -34 },
});

const curlMancuernas = (id, nombre, musculos, ambos) => ({
  id, nombre, musculos,
  inicio: parado({ brazos: { cerca: colgado, lejos: colgadoLejos }, equipo: mancuernas({ punta: true }) }),
  fin: parado({ brazos: { cerca: curlado, lejos: ambos ? { angulos: [270, 66] } : colgadoLejos }, equipo: mancuernas({ punta: true }) }),
  flecha: { punto: 'mano', curva: -30, offset: [8, 0] },
});

const curlMartillo = {
  id: 32, nombre: 'Curl martillo', musculos: ['biceps', 'antebrazo'],
  inicio: parado({ brazos: { cerca: colgado, lejos: colgadoLejos }, equipo: [sk => E.mancuerna({ c: sk.brazos.cerca.fin, angulo: 4 }), sk => ({ ...E.mancuerna({ c: sk.brazos.lejos.fin, angulo: 2 }), capa: 'fondo' })] }),
  fin: parado({ brazos: { cerca: curlado, lejos: colgadoLejos }, equipo: [sk => E.mancuerna({ c: sk.brazos.cerca.fin, angulo: 152 }), sk => ({ ...E.mancuerna({ c: sk.brazos.lejos.fin, angulo: 2 }), capa: 'fondo' })] }),
  flecha: { punto: 'mano', curva: -30, offset: [8, 0] },
};

// Banco Scott / predicador: el brazo apoya sobre un atril inclinado.
const atril = [
  asiento(122, 196, 282),
  E.poste({ x: 252, y1: 250, w: 9 }),
  E.libre({ svg: `<rect x="226" y="${SUELO - 6}" width="52" height="6" rx="2" fill="${C.equipoOscuro}"/>` }),
  E.pad({ a: [198, 220], b: [246, 262], w: 18 }),
];
const sentadoAtril = brazo => ({
  cadera: [160, 266], torso: 80, frente: 'der',
  brazos: { ambos: brazo },
  piernas: { cerca: { destino: [214, PIE], doblar: 'arriba' }, lejos: { destino: [206, PIE], doblar: 'arriba' } },
  equipo: [...atril, sk => E.barra({ c: sk.brazos.cerca.fin, r: 19 })],
});
const curlPredicador = {
  id: 33, nombre: 'Curl predicador', musculos: ['biceps'],
  inicio: sentadoAtril({ angulos: [318, 302] }),
  fin: sentadoAtril({ angulos: [318, 112] }),
  flecha: { punto: 'mano', curva: -40, offset: [20, 0] },
};

const POLEA_ATRAS = [52, 318];
const curlBayesiano = {
  id: 34, nombre: 'Curl bayesiano en polea baja', musculos: ['biceps'],
  inicio: parado({
    cadera: [206, 218], torso: 92,
    piernas: { cerca: { destino: [236, PIE], doblar: 'der' }, lejos: { destino: [176, PIE], doblar: 'der' } },
    brazos: { cerca: { angulos: [246, 244] }, lejos: { angulos: [266, 270] } },
    equipo: [E.polea({ x: POLEA_ATRAS[0], y: POLEA_ATRAS[1], tope: 200 }), sk => E.cableA({ desde: POLEA_ATRAS, hacia: sk.brazos.cerca.fin, capa: 'fondo' }), sk => E.asa({ c: sk.brazos.cerca.fin, angulo: 90, ancho: 16 })],
  }),
  fin: parado({
    cadera: [206, 218], torso: 92,
    piernas: { cerca: { destino: [236, PIE], doblar: 'der' }, lejos: { destino: [176, PIE], doblar: 'der' } },
    brazos: { cerca: { angulos: [246, 70] }, lejos: { angulos: [266, 270] } },
    equipo: [E.polea({ x: POLEA_ATRAS[0], y: POLEA_ATRAS[1], tope: 200 }), sk => E.cableA({ desde: POLEA_ATRAS, hacia: sk.brazos.cerca.fin, capa: 'fondo' }), sk => E.asa({ c: sk.brazos.cerca.fin, angulo: 90, ancho: 16 })],
  }),
  flecha: { punto: 'mano', curva: -40, offset: [24, 0] },
};

// Curl doble en polea alta (pose de "doble biceps"), de frente.
const poleasLaterales = y => [
  E.poste({ x: 40, y1: 40, w: 14 }),
  E.poste({ x: 360, y1: 40, w: 14 }),
  sk => E.libre({
    svg:
      `<line x1="360" y1="${y}" x2="${sk.brazos.der.fin[0]}" y2="${sk.brazos.der.fin[1]}" stroke="${C.cable}" stroke-width="2.5"/>` +
      `<line x1="40" y1="${y}" x2="${sk.brazos.izq.fin[0]}" y2="${sk.brazos.izq.fin[1]}" stroke="${C.cable}" stroke-width="2.5"/>` +
      `<circle cx="360" cy="${y}" r="9" fill="${C.equipo}" stroke="${C.equipoClaro}" stroke-width="3"/>` +
      `<circle cx="40" cy="${y}" r="9" fill="${C.equipo}" stroke="${C.equipoClaro}" stroke-width="3"/>`,
  }),
];
const curlDoblePolea = {
  id: 35, nombre: 'Curl doble en polea alta', musculos: ['biceps'],
  inicio: frente({ brazos: { ambos: { angulos: [8, 4] } }, equipo: poleasLaterales(110) }),
  fin: frente({ brazos: { ambos: { angulos: [8, 100] } }, equipo: poleasLaterales(110) }),
  flecha: [{ punto: 'mano', curva: 30 }, { punto: 'manoIzq', curva: -30 }],
};

// Curl concentrado: sentado, codo apoyado en la cara interna del muslo.
const concentrado = antebrazo => ({
  cadera: [158, 270], torso: 58, frente: 'der',
  brazos: { cerca: { angulos: [282, antebrazo] }, lejos: { destino: [230, 256], doblar: 'abajo' } },
  piernas: { cerca: { destino: [236, PIE], doblar: 'arriba' }, lejos: { destino: [226, PIE], doblar: 'arriba' } },
  equipo: [E.banco({ x1: 90, x2: 190, y: 284 }), sk => E.mancuernaPunta({ c: sk.brazos.cerca.fin })],
});
const curlConcentrado = {
  id: 36, nombre: 'Curl concentrado (Scott)', musculos: ['biceps'],
  inicio: concentrado(272),
  fin: concentrado(128),
  flecha: { punto: 'mano', curva: -40, offset: [16, 0] },
};

// Maquina de curl: atril casi horizontal, palanca que gira en el codo y pila de pesas.
const maquinaCurl = codoY => [
  E.pila({ x: 300, y: 150, h: 120 }),
  asiento(118, 192, 284),
  E.poste({ x: 246, y1: codoY + 10, w: 10 }),
  E.libre({ svg: `<rect x="220" y="${SUELO - 6}" width="52" height="6" rx="2" fill="${C.equipoOscuro}"/>` }),
  E.pad({ a: [196, codoY + 12], b: [254, codoY + 24], w: 16 }),
];
const sentadoCurlMaq = (antebrazo) => ({
  cadera: [156, 270], torso: 86, frente: 'der',
  brazos: { ambos: { angulos: [328, antebrazo] } },
  piernas: { cerca: { destino: [214, PIE], doblar: 'arriba' }, lejos: { destino: [206, PIE], doblar: 'arriba' } },
  equipo: [
    ...maquinaCurl(208),
    sk => E.palanca({ a: sk.brazos.cerca.medio, b: B.sum(sk.brazos.cerca.fin, B.mul(B.unit(B.sub(sk.brazos.cerca.fin, sk.brazos.cerca.medio)), 8)) }),
    sk => E.asa({ c: sk.brazos.cerca.fin, angulo: 90, ancho: 16 }),
  ],
});
const curlMaquina = {
  id: 37, nombre: 'Curl en máquina', musculos: ['biceps'],
  inicio: sentadoCurlMaq(338),
  fin: sentadoCurlMaq(108),
  flecha: { punto: 'mano', curva: -40, offset: [16, 0] },
};

// ---------- Triceps ----------
const POLEA_ALTA = [340, 52];
const extPoleaAlta = {
  id: 38, nombre: 'Extensión en polea alta', musculos: ['triceps'],
  inicio: parado({ torso: 84, brazos: { ambos: { angulos: [276, 38] } }, equipo: [E.polea({ x: POLEA_ALTA[0], y: POLEA_ALTA[1] }), sk => E.cableA({ desde: POLEA_ALTA, hacia: sk.brazos.cerca.fin, capa: 'fondo' }), sk => E.asa({ c: sk.brazos.cerca.fin, angulo: 0, ancho: 22 })] }),
  fin: parado({ torso: 84, brazos: { ambos: { angulos: [276, 290] } }, equipo: [E.polea({ x: POLEA_ALTA[0], y: POLEA_ALTA[1] }), sk => E.cableA({ desde: POLEA_ALTA, hacia: sk.brazos.cerca.fin, capa: 'fondo' }), sk => E.asa({ c: sk.brazos.cerca.fin, angulo: 0, ancho: 22 })] }),
  flecha: { punto: 'mano', curva: 36, offset: [20, 0] },
};

const extNucaMancuerna = {
  id: 39, nombre: 'Extensión sobre la cabeza con mancuerna', musculos: ['triceps'],
  inicio: parado({ brazos: { ambos: { angulos: [98, 252] } }, equipo: [sk => E.mancuerna({ c: sk.brazos.cerca.fin, angulo: 90 })] }),
  fin: parado({ brazos: { ambos: { angulos: [98, 94] } }, equipo: [sk => E.mancuerna({ c: sk.brazos.cerca.fin, angulo: 90 })] }),
  flecha: { punto: 'mano', curva: 40, offset: [-18, 0] },
};

const POLEA_DETRAS = [44, 236];
const extNucaPolea = {
  id: 40, nombre: 'Extensión sobre la cabeza en polea', musculos: ['triceps'],
  inicio: {
    cadera: [196, 222], torso: 66, frente: 'der', cabeza: 70,
    brazos: { ambos: { angulos: [70, 212] } },
    piernas: { cerca: { destino: [252, PIE], doblar: 'der' }, lejos: { destino: [160, PIE], doblar: 'der' } },
    equipo: [E.polea({ x: POLEA_DETRAS[0], y: POLEA_DETRAS[1], tope: 120 }), sk => E.cableA({ desde: POLEA_DETRAS, hacia: sk.brazos.cerca.fin, capa: 'fondo' })],
  },
  fin: {
    cadera: [196, 222], torso: 66, frente: 'der', cabeza: 70,
    brazos: { ambos: { angulos: [62, 50] } },
    piernas: { cerca: { destino: [252, PIE], doblar: 'der' }, lejos: { destino: [160, PIE], doblar: 'der' } },
    equipo: [E.polea({ x: POLEA_DETRAS[0], y: POLEA_DETRAS[1], tope: 120 }), sk => E.cableA({ desde: POLEA_DETRAS, hacia: sk.brazos.cerca.fin, capa: 'fondo' })],
  },
  flecha: { punto: 'mano', curva: -30 },
};

const piernasBanco = {
  cerca: { destino: [116, PIE], doblar: 'arriba', pie: 180 },
  lejos: { destino: [128, PIE], doblar: 'arriba', pie: 180 },
};
const pressFrances = {
  id: 41, nombre: 'Press francés', musculos: ['triceps'],
  inicio: { cadera: [150, 256], torso: 0, frente: 'arriba', brazos: { ambos: { angulos: [98, 334] } }, piernas: piernasBanco, equipo: [bancoPlano(110, 290), B.barraEnManos()] },
  fin: { cadera: [150, 256], torso: 0, frente: 'arriba', brazos: { ambos: { angulos: [98, 92] } }, piernas: piernasBanco, equipo: [bancoPlano(110, 290), B.barraEnManos()] },
  flecha: { punto: 'mano', curva: 34, offset: [0, -10] },
};

// Fondos en banco: manos atras en el borde, talones en el piso.
const fondoBanco = hombro => ({
  cadera: [B.sub(hombro, [0, 0])[0] + 14, hombro[1] + 82], torso: 98, frente: 'der',
  brazos: { ambos: { destino: [128, 270], doblar: 'izq' } },
  piernas: { cerca: { destino: [308, PIE], doblar: 'arriba', pie: 80 }, lejos: { destino: [300, PIE], doblar: 'arriba', pie: 80 } },
  equipo: [E.banco({ x1: 40, x2: 140, y: 276 })],
});
const fondosBanco = {
  id: 42, nombre: 'Fondos', musculos: ['triceps', 'pecho'],
  inicio: fondoBanco([138, 176]),
  fin: fondoBanco([150, 226]),
  flecha: { punto: 'hombro', offset: [-50, -36] },
};

// Patada de triceps: rodilla y mano en el banco, brazo paralelo al torso.
const bancoBajo = E.banco({ x1: 130, x2: 300, y: 282 });
const patadaPose = antebrazo => ({
  cadera: [168, 214], torso: 20, frente: 'abajo', cabeza: 24,
  brazos: { lejos: { destino: [254, 280], doblar: 'izq' }, cerca: { angulos: [196, antebrazo] } },
  piernas: { lejos: { destino: [124, 276], doblar: 'abajo', pie: 180 }, cerca: { destino: [158, PIE], doblar: 'der' } },
  equipo: [bancoBajo, sk => E.mancuerna({ c: sk.brazos.cerca.fin, angulo: antebrazo + 90 })],
});
const patadaTriceps = {
  id: 43, nombre: 'Patada de tríceps', musculos: ['triceps'],
  inicio: patadaPose(272),
  fin: patadaPose(198),
  flecha: { punto: 'mano', curva: -30 },
};

// Maquina de fondos sentado.
const PIVOTE_FONDO = [118, 198];
const sentadoFondos = mano => ({
  cadera: [182, 270], torso: 94, frente: 'der',
  brazos: { ambos: { destino: mano, doblar: 'izq' } },
  piernas: { cerca: { destino: [252, PIE], doblar: 'arriba' }, lejos: { destino: [244, PIE], doblar: 'arriba' } },
  equipo: [
    E.pila({ x: 60, y: 160 }),
    asiento(140, 214, 284),
    E.pad({ a: [154, 274], b: [150, 176], w: 14 }),
    sk => E.palanca({ a: PIVOTE_FONDO, b: sk.brazos.cerca.fin, capa: 'fondo' }),
    sk => E.asa({ c: sk.brazos.cerca.fin, angulo: 90, ancho: 16 }),
  ],
});
const extMaquina = {
  id: 44, nombre: 'Extensión en máquina', musculos: ['triceps'],
  inicio: sentadoFondos([194, 200]),
  fin: sentadoFondos([194, 280]),
  flecha: { punto: 'mano', offset: [34, 0] },
};

// ---------- Antebrazos ----------
// Curl de muñeca: sentado, antebrazos sobre los muslos.
const munecaMuslo = mano => ({
  cadera: [156, 268], torso: 64, frente: 'der',
  brazos: { ambos: { angulos: [264, 354], mano } },
  piernas: { cerca: { destino: [240, PIE], doblar: 'arriba' }, lejos: { destino: [232, PIE], doblar: 'arriba' } },
  equipo: [E.banco({ x1: 86, x2: 190, y: 284 }), sk => E.barra({ c: sk.brazos.cerca.fin, r: 16 })],
});
const curlMunecaSupino = {
  id: 45, nombre: 'Curl de muñeca supino', musculos: ['antebrazo'],
  inicio: munecaMuslo(290),
  fin: munecaMuslo(62),
  flecha: { punto: 'mano', curva: -26, offset: [22, 0] },
};

// Curl de muñeca prono: arrodillado, antebrazos apoyados en un banco.
const munecaBanco = mano => ({
  cadera: [176, 270], torso: 36, frente: 'abajo', cabeza: 30,
  brazos: { ambos: { angulos: [282, 0], mano } },
  piernas: { cerca: { destino: [114, PIE], doblar: 'abajo', pie: 180 }, lejos: { destino: [120, PIE], doblar: 'abajo', pie: 180 } },
  equipo: [E.banco({ x1: 214, x2: 296, y: 282 }), sk => E.mancuernaPunta({ c: sk.brazos.cerca.fin, r: 11 })],
});
const curlMunecaProno = {
  id: 46, nombre: 'Curl de muñeca prono', musculos: ['antebrazo'],
  inicio: munecaBanco(286),
  fin: munecaBanco(48),
  flecha: { punto: 'mano', curva: -26, offset: [22, 0] },
};

// Hand gripper.
const gripperPose = abierto => parado({
  brazos: { cerca: { angulos: [276, 4] }, lejos: colgadoLejos },
  equipo: [sk => E.gripper({ c: sk.brazos.cerca.fin, abierto, angulo: 90 })],
});
const handGripper = {
  id: 49, nombre: 'Hand gripper', musculos: ['antebrazo'],
  inicio: gripperPose(true),
  fin: gripperPose(false),
};

// Wrist roller: brazos al frente, la soga se enrolla y sube el disco.
const rollerPose = yPeso => parado({
  brazos: { ambos: { angulos: [356, 0] } },
  equipo: [
    sk => E.libre({ capa: 'frente', svg: `<circle cx="${sk.brazos.cerca.fin[0]}" cy="${sk.brazos.cerca.fin[1]}" r="6" fill="${C.discoBorde}"/>` }),
    sk => E.pesoColgado({ desde: sk.brazos.cerca.fin, y: yPeso, capa: 'frente' }),
  ],
});
const wristRoller = {
  id: 50, nombre: 'Wrist roller (con cuerda y peso)', musculos: ['antebrazo'],
  inicio: rollerPose(318),
  fin: rollerPose(212),
  flecha: { desde: [334, 318], hasta: [334, 214] },
};

module.exports = [
  curlBarra(30, 'Curl con barra recta', ['biceps']),
  curlMancuernas(31, 'Curl con mancuernas', ['biceps'], false),
  curlMartillo,
  curlPredicador,
  curlBayesiano,
  curlDoblePolea,
  curlConcentrado,
  curlMaquina,
  extPoleaAlta,
  extNucaMancuerna,
  extNucaPolea,
  pressFrances,
  fondosBanco,
  patadaTriceps,
  extMaquina,
  curlMunecaSupino,
  curlMunecaProno,
  curlBarra(47, 'Curl invertido con barra', ['antebrazo', 'biceps']),
  curlMancuernas(48, 'Curl invertido con mancuernas', ['antebrazo', 'biceps'], true),
  handGripper,
  wristRoller,
];
