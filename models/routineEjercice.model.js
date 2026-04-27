module.exports = (sequelize, DataTypes) => {

    const Routine_Ejercice = sequelize.define('Routine_Ejercice',{
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_routine: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_ejercice: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        series: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        rest: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        comments: {
            type: DataTypes.STRING,
            allowNull: false
        }
        
    });
    
    return Routine_Ejercice;
}   