const { Ejercice, RoutineEjercice, sequelize } = require('../models');

function getErrorStatus(error) {
  const sequelizeErrorNames = [
    'SequelizeValidationError',
    'SequelizeUniqueConstraintError',
    'SequelizeForeignKeyConstraintError',
  ];
  return sequelizeErrorNames.includes(error?.name) ? 400 : 500;
}

function getErrorMessage(error) {
  if (Array.isArray(error?.errors) && error.errors.length > 0) {
    return error.errors.map((e) => e.message).join(', ');
  }
  return 'Error interno.';
}

module.exports = {
  async createEjercice(req, res) {
    try {
    // 1. Extraemos los datos del body primero
    const data = req.body; 

    // 2. Verificamos si viene un array (inserción masiva)
    if (Array.isArray(data)) {
      // IMPORTANTE: Asegúrate de usar el nombre correcto del modelo (¿Ejercice o Ejercicio?)
      const nuevosEjercicios = await Ejercice.bulkCreate(data, { 
        validate: true 
      });

      return res.status(201).json({
        message: 'Ejercicios creados con éxito',
        count: nuevosEjercicios.length,
        data: nuevosEjercicios
      });
    }

    // 3. Si es un solo objeto
    const ejercice = await Ejercice.create(data);
    return res.status(201).json({ 
      message: 'Ejercicio creado.', 
      data: ejercice 
    });

    } catch (error) {
      console.error('Error createEjercice:', error);
      // Usamos tus funciones auxiliares de error
      return res.status(getErrorStatus(error)).json({ 
        message: getErrorMessage(error) 
      });
    }
  },

  async getEjercices(req, res) {
    try {
      const exercices = await Ejercice.findAll();
      return res.status(200).json({ data: exercices });
    } catch (error) {
      console.error('Error getEjercices:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getEjerciceById(req, res) {
    try {
      const { id } = req.params;
      const ejercice = await Ejercice.findByPk(id);

      if (!ejercice) {
        return res.status(404).json({ message: 'Ejercicio no encontrado.' });
      }

      return res.status(200).json({ data: ejercice });
    } catch (error) {
      console.error('Error getEjerciceById:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async updateEjercice(req, res) {
    try {
      const { id } = req.params;
      const ejercice = await Ejercice.findByPk(id);

      if (!ejercice) {
        return res.status(404).json({ message: 'Ejercicio no encontrado.' });
      }

      await ejercice.update(req.body);
      return res.status(200).json({ message: 'Ejercicio actualizado.', data: ejercice });
    } catch (error) {
      console.error('Error updateEjercice:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async deleteEjercice(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const ejercice = await Ejercice.findByPk(id, { transaction: t });

      if (!ejercice) {
        await t.rollback();
        return res.status(404).json({ message: 'Ejercicio no encontrado.' });
      }

      const deletedRoutineRelations = await RoutineEjercice.destroy({
        where: { idEjercice: id },
        transaction: t,
      });

      await ejercice.destroy({ transaction: t });

      await t.commit();
      return res.status(200).json({
        message: 'Ejercicio eliminado.',
        data: { deletedRoutineRelations },
      });
    } catch (error) {
      await t.rollback();
      console.error('Error deleteEjercice:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },
};
