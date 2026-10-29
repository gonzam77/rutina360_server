require('./config/env');
const express = require('express');
const cors = require('cors');
const db = require('./models/index');
const setupDatabase = require('./config/setup')
const runMigrations = require('./config/migrations');

const app = express();
const port = process.env.PORT || 3000;

const corsOrigin = process.env.CORS_ORIGIN || true;

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API funcionando');
});

app.use(require('./routes/index'));

//Iniciar servidor + DB
async function start() {
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    //Sincroniza DB
    await db.sequelize.sync({ force: false });
    console.log('Database sync completed.');

    // Columnas nuevas en tablas existentes (sync no las agrega).
    await runMigrations();
    
    // Ejecutamos la carga de datos por defecto
    await setupDatabase();
    console.log('Preset database.');
  } catch (error) {
    console.error('Unable to initialize database:', error);
    process.exit(1);
  }

  // Por defecto escucha en todas las interfaces (asi esta en produccion,
  // ver commit "Puerto publico para app"). HOST permite limitarlo, por
  // ejemplo HOST=127.0.0.1 en .env.local para desarrollo.
  const host = process.env.HOST;
  const alEscuchar = () => {
    console.log(`Example app listening on port ${port}`);
  };
  if (host) {
    app.listen(port, host, alEscuchar);
    return;
  }
  app.listen(port, alEscuchar);
}

start();
