const definido = (valor) => valor !== null && valor !== undefined && valor !== '';

module.exports = (sequelize, DataTypes) => {

    const Routine_Ejercice = sequelize.define('Routine_Ejercice',{
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idRoutine: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idEjercice: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        series: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        // Descanso en minutos. Se mantiene por compatibilidad con las versiones
        // de la app que solo conocen minutos. Los setters de rest y restSeconds
        // mantienen los dos campos sincronizados, venga el dato de un cliente
        // nuevo (segundos) o de uno viejo (minutos). Van en setters y no en
        // hooks porque instance.update() solo guarda los campos que cambiaron
        // al hacer set(), no los que se tocan despues en un hook.
        rest: {
            type: DataTypes.INTEGER,
            allowNull: false,
            set(valor) {
                if (valor === undefined) return;
                this.setDataValue('rest', valor);
                if (!definido(valor)) return;
                const segundos = this.getDataValue('restSeconds');
                // Si ya hay segundos que redondean a estos minutos, se respetan
                // (un cliente nuevo puede mandar los dos campos).
                if (!definido(segundos) || Math.round(Number(segundos) / 60) !== Number(valor)) {
                    this.setDataValue('restSeconds', Number(valor) * 60);
                }
            }
        },
        // Descanso en segundos: es el dato real desde que se pueden elegir
        // minutos y segundos.
        restSeconds: {
            type: DataTypes.INTEGER,
            allowNull: true,
            set(valor) {
                // Sin segundos (cliente viejo): se derivan de los minutos.
                if (!definido(valor)) {
                    const minutos = this.getDataValue('rest');
                    this.setDataValue('restSeconds', definido(minutos) ? Number(minutos) * 60 : null);
                    return;
                }
                this.setDataValue('restSeconds', valor);
                this.setDataValue('rest', Math.round(Number(valor) / 60));
            }
        },
        comments: {
            type: DataTypes.STRING,
            allowNull: false
        }
        
    });

    return Routine_Ejercice;
}   