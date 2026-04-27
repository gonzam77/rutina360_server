module.export = (sequelize, DataTypes) => {

    const CoachAthlete = sequelize.define('CoachAthlete', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idCoach: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    idAthlete: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    } 
    })

    return CoachAthlete;
}