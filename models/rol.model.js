module.exports = (sequelize, DataTypes) => {

  const Rol = sequelize.define('Rol', {
    id: {
      type: Datatypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Datatypes.STRING,
      allowNull: false
    }
  });    

  return Rol;
};