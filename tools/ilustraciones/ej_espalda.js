const B = require('./base');
const { E, C, SUELO, PIE, parado, frente, bancoPlano, hombroDe, caderaDesde, asiento, mancuernas } = B;

// ---------- Jalones ----------
// Maquina de jalon vista de frente: asiento, rodilleras y polea arriba al centro.
const maquinaJalonFrente = (yBarra, espalda = false) => [
  E.poste({ x: 200, y1: 30, w: 10 }),
  E.libre({ svg: `<rect x="120" y="26" width="160" height="10" rx="4" fill="${C.equipoOscuro}"/>` }),
  E.libre({ svg: `<rect x="160" y="262" width="80" height="14" rx="7" fill="${C.equipo}"/>`, capa: espalda ? 'frente' : 'fondo' }),
  sk => E.libre({
    capa: 'frente',
    svg:
      `<line x1="200" y1="36" x2="200" y2="${yBarra}" stroke="${C.cable}" stroke-width="2.5"/>` +
      `<line x1="${sk.brazos.izq.fin[0] - 28}" y1="${yBarra}" x2="${sk.brazos.der.fin[0] + 28}" y2="${yBarra}" stroke="${C.discoBorde}" stroke-width="6" stroke-linecap="round"/>`,
  }),
];

const sentadoFrente = (o = {}) => ({
  vista: 'frente',
  cadera: [200, 258],
  torso: 90,
  piernas: { ambas: { angulos: [290, 268], escala: [0.3, 1] } },
  ...o,
});

const jalonAncho = {
  id: 10, nombre: 'Jalón al pecho (agarre ancho)', musculos: ['espalda', 'biceps'],
  inicio: sentadoFrente({ brazos: { ambos: { destino: [278, 92], doblar: 'abajo' } }, equipo: [...maquinaJalonFrente(92), E.libre({ capa: 'frente', svg: `<rect x="164" y="262" width="72" height="12" rx="6" fill="${C.equipoClaro}"/>` })] }),
  fin: sentadoFrente({ brazos: { ambos: { destino: [266, 168], doblar: 'abajo' } }, equipo: [...maquinaJalonFrente(168), E.libre({ capa: 'frente', svg: `<rect x="164" y="262" width="72" height="12" rx="6" fill="${C.equipoClaro}"/>` })] }),
  flecha: [{ punto: 'mano', offset: [34, 0] }, { punto: 'manoIzq', offset: [-34, 0] }],
};

const jalonTrasNuca = {
  id: 13, nombre: 'Jalón tras nuca', musculos: ['espalda', 'trapecio'],
  inicio: sentadoFrente({ espalda: true, brazos: { ambos: { destino: [278, 92], doblar: 'abajo' } }, equipo: maquinaJalonFrente(92, true) }),
  fin: sentadoFrente({ espalda: true, brazos: { ambos: { destino: [262, 152], doblar: 'abajo' } }, equipo: maquinaJalonFrente(152, true) }),
  flecha: [{ punto: 'mano', offset: [34, 0] }, { punto: 'manoIzq', offset: [-34, 0] }],
};

// Maquina de jalon de costado.
const POLEA_JALON = [236, 44];
const maquinaJalonCostado = [
  E.libre({ svg: `<rect x="230" y="34" width="110" height="10" rx="4" fill="${C.equipoOscuro}"/><rect x="330" y="34" width="10" height="${SUELO - 34}" fill="${C.equipoOscuro}"/>` }),
  asiento(132, 206, 282),
  E.poste({ x: 252, y1: 240, w: 8 }),
  E.rodillo({ c: [244, 240], capa: 'frente' }),
  E.polea({ x: POLEA_JALON[0], y: POLEA_JALON[1], columna: false }),
];
const piernasSentado = {
  cerca: { destino: [252, PIE], doblar: 'arriba' },
  lejos: { destino: [244, PIE], doblar: 'arriba' },
};
const jalonCostado = (manoIni, manoFin, torsoFin, asa, doblarFin) => ({
  inicio: {
    cadera: [170, 266], torso: 92, frente: 'der',
    brazos: { ambos: { destino: manoIni, doblar: 'der' } },
    piernas: piernasSentado,
    equipo: [...maquinaJalonCostado, sk => E.cableA({ desde: POLEA_JALON, hacia: sk.brazos.cerca.fin, capa: 'fondo' }), sk => asa(sk)],
  },
  fin: {
    cadera: [170, 266], torso: torsoFin, frente: 'der',
    brazos: { ambos: { destino: manoFin, doblar: doblarFin } },
    piernas: piernasSentado,
    equipo: [...maquinaJalonCostado, sk => E.cableA({ desde: POLEA_JALON, hacia: sk.brazos.cerca.fin, capa: 'fondo' }), sk => asa(sk)],
  },
  flecha: { punto: 'mano', offset: [30, 0] },
});

