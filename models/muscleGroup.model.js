module.exports = (sequelize, DataTypes) => {

  const MuscleGroup = sequelize.define('MuscleGroup', {
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

  return MuscleGroup;
} 