const B = require('./base');
const { E, C, SUELO, PIE, parado, frente, asiento, bancoPlano, mancuernas, caderaDesde } = B;

const espaldaBarra = sk => E.barra({ c: [sk.hombro[0] - 8, sk.hombro[1] - 4] });
const piernasSent = (x, sep = 8) => ({ cerca: { destino: [x + sep / 2, PIE], doblar: 'der' }, lejos: { destino: [x - sep / 2, PIE], doblar: 'der' } });

// ---------- Cuadriceps ----------
const sentadilla = {
  id: 51, nombre: 'Sentadilla tradicional', musculos: ['cuadriceps', 'gluteos'],
  inicio: parado({ brazos: { ambos: { angulos: [235, 100], escala: [0.85, 0.9] } }, equipo: [espaldaBarra] }),
  fin: {
    cadera: [146, 268], torso: 52, frente: 'der',
    brazos: { ambos: { angulos: [200, 70], escala: [0.85, 0.9] } },
    piernas: piernasSent(202),
    equipo: [espaldaBarra],
  },
  flecha: { punto: 'cadera', offset: [-50, 0], curva: -20 },
};

const frontRack = { ambos: { angulos: [345, 160], escala: [0.8, 0.85] } };
const barraAdelante = sk => E.barra({ c: [sk.hombro[0] + 14, sk.hombro[1] - 4] });
const sentadillaFrontal = {
  id: 52, nombre: 'Sentadilla frontal', musculos: ['cuadriceps', 'gluteos'],
  inicio: parado({ brazos: frontRack, equipo: [barraAdelante] }),
  fin: {
    cadera: [156, 272], torso: 68, frente: 'der',
    brazos: { ambos: { angulos: [10, 166], escala: [0.8, 0.85] } },
    piernas: piernasSent(206),
    equipo: [barraAdelante],
  },
  flecha: { punto: 'cadera', offset: [-50, 0], curva: -20 },
};

// Hack: espalda apoyada en un respaldo inclinado, pies en plataforma.
const HACK = 70;
const hackPose = (cadera) => ({
  cadera, torso: HACK, frente: [0.94, -0.34],
  brazos: { ambos: { angulos: [300, 70], escala: [0.7, 0.8] } },
  piernas: { cerca: { destino: [232, 318], doblar: 'der', pie: 20 }, lejos: { destino: [226, 320], doblar: 'der', pie: 20 } },
  equipo: [
    E.libre({ svg: `<line x1="${190 - 28 - 136 * 0.364}" y1="${SUELO}" x2="${190 - 28 + 200 * 0.364}" y2="${SUELO - 336}" stroke="${C.equipoOscuro}" stroke-width="10" stroke-linecap="round"/>` }),
    E.libre({ svg: `<polygon points="200,${SUELO} 290,${SUELO} 290,${SUELO - 30}" fill="${C.equipo}"/>` }),
    sk => E.pad({ a: B.sum(sk.cadera, [-17, 6]), b: B.sum(sk.hombro, [-19, 7]), w: 14 }),
    sk => E.libre({ capa: 'frente', svg: `<circle cx="${sk.hombro[0] + 4}" cy="${sk.hombro[1] - 6}" r="9" fill="${C.equipo}" stroke="${C.equipoClaro}" stroke-width="2"/>` }),
  ],
});
const sentadillaHack = {
  id: 53, nombre: 'Sentadilla hack', musculos: ['cuadriceps', 'gluteos'],
  inicio: hackPose([190, 208]),
  fin: hackPose([168, 270]),
  flecha: { punto: 'cadera', offset: [-40, 0] },
};

