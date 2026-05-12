module.exports = (sequelize, DataTypes) => {

  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },    
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dni:{
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    idRole: {
      type: DataTypes.INTEGER,
      allowNull: false 
    },
    idAdminOwner: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    goal: {
      type: DataTypes.STRING,
      allowNull: true
    },
    weeklyAvailability: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

  return User;
};  
