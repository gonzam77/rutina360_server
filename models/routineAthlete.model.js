module.exports = (sequelize, DataTypes) => {
  const RoutineAthlete = sequelize.define(
    'RoutineAthlete',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idRoutine: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idAthlete: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['idRoutine', 'idAthlete'],
        },
      ],
    }
  );

  return RoutineAthlete;
};
