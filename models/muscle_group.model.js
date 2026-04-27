module.exports = (sequelize, DataTypes) => {

  const Muscle_Group = sequelize.define('Muscle_Group', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  return Muscle_Group;
} 