// Agarre en V (triangulo) para el jalon estrecho.
const triangulo = sk => {
  const [x, y] = sk.brazos.cerca.fin;
  return E.libre({ capa: 'frente', svg: `<path d="M${x - 9} ${y + 4} L${x + 9} ${y + 4} L${x} ${y - 12} Z" fill="none" stroke="${C.discoBorde}" stroke-width="4" stroke-linejoin="round"/>` });
};
const barraPunta = sk => E.libre({ capa: 'frente', svg: `<circle cx="${sk.brazos.cerca.fin[0]}" cy="${sk.brazos.cerca.fin[1]}" r="5" fill="${C.discoBorde}"/>` });

const jalonEstrecho = {
  id: 11, nombre: 'Jalón al pecho (agarre estrecho)', musculos: ['espalda', 'biceps'],
  ...jalonCostado([224, 96], [206, 194], 104, triangulo, 'abajo'),
};
const jalonSupino = {
  id: 12, nombre: 'Jalón al pecho (supino)', musculos: ['espalda', 'biceps'],
  ...jalonCostado([222, 94], [214, 176], 96, barraPunta, 'abajo'),
};

// ---------- Remos ----------
const remoBarra = {
  id: 14, nombre: 'Remo con barra', musculos: ['espalda', 'biceps'],
  inicio: {
    cadera: [156, 214], torso: 24, frente: [0.4, 0.9],
    cabeza: 30,
    brazos: { ambos: { destino: [230, 276], doblar: 'izq' } },
    piernas: piernasParado(),
    equipo: [B.barraEnManos()],
  },
  fin: {
    cadera: [156, 214], torso: 26, frente: [0.4, 0.9],
    cabeza: 32,
    brazos: { ambos: { destino: [200, 226], doblar: 'arriba' } },
    piernas: piernasParado(),
    equipo: [B.barraEnManos()],
  },
  flecha: { punto: 'mano', offset: [-46, 0] },
};
function piernasParado() {
  return { cerca: { destino: [200, PIE], doblar: 'der' }, lejos: { destino: [188, PIE], doblar: 'der' } };
}

// Remo a una mano: rodilla y mano lejanas sobre el banco.
const bancoBajo = E.banco({ x1: 130, x2: 300, y: 282 });
const poseRemo1 = mano => ({
  cadera: [168, 214], torso: 20, frente: 'abajo', cabeza: 24,
  brazos: { lejos: { destino: [254, 280], doblar: 'izq' }, cerca: mano },
  piernas: {
    lejos: { destino: [124, 276], doblar: 'abajo', pie: 180 },
    cerca: { destino: [158, PIE], doblar: 'der' },
  },
  equipo: [bancoBajo, sk => E.mancuerna({ c: sk.brazos.cerca.fin, angulo: 0 })],
});
const remoMancuerna = {
  id: 15, nombre: 'Remo con mancuerna a una mano', musculos: ['espalda', 'biceps'],
  inicio: poseRemo1({ destino: [238, 290], doblar: 'izq' }),
  fin: poseRemo1({ destino: [194, 226], doblar: 'arriba' }),
  flecha: { punto: 'mano', offset: [0, -10], curva: -10 },
};

