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
    id_role: {
      type: Datatypes.INTEGER,
      allowNull: false 
    },
    birth_date: {
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
    weekly_availability: {
      type: Datatypes.STRING,
      allowNull: false
    },
    is_active: {
      type: Datatypes.BOOLEAN,
      allowNull: false
    },
    is_verified: {
      type: Datatypes.BOOLEAN,
      allowNull: false
    },
    is_deleted: {
      type: Datatypes.BOOLEAN,
      allowNull: false
    },
    created_at: {
      type: Datatypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: Datatypes.DATE,
      allowNull: false
    }
  });

  return User;
};  