// Rutina compartida entre usuarios mediante un codigo.
//
// Es una foto (snapshot) de la rutina en el momento de compartirla: quien la
// recibe se lleva una copia propia, y los cambios posteriores del autor no la
// afectan. Por eso se guarda el contenido completo y no una referencia.
module.exports = (sequelize, DataTypes) => {
  const SharedRoutine = sequelize.define(
    'SharedRoutine',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true,
      },
      idOwner: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      // { exercises: [{ idEjercice, name, category, series, restSeconds, note, executionSeconds }] }
      payload: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      timesUsed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      indexes: [{ fields: ['idOwner'] }],
    }
  );

  return SharedRoutine;
};