const remoPolea = {
  id: 16, nombre: 'Remo en polea baja', musculos: ['espalda', 'biceps'],
  inicio: {
    cadera: [160, 286], torso: 66, frente: 'der',
    brazos: { ambos: { destino: [284, 262], doblar: 'abajo' } },
    piernas: { cerca: { destino: [282, 312], doblar: 'arriba', pie: 80 }, lejos: { destino: [276, 314], doblar: 'arriba', pie: 80 } },
    equipo: [
      E.banco({ x1: 100, x2: 210, y: 298 }),
      E.polea({ x: 344, y: 300 }),
      E.libre({ svg: `<rect x="294" y="282" width="10" height="${SUELO - 282}" rx="3" fill="${C.equipo}"/>` }),
      sk => E.cableA({ desde: [344, 300], hacia: sk.brazos.cerca.fin, capa: 'fondo' }),
      sk => E.asa({ c: sk.brazos.cerca.fin, angulo: 90 }),
    ],
  },
  fin: {
    cadera: [160, 286], torso: 96, frente: 'der',
    brazos: { ambos: { destino: [196, 238], doblar: 'izq' } },
    piernas: { cerca: { destino: [282, 312], doblar: 'arriba', pie: 80 }, lejos: { destino: [276, 314], doblar: 'arriba', pie: 80 } },
    equipo: [
      E.banco({ x1: 100, x2: 210, y: 298 }),
      E.polea({ x: 344, y: 300 }),
      E.libre({ svg: `<rect x="294" y="282" width="10" height="${SUELO - 282}" rx="3" fill="${C.equipo}"/>` }),
      sk => E.cableA({ desde: [344, 300], hacia: sk.brazos.cerca.fin, capa: 'fondo' }),
      sk => E.asa({ c: sk.brazos.cerca.fin, angulo: 90 }),
    ],
  },
  flecha: { punto: 'mano', offset: [0, -40] },
};

// Remo T: barra anclada al piso detras, discos adelante.
const PIVOTE = [62, SUELO - 4];
const barraT = sk => {
  const m = sk.brazos.cerca.fin;
  const d = B.unit(B.sub(m, PIVOTE));
  const punta = B.sum(m, B.mul(d, 22));
  return E.libre({
    capa: 'frente',
    svg:
      `<line x1="${PIVOTE[0]}" y1="${PIVOTE[1]}" x2="${punta[0]}" y2="${punta[1]}" stroke="${C.discoBorde}" stroke-width="6" stroke-linecap="round"/>` +
      `<circle cx="${punta[0]}" cy="${punta[1]}" r="22" fill="${C.disco}" fill-opacity="0.75" stroke="${C.discoBorde}" stroke-width="3"/>`,
  });
};
const remoT = {
  id: 17, nombre: 'Remo con T-bar', musculos: ['espalda', 'biceps'],
  inicio: {
    cadera: [150, 218], torso: 32, frente: [0.5, 0.86], cabeza: 38,
    brazos: { ambos: { destino: [222, 286], doblar: 'izq' } },
    piernas: { cerca: { destino: [196, PIE], doblar: 'der' }, lejos: { destino: [184, PIE], doblar: 'der' } },
    equipo: [E.libre({ svg: `<circle cx="${PIVOTE[0]}" cy="${PIVOTE[1]}" r="6" fill="${C.equipoOscuro}"/>` }), barraT],
  },
  fin: {
    cadera: [150, 218], torso: 34, frente: [0.5, 0.86], cabeza: 40,
    brazos: { ambos: { destino: [204, 236], doblar: 'arriba' } },
    piernas: { cerca: { destino: [196, PIE], doblar: 'der' }, lejos: { destino: [184, PIE], doblar: 'der' } },
    equipo: [E.libre({ svg: `<circle cx="${PIVOTE[0]}" cy="${PIVOTE[1]}" r="6" fill="${C.equipoOscuro}"/>` }), barraT],
  },
  flecha: { punto: 'mano', offset: [-44, -10] },
};

