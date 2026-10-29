const B = require('./base');
const { E, C, SUELO, PIE, MANO_SUELO, parado, frente, recto, bancoPlano, hombroDe } = B;

// ---------- Press en banco ----------
const piernasBanco = {
  cerca: { destino: [116, PIE], doblar: 'arriba', pie: 180 },
  lejos: { destino: [128, PIE], doblar: 'arriba', pie: 180 },
};

const pressPlano = {
  id: 1, nombre: 'Press plano', musculos: ['pecho', 'triceps', 'hombro'],
  inicio: {
    cadera: [160, 256], torso: 0, frente: 'arriba',
    brazos: { ambos: { destino: [242, 160], doblar: 'abajo' } },
    piernas: piernasBanco,
    equipo: [bancoPlano(), B.barraEnManos()],
  },
  fin: {
    cadera: [160, 256], torso: 0, frente: 'arriba',
    brazos: { ambos: { angulos: [250, 86], escala: [0.5, 1] } },
    piernas: piernasBanco,
    equipo: [bancoPlano(), B.barraEnManos()],
  },
  flecha: { punto: 'mano', offset: [56, 0] },
};

// Banco inclinado: asiento horizontal + respaldo a 32 grados.
const INC = 32;
const caderaInc = [162, 264];
const hombroInc = hombroDe(caderaInc, INC);
const bancoInclinado = [
  E.libre({
    svg:
      `<rect x="150" y="282" width="10" height="${SUELO - 282}" fill="${C.equipoOscuro}"/>` +
      `<rect x="250" y="236" width="10" height="${SUELO - 236}" fill="${C.equipoOscuro}"/>` +
      `<rect x="130" y="${SUELO - 6}" width="150" height="6" rx="2" fill="${C.equipoOscuro}"/>`,
  }),
  E.pad({ a: [112, 284], b: [172, 284], w: 14 }),
  E.pad({ a: [172, 288], b: [172 + 128 * Math.cos(INC * Math.PI / 180), 288 - 128 * Math.sin(INC * Math.PI / 180)], w: 14 }),
];
const frenteInc = [-Math.sin(INC * Math.PI / 180), -Math.cos(INC * Math.PI / 180)];
const pressInclinado = {
  id: 2, nombre: 'Press inclinado', musculos: ['pecho', 'triceps', 'hombro'],
  inicio: {
    cadera: caderaInc, torso: INC, frente: frenteInc,
    brazos: { ambos: { destino: [hombroInc[0] + 2, hombroInc[1] - 95], doblar: 'abajo' } },
    piernas: { cerca: { destino: [108, PIE], doblar: 'arriba', pie: 180 }, lejos: { destino: [120, PIE], doblar: 'arriba', pie: 180 } },
    equipo: [...bancoInclinado, B.barraEnManos()],
  },
  fin: {
    cadera: caderaInc, torso: INC, frente: frenteInc,
    brazos: { ambos: { angulos: [245, 98], escala: [0.55, 1] } },
    piernas: { cerca: { destino: [108, PIE], doblar: 'arriba', pie: 180 }, lejos: { destino: [120, PIE], doblar: 'arriba', pie: 180 } },
    equipo: [...bancoInclinado, B.barraEnManos()],
  },
  flecha: { punto: 'mano', offset: [58, 0] },
};

// Banco declinado: cabeza mas baja, piernas trabadas en un rodillo.
const DEC = -16;
const caderaDec = [150, 238];
const hombroDec = hombroDe(caderaDec, DEC);
const frenteDec = [Math.sin(-DEC * Math.PI / 180) * -1 * -1, -Math.cos(DEC * Math.PI / 180)];
const bancoDeclinado = [
  E.libre({
    svg:
      `<rect x="150" y="262" width="10" height="${SUELO - 262}" fill="${C.equipoOscuro}"/>` +
      `<rect x="250" y="292" width="10" height="${SUELO - 292}" fill="${C.equipoOscuro}"/>` +
      `<rect x="92" y="242" width="8" height="${SUELO - 242}" fill="${C.equipoOscuro}"/>` +
      `<rect x="80" y="${SUELO - 6}" width="200" height="6" rx="2" fill="${C.equipoOscuro}"/>`,
  }),
  E.pad({ a: [128, 252], b: [292, 299], w: 14 }),
  E.rodillo({ c: [96, 236], capa: 'frente' }),
];
const piernasDec = {
  cerca: { destino: [99, 252], doblar: 'arriba', pie: 180 },
  lejos: { destino: [106, 254], doblar: 'arriba', pie: 180 },
};
const pressDeclinado = {
  id: 3, nombre: 'Press declinado', musculos: ['pecho', 'triceps'],
  inicio: {
    cadera: caderaDec, torso: DEC, frente: [0.28, -0.96],
    brazos: { ambos: { destino: [hombroDec[0] - 6, hombroDec[1] - 94], doblar: 'abajo' } },
    piernas: piernasDec,
    equipo: [...bancoDeclinado, B.barraEnManos()],
  },
  fin: {
    cadera: caderaDec, torso: DEC, frente: [0.28, -0.96],
    brazos: { ambos: { angulos: [255, 82], escala: [0.5, 1] } },
    piernas: piernasDec,
    equipo: [...bancoDeclinado, B.barraEnManos()],
  },
  flecha: { punto: 'mano', offset: [-62, 0] },
};

