// Plantillas compartidas por las ilustraciones de los ejercicios funcionales.
// Se apoyan en el mismo motor y en base.js; no cambian nada de lo existente.
const B = require('./base');
const { E, L, SUELO, PIE, MANO_SUELO, dir, sum, sub, mul, recto, hombroDe } = B;

const PISO = SUELO - 15; // centro del cuerpo acostado en el piso
const colch = (x1 = 40, x2 = 360) => E.colchoneta({ x1, x2 });

// Ejercicio del catalogo de fuerza, para reusar su dibujo.
const base = require('./ejercicios');
const deFuerza = id => {
  const ej = base.find(e => e.id === id);
  if (!ej) throw new Error(`No existe el ejercicio ${id}`);
  return ej;
};

// Copia una pose y la sube dy px (saltos): mueve la cadera y los destinos de
// manos y pies. Los equipos que dependen del esqueleto se mueven solos.
function elevar(pose, dy) {
  const mover = spec => (spec && spec.destino ? { ...spec, destino: [spec.destino[0], spec.destino[1] - dy] } : spec);
  const grupo = g => {
    if (!g) return g;
    const r = {};
    for (const k of Object.keys(g)) r[k] = mover(g[k]);
    return r;
  };
  return { ...pose, cadera: [pose.cadera[0], pose.cadera[1] - dy], brazos: grupo(pose.brazos), piernas: grupo(pose.piernas) };
}

// Flexion: cuerpo recto entre hombro y tobillo, manos en `mano`.
function flexion(hombro, tobillo, mano, doblar = 'arriba', extra = {}) {
  const r = recto(hombro, tobillo);
  return {
    cadera: r.cadera, torso: r.torso, frente: 'abajo', cabeza: r.torso,
    brazos: { ambos: { destino: mano, doblar } },
    piernas: {
      cerca: { destino: tobillo, doblar: 'abajo', pie: 292 },
      lejos: { destino: [tobillo[0] + 5, tobillo[1]], doblar: 'abajo', pie: 292 },
    },
    equipo: [colch()],
    ...extra,
  };
}
// Plancha alta (arriba de la flexion).
const HOMBRO_ALTA = [262, 242];
const TOBILLO_ALTA = [72, 324];
const planchaAlta = (extra = {}) => flexion(HOMBRO_ALTA, TOBILLO_ALTA, [262, MANO_SUELO], 'arriba', extra);

// Cuadrupedia: manos y rodillas en el piso. La cadera queda a la altura del
// muslo y los hombros a la del brazo, asi brazos y muslos quedan verticales.
const MANO_CUADRUPEDIA = [254, SUELO - 8];
const cuadrupedia = (o = {}) => ({
  cadera: o.cadera || [172, 266], torso: o.torso ?? 16, frente: 'abajo', cabeza: o.cabeza ?? 14,
  curvaTorso: o.curvaTorso,
  brazos: o.brazos || { ambos: { destino: MANO_CUADRUPEDIA, doblar: 'izq' } },
  piernas: o.piernas || { ambas: { destino: [112, PIE], doblar: 'abajo', pie: 180 } },
  equipo: o.equipo || [colch(60, 320)],
});

// Boca arriba, cabeza a la derecha.
const bocaArriba = (o = {}) => ({
  cadera: o.cadera || [176, PISO], torso: o.torso ?? 0, frente: 'arriba', cabeza: o.cabeza ?? o.torso ?? 0,
  brazos: o.brazos || { ambos: { angulos: [180, 180] } },
  piernas: o.piernas,
  equipo: o.equipo || [colch()],
});

// Manos detras de la nuca (igual que en ej_core).
const cabezaDe = (cadera, torso, cabeza = torso) => sum(hombroDe(cadera, torso), mul(dir(cabeza), L.cuello + L.cabeza));
const manosNuca = (cadera, torso, cabeza = torso) => {
  const c = cabezaDe(cadera, torso, cabeza);
  return { ambos: { destino: sum(c, mul(dir(cabeza + 160), 12)), doblar: dir(cabeza + 90), escala: [0.62, 0.7] } };
};

// Brazos colgando, en las poses de costado.
const brazosAbajo = { ambos: { angulos: [272, 272] } };
// Brazos al frente, a la altura del hombro.
const brazosAlFrente = { ambos: { angulos: [2, 2] } };
// Brazos arriba.
const brazosArriba = { ambos: { angulos: [88, 90] } };

// Sentadilla abajo, sin peso (de la sentadilla del catalogo).
const piernasSent = (x, sep = 8) => ({ cerca: { destino: [x + sep / 2, PIE], doblar: 'der' }, lejos: { destino: [x - sep / 2, PIE], doblar: 'der' } });
const sentadillaAbajo = (o = {}) => ({
  cadera: [146, 268], torso: 52, frente: 'der',
  brazos: brazosAlFrente,
  piernas: piernasSent(202),
  ...o,
});

// Pierna recta vista de frente, de la cadera (P = centro de la cadera) al
// tobillo: con las rodillas semiflexionadas hacia adelante, de frente la pierna
// se ve recta y mas corta. Sin esto la cinematica dobla la rodilla hacia un
// costado, que es imposible.
function piernaRecta(P, lado, tobillo, pie) {
  const cadera = [P[0] + (lado === 'der' ? 12 : -12), P[1]];
  const v = [tobillo[0] - cadera[0], tobillo[1] - cadera[1]];
  const largo = Math.hypot(v[0], v[1]);
  const a = (Math.atan2(-v[1], v[0]) * 180) / Math.PI;
  const k = Math.min(1, largo / (L.muslo + L.pierna));
  return { angulos: [a, a], escala: [k, k], pie: pie ?? (lado === 'der' ? 290 : 250) };
}

// Inset chiquito arriba a la derecha con la posicion de las manos vista desde
// arriba (flexiones diamante y abiertas, donde de costado no se distingue).
const manosDesdeArriba = (separacion, rombo = false) => E.libre({
  capa: 'frente',
  svg:
    `<rect x="296" y="18" width="88" height="54" rx="10" fill="#0B111D" fill-opacity="0.6" stroke="rgba(204,214,235,0.25)" stroke-width="2"/>` +
    (rombo
      ? `<path d="M340 30 L356 46 L340 62 L324 46 Z" fill="none" stroke="#46ED34" stroke-width="3" stroke-linejoin="round"/>`
      : '') +
    `<circle cx="${340 - separacion}" cy="46" r="6" fill="#D5DEF0"/><circle cx="${340 + separacion}" cy="46" r="6" fill="#D5DEF0"/>`,
});

module.exports = {
  ...B, PISO, colch, deFuerza, elevar, flexion, planchaAlta, HOMBRO_ALTA, TOBILLO_ALTA,
  cuadrupedia, MANO_CUADRUPEDIA, bocaArriba, cabezaDe, manosNuca, brazosAbajo, brazosAlFrente, brazosArriba,
  piernasSent, sentadillaAbajo, manosDesdeArriba, piernaRecta,
};