// Prensa 45: respaldo reclinado, plataforma que corre por un riel diagonal.
const prensaPose = pies => ({
  cadera: [150, 268], torso: 150, frente: [0.5, -0.86], cabeza: 150,
  brazos: { ambos: { angulos: [260, 340] } },
  piernas: { cerca: { destino: pies, doblar: 'arriba', pie: 70 }, lejos: { destino: [pies[0] - 6, pies[1] + 4], doblar: 'arriba', pie: 70 } },
  equipo: [
    E.libre({ svg: `<line x1="150" y1="${SUELO - 10}" x2="350" y2="96" stroke="${C.equipoOscuro}" stroke-width="10" stroke-linecap="round"/>` }),
    E.libre({ svg: `<rect x="96" y="${SUELO - 40}" width="110" height="40" rx="6" fill="${C.equipoOscuro}"/>` }),
    E.pad({ a: [160, 282], b: [70, 232], w: 16 }),
    E.pad({ a: [118, 284], b: [190, 284], w: 14 }),
    E.libre({
      capa: 'frente',
      svg: `<g transform="translate(${pies[0] + 10},${pies[1] - 8}) rotate(-45)"><rect x="-6" y="-34" width="12" height="68" rx="4" fill="${C.equipo}"/><circle cx="22" cy="0" r="18" fill="${C.disco}" stroke="${C.discoBorde}" stroke-width="3"/></g>`,
    }),
  ],
});
const prensa = {
  id: 54, nombre: 'Prensa de piernas', musculos: ['cuadriceps', 'gluteos'],
  inicio: prensaPose([196, 196]),
  fin: prensaPose([256, 152]),
  flecha: { punto: 'pie', offset: [40, 20] },
};

// Zancada: piernas abiertas adelante/atras.
const zancada = (o) => ({
  cadera: o.cadera, torso: o.torso ?? 90, frente: 'der',
  brazos: o.brazos || { ambos: { angulos: [272, 272] } },
  piernas: {
    cerca: { destino: [o.adelante, PIE], doblar: 'der' },
    lejos: { destino: o.atras, doblar: 'der', pie: o.pieAtras ?? 300 },
  },
  equipo: o.equipo || mancuernas({ punta: true }),
});
const zancadas = {
  id: 55, nombre: 'Zancadas', musculos: ['cuadriceps', 'gluteos'],
  inicio: zancada({ cadera: [196, 218], adelante: 214, atras: [180, PIE], pieAtras: 0 }),
  fin: zancada({ cadera: [190, 268], adelante: 262, atras: [104, 324] }),
  flecha: { punto: 'cadera', offset: [-50, -10] },
};

const zancadasProfundas = {
  id: 69, nombre: 'Zancadas profundas', musculos: ['gluteos', 'cuadriceps'],
  inicio: zancada({ cadera: [196, 218], adelante: 214, atras: [180, PIE], pieAtras: 0, brazos: { ambos: { angulos: [235, 100], escala: [0.85, 0.9] } }, equipo: [espaldaBarra] }),
  fin: zancada({ cadera: [182, 282], torso: 78, adelante: 280, atras: [86, 326], brazos: { ambos: { angulos: [235, 100], escala: [0.85, 0.9] } }, equipo: [espaldaBarra] }),
  flecha: { punto: 'cadera', offset: [-50, -10] },
};

// Step-up: un pie arriba del cajon.
const CAJON_Y = 278;
const cajon = E.libre({ svg: `<rect x="196" y="${CAJON_Y}" width="110" height="${SUELO - CAJON_Y}" rx="6" fill="${C.equipo}"/>` });
const stepUps = {
  id: 56, nombre: 'Step-ups con banco', musculos: ['cuadriceps', 'gluteos'],
  inicio: {
    cadera: [180, 220], torso: 82, frente: 'der',
    brazos: { ambos: { angulos: [272, 272] } },
    piernas: { cerca: { destino: [236, CAJON_Y - 6], doblar: 'der' }, lejos: { destino: [166, PIE], doblar: 'der' } },
    equipo: [cajon, ...mancuernas({ punta: true })],
  },
  fin: {
    cadera: [236, 158], torso: 90, frente: 'der',
    brazos: { ambos: { angulos: [272, 272] } },
    piernas: { cerca: { destino: [240, CAJON_Y - 6], doblar: 'der' }, lejos: { destino: [222, 252], doblar: 'der', pie: 300 } },
    equipo: [cajon, ...mancuernas({ punta: true })],
  },
  flecha: { punto: 'cadera', offset: [-50, 0] },
};

