require('dotenv').config();
const { Sequelize } = require('sequelize');

// Asegúrate de que DATABASE_URL en Render sea la "Internal Database URL"
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Opcional, para limpiar los logs
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

module.exports = sequelize;