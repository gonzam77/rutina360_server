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
    },
    // 'strength' (fuerza, series y repeticiones) o 'functional' (por tiempo).
    // Las rutinas que ya existian quedan en 'strength'.
    kind: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: 'strength'
    },
    // Solo funcionales: vueltas, descanso entre vueltas (s) y modo por defecto.
    rounds: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    roundRestSeconds: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    defaultMode: {
        type: DataTypes.STRING(8),
        allowNull: true
    }
    });

    return Routine;
}   