// Extension de piernas en maquina.
const extensionPose = tobillo => ({
  cadera: [160, 266], torso: 96, frente: 'der',
  brazos: { ambos: { angulos: [272, 300], escala: [0.9, 0.7] } },
  piernas: { cerca: { destino: tobillo, doblar: 'arriba', pie: 0 }, lejos: { destino: [tobillo[0] - 4, tobillo[1] + 2], doblar: 'arriba', pie: 0 } },
  equipo: [
    asiento(118, 230, 280),
    E.pad({ a: [128, 272], b: [122, 170], w: 15 }),
    E.libre({ svg: `<rect x="224" y="282" width="12" height="${SUELO - 282}" fill="${C.equipoOscuro}"/>` }),
    sk => E.palanca({ a: [228, 278], b: B.sum(sk.piernas.cerca.fin, [0, 6]), capa: 'fondo' }),
    sk => E.rodillo({ c: B.sum(sk.piernas.cerca.fin, [2, 12]), r: 10 }),
  ],
});
const extensionPiernas = {
  id: 57, nombre: 'Extensiones de piernas en máquina', musculos: ['cuadriceps'],
  inicio: extensionPose([236, 326]),
  fin: extensionPose([284, 262]),
  flecha: { punto: 'pie', offset: [20, 0], curva: 30 },
};

// Bulgara: pie de atras sobre un banco.
const bulgaraPose = (cadera, adelante, torso = 86) => ({
  cadera, torso, frente: 'der',
  brazos: { ambos: { angulos: [272, 272] } },
  piernas: { cerca: { destino: [adelante, PIE], doblar: 'der' }, lejos: { destino: [96, 268], doblar: 'abajo', pie: 182 } },
  equipo: [E.banco({ x1: 40, x2: 120, y: 280 }), ...mancuernas({ punta: true })],
});
const bulgara = {
  id: 58, nombre: 'Sentadilla búlgara', musculos: ['cuadriceps', 'gluteos'],
  inicio: bulgaraPose([196, 226], 232),
  fin: bulgaraPose([182, 272], 248, 80),
  flecha: { punto: 'cadera', offset: [-44, -20] },
};

// ---------- Isquiotibiales ----------
const pesoMuerto = (id, nombre, musculos, ini, fin, equipoMano = B.barraEnManos()) => ({
  id, nombre, musculos,
  inicio: { ...ini, frente: ini.frente || 'der', equipo: [equipoMano] },
  fin: { ...fin, frente: fin.frente || 'der', equipo: [equipoMano] },
  flecha: { punto: 'hombro', offset: [30, -20], curva: 30 },
});
const rumano = pesoMuerto(59, 'Peso muerto rumano', ['isquios', 'gluteos'],
  parado({ brazos: { ambos: { angulos: [276, 276] } } }),
  { cadera: [150, 214], torso: 18, frente: [0.3, 0.95], cabeza: 24, brazos: { ambos: { destino: [222, 276], doblar: 'izq' } }, piernas: piernasSent(196, 8) },
);
const convencional = {
  id: 60, nombre: 'Peso muerto convencional', musculos: ['isquios', 'gluteos', 'lumbares'],
  inicio: { cadera: [148, 252], torso: 34, frente: 'der', cabeza: 40, brazos: { ambos: { destino: [214, SUELO - 28], doblar: 'izq' } }, piernas: piernasSent(202, 8), equipo: [B.barraEnManos()] },
  fin: parado({ brazos: { ambos: { angulos: [276, 276] } }, equipo: [B.barraEnManos()] }),
  flecha: { punto: 'hombro', offset: [40, 0], curva: -30 },
};
const piernasRigidas = pesoMuerto(61, 'Peso muerto con piernas rígidas', ['isquios', 'gluteos'],
  parado({ cadera: [194, 214], piernas: { cerca: { destino: [202, PIE], doblar: 'der' }, lejos: { destino: [192, PIE], doblar: 'der' } }, brazos: { ambos: { angulos: [276, 276] } } }),
  { cadera: [176, 214], torso: 6, frente: 'abajo', cabeza: 10, brazos: { ambos: { destino: [254, 318], doblar: 'izq' } }, piernas: { cerca: { destino: [202, PIE], doblar: 'der' }, lejos: { destino: [192, PIE], doblar: 'der' } } },
  sk => E.mancuerna({ c: sk.brazos.cerca.fin, angulo: 0 }),
);

