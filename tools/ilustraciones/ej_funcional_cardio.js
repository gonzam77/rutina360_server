// Funcional · Cardio (categoria 102).
const F = require('./base_funcional');
const { E, PIE, SUELO, MANO_SUELO, frente, parado, planchaAlta, elevar } = F;

const brazosCostado = { ambos: { destino: [232, 226], doblar: 'der' } };

// ---------- Saltos de frente ----------
const jumpingJacks = {
  id: 1017, nombre: 'Jumping jacks', musculos: ['cuadriceps', 'gemelos', 'hombro'],
  inicio: frente({ brazos: brazosCostado }),
  fin: elevar(frente({
    brazos: { ambos: { destino: [244, 48], doblar: 'der' } },
    piernas: { ambas: { destino: [262, PIE], doblar: 'der', pie: 300 } },
  }), 10),
  flecha: { punto: 'mano', curva: -40, offset: [10, 0] },
};

// ---------- De costado ----------
// Carrera: pierna cerca adelante, brazo cerca atras (y al reves).
const correr = (adelante, dy = 0, rodilla = [226, 270]) => elevar(parado({
  cadera: [196, 214], torso: 84,
  brazos: adelante === 'cerca'
    ? { cerca: { angulos: [240, 330] }, lejos: { angulos: [300, 30] } }
    : { cerca: { angulos: [300, 30] }, lejos: { angulos: [240, 330] } },
  piernas: adelante === 'cerca'
    ? { cerca: { destino: [rodilla[0], rodilla[1] + 40], doblar: 'der', pie: 330 }, lejos: { destino: [176, PIE], doblar: 'der', pie: 340 } }
    : { lejos: { destino: [rodilla[0], rodilla[1] + 40], doblar: 'der', pie: 330 }, cerca: { destino: [176, PIE], doblar: 'der', pie: 340 } },
}), dy);

const trote = {
  id: 1018, nombre: 'Trote en el lugar', musculos: ['cuadriceps', 'gemelos'],
  inicio: correr('cerca'),
  fin: correr('lejos'),
};

// Skipping: rodilla a la altura de la cadera.
const skip = (arriba) => parado({
  cadera: [196, 210], torso: 88,
  brazos: arriba === 'cerca'
    ? { cerca: { angulos: [250, 340] }, lejos: { angulos: [310, 60] } }
    : { cerca: { angulos: [310, 60] }, lejos: { angulos: [250, 340] } },
  piernas: arriba === 'cerca'
    ? { cerca: { angulos: [2, 272], pie: 320 }, lejos: { destino: [200, PIE], doblar: 'der', pie: 330 } }
    : { lejos: { angulos: [2, 272], pie: 320 }, cerca: { destino: [200, PIE], doblar: 'der', pie: 330 } },
});
const skipping = {
  id: 1019, nombre: 'Skipping alto', musculos: ['cuadriceps', 'abdomen'],
  inicio: skip('cerca'),
  fin: skip('lejos'),
  flecha: { punto: 'rodilla', curva: -30, offset: [10, 0] },
};

const talon = (arriba) => parado({
  cadera: [198, 214], torso: 86,
  brazos: arriba === 'cerca'
    ? { cerca: { angulos: [250, 340] }, lejos: { angulos: [300, 40] } }
    : { cerca: { angulos: [300, 40] }, lejos: { angulos: [250, 340] } },
  piernas: arriba === 'cerca'
    ? { cerca: { angulos: [266, 104], pie: 200 }, lejos: { destino: [200, PIE], doblar: 'der', pie: 330 } }
    : { lejos: { angulos: [266, 104], pie: 200 }, cerca: { destino: [200, PIE], doblar: 'der', pie: 330 } },
});
const talonesGluteos = {
  id: 1020, nombre: 'Talones a glúteos', musculos: ['isquios', 'gemelos'],
  inicio: talon('cerca'),
  fin: talon('lejos'),
};

// Mountain climbers: desde la plancha alta, la rodilla sube bajo el pecho y el
// pie queda despegado del piso.
const PIERNA_ATRAS = { cerca: { destino: [72, 324], doblar: 'abajo', pie: 292 }, lejos: { destino: [77, 324], doblar: 'abajo', pie: 292 } };
const rodillaAlPecho = (tobillo) => ({ destino: tobillo, doblar: 'der', pie: 250 });
const climber = (pierna, tobillo = [196, 322]) => planchaAlta({
  piernas: { ...PIERNA_ATRAS, [pierna]: rodillaAlPecho(tobillo) },
});
const mountainClimbers = {
  id: 1021, nombre: 'Mountain climbers', musculos: ['abdomen', 'cuadriceps', 'hombro'],
  inicio: climber('lejos'),
  fin: climber('cerca'),
  flecha: { punto: 'rodilla', curva: -24, offset: [0, 14] },
};

