const { Routine, RoutineEjercice, Ejercice, sequelize } = require('../models');

module.exports = {
  async createRoutine(req, res) {
    const t = await sequelize.transaction();
    try {
      const { name, idUser, order, time, exercises } = req.body;

      const routine = await Routine.create({ name, idUser, order, time }, { transaction: t });

      if (Array.isArray(exercises) && exercises.length > 0) {
        const routineExercises = exercises.map((ex) => ({
          ...ex,
          idRoutine: routine.id,
        }));
        await RoutineEjercice.bulkCreate(routineExercises, { transaction: t });
      }

      await t.commit();
      return res.status(201).json({ message: 'Rutina creada con ejercicios.', data: routine });
    } catch (error) {
      await t.rollback();
      console.error('Error createRoutine:', error);
      return res.status(500).json({ message: 'Error al crear la rutina.' });
    }
  },

  async getRoutines(req, res) {
    try {
      const routines = await Routine.findAll({
        include: [{ model: RoutineEjercice, include: [Ejercice] }],
      });
      return res.status(200).json({ data: routines });
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener rutinas.' });
    }
  },

  async getRoutineById(req, res) {
    try {
      const { id } = req.params;
      const routine = await Routine.findByPk(id, {
        include: [{ model: RoutineEjercice, include: [Ejercice] }],
      });
      if (!routine) return res.status(404).json({ message: 'Rutina no encontrada.' });
      return res.status(200).json({ data: routine });
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener la rutina.' });
    }
  },

  async updateRoutine(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { name, idUser, order, time, exercises } = req.body;

      const routine = await Routine.findByPk(id);
      if (!routine) {
        await t.rollback();
        return res.status(404).json({ message: 'Rutina no encontrada.' });
      }

      await routine.update({ name, idUser, order, time }, { transaction: t });

      if (Array.isArray(exercises)) {
        await RoutineEjercice.destroy({ where: { idRoutine: id }, transaction: t });

        if (exercises.length > 0) {
          const routineExercises = exercises.map((ex) => ({
            ...ex,
            idRoutine: id,
          }));
          await RoutineEjercice.bulkCreate(routineExercises, { transaction: t });
        }
      }

      await t.commit();
      return res.status(200).json({ message: 'Rutina actualizada.', data: routine });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ message: 'Error al actualizar la rutina.' });
    }
  },

  async deleteRoutine(req, res) {
    try {
      const { id } = req.params;
      await Routine.destroy({ where: { id } });
      return res.status(200).json({ message: 'Rutina eliminada.' });
    } catch (error) {
      return res.status(500).json({ message: 'Error al eliminar.' });
    }
  },
};