// Curl femoral acostado boca abajo.
const femoralPose = pierna => ({
  cadera: [190, 250], torso: 0, frente: 'abajo', cabeza: 10,
  brazos: { ambos: { destino: [300, 270], doblar: 'abajo' } },
  piernas: { cerca: pierna, lejos: pierna },
  equipo: [
    E.banco({ x1: 70, x2: 320, y: 266 }),
    E.libre({ svg: `<rect x="56" y="270" width="12" height="${SUELO - 270}" fill="${C.equipoOscuro}"/>` }),
    sk => E.palanca({ a: [62, 276], b: sk.piernas.cerca.fin, capa: 'fondo' }),
    sk => E.rodillo({ c: B.sum(sk.piernas.cerca.fin, B.mul(B.unit(B.sub(sk.piernas.cerca.medio, sk.piernas.cerca.fin)), -2)), r: 10 }),
  ],
});
const curlFemoral = {
  id: 62, nombre: 'Curl femoral', musculos: ['isquios'],
  inicio: femoralPose({ angulos: [180, 180], pie: 270 }),
  fin: femoralPose({ angulos: [180, 80], pie: 170 }),
  flecha: { punto: 'pie', curva: -40, offset: [0, -14] },
};

// Sentadilla sissy: talones arriba, rodillas al frente, cuerpo recto inclinado atras.
const sissyPose = (cadera, torso, rodilla) => ({
  cadera, torso, frente: 'der',
  brazos: { ambos: { angulos: [0, 0], escala: [0.8, 0.8] } },
  piernas: { cerca: { destino: [210, PIE - 8], doblar: rodilla, pie: 320 }, lejos: { destino: [202, PIE - 8], doblar: rodilla, pie: 320 } },
  equipo: [E.poste({ x: 280, y1: 160, w: 9 })],
});
const sissy = {
  id: 63, nombre: 'Sentadilla sissy', musculos: ['cuadriceps'],
  inicio: sissyPose([200, 214], 90, 'der'),
  fin: sissyPose([178, 262], 112, 'der'),
  flecha: { punto: 'rodilla', offset: [26, 0] },
};

// GHR: rodillas sobre el pad, pies trabados atras.
const ghrPose = (cadera, torso) => ({
  cadera, torso, frente: torso < 45 ? 'abajo' : 'der',
  brazos: { ambos: { angulos: [torso - 150, torso - 120], escala: [0.8, 0.8] } },
  piernas: { cerca: { destino: [94, 236], doblar: 'abajo', pie: 270 }, lejos: { destino: [98, 238], doblar: 'abajo', pie: 270 } },
  equipo: [
    E.libre({ svg: `<rect x="70" y="250" width="12" height="${SUELO - 250}" fill="${C.equipoOscuro}"/><rect x="140" y="270" width="12" height="${SUELO - 270}" fill="${C.equipoOscuro}"/><rect x="60" y="${SUELO - 6}" width="110" height="6" rx="2" fill="${C.equipoOscuro}"/>` }),
    E.pad({ a: [124, 270], b: [168, 270], w: 18 }),
    E.libre({ svg: `<rect x="72" y="240" width="20" height="10" fill="${C.equipo}"/>` }),
    E.rodillo({ c: [90, 224], r: 9 }),
  ],
});
const ghr = {
  id: 64, nombre: 'Glute ham raise', musculos: ['isquios', 'gluteos'],
  inicio: ghrPose([212, 254], 4),
  fin: ghrPose([162, 196], 88),
  flecha: { punto: 'hombro', curva: 50 },
};