// ---------- Fondos ----------
const paralelas = [E.paralela({ x: 214, y: 182 }), E.libre({ capa: 'frente', svg: `<circle cx="214" cy="182" r="4" fill="${C.equipoClaro}"/>` })];
const fondosPecho = {
  id: 4, nombre: 'Fondos en paralelas (para pecho)', musculos: ['pecho', 'triceps'],
  inicio: {
    cadera: B.caderaDesde([208, 86], 72), torso: 72, frente: 'der',
    brazos: { ambos: { destino: [214, 180], doblar: 'izq' } },
    piernas: { cerca: { destino: [140, 256], doblar: 'der', pie: 230 }, lejos: { destino: [148, 252], doblar: 'der', pie: 230 } },
    equipo: paralelas,
  },
  fin: {
    cadera: B.caderaDesde([212, 128], 62), torso: 62, frente: 'der',
    brazos: { ambos: { destino: [214, 180], doblar: 'izq' } },
    piernas: { cerca: { destino: [128, 296], doblar: 'der', pie: 230 }, lejos: { destino: [136, 292], doblar: 'der', pie: 230 } },
    equipo: paralelas,
  },
  flecha: { punto: 'hombro', offset: [42, -20] },
};

// ---------- Flexiones ----------
function flexion(hombro, tobillo, mano, doblar = 'arriba') {
  const r = recto(hombro, tobillo);
  return {
    cadera: r.cadera, torso: r.torso, frente: 'abajo', cabeza: r.torso,
    brazos: { ambos: { destino: mano, doblar } },
    piernas: { cerca: { destino: tobillo, doblar: 'abajo', pie: 292 }, lejos: { destino: [tobillo[0] + 5, tobillo[1]], doblar: 'abajo', pie: 292 } },
  };
}
const pushUps = {
  id: 5, nombre: 'Push-ups (flexiones de pecho)', musculos: ['pecho', 'triceps'],
  inicio: flexion([262, 242], [72, 324], [262, MANO_SUELO]),
  // Abajo: los pies no se mueven y el cuerpo sigue recto (mismo largo
  // hombro-tobillo), solo se doblan los codos.
  fin: flexion([276, 298], [72, 324], [262, MANO_SUELO]),
  flecha: { punto: 'hombro', offset: [40, -30] },
};

const cajon = E.libre({ svg: `<rect x="236" y="262" width="96" height="${SUELO - 262}" rx="6" fill="${C.equipo}"/>` });
const pushUpsInclinado = {
  id: 6, nombre: 'Push-ups inclinado (flexiones de pecho)', musculos: ['pecho', 'triceps'],
  inicio: { ...flexion([243, 165], [106, 324], [262, 255]), equipo: [cajon] },
  fin: { ...flexion([276, 212], [106, 324], [262, 255]), equipo: [cajon] },
  flecha: { punto: 'hombro', offset: [-20, -34] },
};

// ---------- Crossover (vista de frente) ----------
function crossover(id, nombre, yPolea, manoIni, manoFin, doblarFin = 'der') {
  const eq = [
    E.poste({ x: 40, y1: 40, w: 14 }),
    E.poste({ x: 360, y1: 40, w: 14 }),
    sk => E.libre({
      svg:
        `<line x1="360" y1="${yPolea}" x2="${sk.brazos.der.fin[0]}" y2="${sk.brazos.der.fin[1]}" stroke="${C.cable}" stroke-width="2.5"/>` +
        `<line x1="40" y1="${yPolea}" x2="${sk.brazos.izq.fin[0]}" y2="${sk.brazos.izq.fin[1]}" stroke="${C.cable}" stroke-width="2.5"/>` +
        `<circle cx="360" cy="${yPolea}" r="9" fill="${C.equipo}" stroke="${C.equipoClaro}" stroke-width="3"/>` +
        `<circle cx="40" cy="${yPolea}" r="9" fill="${C.equipo}" stroke="${C.equipoClaro}" stroke-width="3"/>`,
    }),
  ];
  return {
    id, nombre, musculos: ['pecho', 'hombro'],
    inicio: frente({ brazos: { ambos: { destino: manoIni, doblar: 'abajo' } }, equipo: eq }),
    fin: frente({ brazos: { ambos: { destino: manoFin, doblar: doblarFin } }, equipo: eq }),
    flecha: [{ punto: 'mano', curva: yPolea < 120 ? -26 : yPolea > 250 ? 26 : 16 }, { punto: 'manoIzq', curva: yPolea < 120 ? 26 : yPolea > 250 ? -26 : -16 }],
  };
}

module.exports = [
  pressPlano,
  pressInclinado,
  pressDeclinado,
  fondosPecho,
  pushUps,
  pushUpsInclinado,
  crossover(9, 'Aperturas/Crossover (bajo)', 64, [300, 100], [208, 232]),
  crossover(8, 'Aperturas/Crossover (medio)', 150, [308, 160], [210, 180]),
  crossover(7, 'Aperturas/Crossover (alto)', 316, [296, 252], [212, 140], 'abajo'),
];
