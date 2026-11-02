// Reglas de los entrenamientos funcionales (por tiempo).
//
// Un funcional es una rutina con kind 'functional': se repite `rounds` vueltas,
// con `roundRestSeconds` de descanso entre vueltas, y cada ejercicio (bloque)
// lleva `workSeconds` de trabajo y `restSeconds` de descanso, que puede ser 0.
// Las rutinas de fuerza (kind 'strength', el default) no cambian.

const KIND_STRENGTH = 'strength';
const KIND_FUNCTIONAL = 'functional';
const MODOS = ['auto', 'manual'];

const LIMITES = {
  rounds: [1, 20],
  roundRestSeconds: [0, 600],
  workSeconds: [5, 1800],
  restSeconds: [0, 600],
};

const definido = (valor) => valor !== undefined && valor !== null && valor !== '';

function normalizarKind(valor) {
  return valor === KIND_FUNCTIONAL ? KIND_FUNCTIONAL : KIND_STRENGTH;
}

const esFuncional = (registro) => registro?.kind === KIND_FUNCTIONAL;

function entero(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) ? numero : null;
}

function enRango(nombre, valor) {
  const [min, max] = LIMITES[nombre];
  const numero = entero(valor);
  return numero !== null && numero >= min && numero <= max ? numero : null;
}

/**
 * Campos propios de un funcional. Con parcial: true (edicion) solo valida los
 * que vienen. Devuelve { campos } o { error }.
 */
function camposRutinaFuncional(body = {}, { parcial = false } = {}) {
  const campos = {};

  if (!parcial || definido(body.rounds)) {
    const rounds = definido(body.rounds) ? enRango('rounds', body.rounds) : 1;
    if (rounds === null) return { error: 'Las vueltas tienen que ser un numero entre 1 y 20.' };
    campos.rounds = rounds;
  }

  if (!parcial || definido(body.roundRestSeconds)) {
    const descanso = definido(body.roundRestSeconds) ? enRango('roundRestSeconds', body.roundRestSeconds) : 0;
    if (descanso === null) return { error: 'El descanso entre vueltas tiene que estar entre 0 y 600 segundos.' };
    campos.roundRestSeconds = descanso;
  }

  if (!parcial || definido(body.defaultMode)) {
    const modo = definido(body.defaultMode) ? body.defaultMode : 'auto';
    if (!MODOS.includes(modo)) return { error: 'El modo por defecto tiene que ser auto o manual.' };
    campos.defaultMode = modo;
  }

  return { campos };
}

/**
 * Ejercicio (bloque) de un funcional: trabajo obligatorio, descanso >= 0.
 * series queda en 1 para no romper validaciones ni clientes que sumen series.
 * El descanso se manda en restSeconds; el modelo completa rest (minutos).
 */
function ejercicioFuncional(item = {}) {
  const workSeconds = enRango('workSeconds', item.workSeconds);
  if (workSeconds === null) {
    return { error: 'Cada bloque necesita un tiempo de trabajo entre 5 segundos y 30 minutos.' };
  }

  const restSeconds = definido(item.restSeconds) ? enRango('restSeconds', item.restSeconds) : 0;
  if (restSeconds === null) {
    return { error: 'El descanso de cada bloque tiene que estar entre 0 y 600 segundos.' };
  }

  return { campos: { workSeconds, restSeconds, series: 1 } };
}

/** Segundos totales estimados de un funcional (sin la preparacion ni el descanso final). */
function duracionFuncional({ rounds = 1, roundRestSeconds = 0, exercises = [] }) {
  const vueltas = Math.max(1, Number(rounds) || 1);
  const bloques = exercises.length;
  if (!bloques) return 0;

  let total = 0;
  for (let v = 0; v < vueltas; v += 1) {
    exercises.forEach((e, i) => {
      total += Number(e.workSeconds) || 0;
      const ultimoDeLaVuelta = i === bloques - 1;
      if (!ultimoDeLaVuelta) total += Number(e.restSeconds) || 0;
      else if (v < vueltas - 1) total += Number(roundRestSeconds) || 0;
    });
  }
  return total;
}

module.exports = {
  KIND_STRENGTH,
  KIND_FUNCTIONAL,
  MODOS,
  LIMITES,
  normalizarKind,
  esFuncional,
  camposRutinaFuncional,
  ejercicioFuncional,
  duracionFuncional,
};