const goodMorning = {
  id: 65, nombre: 'Good mornings', musculos: ['isquios', 'lumbares'],
  inicio: parado({ brazos: { ambos: { angulos: [235, 100], escala: [0.85, 0.9] } }, equipo: [espaldaBarra] }),
  fin: { cadera: [164, 214], torso: 12, frente: 'abajo', cabeza: 16, brazos: { ambos: { angulos: [150, 20], escala: [0.85, 0.9] } }, piernas: piernasSent(196, 8), equipo: [sk => E.barra({ c: [sk.hombro[0] - 4, sk.hombro[1] - 12] })] },
  flecha: { punto: 'hombro', offset: [30, -20], curva: -40 },
};

// ---------- Gluteos ----------
const hipThrustPose = (cadera, torso) => ({
  cadera, torso, frente: 'arriba', cabeza: torso + 30,
  brazos: { ambos: { destino: B.sum(cadera, [0, -10]), doblar: 'arriba' } },
  piernas: { cerca: { destino: [246, PIE], doblar: 'arriba' }, lejos: { destino: [238, PIE], doblar: 'arriba' } },
  equipo: [E.banco({ x1: 40, x2: 112, y: 270 }), sk => E.barra({ c: B.sum(sk.cadera, [0, -26]), r: 24 })],
});
const hipThrust = {
  id: 66, nombre: 'Hip thrust', musculos: ['gluteos', 'isquios'],
  inicio: hipThrustPose([170, 314], 158),
  fin: hipThrustPose([186, 246], 178),
  flecha: { punto: 'cadera', offset: [0, -50] },
};

// Patada de gluteo en cuadrupedia.
const cuadrupedia = pierna => ({
  cadera: [172, 252], torso: 2, frente: 'abajo', cabeza: 8,
  brazos: { ambos: { destino: [258, SUELO - 8], doblar: 'izq' } },
  piernas: { lejos: { destino: [112, PIE], doblar: 'abajo', pie: 180 }, cerca: pierna },
  equipo: [E.colchoneta({ x1: 60, x2: 300 })],
});
const patadaGluteo = {
  id: 67, nombre: 'Patada de glúteo', musculos: ['gluteos', 'isquios'],
  inicio: cuadrupedia({ destino: [130, PIE - 6], doblar: 'abajo', pie: 200 }),
  fin: cuadrupedia({ angulos: [168, 120], pie: 120 }),
  flecha: { punto: 'pie', curva: -40, offset: [-14, 0] },
};

// Abductores / aductores en maquina, de frente.
const maquinaPiernas = (rodilla) => [
  E.libre({ svg: `<rect x="150" y="180" width="100" height="90" rx="12" fill="${C.equipoOscuro}"/><rect x="146" y="262" width="108" height="16" rx="8" fill="${C.equipo}"/><rect x="194" y="278" width="12" height="${SUELO - 278}" fill="${C.equipoOscuro}"/>` }),
  ...rodilla,
];
const sentadoPiernasFrente = (o) => ({
  vista: 'frente', cadera: [200, 258], torso: 90,
  brazos: { ambos: { destino: [258, 266], doblar: 'der' } },
  ...o,
});
const padsRodilla = (afuera) => sk => E.libre({
  capa: 'frente',
  svg: ['izq', 'der'].map(l => {
    const r = sk.piernas[l].medio;
    const s = (l === 'izq' ? -1 : 1) * (afuera ? 1 : -1);
    return `<rect x="${r[0] + s * 16 - 6}" y="${r[1] - 30}" width="12" height="48" rx="6" fill="${C.equipo}" stroke="${C.equipoClaro}" stroke-width="2"/>`;
  }).join(''),
});
const abduccion = {
  id: 68, nombre: 'Abducción en máquina', musculos: ['gluteos'],
  inicio: sentadoPiernasFrente({ piernas: { ambas: { angulos: [292, 270], escala: [0.45, 1] } }, equipo: maquinaPiernas([padsRodilla(true)]) }),
  fin: sentadoPiernasFrente({ piernas: { ambas: { angulos: [330, 290], escala: [0.75, 1] } }, equipo: maquinaPiernas([padsRodilla(true)]) }),
  flecha: [{ punto: 'rodilla', offset: [26, 0], curva: -10 }],
};

