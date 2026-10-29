// Plantillas y utilidades compartidas por las definiciones de ejercicios.
const { E, C, L, SUELO, dir, sum, sub, mul, unit } = require('./engine');

const PIE = SUELO - 6; // altura del tobillo apoyado en el suelo
const MANO_SUELO = SUELO - 8; // centro de la mano apoyada en el suelo

const grados = v => (Math.atan2(-v[1], v[0]) * 180) / Math.PI;

// Piernas paradas, vista de costado.
const piernasParado = (dx = 0, sep = 14) => ({
  cerca: { destino: [198 + dx + sep / 2, PIE], doblar: 'der' },
  lejos: { destino: [198 + dx - sep / 2, PIE], doblar: 'der' },
});

// Figura parada de costado mirando a la derecha.
const parado = (o = {}) => ({ cadera: [198, 218], torso: 90, frente: 'der', piernas: piernasParado(), ...o });

// Figura parada de frente.
const frente = (o = {}) => ({
  vista: 'frente',
  cadera: [200, 216],
  torso: 90,
  piernas: { ambas: { destino: [214, PIE], doblar: 'der' } },
  ...o,
});

// Cuerpo recto entre hombro y tobillo (planchas, flexiones): devuelve cadera y
// angulo del torso para que hombro-cadera-tobillo queden alineados.
function recto(hombro, tobillo) {
  const u = unit(sub(hombro, tobillo));
  return { cadera: sub(hombro, mul(u, L.torso)), torso: grados(u) };
}

// Cadera a partir de donde se quiere el hombro y el angulo del torso.
const caderaDesde = (hombro, torso) => sub(hombro, mul(dir(torso), L.torso));
const hombroDe = (cadera, torso) => sum(cadera, mul(dir(torso), L.torso));

// Banco plano generico.
const bancoPlano = (x1 = 110, x2 = 300, y = 268) => E.banco({ x1, x2, y });

// Asiento de maquina con poste central.
const asiento = (x1, x2, y, capa = 'fondo') =>
  E.libre({
    capa,
    svg:
      `<rect x="${(x1 + x2) / 2 - 5}" y="${y}" width="10" height="${SUELO - y}" fill="${C.equipoOscuro}"/>` +
      `<rect x="${(x1 + x2) / 2 - 26}" y="${SUELO - 6}" width="52" height="6" rx="2" fill="${C.equipoOscuro}"/>` +
      `<rect x="${x1}" y="${y - 7}" width="${x2 - x1}" height="14" rx="7" fill="${C.equipo}"/>`,
  });

// Mancuernas en ambas manos (la lejana detras del cuerpo).
const mancuernas = (opts = {}) => [
  sk => (opts.punta ? E.mancuernaPunta({ c: sk.brazos.cerca.fin }) : E.mancuerna({ c: sk.brazos.cerca.fin, angulo: opts.angulo ?? 0 })),
  sk =>
    sk.brazos.lejos
      ? { ...(opts.punta ? E.mancuernaPunta({ c: sk.brazos.lejos.fin }) : E.mancuerna({ c: sk.brazos.lejos.fin, angulo: opts.anguloLejos ?? opts.angulo ?? 0 })), capa: 'fondo' }
      : { capa: 'fondo', svg: '' },
];

const barraEnManos = (dx = 0, dy = 0) => sk => E.barra({ c: [sk.brazos.cerca.fin[0] + dx, sk.brazos.cerca.fin[1] + dy] });

module.exports = {
  E, C, L, SUELO, PIE, MANO_SUELO, dir, sum, sub, mul, unit, grados,
  piernasParado, parado, frente, recto, caderaDesde, hombroDe, bancoPlano, asiento, mancuernas, barraEnManos,
};
