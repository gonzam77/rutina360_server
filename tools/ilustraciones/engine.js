// Motor de pictogramas de ejercicios de Rutina360.
// Dibuja una figura humana de perfil a partir de una pose (cadera, angulo del
// torso y destinos de manos/tobillos resueltos con cinematica inversa) y
// arma una imagen de dos paneles: posicion inicial y final.

const PANEL = 400;
const SUELO = 344;

const C = {
  fondoA: '#16223A',
  fondoB: '#0B111D',
  suelo: 'rgba(204,214,235,0.10)',
  cerca: '#D5DEF0',
  lejos: '#7F8CA6',
  musculo: '#46ED34',
  musculoLejos: '#2C9A23',
  equipo: '#45546B',
  equipoClaro: '#61728C',
  equipoOscuro: '#2B374A',
  disco: '#2E3A4F',
  discoBorde: '#7B8BA6',
  cable: 'rgba(204,214,235,0.55)',
  rotulo: 'rgba(204,214,235,0.45)',
  contorno: '#0C1322',
};

const L = { torso: 84, cuello: 12, cabeza: 17, brazo: 50, antebrazo: 46, muslo: 64, pierna: 60, pie: 22 };
const ANCHO = { pecho: 34, cintura: 27, brazo: 15, antebrazo: 13, muslo: 21, pierna: 15, pie: 9, cuello: 11, mano: 7.5 };

const rad = g => (g * Math.PI) / 180;
const dir = g => [Math.cos(rad(g)), -Math.sin(rad(g))];
const sum = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const len = a => Math.hypot(a[0], a[1]);
const unit = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const f = n => Math.round(n * 10) / 10;

const PISTAS = { arriba: [0, -1], abajo: [0, 1], izq: [-1, 0], der: [1, 0] };

function pista(p) {
  if (Array.isArray(p)) return unit(p);
  return PISTAS[p] || [0, 1];
}

// Cinematica inversa de dos huesos. Devuelve la articulacion intermedia y el
// extremo efectivamente alcanzado.
function ik(base, destino, l1, l2, hacia) {
  let d = sub(destino, base);
  let dist = len(d);
  const max = l1 + l2 - 0.5;
  const min = Math.abs(l1 - l2) + 0.5;
  if (dist > max) { d = mul(unit(d), max); dist = max; }
  if (dist < min) { d = mul(unit(d), min); dist = min; }
  const fin = sum(base, d);
  const a = Math.atan2(d[1], d[0]);
  const cosAl = Math.max(-1, Math.min(1, (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist)));
  const al = Math.acos(cosAl);
  const j1 = sum(base, [l1 * Math.cos(a + al), l1 * Math.sin(a + al)]);
  const j2 = sum(base, [l1 * Math.cos(a - al), l1 * Math.sin(a - al)]);
  const medio = mul(sum(base, fin), 0.5);
  const h = pista(hacia);
  const j = dot(sub(j1, medio), h) >= dot(sub(j2, medio), h) ? j1 : j2;
  return { medio: j, fin };
}

function cadena(base, spec, l1, l2, hacia) {
  if (spec.escala) {
    l1 *= spec.escala[0];
    l2 *= spec.escala[1];
  }
  let r;
  if (spec.angulos) {
    const j = sum(base, mul(dir(spec.angulos[0]), l1));
    r = { medio: j, fin: sum(j, mul(dir(spec.angulos[1]), l2)) };
  } else {
    r = ik(base, spec.destino, l1, l2, spec.doblar || hacia);
  }
  // Muñeca opcional: un segmento corto mas alla del antebrazo.
  if (spec.mano !== undefined) {
    r.muneca = r.fin;
    r.fin = sum(r.fin, mul(dir(spec.mano), 13));
  }
  return r;
}

// Lado "interno" del pliegue de una cadena: hacia donde se cierra el angulo.
function ladoPliegue(base, medio, fin) {
  const u = unit(sub(medio, base));
  const n = [-u[1], u[0]];
  const s = dot(sub(fin, base), n);
  return Math.abs(s) < 1e-3 ? n : mul(n, Math.sign(s));
}