const aduccion = {
  id: 70, nombre: 'Aductores en máquina', musculos: ['aductores'],
  inicio: sentadoPiernasFrente({ piernas: { ambas: { angulos: [330, 290], escala: [0.75, 1] } }, equipo: maquinaPiernas([padsRodilla(false)]) }),
  fin: sentadoPiernasFrente({ piernas: { ambas: { angulos: [292, 270], escala: [0.45, 1] } }, equipo: maquinaPiernas([padsRodilla(false)]) }),
  flecha: [{ punto: 'rodilla', offset: [20, -30], curva: 10 }],
};

// Sumo: postura ancha, de frente.
const sumoMuerto = {
  id: 71, nombre: 'Peso muerto sumo', musculos: ['aductores', 'gluteos', 'cuadriceps'],
  inicio: frente({
    cadera: [200, 262], torso: 90, torsoEscala: 0.9,
    brazos: { ambos: { destino: [214, SUELO - 30], doblar: 'der' } },
    piernas: { ambas: { destino: [272, PIE], doblar: 'der', pie: 320 } },
    equipo: [sk => E.barraLarga({ c: [200, SUELO - 30], ancho: 330, alto: 60 })],
  }),
  fin: frente({
    cadera: [200, 222],
    brazos: { ambos: { destino: [214, 252], doblar: 'der' } },
    piernas: { ambas: { destino: [272, PIE], doblar: 'der', pie: 320 } },
    equipo: [sk => E.barraLarga({ c: [200, 252], ancho: 330, alto: 60 })],
  }),
  flecha: { punto: 'cadera', offset: [0, -96] },
};

const sentadillaSumo = {
  id: 72, nombre: 'Sentadilla sumo', musculos: ['aductores', 'gluteos', 'cuadriceps'],
  inicio: frente({
    cadera: [200, 222],
    brazos: { ambos: { destino: [206, 236], doblar: 'der' } },
    piernas: { ambas: { destino: [266, PIE], doblar: 'der', pie: 320 } },
    equipo: [sk => E.libre({ capa: 'frente', svg: `<rect x="186" y="${sk.brazos.der.fin[1] - 4}" width="28" height="34" rx="8" fill="${C.disco}" stroke="${C.discoBorde}" stroke-width="3"/>` })],
  }),
  fin: frente({
    cadera: [200, 272],
    brazos: { ambos: { destino: [206, 288], doblar: 'der' } },
    piernas: { ambas: { destino: [266, PIE], doblar: 'der', pie: 320 } },
    equipo: [sk => E.libre({ capa: 'frente', svg: `<rect x="186" y="${sk.brazos.der.fin[1] - 4}" width="28" height="34" rx="8" fill="${C.disco}" stroke="${C.discoBorde}" stroke-width="3"/>` })],
  }),
  flecha: { punto: 'cadera', offset: [-100, 0] },
};

