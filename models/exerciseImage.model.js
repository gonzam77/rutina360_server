// Imagenes ilustrativas de los ejercicios.
//
// Viven en su propia tabla para que el binario nunca viaje en los listados de
// ejercicios ni en las rutinas: solo se lee cuando alguien pide la imagen.
// Una fila es la imagen de un ejercicio (idEjercice) o la imagen generica de
// un grupo muscular (idMuscleGroup), que se usa como respaldo para los
// ejercicios propios de cada gym que no tienen ilustracion.
module.exports = (sequelize, DataTypes) => {
  const ExerciseImage = sequelize.define(
    'ExerciseImage',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idEjercice: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
      },
      idMuscleGroup: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
      },
      mime: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'image/png',
      },
      data: {
        type: DataTypes.BLOB,
        allowNull: false,
      },
      // sha1 del contenido: sirve de ETag y para saber si la imagen del
      // seeder cambio y hay que actualizarla.
      hash: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      // 'seed' = generada con el sistema; 'upload' = cargada a mano. El
      // seeder nunca pisa una imagen cargada a mano.
      source: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: 'seed',
      },
    },
    {
      defaultScope: {
        attributes: { exclude: ['data'] },
      },
      scopes: {
        conDatos: {},
      },
    }
  );

  return ExerciseImage;
};