function esqueleto(p) {
  const cadera = p.cadera;
  const hombro = sum(cadera, mul(dir(p.torso), L.torso));
  const medioTorso = sum(cadera, mul(dir(p.torso), L.torso * 0.55));
  const cabeza = sum(hombro, mul(dir(p.cabeza ?? p.torso), L.cuello + L.cabeza));
  const frente = p.frente; // vector hacia donde mira el pecho
  const brazos = {};
  const piernas = {};
  for (const lado of ['cerca', 'lejos']) {
    const b = p.brazos?.[lado] || p.brazos?.ambos;
    if (b) brazos[lado] = cadena(hombro, b, L.brazo, L.antebrazo, 'abajo');
    const g = p.piernas?.[lado] || p.piernas?.ambas;
    if (g) {
      const c = cadena(cadera, g, L.muslo, L.pierna, 'der');
      const pieAng = g.pie ?? 0;
      piernas[lado] = { ...c, punta: sum(c.fin, mul(dir(pieAng), L.pie)) };
    }
  }
  return { cadera, hombro, medioTorso, cabeza, frente: pista(frente), brazos, piernas };
}

const capsula = (a, b, w, color, extra = '') =>
  `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
// Parte del cuerpo: capsula con un contorno del color del fondo, para que las
// partes que se superponen (un brazo sobre el torso) se sigan distinguiendo.
const parte = (a, b, w, color) => capsula(a, b, w + 5, C.contorno) + capsula(a, b, w, color);
const bola = (c, r, color) => circulo(c, r + 2.5, C.contorno) + circulo(c, r, color);
const circulo = (c, r, color, extra = '') =>
  `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${r}" fill="${color}" ${extra}/>`;

// Franja de musculo sobre un segmento, corrida hacia un lado.
function franja(a, b, w, lado, color, corte = [0.15, 0.85]) {
  const off = mul(lado, w * 0.18);
  const d = sub(b, a);
  const a2 = sum(sum(a, mul(d, corte[0])), off);
  const b2 = sum(sum(a, mul(d, corte[1])), off);
  return capsula(a2, b2, w * 0.56, color);
}

// Que se pinta de verde segun el grupo muscular.
function musculos(sk, grupos, lado) {
  const out = [];
  const col = lado === 'cerca' ? C.musculo : C.musculoLejos;
  const br = sk.brazos[lado];
  const pi = sk.piernas[lado];
  const atras = mul(sk.frente, -1);
  for (const g of grupos) {
    if (lado === 'cerca') {
      if (g === 'pecho') out.push(franja(sk.medioTorso, sk.hombro, ANCHO.pecho, sk.frente, col, [0.05, 0.75]));
      if (g === 'abdomen') out.push(franja(sk.cadera, sk.medioTorso, ANCHO.cintura, sk.frente, col, [0.1, 1.05]));
      if (g === 'espalda') out.push(franja(sk.medioTorso, sk.hombro, ANCHO.pecho, atras, col, [-0.25, 0.8]));
      if (g === 'lumbares') out.push(franja(sk.cadera, sk.medioTorso, ANCHO.cintura, atras, col, [0.15, 0.95]));
      if (g === 'trapecio') {
        const t = sum(sk.hombro, mul(dir(0), 0));
        out.push(capsula(sum(t, mul(atras, 5)), sum(sk.cabeza, mul(sub(sk.hombro, sk.cabeza), 0.55)), 12, col));
      }
      if (g === 'gluteos' && pi) {
        const bajo = sum(sk.cadera, mul(sub(pi.medio, sk.cadera), 0.22));
        out.push(capsula(sum(sum(sk.cadera, mul(atras, 8)), mul(unit(sub(sk.hombro, sk.cadera)), 3)), sum(bajo, mul(atras, 7)), 13, col));
      }
    }
    if (br && g === 'hombro') out.push(circulo(sk.hombro, lado === 'cerca' ? 10 : 8, col));
    if (br && g === 'biceps') out.push(franja(sk.hombro, br.medio, ANCHO.brazo, ladoPliegue(sk.hombro, br.medio, br.fin), col));
    if (br && g === 'triceps') out.push(franja(sk.hombro, br.medio, ANCHO.brazo, mul(ladoPliegue(sk.hombro, br.medio, br.fin), -1), col));
    if (br && g === 'antebrazo') out.push(franja(br.medio, br.muneca || br.fin, ANCHO.antebrazo, [0, 0], col));
    if (pi && g === 'cuadriceps') out.push(franja(sk.cadera, pi.medio, ANCHO.muslo, mul(ladoPliegue(sk.cadera, pi.medio, pi.fin), -1), col));
    if (pi && g === 'isquios') out.push(franja(sk.cadera, pi.medio, ANCHO.muslo, ladoPliegue(sk.cadera, pi.medio, pi.fin), col));
    if (pi && g === 'aductores') out.push(franja(sk.cadera, pi.medio, ANCHO.muslo, [0, 0], col, [0.2, 0.8]));
    if (pi && g === 'gemelos') out.push(franja(pi.medio, pi.fin, ANCHO.pierna, ladoPliegue(sk.cadera, pi.medio, pi.fin), col, [0.1, 0.6]));
  }
  return out.join('');
}

