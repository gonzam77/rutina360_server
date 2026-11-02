// Funcional · Movilidad (categoria 107).
const F = require('./base_funcional');
const { E, PIE, PISO, SUELO, MANO_SUELO, frente, parado, cuadrupedia, colch, piernasSent } = F;

// Circulos de brazos, de frente: brazos abiertos y circulos chicos.
const circulosBrazos = {
  id: 1068, nombre: 'Círculos de brazos', musculos: ['hombro'],
  inicio: frente({ brazos: { ambos: { angulos: [2, 2] } }, piernas: { ambas: { destino: [226, PIE], doblar: 'der' } } }),
  fin: frente({ brazos: { ambos: { angulos: [10, 10] } }, piernas: { ambas: { destino: [226, PIE], doblar: 'der' } } }),
  flecha: [
    { arco: { centro: [314, 118], rx: 18, a0: 200, a1: 520 } },
    { arco: { centro: [86, 118], rx: 18, a0: -20, a1: -340 } },
  ],
};

// Circulos de cadera, de frente: manos en la cintura, la cadera dibuja un circulo.
const manosCintura = { ambos: { destino: [222, 214], doblar: 'der' } };
const circulosCadera = {
  id: 1069, nombre: 'Círculos de cadera', musculos: ['lumbares', 'abdomen'],
  inicio: frente({ brazos: manosCintura, piernas: { ambas: { destino: [228, PIE], doblar: 'der' } } }),
  fin: frente({ cadera: [214, 218], torso: 96, brazos: { ambos: { destino: [236, 216], doblar: 'der' } }, piernas: { ambas: { destino: [228, PIE], doblar: 'der' } } }),
  flecha: { arco: { centro: [200, 226], rx: 58, ry: 14, a0: 200, a1: 520 } },
};

// Gato-camello: columna redonda y despues hundida.
const gatoCamello = {
  id: 1070, nombre: 'Gato-camello', musculos: ['lumbares', 'espalda'],
  inicio: cuadrupedia({ curvaTorso: 14, cabeza: -40 }),
  fin: cuadrupedia({ curvaTorso: -10, cabeza: 40 }),
  flecha: { desde: [208, 216], hasta: [208, 250], curva: 0 },
};

// Rotaciones toracicas: en cuadrupedia, el brazo pasa por abajo y abre al techo.
const rotaciones = {
  id: 1071, nombre: 'Rotaciones torácicas', musculos: ['espalda'],
  inicio: cuadrupedia({ brazos: { lejos: { destino: F.MANO_CUADRUPEDIA, doblar: 'izq' }, cerca: { destino: [200, 316], doblar: 'izq' } } }),
  fin: cuadrupedia({ cabeza: 60, brazos: { lejos: { destino: F.MANO_CUADRUPEDIA, doblar: 'izq' }, cerca: { angulos: [86, 88] } } }),
  flecha: { punto: 'mano', curva: -50 },
};

const sentadillaProfunda = {
  id: 1072, nombre: 'Sentadilla profunda sostenida', musculos: ['gluteos', 'aductores'],
  sostenido: true,
  pose: {
    cadera: [168, 300], torso: 70, frente: 'der', cabeza: 76,
    brazos: { ambos: { destino: [230, 244], doblar: 'abajo' } },
    piernas: piernasSent(206, 14),
  },
};

// World's greatest stretch: estocada profunda con las manos al piso y el brazo
// de adentro abriendo hacia el techo.
const wgs = (abierto) => ({
  cadera: [176, 290], torso: 28, frente: 'abajo', cabeza: abierto ? 60 : 22,
  brazos: abierto
    ? { lejos: { destino: [266, MANO_SUELO], doblar: 'izq' }, cerca: { angulos: [86, 88] } }
    : { ambos: { destino: [266, MANO_SUELO], doblar: 'izq' } },
  piernas: {
    cerca: { destino: [258, PIE], doblar: 'der' },
    lejos: { destino: [66, 330], doblar: 'abajo', pie: 300 },
  },
  equipo: [colch()],
});
const worldsGreatest = {
  id: 1073, nombre: "World's greatest stretch", musculos: ['gluteos', 'isquios', 'espalda'],
  inicio: wgs(false),
  fin: wgs(true),
  flecha: { punto: 'mano', curva: -40 },
};

// Movilidad de tobillos: rodilla atras en el piso y la de adelante avanza.
const tobillo = (avance) => ({
  cadera: [170, 262 + avance * 0.2], torso: 88, frente: 'der',
  brazos: { ambos: { destino: [232 + avance, 268], doblar: 'abajo' } },
  piernas: {
    cerca: { destino: [240, PIE], doblar: 'der' },
    lejos: { destino: [104, 334], doblar: 'abajo', pie: 180 },
  },
  equipo: [colch()],
});
const movilidadTobillos = {
  id: 1074, nombre: 'Movilidad de tobillos', musculos: ['gemelos'],
  inicio: tobillo(0),
  fin: { ...tobillo(22), cadera: [190, 268], piernas: { cerca: { destino: [240, PIE], doblar: 'der' }, lejos: { destino: [112, 334], doblar: 'abajo', pie: 180 } } },
  flecha: { punto: 'rodilla', offset: [0, -20] },
};

// 90/90 de cadera, de frente: sentado con las dos rodillas a 90 grados, una
// adelante (el muslo hacia uno) y la otra al costado.
const nn = (lado) => frente({
  cadera: [200, 318], torso: 90 + lado * 8, cabeza: 90,
  brazos: { ambos: { destino: [244, SUELO - 10], doblar: 'der' } },
  piernas: lado > 0
    ? { der: { angulos: [356, 262], escala: [1, 0.4], pie: 0 }, izq: { angulos: [250, 180], escala: [0.4, 0.9], pie: 180 } }
    : { izq: { angulos: [184, 278], escala: [1, 0.4], pie: 180 }, der: { angulos: [290, 0], escala: [0.4, 0.9], pie: 0 } },
  equipo: [colch(60, 340)],
});
const noventa = {
  id: 1075, nombre: '90/90 de cadera', musculos: ['gluteos', 'aductores'],
  inicio: nn(1),
  fin: nn(-1),
  flecha: { desde: [250, 300], hasta: [150, 300], curva: -40 },
};

module.exports = [circulosBrazos, circulosCadera, gatoCamello, rotaciones, sentadillaProfunda, worldsGreatest, movilidadTobillos, noventa];
