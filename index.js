require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models/index');

const app = express();
const port = 3000;

const corsOrigin = process.env.CORS_ORIGIN || true;

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(express.json());

app.use(require('./routes/index'));

//Iniciar servidor + DB
async function start() {
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  try {
    await db.sequelize.sync({ force: false });
    console.log('Database sync completed.');
  } catch (error) {
    console.error('Unable to sync database:', error);
  }

  try {
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to connect server:', error);
  }
}

start();
