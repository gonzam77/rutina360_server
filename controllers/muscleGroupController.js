const { MuscleGroup } = require('../models');
const { KIND_FUNCTIONAL, KIND_STRENGTH, normalizarKind } = require('../lib/funcional');

// ?kind=strength|functional filtra; sin filtro devuelve todo.
const filtroKind = (kind) =>
  kind === KIND_FUNCTIONAL || kind === KIND_STRENGTH ? { where: { kind } } : {};

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
  async createMuscleGroup(req, res) {
    try {
      const { name, kind } = req.body || {};
      const muscleGroup = await MuscleGroup.create({ name, kind: normalizarKind(kind) });
      return res.status(201).json({ message: 'Grupo muscular creado.', data: muscleGroup });
    } catch (error) {
      console.error('Error createMuscleGroup:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getMuscleGroups(req, res) {
    try {
      const muscleGroups = await MuscleGroup.findAll(filtroKind(req.query?.kind));
      return res.status(200).json({ data: muscleGroups });
    } catch (error) {
      console.error('Error getMuscleGroups:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getMuscleGroupById(req, res) {
    try {
      const { id } = req.params;
      const muscleGroup = await MuscleGroup.findByPk(id);

      if (!muscleGroup) {
        return res.status(404).json({ message: 'Grupo muscular no encontrado.' });
      }

      return res.status(200).json({ data: muscleGroup });
    } catch (error) {
      console.error('Error getMuscleGroupById:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async updateMuscleGroup(req, res) {
    try {
      const { id } = req.params;
      const muscleGroup = await MuscleGroup.findByPk(id);

      if (!muscleGroup) {
        return res.status(404).json({ message: 'Grupo muscular no encontrado.' });
      }

      const { name, kind } = req.body || {};
      await muscleGroup.update({ name, ...(kind !== undefined ? { kind: normalizarKind(kind) } : {}) });
      return res.status(200).json({ message: 'Grupo muscular actualizado.', data: muscleGroup });
    } catch (error) {
      console.error('Error updateMuscleGroup:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async deleteMuscleGroup(req, res) {
    try {
      const { id } = req.params;
      const muscleGroup = await MuscleGroup.findByPk(id);

      if (!muscleGroup) {
        return res.status(404).json({ message: 'Grupo muscular no encontrado.' });
      }

      await muscleGroup.destroy();
      return res.status(200).json({ message: 'Grupo muscular eliminado.' });
    } catch (error) {
      console.error('Error deleteMuscleGroup:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },
};