// ---------- Pull-over ----------
const piernasBanco = {
  cerca: { destino: [116, PIE], doblar: 'arriba', pie: 180 },
  lejos: { destino: [128, PIE], doblar: 'arriba', pie: 180 },
};
const pulloverMancuerna = {
  id: 18, nombre: 'Pull-over con mancuerna', musculos: ['espalda', 'pecho'],
  inicio: {
    cadera: [150, 256], torso: 0, frente: 'arriba',
    brazos: { ambos: { destino: [318, 268], doblar: 'arriba' } },
    piernas: piernasBanco,
    equipo: [bancoPlano(110, 280), sk => E.mancuerna({ c: sk.brazos.cerca.fin, angulo: 70 })],
  },
  fin: {
    cadera: [150, 256], torso: 0, frente: 'arriba',
    brazos: { ambos: { destino: [240, 164], doblar: 'der' } },
    piernas: piernasBanco,
    equipo: [bancoPlano(110, 280), sk => E.mancuerna({ c: sk.brazos.cerca.fin, angulo: 90 })],
  },
  flecha: { punto: 'mano', curva: -40 },
};

const POLEA_ALTA = [338, 70];
const pulloverPolea = {
  id: 19, nombre: 'Pull-over en polea', musculos: ['espalda'],
  inicio: {
    cadera: [168, 218], torso: 66, frente: 'der', cabeza: 60,
    brazos: { ambos: { angulos: [36, 34] } },
    piernas: { cerca: { destino: [190, PIE], doblar: 'der' }, lejos: { destino: [178, PIE], doblar: 'der' } },
    equipo: [E.polea({ x: POLEA_ALTA[0], y: POLEA_ALTA[1] }), sk => E.cableA({ desde: POLEA_ALTA, hacia: sk.brazos.cerca.fin, capa: 'fondo' }), sk => E.asa({ c: sk.brazos.cerca.fin, angulo: 90 })],
  },
  fin: {
    cadera: [168, 218], torso: 66, frente: 'der', cabeza: 60,
    brazos: { ambos: { angulos: [284, 284] } },
    piernas: { cerca: { destino: [190, PIE], doblar: 'der' }, lejos: { destino: [178, PIE], doblar: 'der' } },
    equipo: [E.polea({ x: POLEA_ALTA[0], y: POLEA_ALTA[1] }), sk => E.cableA({ desde: POLEA_ALTA, hacia: sk.brazos.cerca.fin, capa: 'fondo' }), sk => E.asa({ c: sk.brazos.cerca.fin, angulo: 90 })],
  },
  flecha: { punto: 'mano', offset: [30, 0], curva: -40 },
};

// ---------- Dominadas ----------
const BARRA_Y = 40;
const dominadaCostado = (id, nombre, xBarra, doblarFin, extra = []) => ({
  id, nombre, musculos: ['espalda', 'biceps'],
  inicio: {
    cadera: [xBarra - 8, 222], torso: 93, frente: 'der',
    brazos: { ambos: { destino: [xBarra, BARRA_Y + 4], doblar: 'der' } },
    piernas: { cerca: { destino: [xBarra - 36, 322], doblar: 'der', pie: 250 }, lejos: { destino: [xBarra - 28, 318], doblar: 'der', pie: 250 } },
    equipo: [E.barraFija({ x: xBarra, y: BARRA_Y }), ...extra],
  },
  fin: {
    cadera: [xBarra - 18, 166], torso: 98, frente: 'der',
    brazos: { ambos: { destino: [xBarra, BARRA_Y + 4], doblar: doblarFin } },
    piernas: { cerca: { destino: [xBarra - 44, 264], doblar: 'der', pie: 250 }, lejos: { destino: [xBarra - 36, 260], doblar: 'der', pie: 250 } },
    equipo: [E.barraFija({ x: xBarra, y: BARRA_Y }), ...extra],
  },
  flecha: { punto: 'cadera', offset: [-56, 0] },
});

// Agarre neutro: dos manijas paralelas colgando de la barra.
const manijas = sk => E.libre({ capa: 'frente', svg: `<line x1="${sk.brazos.cerca.fin[0]}" y1="${BARRA_Y + 2}" x2="${sk.brazos.cerca.fin[0]}" y2="${sk.brazos.cerca.fin[1] + 10}" stroke="${C.discoBorde}" stroke-width="5" stroke-linecap="round"/>` });

