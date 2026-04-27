const express = require('express');
const db = require('../models');

const app = express();
const port = 3000   

app.use(express.json());


//Iniciar servidor + DB
async function start() {
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }  

  try {
    await db.sequelize.sync()
    console.log('Drop and Resync Db');
  } catch (error) {
    console.error('Unable to sync database:', error);
  }

  try {
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    });
  } catch (error) {
    console.error('Unable to connect server:', error);
  }
}
