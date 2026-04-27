const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('RUTINA_360', 'postgres', '123456', {
  host: 'localhost',
  dialect: 'postgres'
});

module.exports = sequelize;