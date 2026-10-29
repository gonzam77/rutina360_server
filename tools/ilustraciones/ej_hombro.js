const B = require('./base');
const { E, C, SUELO, PIE, parado, frente } = B;

// Mancuernas en ambas manos, vista de frente (se ven de punta).
const mancuernasFrente = (capa = 'frente') => sk =>
  E.libre({
    capa,
    svg: ['izq', 'der'].map(l => E.mancuernaPunta({ c: sk.brazos[l].fin }).svg).join(''),
  });

// ---------- Trapecio ----------
const encogimientos = {
  id: 23, nombre: 'Encogimientos de hombros', musculos: ['trapecio'],
  inicio: frente({ brazos: { ambos: { destino: [234, 226], doblar: 'der' } }, equipo: [mancuernasFrente()] }),
  fin: frente({ encoger: 18, brazos: { ambos: { destino: [234, 208], doblar: 'der' } }, equipo: [mancuernasFrente()] }),
  flecha: [{ punto: 'hombro', offset: [44, 4] }, { desde: [134, 136], hasta: [134, 118] }],
};

// Remo al menton con polea baja (barra corta) — trapecio.
const poleaBajaCentro = (yManos) => [
  E.libre({ svg: `<rect x="190" y="${SUELO - 16}" width="20" height="16" rx="4" fill="${C.equipoOscuro}"/><circle cx="200" cy="${SUELO - 18}" r="8" fill="${C.equipo}" stroke="${C.equipoClaro}" stroke-width="3"/>` }),
  E.libre({ capa: 'medio', svg: `<line x1="200" y1="${SUELO - 18}" x2="200" y2="${yManos}" stroke="${C.cable}" stroke-width="2.5"/>` }),
  sk => E.libre({ capa: 'frente', svg: `<line x1="${sk.brazos.izq.fin[0] - 10}" y1="${yManos}" x2="${sk.brazos.der.fin[0] + 10}" y2="${yManos}" stroke="${C.discoBorde}" stroke-width="6" stroke-linecap="round"/>` }),
];
const remoMenton = {
  id: 88, nombre: 'Remo al mentón', musculos: ['trapecio', 'hombro'],
  inicio: frente({ brazos: { ambos: { destino: [214, 226], doblar: 'der' } }, equipo: poleaBajaCentro(226) }),
  fin: frente({ brazos: { ambos: { angulos: [15, 214], escala: [0.8, 1] } }, equipo: poleaBajaCentro(148) }),
  flecha: { punto: 'codo', offset: [26, 0], curva: -20 },
};
const remoMentonBarra = {
  id: 29, nombre: 'Remo al mentón con barra', musculos: ['hombro', 'trapecio'],
  inicio: frente({ brazos: { ambos: { destino: [216, 226], doblar: 'der' } }, equipo: [sk => E.barraLarga({ c: [200, sk.brazos.der.fin[1]] })] }),
  fin: frente({ brazos: { ambos: { angulos: [15, 214], escala: [0.8, 1] } }, equipo: [sk => E.barraLarga({ c: [200, sk.brazos.der.fin[1]] })] }),
  flecha: { punto: 'codo', offset: [26, 0], curva: -20 },
};

// Face pull de espaldas con polea alta: trapecio.
const poleaAltaCentro = [
  E.libre({ svg: `<rect x="193" y="40" width="14" height="${SUELO - 40}" rx="4" fill="${C.equipoOscuro}"/><circle cx="200" cy="64" r="9" fill="${C.equipo}" stroke="${C.equipoClaro}" stroke-width="3"/>` }),
  sk => E.libre({
    capa: 'fondo',
    svg: `<line x1="200" y1="64" x2="${sk.brazos.izq.fin[0]}" y2="${sk.brazos.izq.fin[1]}" stroke="${C.cable}" stroke-width="3"/><line x1="200" y1="64" x2="${sk.brazos.der.fin[0]}" y2="${sk.brazos.der.fin[1]}" stroke="${C.cable}" stroke-width="3"/>`,
  }),
];
const facePullEspalda = {
  id: 89, nombre: 'Face Pull', musculos: ['trapecio', 'hombro'],
  inicio: frente({ espalda: true, brazos: { ambos: { destino: [226, 46], doblar: 'der' } }, equipo: poleaAltaCentro }),
  fin: frente({ espalda: true, brazos: { ambos: { destino: [236, 100], doblar: 'abajo' } }, equipo: poleaAltaCentro }),
  flecha: [{ punto: 'mano', offset: [24, 0], curva: -14 }, { punto: 'manoIzq', offset: [-24, 0], curva: 14 }],
};

