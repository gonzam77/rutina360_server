module.exports = (sequelize, DataTypes) => {

  const Ejercice = sequelize.define('Ejercice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    id_muscle_group: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  return Ejercice;
}