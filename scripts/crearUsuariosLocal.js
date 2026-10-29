// Crea (o deja al dia) usuarios de prueba en la base LOCAL:
//   npm run usuarios:local
//
// - Super admin (dashboard), un gym y un atleta de ese gym.
// - Una rutina de prueba del gym, asignada al atleta (para ver "Asignadas").
//
// Solo corre en modo local (config/env.js corta si la base no es local) y es
// idempotente: se puede correr las veces que haga falta.
// Requiere haber levantado antes `npm run dev:local` una vez, que crea las
// tablas, los roles y el catalogo de ejercicios.

require('../config/env');
const bcrypt = require('bcrypt');
const db = require('../models');

const CLAVE = 'rutina360';

const USUARIOS = [
  { clave: 'admin', username: 'ADMIN', email: 'admin@rutina360.local', idRole: 1 },
  { clave: 'gym', username: 'GYM PRUEBA', email: 'gym@rutina360.local', idRole: 2 },
  { clave: 'atleta', username: 'ATLETA PRUEBA', email: 'atleta@rutina360.local', idRole: 4 },
];

const RUTINA = {
  name: 'Rutina de prueba',
  ejercicios: [
    { idEjercice: 1, series: 4, restSeconds: 90, comments: 'Bajar controlado' },
    { idEjercice: 51, series: 4, restSeconds: 120, comments: '' },
    { idEjercice: 31, series: 3, restSeconds: 45, comments: '' },
  ],
};

async function asegurarUsuario(datos, hash) {
  const existente = await db.User.findOne({ where: { email: datos.email } });
  const campos = {
    username: datos.username,
    email: datos.email,
    password: hash,
    idRole: datos.idRole,
    idAdminOwner: datos.idAdminOwner ?? null,
    isActive: true,
    isVerified: true,
    isDeleted: false,
  };

  if (existente) {
    await existente.update(campos);
    return existente;
  }
  return db.User.create(campos);
}

(async () => {
  try {
    await db.sequelize.authenticate();

    const roles = await db.Rol.count().catch(() => 0);
    if (!roles) {
      console.error('>> La base esta vacia. Corre primero `npm run dev:local` (crea tablas y roles) y despues este script.');
      process.exit(1);
    }

    const hash = await bcrypt.hash(CLAVE, 10);
    const [datosAdmin, datosGym, datosAtleta] = USUARIOS;

    const admin = await asegurarUsuario(datosAdmin, hash);
    const gym = await asegurarUsuario(datosGym, hash);
    // Igual que en los datos reales, el gym es su propio "dueño".
    await gym.update({ idAdminOwner: gym.id });
    const atleta = await asegurarUsuario({ ...datosAtleta, idAdminOwner: gym.id }, hash);

    // Rutina del gym asignada al atleta.
    let rutina = await db.Routine.findOne({ where: { name: RUTINA.name, idUser: gym.id } });
    if (!rutina) {
      const existentes = await db.Ejercice.findAll({
        where: { id: RUTINA.ejercicios.map((e) => e.idEjercice) },
        attributes: ['id'],
      });
      const ids = new Set(existentes.map((e) => Number(e.id)));
      const ejercicios = RUTINA.ejercicios.filter((e) => ids.has(e.idEjercice));

      rutina = await db.Routine.create({ name: RUTINA.name, idUser: gym.id, order: 1, time: 30 });
      await db.RoutineEjercice.bulkCreate(
        ejercicios.map((e) => ({ ...e, idRoutine: rutina.id })),
        { validate: true }
      );
    }

    const [asignacion] = await db.RoutineAthlete.findOrCreate({
      where: { idRoutine: rutina.id, idAthlete: atleta.id },
      defaults: { isActive: true, isDeleted: false },
    });
    await asignacion.update({ isActive: true, isDeleted: false });

    console.log('\n>> Usuarios de prueba listos (clave para todos: ' + CLAVE + ')\n');
    console.log(`   Super admin (dashboard): ${admin.email}`);
    console.log(`   Gym (dashboard):         ${gym.email}`);
    console.log(`   Atleta (app):            ${atleta.email}`);
    console.log(`\n   "${RUTINA.name}" asignada al atleta.\n`);
  } catch (error) {
    console.error('>> No se pudieron crear los usuarios:', error.message || error);
    process.exitCode = 1;
  } finally {
    await db.sequelize.close();
  }
})();
