module.exports = (sequelize, DataTypes) => {

  const User = sequelize.define('User', {
    id: {
      type: Datatypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },    
    username: {
      type: Datatypes.STRING,
      allowNull: false
    },
    email: {
      type: Datatypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: Datatypes.STRING,
      allowNull: false
    },
    idRole: {
      type: Datatypes.INTEGER,
      allowNull: false 
    },
    birthDate: {
      type: Datatypes.DATE,
      allowNull: false
    },
    gender: {
      type: Datatypes.STRING,
      allowNull: false
    },
    phone: {
      type: Datatypes.STRING,
      allowNull: false
    },
    height: {
      type: Datatypes.INTEGER,
      allowNull: false
    },
    weight: {
      type: Datatypes.INTEGER,
      allowNull: false
    },
    address: {
      type: Datatypes.STRING,
      allowNull: false
    },
    goal: {
      type: Datatypes.STRING,
      allowNull: false
    },
    weeklyAvailability: {
      type: Datatypes.STRING,
      allowNull: false
    },
    isActive: {
      type: Datatypes.BOOLEAN,
      allowNull: false
    },
    isVerified: {
      type: Datatypes.BOOLEAN,
      allowNull: false
    },
    isDeleted: {
      type: Datatypes.BOOLEAN,
      allowNull: false
    },
    createdAt: {
      type: Datatypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: Datatypes.DATE,
      allowNull: false
    }
  });

  return User;
};  