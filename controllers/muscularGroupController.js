const { MuscleGroup } = require('../models');

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
  async createMuscularGroup(req, res) {
    try {
      const muscleGroup = await MuscleGroup.create(req.body);
      return res.status(201).json({ message: 'Grupo muscular creado.', data: muscleGroup });
    } catch (error) {
      console.error('Error createMuscularGroup:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getMuscularGroups(req, res) {
    try {
      const muscleGroups = await MuscleGroup.findAll();
      return res.status(200).json({ data: muscleGroups });
    } catch (error) {
      console.error('Error getMuscularGroups:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getMuscularGroupById(req, res) {
    try {
      const { id } = req.params;
      const muscleGroup = await MuscleGroup.findByPk(id);

      if (!muscleGroup) {
        return res.status(404).json({ message: 'Grupo muscular no encontrado.' });
      }

      return res.status(200).json({ data: muscleGroup });
    } catch (error) {
      console.error('Error getMuscularGroupById:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async updateMuscularGroup(req, res) {
    try {
      const { id } = req.params;
      const muscleGroup = await MuscleGroup.findByPk(id);

      if (!muscleGroup) {
        return res.status(404).json({ message: 'Grupo muscular no encontrado.' });
      }

      await muscleGroup.update(req.body);
      return res.status(200).json({ message: 'Grupo muscular actualizado.', data: muscleGroup });
    } catch (error) {
      console.error('Error updateMuscularGroup:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async deleteMuscularGroup(req, res) {
    try {
      const { id } = req.params;
      const muscleGroup = await MuscleGroup.findByPk(id);

      if (!muscleGroup) {
        return res.status(404).json({ message: 'Grupo muscular no encontrado.' });
      }

      await muscleGroup.destroy();
      return res.status(200).json({ message: 'Grupo muscular eliminado.' });
    } catch (error) {
      console.error('Error deleteMuscularGroup:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },
};