function extremidades(sk, lado, color, grupos) {
  const out = [];
  const pi = sk.piernas[lado];
  if (pi) {
    out.push(parte(pi.fin, pi.punta, ANCHO.pie, color));
    out.push(parte(pi.medio, pi.fin, ANCHO.pierna, color));
    out.push(parte(sk.cadera, pi.medio, ANCHO.muslo, color));
  }
  return out.join('');
}

function brazo(sk, lado, color) {
  const br = sk.brazos[lado];
  if (!br) return '';
  const muneca = br.muneca ? parte(br.muneca, br.fin, 9, color) : '';
  return (
    parte(sk.hombro, br.medio, ANCHO.brazo, color) +
    parte(br.medio, br.muneca || br.fin, ANCHO.antebrazo, color) +
    muneca +
    bola(br.fin, ANCHO.mano, color)
  );
}

function tronco(sk, color) {
  const cuelloBase = sum(sk.hombro, mul(sub(sk.cabeza, sk.hombro), 0.15));
  const cuelloFin = sum(sk.hombro, mul(sub(sk.cabeza, sk.hombro), 0.6));
  return (
    capsula(sk.cadera, sk.medioTorso, ANCHO.cintura + 5, C.contorno) +
    capsula(sk.medioTorso, sum(sk.hombro, mul(sub(sk.hombro, sk.medioTorso), -0.08)), ANCHO.pecho + 5, C.contorno) +
    capsula(cuelloBase, cuelloFin, ANCHO.cuello, color) +
    capsula(sk.cadera, sk.medioTorso, ANCHO.cintura, color) +
    capsula(sk.medioTorso, sum(sk.hombro, mul(sub(sk.hombro, sk.medioTorso), -0.08)), ANCHO.pecho, color) +
    bola(sk.cabeza, L.cabeza, color)
  );
}

// ---------- Equipamiento ----------
// Cada elemento devuelve { capa, svg }. Capas: fondo (detras de todo),
// medio (entre extremidades lejanas y el cuerpo), frente (encima de todo).

