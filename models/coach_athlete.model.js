module.export = (sequelize, DataTypes) => {

    const Coach_Athlete = sequelize.define('Coach_Athlete', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_coach: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_athlete: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    } 
    })

    return Coach_Athlete;
}