// Cruzados: la rodilla va mas adelante, hacia el codo contrario.
const escaladoresCruzados = {
  id: 1022, nombre: 'Escaladores cruzados', musculos: ['abdomen', 'cuadriceps', 'hombro'],
  inicio: climber('lejos', [212, 318]),
  fin: climber('cerca', [212, 318]),
  flecha: { punto: 'rodilla', curva: -24, offset: [0, 14] },
};

// Saltar la soga, de frente: la soga pasa bajo los pies y por arriba.
const soga = (porY, dy) => {
  const pose = elevar(frente({
    brazos: { ambos: { destino: [252, 236], doblar: 'der' } },
    piernas: { ambas: { destino: [210, PIE], doblar: 'der', pie: 300 } },
  }), dy);
  return {
    ...pose,
    equipo: [sk => E.soga({ a: sk.brazos.izq.fin, b: sk.brazos.der.fin, por: [200, porY] })],
  };
};
const saltarSoga = {
  id: 1023, nombre: 'Saltar la soga', musculos: ['gemelos', 'cuadriceps'],
  inicio: soga(40, 0),
  fin: soga(SUELO - 2, 14),
};

// Patinador, de frente: salto lateral a una pierna.
const patinadorPose = (lado) => {
  const x = 200 + lado * 46;
  // La pierna de apoyo semiflexionada se ve de frente como una pierna recta mas
  // corta (la rodilla va hacia adelante, no hacia el costado). La libre cruza
  // por detras hacia el lado del apoyo, con el pie despegado.
  const P = [x, 230];
  const ladoApoyo = lado > 0 ? 'der' : 'izq';
  const ladoLibre = lado > 0 ? 'izq' : 'der';
  const apoyo = F.piernaRecta(P, ladoApoyo, [x + lado * 22, PIE]);
  const libre = F.piernaRecta(P, ladoLibre, [x + lado * 40, PIE - 26]);
  return frente({
    cadera: [x, 230], torso: 90 - lado * 14, cabeza: 90 - lado * 8,
    brazos: lado > 0
      ? { der: { destino: [x + 56, 244], doblar: 'der' }, izq: { destino: [x + 14, 214], doblar: 'abajo' } }
      : { izq: { destino: [x - 56, 244], doblar: 'izq' }, der: { destino: [x - 14, 214], doblar: 'abajo' } },
    piernas: lado > 0 ? { der: apoyo, izq: libre } : { izq: apoyo, der: libre },
  });
};
const patinador = {
  id: 1024, nombre: 'Patinador (skater)', musculos: ['gluteos', 'cuadriceps', 'aductores'],
  inicio: patinadorPose(1),
  fin: patinadorPose(-1),
  flecha: { desde: [250, 190], hasta: [150, 190], curva: -30 },
};

// Shadow boxing: guardia y golpe recto.
const guardia = { angulos: [292, 104] };
const boxeo = (golpe) => ({
  cadera: [190, 222], torso: 84, frente: 'der',
  brazos: { lejos: guardia, cerca: golpe ? { angulos: [6, 4] } : guardia },
  piernas: { cerca: { destino: [226, PIE], doblar: 'der' }, lejos: { destino: [160, PIE], doblar: 'der', pie: 330 } },
});
const shadowBoxing = {
  id: 1025, nombre: 'Shadow boxing', musculos: ['hombro', 'abdomen'],
  inicio: boxeo(false),
  fin: boxeo(true),
  flecha: { punto: 'mano', offset: [0, -16] },
};

// Jumping jacks cruzados: brazos y piernas se abren y se cruzan.
const jacksCruzados = {
  id: 1026, nombre: 'Jumping jacks cruzados', musculos: ['cuadriceps', 'aductores', 'hombro'],
  inicio: elevar(frente({
    brazos: { ambos: { angulos: [8, 8] } },
    piernas: { ambas: { destino: [258, PIE], doblar: 'der', pie: 300 } },
  }), 8),
  fin: frente({
    brazos: { ambos: { destino: [176, 168], doblar: 'abajo' } },
    piernas: { der: { destino: [188, PIE], doblar: 'der', pie: 300 }, izq: { destino: [214, PIE], doblar: 'izq', pie: 240 } },
  }),
  flecha: { punto: 'mano', curva: 30 },
};

module.exports = [
  jumpingJacks, trote, skipping, talonesGluteos, mountainClimbers, escaladoresCruzados,
  saltarSoga, patinador, shadowBoxing, jacksCruzados,
];
