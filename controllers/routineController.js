const { Routine, RoutineEjercice, Ejercice, User, sequelize } = require('../models');

module.exports = {
  async createRoutine(req, res) {
    const t = await sequelize.transaction();
    try {
      const { name, idOwner, idDesignated, idUser, order, time, exercises } = req.body;
      const ownerId = idOwner ?? idUser;

      if (!name || !ownerId) {
        await t.rollback();
        return res.status(400).json({ message: 'Los campos name e idOwner son obligatorios.' });
      }

      const routine = await Routine.create(
        { name, idOwner: ownerId, idDesignated, order, time },
        { transaction: t }
      );

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
      const { idOwner, idDesignated, idUser } = req.query;
      const where = {};

      if (idOwner !== undefined) where.idOwner = idOwner;
      if (idUser !== undefined) where.idOwner = idUser;
      if (idDesignated !== undefined) where.idDesignated = idDesignated;

      const routines = await Routine.findAll({
        where,
        include: [
          { model: RoutineEjercice, include: [Ejercice] },
          { model: User, as: 'owner', attributes: { exclude: ['password'] } },
          { model: User, as: 'designated', attributes: { exclude: ['password'] } },
        ],
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
        include: [
          { model: RoutineEjercice, include: [Ejercice] },
          { model: User, as: 'owner', attributes: { exclude: ['password'] } },
          { model: User, as: 'designated', attributes: { exclude: ['password'] } },
        ],
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
      const { name, idOwner, idDesignated, idUser, order, time, exercises } = req.body;
      const ownerId = idOwner ?? idUser;

      const routine = await Routine.findByPk(id);
      if (!routine) {
        await t.rollback();
        return res.status(404).json({ message: 'Rutina no encontrada.' });
      }

      const payload = {};
      if (name !== undefined) payload.name = name;
      if (ownerId !== undefined) payload.idOwner = ownerId;
      if (idDesignated !== undefined) payload.idDesignated = idDesignated;
      if (order !== undefined) payload.order = order;
      if (time !== undefined) payload.time = time;

      await routine.update(payload, { transaction: t });

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
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const routine = await Routine.findByPk(id, { transaction: t });
      if (!routine) {
        await t.rollback();
        return res.status(404).json({ message: 'Rutina no encontrada.' });
      }

      await RoutineEjercice.destroy({ where: { idRoutine: id }, transaction: t });
      await routine.destroy({ transaction: t });
      await t.commit();
      return res.status(200).json({ message: 'Rutina eliminada.' });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ message: 'Error al eliminar.' });
    }
  },
};