// Pajaros: de costado, torso casi horizontal y rodillas apenas flexionadas.
// Los brazos suben hacia los costados, o sea hacia el que mira: de perfil se
// ven acortados (escorzo) a la altura de los hombros.
const brazosColgando = { ambos: { angulos: [272, 272] } };
const brazosAbiertos = { cerca: { angulos: [292, 292], escala: [0.24, 0.24] }, lejos: { angulos: [286, 286], escala: [0.2, 0.2] } };
const pajarosParado = (brazos) => ({
  cadera: [170, 228], torso: 14, frente: 'abajo', cabeza: 4,
  brazos,
  piernas: { cerca: { destino: [200, PIE], doblar: 'der' }, lejos: { destino: [190, PIE], doblar: 'der' } },
  equipo: B.mancuernas({ punta: true }),
});
const pajarosMancuerna = {
  id: 27, nombre: 'Pájaros con mancuerna', musculos: ['hombro', 'trapecio'],
  inicio: pajarosParado(brazosColgando),
  fin: pajarosParado(brazosAbiertos),
  flecha: { punto: 'mano', offset: [40, 0], curva: -20 },
};

// Variante sentado en la punta del banco, pecho sobre los muslos.
const pajarosSentado = (brazos) => ({
  cadera: [196, 276], torso: 28, frente: 'abajo', cabeza: 16,
  brazos,
  piernas: { cerca: { destino: [262, PIE], doblar: 'arriba' }, lejos: { destino: [254, PIE], doblar: 'arriba' } },
  equipo: [B.asiento(130, 214, 290), ...B.mancuernas({ punta: true })],
});
const pajarosEspalda = {
  id: 90, nombre: 'Pájaros', musculos: ['trapecio', 'hombro'],
  inicio: pajarosSentado(brazosColgando),
  fin: pajarosSentado(brazosAbiertos),
  flecha: { punto: 'mano', offset: [42, 0], curva: -20 },
};

// ---------- Hombros ----------
const pressMilitar = {
  id: 24, nombre: 'Press militar', musculos: ['hombro', 'triceps'],
  inicio: parado({ brazos: { ambos: { angulos: [296, 96] } }, equipo: [B.barraEnManos()] }),
  fin: parado({ brazos: { ambos: { destino: [206, 42], doblar: 'der' } }, equipo: [B.barraEnManos()] }),
  flecha: { punto: 'mano', offset: [48, 0] },
};

const elevLaterales = {
  id: 25, nombre: 'Elevaciones laterales', musculos: ['hombro'],
  inicio: frente({ brazos: { ambos: { destino: [236, 226], doblar: 'der' } }, equipo: [mancuernasFrente()] }),
  fin: frente({ brazos: { ambos: { destino: [314, 142], doblar: 'abajo' } }, equipo: [mancuernasFrente()] }),
  flecha: [{ punto: 'mano', curva: 34 }, { punto: 'manoIzq', curva: -34 }],
};

const elevFrontales = {
  id: 26, nombre: 'Elevaciones frontales', musculos: ['hombro'],
  inicio: parado({ brazos: { cerca: { angulos: [276, 278] }, lejos: { angulos: [272, 274] } }, equipo: B.mancuernas({ punta: true }) }),
  fin: parado({ brazos: { cerca: { angulos: [2, 0] }, lejos: { angulos: [272, 274] } }, equipo: B.mancuernas({ punta: true }) }),
  flecha: { punto: 'mano', curva: 42 },
};

const POLEA_CARA = [340, 116];
const facePull = {
  id: 28, nombre: 'Face pulls en polea', musculos: ['hombro', 'trapecio'],
  inicio: parado({
    torso: 86,
    brazos: { ambos: { destino: [288, 122], doblar: 'abajo' } },
    equipo: [E.polea({ x: POLEA_CARA[0], y: POLEA_CARA[1] }), sk => E.cableA({ desde: POLEA_CARA, hacia: sk.brazos.cerca.fin, capa: 'fondo' }), sk => E.asa({ c: sk.brazos.cerca.fin, angulo: 90, ancho: 18 })],
  }),
  fin: parado({
    torso: 92,
    brazos: { ambos: { angulos: [178, 34], escala: [0.5, 0.9] } },
    equipo: [E.polea({ x: POLEA_CARA[0], y: POLEA_CARA[1] }), sk => E.cableA({ desde: POLEA_CARA, hacia: sk.brazos.cerca.fin, capa: 'fondo' }), sk => E.asa({ c: sk.brazos.cerca.fin, angulo: 90, ancho: 18 })],
  }),
  flecha: { punto: 'mano', offset: [0, -30] },
};

module.exports = [encogimientos, remoMenton, facePullEspalda, pajarosEspalda, pressMilitar, elevLaterales, elevFrontales, pajarosMancuerna, facePull, remoMentonBarra];
