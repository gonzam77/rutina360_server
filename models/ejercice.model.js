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
    idMuscleGroup: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idOwner: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Ruta relativa a la API de la ilustracion del ejercicio. Si el ejercicio
    // no tiene imagen propia, el endpoint devuelve la de su grupo muscular.
    imageUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        const id = this.getDataValue('id');
        return id ? `/ejercice/${id}/image` : null;
      }
    }
  });

  return Ejercice;
}