const E = {
  banco({ x1, x2, y, inclinado = 0, capa = 'fondo', patas = true }) {
    // inclinado: grados del respaldo (desde x2 hacia arriba-derecha)
    let svg = '';
    const alto = 12;
    if (patas) {
      svg += `<rect x="${x1 + 10}" y="${y + alto}" width="8" height="${SUELO - y - alto}" fill="${C.equipoOscuro}"/>`;
      svg += `<rect x="${x2 - 18}" y="${y + alto}" width="8" height="${SUELO - y - alto}" fill="${C.equipoOscuro}"/>`;
      svg += `<rect x="${x1 + 4}" y="${SUELO - 6}" width="20" height="6" rx="2" fill="${C.equipoOscuro}"/>`;
      svg += `<rect x="${x2 - 24}" y="${SUELO - 6}" width="20" height="6" rx="2" fill="${C.equipoOscuro}"/>`;
    }
    svg += `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="${alto}" rx="6" fill="${C.equipo}"/>`;
    return { capa, svg };
  },
  respaldo({ x, y, largo, angulo, capa = 'fondo' }) {
    const fin = sum([x, y], mul(dir(angulo), largo));
    return { capa, svg: capsula([x, y], fin, 13, C.equipo) };
  },
  barra({ c, capa = 'frente', r = 27 }) {
    return {
      capa,
      svg:
        circulo(c, r, C.disco, `fill-opacity="0.6" stroke="${C.discoBorde}" stroke-width="3"`) +
        circulo(c, r * 0.55, 'none', `stroke="${C.discoBorde}" stroke-opacity="0.35" stroke-width="2"`) +
        circulo(c, 4.5, C.discoBorde),
    };
  },
  mancuerna({ c, capa = 'frente', angulo = 0 }) {
    const d = dir(angulo);
    const a = sum(c, mul(d, -13));
    const b = sum(c, mul(d, 13));
    return {
      capa,
      svg:
        capsula(a, b, 5, C.discoBorde) +
        capsula(sum(a, mul(d, -2)), sum(a, mul(d, 3)), 19, C.discoBorde) +
        capsula(sum(a, mul(d, -2)), sum(a, mul(d, 3)), 14, C.disco) +
        capsula(sum(b, mul(d, -3)), sum(b, mul(d, 2)), 19, C.discoBorde) +
        capsula(sum(b, mul(d, -3)), sum(b, mul(d, 2)), 14, C.disco),
    };
  },
  polea({ x, y, hacia, columna = true, capa = 'fondo', tope = 40 }) {
    let svg = '';
    if (columna) svg += `<rect x="${x - 7}" y="${tope}" width="14" height="${SUELO - tope}" rx="4" fill="${C.equipoOscuro}"/>`;
    svg += circulo([x, y], 9, C.equipo, `stroke="${C.equipoClaro}" stroke-width="3"`);
    if (hacia) svg += capsula([x, y], hacia, 2.5, C.cable);
    return { capa, svg };
  },
  cableA({ desde, hacia, capa = 'medio' }) {
    return { capa, svg: capsula(desde, hacia, 2.5, C.cable) };
  },
  barraFija({ x, y, capa = 'fondo' }) {
    return {
      capa,
      svg:
        `<rect x="${x + 70}" y="${y}" width="9" height="${SUELO - y}" fill="${C.equipoOscuro}"/>` +
        capsula([x - 20, y + 2], [x + 78, y + 2], 7, C.equipo) +
        circulo([x, y + 2], 7, C.equipoClaro),
    };
  },
  caja({ x, y, w, h, capa = 'fondo' }) {
    return { capa, svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${C.equipo}"/>` };
  },
  colchoneta({ x1, x2, capa = 'fondo' }) {
    return { capa, svg: `<rect x="${x1}" y="${SUELO - 5}" width="${x2 - x1}" height="6" rx="3" fill="${C.equipo}"/>` };
  },
  asa({ c, capa = 'frente', ancho = 22, angulo = 0 }) {
    const d = dir(angulo);
    return { capa, svg: capsula(sum(c, mul(d, -ancho / 2)), sum(c, mul(d, ancho / 2)), 5, C.discoBorde) };
  },
  rueda({ c, capa = 'frente' }) {
    return { capa, svg: circulo(c, 15, C.disco, `stroke="${C.discoBorde}" stroke-width="3"`) + circulo(c, 4, C.discoBorde) };
  },
  libre({ svg, capa = 'fondo' }) {
    return { capa, svg };
  },
  // Almohadilla / tapizado entre dos puntos.
  pad({ a, b, w = 14, capa = 'fondo', color = C.equipo }) {
    return { capa, svg: capsula(a, b, w, color) };
  },
  // Rodillo de espuma visto de costado.
  rodillo({ c, r = 11, capa = 'frente' }) {
    return { capa, svg: circulo(c, r, C.equipo, `stroke="${C.equipoClaro}" stroke-width="3"`) };
  },
  poste({ x, y1, y2 = SUELO, w = 9, capa = 'fondo' }) {
    return { capa, svg: `<rect x="${x - w / 2}" y="${y1}" width="${w}" height="${y2 - y1}" rx="3" fill="${C.equipoOscuro}"/>` };
  },
  // Palanca de maquina (brazo metalico).
  palanca({ a, b, w = 7, capa = 'frente' }) {
    return { capa, svg: capsula(a, b, w, C.equipoClaro) };
  },
  // Pila de pesas de una maquina, de fondo.
  pila({ x, y = 150, h = 120, capa = 'fondo' }) {
    let svg = `<rect x="${x - 4}" y="40" width="8" height="${SUELO - 40}" fill="${C.equipoOscuro}"/>`;
    svg += `<rect x="${x + 26}" y="40" width="8" height="${SUELO - 40}" fill="${C.equipoOscuro}"/>`;
    for (let i = 0; i < 6; i++) svg += `<rect x="${x + 2}" y="${y + h - (i + 1) * 13}" width="26" height="10" rx="2" fill="${C.equipo}"/>`;
    return { capa, svg };
  },
  // Barra vista de frente: barra horizontal con discos en los extremos.
  barraLarga({ c, ancho = 240, capa = 'frente', alto = 54 }) {
    const [x, y] = c;
    let svg = capsula([x - ancho / 2, y], [x + ancho / 2, y], 5, C.discoBorde);
    for (const s of [-1, 1]) {
      const px = x + s * (ancho / 2 - 14);
      svg += `<rect x="${px - 7}" y="${y - alto / 2}" width="14" height="${alto}" rx="4" fill="${C.disco}" stroke="${C.discoBorde}" stroke-width="2.5"/>`;
    }
    return { capa, svg };
  },
  // Mancuerna vista de punta (agarre supino o prono, de costado).
  mancuernaPunta({ c, capa = 'frente', r = 12 }) {
    return { capa, svg: circulo(c, r, C.disco, `stroke="${C.discoBorde}" stroke-width="3"`) + circulo(c, 3.5, C.discoBorde) };
  },
  // Barra de paralelas vista de costado.
  paralela({ x, y, capa = 'fondo' }) {
    return {
      capa,
      svg: `<rect x="${x - 4}" y="${y}" width="8" height="${SUELO - y}" fill="${C.equipoOscuro}"/>` + circulo([x, y], 7, C.equipoClaro),
    };
  },
  // Hand gripper: dos mangos unidos por un resorte.
  gripper({ c, abierto = true, capa = 'frente', angulo = 90 }) {
    const d = dir(angulo);
    const n = [-d[1], d[0]];
    const abre = abierto ? 20 : 4;
    const base = sum(c, mul(d, 34));
    const a1 = sum(sum(c, mul(n, abre)), mul(d, -8));
    const a2 = sum(sum(c, mul(n, -abre)), mul(d, -8));
    return {
      capa,
      svg:
        capsula(a1, base, 7, C.discoBorde) + capsula(a2, base, 7, C.discoBorde) +
        circulo(base, 7, 'none', `stroke="${C.equipoClaro}" stroke-width="3.5"`),
    };
  },
  // Disco suelto colgando de una soga.
  pesoColgado({ desde, y, capa = 'medio' }) {
    const c = [desde[0], y];
    return {
      capa,
      svg: capsula(desde, [c[0], c[1] - 14], 2.5, C.cable) + circulo(c, 14, C.disco, `stroke="${C.discoBorde}" stroke-width="3"`),
    };
  },
};

function flecha(desde, hasta, curva = 0) {
  const m = mul(sum(desde, hasta), 0.5);
  const d = sub(hasta, desde);
  const n = unit([-d[1], d[0]]);
  const ctrl = sum(m, mul(n, curva));
  // punta de flecha
  const t = unit(sub(hasta, ctrl));
  const p1 = sum(hasta, sum(mul(t, -10), mul([-t[1], t[0]], 6)));
  const p2 = sum(hasta, sum(mul(t, -10), mul([t[1], -t[0]], 6)));
  return (
    `<path d="M${f(desde[0])} ${f(desde[1])} Q${f(ctrl[0])} ${f(ctrl[1])} ${f(hasta[0])} ${f(hasta[1])}" fill="none" stroke="${C.musculo}" stroke-opacity="0.75" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"/>` +
    `<path d="M${f(p1[0])} ${f(p1[1])} L${f(hasta[0])} ${f(hasta[1])} L${f(p2[0])} ${f(p2[1])}" fill="none" stroke="${C.musculo}" stroke-opacity="0.85" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
  );
}


// ---------- Vista de frente / de espaldas ----------
// Para movimientos laterales (elevaciones laterales, aperturas, abductores...)
// la figura se dibuja de frente. Con `espalda: true` se la ve de atras y se
// pintan los musculos posteriores.

function esqueletoFrente(p) {
  const P = p.cadera;
  const u = dir(p.torso ?? 90);
  const der = [-u[1], u[0]];
  const lt = L.torso * (p.torsoEscala ?? 1);
  const N = sum(P, mul(u, lt));
  const subir = mul(u, p.encoger || 0);
  const hombros = {
    izq: sum(sum(N, mul(der, -22)), subir),
    der: sum(sum(N, mul(der, 22)), subir),
  };
  const caderas = { izq: sum(P, mul(der, -12)), der: sum(P, mul(der, 12)) };
  const cabeza = p.cabezaPos
    ? sum(N, p.cabezaPos)
    : sum(N, mul(dir(p.cabeza ?? p.torso ?? 90), L.cuello + L.cabeza));
  const brazos = {};
  const piernas = {};
  for (const lado of ['izq', 'der']) {
    const pista0 = lado === 'izq' ? 'izq' : 'der';
    const b = p.brazos?.[lado] || (p.brazos?.ambos && espejar(p.brazos.ambos, lado, P));
    if (b) brazos[lado] = cadena(hombros[lado], b, L.brazo, L.antebrazo, pista0);
    const g = p.piernas?.[lado] || (p.piernas?.ambas && espejar(p.piernas.ambas, lado, P));
    if (g) {
      const c = cadena(caderas[lado], g, L.muslo, L.pierna, pista0);
      const pieAng = g.pie ?? (lado === 'izq' ? 250 : 290);
      piernas[lado] = { ...c, punta: sum(c.fin, mul(dir(pieAng), 11)) };
    }
  }
  return { vista: 'frente', espalda: !!p.espalda, P, N, u, der, lt, hombros, caderas, cabeza, brazos, piernas, medio: sum(P, mul(u, lt * 0.5)) };
}

// Las especificaciones de "ambos" se escriben para el lado derecho de la
// pantalla; el izquierdo es su espejo respecto de la cadera.
function espejar(spec, lado, P) {
  if (lado === 'der') return spec;
  const e = { ...spec };
  if (spec.destino) e.destino = [2 * P[0] - spec.destino[0], spec.destino[1]];
  if (spec.angulos) e.angulos = spec.angulos.map(a => 180 - a);
  if (spec.mano !== undefined) e.mano = 180 - spec.mano;
  if (spec.pie !== undefined) e.pie = 180 - spec.pie;
  if (spec.doblar === 'der') e.doblar = 'izq';
  else if (spec.doblar === 'izq') e.doblar = 'der';
  else if (Array.isArray(spec.doblar)) e.doblar = [-spec.doblar[0], spec.doblar[1]];
  return e;
}

function figuraFrente(pose, grupos) {
  const sk = esqueletoFrente(pose);
  const equipo = (pose.equipo || []).map(e => (typeof e === 'function' ? e(sk) : e));
  const capa = n => equipo.filter(e => e.capa === n).map(e => e.svg).join('');
  const col = C.cerca;
  const out = [capa('fondo')];
  const pierna = lado => {
    const pi = sk.piernas[lado];
    if (!pi) return '';
    return parte(pi.fin, pi.punta, ANCHO.pie + 1, col) + parte(pi.medio, pi.fin, ANCHO.pierna + 1, col) + parte(sk.caderas[lado], pi.medio, ANCHO.muslo + 1, col);
  };
  const brazoF = lado => {
    const br = sk.brazos[lado];
    if (!br) return '';
    return (
      parte(sk.hombros[lado], br.medio, ANCHO.brazo, col) +
      parte(br.medio, br.muneca || br.fin, ANCHO.antebrazo, col) +
      (br.muneca ? parte(br.muneca, br.fin, 9, col) : '') +
      bola(br.fin, ANCHO.mano, col)
    );
  };
  const torso = () => {
    const { P, N, u, der, lt } = sk;
    const en = (base, dx, dy) => sum(sum(base, mul(der, dx)), mul(u, dy));
    const pts = [
      en(N, -23, 2), en(P, -16, lt * 0.42), en(P, -19, 6), en(P, -15, -10),
      en(P, 15, -10), en(P, 19, 6), en(P, 16, lt * 0.42), en(N, 23, 2),
    ].map(q => `${f(q[0])},${f(q[1])}`).join(' ');
    const cuello0 = sum(sk.N, mul(sub(sk.cabeza, sk.N), 0.1));
    const cuello1 = sum(sk.N, mul(sub(sk.cabeza, sk.N), 0.6));
    return (
      `<polygon points="${pts}" fill="${C.contorno}" stroke="${C.contorno}" stroke-width="17" stroke-linejoin="round"/>` +
      capsula(sk.hombros.izq, sk.hombros.der, 22, C.contorno) +
      capsula(cuello0, cuello1, ANCHO.cuello, col) +
      `<polygon points="${pts}" fill="${col}" stroke="${col}" stroke-width="12" stroke-linejoin="round"/>` +
      capsula(sk.hombros.izq, sk.hombros.der, 17, col) +
      (sk.espalda ? capsula(en(N, 0, -10), en(P, 0, 4), 2.5, C.contorno, 'stroke-opacity="0.35"') : '') +
      bola(sk.cabeza, L.cabeza, col)
    );
  };
  const torsoMus = () => {
    const m = [];
    const c = C.musculo;
    const { P, N, u, der, lt } = sk;
    const en = (base, dx, dy) => sum(sum(base, mul(der, dx)), mul(u, dy));
    for (const g of grupos) {
      if (!sk.espalda) {
        if (g === 'pecho') for (const s of [-1, 1]) m.push(capsula(en(N, s * 7, -15), en(N, s * 17, -12), 15, c));
        if (g === 'abdomen') m.push(capsula(en(P, 0, 10), en(P, 0, lt * 0.58), 15, c));
        if (g === 'espalda') for (const s of [-1, 1]) m.push(capsula(en(N, s * 19, -16), en(P, s * 14, lt * 0.42), 7, c));
      } else {
        if (g === 'espalda') for (const s of [-1, 1]) m.push(capsula(en(N, s * 12, -14), en(P, s * 9, lt * 0.38), 13, c));
        if (g === 'lumbares') for (const s of [-1, 1]) m.push(capsula(en(P, s * 6, 8), en(P, s * 6, lt * 0.45), 9, c));
        if (g === 'gluteos') for (const s of [-1, 1]) m.push(circulo(en(P, s * 10, -6), 11, c));
      }
      if (g === 'trapecio') for (const s of [-1, 1]) m.push(capsula(en(N, s * 4, 10), en(sk.hombros[s < 0 ? 'izq' : 'der'], s * -5, 1), 14, c));
      if (g === 'trapecio' && sk.espalda) m.push(capsula(en(N, 0, 2), en(N, 0, -24), 12, c));
      if (g === 'gluteos' && !sk.espalda) for (const s of [-1, 1]) m.push(circulo(en(P, s * 17, 2), 7, c));
    }
    return m.join('');
  };
  const piernaMus = lado => {
    const pi = sk.piernas[lado];
    if (!pi) return '';
    const m = [];
    const cad = sk.caderas[lado];
    const adentro = lado === 'izq' ? sk.der : mul(sk.der, -1);
    for (const g of grupos) {
      if (g === 'cuadriceps' && !sk.espalda) m.push(franja(cad, pi.medio, ANCHO.muslo, [0, 0], C.musculo));
      if (g === 'isquios' && sk.espalda) m.push(franja(cad, pi.medio, ANCHO.muslo, [0, 0], C.musculo));
      if (g === 'aductores') m.push(franja(cad, pi.medio, ANCHO.muslo, adentro, C.musculo, [0.2, 0.75]));
      if (g === 'gemelos') m.push(franja(pi.medio, pi.fin, ANCHO.pierna, [0, 0], C.musculo, [0.1, 0.6]));
    }
    return m.join('');
  };
  const brazoMus = lado => {
    const br = sk.brazos[lado];
    if (!br) return '';
    const m = [];
    const h = sk.hombros[lado];
    for (const g of grupos) {
      if (g === 'hombro') m.push(circulo(h, 10, C.musculo));
      if ((g === 'biceps' && !sk.espalda) || (g === 'triceps' && sk.espalda)) m.push(franja(h, br.medio, ANCHO.brazo, [0, 0], C.musculo));
      if (g === 'antebrazo') m.push(franja(br.medio, br.muneca || br.fin, ANCHO.antebrazo, [0, 0], C.musculo));
    }
    return m.join('');
  };
  out.push(pierna('izq'), pierna('der'), piernaMus('izq'), piernaMus('der'));
  if (pose.brazosDetras) out.push(brazoF('izq'), brazoF('der'), brazoMus('izq'), brazoMus('der'));
  out.push(capa('medio'));
  out.push(torso(), torsoMus());
  if (!pose.brazosDetras) out.push(brazoF('izq'), brazoF('der'), brazoMus('izq'), brazoMus('der'));
  out.push(capa('frente'));
  return out.join('');
}

function figura(pose, grupos) {
  if (pose.vista === 'frente') return figuraFrente(pose, grupos);
  const sk = esqueleto(pose);
  const equipo = (pose.equipo || []).map(e => (typeof e === 'function' ? e(sk) : e));
  const capa = n => equipo.filter(e => e.capa === n).map(e => e.svg).join('');
  return (
    capa('fondo') +
    brazo(sk, 'lejos', C.lejos) +
    musculos(sk, grupos.filter(g => ['biceps', 'triceps', 'antebrazo', 'hombro'].includes(g)), 'lejos') +
    extremidades(sk, 'lejos', C.lejos) +
    musculos(sk, grupos.filter(g => ['cuadriceps', 'isquios', 'aductores', 'gemelos'].includes(g)), 'lejos') +
    capa('medio') +
    extremidades(sk, 'cerca', C.cerca) +
    tronco(sk, C.cerca) +
    musculos(sk, grupos.filter(g => !['biceps', 'triceps', 'antebrazo', 'hombro'].includes(g)), 'cerca') +
    brazo(sk, 'cerca', C.cerca) +
    musculos(sk, grupos.filter(g => ['biceps', 'triceps', 'antebrazo', 'hombro'].includes(g)), 'cerca') +
    capa('frente')
  );
}

function puntoClave(pose, clave) {
  if (Array.isArray(clave)) return clave;
  if (pose.vista === 'frente') {
    const sk = esqueletoFrente(pose);
    if (clave === 'mano') return sk.brazos.der?.fin;
    if (clave === 'manoIzq') return sk.brazos.izq?.fin;
    if (clave === 'pie') return sk.piernas.der?.fin;
    if (clave === 'rodilla') return sk.piernas.der?.medio;
    if (clave === 'codo') return sk.brazos.der?.medio;
    if (clave === 'cadera') return sk.P;
    if (clave === 'hombro') return sk.hombros.der;
    if (clave === 'cabeza') return sk.cabeza;
    return null;
  }
  const sk = esqueleto(pose);
  if (clave === 'mano') return sk.brazos.cerca?.fin;
  if (clave === 'pie') return sk.piernas.cerca?.fin;
  if (clave === 'cadera') return sk.cadera;
  if (clave === 'hombro') return sk.hombro;
  if (clave === 'cabeza') return sk.cabeza;
  if (clave === 'rodilla') return sk.piernas.cerca?.medio;
  if (clave === 'codo') return sk.brazos.cerca?.medio;
  return null;
}

function panel(contenido, x, numero) {
  return (
    `<g transform="translate(${x},0)">` +
    `<line x1="24" y1="${SUELO + 1}" x2="${PANEL - 24}" y2="${SUELO + 1}" stroke="${C.suelo}" stroke-width="2"/>` +
    contenido +
    `<circle cx="30" cy="30" r="14" fill="none" stroke="${C.rotulo}" stroke-width="2"/>` +
    `<text x="30" y="35.5" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="15" fill="${C.rotulo}">${numero}</text>` +
    `</g>`
  );
}

function render(ej) {
  const grupos = ej.musculos;
  const ini = figura(ej.inicio, grupos);
  let fin = figura(ej.fin, grupos);
  const flechas = Array.isArray(ej.flecha) ? ej.flecha : ej.flecha ? [ej.flecha] : [];
  for (const fl of flechas) {
    const a = fl.desde || puntoClave(ej.inicio, fl.punto);
    const b = fl.hasta || puntoClave(ej.fin, fl.punto);
    if (a && b) {
      const off = fl.offset || [0, 0];
      fin += flecha(sum(a, off), sum(b, off), fl.curva || 0);
    }
  }
  const ancho = PANEL * 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${PANEL}" viewBox="0 0 ${ancho} ${PANEL}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.fondoA}"/><stop offset="1" stop-color="${C.fondoB}"/></linearGradient></defs>` +
    `<rect width="${ancho}" height="${PANEL}" fill="url(#g)"/>` +
    `<line x1="${PANEL}" y1="40" x2="${PANEL}" y2="${PANEL - 40}" stroke="rgba(204,214,235,0.08)" stroke-width="2"/>` +
    panel(ini, 0, 1) +
    panel(fin, PANEL, 2) +
    `</svg>`
  );
}

// Imagen de respaldo por grupo muscular: una sola figura centrada.
function renderGrupo(pose, grupos) {
  const ancho = PANEL * 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${PANEL}" viewBox="0 0 ${ancho} ${PANEL}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.fondoA}"/><stop offset="1" stop-color="${C.fondoB}"/></linearGradient></defs>` +
    `<rect width="${ancho}" height="${PANEL}" fill="url(#g)"/>` +
    `<g transform="translate(${PANEL / 2},0)">` +
    `<line x1="24" y1="${SUELO + 1}" x2="${PANEL - 24}" y2="${SUELO + 1}" stroke="${C.suelo}" stroke-width="2"/>` +
    figura(pose, grupos) +
    `</g></svg>`
  );
}

module.exports = { render, renderGrupo, E, C, L, SUELO, PANEL, dir, sum, sub, mul, unit, len };
