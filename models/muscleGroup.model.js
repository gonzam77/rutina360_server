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
    },
    // 'strength' (grupos musculares de siempre) o 'functional' (categorias del
    // catalogo funcional: Core, Cardio, Pliometria...).
    kind: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: 'strength'
    }
  });

  return MuscleGroup;
} 