const dominadasPronas = {
  id: 21, nombre: 'Dominadas (pronas)', musculos: ['espalda'],
  inicio: {
    vista: 'frente', espalda: true, cadera: [200, 210], torso: 90,
    brazos: { ambos: { destino: [272, BARRA_Y + 4], doblar: 'abajo' } },
    piernas: { ambas: { destino: [210, 330], doblar: 'der', pie: 280 } },
    equipo: [E.libre({ svg: `<rect x="60" y="${BARRA_Y - 2}" width="10" height="${SUELO - BARRA_Y + 2}" fill="${C.equipoOscuro}"/><rect x="330" y="${BARRA_Y - 2}" width="10" height="${SUELO - BARRA_Y + 2}" fill="${C.equipoOscuro}"/><line x1="60" y1="${BARRA_Y + 2}" x2="340" y2="${BARRA_Y + 2}" stroke="${C.equipo}" stroke-width="7" stroke-linecap="round"/>` })],
  },
  fin: {
    vista: 'frente', espalda: true, cadera: [200, 162], torso: 90,
    brazos: { ambos: { destino: [272, BARRA_Y + 4], doblar: 'abajo' } },
    piernas: { ambas: { destino: [210, 282], doblar: 'der', pie: 280 } },
    equipo: [E.libre({ svg: `<rect x="60" y="${BARRA_Y - 2}" width="10" height="${SUELO - BARRA_Y + 2}" fill="${C.equipoOscuro}"/><rect x="330" y="${BARRA_Y - 2}" width="10" height="${SUELO - BARRA_Y + 2}" fill="${C.equipoOscuro}"/><line x1="60" y1="${BARRA_Y + 2}" x2="340" y2="${BARRA_Y + 2}" stroke="${C.equipo}" stroke-width="7" stroke-linecap="round"/>` })],
  },
  flecha: { punto: 'cadera', offset: [-70, 0] },
};

// Agarre neutro, vista de frente: manos juntas en dos manijas paralelas.
const barraNeutra = E.libre({
  svg:
    `<rect x="60" y="${BARRA_Y - 2}" width="10" height="${SUELO - BARRA_Y + 2}" fill="${C.equipoOscuro}"/>` +
    `<rect x="330" y="${BARRA_Y - 2}" width="10" height="${SUELO - BARRA_Y + 2}" fill="${C.equipoOscuro}"/>` +
    `<line x1="60" y1="${BARRA_Y + 2}" x2="340" y2="${BARRA_Y + 2}" stroke="${C.equipo}" stroke-width="7" stroke-linecap="round"/>` +
    `<path d="M178 ${BARRA_Y + 2} L184 ${BARRA_Y + 26} L216 ${BARRA_Y + 26} L222 ${BARRA_Y + 2}" fill="none" stroke="${C.equipoClaro}" stroke-width="4" stroke-linejoin="round"/>`,
});
const manijasNeutras = E.libre({
  capa: 'frente',
  svg: [186, 214].map(x => `<line x1="${x}" y1="${BARRA_Y + 18}" x2="${x}" y2="${BARRA_Y + 40}" stroke="${C.discoBorde}" stroke-width="5" stroke-linecap="round"/>`).join(''),
});
const dominadasNeutras = {
  id: 22, nombre: 'Dominadas (neutras)', musculos: ['espalda', 'biceps'],
  inicio: {
    vista: 'frente', cadera: [200, 244], torso: 90,
    brazos: { ambos: { destino: [214, BARRA_Y + 30], doblar: 'der' } },
    piernas: { ambas: { angulos: [272, 268], escala: [0.72, 0.72], pie: 280 } },
    equipo: [barraNeutra, manijasNeutras],
  },
  fin: {
    vista: 'frente', cadera: [200, 172], torso: 90,
    brazos: { ambos: { angulos: [250, 90], escala: [0.45, 0.85] } },
    piernas: { ambas: { angulos: [272, 268], escala: [0.72, 0.72], pie: 280 } },
    equipo: [barraNeutra, manijasNeutras],
  },
  flecha: { punto: 'cadera', offset: [-70, 0] },
};

module.exports = [
  jalonAncho,
  jalonEstrecho,
  jalonSupino,
  jalonTrasNuca,
  remoBarra,
  remoMancuerna,
  remoPolea,
  remoT,
  pulloverMancuerna,
  pulloverPolea,
  dominadaCostado(20, 'Dominadas (supinas)', 214, 'der'),
  dominadasPronas,
  dominadasNeutras,
];
