module.exports = (sequelize, DataTypes) => {

    const Routine = sequelize.define('Routine', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    idUser: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    time: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
    });

    return Routine;
}   