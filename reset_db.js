require('./config/env');
const setupDatabase = require('./config/setup');

async function reset() {
  try {
    console.log('Conectando a:', process.env.DATABASE_URL);

    const db = require('./models/index');

    await db.sequelize.sync({ force: true });
    await setupDatabase();

    console.log('\n? Éxito: Las tablas han sido reseteadas y las semillas cargadas.');
    process.exit(0);
  } catch (error) {
    console.error('\n? Error al resetear la base de datos:', error);
    process.exit(1);
  }
}

reset();