// ---------- Gemelos ----------
const talonesPie = (arriba, extra = {}) => parado({
  cadera: [198, arriba ? 200 : 218],
  brazos: { ambos: { angulos: [272, 272] } },
  piernas: arriba
    ? { cerca: { destino: [206, PIE - 18], doblar: 'der', pie: 318 }, lejos: { destino: [192, PIE - 18], doblar: 'der', pie: 318 } }
    : B.piernasParado(),
  equipo: mancuernas({ punta: true }),
  ...extra,
});
const talonesDePie = {
  id: 73, nombre: 'Elevaciones de talones de pie', musculos: ['gemelos'],
  inicio: talonesPie(false),
  fin: talonesPie(true),
  flecha: { punto: 'pie', offset: [-30, 0] },
};

const talonesSentado = (arriba) => ({
  cadera: [150, 262], torso: 88, frente: 'der',
  brazos: { ambos: { destino: [206, 236], doblar: 'abajo' } },
  piernas: arriba
    ? { cerca: { destino: [216, PIE - 16], doblar: 'arriba', pie: 312 }, lejos: { destino: [210, PIE - 16], doblar: 'arriba', pie: 312 } }
    : { cerca: { destino: [216, PIE - 6], doblar: 'arriba', pie: 6 }, lejos: { destino: [210, PIE - 6], doblar: 'arriba', pie: 6 } },
  equipo: [
    asiento(100, 172, 276),
    E.libre({ svg: `<rect x="208" y="${SUELO - 12}" width="40" height="12" rx="3" fill="${C.equipo}"/><rect x="262" y="160" width="10" height="${SUELO - 160}" fill="${C.equipoOscuro}"/>` }),
    sk => E.pad({ a: B.sum(sk.piernas.cerca.medio, [-26, -14]), b: B.sum(sk.piernas.cerca.medio, [8, -14]), w: 14, capa: 'frente' }),
    sk => E.palanca({ a: B.sum(sk.piernas.cerca.medio, [8, -14]), b: [267, 210], capa: 'fondo' }),
  ],
});
const gemelosSentado = {
  id: 74, nombre: 'Elevaciones de talones sentado', musculos: ['gemelos'],
  inicio: talonesSentado(false),
  fin: talonesSentado(true),
  flecha: { punto: 'rodilla', offset: [0, -40] },
};

const ESCALON_Y = 300;
const unilateral = (arriba) => ({
  cadera: [198, arriba ? 158 : 176], torso: 90, frente: 'der',
  brazos: { cerca: { angulos: [272, 274] }, lejos: { destino: [258, 150], doblar: 'abajo' } },
  piernas: {
    cerca: arriba ? { destino: [204, ESCALON_Y - 24], doblar: 'der', pie: 320 } : { destino: [204, ESCALON_Y + 2], doblar: 'der', pie: 28 },
    lejos: { destino: [174, ESCALON_Y - (arriba ? 50 : 32)], doblar: 'der', pie: 250 },
  },
  equipo: [
    E.libre({ svg: `<rect x="210" y="${ESCALON_Y - 6}" width="90" height="${SUELO - ESCALON_Y + 6}" rx="6" fill="${C.equipo}"/>` }),
    E.poste({ x: 262, y1: 120, w: 9 }),
    sk => E.mancuernaPunta({ c: sk.brazos.cerca.fin }),
  ],
});
const gemelosUnilateral = {
  id: 75, nombre: 'Elevaciones unilaterales en escalón', musculos: ['gemelos'],
  inicio: unilateral(false),
  fin: unilateral(true),
  flecha: { punto: 'cadera', offset: [-50, 0] },
};

module.exports = [
  sentadilla, sentadillaFrontal, sentadillaHack, prensa, zancadas, stepUps, extensionPiernas, bulgara,
  rumano, convencional, piernasRigidas, curlFemoral, sissy, ghr, goodMorning,
  hipThrust, patadaGluteo, abduccion, zancadasProfundas,
  aduccion, sumoMuerto, sentadillaSumo,
  talonesDePie, gemelosSentado, gemelosUnilateral,
];
